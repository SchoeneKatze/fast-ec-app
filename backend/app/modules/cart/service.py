import datetime
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.modules.products.models import Currency, Product, ProductImage, TaxSetting
from app.modules.products.service import COUNTRY_MAP, CURRENCY_CONFIG, CURRENCY_CONFIG
from . import schemas
from .models import CartItems
from app.modules.users.service import getMe
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal


def get_cart_items(user_id: str, country_code: str, db: Session):
    # 确定货币配置（和商品卡片逻辑完全一致）
    curr_code = COUNTRY_MAP.get(country_code, "USD")
    conf = CURRENCY_CONFIG.get(curr_code)
    
    # 舍入配置准备
    rounding_style = ROUND_DOWN if conf["rounding_mode"] == "DOWN" else ROUND_HALF_UP
    prec = Decimal("1") if conf["decimal_places"] == 0 else Decimal("0." + "0" * conf["decimal_places"])

    # 查询逻辑：CartItems 关联 Product 及其税率汇率
    stmt = (
        select(
            CartItems,
            Product,
            TaxSetting.tax_rate,
            Currency.exchange_rate,
            ProductImage.image_url
        )
        .join(Product, CartItems.product_id == Product.product_id)
        .outerjoin(TaxSetting, and_(
            Product.tax_class == TaxSetting.tax_class,
            TaxSetting.country_code == country_code
        ))
        .outerjoin(Currency, Currency.currency_code == curr_code)
        .outerjoin(ProductImage, and_(Product.product_id == ProductImage.product_id, ProductImage.sort_order == 0))
        .where(CartItems.user_id == user_id)
    )

    rows = db.execute(stmt)
    cart_list = []
    total_final_price = Decimal("0.0")

    for row in rows:
        p = row.Product
        c_item = row.CartItems
        local_base_price = p.base_price if p.currency_code == curr_code else p.base_price * Decimal(str(row.exchange_rate or "1.0"))
        
        raw_final = local_base_price * p.discount_factor * (Decimal("1.0") + (row.tax_rate or Decimal("0")))
        
        final_price_decimal = raw_final.quantize(prec, rounding=rounding_style)
        final_price_float = float(final_price_decimal)

        cart_list.append({
            "id": c_item.id,
            "product_id": p.product_id,
            "quantity": c_item.quantity,
            "title": p.title,        
            "final_price": final_price_float, 
            "symbol": conf["symbol"],      
            "image_url": row.image_url 
        })

        total_final_price += final_price_decimal * c_item.quantity

    return {
        "cart_list": cart_list, 
        "total_final_price": float(total_final_price.quantize(prec, rounding=rounding_style))
    }

def add_to_cart(item: schemas.CartItemSchema, db: Session):

    # 1. 先查询数据库中是否已存在该用户的同款商品
    existing_item = db.execute(
        select(CartItems).where(
            and_(
                CartItems.user_id == item.user_id,
                CartItems.product_id == item.product_id,
            )
        )
    ).scalar_one_or_none()

    if existing_item:
        # 2. 如果存在，直接累加数量并更新时间
        existing_item.quantity += item.quantity
        existing_item.updated_at = datetime.datetime.now()
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # 3. 如果不存在，创建新记录
        new_cart_item = CartItems(
            user_id=item.user_id,
            product_id=item.product_id,
            quantity=item.quantity,
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

def update_cart_item(item: schemas.CartItemUpdate, db: Session):
    existing_item = db.execute(
        select(CartItems).where(
            and_(
                CartItems.user_id == item.user_id,
                CartItems.product_id == item.product_id,
            )
        )
    ).scalar_one_or_none()

    if not existing_item:
        raise Exception("Cart item not found")

    existing_item.quantity = item.quantity
    existing_item.updated_at = datetime.datetime.now()
    db.commit()
    db.refresh(existing_item)
    return existing_item

def remove_from_cart(item: schemas.CartItemUpdate, db: Session):
    user = getMe(item.user_id, db)
    existing_item = db.execute(
        select(CartItems).where(
            and_(
                CartItems.user_id == item.user_id,
                CartItems.product_id == item.product_id,
            )
        )
    ).scalar_one_or_none()

    if not existing_item:
        raise Exception("Cart item not found")

    db.delete(existing_item)
    db.commit()
