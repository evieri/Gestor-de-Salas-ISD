from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from typing import Dict, Any

from backend.dependencies import get_db
import backend.models as models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/diario")
def obter_dashboard_diario(data_alvo: date, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # 1. Identificar o dia da semana (1 = Segunda, 5 = Sexta)
    # No Python (datetime), Segunda é 0. O banco espera 1 a 5.
    dia_semana_bd = data_alvo.weekday() + 1 
    
    if dia_semana_bd > 5:
        return {"mensagem": "Finais de semana não possuem expediente operacional."}

    # 2. Buscar infraestrutura e ocupação base
    salas = db.query(models.Sala).filter(models.Sala.ativo == True).all()
    grade_do_dia = db.query(models.GradeFixa).filter(models.GradeFixa.dia_semana == dia_semana_bd).all()
    excecoes_hoje = db.query(models.ExcecaoDiaria).filter(models.ExcecaoDiaria.data_excecao == data_alvo).all()
    reservas_hoje = db.query(models.ReservaAvulsa).filter(models.ReservaAvulsa.data_reserva == data_alvo).all()

    # 3. Estruturar a Matriz de Horários (8h às 16h, pulando 12h)
    horarios_operacionais = [8, 9, 10, 11, 13, 14, 15, 16]
    matriz_dashboard = {hora: [] for hora in horarios_operacionais}

    # 4. O Algoritmo de Preenchimento
    for hora in horarios_operacionais:
        for sala in salas:
            status_sala = {
                "sala_id": sala.id,
                "sala_nome": sala.nome,
                "status": "LIVRE",
                "profissional": None
            }

            # Verifica se há grade fixa para esta sala nesta hora
            alocacao_fixa = next((g for g in grade_do_dia if g.sala_id == sala.id and g.hora_inicio <= hora < g.hora_fim), None)
            
            if alocacao_fixa:
                # Se tem grade fixa, verifica se o profissional FULTOU (Exceção) nesta exata hora
                teve_falta = any(
                    ex.grade_fixa_id == alocacao_fixa.id and ex.hora_inicio_ausencia <= hora < ex.hora_fim_ausencia
                    for ex in excecoes_hoje
                )
                
                if not teve_falta:
                    status_sala["status"] = "OCUPADO"
                    status_sala["profissional"] = alocacao_fixa.profissional.nome_completo # Exige lazy='joined' ou relacionamento no model
            
            # Se a sala continuou livre (ou porque não tinha grade, ou porque teve falta), checa reservas avulsas
            if status_sala["status"] == "LIVRE":
                reserva_avulsa = next((r for r in reservas_hoje if r.sala_id == sala.id and r.hora_inicio <= hora < r.hora_fim), None)
                if reserva_avulsa:
                    status_sala["status"] = "OCUPADO_AVULSO"
                    status_sala["profissional"] = reserva_avulsa.profissional.nome_completo
            
            matriz_dashboard[hora].append(status_sala)

    return {
        "data": data_alvo,
        "dia_semana": dia_semana_bd,
        "grade": matriz_dashboard
    }