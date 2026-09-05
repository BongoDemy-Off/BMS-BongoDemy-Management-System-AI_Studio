import React, { useState } from 'react';
import { User, Bell, Shield, Key, Globe, CreditCard, Building, ShieldCheck, Check, X, Plus, Save } from 'lucide-react';
import { useAppContext, permissionCategories } from '../context/AppContext';

export function Settings() {
  const { roles, setRoles, rolePermissions, setRolePermissions, userPreferences, setUserPreferences, addNotification } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Roles state
  const [selectedRole, setSelectedRole] = useState('manager');
  
  // Editing state for custom roles
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingRoleDesc, setEditingRoleDesc] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@bongodemy.com',
    role: 'Administrator'
  });

  // Company state
  const [company, setCompany] = useState({
    name: 'BongoDemy',
    website: 'https://bongodemy.com',
    address: '123 Tech Lane, Silicon Valley, CA',
    taxId: 'US-123456789'
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    securityAlerts: true
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'dark'
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 'key_1', name: 'Production API Key', key: 'pk_live_********************', created: '2024-01-15', lastUsed: '2024-03-20' },
    { id: 'key_2', name: 'Development API Key', key: 'pk_test_********************', created: '2024-02-01', lastUsed: '2024-03-21' }
  ]);

  // Billing state
  const [billing, setBilling] = useState({
    plan: 'Pro',
    status: 'Active',
    nextBilling: '2024-04-15',
    amount: '$49.00'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'company', name: 'Company Details', icon: Building },
    { id: 'roles', name: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'preferences', name: 'Preferences', icon: Globe },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  const handleCreateRole = () => {
    const newRoleId = `custom_${Date.now()}`;
    const newRole = {
      id: newRoleId,
      name: 'New Custom Role',
      description: 'A custom role with specific permissions.',
      isCustom: true
    };
    setRoles([...roles, newRole]);
    setRolePermissions({ ...rolePermissions, [newRoleId]: [] });
    setSelectedRole(newRoleId);
    setEditingRoleName(newRole.name);
    setEditingRoleDesc(newRole.description);
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setEditingRoleName(role.name);
      setEditingRoleDesc(role.description);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (selectedRole === 'admin') return; // Admin permissions cannot be changed
    
    setRolePermissions(prev => {
      const currentPerms = prev[selectedRole] || [];
      const newPerms = currentPerms.includes(permissionId)
        ? currentPerms.filter(id => id !== permissionId)
        : [...currentPerms, permissionId];
      
      return { ...prev, [selectedRole]: newPerms };
    });
  };

  const saveRoleDetails = () => {
    setRoles(prev => prev.map(r => 
      r.id === selectedRole && r.isCustom 
        ? { ...r, name: editingRoleName, description: editingRoleDesc } 
        : r
    ));
    addNotification({ type: 'success', message: 'Role details saved effectively' });
  };

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account and system preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 border-b border-slate-700/50 lg:border-b-0 pb-4 lg:pb-0 mb-2 lg:mb-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 w-auto lg:w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0ED7A8]/10 text-[#0ED7A8]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6 min-w-0 px-1 sm:px-0">
          {activeTab === 'profile' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                <p className="text-sm text-slate-400 mt-1">Update your account's profile information and email address.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-[#0ED7A8] border-2 border-slate-700">
                    A
                  </div>
                  <div>
                    <button onClick={() => addNotification({ type: 'info', message: 'Avatar upload coming soon.' })} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <input 
                      type="text" 
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <input 
                      type="text" 
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Role</label>
                    <input 
                      type="text" 
                      value={profile.role}
                      disabled
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
                <button onClick={() => addNotification({ type: 'success', message: 'Profile updated successfully' })} className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-auto lg:h-[calc(100vh-12rem)] md:min-h-[600px] min-h-[500px]">
              <div className="p-4 sm:p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Roles & Permissions</h2>
                  <p className="text-sm text-slate-400 mt-1">Configure granular access levels for your team members.</p>
                </div>
                <button 
                  onClick={handleCreateRole}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Role
                </button>
              </div>
              
              <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
                {/* Roles List */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700/50 overflow-y-auto custom-scrollbar bg-slate-800/20 max-h-[250px] lg:max-h-none flex-shrink-0">
                  <div className="p-4 flex flex-row lg:flex-col gap-3 lg:gap-2 overflow-x-auto custom-scrollbar">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`text-left p-4 rounded-xl border transition-all flex-shrink-0 w-[240px] lg:w-full ${
                          selectedRole === role.id
                            ? 'bg-[#0ED7A8]/10 border-[#0ED7A8]/50'
                            : 'bg-[#1E2D40] border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={`font-medium ${selectedRole === role.id ? 'text-[#0ED7A8]' : 'text-white'}`}>
                            {role.name}
                          </div>
                          {role.isCustom && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">Custom</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2">
                          {role.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                  {currentRole?.isCustom ? (
                    <div className="mb-8 space-y-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Role Name</label>
                        <input 
                          type="text" 
                          value={editingRoleName}
                          onChange={(e) => setEditingRoleName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <input 
                          type="text" 
                          value={editingRoleDesc}
                          onChange={(e) => setEditingRoleDesc(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                        />
                      </div>
                      <button 
                        onClick={saveRoleDetails}
                        className="text-sm font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" /> Save Role Details
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Permissions for {currentRole?.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Select what users with this role can view and modify.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {permissionCategories.map((category) => (
                      <div key={category.name}>
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-700/50">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {category.permissions.map((permission) => {
                            const isGranted = rolePermissions[selectedRole]?.includes(permission.id);
                            const isAdmin = selectedRole === 'admin';
                            
                            return (
                              <label 
                                key={permission.id} 
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                  isGranted 
                                    ? 'bg-slate-800/50 border-slate-600' 
                                    : 'bg-transparent border-slate-700/50 hover:border-slate-600'
                                } ${isAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}
                              >
                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isGranted 
                                    ? 'bg-[#0ED7A8] border-[#0ED7A8] text-slate-900' 
                                    : 'border-slate-600 bg-slate-800'
                                }`}>
                                  {isGranted && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className={`text-sm font-medium ${isGranted ? 'text-white' : 'text-slate-400'}`}>
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {isGranted ? 'Access granted' : 'No access'}
                                  </div>
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={isGranted}
                                  disabled={isAdmin}
                                  onChange={() => togglePermission(permission.id)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button onClick={() => addNotification({ type: 'info', message: 'Defaults applied' })} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Reset Defaults
                </button>
                <button 
                  onClick={() => addNotification({ type: 'success', message: 'Permissions saved successfully' })}
                  className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Company Details</h2>
                <p className="text-sm text-slate-400 mt-1">Update your company's information and billing details.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Company Name</label>
                    <input 
                      type="text" 
                      value={company.name}
                      onChange={(e) => setCompany({...company, name: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Website</label>
                    <input 
                      type="url" 
                      value={company.website}
                      onChange={(e) => setCompany({...company, website: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Address</label>
                    <input 
                      type="text" 
                      value={company.address}
                      onChange={(e) => setCompany({...company, address: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Tax ID / VAT Number</label>
                    <input 
                      type="text" 
                      value={company.taxId}
                      onChange={(e) => setCompany({...company, taxId: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
                <button onClick={() => addNotification({ type: 'success', message: 'Company details updated successfully' })} className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                <p className="text-sm text-slate-400 mt-1">Choose how you want to be notified about activity.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">Email Alerts</div>
                      <div className="text-xs text-slate-400 mt-0.5">Receive notifications via email.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${notifications.emailAlerts ? 'bg-[#0ED7A8]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={notifications.emailAlerts} onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">Push Notifications</div>
                      <div className="text-xs text-slate-400 mt-0.5">Receive notifications in your browser.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${notifications.pushNotifications ? 'bg-[#0ED7A8]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={notifications.pushNotifications} onChange={() => setNotifications({...notifications, pushNotifications: !notifications.pushNotifications})} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">Weekly Reports</div>
                      <div className="text-xs text-slate-400 mt-0.5">Receive a weekly summary of activity.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${notifications.weeklyReports ? 'bg-[#0ED7A8]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={notifications.weeklyReports} onChange={() => setNotifications({...notifications, weeklyReports: !notifications.weeklyReports})} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">Security Alerts</div>
                      <div className="text-xs text-slate-400 mt-0.5">Get notified about important security events.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${notifications.securityAlerts ? 'bg-[#0ED7A8]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications.securityAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={notifications.securityAlerts} onChange={() => setNotifications({...notifications, securityAlerts: !notifications.securityAlerts})} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Security Settings</h2>
                <p className="text-sm text-slate-400 mt-1">Manage your password and security preferences.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                    <div>
                      <div className="text-sm font-medium text-white">Password</div>
                      <div className="text-xs text-slate-400 mt-0.5">Last changed 3 months ago.</div>
                    </div>
                    <button onClick={() => addNotification({ type: 'success', message: 'Password reset instructions sent to your email.' })} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      Change Password
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">Two-Factor Authentication (2FA)</div>
                      <div className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${security.twoFactor ? 'bg-[#0ED7A8]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${security.twoFactor ? 'translate-x-5' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={security.twoFactor} onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})} />
                    </div>
                  </label>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Session Timeout (minutes)</label>
                    <select 
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">API Keys</h2>
                  <p className="text-sm text-slate-400 mt-1">Manage API keys for external integrations.</p>
                </div>
                <button onClick={() => addNotification({ type: 'success', message: 'New API Key generated successfully!' })} className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Generate Key
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {apiKeys.map(key => (
                    <div key={key.id} className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-white">{key.name}</div>
                        <div className="text-xs text-slate-400 mt-1 font-mono bg-slate-900 px-2 py-1 rounded inline-block">{key.key}</div>
                        <div className="text-xs text-slate-500 mt-2">Created: {key.created} • Last used: {key.lastUsed}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addNotification({ type: 'info', message: `API Key ${key.name} revoked.` })} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-700">
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Preferences</h2>
                <p className="text-sm text-slate-400 mt-1">Customize your system experience.</p>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Task Management</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Default Task View</label>
                      <select 
                        value={userPreferences.defaultTaskView}
                        onChange={(e) => setUserPreferences({...userPreferences, defaultTaskView: e.target.value as any})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="list">List View</option>
                        <option value="kanban">Kanban Board</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Default Sort</label>
                      <select 
                        value={userPreferences.defaultTaskSort}
                        onChange={(e) => setUserPreferences({...userPreferences, defaultTaskSort: e.target.value as any})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="none">No Sort</option>
                        <option value="desc">Priority (High to Low)</option>
                        <option value="asc">Priority (Low to High)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Localization & Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Language</label>
                      <select 
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Timezone</label>
                      <select 
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="CET">Central European Time (CET)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Date Format</label>
                      <select 
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Theme</label>
                      <select 
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
                <button 
                  onClick={() => addNotification({ type: 'success', message: 'Preferences saved successfully' })}
                  className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Billing & Subscription</h2>
                <p className="text-sm text-slate-400 mt-1">Manage your subscription plan and payment methods.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-6 rounded-xl border border-[#0ED7A8]/30 bg-[#0ED7A8]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0ED7A8]/20 text-[#0ED7A8]">Active</span>
                    </div>
                    <p className="text-sm text-slate-400">Your next billing date is {billing.nextBilling} for {billing.amount}.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => addNotification({ type: 'info', message: 'Plan cancellation requested. Support will contact you.' })} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      Cancel Plan
                    </button>
                    <button onClick={() => addNotification({ type: 'success', message: 'Redirecting to upgrade portal...' })} className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Upgrade
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Payment Method</h3>
                  <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-slate-700 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Visa ending in 4242</div>
                        <div className="text-xs text-slate-400">Expires 12/2025</div>
                      </div>
                    </div>
                    <button onClick={() => addNotification({ type: 'info', message: 'Payment method editing form coming soon.' })} className="text-sm font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80">
                      Edit
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Billing History</h3>
                  <div className="border border-slate-700/50 rounded-lg overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[500px]">
                      <thead className="bg-slate-800/50 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Amount</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        <tr>
                          <td className="px-4 py-3 text-slate-300">Mar 15, 2024</td>
                          <td className="px-4 py-3 text-slate-300">$49.00</td>
                          <td className="px-4 py-3"><span className="text-[#0ED7A8]">Paid</span></td>
                          <td className="px-4 py-3 text-right"><button onClick={() => addNotification({ type: 'info', message: 'Downloading invoice...' })} className="text-[#0ED7A8] hover:underline">Download</button></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-slate-300">Feb 15, 2024</td>
                          <td className="px-4 py-3 text-slate-300">$49.00</td>
                          <td className="px-4 py-3"><span className="text-[#0ED7A8]">Paid</span></td>
                          <td className="px-4 py-3 text-right"><button onClick={() => addNotification({ type: 'info', message: 'Downloading invoice...' })} className="text-[#0ED7A8] hover:underline">Download</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

