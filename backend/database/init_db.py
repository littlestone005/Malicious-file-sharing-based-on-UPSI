from datetime import datetime
from sqlalchemy.orm import Session
from backend.models import User, KnownThreat
from backend.database.session import SessionLocal
from backend.core.security import get_password_hash

# 添加初始恶意软件特征
def init_malware_signatures(db: Session):
    # 检查是否已有数据
    if db.query(KnownThreat).first():
        return  # 已有数据，跳过初始化
    
    # 准备初始数据
    threats = [
        {
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "threat_type": "Trojan",
            "severity": "high",
            "first_seen": datetime(2023, 1, 15),
            "last_seen": datetime.utcnow(),
            "description": "Emotet trojan known for banking information theft"
        },
        {
            "hash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
            "threat_type": "Ransomware",
            "severity": "critical",
            "first_seen": datetime(2023, 2, 20),
            "last_seen": datetime.utcnow(),
            "description": "WannaCry ransomware that encrypts files and demands ransom"
        },
        {
            "hash": "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
            "threat_type": "Spyware",
            "severity": "medium",
            "first_seen": datetime(2023, 3, 10),
            "last_seen": datetime.utcnow(),
            "description": "Pegasus spyware targeting mobile devices"
        },
        {
            "hash": "8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9",
            "threat_type": "Adware",
            "severity": "low",
            "first_seen": datetime(2023, 4, 5),
            "last_seen": datetime.utcnow(),
            "description": "Browser extension that shows unwanted advertisements"
        },
        {
            "hash": "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3",
            "threat_type": "Worm",
            "severity": "medium",
            "first_seen": datetime(2023, 5, 12),
            "last_seen": datetime.utcnow(),
            "description": "Conficker worm that can spread through network"
        }
    ]
    
    # 添加到数据库
    for threat_data in threats:
        threat = KnownThreat(**threat_data)
        db.add(threat)
    
    db.commit()
    print(f"Added {len(threats)} malware signatures to database.")

# 添加初始用户
def init_users(db: Session):
    # 检查是否已有用户
    if db.query(User).first():
        return  # 已有用户，跳过初始化
    
    # 创建管理员用户
    admin_user = User(
        username="admin",
        email="admin@example.com",
        password="admin",  # 明文密码
        password_hash=get_password_hash("admin"),  # 哈希密码
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(admin_user)
    
    # 创建普通测试用户
    test_user = User(
        username="testuser",
        email="test@example.com",
        password="test123",  # 明文密码
        password_hash=get_password_hash("test123"),  # 哈希密码
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(test_user)
    
    db.commit()
    print("Added initial users to database.")

# 主初始化函数
def init_db():
    db = SessionLocal()
    try:
        init_malware_signatures(db)
        init_users(db)
        print("Database initialization completed.")
    except Exception as e:
        print(f"Error during database initialization: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 