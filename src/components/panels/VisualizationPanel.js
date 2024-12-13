import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import * as d3 from 'd3';
import axios from 'axios';

const VisualizationPanel = ({ dataset, algorithm, params, standardize }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [labels, setLabels] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDataAndCluster = async () => {
    if (!dataset) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/cluster', {
        dataset,
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
        setData(response.data.data);
        setLabels(response.data.labels);
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
  }, [dataset, algorithm, params, standardize]);

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
      .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
      .range([height - margin.bottom, margin.top]);

    // 颜色比例尺
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // 绘制点
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
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

  }, [data, labels]);

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

  if (!dataset) {
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
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export default VisualizationPanel; 