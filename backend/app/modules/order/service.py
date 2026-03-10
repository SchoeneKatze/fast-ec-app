def get_order_by_no(db: Session, order_no: str):
    return db.query(models.Order).filter(models.Order.order_no == order_no).first()


def create_order(db: Session, order: schemas.OrderCreate):
    # 简单的订单号生成逻辑 (实际生产建议用 Redis 或专用序列表防并发)
    today_str = datetime.now().strftime("%Y%m%d")
    count_today = (
        db.query(models.Order)
        .filter(models.Order.order_no.startswith(today_str))
        .count()
    )
    order_no = f"{today_str}{(count_today + 1):06d}"
    product_ids_to_remove = [item.product_id for item in order.items]

    try:
        db_order = models.Order(
            order_no=order_no,
            user_id=order.user_id,
            currency=order.currency,
            total_price=order.total_price,
            status="PAID",  # 模拟直接支付成功
        )
        db.add(db_order)
        db.flush()  # 获取 order.id

        # 3. 处理商品快照和库存
        for item in order.items:
            # 锁定行进行库存检查 (防止并发超卖)
            product = (
                db.query(Product)
                .filter(Product.product_id == item.product_id)
                .with_for_update()
                .first()
            )

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
                unit_price=item.unit_price,
            )
            db.add(db_item)
            # 在同一个事务内清空购物车
        if product_ids_to_remove:
            db.query(Cart).filter(
                Cart.user_id == order.user_id,
                Cart.product_id.in_(product_ids_to_remove),
            ).delete(synchronize_session=False)

        db.commit()  # 所有操作成功，统一提交
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()  # 只要有一个商品没货，全部回滚
        raise e

def get_order_history(db: Session, user_id: str, year: int = None, month: int = None, start_date: str = None, end_date: str = None):
    # 1. 基础查询
    query = db.query(models.Order).filter(models.Order.user_id == user_id)
    
    # 2. 逻辑判断：优先处理日期区间筛选 (start_date, end_date)
    if start_date:
        # 将字符串 "2024-03-01" 转为 datetime 对象
        dt_start = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(models.Order.created_at >= dt_start)
    
    if end_date:
        # 结束日期通常要包含当天，所以加一天或设置为 23:59:59
        dt_end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        query = query.filter(models.Order.created_at < dt_end)
        
    # 3. 兼容旧的年月筛选逻辑 (只有在没有日期区间时才生效)
    if not start_date and not end_date:
        if year:
            query = query.filter(extract('year', models.Order.created_at) == year)
        if month:
            query = query.filter(extract('month', models.Order.created_at) == month)

    # 4. 执行查询并排序
    orders = query.order_by(models.Order.created_at.desc()).all()

    # 5. 格式化输出 (保持和你之前的返回结构一致)
    order_list = []
    for order in orders:
        # 这里建议使用 SQL 的 join 提高性能，但先按你原来的逻辑跑通
        items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
        item_list = [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "image_url": item.image_url,
            }
            for item in items
        ]
        
        order_list.append({
            "id": order.id,
            "order_no": order.order_no,
            "created_at": order.created_at.isoformat(),
            "total_price": float(order.total_price),
            "status": order.status,
            "currency": order.currency,
            "items": item_list,
        })

    return order_list
