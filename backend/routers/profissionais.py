from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

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
    return db.query(models.Profissional).filter(models.Profissional.ativo == True).order_by(models.Profissional.nome_completo).all()

@router.put("/{profissional_id}", response_model=schemas.ProfissionalResponse)
def atualizar_profissional(profissional_id: UUID, profissional: schemas.ProfissionalUpdate, db: Session = Depends(get_db)):
    db_prof = db.query(models.Profissional).filter(models.Profissional.id == profissional_id).first()
    if not db_prof:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    update_data = profissional.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_prof, key, value)
        
    db.commit()
    db.refresh(db_prof)
    return db_prof

@router.delete("/{profissional_id}", status_code=204)
def excluir_profissional(profissional_id: UUID, db: Session = Depends(get_db)):
    db_prof = db.query(models.Profissional).filter(models.Profissional.id == profissional_id).first()
    if not db_prof:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    total = db.query(models.Agendamento).filter(
        models.Agendamento.profissional_id == profissional_id
    ).count()
    
    if total > 0:
        db_prof.ativo = False
        db.commit()
    else:
        db.delete(db_prof)
        db.commit()
        
    return None
