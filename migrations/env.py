import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# 1. Configuração de Path (Garante que o Alembic encontre o arquivo models.py)
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models import Base

# 2. Carregamento manual do arquivo .env (Evita expor credenciais no GitHub)
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                key, value = line.strip().split("=", 1)
                os.environ[key] = value

# 3. Inicialização e Configuração do Objeto Config do Alembic
config = context.config

db_url = os.environ.get("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# Configuração dos Loggers nativos do Python
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Vinculação dos Modelos do SQLAlchemy para o recurso '--autogenerate'
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa as migrações no modo 'offline' (Gera scripts SQL sem conectar)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa as migrações no modo 'online' (Conecta diretamente ao Neon)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


# Controle de execução do Alembic
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()