import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Getting env vars directly or via config
DB_USER = os.getenv("POSTGRES_USER", "reelforge")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "reelforge_secret")
DB_HOST = "postgres"
DB_NAME = os.getenv("POSTGRES_DB", "reelforge")

async def init_db():
    # Connect to default 'postgres' db to create others
    root_url = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/postgres"
    engine = create_async_engine(root_url, isolation_level="AUTOCOMMIT")
    
    async with engine.connect() as conn:
        # Check reelforge db
        result = await conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'"))
        if not result.scalar():
            print(f"Creating database {DB_NAME}...")
            await conn.execute(text(f"CREATE DATABASE {DB_NAME}"))
        
        # Check prefect db
        result = await conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'prefect'"))
        if not result.scalar():
            print("Creating database prefect...")
            await conn.execute(text("CREATE DATABASE prefect"))
            
    await engine.dispose()
    print("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
