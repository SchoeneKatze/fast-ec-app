from sqlalchemy import select, and_
from sqlalchemy.orm import Session, aliased
from .models import Currency, Product, Category, ProductImage, TaxSetting
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal
import json, os

current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "currencies_round.json")

# 全局加载，防止重复读盘
with open(json_path, "r", encoding="utf-8") as f:
    CURRENCY_CONFIG = json.load(f)

# Result like: {"CN": "CNY", "FR": "EUR", "DE": "EUR", "US": "USD"}
COUNTRY_MAP = {}
for curr_code, info in CURRENCY_CONFIG.items():
    for c_code in info.get("country_code", []):
        COUNTRY_MAP[c_code] = curr_code


async def get_product_cards(country_code: str, db: Session):
    # 确定货币码 (找不到就默认为美元)
    curr_code = COUNTRY_MAP.get(country_code, "USD")
    conf = CURRENCY_CONFIG.get(curr_code)

    TargetCurr = aliased(Currency)
    SourceCurr = aliased(Currency)

    # 1. 构造多表联合查询语句 (使用 label 统一字段名)
    stmt = (
        select(
            Product,
            Category.name.label("category_name"),
            TaxSetting.tax_rate.label("tax_rate"),
            TaxSetting.is_show_inclusive.label("is_show_inclusive"),
            ProductImage.image_url.label("image_url"),
            TargetCurr.exchange_rate.label("target_rate"), 
            SourceCurr.exchange_rate.label("source_rate"),
        )
        .join(Category, Product.category_id == Category.id)
        .outerjoin(TargetCurr, TargetCurr.currency_code == curr_code)
        .outerjoin(SourceCurr, SourceCurr.currency_code == Product.currency_code)
        .outerjoin(
            TaxSetting,
            and_(
                Product.tax_class == TaxSetting.tax_class,
                TaxSetting.country_code == country_code,
            ),
        )
        .outerjoin(
            ProductImage,
            (Product.product_id == ProductImage.product_id)
            & (ProductImage.sort_order == 0),
        )
        .where(Product.isActive == True)
    )

    # 2. 执行查询并获取结果
    rows = db.execute(stmt)

    # 3. 处理变量准备
    rounding_style = ROUND_DOWN if conf["rounding_mode"] == "DOWN" else ROUND_HALF_UP
    prec = (
        Decimal("1")
        if conf["decimal_places"] == 0
        else Decimal("0." + "0" * conf["decimal_places"])
    )

    product_cards = []
    for row in rows:
        p = row.Product
        
        t_rate = Decimal(str(row.target_rate or "1.0"))
        s_rate = Decimal(str(row.source_rate or "1.0"))

        local_base_price = (p.base_price / s_rate) * t_rate

        # 计算逻辑：基础价 * 折扣 * (1 + 税率)
        # 使用 or Decimal("0") 防止 tax_rate 为 None
        raw_final = (
            local_base_price
            * p.discount_factor
            * (Decimal("1.0") + (row.tax_rate or Decimal("0")))
        )
        final_no_discount_price_for_show = local_base_price * (
            Decimal("1.0") + (row.tax_rate or Decimal("0"))
        )
        # 按照国家配置进行舍入，并转为 float 供后端序列化
        final_price = float(raw_final.quantize(prec, rounding=rounding_style))

        product_cards.append(
            {
                "product_id": p.product_id,
                "title": p.title,
                "category_name": row.category_name,
                "symbol": conf["symbol"],
                "base_price": float(local_base_price),
                "discount_rate": float(p.discount_factor),
                "tax_rate": float(row.tax_rate or 0),
                "final_price": final_price,
                "final_no_discount_price_for_show": float(
                    final_no_discount_price_for_show.quantize(
                        prec, rounding=rounding_style
                    )
                ),
                "image_url": row.image_url,
                "stock_status": "in_stock" if p.stock_quantity > 0 else "out_of_stock",
                "is_show_inclusive": row.is_show_inclusive if row.tax_rate is not None else False,
            }
        )

    return product_cards
