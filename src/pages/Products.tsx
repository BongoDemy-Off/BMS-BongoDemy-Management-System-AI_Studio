import React, { useState } from 'react';
import { Box, Code, Server, Activity, ArrowRight, ShieldCheck, Github, Smartphone, MessageSquare, Plus, AlignLeft, Calendar, Search, Map } from 'lucide-react';

const products = [
  { 
    id: 'PRD-01', 
    name: 'SafeNet BD', 
    description: "Bangladesh's first AI-powered Bangla-language cyber safety SaaS platform — addressing cyberbullying, fraud, phishing, and online harassment.",
    status: 'In Development', 
    type: 'SaaS Platform',
    icon: ShieldCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  { 
    id: 'PRD-02', 
    name: 'Cyber Threat Alert Bot', 
    description: "AI-based browser extension detecting phishing links, fake profiles, and risky online content.",
    status: 'In Development', 
    type: 'Browser Extension',
    icon: Code,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10'
  },
  { 
    id: 'PRD-03', 
    name: 'AI Parental Control App', 
    description: "Monitors and protects children's digital activities, screen time, and content access.",
    status: 'In Development', 
    type: 'Mobile App',
    icon: Smartphone,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  { 
    id: 'PRD-04', 
    name: 'CommentShield BD', 
    description: "AI-powered comment moderation and cyberbullying detection tool.",
    status: 'Active', 
    type: 'AI Tool',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  { 
    id: 'PRD-05', 
    name: 'AutoParts Pro', 
    description: "Inventory and POS software for auto parts businesses.",
    status: 'Active', 
    type: 'B2B Software',
    icon: Server,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  },
];

const BACKLOG_STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

const initialBacklog = [
  { id: 'TASK-101', productId: 'PRD-01', title: 'Implement Bangla NLP model', status: 'In Progress', priority: 'High', type: 'Feature' },
  { id: 'TASK-102', productId: 'PRD-01', title: 'Design landing page mockup', status: 'Done', priority: 'Medium', type: 'Design' },
  { id: 'TASK-103', productId: 'PRD-02', title: 'Browser extension manifest v3', status: 'In Progress', priority: 'High', type: 'Technical' },
  { id: 'TASK-104', productId: 'PRD-02', title: 'Integrate phishing URL database', status: 'To Do', priority: 'Critical', type: 'Feature' },
  { id: 'TASK-105', productId: 'PRD-04', title: 'API rate limiting', status: 'Review', priority: 'High', type: 'Security' },
  { id: 'TASK-106', productId: 'PRD-01', title: 'User authentication flow', status: 'To Do', priority: 'High', type: 'Feature' },
];

const initialMilestones = [
  { id: 'M-1', title: 'SafeNet BD Beta Launch', product: 'SafeNet BD', quarter: 'Q3 2026', status: 'In Progress', progress: 45 },
  { id: 'M-2', title: 'Threat Alert Bot v1.0', product: 'Cyber Threat Alert Bot', quarter: 'Q4 2026', status: 'Planned', progress: 10 },
  { id: 'M-3', title: 'CommentShield Enterprise API', product: 'CommentShield BD', quarter: 'Q1 2027', status: 'Planned', progress: 0 },
  { id: 'M-4', title: 'AutoParts Pro Mobile App', product: 'AutoParts Pro', quarter: 'Q2 2027', status: 'Planned', progress: 0 },
];

export function Products() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agile' | 'roadmap'>('overview');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [backlogTasks, setBacklogTasks] = useState(initialBacklog);

  const filteredTasks = backlogTasks.filter(task => 
    selectedProduct === 'All' ? true : task.productId === selectedProduct
  );

  return (
    <div className="space-y-6 flex flex-col h-full max-h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Technology Products</h1>
          <p className="text-sm text-slate-400">Manage BongoDemy software products and SaaS solutions</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'agile' && (
            <select 
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="bg-[#1E2D40] border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0ED7A8]"
            >
              <option value="All">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
            <Plus className="w-4 h-4" /> {activeTab === 'overview' ? 'New Product' : 'New Task'}
          </button>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-700/50 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          Product Portfolio
        </button>
        <button
          onClick={() => setActiveTab('agile')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'agile' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <AlignLeft className="w-4 h-4" /> Agile Boards
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'roadmap' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <Map className="w-4 h-4" /> Roadmap
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-6">
            {products.map(product => (
              <div key={product.id} className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl hover:border-slate-600 transition-all group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${product.bg} ${product.color}`}>
                    <product.icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                    product.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {product.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#0ED7A8] transition-colors">{product.name}</h3>
                <p className="text-sm text-slate-400 mb-6 flex-1">{product.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {product.type}
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setActiveTab('agile');
                    }}
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors group-hover:text-[#0ED7A8]"
                  >
                    View Backlog <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'agile' ? (
          <div className="flex gap-6 overflow-x-auto pb-6 h-full custom-scrollbar">
             {BACKLOG_STATUSES.map(status => {
               const tasks = filteredTasks.filter(t => t.status === status);
               return (
                  <div key={status} className="bg-[#1E2D40]/50 rounded-2xl border border-slate-700/50 flex flex-col flex-shrink-0 w-[320px] max-h-full overflow-hidden">
                     <div className="p-4 border-b border-slate-700/50 bg-[#1E2D40] shrink-0 sticky top-0 z-10 flex items-center justify-between">
                       <h3 className="font-semibold text-white flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${
                           status === 'Done' ? 'bg-emerald-400' :
                           status === 'In Progress' ? 'bg-[#0ED7A8]' :
                           status === 'Review' ? 'bg-amber-400' : 'bg-slate-400'
                         }`} />
                         {status}
                       </h3>
                       <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-medium">{tasks.length}</span>
                     </div>
                     <div className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-3">
                        {tasks.length === 0 ? (
                           <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl">
                              <span className="text-slate-500 text-sm">No tasks</span>
                           </div>
                        ) : (
                          tasks.map(task => {
                             const product = products.find(p => p.id === task.productId);
                             return (
                               <div key={task.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-[#0ED7A8]/50 shadow-sm transition-colors cursor-pointer group">
                                  <div className="flex justify-between items-start mb-2">
                                     <span className="text-[10px] text-slate-400 font-mono">{task.id}</span>
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${
                                       task.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                       task.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                       'bg-slate-700 text-slate-300 border-slate-600'
                                     }`}>
                                        {task.priority}
                                     </span>
                                  </div>
                                  <h4 className="text-sm font-medium text-white mb-3 group-hover:text-[#0ED7A8] transition-colors leading-snug">{task.title}</h4>
                                  
                                  <div className="flex items-center justify-between mt-auto">
                                     <div className="flex items-center gap-2">
                                        {product && (
                                           <div className={`w-6 h-6 rounded flex items-center justify-center ${product.bg} ${product.color}`} title={product.name}>
                                              <product.icon className="w-3.5 h-3.5" />
                                           </div>
                                        )}
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{task.type}</span>
                                     </div>
                                     <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-medium border border-slate-600">
                                       U
                                     </div>
                                  </div>
                               </div>
                             );
                          })
                        )}
                     </div>
                  </div>
               )
             })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl overflow-hidden p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Strategic Milestones 2025-2030</h2>
              <div className="space-y-4">
                {initialMilestones.map(milestone => {
                  const product = products.find(p => p.name === milestone.product);
                  return (
                    <div key={milestone.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          {product && (
                             <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${product.bg} ${product.color}`}>
                                <product.icon className="w-6 h-6" />
                             </div>
                          )}
                          <div>
                             <h4 className="text-white font-semibold">{milestone.title}</h4>
                             <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                               <span>{milestone.product}</span>
                               <span>•</span>
                               <span>{milestone.quarter}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className="w-32">
                             <div className="flex justify-between text-xs text-slate-400 mb-1">
                               <span>Progress</span>
                               <span className="text-[#0ED7A8] font-mono">{milestone.progress}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-[#0ED7A8] rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                             </div>
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                            milestone.status === 'In Progress' ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/20' :
                            'bg-slate-700 text-slate-300 border-slate-600'
                          }`}>
                            {milestone.status}
                          </span>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

