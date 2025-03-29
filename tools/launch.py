import subprocess
import sys
import os

def start_servers():
    # 获取项目根目录
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 切换到项目根目录
    os.chdir(root_dir)
    
    # 确保必要的目录存在
    os.makedirs('data', exist_ok=True)
    os.makedirs('backend/uploads', exist_ok=True)
    os.makedirs('backend/logs', exist_ok=True)
    
    # 启动前端服务器
    frontend_cmd = 'cmd /k "cd frontend && npm run dev"'
    subprocess.Popen(f'start {frontend_cmd}', shell=True)

    # 启动后端服务器
    backend_cmd = f'"{sys.executable}" -m backend.main'
    subprocess.Popen(f'start cmd /k {backend_cmd}', shell=True)

if __name__ == '__main__':
    start_servers()