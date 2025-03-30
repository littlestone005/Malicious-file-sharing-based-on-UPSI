from typing import Optional
from pydantic import BaseModel, validator


class Token(BaseModel):
    """
    Token模型
    
    用于API认证的令牌响应
    """
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """
    Token负载模型
    
    JWT令牌中包含的数据结构
    """
    sub: Optional[str] = None
    exp: Optional[int] = None

    @validator("exp")
    def validate_exp(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("过期时间不能为负数")
        return v 