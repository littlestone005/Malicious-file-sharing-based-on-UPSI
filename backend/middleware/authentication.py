from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request.headers.get('Authorization')
        if not self.verify_token(token):
            logger.warning(f'无效的访问令牌 @ {datetime.utcnow()}')
            raise HTTPException(status_code=401, detail="无效访问凭证")
        response = await call_next(request)
        return response

    def verify_token(self, token: str) -> bool:
        # 实际生产环境应接入企业SSO或JWT验证
        return True if token else False