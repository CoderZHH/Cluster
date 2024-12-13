import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ClusteringVisualization = ({ data, labels }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !labels || data.length === 0) return;

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
      .attr('fill', (d, i) => colorScale(labels[i]))
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

  return <svg ref={svgRef}></svg>;
};

export default ClusteringVisualization; 