from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from typing import List
from datetime import date, timedelta
from uuid import UUID

from backend.dependencies import get_db
import backend.models as models
import backend.schemas as schemas

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.post("/", response_model=schemas.AgendamentoResponse)
def criar_agendamento(agendamento: schemas.AgendamentoCreate, db: Session = Depends(get_db)):
    sala = db.query(models.Sala).filter(models.Sala.id == agendamento.sala_id).first()
    if not sala:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    # 1. Loop de Datas para Recorrência
    datas_a_processar = [agendamento.data]
    
    if agendamento.recorrente:
        data_atual = agendamento.data + timedelta(days=7)
        fim_do_ano = date(agendamento.data.year, 12, 31)
        while data_atual <= fim_do_ano:
            datas_a_processar.append(data_atual)
            data_atual += timedelta(days=7)

    primeiro_db_agendamento = None

    try:
        for data_loop in datas_a_processar:
            # 2. Validação de Segurança: MESMO profissional em OUTRA sala
            prof_ocupado = db.query(models.Agendamento).filter(
                models.Agendamento.profissional_id == agendamento.profissional_id,
                models.Agendamento.data == data_loop,
                models.Agendamento.sala_id != agendamento.sala_id,
                models.Agendamento.hora_inicio < agendamento.hora_fim,
                models.Agendamento.hora_fim > agendamento.hora_inicio
            ).first()
            
            if prof_ocupado:
                db.rollback()
                raise HTTPException(
                    status_code=400, 
                    detail=f"Conflito na data {data_loop.strftime('%d/%m/%Y')}: Este profissional já está alocado em outra sala neste mesmo horário."
                )

            # 3. Validação de Lotação / Capacidade da Sala
            agendamentos_na_sala = db.query(models.Agendamento).filter(
                models.Agendamento.sala_id == agendamento.sala_id,
                models.Agendamento.data == data_loop,
                models.Agendamento.profissional_id != agendamento.profissional_id,
                models.Agendamento.hora_inicio < agendamento.hora_fim,
                models.Agendamento.hora_fim > agendamento.hora_inicio
            ).count()

            if agendamentos_na_sala >= sala.capacidade_profissionais:
                db.rollback()
                raise HTTPException(
                    status_code=400, 
                    detail=f"Capacidade máxima da sala atingida na data {data_loop.strftime('%d/%m/%Y')} ({sala.capacidade_profissionais} vagas)."
                )

            # 4. Merge de Agendamentos do MESMO profissional (adjacentes ou sobrepostos na mesma sala)
            existente = db.query(models.Agendamento).filter(
                models.Agendamento.sala_id == agendamento.sala_id,
                models.Agendamento.data == data_loop,
                models.Agendamento.profissional_id == agendamento.profissional_id,
                models.Agendamento.hora_inicio <= agendamento.hora_fim,
                models.Agendamento.hora_fim >= agendamento.hora_inicio
            ).first()
            
            if existente:
                existente.hora_inicio = min(existente.hora_inicio, agendamento.hora_inicio)
                existente.hora_fim = max(existente.hora_fim, agendamento.hora_fim)
                db.flush()
                if not primeiro_db_agendamento:
                    primeiro_db_agendamento = existente
            else:
                # 5. Se não houver nada para mesclar, cria um novo bloco
                novo_dict = agendamento.model_dump(exclude={'recorrente'})
                novo_dict['data'] = data_loop
                db_agendamento = models.Agendamento(**novo_dict)
                db.add(db_agendamento)
                db.flush()
                if not primeiro_db_agendamento:
                    primeiro_db_agendamento = db_agendamento
                    
        # Commit Final (Transação concluída com sucesso para todas as datas)
        db.commit()
        db.refresh(primeiro_db_agendamento)
        return primeiro_db_agendamento

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno ao processar a cadeia de reservas.")

@router.get("/", response_model=List[schemas.AgendamentoListResponse])
def listar_agendamentos(db: Session = Depends(get_db)):
    # Retorna do mais próximo de hoje para os mais distantes no futuro (crescente)
    return db.query(models.Agendamento).order_by(models.Agendamento.data.asc(), models.Agendamento.hora_inicio.asc()).all()

@router.delete("/{agendamento_id}", status_code=204)
def excluir_agendamento(agendamento_id: UUID, db: Session = Depends(get_db)):
    agendamento = db.query(models.Agendamento).filter(models.Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
    
    if agendamento.data < date.today():
        raise HTTPException(status_code=400, detail="Não é possível cancelar agendamentos do passado (Auditoria).")
    
    db.delete(agendamento)
    db.commit()
    return None
