import React from 'react';
import { 
  Box, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Typography, 
  Switch 
} from '@mui/material';

const DatasetPanel = ({ selectedDataset, setSelectedDataset, standardize, setStandardize }) => {
  const datasets = [
    { 
      id: 'wine', 
      name: 'Wine数据集', 
      description: '包含178个样本，13个特征的葡萄酒数据' 
    },
    { 
      id: 'iris', 
      name: 'Iris数据集', 
      description: '包含150个样本，4个特征的鸢尾花数据' 
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        数据集选择
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          value={selectedDataset || ''}
          onChange={(e) => setSelectedDataset(e.target.value)}
        >
          {datasets.map(dataset => (
            <FormControlLabel
              key={dataset.id}
              value={dataset.id}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">{dataset.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dataset.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={standardize}
              onChange={(e) => setStandardize(e.target.checked)}
            />
          }
          label="数据标准化"
        />
        <Typography variant="body2" color="text.secondary">
          标准化将帮助提高聚类效果，特别是当特征值范围差异较大时
        </Typography>
      </Box>
    </Box>
  );
};

export default DatasetPanel; 