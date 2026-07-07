from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date
from typing import Dict, Any
from datetime import datetime

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

    # 2. Buscar infraestrutura e ocupação base (Inclui salas inativas que tiveram uso no dia)
    salas_com_agendamento_subq = db.query(models.Agendamento.sala_id).filter(models.Agendamento.data == data_alvo).subquery()
    
    salas = db.query(models.Sala).filter(
        or_(
            models.Sala.ativo == True,
            models.Sala.id.in_(salas_com_agendamento_subq)
        )
    ).all()
    grade_do_dia = db.query(models.GradeFixa).filter(models.GradeFixa.dia_semana == dia_semana_bd).all()
    excecoes_hoje = db.query(models.ExcecaoDiaria).filter(models.ExcecaoDiaria.data_excecao == data_alvo).all()
    reservas_hoje = db.query(models.ReservaAvulsa).filter(models.ReservaAvulsa.data_reserva == data_alvo).all()
    agendamentos_hoje = db.query(models.Agendamento).filter(models.Agendamento.data == data_alvo).all()

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
                "profissionais": [],
                "ocupacao_atual": 0,
                "capacidade_maxima": sala.capacidade_profissionais
            }

            # Acumula profissionais alocados na Grade Fixa
            alocacoes_fixas = [g for g in grade_do_dia if g.sala_id == sala.id and g.hora_inicio <= hora < g.hora_fim]
            for alocacao in alocacoes_fixas:
                teve_falta = any(
                    ex.grade_fixa_id == alocacao.id and ex.hora_inicio_ausencia <= hora < ex.hora_fim_ausencia
                    for ex in excecoes_hoje
                )
                if not teve_falta:
                    status_sala["profissionais"].append(alocacao.profissional.nome_completo)
            
            # Acumula profissionais de Reservas Avulsas
            reservas = [r for r in reservas_hoje if r.sala_id == sala.id and r.hora_inicio <= hora < r.hora_fim]
            for r in reservas:
                status_sala["profissionais"].append(r.profissional.nome_completo)
            
            # Acumula profissionais do Motor de Reservas (Agendamento)
            agendamentos = [a for a in agendamentos_hoje if a.sala_id == sala.id and a.hora_inicio <= hora < a.hora_fim]
            for a in agendamentos:
                status_sala["profissionais"].append(a.profissional.nome_completo)
            
            # Remove duplicatas caso ocorram falhas de sincronia
            status_sala["profissionais"] = list(set(status_sala["profissionais"]))
            status_sala["ocupacao_atual"] = len(status_sala["profissionais"])
            
            # Determina o Status Visual
            if status_sala["ocupacao_atual"] >= status_sala["capacidade_maxima"]:
                status_sala["status"] = "LOTADO"
            elif status_sala["ocupacao_atual"] > 0:
                status_sala["status"] = "PARCIAL"
            
            matriz_dashboard[hora].append(status_sala)

    return {
        "data": data_alvo,
        "dia_semana": dia_semana_bd,
        "grade": matriz_dashboard
    }

@router.get("/metricas")
def obter_metricas(data_alvo: date, db: Session = Depends(get_db)):
    total_salas = db.query(models.Sala).filter(models.Sala.ativo == True).count()
    
    # salas livres agora
    hora_atual = datetime.now().hour
    # Conta salas que TÊM agendamento rodando na hora exata
    salas_ocupadas_agora = db.query(models.Agendamento).filter(
        models.Agendamento.data == data_alvo,
        models.Agendamento.hora_inicio <= hora_atual,
        models.Agendamento.hora_fim > hora_atual
    ).count()
    
    salas_livres_agora = total_salas - salas_ocupadas_agora
    if salas_livres_agora < 0:
        salas_livres_agora = 0
        
    # ocupacao percentual do dia
    agendamentos = db.query(models.Agendamento).filter(models.Agendamento.data == data_alvo).all()
    slots_ocupados = sum(a.hora_fim - a.hora_inicio for a in agendamentos)
    
    total_slots_possiveis = total_salas * 8
    if total_slots_possiveis > 0:
        ocupacao = round((slots_ocupados / total_slots_possiveis) * 100, 1)
    else:
        ocupacao = 0.0
        
    return {
        "total_salas": total_salas,
        "salas_livres_agora": salas_livres_agora,
        "ocupacao_percentual": ocupacao,
        "agendamentos_hoje": len(agendamentos)
    }