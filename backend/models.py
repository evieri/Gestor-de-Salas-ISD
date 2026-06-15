import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

class Unidade(Base):
    __tablename__ = 'unidades'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, unique=True, nullable=False)
    ativo = Column(Boolean, default=True)

class Setor(Base):
    __tablename__ = 'setores'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unidade_id = Column(UUID(as_uuid=True), ForeignKey('unidades.id'), nullable=False)
    nome = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)

class Especialidade(Base):
    __tablename__ = 'especialidades'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, unique=True, nullable=False)

class Profissional(Base):
    __tablename__ = 'profissionais'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome_completo = Column(String, nullable=False)
    registro_conselho = Column(String, nullable=True)
    especialidade_id = Column(UUID(as_uuid=True), ForeignKey('especialidades.id'), nullable=False)
    ativo = Column(Boolean, default=True)

class Sala(Base):
    __tablename__ = 'salas'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    setor_id = Column(UUID(as_uuid=True), ForeignKey('setores.id'), nullable=False)
    nome = Column(String, nullable=False)
    capacidade_profissionais = Column(Integer, nullable=False)
    especialidade_exclusiva_id = Column(UUID(as_uuid=True), ForeignKey('especialidades.id'), nullable=True)
    ativo = Column(Boolean, default=True)

class GradeFixa(Base):
    __tablename__ = 'grade_fixa'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profissional_id = Column(UUID(as_uuid=True), ForeignKey('profissionais.id'), nullable=False)
    sala_id = Column(UUID(as_uuid=True), ForeignKey('salas.id'), nullable=False)
    dia_semana = Column(Integer, nullable=False)
    hora_inicio = Column(Integer, nullable=False)
    hora_fim = Column(Integer, nullable=False)

class ExcecaoDiaria(Base):
    __tablename__ = 'excecoes_diarias'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grade_fixa_id = Column(UUID(as_uuid=True), ForeignKey('grade_fixa.id'), nullable=False)
    data_excecao = Column(Date, nullable=False)
    hora_inicio_ausencia = Column(Integer, nullable=False)
    hora_fim_ausencia = Column(Integer, nullable=False)

class ReservaAvulsa(Base):
    __tablename__ = 'reservas_avulsas'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profissional_id = Column(UUID(as_uuid=True), ForeignKey('profissionais.id'), nullable=False)
    sala_id = Column(UUID(as_uuid=True), ForeignKey('salas.id'), nullable=False)
    data_reserva = Column(Date, nullable=False)
    hora_inicio = Column(Integer, nullable=False)
    hora_fim = Column(Integer, nullable=False)