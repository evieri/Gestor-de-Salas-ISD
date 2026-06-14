from fastapi import FastAPI
from routers import salas, grade

app = FastAPI(
    title="API de Alocação de Espaços",
    description="Motor white-label para gestão de grade fixa e exceções",
    version="1.0.0"
)

app.include_router(salas.router)
app.include_router(grade.router)