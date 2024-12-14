import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import * as d3 from 'd3';
import axios from 'axios';

const VisualizationPanel = ({ dataset, uploadedData, algorithm, params, standardize }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [labels, setLabels] = useState(null);
  const [featureNames, setFeatureNames] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([0, 1]);
  const [metrics, setMetrics] = useState({ db_index: null, silhouette: null, run_time: null });
  const [previousMetrics, setPreviousMetrics] = useState({ db_index: null, silhouette: null, run_time: null });

  const fetchDataAndCluster = async () => {
    if (!dataset && !uploadedData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/cluster', {
        dataset,
        uploadedData,
        algorithm,
        params,
        standardize
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setPreviousMetrics(metrics);

        setData(response.data.data);
        setLabels(response.data.labels);
        setFeatureNames(response.data.feature_names);
        setMetrics({
          db_index: response.data.db_index,
          silhouette: response.data.silhouette,
          run_time: response.data.run_time
        });
      } else {
        throw new Error(response.data.error || '聚类过程出错');
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('无法连接到服务器，请确保后端服务已启动');
      } else if (err.response) {
        setError(`服务器错误: ${err.response.data.error || '未知错误'}`);
      } else {
        setError(`请求错误: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndCluster();
  }, [dataset, uploadedData, algorithm, params, standardize]);

  useEffect(() => {
    if (!data || !labels) return;

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // 清除旧的SVG内容
    d3.select(svgRef.current).selectAll("*").remove();

    // 创建SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[selectedFeatures[0]]), d3.max(data, d => d[selectedFeatures[0]])])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[selectedFeatures[1]]), d3.max(data, d => d[selectedFeatures[1]])])
      .range([height - margin.bottom, margin.top]);

    // 颜色比例尺
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // 绘制点
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[selectedFeatures[0]]))
      .attr('cy', d => yScale(d[selectedFeatures[1]]))
      .attr('r', 5)
      .attr('fill', (_, i) => colorScale(labels[i]))
      .attr('opacity', 0.6);

    // 添加坐标轴
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

  }, [data, labels, selectedFeatures]);

  const getColorForDBIndex = (dbIndex) => {
    if (dbIndex < 1) return 'green';
    if (dbIndex < 2) return 'orange';
    return 'red';
  };

  const getColorForSilhouette = (silhouette) => {
    if (silhouette > 0.5) return 'green';
    if (silhouette > 0.2) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchDataAndCluster}
            >
              重试
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dataset && !uploadedData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          请选择一个数据集开始聚类分析
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        聚类结果可视化
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>选择特征1</InputLabel>
        <Select
          value={selectedFeatures[0]}
          onChange={(e) => setSelectedFeatures([e.target.value, selectedFeatures[1]])}
        >
          {featureNames.map((name, index) => (
            <MenuItem key={index} value={index}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>选择特征2</InputLabel>
        <Select
          value={selectedFeatures[1]}
          onChange={(e) => setSelectedFeatures([selectedFeatures[0], e.target.value])}
        >
          {featureNames.map((name, index) => (
            <MenuItem key={index} value={index}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <svg ref={svgRef}></svg>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: 20, height: 100, background: 'linear-gradient(to top, #f44336, #ffeb3b, #4caf50)', mr: 2 }}></Box>
        <Box>
          <Typography variant="body2" color={getColorForDBIndex(metrics.db_index)}>
            Davies-Bouldin Index: {metrics.db_index?.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            范围：DB指数的值越小越好。它衡量的是簇内距离与簇间距离的比值。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            解释：较小的DB指数表示簇内的样本更紧密，簇间的样本更分散。
          </Typography>
          <Typography variant="body2" color={getColorForSilhouette(metrics.silhouette)}>
            Silhouette Score: {metrics.silhouette?.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            范围：轮廓系数的值在-1到1之间。值越接近1，表示聚类效果越好。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            解释：较高的轮廓系数表示样本更接近其簇内的其他样本，而远离其他簇。
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              运行时间: {metrics.run_time?.toFixed(2)} 秒
            </Typography>
          </Box>
        </Box>
      </Box>
      {previousMetrics.db_index !== null && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            上一次聚类的评价指标
          </Typography>
          <Typography variant="body2" color={getColorForDBIndex(previousMetrics.db_index)}>
            Davies-Bouldin Index: {previousMetrics.db_index?.toFixed(2)}
          </Typography>
          <Typography variant="body2" color={getColorForSilhouette(previousMetrics.silhouette)}>
            Silhouette Score: {previousMetrics.silhouette?.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              运行时间: {previousMetrics.run_time?.toFixed(2)} 秒
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VisualizationPanel; 