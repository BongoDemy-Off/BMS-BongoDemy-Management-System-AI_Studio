const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

const tabHtml = `
        <button
          onClick={() => setActiveTab('templates')}
          className={\`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap \${activeTab === 'templates' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}\`}
        >
          <FileCode2 className="w-4 h-4" />
          AI Templates
        </button>
      </div>`;

content = content.replace("</div>", tabHtml); // Very risky, let's target the exact tabs container

// Let's do it safer.
