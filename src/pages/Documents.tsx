import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, FileText, FileImage, FileCode, Folder, MoreVertical, Download, Eye, Upload, Shield, Lock, Trash2, Edit2 } from 'lucide-react';
import { UploadDocumentModal } from '../components/UploadDocumentModal';

const initialDocuments = [
  { id: 'DOC-001', title: 'Company Profile 2024', category: 'Marketing', type: 'pdf', size: '4.2 MB', updated: '2024-03-20', access: 'Viewer', author: 'Alice Security' },
  { id: 'DOC-002', title: 'Employee Handbook v3', category: 'HR', type: 'pdf', size: '2.1 MB', updated: '2024-02-15', access: 'Editor', author: 'HR Dept' },
  { id: 'DOC-003', title: 'Q1 Financial Report', category: 'Finance', type: 'xlsx', size: '1.8 MB', updated: '2024-04-01', access: 'Administrator', author: 'Finance Team' },
  { id: 'DOC-004', title: 'Product Catalog - CyberSec', category: 'Products', type: 'pdf', size: '8.5 MB', updated: '2024-03-10', access: 'Viewer', author: 'Marketing' },
  { id: 'DOC-005', title: 'Client NDA Template', category: 'Legal', type: 'docx', size: '145 KB', updated: '2024-01-22', access: 'Project Manager', author: 'Legal Dept' },
  { id: 'DOC-006', title: 'Brand Assets & Logos', category: 'Marketing', type: 'zip', size: '45 MB', updated: '2024-03-05', access: 'Viewer', author: 'Design Team' },
];

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewAsRole, setViewAsRole] = useState('Administrator');
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadDocument = (newDocument: any) => {
    setDocuments([newDocument, ...documents]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setActiveDropdown(null);
  };

  const categories = ['All', 'Marketing', 'HR', 'Finance', 'Products', 'Legal'];
  
  // Simple role hierarchy for demonstration
  const roleHierarchy: Record<string, number> = {
    'Administrator': 5,
    'Finance': 4,
    'Project Manager': 3,
    'Editor': 2,
    'Viewer': 1
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-rose-400" />;
      case 'xlsx': return <FileCode className="w-8 h-8 text-emerald-400" />;
      case 'docx': return <FileText className="w-8 h-8 text-blue-400" />;
      case 'zip': return <Folder className="w-8 h-8 text-amber-400" />;
      default: return <FileImage className="w-8 h-8 text-slate-400" />;
    }
  };

  const hasAccess = (docAccess: string, userRole: string) => {
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[docAccess] || 0);
  };

  const canUpload = (roleHierarchy[viewAsRole] || 0) >= roleHierarchy['Editor'];

  const canEdit = (doc: any) => {
    return (roleHierarchy[viewAsRole] || 0) >= roleHierarchy['Editor'];
  };

  const canDelete = (doc: any) => {
    return (roleHierarchy[viewAsRole] || 0) >= roleHierarchy['Administrator'] || 
           (doc.author === 'Current User' && (roleHierarchy[viewAsRole] || 0) >= roleHierarchy['Editor']);
  };

  const filteredDocs = documents
    .filter(doc => activeCategory === 'All' || doc.category === activeCategory)
    .filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Center</h1>
          <p className="text-slate-400 text-sm mt-1">Securely manage and share company documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5">
            <Shield className="w-4 h-4 text-slate-400" />
            <select 
              value={viewAsRole}
              onChange={(e) => setViewAsRole(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {Object.keys(roleHierarchy).reverse().map(role => (
                <option key={role} value={role} className="bg-slate-800">View as: {role}</option>
              ))}
            </select>
          </div>
          {canUpload && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeCategory === cat 
                  ? 'border-[#0ED7A8] text-[#0ED7A8]' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map((doc) => {
          const canAccess = hasAccess(doc.access, viewAsRole);
          
          return (
            <div key={doc.id} className={`bg-[#1E2D40] p-5 rounded-2xl border border-slate-700/50 relative group transition-all ${canAccess ? 'hover:border-[#0ED7A8]/50 hover:shadow-lg hover:shadow-[#0ED7A8]/5' : 'opacity-75 grayscale-[50%]'}`}>
              {!canAccess && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] rounded-2xl z-10 flex flex-col items-center justify-center text-slate-300">
                  <Lock className="w-8 h-8 mb-2 text-rose-400" />
                  <span className="text-sm font-medium">Requires {doc.access}</span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4 relative">
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  {getFileIcon(doc.type)}
                </div>
                <div className="relative">
                  {(canEdit(doc) || canDelete(doc)) && (
                    <button 
                      onClick={() => canAccess && setActiveDropdown(activeDropdown === doc.id ? null : doc.id)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors" 
                      disabled={!canAccess}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}

                  {activeDropdown === doc.id && canAccess && (canEdit(doc) || canDelete(doc)) && (
                    <div 
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-30 overflow-hidden text-left"
                    >
                      {canEdit(doc) && (
                        <button 
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                          onClick={() => {
                            // Handle edit
                            setActiveDropdown(null);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Details
                        </button>
                      )}
                      {canDelete(doc) && (
                        <button 
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-colors border-t border-slate-700/50"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Document
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-white font-medium mb-1 line-clamp-1 group-hover:text-[#0ED7A8] transition-colors" title={doc.title}>
                {doc.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-medium text-slate-300 uppercase tracking-wider border border-slate-700">
                  {doc.category}
                </span>
                <span className="text-xs text-slate-500 uppercase font-mono">{doc.type}</span>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Size</span>
                  <span className="font-mono text-slate-300">{doc.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Updated</span>
                  <span className="text-slate-300">{doc.updated}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Access</span>
                  <span className={`font-medium ${doc.access === 'Administrator' ? 'text-rose-400' : 'text-[#0ED7A8]'}`}>
                    {doc.access}
                  </span>
                </div>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20 bg-gradient-to-t from-[#1E2D40] via-[#1E2D40] to-transparent rounded-b-2xl pt-8 pointer-events-none">
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors pointer-events-auto" disabled={!canAccess}>
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button className="flex-1 bg-[#0ED7A8]/10 hover:bg-[#0ED7A8]/20 text-[#0ED7A8] px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors pointer-events-auto" disabled={!canAccess}>
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUploadDocument} 
      />
    </div>
  );
}
