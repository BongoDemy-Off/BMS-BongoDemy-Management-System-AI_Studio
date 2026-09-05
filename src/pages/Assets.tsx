import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Laptop, Cloud, CreditCard, AlertTriangle, Server, Shield, X, CalendarClock } from 'lucide-react';

export const initialAssets = [
  {
    id: 'AST-001',
    name: 'MacBook Pro M3 Max',
    category: 'Hardware',
    assignedTo: 'Alice Security',
    status: 'In Use',
    cost: '$3,499',
    renewalDate: 'N/A',
    icon: Laptop,
    type: 'Physical'
  },
  {
    id: 'AST-002',
    name: 'AWS Cloud Infrastructure',
    category: 'Hosting',
    assignedTo: 'Engineering Team',
    status: 'Active',
    cost: '$1,200/mo',
    renewalDate: 'Auto-renews',
    icon: Cloud,
    type: 'Virtual'
  },
  {
    id: 'AST-003',
    name: 'Burp Suite Professional',
    category: 'Software License',
    assignedTo: 'Cybersecurity Team',
    status: 'Expiring Soon',
    cost: '$449/yr',
    renewalDate: '2024-04-15',
    icon: Shield,
    type: 'Virtual'
  },
  {
    id: 'AST-004',
    name: 'Office Server Rack A1',
    category: 'Hardware',
    assignedTo: 'IT Dept',
    status: 'Maintenance',
    cost: '$12,000',
    renewalDate: 'N/A',
    icon: Server,
    type: 'Physical'
  },
  {
    id: 'AST-005',
    name: 'bongodemy.com Domain',
    category: 'Domain',
    assignedTo: 'Marketing',
    status: 'Active',
    cost: '$20/yr',
    renewalDate: '2025-01-10',
    icon: Cloud,
    type: 'Virtual'
  }
];

// Helper function to check if a date string is within the next 30 days
const isExpiringSoon = (dateString: string) => {
  if (!dateString || dateString === 'N/A' || dateString === 'Auto-renews') return false;
  
  const renewalDate = new Date(dateString);
  if (isNaN(renewalDate.getTime())) return false;

  const today = new Date('2026-02-27T17:13:48-08:00'); // Using provided current time
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
};

export function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [assets, setAssets] = useState(initialAssets);
  
  // Modal state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  
  // New asset form state
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    assignedTo: '',
    status: 'Active',
    cost: '',
    renewalDate: '',
    type: 'Physical'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'In Use': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Expiring Soon': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Maintenance': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `AST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const assetToAdd = {
      id: newId,
      name: newAsset.name,
      category: newAsset.category,
      assignedTo: newAsset.assignedTo || 'Unassigned',
      status: newAsset.status,
      cost: newAsset.cost,
      renewalDate: newAsset.renewalDate || 'N/A',
      icon: newAsset.type === 'Physical' ? Laptop : Cloud,
      type: newAsset.type
    };

    setAssets([...assets, assetToAdd]);
    setIsAddAssetModalOpen(false);
    setNewAsset({
      name: '',
      category: '',
      assignedTo: '',
      status: 'Active',
      cost: '',
      renewalDate: '',
      type: 'Physical'
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tools & Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical assets, software licenses, and subscriptions.</p>
        </div>
        <button 
          onClick={() => setIsAddAssetModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-[#0ED7A8]">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">124</div>
          <div className="text-sm text-slate-400">Total Physical Assets</div>
          <div className="text-xs text-slate-500 mt-2">Laptops, Servers, Peripherals</div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">$4,250</div>
          <div className="text-sm text-slate-400">Monthly SaaS Spend</div>
          <div className="text-xs text-blue-400 mt-2 font-medium">32 Active Subscriptions</div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">3</div>
          <div className="text-sm text-slate-400">Expiring Licenses</div>
          <div className="text-xs text-amber-400 mt-2 font-medium">Requires action within 30 days</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {['all', 'Physical', 'Virtual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-[#0ED7A8] text-[#0ED7A8]' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Assets
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
            />
          </div>
          <button className="bg-[#1E2D40] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                <th className="p-4 font-medium">Asset Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Assigned To</th>
                <th className="p-4 font-medium">Cost</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {assets
                .filter(asset => activeTab === 'all' || asset.type === activeTab)
                .map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-[#0ED7A8]">
                        <asset.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-[#0ED7A8] transition-colors cursor-pointer">
                          {asset.name}
                        </div>
                        <div className="text-xs text-slate-400">{asset.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{asset.category}</div>
                    <div className="text-xs text-slate-400">{asset.type}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-300">{asset.assignedTo}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{asset.cost}</div>
                    <div className={`text-xs flex items-center gap-1 mt-0.5 ${
                      isExpiringSoon(asset.renewalDate) ? 'text-amber-400 font-medium' : 'text-slate-500'
                    }`}>
                      {isExpiringSoon(asset.renewalDate) && <CalendarClock className="w-3 h-3" />}
                      Renews: {asset.renewalDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddAssetModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Add New Asset</h2>
                <p className="text-sm text-slate-400 mt-1">Add a physical device, software license, or subscription.</p>
              </div>
              <button 
                onClick={() => setIsAddAssetModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAsset}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Asset Name</label>
                    <input 
                      required
                      type="text" 
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. MacBook Pro M3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <input 
                      required
                      type="text" 
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. Hardware"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Asset Type</label>
                    <select 
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      <option value="Physical">Physical</option>
                      <option value="Virtual">Virtual</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <select 
                      value={newAsset.status}
                      onChange={(e) => setNewAsset({...newAsset, status: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Cost</label>
                    <input 
                      required
                      type="text" 
                      value={newAsset.cost}
                      onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. $1,200/mo or $3,499"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Renewal Date</label>
                    <input 
                      type="text" 
                      value={newAsset.renewalDate}
                      onChange={(e) => setNewAsset({...newAsset, renewalDate: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. 2024-04-15 or Auto-renews"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Assigned To</label>
                    <input 
                      type="text" 
                      value={newAsset.assignedTo}
                      onChange={(e) => setNewAsset({...newAsset, assignedTo: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. Alice Security or Engineering Team"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
