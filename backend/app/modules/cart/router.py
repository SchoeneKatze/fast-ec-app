from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/cart/", tags=["Cart"])

@router.get("/list", response_model=list[schemas.CartItemSchema])
def get_cart_items(db: Session = Depends(get_db)):
    return service.get_cart_items(db)

@router.post("/add", response_model=schemas.CartItemSchema)
def add_to_cart(item: schemas.CartItemSchema, db: Session = Depends(get_db)):
    return service.add_to_cart(item, db)