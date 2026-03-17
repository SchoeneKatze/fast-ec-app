from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("/getAddresses")
def getAddresses(logto_id: str, db: Session = Depends(get_db)):
    print(f"get addresses for logto_id: {logto_id}")
    return service.get_addresses(logto_id, db)

@router.post("/addAddress")
def addAddress(address_data: schemas.ShippingAddressUpdate, db: Session = Depends(get_db)):
    print(f"add address: {address_data.tag}")
    return service.add_address(address_data, db)

@router.post("/updateAddress")
def updateAddress(address_data: schemas.ShippingAddressUpdate, db: Session = Depends(get_db)):
    print(f"update address: {address_data.tag}")
    return service.update_address(address_data, db)

@router.post("/setDefaultAddress")
def setDefaultAddress(address_data: schemas.defaultAddressSet, db: Session = Depends(get_db)):
    print(f"set as default address : {address_data.tag}")
    return service.set_default_address(address_data, db)

@router.post("/deleteAddress")
def deleteAddress(address_data: schemas.ShippingAddressUpdate, db: Session = Depends(get_db)):
    print(f"delete address: {address_data.tag}")
    return service.delete_address(address_data, db)