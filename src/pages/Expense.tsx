import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, DollarSign, TrendingUp, CreditCard, Receipt, MoreHorizontal, CheckCircle2, Clock, XCircle, PieChart as PieChartIcon, Download, Edit2, Trash2, RefreshCw, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RecordExpenseModal } from '../components/RecordExpenseModal';
import { useAppContext } from '../context/AppContext';

export const initialExpenses = [
  { id: 'EXP-1042', description: 'AWS Cloud Hosting - March', category: 'Infrastructure', amount: 1250.00, date: '2024-03-28', status: 'Paid', submittedBy: 'Dave Consultant', receipt: true, receiptFile: { name: 'invoice_aws_mar.pdf', size: 1048576, type: 'application/pdf' }, isRecurring: true, frequency: 'monthly', endDate: '' },
  { id: 'EXP-1043', description: 'Annual Cybersecurity Conference Tickets', category: 'Training & Events', amount: 850.00, date: '2024-03-25', status: 'Approved', submittedBy: 'Alice Security', receipt: true, receiptFile: { name: 'conf_tickets.png', size: 512000, type: 'image/png' }, isRecurring: false },
  { id: 'EXP-1044', description: 'New MacBook Pro for Design Team', category: 'Hardware', amount: 2499.00, date: '2024-03-22', status: 'Paid', submittedBy: 'HR Dept', receipt: true, receiptFile: { name: 'apple_receipt.pdf', size: 2097152, type: 'application/pdf' }, isRecurring: false },
  { id: 'EXP-1045', description: 'Facebook Ad Campaign - Q1', category: 'Marketing', amount: 3500.00, date: '2024-03-20', status: 'Pending', submittedBy: 'Marketing Team', receipt: false, isRecurring: false },
  { id: 'EXP-1046', description: 'Office Supplies & Coffee', category: 'Office', amount: 145.50, date: '2024-03-18', status: 'Paid', submittedBy: 'Office Manager', receipt: true, receiptFile: { name: 'costco_receipt.jpg', size: 1536000, type: 'image/jpeg' }, isRecurring: false },
  { id: 'EXP-1047', description: 'Burp Suite Pro License Renewal', category: 'Software', amount: 449.00, date: '2024-03-15', status: 'Paid', submittedBy: 'Alice Security', receipt: true, receiptFile: { name: 'burp_invoice.pdf', size: 819200, type: 'application/pdf' }, isRecurring: true, frequency: 'yearly', endDate: '' },
];

const categoryData = [
  { name: 'Marketing', value: 3500, color: '#3b82f6' },
  { name: 'Hardware', value: 2499, color: '#a855f7' },
  { name: 'Infrastructure', value: 1250, color: '#0ED7A8' },
  { name: 'Training', value: 850, color: '#f59e0b' },
  { name: 'Software', value: 449, color: '#ec4899' },
  { name: 'Office', value: 145.5, color: '#64748b' },
];

export function Expense() {
  const { addNotification } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [reminderConfigExpense, setReminderConfigExpense] = useState<any>(null);
  const [reminderType, setReminderType] = useState<'email' | 'in-app'>('email');
  const [reminderOffset, setReminderOffset] = useState<'3 days' | '1 week'>('3 days');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRecordExpense = (newExpense: any) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === newExpense.id ? newExpense : exp));
      setEditingExpense(null);
    } else {
      setExpenses([newExpense, ...expenses]);
    }
    setIsAddModalOpen(false);
  };

  const handleAddReminder = () => {
    if (!reminderConfigExpense) return;
    
    const targetDate = new Date(reminderConfigExpense.date);
    if (reminderOffset === '3 days') {
       targetDate.setDate(targetDate.getDate() - 3);
    } else {
       targetDate.setDate(targetDate.getDate() - 7);
    }
    const calculatedTime = targetDate.toLocaleDateString();

    setExpenses(prev => prev.map(exp => {
       if (exp.id === reminderConfigExpense.id) {
         const newReminder = { id: Date.now(), type: reminderType, offset: reminderOffset, calculatedTime };
         return { ...exp, reminders: [...(exp.reminders || []), newReminder] };
       }
       return exp;
    }));
    
    addNotification({ type: 'success', message: `Set ${reminderType === 'email' ? 'Email' : 'In-App'} reminder for ${calculatedTime}.` });
    setReminderConfigExpense(null);
  };

  const handleRemoveReminder = (expenseId: string, reminderId: number) => {
    setExpenses(prev => prev.map(exp => {
       if (exp.id === expenseId) {
         return { ...exp, reminders: (exp.reminders || []).filter((r: any) => r.id !== reminderId) };
       }
       return exp;
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    setActiveDropdown(null);
  };

  const handleGenerateRecurring = () => {
    const today = new Date();
    const generated: typeof expenses = [];
    
    expenses.filter(e => e.isRecurring).forEach(exp => {
      if (exp.endDate && today > new Date(exp.endDate)) {
        return; // Passed end date
      }
      
      const newExp = { ...exp };
      const expDate = new Date(exp.date);
      
      if (newExp.frequency === 'weekly') {
        expDate.setDate(expDate.getDate() + 7);
      } else if (newExp.frequency === 'monthly') {
        expDate.setMonth(expDate.getMonth() + 1);
      } else if (newExp.frequency === 'yearly') {
        expDate.setFullYear(expDate.getFullYear() + 1);
      }
      
      newExp.id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
      newExp.date = expDate.toISOString().split('T')[0];
      newExp.status = 'Pending';
      newExp.receipt = false;
      
      const alreadyExists = expenses.some(e => e.description === newExp.description && e.date === newExp.date);
      if (!alreadyExists) {
        generated.push(newExp);
      }
    });

    if (generated.length > 0) {
      setExpenses(prev => [...generated, ...prev]);
      addNotification({ type: 'success', message: `Generated ${generated.length} upcoming recurring expenses.` });
    } else {
      addNotification({ type: 'info', message: 'No valid recurring expenses to generate.' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Rejected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Approved': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Pending': return <Clock className="w-3.5 h-3.5" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingExpense = expenses.filter(e => e.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Company Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">Track, manage, and analyze all company expenditures.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGenerateRecurring}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Recurring
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-slate-700/30">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <TrendingUp className="w-4 h-4 text-[#0ED7A8]" />
              <span className="text-sm font-medium">Total Expenses (This Month)</span>
            </div>
            <div className="text-3xl font-bold text-white">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-500 mt-2">+12.5% from last month</div>
          </div>
        </div>
        
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-slate-700/30">
            <Clock className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Pending Approvals</span>
            </div>
            <div className="text-3xl font-bold text-white">${pendingExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-500 mt-2">{expenses.filter(e => e.status === 'Pending').length} requests waiting</div>
          </div>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-center justify-center">
          <div className="w-full h-[120px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center gap-1.5 min-w-[100px]">
              {categoryData.slice(0, 3).map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-slate-300 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {['all', 'Paid', 'Approved', 'Pending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-[#0ED7A8] text-[#0ED7A8]' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative" ref={categoryFilterRef}>
            <button
               onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
               className="w-full sm:w-48 bg-[#1E2D40] border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all flex items-center justify-between"
            >
               <span className="truncate">
                 {selectedCategories.length === 0 
                    ? 'All Categories' 
                    : `${selectedCategories.length} selected`}
               </span>
               <Filter className="w-4 h-4 text-slate-400" />
            </button>
            
            {isCategoryDropdownOpen && (
               <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-[#1a2636] border border-slate-700 rounded-xl shadow-xl z-30 py-2">
                 <div className="px-3 pb-2 border-b border-slate-700/50 mb-2">
                   <button 
                     onClick={() => {
                        setSelectedCategories([]);
                        setIsCategoryDropdownOpen(false);
                     }}
                     className="text-xs text-[#0ED7A8] font-medium hover:text-[#0ED7A8]/80 transition-colors"
                   >
                     Clear all
                   </button>
                 </div>
                 <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 space-y-1">
                   {categoryData.map(cat => (
                     <label key={cat.name} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors">
                       <div className="relative flex items-center">
                         <input 
                           type="checkbox"
                           className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-[#0ED7A8] focus:ring-[#0ED7A8]"
                           checked={selectedCategories.includes(cat.name)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedCategories([...selectedCategories, cat.name]);
                             } else {
                               setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                             }
                           }}
                         />
                       </div>
                       <span className="text-sm text-slate-300 flex-1">{cat.name}</span>
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                     </label>
                   ))}
                 </div>
               </div>
            )}
          </div>
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
            />
          </div>
          <button
            onClick={() => {
               const { exportToCSV } = require('../lib/utils');
               const filtered = expenses
                 .filter(exp => activeTab === 'all' || exp.status === activeTab)
                 .filter(exp => selectedCategories.length === 0 || selectedCategories.includes(exp.category))
                 .filter(exp => exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase()));
               exportToCSV(filtered, 'expenses.csv');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Submitted By</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {expenses
                .filter(exp => activeTab === 'all' || exp.status === activeTab)
                .filter(exp => selectedCategories.length === 0 || selectedCategories.includes(exp.category))
                .filter(exp => exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-medium text-white group-hover:text-[#0ED7A8] transition-colors cursor-pointer line-clamp-1 flex flex-wrap items-center gap-2" title={expense.description}>
                      {expense.description}
                      {expense.isRecurring && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20" title={`Recurring: ${expense.frequency}`}>
                          <RefreshCw className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {expense.reminders && expense.reminders.length > 0 && (
                       <div className="flex flex-wrap gap-1 mt-1.5">
                         {expense.reminders.map((rem: any) => (
                           <span key={rem.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                             <Bell className="w-2.5 h-2.5" />
                             {rem.calculatedTime} ({rem.type})
                             <button onClick={() => handleRemoveReminder(expense.id, rem.id)} className="ml-1 hover:text-white transition-colors">
                               &times;
                             </button>
                           </span>
                         ))}
                       </div>
                    )}
                    <div className="flex gap-2 items-center mt-1">
                      <div className="text-xs text-slate-500 font-mono">{expense.id}</div>
                      {expense.isRecurring && expense.endDate && (
                        <div className="text-xs text-slate-500">
                          Ends: {new Date(expense.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 w-max">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryData.find(c => c.name === expense.category)?.color || '#94a3b8' }}></div>
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white font-mono">
                      ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300">{expense.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-medium text-white">
                        {expense.submittedBy.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-300">{expense.submittedBy}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      {expense.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      {expense.receipt ? (
                        <button className="p-2 text-slate-400 hover:text-[#0ED7A8] transition-colors rounded-lg hover:bg-slate-800 inline-flex" title={expense.receiptFile ? `Download ${expense.receiptFile.name} (${(expense.receiptFile.size / 1024 / 1024).toFixed(2)}MB)` : "Download Receipt"}>
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic mr-2">No receipt</span>
                      )}
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === expense.id ? null : expense.id)}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeDropdown === expense.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-10 overflow-hidden text-left"
                        >
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsAddModalOpen(true);
                              setActiveDropdown(null);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Expense
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                            onClick={() => {
                              setReminderConfigExpense(expense);
                              setActiveDropdown(null);
                            }}
                          >
                            <Bell className="w-4 h-4" />
                            Set Reminder
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-colors border-t border-slate-700/50"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Expense
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }} 
        onRecordExpense={handleRecordExpense} 
        initialData={editingExpense}
      />

      {reminderConfigExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setReminderConfigExpense(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-sm relative z-10 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Set Reminder</h3>
              <button onClick={() => setReminderConfigExpense(null)} className="text-slate-400 hover:text-white transition-colors">
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-300">Set a reminder for the expense: <span className="font-semibold text-white">{reminderConfigExpense.description}</span></p>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Remind me</label>
                  <select 
                    value={reminderOffset}
                    onChange={e => setReminderOffset(e.target.value as '3 days' | '1 week')}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all appearance-none"
                  >
                    <option value="3 days">3 days before</option>
                    <option value="1 week">1 week before</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Method</label>
                  <select 
                    value={reminderType}
                    onChange={e => setReminderType(e.target.value as 'email' | 'in-app')}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all appearance-none"
                  >
                    <option value="email">Email</option>
                    <option value="in-app">In-App Notification</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700/50 flex justify-end gap-3">
              <button 
                onClick={() => setReminderConfigExpense(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddReminder}
                className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
