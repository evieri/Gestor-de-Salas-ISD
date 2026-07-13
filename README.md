# Gestor de Salas ISD

**Gestor de Salas ISD** é uma plataforma centralizada de agendamento e gerenciamento de espaços físicos e infraestrutura, focada em instituições de saúde e clínicas médicas, garantindo a otimização de recursos e integridade de horários.

## Contexto e Problema Resolvido

O projeto nasce para mitigar dois problemas críticos e onerosos no ecossistema de saúde e atendimento: o *double-booking* (agendamento duplo de espaços) e a ociosidade de salas especializadas. A falta de gestão eficiente dos espaços físicos resulta em graves conflitos de horários entre profissionais, atrasos no atendimento e subutilização da infraestrutura de alto custo, gerando tanto prejuízos operacionais quanto a redução da qualidade do serviço prestado aos pacientes. 

Esta solução atua no controle inteligente de grades fixas, exceções de calendário e reservas avulsas, permitindo o provisionamento de recursos de forma transparente, segura e sem atritos operacionais.

## Arquitetura e Solução Técnica

O sistema foi concebido utilizando uma arquitetura cliente-servidor (Client-Server Architecture) moderna, priorizando a separação de responsabilidades (SoC) e garantindo escalabilidade.

- **Backend (API RESTful):** Desenvolvido em **Python** utilizando o framework **FastAPI**, que provê alta performance, documentação automatizada (OpenAPI/Swagger) e suporte robusto a requisições assíncronas. O mapeamento objeto-relacional é orquestrado pelo **SQLAlchemy**, blindando o sistema contra injeções de SQL e abstraindo lógicas complexas de query. As migrações estruturais do banco de dados são controladas via **Alembic**.
- **Gerenciamento de Estado e Integridade de Dados:** O isolamento das transações no banco de dados relacional e a modelagem estruturada de domínio (entidades como `GradeFixa`, `ReservaAvulsa` e `Agendamento`) asseguram que conflitos temporais e violações de capacidade das salas sejam bloqueados no nível de serviço (Service Layer). UUIDs são adotados como chaves primárias em todo o schema para evitar enumerações indesejadas e preparar o sistema para escalabilidade horizontal e integrações B2B seguras.
- **Frontend (SPA):** Construído sobre **React** via **Vite**, garantindo uma Single Page Application leve e de rápido carregamento. O controle de estado do lado do cliente é feito utilizando **Zustand**, dispensando *boilerplates* complexos e fornecendo fluidez ao usuário, enquanto a comunicação HTTP é intermediada pelo **Axios**. A interface foi desenvolvida adotando um *design system* atômico amparado pelo utilitário **TailwindCSS**, viabilizando alta flexibilidade, consistência visual e um *layout* focado em UI/UX.
- **Persistência de Dados:** Toda a camada de dados é servida pelo **PostgreSQL**, escolhido por sua robustez e confiabilidade na garantia de propriedades ACID (Atomicidade, Consistência, Isolamento, Durabilidade), essenciais para ambientes com concorrência rigorosa no agendamento.

## Stack Tecnológica

### Backend
- ![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python&logoColor=white)
- ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
- ![Alembic](https://img.shields.io/badge/Alembic-Migration-green?style=for-the-badge)
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Frontend
- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
- ![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange?style=for-the-badge)

## Declaração de Autoria

> Este projeto foi idealizado, arquitetado e desenvolvido integralmente por mim como solução tecnológica independente.
