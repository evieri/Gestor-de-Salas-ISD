from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date, timedelta
import pandas as pd
import io

from backend.dependencies import get_db
# (Importe seus models e a mesma lógica de matriz do dashboard_diario aqui)

router = APIRouter(prefix="/exportar", tags=["Exportação"])

@router.get("/semana-atual")
def exportar_grade_semanal(data_base: date, db: Session = Depends(get_db)):
    # 1. Encontra a Segunda e a Sexta da semana solicitada
    segunda_feira = data_base - timedelta(days=data_base.weekday())
    
    dados_exportacao = []
    
    # 2. Executa a matemática do dashboard para os 5 dias operacionais
    for i in range(5):
        dia_atual = segunda_feira + timedelta(days=i)
        
        # [AQUI VOCÊ CHAMA A FUNÇÃO INTERNA DO DASHBOARD PARA OBTER A MATRIZ DO DIA_ATUAL]
        # (Para o exemplo, assumimos que `matriz_do_dia` contém a estrutura gerada na etapa 4.1)
        matriz_do_dia = obter_matriz_interna(dia_atual, db) 
        
        for hora, salas in matriz_do_dia.items():
            for sala in salas:
                dados_exportacao.append({
                    "Data": dia_atual.strftime("%d/%m/%Y"),
                    "Hora": f"{hora}:00",
                    "Sala": sala["sala_nome"],
                    "Status": sala["status"],
                    "Profissional": sala["profissional"] if sala["profissional"] else "-"
                })

    # 3. Transforma em DataFrame e injeta na memória (BytesIO)
    df = pd.DataFrame(dados_exportacao)
    stream = io.BytesIO()
    
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Grade Semanal")
    
    stream.seek(0)
    
    # 4. Devolve o arquivo para download no Front-end/Navegador
    nome_arquivo = f"Grade_{segunda_feira.strftime('%d-%m-%Y')}.xlsx"
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={nome_arquivo}"}
    )