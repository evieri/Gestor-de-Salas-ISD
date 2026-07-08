from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, case
from typing import List
from datetime import date, timedelta, datetime, timezone
from uuid import UUID

# Configuração fixa para o Horário de Brasília (UTC-3)
FUSO_BR = timezone(timedelta(hours=-3))

def get_agora_br():
    return datetime.now(FUSO_BR)

from backend.dependencies import get_db
import backend.models as models
import backend.schemas as schemas

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.post("/", response_model=schemas.AgendamentoResponse)
def criar_agendamento(agendamento: schemas.AgendamentoCreate, db: Session = Depends(get_db)):
    # 0. Auditoria Cronológica (Proibir Passado)
    hoje = get_agora_br().date()
    agora_hora = get_agora_br().hour
    if agendamento.data < hoje:
        raise HTTPException(status_code=400, detail="Não é possível criar agendamentos no passado.")
    if agendamento.data == hoje and agendamento.hora_inicio <= agora_hora:
        raise HTTPException(status_code=400, detail="Este horário já iniciou ou passou. Escolha um horário futuro.")

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
    hoje = get_agora_br().date()
    
    # 0 = Futuro/Hoje (Crescente)
    # 1 = Passado (Decrescente)
    return db.query(models.Agendamento).order_by(
        case(
            (models.Agendamento.data >= hoje, 0), 
            else_=1
        ),
        case(
            (models.Agendamento.data >= hoje, models.Agendamento.data)
        ).asc(),
        case(
            (models.Agendamento.data < hoje, models.Agendamento.data)
        ).desc(),
        models.Agendamento.hora_inicio.asc()
    ).all()

@router.delete("/{agendamento_id}", status_code=204)
def excluir_agendamento(agendamento_id: UUID, db: Session = Depends(get_db)):
    agendamento = db.query(models.Agendamento).filter(models.Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    hoje = get_agora_br().date()
    agora_hora = get_agora_br().hour
    
    if agendamento.data < hoje:
        raise HTTPException(status_code=400, detail="Não é possível cancelar agendamentos do passado (Auditoria).")
    if agendamento.data == hoje and agendamento.hora_inicio <= agora_hora:
        raise HTTPException(status_code=400, detail="Não é possível cancelar agendamentos cujo horário já iniciou ou passou (Auditoria).")

    db.delete(agendamento)
    db.commit()
    return None
