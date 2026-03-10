from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from . import schemas, service

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("/", response_model=list[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contacts = service.get_contacts(db, skip=skip, limit=limit)
    return contacts

@router.get("/{contact_id}", response_model=schemas.Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = service.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.get("/order/{order_id}", response_model=list[schemas.Contact])
def read_contacts_by_order(order_id: int, db: Session = Depends(get_db)):
    contacts = service.get_contacts_by_order(db, order_id=order_id)
    return contacts

@router.post("/", response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    return service.create_contact(db, contact)

@router.put("/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, contact_update: schemas.ContactUpdate, db: Session = Depends(get_db)):
    db_contact = service.update_contact(db, contact_id=contact_id, contact_update=contact_update)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact