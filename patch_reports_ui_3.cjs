const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

const scheduledContent = `      {activeTab === 'scheduled' ? (`;

const templatesContentStr = `      {activeTab === 'templates' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Report Templates (AI)</h2>
              <p className="text-sm text-slate-400 mt-1">Define custom JSON structures and Markdown outlines for the automated Weekly Executive Briefings.</p>
            </div>
            <button
              onClick={() => {
                setEditingTemplateId(null);
                setTemplateForm({ name: '', structure: '' });
                setIsTemplateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#0ED7A8] text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-[#0bc297] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template: any) => (
              <div key={template.id} className={\`bg-slate-800/80 p-6 rounded-2xl border \${template.isActive ? 'border-[#0ED7A8]/50 shadow-[0_0_15px_rgba(14,215,168,0.1)]' : 'border-slate-700/50'} relative group\`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${template.isActive ? 'bg-[#0ED7A8]/20 text-[#0ED7A8]' : 'bg-slate-700 text-slate-400'}\`}>
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      {template.isActive && <span className="text-[10px] uppercase tracking-wider font-bold text-[#0ED7A8] bg-[#0ED7A8]/10 px-2 py-0.5 rounded-full">Active Default</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingTemplateId(template.id);
                        setTemplateForm({ name: template.name, structure: template.structure });
                        setIsTemplateModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-white bg-slate-900/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap line-clamp-4">{template.structure}</p>
                </div>
                {!template.isActive && (
                  <button 
                    onClick={() => {
                      if (setReportTemplates) {
                        setReportTemplates((prev: any) => prev.map((t: any) => ({ ...t, isActive: t.id === template.id })));
                      }
                    }}
                    className="w-full mt-4 py-2 rounded-lg border border-slate-700 hover:border-[#0ED7A8] hover:text-[#0ED7A8] text-slate-400 text-sm font-medium transition-colors"
                  >
                    Set as Active
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)} />
          <div className="relative bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between sticky top-0 bg-[#1E2D40] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#0ED7A8]" />
                {editingTemplateId ? 'Edit Report Template' : 'New Report Template'}
              </h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., Q3 JSON Briefing Structure"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0ED7A8] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">AI Instructions & Format Structure</label>
                  <p className="text-xs text-slate-500 mb-2">Define exactly how Gemini should format the report. You can specify Markdown outlines, JSON structures, or custom data points.</p>
                  <textarea
                    value={templateForm.structure}
                    onChange={(e) => setTemplateForm({ ...templateForm, structure: e.target.value })}
                    rows={12}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0ED7A8] transition-colors font-mono resize-none custom-scrollbar"
                    placeholder="Example:\n{\n  \"summary\": \"Brief overview\",\n  \"metrics\": {\n    \"revenue\": \"$X\",\n    \"burnRate\": \"$Y\"\n  }\n}"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700/50 flex justify-end gap-3 sticky bottom-0 bg-[#1E2D40] z-10">
              <button onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (setReportTemplates) {
                    if (editingTemplateId) {
                      setReportTemplates((prev: any) => prev.map((t: any) => t.id === editingTemplateId ? { ...t, ...templateForm } : t));
                    } else {
                      setReportTemplates((prev: any) => [
                        ...prev, 
                        { id: \`template-\${Date.now()}\`, name: templateForm.name || 'Untitled', structure: templateForm.structure, isActive: prev.length === 0 }
                      ]);
                    }
                  }
                  setIsTemplateModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0ED7A8] text-slate-900 hover:bg-[#0bc297] transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduled' ? (`

if (!content.includes('AI Templates')) {
  content = content.replace(scheduledContent, templatesContentStr);
  fs.writeFileSync('src/pages/Reports.tsx', content);
}
