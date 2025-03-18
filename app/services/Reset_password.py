from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User  # 从 models.py 导入 User
from passlib.context import CryptContext
import uuid

app = FastAPI()

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def send_email(to_email: str, subject: str, body: str):
    from_email = "your_email@example.com"
    from_password = "your_email_password"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login(from_email, from_password)
        server.sendmail(from_email, to_email, msg.as_string())

@app.post("/request_password_reset")
async def request_password_reset(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.reset_token and user.reset_token_expires > datetime.utcnow():
        raise HTTPException(status_code=400, detail="Password reset request already sent")
    # 生成重置令牌
    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=10)  # 令牌有效期为1小时
    db.commit()
#db.commit() 是 SQLAlchemy 中用于提交当前数据库会话的更改的方法。它的主要作用是将对数据库的所有更改（如插入、更新或删除操作）持久化到数据库中
    # 发送重置链接到用户的电子邮件
    reset_link = f"http://localhost:8000/reset_password?token={reset_token}"
    send_email(email, "Password Reset Request", f"Click the link to reset your password: {reset_link}")

    return {"detail": "Password reset link sent to your email."}
'''在使用 SQLAlchemy 进行数据库操作时，当您修改一个对象的属性并调用 db.commit() 方法时，数据库中相应的数据也会被更新。'''
@app.post("/reset_password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    if not user or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # 更新用户密码
    hashed_password = pwd_context.hash(new_password)
    user.password_hash = hashed_password
    user.reset_token = None  # 清除重置令牌
    user.reset_token_expires = None  # 清除过期时间
    db.commit()

    return {"detail": "Password has been reset successfully."}
'''
密码重置流程
用户请求重置密码:
用户在前端界面输入他们的电子邮件地址（而不是用户名），并提交请求。
服务器接收到请求后，查找与该电子邮件地址关联的用户。
生成重置令牌:
如果找到用户，服务器生成一个唯一的重置令牌（reset token），并将其存储在数据库中，同时设置一个过期时间。
这个重置令牌是随机生成的，确保其安全性。
发送重置链接:
服务器生成一个包含重置令牌的链接，并将其发送到用户的电子邮件中。链接的格式通常是：
Apply to reset_passwo...
用户在电子邮件中点击这个链接。
用户重置密码:
用户通过链接访问重置密码页面，输入新密码。
服务器接收到请求后，提取 URL 中的重置令牌，并验证其有效性（检查令牌是否存在、是否过期）。
如果令牌有效，服务器允许用户输入新密码，并更新数据库中的密码。
关键点'''

