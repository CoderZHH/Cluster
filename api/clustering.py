from flask import Blueprint, request, jsonify
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_wine, load_iris
import numpy as np

clustering_bp = Blueprint('clustering', __name__)

def load_dataset(dataset_name):
    """加载数据集"""
    datasets = {
        'wine': load_wine,
        'iris': load_iris
    }
    
    if dataset_name not in datasets:
        raise ValueError(f"不支持的数据集: {dataset_name}")
        
    try:
        data = datasets[dataset_name]()
        # 只选择前两个特征用于可视化
        X = data.data[:, :2]
        feature_names = data.feature_names[:2]
        return X, feature_names
    except Exception as e:
        raise Exception(f"加载数据集出错: {str(e)}")

def validate_params(algorithm, params):
    """验证算法参数"""
    base_params = {
        'n_clusters': lambda x: isinstance(x, int) and 2 <= x <= 10,
        'max_iter': lambda x: isinstance(x, int) and 50 <= x <= 1000,
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
        if not dataset_name:
            return jsonify({'success': False, 'error': '缺少dataset参数'}), 400
            
        algorithm = data.get('algorithm', 'kmeans')
        params = data.get('params', {})
        standardize = data.get('standardize', True)
        
        # 验证参数
        try:
            validate_params(algorithm, params)
        except ValueError as e:
            return jsonify({'success': False, 'error': str(e)}), 400
            
        # 加载数据集
        X, feature_names = load_dataset(dataset_name)
        
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
            
        # 执行聚类
        labels = clusterer.fit_predict(X)
        cluster_centers = None
        if algorithm == 'kmeans':
            cluster_centers = clusterer.cluster_centers_

        return jsonify({
            'success': True,
            'data': X.tolist(),
            'labels': labels.tolist(),
            'feature_names': feature_names,
            'cluster_centers': cluster_centers.tolist() if cluster_centers is not None else None
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
