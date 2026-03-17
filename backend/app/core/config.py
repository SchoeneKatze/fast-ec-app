from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    DB_BASE_URL: str = os.getenv("DB_BASE_URL")
    DB_PORT: str = int(os.getenv("DB_PORT"))
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_NAME: str = os.getenv("DB_NAME")
    # mysql+pymysql://username:password@address:port/dbname
    # DATABASE_URL: str = "mysql+pymysql://fast-ec-admin:a12345@localhost:3306/fastec"
    DATABASE_URL: str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_BASE_URL}:{DB_PORT}/{DB_NAME}"

    # project metadata
    PROJECT_NAME: str = "Fast EC App"
    API_V1_STR: str = "/api/v1"

    # load .env
    model_config = ConfigDict(env_file=".env")

settings = Settings()