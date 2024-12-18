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
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/system';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

const UploadButton = styled(Button)({
  marginTop: '16px',
  marginBottom: '8px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const DatasetPanel = ({ selectedDataset, setUploadedData, uploadedData, setSelectedDataset, standardize, setStandardize }) => {
  const [openPreview, setOpenPreview] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedDescription, setUploadedDescription] = useState('');
  const [originalData, setOriginalData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [startRow, setStartRow] = useState(0);

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
        let data;
        try {
          if (file.type.includes('csv')) {
            const text = e.target.result;
            data = d3.csvParse(text);
          } else if (file.type.includes('json')) {
            data = JSON.parse(e.target.result);
            if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
              throw new Error('JSON格式不正确，应该是对象数组');
            }
          } else if (file.type.includes('sheet') || file.type.includes('excel')) {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
          } else {
            alert('不支持的文件格式');
            return;
          }
          setOriginalData(data);
          setUploadedData(data);
          setUploadedFileName(file.name);
          setUploadedDescription(`包含${data.length}个样本，${Object.keys(data[0]).length}个特征的数据集`);
          setSelectedDataset('uploaded');
          setSelectedColumns(Object.keys(data[0]));
        } catch (error) {
          console.error('文件解析错误:', error);
          alert('文件解析错误，请检查文件格式');
        }
      };
      if (file.type.includes('sheet') || file.type.includes('excel')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file, 'utf-8');
      }
    }
    event.target.value = null;
  };

  const handleDelete = () => {
    setUploadedData(null);
    setOriginalData(null);
    setUploadedFileName('');
    setUploadedDescription('');
    setSelectedDataset(null);
    setOpenPreview(false);
  };

  const handleConfirm = () => {
    if (originalData) {
      const filteredData = originalData.slice(startRow).map(row => {
        const filteredRow = {};
        selectedColumns.forEach(col => {
          filteredRow[col] = row[col];
        });
        return filteredRow;
      });
      setUploadedData(filteredData);
      setOpenPreview(false);
    }
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
        上传文件
        <input
          type="file"
          accept=".csv, .json, .xls, .xlsx"
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            选择需要聚类的列：
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>选择列</InputLabel>
            <Select
              multiple
              value={selectedColumns}
              onChange={(e) => setSelectedColumns(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
            >
              {originalData && Object.keys(originalData[0]).map((col) => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={selectedColumns.indexOf(col) > -1} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="起始行"
            type="number"
            value={startRow + 1}
            onChange={(e) => setStartRow(Math.max(0, Number(e.target.value) - 1))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mb: 2 }}
          />
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {originalData && Object.keys(originalData[0]).map((key, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        backgroundColor: selectedColumns.includes(key) ? '#e3f2fd' : '#f5f5f5',
                        fontWeight: selectedColumns.includes(key) ? 'bold' : 'normal'
                      }}
                    >
                      {key}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {originalData && originalData.slice(0, 10).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.keys(row).map((key, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        sx={{
                          backgroundColor: rowIndex >= startRow && selectedColumns.includes(key)
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'inherit',
                          opacity: rowIndex >= startRow && selectedColumns.includes(key)
                            ? 1
                            : 0.5
                        }}
                      >
                        {row[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>关闭</Button>
          <Button onClick={handleConfirm} color="primary">确定</Button>
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