import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Building2, Calendar, Target, DollarSign, ArrowUpRight, TrendingUp, X, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

export function Leads() {
  const { leads, setLeads, addNotification } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isGeneratingLeads, setIsGeneratingLeads] = useState(false);
  const [isScoringLeads, setIsScoringLeads] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: 'Note', content: '' });

  const [newLead, setNewLead] = useState({
    name: '', company: '', contact: '', phone: '', stage: 'New', value: '', probability: '', assignee: '', activities: []
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    setLeads([...leads, {
      ...newLead,
      id: newId,
      value: parseFloat(String(newLead.value)) || 0,
      probability: parseInt(String(newLead.probability)) || 0,
      lastContact: new Date().toISOString().split('T')[0],
      activities: []
    }]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', company: '', contact: '', phone: '', stage: 'New', value: '', probability: '', assignee: '', activities: [] });
  };

  const handleGenerateLeads = () => {
    setIsGeneratingLeads(true);
    setTimeout(() => {
      const generated = [
        { id: Math.floor(Math.random() * 10000), name: 'AI Marketing Tool', company: 'Marketech', contact: 'lead1@marketech.io', phone: '555-5001', stage: 'New', value: 12000, probability: 20, lastContact: new Date().toISOString().split('T')[0], assignee: 'Unassigned', activities: [] },
        { id: Math.floor(Math.random() * 10000), name: 'Enterprise Firewall', company: 'DefenseCo', contact: 'lead2@defenseco.com', phone: '555-5002', stage: 'New', value: 35000, probability: 10, lastContact: new Date().toISOString().split('T')[0], assignee: 'Unassigned', activities: [] },
        { id: Math.floor(Math.random() * 10000), name: 'Cloud Optimization', company: 'Serverless Inc', contact: 'lead3@serverless.io', phone: '555-5003', stage: 'New', value: 20000, probability: 15, lastContact: new Date().toISOString().split('T')[0], assignee: 'Unassigned', activities: [] }
      ];
      setLeads(prev => [...prev, ...generated]);
      setIsGeneratingLeads(false);
    }, 1500);
  };

  const handleScoreLeads = async () => {
    setIsScoringLeads(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert sales AI. Review the following list of sales leads and give each one a score from 1 to 99 based on their engagement, value, probability, stage, and activities.
      
Leads: ${JSON.stringify(leads, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "Lead ID" },
                aiScore: { type: Type.INTEGER, description: "Lead Score between 1 and 99" }
              },
              required: ["id", "aiScore"]
            }
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const scores = JSON.parse(resultText);
        setLeads(prev => prev.map(l => {
          const match = scores.find((s: any) => s.id === l.id);
          return match ? { ...l, aiScore: match.aiScore } : l;
        }));
      }
    } catch (e) {
      console.error("Error scoring leads", e);
    } finally {
      setIsScoringLeads(false);
    }
  };

  const handleAddActivity = () => {
    if (!selectedLead || !newActivity.content) return;
    const act = {
      id: Date.now(),
      type: newActivity.type,
      date: new Date().toISOString().split('T')[0],
      content: newActivity.content
    };
    const updated = { ...selectedLead, activities: [act, ...(selectedLead.activities || [])] };
    setSelectedLead(updated);
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    setNewActivity({ type: 'Note', content: '' });
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipeline = leads.filter(l => l.stage !== 'Lost' && l.stage !== 'Won').reduce((sum, lead) => sum + lead.value, 0);
  const weightedPipeline = leads.filter(l => l.stage !== 'Lost' && l.stage !== 'Won').reduce((sum, lead) => sum + (lead.value * (lead.probability / 100)), 0);

  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('leadId', leadId.toString());
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, stage } : lead));
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">CRM & Leads</h1>
          <p className="text-slate-400 mt-1">Manage your sales pipeline and track opportunities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/lead-capture');
              addNotification({ type: 'success', message: 'Copied Public Lead Capture Link to clipboard!' });
            }}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
            Share Form Link
          </button>
          <button 
            onClick={handleScoreLeads}
            disabled={isScoringLeads}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isScoringLeads ? (
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Score Leads
          </button>
          <button 
            onClick={handleGenerateLeads}
            disabled={isGeneratingLeads}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isGeneratingLeads ? (
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Target className="w-5 h-5" />
            )}
            AI Finder
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-[#0ED7A8]" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Pipeline</p>
          <h3 className="text-2xl font-bold text-white">${totalPipeline.toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 flex items-center mt-2 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> Active Opportunities
          </p>
        </div>
        
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Weighted Pipeline</p>
          <h3 className="text-2xl font-bold text-white">${weightedPipeline.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-2">Expected closed revenue</p>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-16 h-16 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Won This Month</p>
          <h3 className="text-2xl font-bold text-white">
            ${leads.filter(l => l.stage === 'Won').reduce((s, l) => s + l.value, 0).toLocaleString()}
          </h3>
          <p className="text-xs text-purple-400 flex items-center mt-2 font-medium">
            {leads.filter(l => l.stage === 'Won').length} Deals closed
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1E2D40] p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search leads or companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Board
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-[500px]">
          {STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            
            return (
              <div 
                key={stage} 
                className={`flex-shrink-0 w-80 flex flex-col bg-slate-800/20 rounded-2xl border transition-colors overflow-hidden ${
                  dragOverStage === stage ? 'border-[#0ED7A8] bg-[#0ED7A8]/5' : 'border-slate-700/30'
                }`}
                onDrop={(e) => handleDrop(e, stage)}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
              >
                <div className="p-4 border-b border-slate-700/50 bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                       {stage}
                       <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-slate-400">${stageValue.toLocaleString()}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-[#1E2D40] p-4 rounded-xl border border-slate-700 hover:border-[#0ED7A8]/50 shadow-sm cursor-grab active:cursor-grabbing group transition-all"
                    >
                       <div className="flex items-start justify-between mb-2">
                         <h4 className="text-sm font-semibold text-white leading-tight">{lead.name}</h4>
                         <div className="flex items-center gap-2">
                           {lead.aiScore !== undefined && (
                             <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                               lead.aiScore >= 80 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                               lead.aiScore >= 50 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                               'text-rose-400 bg-rose-400/10 border-rose-400/20'
                             }`} title="AI Lead Score">
                               <Sparkles className="w-3 h-3" />
                               {lead.aiScore}
                             </span>
                           )}
                           <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                               className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <MoreHorizontal className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                         <Building2 className="w-3.5 h-3.5" />
                         <span className="truncate">{lead.company}</span>
                       </div>
                       
                       <div className="flex items-center justify-between text-xs font-medium mb-3">
                         <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                           ${lead.value.toLocaleString()}
                         </span>
                         <span className={`px-2 py-0.5 rounded-md border ${
                           lead.probability >= 70 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                           lead.probability >= 40 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                           'text-rose-400 bg-rose-400/10 border-rose-400/20'
                         }`}>
                           {lead.probability}% Win
                         </span>
                       </div>

                       <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                         <div className="flex gap-1.5">
                           <a href={`mailto:${lead.contact}`} className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                             <Mail className="w-3.5 h-3.5" />
                           </a>
                           <a href={`tel:${lead.phone}`} className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                             <Phone className="w-3.5 h-3.5" />
                           </a>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-slate-500" title="Last Contact">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.lastContact).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </div>
                       </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Lead Name</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">AI Score</th>
                  <th className="px-6 py-4 font-medium">Stage</th>
                  <th className="px-6 py-4 font-medium">Probability</th>
                  <th className="px-6 py-4 font-medium">Last Contact</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.contact}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {lead.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-medium">${lead.value.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.aiScore !== undefined ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${
                          lead.aiScore >= 80 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          lead.aiScore >= 50 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                          'text-rose-400 bg-rose-400/10 border-rose-400/20'
                        }`} title="AI Lead Score">
                          <Sparkles className="w-3 h-3" />
                          {lead.aiScore}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${lead.probability >= 70 ? 'bg-emerald-400' : lead.probability >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                            style={{ width: `${lead.probability}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-300">{lead.probability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(lead.lastContact).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex items-end justify-end h-full mt-2">
                      <button onClick={(e) => {e.stopPropagation(); setSelectedLead(lead);}} className="text-slate-400 hover:text-white p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setSelectedLead(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedLead.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {selectedLead.company}</span>
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedLead.contact}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                  <span className="block text-xs font-medium text-slate-400 mb-1">AI Score</span>
                  {selectedLead.aiScore !== undefined ? (
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold rounded ${
                      selectedLead.aiScore >= 80 ? 'text-emerald-400' :
                      selectedLead.aiScore >= 50 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                      {selectedLead.aiScore}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">-</span>
                  )}
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Stage</span>
                  <span className="text-sm font-semibold text-white">{selectedLead.stage}</span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Value</span>
                  <span className="text-sm font-semibold text-emerald-400">${selectedLead.value.toLocaleString()}</span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Probability</span>
                  <span className="text-sm font-semibold text-amber-400">{selectedLead.probability}%</span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Assignee</span>
                  <span className="text-sm font-semibold text-white">{selectedLead.assignee}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Activity History</h3>
                <div className="space-y-4">
                  {(selectedLead.activities || []).map((act: any) => (
                    <div key={act.id} className="bg-slate-800/20 border border-slate-700/30 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-[#0ED7A8] px-2 py-0.5 rounded-md bg-[#0ED7A8]/10 border border-[#0ED7A8]/20">{act.type}</span>
                        <span className="text-xs text-slate-500">{new Date(act.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{act.content}</p>
                    </div>
                  ))}
                  {(!selectedLead.activities || selectedLead.activities.length === 0) && (
                    <div className="text-sm text-slate-500 italic text-center py-4">No activities logged yet.</div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Log Activity</h3>
                <div className="space-y-3">
                  <select 
                    value={newActivity.type} 
                    onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                    className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                  >
                    <option>Note</option>
                    <option>Email</option>
                    <option>Call</option>
                    <option>Meeting</option>
                  </select>
                  <textarea 
                    value={newActivity.content}
                    onChange={e => setNewActivity({...newActivity, content: e.target.value})}
                    placeholder="Type your notes here..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white h-24 focus:outline-none focus:border-[#0ED7A8] resize-none"
                  />
                  <div className="flex justify-end">
                     <button onClick={handleAddActivity} className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                       Log Activity
                     </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Add New Lead</h2>
                <p className="text-sm text-slate-400 mt-1">Create a new opportunity in your pipeline</p>
              </div>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Opportunity Name</label>
                <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" placeholder="e.g. Acme Redesign" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Company</label>
                  <input required type="text" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Assignee</label>
                  <input required type="text" value={newLead.assignee} onChange={e => setNewLead({...newLead, assignee: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" placeholder="Team member" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Email</label>
                  <input required type="email" value={newLead.contact} onChange={e => setNewLead({...newLead, contact: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <input type="text" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Value ($)</label>
                  <input required type="number" min="0" value={newLead.value} onChange={e => setNewLead({...newLead, value: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Probability (%)</label>
                  <input required type="number" min="0" max="100" value={newLead.probability} onChange={e => setNewLead({...newLead, probability: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Stage</label>
                  <select value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all appearance-none">
                    {STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
