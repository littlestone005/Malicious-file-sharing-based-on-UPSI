import sys
import os

# 添加项目根目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, project_root)

from backend.core.security import get_password_hash
from backend.db.session import SessionLocal
from backend.models.user import User

def update_admin_password():
    db = SessionLocal()
    try:
        # 查找admin用户
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            # 更新密码为"admin"
            admin_user.hashed_password = get_password_hash("admin")
            db.commit()
            print("Admin password updated successfully!")
        else:
            print("Admin user not found!")
    except Exception as e:
        print(f"Error updating admin password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_admin_password() 