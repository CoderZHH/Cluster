from flask import Blueprint, request, jsonify
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_wine, load_iris
from sklearn.metrics import davies_bouldin_score, silhouette_score
import numpy as np
import pandas as pd
import logging
import time

clustering_bp = Blueprint('clustering', __name__)

# 设置日志级别
logging.basicConfig(level=logging.DEBUG)

def load_dataset(dataset_name, uploaded_data=None):
    """加载数据集"""
    if uploaded_data is not None and dataset_name == 'uploaded':
        # 处理上传的JSON数组数据集
        try:
            logging.debug("处理上传的JSON数组数据集")
            df = pd.DataFrame(uploaded_data)
            logging.debug(f"上传的数据集列: {df.columns.tolist()}")
            feature_names = df.columns.tolist()
            X = df.values
            return X, feature_names
        except Exception as e:
            logging.error(f"处理上传的数据集出错: {str(e)}")
            raise Exception(f"处理上传的数据集出错: {str(e)}")
    
    # 预定义数据集
    datasets = {
        'wine': load_wine,
        'iris': load_iris
    }
    
    if dataset_name not in datasets:
        raise ValueError(f"不支持的数据集: {dataset_name}")
        
    try:
        data = datasets[dataset_name]()
        feature_names = data.feature_names
        X = data.data  # 使用完整数据集
        return X, feature_names
    except Exception as e:
        logging.error(f"加载数据集出错: {str(e)}")
        raise Exception(f"加载数据集出错: {str(e)}")

def validate_params(algorithm, params):
    """验证算法参数"""
    base_params = {
        'n_clusters': lambda x: isinstance(x, int) and 2 <= x <= 10,
        'max_iter': lambda x: isinstance(x, int) and 50 <= x <= 5000,
        'random_state': lambda x: isinstance(x, int)
    }
    
    algorithm_params = {
        'kmeans': {
            **base_params,
            'init': lambda x: x in ['k-means++', 'random']
        },
        'gmm': {
            **base_params,
            'covariance_type': lambda x: x in ['full', 'tied', 'diag', 'spherical']
        }
    }
    
    if algorithm not in algorithm_params:
        raise ValueError(f"不支持的算法: {algorithm}")
        
    for param, validator in algorithm_params[algorithm].items():
        if param in params and not validator(params[param]):
            raise ValueError(f"参数 {param} 的值无效")

@clustering_bp.route('/cluster', methods=['POST'])
def cluster_data():
    """执行聚类分析"""
    try:
        # 验证请求
        if not request.is_json:
            return jsonify({'success': False, 'error': '请求必须是JSON格式'}), 400
            
        data = request.json
        dataset_name = data.get('dataset')
        uploaded_data = data.get('uploadedData')

        algorithm = data.get('algorithm', 'kmeans')
        params = data.get('params', {})
        standardize = data.get('standardize', True)
        
        logging.debug(f"请求参数: {data}")
        
        # 验证参数
        try:
            validate_params(algorithm, params)
        except ValueError as e:
            logging.error(f"参数验证失败: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 400
            
        # 加载数据集
        X, feature_names = load_dataset(dataset_name, uploaded_data)
        
        # 数据标准化
        if standardize:
            scaler = StandardScaler()
            X = scaler.fit_transform(X)
            
        # 配置聚类器
        clusterer = None
        if algorithm == 'kmeans':
            clusterer = KMeans(
                n_clusters=params.get('n_clusters', 3),
                init=params.get('init', 'k-means++'),
                max_iter=params.get('max_iter', 100),
                random_state=params.get('random_state', 42)
            )
        else:  # gmm
            clusterer = GaussianMixture(
                n_components=params.get('n_clusters', 3),
                covariance_type=params.get('covariance_type', 'full'),
                max_iter=params.get('max_iter', 100),
                random_state=params.get('random_state', 42)
            )
        
        # 记录开始时间
        start_time = time.perf_counter()
        
        # 执行聚类
        labels = clusterer.fit_predict(X)
        
        # 计算运行时间
        run_time = time.perf_counter() - start_time
        
        # 计算指标
        db_index = davies_bouldin_score(X, labels)
        silhouette = silhouette_score(X, labels)
        
        cluster_centers = None
        if algorithm == 'kmeans':
            cluster_centers = clusterer.cluster_centers_

        return jsonify({
            'success': True,
            'data': X.tolist(),
            'labels': labels.tolist(),
            'feature_names': feature_names,
            'cluster_centers': cluster_centers.tolist() if cluster_centers is not None else None,
            'db_index': db_index,
            'silhouette': silhouette,
            'run_time': run_time
        })
        
    except Exception as e:
        logging.error(f"聚类分析出错: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
