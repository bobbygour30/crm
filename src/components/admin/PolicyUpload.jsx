import { motion } from 'framer-motion';
import { useState } from 'react';
import * as XLSX from 'xlsx';

function PolicyUpload() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploadStatus('Uploading...');
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Here you would typically send jsonData to your backend
        console.log('Parsed Policy Data:', jsonData);
        setUploadStatus('Upload successful! Data processed.');
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Failed to process the file. Please ensure it is a valid Excel file.');
        setUploadStatus('');
      }
    };
    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
      setUploadStatus('');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Upload</h2>
      <p className="text-gray-600 mb-6">Upload an Excel file containing policy details.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        {uploadStatus && (
          <p className="text-green-600 text-sm">{uploadStatus}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-4 py-2 rounded-lg text-white transition-all ${
            file ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Upload Policies
        </button>
      </div>
    </motion.div>
  );
}

export default PolicyUpload;