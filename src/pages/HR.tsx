import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserCog, DollarSign, ShieldCheck, Mail, Phone, X, Shield, Eye, EyeOff, Clock, CheckCircle2, XCircle, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useAppContext, permissionCategories } from '../context/AppContext';

export function HR() {
  const { teamMembers, setTeamMembers, roles: availableRoles, setRoles, rolePermissions, setRolePermissions, addNotification, projects } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillsSearchTerm, setSkillsSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'directory' | 'leave' | 'logs' | 'recruitment' | 'performance' | 'onboarding' | 'roles' | 'skills'>('directory');
  const [filterType, setFilterType] = useState('all');

  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<{analysis: string, recommendations: string[]} | null>(null);

  const handleAIAnalyzeSkillGaps = async () => {
    setIsAnalyzingGaps(true);
    addNotification({ type: 'info', message: 'AI is analyzing team skills vs project requirements...' });
    
    try {
      const response = await fetch('/api/analyze-skill-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers, projects })
      });
      
      if (!response.ok) throw new Error('Failed to analyze skill gaps');
      
      const result = await response.json();
      setSkillGapAnalysis(result);
      addNotification({ type: 'success', message: 'Skill gap analysis complete.' });
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI skill analysis failed' });
    } finally {
      setIsAnalyzingGaps(false);
    }
  };
  
  // Salary visibility state
  const [visibleSalaries, setVisibleSalaries] = useState<Set<string>>(new Set());
  
  // Modal state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  // New member form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    type: 'Full-time',
    compensationAmount: '',
    compensationPeriod: 'Monthly',
    accessLevel: 'Viewer'
  });

  // Leave Management State
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, employee: 'Bob Developer', type: 'Vacation', startDate: '2026-06-01', endDate: '2026-06-10', days: 8, status: 'Pending', reason: 'Family trip' },
    { id: 2, employee: 'Alice Security', type: 'Sick Leave', startDate: '2026-05-15', endDate: '2026-05-16', days: 2, status: 'Approved', reason: 'Medical appointment' },
    { id: 3, employee: 'Charlie Intern', type: 'Unpaid', startDate: '2026-05-20', endDate: '2026-05-20', days: 1, status: 'Rejected', reason: 'Personal errands' }
  ]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ employee: '', type: 'Vacation', startDate: '', endDate: '', reason: '' });

  // Work Log State
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  const [memberForWorkLog, setMemberForWorkLog] = useState<any | null>(null);
  const [newWorkLog, setNewWorkLog] = useState({ startTime: '', endTime: '', description: '' });

  // Recruitment State
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'John Doe', role: 'Frontend Engineer', status: 'Interviewing', appliedDate: '2026-05-10', rating: 4 },
    { id: 2, name: 'Jane Smith', role: 'Product Manager', status: 'Offer Extended', appliedDate: '2026-05-02', rating: 5 },
    { id: 3, name: 'Mike Ross', role: 'Legal Counsel', status: 'Screening', appliedDate: '2026-05-14', rating: 3 }
  ]);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', role: '', status: 'Screening' });

  // Custom Roles state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string; permissions: string[] } | null>(null);

  const handleRoleDelete = (roleId: string) => {
    // Cannot delete if anyone has this role
    if (teamMembers.some(m => m.accessLevel === availableRoles.find(r => r.id === roleId)?.name)) {
       addNotification({ type: 'error', message: 'Cannot delete role while it is assigned to team members.' });
       return;
    }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    setRolePermissions(prev => {
      const newPerms = { ...prev };
      delete newPerms[roleId];
      return newPerms;
    });
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    
    // Check if creating new
    const existingRole = availableRoles.find(r => r.id === editingRole.id);
    if (!existingRole) {
      // Create new role
      setRoles(prev => [...prev, {
        id: editingRole.id,
        name: editingRole.name,
        description: editingRole.description,
        isCustom: true
      }]);
    } else {
      // Update
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: editingRole.name, description: editingRole.description } : r));
    }

    setRolePermissions(prev => ({
      ...prev,
      [editingRole.id]: editingRole.permissions
    }));
    
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    setCandidates([...candidates, { ...newCandidate, id: newId, appliedDate: new Date().toISOString().split('T')[0], rating: 0 }]);
    setIsCandidateModalOpen(false);
    setNewCandidate({ name: '', role: '', status: 'Screening' });
  };

  const handleAttendanceToggle = (memberId: string, currentStatus: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (currentStatus === 'checked-in') {
      const member = teamMembers.find(m => m.id === memberId);
      setMemberForWorkLog(member);
      
      // Try to parse the time to format suitable for time input (HH:mm)
      let defaultStart = member?.checkInTime || '';
      try {
        if (defaultStart.includes(' ')) {
          // It's like "10:30 AM"
          const [time, modifier] = defaultStart.split(' ');
          let [hours, minutes] = time.split(':');
          if (hours === '12') hours = '00';
          if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
          defaultStart = `${hours.padStart(2, '0')}:${minutes}`;
        }
      } catch (e) {}

      let defaultEnd = timeString;
      try {
         if (defaultEnd.includes(' ')) {
          // It's like "10:30 AM"
          const [time, modifier] = defaultEnd.split(' ');
          let [hours, minutes] = time.split(':');
          if (hours === '12') hours = '00';
          if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
          defaultEnd = `${hours.padStart(2, '0')}:${minutes}`;
        }
      } catch (e) {}

      setNewWorkLog({ startTime: defaultStart, endTime: defaultEnd, description: '' });
      setIsWorkLogModalOpen(true);
    } else {
      setTeamMembers(members => members.map(m => {
        if (m.id === memberId) {
          return { ...m, attendanceStatus: 'checked-in', checkInTime: timeString, checkOutTime: undefined };
        }
        return m;
      }));
    }
  };

  const submitWorkLog = () => {
    if (!memberForWorkLog) return;
    
    setTeamMembers(members => members.map(m => {
      if (m.id === memberForWorkLog.id) {
        const newLog = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          startTime: newWorkLog.startTime,
          endTime: newWorkLog.endTime,
          description: newWorkLog.description
        };
        
        // Convert back to 12-hour format if needed for display, or just keep as is
        let displayEnd = newWorkLog.endTime;
        try {
          const [h, min] = newWorkLog.endTime.split(':');
          const hr = parseInt(h);
          const ampm = hr >= 12 ? 'PM' : 'AM';
          const hr12 = hr % 12 || 12;
          displayEnd = `${hr12}:${min} ${ampm}`;
        } catch (e) {}
        
        return {
          ...m,
          attendanceStatus: 'checked-out',
          checkOutTime: displayEnd,
          workLogs: [...(m.workLogs || []), newLog]
        };
      }
      return m;
    }));
    
    setIsWorkLogModalOpen(false);
    setMemberForWorkLog(null);
  };


  const getAccessColor = (level: string) => {
    switch (level) {
      case 'Administrator': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Project Manager': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Editor': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Viewer': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Finance': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'text-[#0ED7A8]';
      case 'Intern': return 'text-amber-400';
      case 'Contractor': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const openAccessModal = (member: any) => {
    setSelectedMember(member);
    const matchedRole = availableRoles.find(r => r.name === member.accessLevel);
    setSelectedRole(matchedRole ? matchedRole.id : 'viewer');
    setIsAccessModalOpen(true);
  };

  const saveAccessLevel = () => {
    if (selectedMember) {
      const roleName = availableRoles.find(r => r.id === selectedRole)?.name || 'Viewer';
      setTeamMembers(members => 
        members.map(m => m.id === selectedMember.id ? { ...m, accessLevel: roleName } : m)
      );
      setIsAccessModalOpen(false);
    }
  };

  const toggleSalaryVisibility = (id: string) => {
    setVisibleSalaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const idPrefix = newMember.type === 'Intern' ? 'INT' : newMember.type === 'Contractor' ? 'PRJ' : 'EMP';
    const newId = `${idPrefix}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const memberToAdd = {
      id: newId,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      department: newMember.department,
      type: newMember.type,
      compensation: {
        amount: Number(newMember.compensationAmount) || 0,
        period: newMember.compensationPeriod,
        currency: '$'
      },
      accessLevel: newMember.accessLevel,
      status: 'Active',
      attendanceStatus: 'absent' as const
    };

    setTeamMembers([...teamMembers, memberToAdd]);
    setIsAddMemberModalOpen(false);
    setNewMember({
      name: '',
      email: '',
      role: '',
      department: '',
      type: 'Full-time',
      compensationAmount: '',
      compensationPeriod: 'Monthly',
      accessLevel: 'Viewer'
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">HR & Team Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage employees, interns, salaries, and access roles.</p>
        </div>
        <button className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-[#0ED7A8]">
              <UserCog className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">47</div>
          <div className="text-sm text-slate-400">Total Team Members</div>
          <div className="text-xs text-slate-500 mt-2">20 Full-time • 15 Interns • 12 Freelancers</div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">$84,500</div>
          <div className="text-sm text-slate-400">Monthly Payroll Estimate</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">Includes stipends & contracts</div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-800/50 rounded-lg text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">5</div>
          <div className="text-sm text-slate-400">Admin Access Accounts</div>
          <div className="text-xs text-slate-500 mt-2">Highly privileged users</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px w-full sm:w-auto overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setViewMode('directory')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'directory' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Directory
          </button>
          <button
            onClick={() => setViewMode('leave')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'leave' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Leave & Time Off
          </button>
          <button
            onClick={() => setViewMode('logs')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'logs' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Work Logs
          </button>
          <button
            onClick={() => setViewMode('recruitment')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'recruitment' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recruitment
          </button>
          <button
            onClick={() => setViewMode('performance')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'performance' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Performance Reviews
          </button>
          <button
            onClick={() => setViewMode('onboarding')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'onboarding' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Onboarding
          </button>
          <button
            onClick={() => setViewMode('skills')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'skills' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Skill Matrix
          </button>
          <button
            onClick={() => setViewMode('roles')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'roles' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Roles & Permissions
          </button>
        </div>
      </div>

      {viewMode === 'directory' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px w-full sm:w-auto overflow-x-auto custom-scrollbar">
              {['all', 'Full-time', 'Intern', 'Contractor'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    filterType === tab 
                      ? 'border-slate-400 text-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search team..." 
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
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium">Role & Dept</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Compensation</th>
                    <th className="p-4 font-medium">Attendance</th>
                    <th className="p-4 font-medium">Access Level</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {teamMembers
                    .filter(member => filterType === 'all' || member.type === filterType)
                    .map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium border border-slate-600">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-xs text-slate-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{member.role}</div>
                    <div className="text-xs text-slate-400">{member.department}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getTypeColor(member.type)}`}>
                      {member.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white font-mono">
                          {visibleSalaries.has(member.id) 
                            ? `${member.compensation.currency}${member.compensation.amount.toLocaleString()}`
                            : '••••••••'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {member.compensation.period}
                        </span>
                      </div>
                      <button 
                        onClick={() => toggleSalaryVisibility(member.id)}
                        className="p-1.5 text-slate-400 hover:text-[#0ED7A8] transition-colors rounded-lg hover:bg-slate-800"
                        title={visibleSalaries.has(member.id) ? "Hide Compensation" : "Show Compensation"}
                      >
                        {visibleSalaries.has(member.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col min-w-[80px]">
                        <div className="flex items-center gap-1.5">
                          {member.attendanceStatus === 'checked-in' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0ED7A8]" />
                          ) : member.attendanceStatus === 'checked-out' ? (
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span className={`text-xs font-medium ${
                            member.attendanceStatus === 'checked-in' ? 'text-[#0ED7A8]' :
                            member.attendanceStatus === 'checked-out' ? 'text-slate-300' : 'text-rose-400'
                          }`}>
                            {member.attendanceStatus === 'checked-in' ? 'Checked In' :
                             member.attendanceStatus === 'checked-out' ? 'Checked Out' : 'Absent'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {member.attendanceStatus === 'checked-in' ? `In: ${member.checkInTime}` :
                           member.attendanceStatus === 'checked-out' ? `Out: ${member.checkOutTime}` : '-'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAttendanceToggle(member.id, member.attendanceStatus)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          member.attendanceStatus === 'checked-in'
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-[#0ED7A8]/10 text-[#0ED7A8] hover:bg-[#0ED7A8]/20'
                        }`}
                      >
                        {member.attendanceStatus === 'checked-in' ? 'Check Out' : 'Check In'}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getAccessColor(member.accessLevel)}`}>
                      {member.accessLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openAccessModal(member)}
                        className="p-2 text-slate-400 hover:text-[#0ED7A8] transition-colors rounded-lg hover:bg-slate-800 flex items-center gap-1"
                        title="Manage Access"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline-block">Access</span>
                      </button>
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
        </>
      )}

      {viewMode === 'leave' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#1E2D40] p-4 rounded-xl border border-slate-700/50 shadow-sm">
            <h3 className="text-lg font-semibold text-white">Leave Requests & Time Off</h3>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Log Leave
            </button>
          </div>
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium">Reason</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {leaveRequests.map(leave => (
                    <tr key={leave.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{leave.employee}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">{leave.type}</td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{leave.startDate} to {leave.endDate}</div>
                        <div className="text-xs text-slate-500">{leave.days} day(s)</div>
                      </td>
                      <td className="p-4 text-sm text-slate-400 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                          leave.status === 'Approved' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                          leave.status === 'Rejected' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' :
                          'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => setLeaveRequests(reqs => reqs.map(r => r.id === leave.id ? { ...r, status: 'Approved' } : r))} className="p-1 text-slate-400 hover:text-emerald-400" title="Approve">
                               <CheckCircle2 className="w-5 h-5" />
                             </button>
                             <button onClick={() => setLeaveRequests(reqs => reqs.map(r => r.id === leave.id ? { ...r, status: 'Rejected' } : r))} className="p-1 text-slate-400 hover:text-rose-400" title="Reject">
                               <XCircle className="w-5 h-5" />
                             </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 uppercase tracking-wider">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'logs' && (
        <div className="space-y-6">
          <div className="bg-[#1E2D40] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Submitted Work Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/50">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {teamMembers.flatMap(m => (m.workLogs || []).map(log => {
                    let totalHours = '';
                    try {
                      // simple duration calc
                      const parseH = (t: string) => {
                        let [h, m] = t.split(':');
                        if(t.toLowerCase().includes('pm') && h !== '12') h = String(parseInt(h) + 12);
                        if(t.toLowerCase().includes('am') && h === '12') h = '0';
                        return parseInt(h) + parseInt(m)/60;
                      }
                      const diff = parseH(log.endTime) - parseH(log.startTime);
                      if(diff && !isNaN(diff)) {
                        totalHours = (diff < 0 ? diff + 24 : diff).toFixed(2) + 'h';
                      }
                    } catch(e) {}
                    return (
                      <tr key={`${log.id}`} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.role}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{log.date}</td>
                        <td className="p-4 text-sm text-slate-300">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {log.startTime} - {log.endTime}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-[#0ED7A8]">{totalHours}</td>
                        <td className="p-4 text-sm text-slate-400">
                          <p className="max-w-md break-words">{log.description}</p>
                        </td>
                      </tr>
                    )
                  })).sort((a: any, b: any) => 
                     // rough secondary sort by id since date/time exists on it 
                     b.key?.localeCompare(a.key)
                  )}
                  {teamMembers.every(m => !m.workLogs?.length) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                        No work logs submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'recruitment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Candidates & Recruitment</h3>
              <p className="text-sm text-slate-400 mt-1">Manage pipeline for open positions</p>
            </div>
            <button 
              onClick={() => setIsCandidateModalOpen(true)}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
          <div className="bg-[#1E2D40] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/50">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied Role</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {candidates.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-white">{candidate.name}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {candidate.role}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                          candidate.status === 'Offer Extended' 
                            ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400'
                            : candidate.status === 'Interviewing'
                            ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                            : 'bg-blue-400/10 border border-blue-400/20 text-blue-400'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} className={`w-4 h-4 ${star <= candidate.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                        No candidates in the pipeline.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'performance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Performance Reviews</h3>
              <p className="text-sm text-slate-400 mt-1">Track employee KPIs and feedback</p>
            </div>
            <button className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Start Review Cycle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-[#1E2D40] rounded-xl border border-slate-700/50 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                     {member.name.charAt(0)}
                   </div>
                   <div>
                     <h4 className="font-semibold text-white">{member.name}</h4>
                     <p className="text-xs text-slate-400">{member.role}</p>
                   </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Task Completion Rate</span>
                      <span className="text-emerald-400 font-medium">{Math.floor(Math.random() * 20 + 80)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0ED7A8]" style={{ width: `${Math.floor(Math.random() * 20 + 80)}%` }}></div>
                    </div>
                  </div>
                   <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Goals Met</span>
                      <span className="text-blue-400 font-medium">{Math.floor(Math.random() * 10 + 90)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.floor(Math.random() * 10 + 90)}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Last review: {Math.floor(Math.random() * 3) + 1} months ago</span>
                  <button className="text-xs font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 transition-colors">View History</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'onboarding' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Employee Onboarding</h3>
              <p className="text-sm text-slate-400 mt-1">Track onboarding checklists for new hires</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-[#1E2D40] rounded-xl border border-slate-700/50 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <h4 className="font-semibold text-white">{i === 1 ? 'Alex Mercer' : 'Sarah Connor'}</h4>
                     <p className="text-xs text-slate-400">{i === 1 ? 'Frontend Engineer' : 'UX Designer'}</p>
                   </div>
                   <span className="text-xs font-medium bg-amber-400/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-400/20">
                     In Progress
                   </span>
                </div>
                
                <div className="space-y-3 mt-4">
                   <label className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors">
                     <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-[#0ED7A8] focus:ring-0 focus:ring-offset-0" />
                     <span className="text-sm text-slate-300">Account Setup & Access</span>
                   </label>
                   <label className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors">
                     <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-[#0ED7A8] focus:ring-0 focus:ring-offset-0" />
                     <span className="text-sm text-slate-300">Welcome Orientation</span>
                   </label>
                   <label className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-[#0ED7A8] focus:ring-0 focus:ring-offset-0" />
                     <span className="text-sm text-slate-300">Meet the Team</span>
                   </label>
                   <label className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-[#0ED7A8] focus:ring-0 focus:ring-offset-0" />
                     <span className="text-sm text-slate-300">First Project Assignment</span>
                   </label>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0ED7A8] h-full transition-all" style={{ width: '50%' }}></div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 ml-4 whitespace-nowrap">50%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'skills' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Team Skill Matrix
                <button 
                  onClick={handleAIAnalyzeSkillGaps}
                  disabled={isAnalyzingGaps}
                  className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border ${
                    isAnalyzingGaps 
                      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 opacity-70 cursor-not-allowed'
                      : 'text-purple-400 hover:text-white hover:bg-purple-500/10 border-purple-500/20'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingGaps ? 'animate-pulse' : ''}`} />
                  AI Check Skill Gaps
                </button>
              </h3>
              <p className="text-sm text-slate-400 mt-1">Track employee certifications and technical skills</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search skills..." 
                  value={skillsSearchTerm}
                  onChange={(e) => setSkillsSearchTerm(e.target.value)}
                  className="bg-[#1E2D40] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all w-48 lg:w-64"
                />
              </div>
            </div>
          </div>

          {skillGapAnalysis && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl relative">
              <button 
                onClick={() => setSkillGapAnalysis(null)}
                className="absolute top-2 right-2 p-1 text-purple-400/50 hover:text-purple-400"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Skill Gap Analysis
              </h3>
              <p className="text-sm text-slate-300 mb-4">{skillGapAnalysis.analysis}</p>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                {skillGapAnalysis.recommendations.map((rec, i) => (
                   <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.filter(member => {
              if (!skillsSearchTerm) return true;
              const term = skillsSearchTerm.toLowerCase();
              return member.name.toLowerCase().includes(term) ||
                     (member.skills && member.skills.some(s => s.name.toLowerCase().includes(term) || s.level.toLowerCase().includes(term))) ||
                     (member.certifications && member.certifications.some(c => c.toLowerCase().includes(term)));
            }).map((member) => (
              <div key={member.id} className="bg-[#1E2D40] rounded-xl border border-slate-700/50 p-5 shadow-sm hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold border border-slate-600 shrink-0">
                     {member.name.charAt(0)}
                   </div>
                   <div className="min-w-0">
                     <h4 className="font-semibold text-white truncate">{member.name}</h4>
                     <p className="text-xs text-slate-400 truncate">{member.role}</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                  {/* Technical Skills */}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills && member.skills.length > 0 ? (
                        member.skills.map((skill, index) => {
                          const isExpert = skill.level === 'Expert';
                          const isIntermediate = skill.level === 'Intermediate';
                          const bg = isExpert ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 
                                     isIntermediate ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                     'bg-slate-800 text-slate-300 border-slate-700';
                          return (
                            <span key={`${skill.name}-${index}`} className={`px-2 py-0.5 border rounded flex items-center gap-1.5 text-xs font-medium ${bg}`}>
                              <span>{skill.name}</span>
                              <span className="opacity-60 text-[9px] uppercase tracking-wider">{skill.level}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-500 italic">No skills listed</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Certifications */}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Certifications</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {member.certifications && member.certifications.length > 0 ? (
                        member.certifications.map(cert => (
                          <span key={cert} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium">
                            {cert}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No certifications listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#1E2D40] p-4 rounded-xl border border-slate-700/50 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-white">Roles & Permissions</h3>
              <p className="text-sm text-slate-400 mt-1">Manage system access levels and custom roles.</p>
            </div>
            <button 
              onClick={() => {
                setEditingRole({ id: `role-${Date.now()}`, name: '', description: '', permissions: [] });
                setIsRoleModalOpen(true);
              }}
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Role
            </button>
          </div>
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                    <th className="p-4 font-medium">Role Name</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">System Role</th>
                    <th className="p-4 font-medium">Users</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {availableRoles.map(role => {
                     const membersCount = teamMembers.filter(m => m.accessLevel === role.name || (role.isCustom && m.accessLevel === role.name)).length;
                     return (
                      <tr key={role.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-white">{role.name}</td>
                        <td className="p-4 text-sm text-slate-400">{role.description}</td>
                        <td className="p-4">
                          {role.isCustom ? (
                             <span className="px-2 py-1 text-xs rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Custom</span>
                          ) : (
                             <span className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">System Default</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium text-white bg-slate-800 px-2.5 py-1 rounded-full">{membersCount}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                             <button
                               onClick={() => {
                                 setEditingRole({
                                   id: role.id,
                                   name: role.name,
                                   description: role.description,
                                   permissions: rolePermissions[role.id] || []
                                 });
                                 setIsRoleModalOpen(true);
                               }}
                               className="p-1.5 text-slate-400 hover:text-white transition-colors"
                               title="Edit Role"
                             >
                                <Edit2 className="w-4 h-4" />
                             </button>
                             {role.isCustom && (
                               <button
                                 onClick={() => handleRoleDelete(role.id)}
                                 className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                                 title="Delete Role"
                                 disabled={membersCount > 0}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && editingRole && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">{availableRoles.find(r => r.id === editingRole.id) ? 'Edit Role' : 'Create Custom Role'}</h2>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="roleForm" onSubmit={handleSaveRole} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Role Name</label>
                    <input 
                      required
                      type="text" 
                      value={editingRole.name}
                      disabled={!availableRoles.find(r => r.id === editingRole.id)?.isCustom && availableRoles.find(r => r.id === editingRole.id) !== undefined}
                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white disabled:opacity-50"
                      placeholder="e.g. Marketing Lead"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <input 
                      required
                      type="text" 
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                      placeholder="Brief description of the role responsibilities"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm border-b border-slate-700/50 pb-2 font-medium text-slate-300">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {permissionCategories.map(category => (
                        <div key={category.name} className="space-y-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                           <h4 className="text-sm font-medium text-white">{category.name}</h4>
                           <div className="space-y-2">
                             {category.permissions.map(permission => {
                               const isChecked = editingRole.permissions.includes(permission.id);
                               // Non custom roles (admin) logic could be locked
                               const isSystemAdmin = availableRoles.find(r => r.id === editingRole.id)?.id === 'admin';
                               return (
                                 <label key={permission.id} className="flex items-center gap-3 cursor-pointer group">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                     isChecked ? 'bg-[#0ED7A8] border-[#0ED7A8]' : 'border-slate-500 group-hover:border-[#0ED7A8]'
                                   } ${isSystemAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isChecked && <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                   </div>
                                   <input 
                                     type="checkbox"
                                     className="hidden"
                                     checked={isChecked}
                                     disabled={isSystemAdmin}
                                     onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditingRole({...editingRole, permissions: [...editingRole.permissions, permission.id]});
                                        } else {
                                          setEditingRole({...editingRole, permissions: editingRole.permissions.filter(p => p !== permission.id)});
                                        }
                                     }}
                                   />
                                   <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{permission.name}</span>
                                 </label>
                               )
                             })}
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-700/50 flex justify-end gap-3 shrink-0">
               <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm">Cancel</button>
               <button type="submit" form="roleForm" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                 Save Role
               </button>
            </div>
          </div>
         </div>
      )}

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsLeaveModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Log Time Off</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const ds = new Date(newLeave.startDate);
              const de = new Date(newLeave.endDate);
              const days = Math.max(1, Math.ceil((de.getTime() - ds.getTime()) / (1000 * 3600 * 24)) + 1);
              setLeaveRequests([{ ...newLeave, id: Date.now(), status: 'Pending', days }, ...leaveRequests]);
              setIsLeaveModalOpen(false);
            }} className="space-y-4">
               <div>
                  <label className="text-sm text-slate-400">Employee Name</label>
                  <input required type="text" value={newLeave.employee} onChange={e => setNewLeave({...newLeave, employee: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
               </div>
               <div>
                  <label className="text-sm text-slate-400">Leave Type</label>
                  <select value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                     <option>Vacation</option>
                     <option>Sick Leave</option>
                     <option>Unpaid</option>
                     <option>Maternity/Paternity</option>
                  </select>
               </div>
               <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-slate-400">Start Date</label>
                    <input required type="date" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white [color-scheme:dark]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-slate-400">End Date</label>
                    <input required type="date" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white [color-scheme:dark]" />
                  </div>
               </div>
               <div>
                  <label className="text-sm text-slate-400">Reason</label>
                  <textarea required rows={2} value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
               </div>
               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                 <button type="submit" className="px-5 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg font-medium">Submit</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Log Modal */}
      {isWorkLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsWorkLogModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Log Work Hours</h2>
            <p className="text-sm text-slate-400 mb-6">Checking out for {memberForWorkLog?.name}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              submitWorkLog();
            }}>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Start Time</label>
                      <input required type="time" value={newWorkLog.startTime} onChange={e => setNewWorkLog({...newWorkLog, startTime: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white [color-scheme:dark] focus:outline-none focus:border-[#0ED7A8]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">End Time</label>
                      <input required type="time" value={newWorkLog.endTime} onChange={e => setNewWorkLog({...newWorkLog, endTime: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white [color-scheme:dark] focus:outline-none focus:border-[#0ED7A8]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Description of Work</label>
                    <textarea required rows={3} placeholder="What did you work on today?" value={newWorkLog.description} onChange={e => setNewWorkLog({...newWorkLog, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsWorkLogModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg font-medium">Log Hours & Check Out</button>
                </div>
             </form>
           </div>
         </div>
       )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddMemberModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Add Team Member</h2>
                <p className="text-sm text-slate-400 mt-1">Add a new employee, intern, or contractor to the system.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="john@bongodemy.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Job Role</label>
                    <input 
                      required
                      type="text" 
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. Security Analyst"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Department</label>
                    <input 
                      required
                      type="text" 
                      value={newMember.department}
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. Cybersecurity"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Employment Type</label>
                    <select 
                      value={newMember.type}
                      onChange={(e) => setNewMember({...newMember, type: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Intern">Intern</option>
                      <option value="Contractor">Contractor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">System Access Level</label>
                    <select 
                      value={newMember.accessLevel}
                      onChange={(e) => setNewMember({...newMember, accessLevel: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      {availableRoles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Compensation Amount ($)</label>
                    <input 
                      required
                      type="number" 
                      value={newMember.compensationAmount}
                      onChange={(e) => setNewMember({...newMember, compensationAmount: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Compensation Period</label>
                    <select 
                      value={newMember.compensationPeriod}
                      onChange={(e) => setNewMember({...newMember, compensationPeriod: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Management Modal */}
      {isAccessModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAccessModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Manage Access Level</h2>
                <p className="text-sm text-slate-400 mt-1">Assign a role to {selectedMember.name}</p>
              </div>
              <button 
                onClick={() => setIsAccessModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">System Role</label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label 
                      key={role.id} 
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRole === role.id 
                          ? 'bg-[#0ED7A8]/10 border-[#0ED7A8]/50' 
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedRole === role.id ? 'border-[#0ED7A8]' : 'border-slate-500'
                        }`}>
                          {selectedRole === role.id && <div className="w-2 h-2 rounded-full bg-[#0ED7A8]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${selectedRole === role.id ? 'text-[#0ED7A8]' : 'text-white'}`}>
                            {role.name}
                          </span>
                          <span className="text-xs text-slate-500">{role.isCustom ? 'Custom Role' : 'System Default'}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mt-4 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To configure granular permissions for each role, navigate to 
                    <span className="text-white font-medium mx-1">Settings &gt; Roles & Permissions</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsAccessModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveAccessLevel}
                className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCandidateModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Add Candidate</h2>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Candidate Name</label>
                <input required type="text" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Applied Role</label>
                <input required type="text" value={newCandidate.role} onChange={e => setNewCandidate({...newCandidate, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <select value={newCandidate.status} onChange={e => setNewCandidate({...newCandidate, status: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white">
                  <option>Screening</option>
                  <option>Interviewing</option>
                  <option>Offer Extended</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCandidateModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

