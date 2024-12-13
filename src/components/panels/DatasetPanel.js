import React, { useState } from 'react';
import { 
  Box, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Typography, 
  Switch, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';
import { styled } from '@mui/system';
import * as d3 from 'd3';

const UploadButton = styled(Button)({
  marginTop: '16px',
  marginBottom: '8px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const DatasetPanel = ({ selectedDataset, setSelectedDataset, standardize, setStandardize }) => {
  const [uploadedData, setUploadedData] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedDescription, setUploadedDescription] = useState('');

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const data = d3.csvParse(text);
        setUploadedData(data);
        setUploadedFileName(file.name);
        setUploadedDescription(`包含${data.length}个样本，${Object.keys(data[0]).length}个特征的数据集`);
        setSelectedDataset('uploaded');
      };
      reader.readAsText(file, 'gbk');
    }
    event.target.value = null;
  };

  const handleDelete = () => {
    setUploadedData(null);
    setUploadedFileName('');
    setUploadedDescription('');
    setSelectedDataset(null);
    setOpenPreview(false);
  };

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
          {uploadedData && (
            <FormControlLabel
              value="uploaded"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">{uploadedFileName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uploadedDescription}
                  </Typography>
                </Box>
              }
            />
          )}
        </RadioGroup>
      </FormControl>

      <UploadButton
        variant="contained"
        component="label"
      >
        上传CSV文件
        <input
          type="file"
          accept=".csv"
          hidden
          onChange={handleFileUpload}
        />
      </UploadButton>

      {uploadedData && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setOpenPreview(true)} sx={{ mr: 1 }}>
            预览
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            删除
          </Button>
        </Box>
      )}

      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>数据预览</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {uploadedData && Object.keys(uploadedData[0]).map((key, index) => (
                    <TableCell key={index}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedData && uploadedData.slice(0, 5).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

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