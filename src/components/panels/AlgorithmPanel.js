import React from 'react';
import { 
  Box, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Typography 
} from '@mui/material';

const AlgorithmPanel = ({ algorithm, setAlgorithm }) => {
  const algorithms = [
    {
      id: 'kmeans',
      name: 'K-Means',
      description: '基于距离的聚类算法，适用于球形簇'
    },
    {
      id: 'gmm',
      name: '高斯混合模型（GMM）',
      description: '基于概率的聚类算法，可以捕捉复杂的数据分布'
    }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        聚类算法
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          {algorithms.map(algo => (
            <FormControlLabel
              key={algo.id}
              value={algo.id}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">{algo.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {algo.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default AlgorithmPanel; 