from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/products/{country_code}", tags=["Products"])

@router.get("/productCards", response_model=list[schemas.ProductCardResponse])
async def get_product_cards(country_code: str, db: Session = Depends(get_db)):
    return await service.get_product_cards(country_code, db)