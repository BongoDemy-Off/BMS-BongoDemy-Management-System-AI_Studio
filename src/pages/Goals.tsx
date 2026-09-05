import React, { useState } from 'react';
import { Target, TrendingUp, Search, Plus, CheckCircle2, ChevronRight, X } from 'lucide-react';

const initialGoals = [
  {
    id: 1,
    title: 'Increase Q2 Revenue',
    type: 'Company',
    owner: 'Admin User',
    progress: 65,
    dueDate: '2026-06-30',
    keyResults: [
      { id: 101, title: 'Close 5 Enterprise deals', target: 5, current: 3, unit: 'deals' },
      { id: 102, title: 'Increase expansion revenue by 20%', target: 20, current: 15, unit: '%' }
    ]
  },
  {
    id: 2,
    title: 'Launch New Website',
    type: 'Department',
    owner: 'Bob Developer',
    progress: 90,
    dueDate: '2026-05-31',
    keyResults: [
      { id: 201, title: 'Complete frontend development', target: 100, current: 100, unit: '%' },
      { id: 202, title: 'Deploy to production environment', target: 100, current: 0, unit: '%' }
    ]
  },
  {
    id: 3,
    title: 'Improve Security Posture',
    type: 'Company',
    owner: 'Alice Security',
    progress: 40,
    dueDate: '2026-09-30',
    keyResults: [
      { id: 301, title: 'Conduct full penetration test', target: 100, current: 60, unit: '%' },
      { id: 302, title: 'Remediate all critical vulnerabilities', target: 100, current: 20, unit: '%' }
    ]
  }
];

export function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', type: 'Company', owner: '', dueDate: '', metricTitle: '', metricTarget: '', metricUnit: '' });

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || goal.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newKeyResults = newGoal.metricTitle.trim() ? [{
      id: Date.now() + 1,
      title: newGoal.metricTitle,
      target: Number(newGoal.metricTarget) || 100,
      current: 0,
      unit: newGoal.metricUnit || '%'
    }] : [];

    setGoals([...goals, { 
      id: Date.now(), 
      title: newGoal.title,
      type: newGoal.type,
      owner: newGoal.owner,
      dueDate: newGoal.dueDate,
      progress: 0, 
      keyResults: newKeyResults 
    }]);
    setIsGoalModalOpen(false);
    setNewGoal({ title: '', type: 'Company', owner: '', dueDate: '', metricTitle: '', metricTarget: '', metricUnit: '' });
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Goals & OKRs</h1>
          <p className="text-slate-400 mt-1">Track company objectives and key results.</p>
        </div>
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Goal
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1E2D40] p-4 rounded-xl border border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Company', 'Department', 'Individual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === tab 
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search objectives..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => (
          <div key={goal.id} className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-800/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    goal.type === 'Company' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                    goal.type === 'Department' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' :
                    'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                  }`}>
                    {goal.type}
                  </span>
                  <span className="text-sm text-slate-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
                <p className="text-sm text-slate-400">Owner: <span className="text-slate-300">{goal.owner}</span></p>
              </div>
              
              <div className="w-full sm:w-64 flex flex-col items-end gap-2">
                <div className="w-full flex justify-between text-sm font-medium">
                   <span className="text-slate-300">Progress</span>
                   <span className={goal.progress >= 70 ? 'text-emerald-400' : goal.progress >= 40 ? 'text-amber-400' : 'text-slate-400'}>{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${goal.progress >= 70 ? 'bg-emerald-400' : goal.progress >= 40 ? 'bg-amber-400' : 'bg-slate-500'}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-800/20">
               <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  Key Results
               </h4>
               <div className="space-y-3 pl-6">
                 {goal.keyResults.map(kr => (
                   <div key={kr.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-700/50">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 ${kr.current >= kr.target ? 'text-[#0ED7A8]' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{kr.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{kr.current} / {kr.target} {kr.unit}</p>
                        </div>
                      </div>
                      <div className="w-full sm:w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-400 h-full rounded-full" 
                           style={{ width: `${(kr.current / kr.target) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
                 {goal.keyResults.length === 0 && (
                    <p className="text-sm text-slate-500">No key results defined yet.</p>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsGoalModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Objective</h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
               <div>
                  <label className="text-sm text-slate-400">Objective Title</label>
                  <input required type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
               </div>
               <div>
                  <label className="text-sm text-slate-400">Type</label>
                  <select value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                     <option>Company</option>
                     <option>Department</option>
                     <option>Individual</option>
                  </select>
               </div>
               <div>
                  <label className="text-sm text-slate-400">Owner / Assignee</label>
                  <input required type="text" value={newGoal.owner} onChange={e => setNewGoal({...newGoal, owner: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
               </div>
               <div>
                  <label className="text-sm text-slate-400">Target Date</label>
                  <input required type="date" value={newGoal.dueDate} onChange={e => setNewGoal({...newGoal, dueDate: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white [color-scheme:dark]" />
               </div>
               
               <div className="pt-4 border-t border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3">Key Result Metric (Optional)</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-sm text-slate-400">Metric Description</label>
                        <input type="text" value={newGoal.metricTitle} onChange={e => setNewGoal({...newGoal, metricTitle: e.target.value})} placeholder="e.g. Generate $1M in Pipeline" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="text-sm text-slate-400">Target Value</label>
                           <input type="number" min="1" value={newGoal.metricTarget} onChange={e => setNewGoal({...newGoal, metricTarget: e.target.value})} placeholder="e.g. 1000000" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="flex-1">
                           <label className="text-sm text-slate-400">Unit</label>
                           <input type="text" value={newGoal.metricUnit} onChange={e => setNewGoal({...newGoal, metricUnit: e.target.value})} placeholder="e.g. USD" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                 <button type="submit" className="px-5 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg font-medium">Save Goal</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
