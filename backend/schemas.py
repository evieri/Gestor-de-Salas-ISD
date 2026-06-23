from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import date
from uuid import UUID

# ==========================================
# 1. SCHEMAS DE SALA
# ==========================================
class SalaBase(BaseModel):
    nome: str = Field(..., min_length=3, description="Ex: Consultório 102")
    capacidade_profissionais: int = Field(..., gt=0, description="1 para individual, >1 para ginásio")
    setor_id: Optional[UUID] = None
    especialidade_exclusiva_id: Optional[UUID] = None

class SalaCreate(SalaBase):
    pass

class SalaResponse(SalaBase):
    id: UUID
    ativo: bool

    class Config:
        from_attributes = True

# ==========================================
# 2. SCHEMAS DA GRADE FIXA (O Padrão)
# ==========================================
class GradeFixaBase(BaseModel):
    profissional_id: UUID
    sala_id: UUID
    dia_semana: int = Field(..., ge=1, le=5, description="1=Segunda, 5=Sexta")
    hora_inicio: int = Field(..., ge=8, le=16, description="Início do expediente: 8h")
    hora_fim: int = Field(..., ge=9, le=17, description="Fim do expediente: 17h")

    @model_validator(mode='after')
    def validar_regras_de_horario(self) -> 'GradeFixaBase':
        # 1. A hora de início não pode ser maior ou igual à de fim
        if self.hora_inicio >= self.hora_fim:
            raise ValueError('A hora de início deve ser estritamente menor que a hora de fim.')
        
        # 2. Bloqueio matemático do horário de almoço (12h às 13h)
        if self.hora_inicio == 12 or (self.hora_inicio < 12 and self.hora_fim > 12):
            raise ValueError('Não é permitido alocar profissionais no horário de almoço (12h-13h).')
        
        return self

class GradeFixaCreate(GradeFixaBase):
    pass

class GradeFixaResponse(GradeFixaBase):
    id: UUID

    class Config:
        from_attributes = True

# ==========================================
# 3. SCHEMAS DE EXCEÇÕES DIÁRIAS (Faltas)
# ==========================================
class ExcecaoDiariaBase(BaseModel):
    grade_fixa_id: UUID
    data_excecao: date
    hora_inicio_ausencia: int = Field(..., ge=8, le=16)
    hora_fim_ausencia: int = Field(..., ge=9, le=17)

    @model_validator(mode='after')
    def validar_horario_excecao(self) -> 'ExcecaoDiariaBase':
        if self.hora_inicio_ausencia >= self.hora_fim_ausencia:
            raise ValueError('Horário de ausência inválido.')
        return self

class ExcecaoDiariaCreate(ExcecaoDiariaBase):
    pass

class ExcecaoDiariaResponse(ExcecaoDiariaBase):
    id: UUID

    class Config:
        from_attributes = True

# ==========================================
# 4. SCHEMAS DE PROFISSIONAL
# ==========================================
class ProfissionalBase(BaseModel):
    nome_completo: str = Field(..., min_length=3)
    especialidade: str = Field(..., min_length=3)
    registro_conselho: str = Field(..., min_length=3)

class ProfissionalCreate(ProfissionalBase):
    pass

class ProfissionalResponse(ProfissionalBase):
    id: UUID
    ativo: bool

    class Config:
        from_attributes = True