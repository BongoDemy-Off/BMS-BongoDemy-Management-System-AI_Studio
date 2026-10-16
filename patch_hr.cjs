const fs = require('fs');

let content = fs.readFileSync('src/pages/HR.tsx', 'utf8');

const modalContent = `
      {/* Dossier Modal */}
      {dossierMarkdown && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setDossierMarkdown(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-purple-500/30 w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">AI Team Impact Dossier</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([dossierMarkdown], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`Impact_Dossier_\${new Date().toISOString().split('T')[0]}.md\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    addNotification({ type: 'success', message: 'Dossier downloaded!' });
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 flex items-center gap-2 text-xs font-medium"
                >
                  <Download className="w-4 h-4" /> Download .md
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(dossierMarkdown);
                    addNotification({ type: 'success', message: 'Copied to clipboard!' });
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 flex items-center gap-2 text-xs font-medium"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={() => setDossierMarkdown(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert max-w-none text-sm text-slate-300">
                {dossierMarkdown.split('\\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.startsWith('#') ? (
                      <strong className="text-white text-base block mt-4 mb-2">{line.replace(/#/g, '')}</strong>
                    ) : line.startsWith('-') || line.startsWith('*') ? (
                      <li className="ml-4 mb-1">{line.substring(1).trim()}</li>
                    ) : (
                      <p className="mb-2">{line}</p>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace('    </div>\n  );\n}', modalContent + '    </div>\n  );\n}');
fs.writeFileSync('src/pages/HR.tsx', content);
