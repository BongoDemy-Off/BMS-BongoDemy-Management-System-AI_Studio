import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, X, Bell, FileText, CheckCircle2, BarChart3, DollarSign, TrendingUp, Download, Building2, Activity, ShieldAlert, Lock, AlertTriangle, Mail } from 'lucide-react';
import { initialExpenses } from './Expense';
import { initialInvoices } from './Invoices';

const initialReports = [
  {
    id: 1,
    date: '2026-05-13',
    teamMember: 'Alice',
    project: 'Web Application Pentest',
    task: 'Run vulnerability scan on main server',
    workDone: 'Completed the initial nmap and openVAS scans. Found 2 medium vulnerabilities that require further investigation. Documented the process.',
    hoursSpent: 6.5,
    blockers: 'None'
  },
  {
    id: 2,
    date: '2026-05-13',
    teamMember: 'Bob',
    project: 'Corporate Website Redesign',
    task: 'Design new landing page wireframes',
    workDone: 'Drafted 3 variations of the hero section and footer. Waiting for approval on the color palette.',
    hoursSpent: 4,
    blockers: 'Waiting for marketing copy from the content team.'
  },
  {
    id: 3,
    date: '2026-05-12',
    teamMember: 'Alice',
    project: 'Web Application Pentest',
    task: 'Reconnaissance',
    workDone: 'Gathered OSINT information, identified subdomains and open ports.',
    hoursSpent: 8,
    blockers: ''
  }
];

export function Reports() {
  const [activeTab, setActiveTab] = useState<'daily' | 'financial' | 'vapt' | 'scheduled'>('daily');
  const [reports, setReports] = useState(initialReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Financial Report States
  const [selectedFinancialReportType, setSelectedFinancialReportType] = useState('income'); // income, balance, cashflow
  const [financialPeriod, setFinancialPeriod] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // Scheduled Report States
  const [scheduledFrequency, setScheduledFrequency] = useState('Weekly');
  const [scheduledEmailList, setScheduledEmailList] = useState('');
  const [isScheduleSaved, setIsScheduleSaved] = useState(false);

  const financialMetrics = useMemo(() => {
    // Income Statement
    const revenue = initialInvoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const cogs = initialExpenses.filter(exp => exp.category === 'Hardware' || exp.category === 'Software').reduce((sum, exp) => sum + exp.amount, 0); // Simplified COGS
    const operatingExpenses = initialExpenses.filter(exp => exp.status === 'Paid' || exp.status === 'Approved')
      .reduce((sum, exp) => sum + exp.amount, 0) - cogs;
    const grossProfit = revenue - cogs;
    const operatingIncome = grossProfit - operatingExpenses;
    const taxes = operatingIncome * 0.21; // Mock 21% tax rate
    const netIncome = operatingIncome - taxes;

    // Balance Sheet
    const cash = 50000; // Starting cash
    const accountsReceivable = initialInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);
    const currentAssets = cash + accountsReceivable;
    
    // Import and use initialAssets if needed for Non-Current Assets
    // We'll estimate non-current assets based on a fixed value + hardware costs
    let nonCurrentAssets = 1200000;
    try {
      const assetCosts = require('./Assets').initialAssets.reduce((sum: number, asset: any) => {
        const costStr = String(asset.cost).replace(/[^0-9.-]+/g, "");
        return sum + (parseFloat(costStr) || 0);
      }, 0);
      nonCurrentAssets += assetCosts;
    } catch(e) {}

    const totalAssets = currentAssets + nonCurrentAssets;

    const accountsPayable = initialExpenses.filter(exp => exp.status === 'Pending').reduce((sum, exp) => sum + exp.amount, 0);
    const currentLiabilities = accountsPayable + (taxes > 0 ? taxes : 0);
    const longTermLiabilities = 45000; // Mock loan
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const equity = totalAssets - totalLiabilities;

    // Cash Flow
    const operatingActivities = netIncome + accountsReceivable - accountsPayable; // Simplified
    const investingActivities = -Math.abs(cogs); 
    const financingActivities = -5000; 
    const netIncrease = operatingActivities + investingActivities + financingActivities;
    const endingCash = cash + netIncrease;

    return {
      revenue,
      cogs,
      operatingExpenses,
      grossProfit,
      operatingIncome,
      taxes,
      netIncome,
      currentAssets,
      nonCurrentAssets,
      totalAssets,
      currentLiabilities,
      longTermLiabilities,
      totalLiabilities,
      equity,
      cash,
      operatingActivities,
      investingActivities,
      financingActivities,
      netIncrease,
      endingCash
    };
  }, []);

  const [incomeData, setIncomeData] = useState({
    revenue: financialMetrics.revenue,
    cogs: financialMetrics.cogs,
    operatingExpenses: financialMetrics.operatingExpenses,
    taxes: financialMetrics.taxes
  });

  const [balanceSheetData, setBalanceSheetData] = useState({
    currentAssets: financialMetrics.currentAssets,
    nonCurrentAssets: financialMetrics.nonCurrentAssets,
    currentLiabilities: financialMetrics.currentLiabilities,
    longTermLiabilities: financialMetrics.longTermLiabilities,
    equity: financialMetrics.equity
  });

  const [cashFlowData, setCashFlowData] = useState({
    operatingActivities: financialMetrics.operatingActivities,
    investingActivities: financialMetrics.investingActivities,
    financingActivities: financialMetrics.financingActivities,
    startingCash: financialMetrics.cash
  });

  const calculatedGrossProfit = (incomeData.revenue || 0) - (incomeData.cogs || 0);
  const calculatedOperatingIncome = calculatedGrossProfit - (incomeData.operatingExpenses || 0);
  const calculatedNetIncome = calculatedOperatingIncome - (incomeData.taxes || 0);
  
  const calculatedTotalAssets = (balanceSheetData.currentAssets || 0) + (balanceSheetData.nonCurrentAssets || 0);
  const calculatedTotalLiabilities = (balanceSheetData.currentLiabilities || 0) + (balanceSheetData.longTermLiabilities || 0);
  
  const calculatedNetCashFlow = (cashFlowData.operatingActivities || 0) + (cashFlowData.investingActivities || 0) + (cashFlowData.financingActivities || 0);
  const calculatedEndingCash = (cashFlowData.startingCash || 0) + calculatedNetCashFlow;

  // Modal states
  const [isSubmitReportModalOpen, setIsSubmitReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof initialReports[0] | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().split('T')[0],
    teamMember: '',
    project: '',
    task: '',
    workDone: '',
    hoursSpent: '',
    blockers: ''
  });

  // Extract unique team members for the filter drop down
  const teamMembers = ['All', ...Array.from(new Set(reports.map(r => r.teamMember)))];

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.workDone.toLowerCase().includes(searchQuery.toLowerCase()) || 
      report.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMember = filterMember === 'All' || report.teamMember === filterMember;
    
    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = report.date >= startDate && report.date <= endDate;
    } else if (startDate) {
      matchesDate = report.date >= startDate;
    } else if (endDate) {
      matchesDate = report.date <= endDate;
    }

    return matchesSearch && matchesMember && matchesDate;
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = Math.max(0, ...reports.map(r => r.id)) + 1;
    const reportToAdd = {
      id: newId,
      date: newReport.date,
      teamMember: newReport.teamMember || 'Unknown',
      project: newReport.project || 'Unassigned',
      task: newReport.task || 'General work',
      workDone: newReport.workDone,
      hoursSpent: parseFloat(newReport.hoursSpent) || 0,
      blockers: newReport.blockers || 'None'
    };

    setReports([reportToAdd, ...reports]);
    setIsSubmitReportModalOpen(false);
    
    // Reset form
    setNewReport({
      date: new Date().toISOString().split('T')[0],
      teamMember: '',
      project: '',
      task: '',
      workDone: '',
      hoursSpent: '',
      blockers: ''
    });

    setNotification('Daily report submitted successfully');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateFinancialReport = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      let reportData = null;
      if (selectedFinancialReportType === 'income') {
        reportData = {
          type: 'Income Statement',
          period: financialPeriod,
          revenue: incomeData.revenue,
          cogs: incomeData.cogs,
          grossProfit: calculatedGrossProfit,
          operatingExpenses: incomeData.operatingExpenses,
          operatingIncome: calculatedOperatingIncome,
          taxes: incomeData.taxes,
          netIncome: calculatedNetIncome
        };
      } else if (selectedFinancialReportType === 'balance') {
        reportData = {
          type: 'Balance Sheet',
          period: financialPeriod,
          assets: {
            current: balanceSheetData.currentAssets,
            nonCurrent: balanceSheetData.nonCurrentAssets,
            total: calculatedTotalAssets
          },
          liabilities: {
            current: balanceSheetData.currentLiabilities,
            longTerm: balanceSheetData.longTermLiabilities,
            total: calculatedTotalLiabilities
          },
          equity: {
            total: balanceSheetData.equity
          }
        };
      } else if (selectedFinancialReportType === 'cashflow') {
        reportData = {
          type: 'Cash Flow Statement',
          period: financialPeriod,
          operatingActivities: cashFlowData.operatingActivities,
          investingActivities: cashFlowData.investingActivities,
          financingActivities: cashFlowData.financingActivities,
          netIncrease: calculatedNetCashFlow,
          beginningBalance: cashFlowData.startingCash,
          endingBalance: calculatedEndingCash
        };
      }
      setGeneratedReport(reportData);
      setIsGenerating(false);
      setNotification(`${reportData?.type} generated successfully`);
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Track daily activities and generate financial statements.</p>
        </div>
        {activeTab === 'daily' && (
          <button 
            onClick={() => setIsSubmitReportModalOpen(true)}
            className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Submit Report
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-700/50 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'daily' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          Internal Daily Reports
        </button>
        <button
          onClick={() => setActiveTab('vapt')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'vapt' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          Client VAPT & Audits
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'financial' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <Building2 className="w-4 h-4" />
          Financial Reports
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'scheduled' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <Mail className="w-4 h-4" />
          Scheduled Reports
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1E2D40] p-4 rounded-xl border border-slate-800 shadow-sm relative z-20">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reports or tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Filter className="w-5 h-5 text-slate-400 hidden sm:block" />
            <select 
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all w-full sm:w-40 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-[size:16px]"
            >
              {teamMembers.map(member => (
                <option key={member} value={member}>{member === 'All' ? 'All Members' : member}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all w-full md:w-32 [color-scheme:dark]"
            />
            <span className="text-slate-500">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all w-full md:w-32 [color-scheme:dark]"
            />
          </div>
          <button
            onClick={() => {
               const { exportToCSV } = require('../lib/utils');
               exportToCSV(filteredReports, 'daily_reports.csv');
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div 
            key={report.id} 
            className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 hover:border-[#0ED7A8]/50 transition-colors group cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 font-medium text-white shadow-sm flex items-center justify-center">
                   {report.teamMember.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{report.teamMember}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md text-xs font-medium text-slate-300 border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {report.hoursSpent}h
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Project</span>
                <p className="text-sm text-slate-200 line-clamp-1 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/30">{report.project}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Task</span>
                <p className="text-sm text-slate-300">{report.task}</p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Work Done</span>
                <p className="text-sm text-slate-300 line-clamp-2">{report.workDone}</p>
              </div>
            </div>
            
            {(report.blockers && report.blockers.toLowerCase() !== 'none' && report.blockers.trim() !== '') && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-rose-400 line-clamp-1" title={report.blockers}>
                  <span className="font-semibold">Blocker: </span>
                  {report.blockers}
                </p>
              </div>
            )}
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-slate-400 md:col-span-2 lg:col-span-3">
            No reports found matching your criteria.
          </div>
        )}
      </div>
      </div>
      ) : activeTab === 'vapt' ? (
      <div className="space-y-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">VAPT & Compliance Reports</h2>
            <button className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Mock VAPT Report Card */}
             <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-[#0ED7A8]/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2.5 bg-slate-700/50 rounded-lg text-[#0ED7A8]">
                      <ShieldAlert className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">Published</span>
                </div>
                <h3 className="text-white font-semibold mb-1">FinServe Web App VAPT</h3>
                <p className="text-sm text-slate-400 mb-4">Client: FinServe LLC</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                   <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> 3 High Vulns
                   </div>
                   <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" /> May 12, 2026
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">View Details</button>
                   <button className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                </div>
             </div>

             {/* Mock Compliance Report Card */}
             <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-[#0ED7A8]/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2.5 bg-slate-700/50 rounded-lg text-indigo-400">
                      <FileText className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Draft</span>
                </div>
                <h3 className="text-white font-semibold mb-1">ISO 27001 Audit Report</h3>
                <p className="text-sm text-slate-400 mb-4">Client: TechCorp Inc.</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                   <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> 5 Non-conformities
                   </div>
                   <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" /> May 14, 2026
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">Edit Draft</button>
                   <button className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" disabled><Download className="w-4 h-4 opacity-50" /></button>
                </div>
             </div>
          </div>
        </div>
      </div>
      ) : activeTab === 'financial' ? (
      <div className="space-y-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Generate Financial Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Report Type</label>
              <select 
                value={selectedFinancialReportType}
                onChange={(e) => setSelectedFinancialReportType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
              >
                <option value="income">Income Statement</option>
                <option value="balance">Balance Sheet</option>
                <option value="cashflow">Cash Flow Statement</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Period</label>
              <select 
                value={financialPeriod}
                onChange={(e) => setFinancialPeriod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
              >
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q1 2026">Q1 2026</option>
                <option value="FY 2025">FY 2025</option>
              </select>
            </div>
          </div>

          {selectedFinancialReportType === 'income' && (
            <div className="mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Income Statement Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Revenue ($)</label>
                  <input 
                    type="number" 
                    value={incomeData.revenue} 
                    onChange={e => setIncomeData(prev => ({ ...prev, revenue: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Cost of Goods Sold ($)</label>
                  <input 
                    type="number" 
                    value={incomeData.cogs} 
                    onChange={e => setIncomeData(prev => ({ ...prev, cogs: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Operating Expenses ($)</label>
                  <input 
                    type="number" 
                    value={incomeData.operatingExpenses} 
                    onChange={e => setIncomeData(prev => ({ ...prev, operatingExpenses: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Taxes ($)</label>
                  <input 
                    type="number" 
                    value={incomeData.taxes} 
                    onChange={e => setIncomeData(prev => ({ ...prev, taxes: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Gross Profit</span>
                  <span className="text-sm font-medium text-[#0ED7A8]">${calculatedGrossProfit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Operating Income</span>
                  <span className="text-sm font-medium text-white">${calculatedOperatingIncome.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Net Income</span>
                  <span className="text-sm font-bold text-[#0ED7A8]">${calculatedNetIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {selectedFinancialReportType === 'balance' && (
            <div className="mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Balance Sheet Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Current Assets ($)</label>
                  <input 
                    type="number" 
                    value={balanceSheetData.currentAssets} 
                    onChange={e => setBalanceSheetData(prev => ({ ...prev, currentAssets: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Non-Current Assets ($)</label>
                  <input 
                    type="number" 
                    value={balanceSheetData.nonCurrentAssets} 
                    onChange={e => setBalanceSheetData(prev => ({ ...prev, nonCurrentAssets: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Current Liabilities ($)</label>
                  <input 
                    type="number" 
                    value={balanceSheetData.currentLiabilities} 
                    onChange={e => setBalanceSheetData(prev => ({ ...prev, currentLiabilities: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Long-Term Liabilities ($)</label>
                  <input 
                    type="number" 
                    value={balanceSheetData.longTermLiabilities} 
                    onChange={e => setBalanceSheetData(prev => ({ ...prev, longTermLiabilities: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Equity ($)</label>
                  <input 
                    type="number" 
                    value={balanceSheetData.equity} 
                    onChange={e => setBalanceSheetData(prev => ({ ...prev, equity: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Total Assets</span>
                  <span className="text-sm font-medium text-[#0ED7A8]">${calculatedTotalAssets.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Total Liabilities</span>
                  <span className="text-sm font-medium text-white">${calculatedTotalLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {selectedFinancialReportType === 'cashflow' && (
            <div className="mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50">Cash Flow Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Operating Activities ($)</label>
                  <input 
                    type="number" 
                    value={cashFlowData.operatingActivities} 
                    onChange={e => setCashFlowData(prev => ({ ...prev, operatingActivities: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Investing Activities ($)</label>
                  <input 
                    type="number" 
                    value={cashFlowData.investingActivities} 
                    onChange={e => setCashFlowData(prev => ({ ...prev, investingActivities: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Financing Activities ($)</label>
                  <input 
                    type="number" 
                    value={cashFlowData.financingActivities} 
                    onChange={e => setCashFlowData(prev => ({ ...prev, financingActivities: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Starting Cash ($)</label>
                  <input 
                    type="number" 
                    value={cashFlowData.startingCash} 
                    onChange={e => setCashFlowData(prev => ({ ...prev, startingCash: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Net Increase in Cash</span>
                  <span className="text-sm font-medium text-white">${calculatedNetCashFlow.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-1">Calculated Ending Cash</span>
                  <span className="text-sm font-bold text-[#0ED7A8]">${calculatedEndingCash.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleGenerateFinancialReport}
              disabled={isGenerating}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 disabled:hover:bg-[#0ED7A8] text-slate-900 px-6 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {generatedReport && (
          <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/50">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0ED7A8]" />
                  {generatedReport.type}
                </h3>
                <p className="text-sm text-slate-400 mt-1">Period: {generatedReport.period}</p>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>

            {generatedReport.type === 'Income Statement' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Revenue</span>
                  <span className="text-white font-medium">${generatedReport.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Cost of Goods Sold (COGS)</span>
                  <span className="text-rose-400 font-medium">-${generatedReport.cogs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-900/50 rounded-xl border border-[#0ED7A8]/20">
                  <span className="text-[#0ED7A8] font-medium text-lg">Gross Profit</span>
                  <span className="text-[#0ED7A8] font-bold text-lg">${generatedReport.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Operating Expenses</span>
                  <span className="text-rose-400 font-medium">-${generatedReport.operatingExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-white font-medium">Operating Income</span>
                  <span className="text-white font-medium">${generatedReport.operatingIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Taxes</span>
                  <span className="text-rose-400 font-medium">-${generatedReport.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 sm:p-5 bg-[#0ED7A8]/10 rounded-xl border border-[#0ED7A8]/30">
                  <span className="text-[#0ED7A8] font-bold text-xl">Net Income</span>
                  <span className="text-[#0ED7A8] font-bold text-xl">${generatedReport.netIncome.toLocaleString()}</span>
                </div>
              </div>
            )}

            {generatedReport.type === 'Balance Sheet' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Assets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300">Current Assets</span>
                      <span className="text-white font-medium">${generatedReport.assets.current.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300">Non-Current Assets</span>
                      <span className="text-white font-medium">${generatedReport.assets.nonCurrent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-600">
                      <span className="text-white font-bold">Total Assets</span>
                      <span className="text-[#0ED7A8] font-bold">${generatedReport.assets.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Liabilities</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300">Current Liabilities</span>
                      <span className="text-white font-medium">${generatedReport.liabilities.current.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300">Long-Term Liabilities</span>
                      <span className="text-white font-medium">${generatedReport.liabilities.longTerm.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-600">
                      <span className="text-white font-bold">Total Liabilities</span>
                      <span className="text-rose-400 font-bold">${generatedReport.liabilities.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Equity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-600">
                      <span className="text-white font-bold">Total Equity</span>
                      <span className="text-[#0ED7A8] font-bold">${generatedReport.equity.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generatedReport.type === 'Cash Flow Statement' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Net Cash from Operating Activities</span>
                  <span className={`font-medium ${generatedReport.operatingActivities >= 0 ? 'text-[#0ED7A8]' : 'text-rose-400'}`}>
                    ${generatedReport.operatingActivities.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Net Cash from Investing Activities</span>
                  <span className={`font-medium ${generatedReport.investingActivities >= 0 ? 'text-[#0ED7A8]' : 'text-rose-400'}`}>
                    ${generatedReport.investingActivities.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <span className="text-slate-300">Net Cash from Financing Activities</span>
                  <span className={`font-medium ${generatedReport.financingActivities >= 0 ? 'text-[#0ED7A8]' : 'text-rose-400'}`}>
                    ${generatedReport.financingActivities.toLocaleString()}
                  </span>
                </div>
                
                <div className="my-4 border-t border-slate-700/50"></div>
                
                <div className="flex justify-between items-center p-3 px-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                  <span className="text-white font-medium">Net Increase in Cash</span>
                  <span className={`font-medium ${generatedReport.netIncrease >= 0 ? 'text-[#0ED7A8]' : 'text-rose-400'}`}>
                    ${generatedReport.netIncrease.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 px-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Cash Beginning of Period</span>
                  <span className="text-slate-300 font-medium">${generatedReport.beginningBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-[#0ED7A8]/10 rounded-xl border border-[#0ED7A8]/30 mt-2">
                  <span className="text-[#0ED7A8] font-bold text-lg">Cash End of Period</span>
                  <span className="text-[#0ED7A8] font-bold text-lg">${generatedReport.endingBalance.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      ) : activeTab === 'scheduled' ? (
      <div className="space-y-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
             <div>
               <h2 className="text-lg font-semibold text-white">Scheduled Reports</h2>
               <p className="text-sm text-slate-400 mt-1">Configure automated delivery of project health and financial reports.</p>
             </div>
             <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 text-[#0ED7A8]">
               <Mail className="w-5 h-5" />
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Delivery Frequency</label>
                  <select 
                    value={scheduledFrequency}
                    onChange={(e) => setScheduledFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all shadow-sm"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly (Every Monday)</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Recipients</label>
                  <textarea 
                    rows={3}
                    value={scheduledEmailList}
                    onChange={(e) => setScheduledEmailList(e.target.value)}
                    placeholder="Enter email addresses (comma separated)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all shadow-sm resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Reports will be sent at 9:00 AM UTC on the scheduled day.</p>
                </div>
             </div>
             
             <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 flex flex-col h-full">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-700/50">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Included in Delivery
                </h4>
                <div className="space-y-4 flex-1">
                   <div className="flex items-start gap-3">
                      <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Project Health Summaries</p>
                        <p className="text-xs text-slate-400 mt-0.5">High-level view of all active projects, budget burn rates, and risks.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Financial Roll-ups</p>
                        <p className="text-xs text-slate-400 mt-0.5">Income statement metrics, expense alerts, and cash flow updates.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">VAPT Compliance Updates</p>
                        <p className="text-xs text-slate-400 mt-0.5">New vulnerabilities reported, patch statuses, and overall security posture.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-8 flex justify-end border-t border-slate-700/50 pt-6">
             <button
               onClick={() => {
                 if(scheduledEmailList.trim()) {
                   setIsScheduleSaved(true);
                   setTimeout(() => setIsScheduleSaved(false), 2000);
                   setNotification(`Scheduled report configuration saved for ${scheduledFrequency} delivery.`);
                   setTimeout(() => setNotification(null), 3000);
                 } else {
                   setNotification(`Please enter at least one recipient email address.`);
                   setTimeout(() => setNotification(null), 3000);
                 }
               }}
               className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${isScheduleSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 drop-shadow-md'}`}
             >
               {isScheduleSaved ? (
                 <>
                   <CheckCircle2 className="w-5 h-5" />
                   Saved Successfully
                 </>
               ) : (
                 <>
                   <Mail className="w-5 h-5" />
                   Save Configuration
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
      ) : null}

      {/* Submit Report Modal */}
      {isSubmitReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsSubmitReportModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Submit Daily Report</h2>
                  <p className="text-sm text-slate-400">Log your tasks and time for today</p>
                </div>
              </div>
              <button onClick={() => setIsSubmitReportModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date</label>
                    <input 
                      required 
                      type="date" 
                      value={newReport.date} 
                      onChange={e => setNewReport({...newReport, date: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={newReport.teamMember} 
                      onChange={e => setNewReport({...newReport, teamMember: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Project</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Website Redesign"
                      value={newReport.project} 
                      onChange={e => setNewReport({...newReport, project: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Hours Spent</label>
                    <input 
                      required 
                      type="number" 
                      step="0.5" 
                      min="0"
                      placeholder="e.g. 4.5"
                      value={newReport.hoursSpent} 
                      onChange={e => setNewReport({...newReport, hoursSpent: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Specific Task</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Develop login component"
                    value={newReport.task} 
                    onChange={e => setNewReport({...newReport, task: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Work Done / Details</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Describe what you accomplished..."
                    value={newReport.workDone} 
                    onChange={e => setNewReport({...newReport, workDone: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all resize-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Blockers / Notes (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Any issues or blockers?"
                    value={newReport.blockers} 
                    onChange={e => setNewReport({...newReport, blockers: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all resize-none" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSubmitReportModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xl flex items-center justify-center shadow-sm">
                   {selectedReport.teamMember.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedReport.teamMember}'s Report</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />{new Date(selectedReport.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-indigo-400"><Clock className="w-4 h-4" />{selectedReport.hoursSpent}h Logged</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-xs font-medium text-slate-400 mb-1">Project</span>
                    <span className="text-sm text-white font-medium">{selectedReport.project}</span>
                 </div>
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-xs font-medium text-slate-400 mb-1">Task</span>
                    <span className="text-sm text-white font-medium">{selectedReport.task}</span>
                 </div>
               </div>

               <div>
                 <h3 className="text-sm font-medium text-slate-300 mb-3 pb-2 border-b border-slate-700/50 flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" />
                   Work Done
                 </h3>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                   {selectedReport.workDone}
                 </div>
               </div>

               {(selectedReport.blockers && selectedReport.blockers.toLowerCase() !== 'none' && selectedReport.blockers.trim() !== '') && (
                 <div>
                   <h3 className="text-sm font-medium text-rose-400 mb-3 pb-2 border-b border-rose-500/20 flex items-center gap-2">
                     Blockers & Issues
                   </h3>
                   <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20 text-sm text-rose-300/90 leading-relaxed whitespace-pre-wrap">
                     {selectedReport.blockers}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50">
          <Bell className="w-5 h-5 text-[#0ED7A8]" />
          <p className="text-sm font-medium">{notification}</p>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
