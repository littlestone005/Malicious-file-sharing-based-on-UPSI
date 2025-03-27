#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
简易文件扫描器示例应用
展示如何使用API进行文件扫描和结果查询的简单GUI应用
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import requests
import json
import os
import time
import threading
from datetime import datetime

class SimpleScannerApp:
    """简易文件扫描器应用"""
    
    def __init__(self, root):
        """初始化应用"""
        self.root = root
        self.root.title("文件扫描器示例应用")
        self.root.geometry("600x450")
        self.root.resizable(True, True)
        
        # API基础URL
        self.base_url = "http://localhost:8000/api/v1"
        
        # 用户认证状态
        self.token = None
        self.username = None
        
        # 创建UI
        self.create_widgets()
    
    def create_widgets(self):
        """创建UI组件"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 认证区域
        auth_frame = ttk.LabelFrame(main_frame, text="用户认证", padding="10")
        auth_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(auth_frame, text="用户名:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.username_entry = ttk.Entry(auth_frame, width=20)
        self.username_entry.grid(row=0, column=1, sticky=tk.W, padx=5, pady=5)
        
        ttk.Label(auth_frame, text="密码:").grid(row=0, column=2, sticky=tk.W, padx=5, pady=5)
        self.password_entry = ttk.Entry(auth_frame, width=20, show="*")
        self.password_entry.grid(row=0, column=3, sticky=tk.W, padx=5, pady=5)
        
        self.login_button = ttk.Button(auth_frame, text="登录", command=self.login)
        self.login_button.grid(row=0, column=4, padx=5, pady=5)
        
        self.auth_status = ttk.Label(auth_frame, text="未登录")
        self.auth_status.grid(row=1, column=0, columnspan=5, sticky=tk.W, padx=5, pady=5)
        
        # 文件扫描区域
        scan_frame = ttk.LabelFrame(main_frame, text="文件扫描", padding="10")
        scan_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.file_path_var = tk.StringVar()
        ttk.Label(scan_frame, text="文件路径:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        ttk.Entry(scan_frame, textvariable=self.file_path_var, width=40).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(scan_frame, text="浏览...", command=self.browse_file).grid(row=0, column=2, padx=5, pady=5)
        
        privacy_frame = ttk.Frame(scan_frame)
        privacy_frame.grid(row=1, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        self.privacy_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(privacy_frame, text="启用隐私保护", variable=self.privacy_var).pack(side=tk.LEFT)
        ttk.Label(privacy_frame, text="(隐私保护模式下仅共享文件特征，不共享文件内容)").pack(side=tk.LEFT, padx=5)
        
        ttk.Button(scan_frame, text="扫描文件", command=self.scan_file).grid(row=2, column=0, columnspan=3, pady=10)
        
        # 结果区域
        result_frame = ttk.LabelFrame(main_frame, text="扫描结果", padding="10")
        result_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 添加结果文本区域和滚动条
        result_scroll = ttk.Scrollbar(result_frame)
        result_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.result_text = tk.Text(result_frame, wrap=tk.WORD, yscrollcommand=result_scroll.set)
        self.result_text.pack(fill=tk.BOTH, expand=True)
        result_scroll.config(command=self.result_text.yview)
        
        # 状态栏
        self.status_var = tk.StringVar()
        self.status_var.set("就绪")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def login(self):
        """登录处理"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("错误", "请输入用户名和密码")
            return
        
        self.status_var.set("登录中...")
        self.root.update()
        
        # 在单独线程中执行登录，避免UI阻塞
        threading.Thread(target=self._do_login, args=(username, password), daemon=True).start()
    
    def _do_login(self, username, password):
        """执行登录请求"""
        try:
            url = f"{self.base_url}/auth/token"
            data = {
                "username": username,
                "password": password
            }
            
            response = requests.post(url, data=data)
            
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
                self.username = username
                
                # 更新UI（在主线程中）
                self.root.after(0, lambda: self.auth_status.config(
                    text=f"已登录: {username}", foreground="green"))
                self.root.after(0, lambda: self.status_var.set("登录成功"))
                self.root.after(0, lambda: self.login_button.config(text="已登录"))
            else:
                error_msg = "登录失败"
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    pass
                
                # 更新UI（在主线程中）
                self.root.after(0, lambda: self.auth_status.config(
                    text=f"登录失败: {error_msg}", foreground="red"))
                self.root.after(0, lambda: self.status_var.set("登录失败"))
                
        except Exception as e:
            # 更新UI（在主线程中）
            self.root.after(0, lambda: self.auth_status.config(
                text=f"错误: {str(e)}", foreground="red"))
            self.root.after(0, lambda: self.status_var.set("连接错误"))
    
    def browse_file(self):
        """打开文件浏览对话框"""
        filepath = filedialog.askopenfilename()
        if filepath:
            self.file_path_var.set(filepath)
    
    def scan_file(self):
        """扫描文件处理"""
        if not self.token:
            messagebox.showerror("错误", "请先登录")
            return
        
        filepath = self.file_path_var.get().strip()
        if not filepath or not os.path.isfile(filepath):
            messagebox.showerror("错误", "请选择有效的文件")
            return
        
        privacy_enabled = self.privacy_var.get()
        
        self.status_var.set("扫描中...")
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, "正在上传和扫描文件，请稍候...\n")
        self.root.update()
        
        # 在单独线程中执行扫描，避免UI阻塞
        threading.Thread(target=self._do_scan, args=(filepath, privacy_enabled), daemon=True).start()
    
    def _do_scan(self, filepath, privacy_enabled):
        """执行文件扫描请求"""
        try:
            filename = os.path.basename(filepath)
            
            url = f"{self.base_url}/scans/upload"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            with open(filepath, "rb") as f:
                files = {"file": (filename, f)}
                data = {"privacy_enabled": "true" if privacy_enabled else "false"}
                
                # 上传文件并扫描
                self.root.after(0, lambda: self.result_text.insert(tk.END, f"正在上传文件: {filename}...\n"))
                response = requests.post(url, headers=headers, data=data, files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    scan_id = result.get("id")
                    
                    # 更新UI（在主线程中）
                    self.root.after(0, lambda: self.result_text.insert(tk.END, f"文件上传成功，扫描ID: {scan_id}\n"))
                    self.root.after(0, lambda: self.result_text.insert(tk.END, "获取扫描结果...\n"))
                    
                    # 轮询获取结果
                    self._poll_scan_result(scan_id)
                else:
                    error_msg = "上传失败"
                    try:
                        error_data = response.json()
                        error_msg = error_data.get("detail", error_msg)
                    except:
                        pass
                    
                    # 更新UI（在主线程中）
                    self.root.after(0, lambda: self.result_text.insert(tk.END, f"错误: {error_msg}\n"))
                    self.root.after(0, lambda: self.status_var.set("扫描失败"))
                
        except Exception as e:
            # 更新UI（在主线程中）
            self.root.after(0, lambda: self.result_text.insert(tk.END, f"错误: {str(e)}\n"))
            self.root.after(0, lambda: self.status_var.set("扫描错误"))
    
    def _poll_scan_result(self, scan_id):
        """轮询获取扫描结果"""
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            attempt += 1
            try:
                url = f"{self.base_url}/scans/{scan_id}"
                headers = {"Authorization": f"Bearer {self.token}"}
                
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    scan_data = response.json()
                    status = scan_data.get("status", "").lower()
                    
                    # 检查扫描是否完成
                    if status == "completed":
                        self._display_scan_result(scan_data)
                        break
                    elif status == "failed":
                        self.root.after(0, lambda: self.result_text.insert(tk.END, "扫描失败\n"))
                        self.root.after(0, lambda: self.status_var.set("扫描失败"))
                        break
                    else:
                        # 继续等待
                        self.root.after(0, lambda: self.result_text.insert(tk.END, f"扫描进行中... (尝试 {attempt}/{max_attempts})\n"))
                        time.sleep(2)  # 等待2秒再次尝试
                
            except Exception as e:
                self.root.after(0, lambda: self.result_text.insert(tk.END, f"获取结果错误: {str(e)}\n"))
                break
        
        if attempt >= max_attempts:
            self.root.after(0, lambda: self.result_text.insert(tk.END, "获取结果超时，请稍后在历史记录中查看\n"))
            self.root.after(0, lambda: self.status_var.set("获取结果超时"))
    
    def _display_scan_result(self, scan_data):
        """显示扫描结果"""
        self.root.after(0, lambda: self.result_text.delete(1.0, tk.END))
        
        # 格式化扫描时间
        scan_date = scan_data.get("scan_date", "")
        try:
            scan_date = datetime.fromisoformat(scan_date.replace("Z", "+00:00"))
            scan_date = scan_date.strftime("%Y-%m-%d %H:%M:%S")
        except:
            pass
        
        # 显示基本信息
        self.root.after(0, lambda: self.result_text.insert(tk.END, "===== 扫描结果 =====\n\n"))
        self.root.after(0, lambda: self.result_text.insert(tk.END, f"文件名: {scan_data.get('file_name', '未知')}\n"))
        self.root.after(0, lambda: self.result_text.insert(tk.END, f"文件哈希: {scan_data.get('file_hash', '未知')}\n"))
        self.root.after(0, lambda: self.result_text.insert(tk.END, f"文件大小: {scan_data.get('file_size', 0)} 字节\n"))
        self.root.after(0, lambda: self.result_text.insert(tk.END, f"扫描时间: {scan_date}\n"))
        self.root.after(0, lambda: self.result_text.insert(tk.END, f"隐私保护: {'已启用' if scan_data.get('privacy_enabled') else '未启用'}\n\n"))
        
        # 显示扫描结果
        result = scan_data.get("result", {})
        is_malicious = result.get("is_malicious", False)
        
        if is_malicious:
            self.root.after(0, lambda: self.result_text.insert(tk.END, "检测结果: 可能存在威胁\n", "malicious"))
            
            # 显示威胁详情
            threat_details = result.get("threat_details", {})
            self.root.after(0, lambda: self.result_text.insert(tk.END, f"\n威胁类型: {threat_details.get('threat_type', '未知')}\n"))
            self.root.after(0, lambda: self.result_text.insert(tk.END, f"威胁等级: {threat_details.get('severity', '未知')}\n"))
            self.root.after(0, lambda: self.result_text.insert(tk.END, f"匹配得分: {threat_details.get('match_score', 0)}\n"))
            
            # 显示威胁描述
            description = threat_details.get("description", "")
            if description:
                self.root.after(0, lambda: self.result_text.insert(tk.END, f"\n威胁描述:\n{description}\n"))
        else:
            self.root.after(0, lambda: self.result_text.insert(tk.END, "检测结果: 未发现威胁\n", "safe"))
        
        # 添加文本标签
        self.root.after(0, lambda: self.result_text.tag_config("malicious", foreground="red", font=("Arial", 10, "bold")))
        self.root.after(0, lambda: self.result_text.tag_config("safe", foreground="green", font=("Arial", 10, "bold")))
        
        # 更新状态
        self.root.after(0, lambda: self.status_var.set("扫描完成"))

def main():
    """主函数"""
    root = tk.Tk()
    app = SimpleScannerApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 