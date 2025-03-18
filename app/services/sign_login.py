from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.db.session import SessionLocal, get_db
from app.models import User  # 假设您有一个 User 模型
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()


# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 创建用户
def create_user(db: Session, username: str, password: str):
    hashed_password = pwd_context.hash(password)
    user = User(username=username, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# 验证用户
def verify_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if user and pwd_context.verify(password, user.password_hash):
        return user
    return None

# OAuth2 密码流
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT 配置
SECRET_KEY = "your_secret_key"  # 请使用更安全的密钥
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 生成 token
def create_access_token(data: dict, expires_delta: timedelta = None):
    '''这是一个类型提示，表示 expires_delta 应该是一个 timedelta 对象。
    timedelta 是 Python 的 datetime 模块中的一个类，
    用于表示两个日期或时间之间的差异，通常用于表示时间间隔。
    None为默认传入的参数'''
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 登录路由
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = verify_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    
    # 返回 token 和用户信息
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username  # 返回用户名
    }

@app.post("/signup")
async def signup(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == form_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # 创建新用户
    user = create_user(db, form_data.username, form_data.password)

    # 生成 token
    access_token = create_access_token(data={"sub": user.username})

    # 返回 token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username  # 返回用户名
    }

# 验证 token 的函数
def verify_token(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# 新增的 token 登录路由
@app.get("/token_login")
async def token_login(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = verify_token(token, db)
    return {"message": f"Welcome back, {user.username}!"}