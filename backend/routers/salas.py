from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date

from backend.dependencies import get_db
import backend.models as models
import backend.schemas as schemas

router = APIRouter(prefix="/salas", tags=["Salas"])

@router.post("/", response_model=schemas.SalaResponse)
def criar_sala(sala: schemas.SalaCreate, db: Session = Depends(get_db)):
    # Opcional: Verificar se já existe uma sala com o mesmo nome para evitar duplicidade
    sala_existente = db.query(models.Sala).filter(models.Sala.nome == sala.nome).first()
    if sala_existente:
        raise HTTPException(status_code=400, detail="Já existe uma sala cadastrada com este nome.")
        
    db_sala = models.Sala(**sala.model_dump())
    db.add(db_sala)
    db.commit()
    db.refresh(db_sala)
    return db_sala

@router.get("/", response_model=List[schemas.SalaResponse])
def listar_salas(db: Session = Depends(get_db)):
    return db.query(models.Sala).filter(models.Sala.ativo == True).order_by(models.Sala.nome).all()

@router.delete("/{sala_id}", status_code=204)
def excluir_sala(sala_id: UUID, db: Session = Depends(get_db)):
    db_sala = db.query(models.Sala).filter(models.Sala.id == sala_id).first()
    if not db_sala:
        raise HTTPException(status_code=404, detail="Sala não encontrada")
    
    hoje = date.today()
    
    # 1. Agendamentos futuros (bloqueia exclusão)
    futuros = db.query(models.Agendamento).filter(
        models.Agendamento.sala_id == sala_id,
        models.Agendamento.data >= hoje
    ).count()
    
    if futuros > 0:
        raise HTTPException(status_code=400, detail="A sala não pode ser inativada pois possui agendamentos operacionais para hoje ou dias futuros.")
        
    # 2. Agendamentos passados (aplica soft delete)
    passados = db.query(models.Agendamento).filter(
        models.Agendamento.sala_id == sala_id,
        models.Agendamento.data < hoje
    ).count()
    
    if passados > 0:
        db_sala.ativo = False
        db.commit()
    else:
        # 3. Lixo sem uso (aplica hard delete)
        db.delete(db_sala)
        db.commit()
        
    return None