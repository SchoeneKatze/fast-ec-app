from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Product, Category, TaxSetting
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal
import json, os

current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "currencies_round.json")

# 全局加载，防止重复读盘
with open(json_path, "r", encoding="utf-8") as f:
    CURRENCY_CONFIG = json.load(f)

async def get_product_cards(country_code: str, db: AsyncSession):
    # 匹配国家配置
    conf = next((v for v in CURRENCY_CONFIG.values() if v["country_code"] == country_code), CURRENCY_CONFIG["USD"])
    
    # 1. 构造多表联合查询语句 (使用 label 统一字段名)
    stmt = (
        select(
            Product,
            Category.name.label("category_name"),
            TaxSetting.tax_rate.label("tax_rate")
        )
        .join(Category, Product.category_id == Category.id)
        .outerjoin(
            TaxSetting,
            and_(
                Product.tax_class == TaxSetting.tax_class,
                TaxSetting.country_code == country_code
            )
        )
        .where(Product.isActive == True)
    )

    # 2. 执行查询
    result = await db.execute(stmt)
    rows = result.all()

    # 3. 处理变量准备
    rounding_style = ROUND_DOWN if conf["rounding_mode"] == "DOWN" else ROUND_HALF_UP
    prec = Decimal("1") if conf["decimal_places"] == 0 else Decimal("0." + "0" * conf["decimal_places"])
    
    product_cards = []
    for row in rows:
        p = row.Product
        
        # 计算逻辑：基础价 * 折扣 * (1 + 税率)
        # 使用 or Decimal("0") 防止 tax_rate 为 None
        raw_final = p.base_price * p.discount_factor * (Decimal("1.0") + (row.tax_rate or Decimal("0")))
        final_no_discount_price_for_show = p.base_price * (Decimal("1.0") + (row.tax_rate or Decimal("0")))
        # 按照国家配置进行舍入，并转为 float 供后端序列化
        final_price = float(raw_final.quantize(prec, rounding=rounding_style))
        
        product_cards.append({
            "product_id": p.product_id,
            "title": p.title,
            "category_name": row.category_name,
            "symbol": conf["symbol"],
            "base_price": float(p.base_price),
            "discount_rate": float(p.discount_factor),
            "tax_rate": float(row.tax_rate or 0),
            "final_price": final_price,
            "final_no_discount_price_for_show": float(final_no_discount_price_for_show.quantize(prec, rounding=rounding_style)),
            "image_url": p.image_url if hasattr(p, 'image_url') else None,
            "stock_status": "in_stock" if p.stock_quantity > 0 else "out_of_stock"
        })

    return product_cards