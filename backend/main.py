from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import salas, grade, dashboard, profissionais
# from backend.routers import dashboard # Descomente no Passo 4.4

app = FastAPI(
    title="API de Alocação de Espaços",
    description="Motor white-label para gestão de grade fixa e exceções",
    version="1.0.0"
)

# Configuração estrita de CORS (Resolve o timeout do Modal)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção deve ser a URL do seu Front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(salas.router)
app.include_router(grade.router)
app.include_router(dashboard.router)
app.include_router(profissionais.router)