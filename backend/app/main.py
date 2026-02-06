from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.users.router import router as user_router

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # allow all methods like POST, GET
    allow_headers=["*"], # allow all request headers
)

app.include_router(user_router)