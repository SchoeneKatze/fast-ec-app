from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas
from app.modules.order import models as order_models # 订单相关的 model
from app.modules.products.models import Product

def create_order(db: Session, order: schemas.OrderCreate):
    # 简单的订单号生成逻辑 (实际生产建议用 Redis 或专用序列表防并发)
    today_str = datetime.utcnow().strftime("%Y%m%d")
    count_today = db.query(models.Order).filter(models.Order.order_no.startswith(today_str)).count()
    order_no = f"{today_str}{(count_today + 1):06d}"
    try:
        db_order = models.Order(
            order_no=order_no,
            user_id=order.user_id,
            currency=order.currency,
            total_price=order.total_price,
            status="PAID" # 模拟直接支付成功
        )
        db.add(db_order)
        db.flush() # 获取 order.id

        # 3. 处理商品快照和库存
        for item in order.items:
        # 锁定行进行库存检查 (防止并发超卖)
            product = db.query(Product).filter(
                Product.product_id == item.product_id
            ).with_for_update().first()

            if not product or product.stock_quantity < item.quantity:
                raise Exception(f"Product {item.product_name} out of stock!")

        # 扣库存
            product.stock_quantity -= item.quantity

        # 创建快照
            db_item = models.OrderItem(
                order_id=db_order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                image_url=item.image_url,
                quantity=item.quantity,
                unit_price=item.unit_price
            )
            db.add(db_item)

        db.commit() # 所有操作成功，统一提交
        return db_order
    except Exception as e:
        db.rollback() # 只要有一个商品没货，全部回滚
        raise e