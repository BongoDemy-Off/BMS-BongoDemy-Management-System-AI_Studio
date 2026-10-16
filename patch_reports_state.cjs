const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

const newStates = `
  const reportTemplates = useAppContext(s => (s as any).reportTemplates || []);
  const setReportTemplates = useAppContext(s => (s as any).setReportTemplates);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', structure: '' });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
`;

content = content.replace(
  "const [isGenerating, setIsGenerating] = useState(false);",
  "const [isGenerating, setIsGenerating] = useState(false);\n" + newStates
);

fs.writeFileSync('src/pages/Reports.tsx', content);
