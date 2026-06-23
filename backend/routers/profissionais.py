from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.dependencies import get_db
import backend.models as models
import backend.schemas as schemas

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])

@router.post("/", response_model=schemas.ProfissionalResponse)
def criar_profissional(profissional: schemas.ProfissionalCreate, db: Session = Depends(get_db)):
    prof_existente = db.query(models.Profissional).filter(models.Profissional.registro_conselho == profissional.registro_conselho).first()
    if prof_existente:
        raise HTTPException(status_code=400, detail="Registro já cadastrado")
        
    db_prof = models.Profissional(**profissional.model_dump())
    db.add(db_prof)
    db.commit()
    db.refresh(db_prof)
    return db_prof

@router.get("/", response_model=List[schemas.ProfissionalResponse])
def listar_profissionais(db: Session = Depends(get_db)):
    return db.query(models.Profissional).filter(models.Profissional.ativo == True).all()
