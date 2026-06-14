from database import SessionLocal # Importe sua fábrica de sessões do SQLAlchemy

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()