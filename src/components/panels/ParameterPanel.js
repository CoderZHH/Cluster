import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Slider,
  Button
} from '@mui/material';

const ParameterPanel = ({ algorithm, params, setParams }) => {
  const handleChange = (name, value) => {
    setParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        参数设置
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>簇的数量 (n_clusters)</Typography>
        <Slider
          value={params.n_clusters}
          onChange={(_, value) => handleChange('n_clusters', value)}
          min={2}
          max={10}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      {algorithm === 'kmeans' && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>初始化方法</InputLabel>
          <Select
            value={params.init}
            onChange={(e) => handleChange('init', e.target.value)}
            label="初始化方法"
          >
            <MenuItem value="k-means++">k-means++</MenuItem>
            <MenuItem value="random">random</MenuItem>
          </Select>
        </FormControl>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="最大迭代次数"
          type="number"
          value={params.max_iter}
          onChange={(e) => handleChange('max_iter', parseInt(e.target.value))}
          InputProps={{ inputProps: { min: 50, max: 1000 } }}
        />
      </Box>

      {algorithm === 'gmm' && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>协方差类型</InputLabel>
          <Select
            value={params.covariance_type}
            onChange={(e) => handleChange('covariance_type', e.target.value)}
            label="协方差类型"
          >
            <MenuItem value="full">full - 完全协方差</MenuItem>
            <MenuItem value="tied">tied - 绑定协方差</MenuItem>
            <MenuItem value="diag">diag - 对角协方差</MenuItem>
            <MenuItem value="spherical">spherical - 球形协方差</MenuItem>
          </Select>
        </FormControl>
      )}

      <Button 
        variant="contained" 
        fullWidth 
        sx={{ mt: 2 }}
        onClick={() => console.log('开始聚类')}
      >
        开始聚类
      </Button>
    </Box>
  );
};

export default ParameterPanel; 