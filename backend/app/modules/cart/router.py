from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/list")
def get_cart_items(user_id: str, country_code: str, db: Session = Depends(get_db)):
    return service.get_cart_items(user_id, country_code, db)

@router.post("/add", response_model=schemas.CartItemSchema)
def add_to_cart(item: schemas.CartItemSchema, db: Session = Depends(get_db)):
    return service.add_to_cart(item, db)

@router.post("/update", response_model=schemas.CartItemSchema)
def update_cart_item(item: schemas.CartItemSchema, db: Session = Depends(get_db)):
    return service.update_cart_item(item, db)

@router.post("/remove")
def remove_from_cart(item: schemas.CartItemBase, db: Session = Depends(get_db)):
    service.remove_from_cart(item, db)
    return {"detail": "Item removed from cart"}