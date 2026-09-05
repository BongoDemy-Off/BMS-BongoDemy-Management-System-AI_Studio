import React, { useState, useRef } from 'react';
import { X, UploadCloud, File, AlertCircle } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
}

export function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Marketing',
    access: 'Viewer',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError('');
    // Basic validation
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB');
      return;
    }
    setSelectedFile(file);
    if (!formData.title) {
      // Auto-fill title from filename if empty
      setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown';
    const fileSize = selectedFile.size;
    let formattedSize = '';
    
    if (fileSize < 1024 * 1024) {
      formattedSize = `${(fileSize / 1024).toFixed(1)} KB`;
    } else {
      formattedSize = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }

    onUpload({
      ...formData,
      id: `DOC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      type: fileExtension,
      size: formattedSize,
      updated: new Date().toISOString().split('T')[0],
      author: 'Current User', // In a real app, this would be the logged-in user
    });

    // Reset form
    setFormData({
      title: '',
      category: 'Marketing',
      access: 'Viewer',
    });
    setSelectedFile(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E2D40] rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Upload Document</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-[#0ED7A8] bg-[#0ED7A8]/5' 
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-full">
                  <File className="w-8 h-8 text-[#0ED7A8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white line-clamp-1 px-4">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 mt-2"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="p-3 bg-slate-800 rounded-full">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, ZIP up to 50MB</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Document Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. Q2 Marketing Strategy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Products">Products</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Access Level</label>
              <select
                value={formData.access}
                onChange={(e) => setFormData({ ...formData, access: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Finance">Finance</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
