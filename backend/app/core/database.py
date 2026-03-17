from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# 1. create engine
# echo=True check SQL
echo=True
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 自动检查连接是否失效，对 Docker 部署非常重要
    pool_size=5,         # 连接池大小
    max_overflow=10      # 超过池大小后允许额外创建的连接数
)

# 2. Local session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. 创建模型基类
# 以后所有的业务模型（User, Product 等）都会继承这个 Base
Base = declarative_base()

# 4. 依赖注入函数 (Dependency Injection)
# 每一个 API 请求都会通过这个函数获取数据库连接，并在请求结束时自动关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()