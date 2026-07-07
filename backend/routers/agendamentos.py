from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import date
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

    # 1. Validação de Segurança: MESMO profissional em OUTRA sala
    prof_ocupado = db.query(models.Agendamento).filter(
        models.Agendamento.profissional_id == agendamento.profissional_id,
        models.Agendamento.data == agendamento.data,
        models.Agendamento.sala_id != agendamento.sala_id,
        models.Agendamento.hora_inicio < agendamento.hora_fim,
        models.Agendamento.hora_fim > agendamento.hora_inicio
    ).first()
    
    if prof_ocupado:
        raise HTTPException(
            status_code=400, 
            detail="Conflito: Este profissional já está alocado em outra sala neste mesmo horário."
        )

    # 2. Validação de Lotação / Capacidade da Sala
    agendamentos_na_sala = db.query(models.Agendamento).filter(
        models.Agendamento.sala_id == agendamento.sala_id,
        models.Agendamento.data == agendamento.data,
        models.Agendamento.profissional_id != agendamento.profissional_id,
        models.Agendamento.hora_inicio < agendamento.hora_fim,
        models.Agendamento.hora_fim > agendamento.hora_inicio
    ).count()

    if agendamentos_na_sala >= sala.capacidade_profissionais:
        raise HTTPException(
            status_code=400, 
            detail=f"Capacidade máxima da sala atingida neste horário ({sala.capacidade_profissionais} vagas)."
        )

    # 3. Merge de Agendamentos do MESMO profissional (adjacentes ou sobrepostos na mesma sala)
    existente = db.query(models.Agendamento).filter(
        models.Agendamento.sala_id == agendamento.sala_id,
        models.Agendamento.data == agendamento.data,
        models.Agendamento.profissional_id == agendamento.profissional_id,
        models.Agendamento.hora_inicio <= agendamento.hora_fim,
        models.Agendamento.hora_fim >= agendamento.hora_inicio
    ).first()
    
    if existente:
        existente.hora_inicio = min(existente.hora_inicio, agendamento.hora_inicio)
        existente.hora_fim = max(existente.hora_fim, agendamento.hora_fim)
        db.commit()
        db.refresh(existente)
        return existente
        
    # 3. Se não houver nada para mesclar, cria um novo bloco
    db_agendamento = models.Agendamento(**agendamento.model_dump())
    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)
    return db_agendamento

@router.get("/", response_model=List[schemas.AgendamentoListResponse])
def listar_agendamentos(db: Session = Depends(get_db)):
    # Retorna do mais recente para o mais antigo, e ordenado por horário
    return db.query(models.Agendamento).order_by(desc(models.Agendamento.data), desc(models.Agendamento.hora_inicio)).all()

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
