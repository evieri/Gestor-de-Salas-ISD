from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from dependencies import get_db
import models
import schemas

router = APIRouter(prefix="/grade-fixa", tags=["Grade Fixa"])

@router.post("/", response_model=schemas.GradeFixaResponse)
def criar_alocacao_fixa(grade: schemas.GradeFixaCreate, db: Session = Depends(get_db)):
    db_grade = models.GradeFixa(**grade.model_dump())
    db.add(db_grade)
    
    try:
        db.commit()
        db.refresh(db_grade)
        return db_grade
    except IntegrityError as e:
        db.rollback() # Aborta a transação para não travar a sessão
        
        # Inspeciona o erro para dar a resposta correta ao Front-end
        error_msg = str(e.orig)
        if "check_profissional_unico_horario" in error_msg:
            raise HTTPException(
                status_code=400, 
                detail="Conflito de Overbooking: Este profissional já está alocado em outra sala neste dia e horário."
            )
        elif "capacidade" in error_msg:
             raise HTTPException(
                status_code=400, 
                detail="A capacidade máxima da sala foi atingida."
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Erro de integridade relacional (verifique se a sala ou profissional existem)."
            )