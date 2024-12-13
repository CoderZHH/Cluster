# -*- coding: utf-8 -*-

from flask import Flask, request
from flask_cors import CORS
import socket
import sys
import os
import traceback

# 设置控制台输出编码和自动刷新
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stdout.reconfigure(line_buffering=True)

# 获取当前文件的目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 将当前目录添加到Python路径
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from clustering import clustering_bp
except ImportError as e:
    print(f"导入错误: {e}")
    print(f"Python路径: {sys.path}")
    print("详细错误信息:")
    print(traceback.format_exc())
    input("按任意键退出...")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# 注册蓝图
app.register_blueprint(clustering_bp, url_prefix='/api')

# 添加日志处理
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 添加超时处理中间件
@app.before_request
def before_request():
    logger.info(f"收到请求: {request.method} {request.path}")
    sys.stdout.flush()

@app.after_request
def after_request(response):
    logger.info(f"请求处理完成: {response.status_code}")
    sys.stdout.flush()
    return response

if __name__ == '__main__':
    PORT = 5000
    
    logger.info("\n" + "="*50)
    logger.info("正在启动聚类服务器...")
    logger.info(f"当前目录: {current_dir}")
    logger.info(f"Python路径: {sys.path}")
    logger.info(f"\n服务器地址: http://localhost:{PORT}")
    logger.info("Python环境: " + sys.executable)
    logger.info("="*50 + "\n")
    
    try:
        # 修改服务器配置
        app.config.update(
            PROPAGATE_EXCEPTIONS = True,
            MAX_CONTENT_LENGTH = 16 * 1024 * 1024
        )
        
        # 使用最基本的配置运行服务器
        app.run(
            debug=True,
            port=PORT, 
            host='localhost',
            threaded=True,
            processes=1
        )
    except Exception as e:
        logger.error(f"\n错误: {str(e)}")
        logger.error("\n请检查端口是否被占用")
        input("\n按任意键退出...") 