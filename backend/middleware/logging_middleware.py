from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"{datetime.utcnow().isoformat()} | "
                f"Method: {request.method} | "
                f"Path: {request.url.path} | "
                f"Status: {response.status_code} | "
                f"Process: {process_time:.2f}ms"
            )
            return response
        except Exception as e:
            logger.error(f"请求处理异常: {str(e)}", exc_info=True)
            raise