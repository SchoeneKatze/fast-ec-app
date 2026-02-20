import datetime
from sqlalchemy import and_, select
from sqlalchemy.orm import Session
from . import schemas
from .models import CartItems
from backend.app.modules.users.service import getMe


def get_cart_items(db: Session):
    return db.execute(select(CartItems)).scalars().all()

def add_to_cart(item: schemas.CartItemSchema, logto_id: str, db: Session):
    user = getMe(logto_id, db)
    
    # 1. 先查询数据库中是否已存在该用户的同款商品
    existing_item = db.execute(
        select(CartItems).where(
            and_(
                CartItems.user_id == user.id,
                CartItems.product_id == item.product_id,
            )
        )
    ).scalar_one_or_none()

    if existing_item:
        # 2. 如果存在，直接累加数量并更新时间
        existing_item.quantity += item.productAmount
        existing_item.updated_at = datetime.datetime.now()
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # 3. 如果不存在，创建新记录
        new_cart_item = CartItems(
            user_id=user.logto_id,
            product_id=item.product_id,
            quantity=item.productAmount,
            updated_at=datetime.datetime.now(),
        )
        try:
            db.add(new_cart_item)
            db.commit()
            db.refresh(new_cart_item)
            return new_cart_item
        except Exception as e:
            db.rollback()
            raise e
