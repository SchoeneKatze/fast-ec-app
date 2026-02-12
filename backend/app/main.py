from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.users.router import router as user_router
from dotenv import env
import os

app = FastAPI()
env()

origins = [
    os.getenv("DB_URL_LOCAL"),
    os.getenv("DB_URL"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # allow all methods like POST, GET
    allow_headers=["*"], # allow all request headers
)

app.include_router(user_router)