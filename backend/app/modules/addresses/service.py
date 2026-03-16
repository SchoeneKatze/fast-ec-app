from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
import os

LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT")
LOGTO_APP_ID = os.getenv("LOGTO_APP_ID") 
LOGTO_APP_SECRET = os.getenv("APP_SECRET")

def get_addresses(logto_id: str, db: Session):
    addresses = db.query(models.ShippingAddress).filter(models.ShippingAddress.logto_id == logto_id).all()
    return addresses

def add_address(address_data: schemas.ShippingAddressUpdate, db: Session):
    new_address = models.ShippingAddress(
        logto_id=address_data.logto_id,
        tag=address_data.tag,
        recipient_name=address_data.recipient_name,
        phone=address_data.phone,
        country_code=address_data.country_code,
        zip_code=address_data.zip_code,
        state=address_data.state,
        city=address_data.city,
        address_line=address_data.address_line,
    )
    db.add(new_address)
    try:
        db.commit()
        db.refresh(new_address)
        return new_address
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def update_address(address_data: schemas.ShippingAddressUpdate, db: Session):
    address = db.query(models.ShippingAddress).filter(
        models.ShippingAddress.logto_id == address_data.logto_id,
        models.ShippingAddress.id == address_data.id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    address.tag = address_data.tag
    address.recipient_name = address_data.recipient_name
    address.phone = address_data.phone
    address.country_code = address_data.country_code
    address.zip_code = address_data.zip_code
    address.state = address_data.state
    address.city=address_data.city,
    address.address_line = address_data.address_line
    address.is_default = address_data.is_default
    
    try:
        db.commit()
        db.refresh(address)
        return address
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
def set_default_address(address_data: schemas.defaultAddressSet, db: Session):
    try:
        db.query(models.ShippingAddress).filter(
            models.ShippingAddress.logto_id == address_data.logto_id
        ).update({models.ShippingAddress.is_default: False})
        
        target = db.query(models.ShippingAddress).filter(
            models.ShippingAddress.id == address_data.id,
            models.ShippingAddress.logto_id == address_data.logto_id
        ).first()

        if not target:
            raise HTTPException(status_code=404, detail="Address not found")

        target.is_default = True
        
        db.commit()
        return {"message": "Default address updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
def delete_address(address_data: schemas.ShippingAddressUpdate, db: Session):
    address = db.query(models.ShippingAddress).filter(
        models.ShippingAddress.id == address_data.id,
        models.ShippingAddress.logto_id == address_data.logto_id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    try:
        db.delete(address)
        db.commit()
        return {"message": "Address deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))