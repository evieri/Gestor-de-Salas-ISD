from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db
import models
import schemas

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
    return db.query(models.Sala).filter(models.Sala.ativo == True).all()