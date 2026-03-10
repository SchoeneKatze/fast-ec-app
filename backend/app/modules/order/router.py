from fastapi import APIRouter, Depends, HTTPException
from requests import Session
from app.modules.order import schemas, service
from app.core.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/mock-pay")
def mock_payment_and_create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    new_order = service.create_order(db, order)
    # 此处模拟发送邮件逻辑 send_order_email(user.email, new_order.order_no)
    return {"status": "success", "order_no": new_order.order_no}

@router.post("/create")
async def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        # 调用 service 层处理复杂逻辑
        new_order = service.create_order(db, order_data)
        return {"status": "success", "order_no": new_order.order_no}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/order/{order_no}")
async def get_order_by_no(order_no: str, db: Session = Depends(get_db)):
    order = service.get_order_by_no(db, order_no)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order