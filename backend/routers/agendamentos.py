from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.dependencies import get_db
import backend.models as models
import backend.schemas as schemas

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.post("/", response_model=schemas.AgendamentoResponse)
def criar_agendamento(agendamento: schemas.AgendamentoCreate, db: Session = Depends(get_db)):
    # 1. Verificação de Double-booking com OUTROS profissionais
    conflito = db.query(models.Agendamento).filter(
        models.Agendamento.sala_id == agendamento.sala_id,
        models.Agendamento.data == agendamento.data,
        models.Agendamento.profissional_id != agendamento.profissional_id,
        models.Agendamento.hora_inicio < agendamento.hora_fim,
        models.Agendamento.hora_fim > agendamento.hora_inicio
    ).first()
    
    if conflito:
        raise HTTPException(
            status_code=400, 
            detail="Conflito de agenda: Sala já ocupada por outro profissional neste horário."
        )

    # 2. Merge de Agendamentos do MESMO profissional (adjacentes ou sobrepostos)
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

@router.get("/", response_model=List[schemas.AgendamentoResponse])
def listar_agendamentos(db: Session = Depends(get_db)):
    return db.query(models.Agendamento).all()
