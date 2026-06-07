import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle, XCircle, FileText, Download, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import type { ImportResult } from '@/types';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('请上传CSV格式的文件');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const importResult = await api.importSamples(file);
      setResult(importResult);
    } catch (error) {
      setResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : '导入失败'],
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = () => {
    const sampleContent = `profile_no,sample_date,active_layer_thickness,temp_20cm,temp_50cm
P001,2024-10-01,93.5,4.5,7.2
P001,2024-10-02,92.0,4.3,6.9
P002,2024-10-01,89.0,4.0,6.5`;
    
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '采样数据导入模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">数据导入</h1>
              <p className="text-primary-100 text-sm">批量导入采样记录数据</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">导入采样数据</h2>
            <p className="text-sm text-gray-500">
              请上传符合格式要求的CSV文件，包含剖面号、采样日期、活动层厚度、20cm地温、50cm地温等字段。
            </p>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">拖拽CSV文件到此处，或</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  点击选择文件
                </button>
                <p className="text-xs text-gray-400 mt-2">仅支持CSV格式</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={downloadSample}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载导入模板
            </button>
            <div className="flex gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                返回看板
              </Link>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    开始导入
                  </>
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className={`mt-6 p-5 rounded-xl ${
              result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.failed === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    {result.failed === 0 ? '导入成功' : '导入完成（存在错误）'}
                  </h3>
                  <div className="flex gap-6 text-sm">
                    <span className="text-green-600">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      成功：{result.success} 条
                    </span>
                    {result.failed > 0 && (
                      <span className="text-red-600">
                        <XCircle className="w-4 h-4 inline mr-1" />
                        失败：{result.failed} 条
                      </span>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                      <p className="text-xs text-gray-500 mb-2">错误详情：</p>
                      {result.errors.map((err, idx) => (
                        <p key={idx} className="text-xs text-red-600 py-0.5">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">数据格式说明</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>CSV文件必须包含以下列：</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">profile_no</code> - 剖面号（必须已存在）</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">sample_date</code> - 采样日期（格式：YYYY-MM-DD）</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">active_layer_thickness</code> - 活动层厚度（单位：cm）</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">temp_20cm</code> - 地表下20cm地温（单位：℃）</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">temp_50cm</code> - 地表下50cm地温（单位：℃）</li>
            </ul>
            <p className="text-amber-600 mt-3">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              注意：剖面号必须在系统中已存在，否则该条数据将导入失败。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
