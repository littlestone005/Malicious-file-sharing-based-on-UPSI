import os

class ProductionConfig:
    DEBUG = False
    TESTING = False
    DATABASE_URI = os.getenv('PROD_DATABASE_URI')
    SECRET_KEY = os.getenv('SECRET_KEY')
    LOG_LEVEL = 'WARNING'
    MALICIOUS_HASH_DB = 'postgresql+asyncpg://user:pass@prod-db:5432/malware_hashes'

config = ProductionConfig()