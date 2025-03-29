from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

from backend.models.base import Base
from backend.db.session import engine, Base
from backend.core.config import settings
# from backend.database.init_db import init_db
# We'll use tools/init_db.py instead

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 初始化数据库数据
# init_db()  # 使用tools/init_db.py替代

# 初始化FastAPI应用
app = FastAPI(
    title="Privacy-Preserving Malware Detection API",
    description="API for detecting malware while preserving user privacy using PSI protocol",
    version="0.1.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入路由模块
from backend.routers.detection import router as detection_router
from backend.routers.auth import router as auth_router
from backend.routers.user import router as user_router
from backend.routers.scan import router as scan_router
from backend.routers.test import router as test_router

# 注册路由
app.include_router(detection_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(scan_router)
app.include_router(test_router, prefix="/api/v1", tags=["test"])

# 根路由
@app.get("/")
async def root():
    return {
        "message": "Privacy-Preserving Malware Detection API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 确保uvicorn能够找到app
if __name__ == "__main__":
    # 启动API服务器
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)