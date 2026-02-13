from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    # mysql+pymysql://username:password@address:port/dbname
    # DATABASE_URL: str = "mysql+pymysql://fast-ec-admin:a12345@localhost:3306/fastec"
    DATABASE_URL: str = "mysql+pymysql://fast-ec-admin:a12345@192.168.80.1:3306/fastec"

    # project metadata
    PROJECT_NAME: str = "Fast EC App"
    API_V1_STR: str = "/api/v1"

    # load .env
    model_config = ConfigDict(env_file=".env")

settings = Settings()