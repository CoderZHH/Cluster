import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import DatasetPanel from './panels/DatasetPanel';
import AlgorithmPanel from './panels/AlgorithmPanel';
import VisualizationPanel from './panels/VisualizationPanel';
import ParameterPanel from './panels/ParameterPanel';

const ClusteringTutorial = () => {
  const [selectedDataset, setSelectedDataset] = useState(null); // 数据集名字
  const [uploadedData, setUploadedData] = useState(null); // 上传数据
  const [standardize, setStandardize] = useState(true);
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [params, setParams] = useState({
    n_clusters: 3,
    init: 'k-means++',
    max_iter: 100,
    random_state: 42,
    covariance_type: 'full'
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        聚类算法可视化教程
      </Typography>

      <Grid container spacing={3}>
        {/* 左侧面板：数据集选择和参数设置 */}
        {console.log(selectedDataset, uploadedData, standardize, algorithm, params)}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <DatasetPanel
              selectedDataset={selectedDataset}
              setSelectedDataset={setSelectedDataset}
              uploadedData={uploadedData}
              setUploadedData={setUploadedData}
              standardize={standardize}
              setStandardize={setStandardize}
            />
            <AlgorithmPanel
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
            />
            <ParameterPanel
              algorithm={algorithm}
              params={params}
              setParams={setParams}
            />
          </Paper>
        </Grid>

        {/* 右侧面板：可视化结果 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <VisualizationPanel
              dataset={selectedDataset}
              uploadedData={uploadedData}
              algorithm={algorithm}
              params={params}
              standardize={standardize}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClusteringTutorial; 