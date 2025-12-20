import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Users, Clock, AlertTriangle, 
  BarChart3, Settings, Zap, LayoutDashboard, 
  Search, Filter, Plus, MoreVertical, CheckCircle2,
  X, Trash2, Edit, User, ChevronDown, Brain, TrendingUp, 
  Bell, Shield, Database, Download, RefreshCw, Save, Loader2, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

// --- IMPORT CHATBOT ---
import ChatAssistant from './ChatAssistant'; 

const API_URL = "http://127.0.0.1:8000";

// --- MAIN APP SHELL ---
const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- GLOBAL STATE (Lifted Up for Persistence via Backend) ---
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Initial Data Fetch from Backend
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/api/staff`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStaff(data);
      setLoadingStaff(false);
    } catch (e) {
      console.error("Failed to load staff from backend", e);
      // Fallback data if backend is offline
      setStaff([
        { id: 1, name: "Alice Johnson", role: "Sr. Reviewer", status: "Active", efficiency: 94, skills: ["Audit"], shift: "Morning" },
        { id: 2, name: "Bob Smith", role: "Intake Specialist", status: "Break", efficiency: 88, skills: ["Data Entry"], shift: "Evening" }
      ]);
      setLoadingStaff(false);
    }
  };

  // Global State for "What-If" Simulation
  const [simulationParams, setSimulationParams] = useState({
    intakeStaff: 5,
    reviewStaff: 3,
    spike: 10
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewDashboard simulationParams={simulationParams} setSimulationParams={setSimulationParams} />;
      case 'forecasting': return <ForecastingView />;
      // Pass staff, setStaff, and refresh function to Resource View
      case 'resources': return <ResourcePlanningView staff={staff} setStaff={setStaff} refreshStaff={fetchStaff} loading={loadingStaff} />;
      case 'settings': return <SettingsView params={simulationParams} setParams={setSimulationParams} />;
      default: return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dashboard-900 text-slate-100 font-sans selection:bg-brand-blue selection:text-white">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-dashboard-700 bg-dashboard-800 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-dashboard-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Appian Predict
          </h1>
          <p className="text-xs text-slate-400 mt-1">Ops Intelligence Unit</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<BarChart3 size={20} />} label="Forecasting" active={activeTab === 'forecasting'} onClick={() => setActiveTab('forecasting')} />
          <NavItem icon={<Users size={20} />} label="Resource Planning" active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} />
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-dashboard-700">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-sm font-bold border border-white/20">HD</div>
              <div>
                <p className="text-sm font-medium text-white">Hemang Dubey</p>
                <p className="text-xs text-slate-400">Lead Engineer</p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="h-16 border-b border-dashboard-700 flex items-center justify-between px-8 bg-dashboard-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="font-semibold text-lg text-slate-200 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE DATA FEED
            </span>
          </div>
        </header>
        
        <div className="p-8 pb-24">
          {renderContent()}
        </div>

        {/* --- HONEY AI CHATBOT --- */}
        <ChatAssistant />
      </main>
    </div>
  );
};

// --- 1. OVERVIEW DASHBOARD ---
const OverviewDashboard = ({ simulationParams, setSimulationParams }) => {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const statsRes = await fetch(`${API_URL}/api/current-stats`);
            const statsJson = await statsRes.json();
            setStats(statsJson);

            const graphRes = await fetch(`${API_URL}/api/forecast-graph`);
            const graphJson = await graphRes.json();
            const formattedGraph = graphJson.labels.map((label, index) => ({
                time: label,
                incoming: graphJson.incoming[index],
                capacity: graphJson.capacity[index]
            }));
            setGraphData(formattedGraph);
        } catch(e) { console.error("API Error:", e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = async () => {
    try {
      const payload = {
        staff_count_intake: simulationParams.intakeStaff,
        staff_count_review: simulationParams.reviewStaff,
        incoming_spike_percent: simulationParams.spike
      };
      const res = await fetch(`${API_URL}/api/run-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      setSimulationResult(result);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
       {/* KPI CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Active Backlog" value={stats?.active_cases || '...'} icon={<Activity className="text-brand-blue" />} trend="+12%" />
            <StatCard title="Avg. Handle Time" value={`${stats?.avg_completion_time || 0}m`} icon={<Clock className="text-purple-400" />} trend="-2%" />
            <StatCard title="SLA Risk Score" value={`${stats?.sla_risk_score || 0}%`} icon={<AlertTriangle className="text-amber-400" />} alert={stats?.sla_risk_score > 50} />
            <StatCard title="Efficiency" value={stats?.efficiency_trend || '...'} icon={<Zap className="text-green-400" />} trend="Up" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-dashboard-800 rounded-xl border border-dashboard-700 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Workload Forecast</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData}>
                    <defs>
                      <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="incoming" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncoming)" />
                    <Area type="monotone" dataKey="capacity" stroke="#10b981" strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-dashboard-800 rounded-xl border border-dashboard-700 p-6 shadow-xl flex flex-col">
               <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400"/> Quick Simulation</h3>
               <div className="space-y-6 flex-1">
                  <SliderControl label="Intake Staff" value={simulationParams.intakeStaff} setValue={(v) => setSimulationParams({...simulationParams, intakeStaff: v})} min={1} max={20} />
                  <SliderControl label="Review Staff" value={simulationParams.reviewStaff} setValue={(v) => setSimulationParams({...simulationParams, reviewStaff: v})} min={1} max={15} />
                  <SliderControl label="Vol. Spike (%)" value={simulationParams.spike} setValue={(v) => setSimulationParams({...simulationParams, spike: v})} min={0} max={100} color="accent" suffix="%" />
                  <button onClick={runSimulation} className="w-full py-3 bg-brand-blue hover:bg-blue-600 rounded-lg font-medium text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95">Run Prediction</button>
                  
                  {simulationResult && (
                     <div className={`p-4 rounded-lg border border-l-4 ${simulationResult.status_code === 'danger' ? 'bg-red-500/10 border-red-500' : simulationResult.status_code === 'warning' ? 'bg-amber-500/10 border-amber-500' : 'bg-green-500/10 border-green-500'}`}>
                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Risk Probability</span><span className="font-bold text-white">{simulationResult.projected_risk}%</span></div>
                        <p className="text-xs text-slate-400">{simulationResult.prediction_message}</p>
                     </div>
                  )}
               </div>
            </div>
       </div>
    </div>
  );
};

// --- 2. FORECASTING VIEW ---
const ForecastingView = () => {
    const [timeRange, setTimeRange] = useState('24h');

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = (new Date().getHours() + i) % 24;
        const base = hour > 9 && hour < 18 ? 150 : 40;
        const noise = Math.floor(Math.random() * 30);
        return {
            time: `${hour}:00`,
            Predicted: base + noise,
            ConfidenceUpper: base + noise + 20,
            ConfidenceLower: base + noise - 20,
        };
    });

    const dailyData = [
        { time: 'Mon', Predicted: 1200, ConfidenceUpper: 1350, ConfidenceLower: 1100 },
        { time: 'Tue', Predicted: 1400, ConfidenceUpper: 1550, ConfidenceLower: 1300 },
        { time: 'Wed', Predicted: 1100, ConfidenceUpper: 1250, ConfidenceLower: 1000 },
        { time: 'Thu', Predicted: 1600, ConfidenceUpper: 1800, ConfidenceLower: 1450 },
        { time: 'Fri', Predicted: 1500, ConfidenceUpper: 1650, ConfidenceLower: 1350 },
        { time: 'Sat', Predicted: 600, ConfidenceUpper: 700, ConfidenceLower: 500 },
        { time: 'Sun', Predicted: 400, ConfidenceUpper: 500, ConfidenceLower: 350 },
    ];

    const currentData = timeRange === '24h' ? hourlyData : dailyData;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-dashboard-800 p-4 rounded-xl border border-dashboard-700">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="text-brand-blue" size={24} /> Predictive Workload Analysis</h2>
                    <p className="text-slate-400 text-sm">AI-driven confidence intervals for resource planning</p>
                </div>
                <div className="flex bg-dashboard-900 rounded-lg p-1 border border-dashboard-700">
                    <button onClick={() => setTimeRange('24h')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === '24h' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Next 24H</button>
                    <button onClick={() => setTimeRange('7d')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === '7d' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Next 7 Days</button>
                </div>
            </div>
            <div className="bg-dashboard-800 p-6 rounded-xl border border-dashboard-700 shadow-xl">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentData}>
                            <defs>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                            <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                            <Area type="monotone" dataKey="ConfidenceUpper" stroke="transparent" fill="#6366f1" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="Predicted" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPredicted)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-dashboard-800 p-6 rounded-xl border border-dashboard-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Users size={18} className="text-purple-400"/> Staffing Heatmap</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="space-y-2">
                                <div className="text-xs text-center text-slate-500 font-bold">{day}</div>
                                {[1,2,3,4].map(block => {
                                    const intensity = Math.random();
                                    let colorClass = intensity > 0.85 ? "bg-red-500/20 text-red-400 border-red-500/30" : intensity > 0.6 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                                    return <div key={block} className={`h-12 rounded-lg border flex items-center justify-center text-xs font-bold ${colorClass}`}>{intensity > 0.85 ? 'High' : intensity > 0.6 ? 'Med' : 'Low'}</div>
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-dashboard-800 to-dashboard-900 p-6 rounded-xl border border-dashboard-700 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>Honey AI Findings</h3>
                    <div className="space-y-4 flex-1">
                        <div className="p-3 bg-dashboard-900/50 border border-dashboard-700 rounded-lg"><h4 className="text-xs font-bold text-brand-blue mb-1">PATTERN DETECTED</h4><p className="text-sm text-slate-300">Case volume spikes by <span className="text-white font-bold">45%</span> every Thursday.</p></div>
                        <div className="p-3 bg-dashboard-900/50 border border-dashboard-700 rounded-lg"><h4 className="text-xs font-bold text-amber-500 mb-1">RECOMMENDATION</h4><p className="text-sm text-slate-300">Shift 3 Intake Specialists to Review on <span className="text-white font-bold">Tuesday Mornings</span>.</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. RESOURCE PLANNING VIEW (CONNECTED TO BACKEND) ---
const ResourcePlanningView = ({ staff, setStaff, refreshStaff, loading }) => {
    
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: null, name: '', role: 'Intake Specialist', status: 'Active', efficiency: 75, skills: [], shift: 'Morning' });
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [recApplied, setRecApplied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const menuRef = useRef(null);

    // --- REAL-TIME AI LOGIC ---
    const morningCount = staff.filter(s => s.shift === 'Morning').length;
    const eveningCount = staff.filter(s => s.shift === 'Evening').length;
    
    const optimizationCandidate = staff
        .filter(s => s.shift === 'Morning' && s.status === 'Active')
        .sort((a, b) => a.efficiency - b.efficiency)[0];

    const isMorningOverstaffed = morningCount > (eveningCount + 1);

    const aiSuggestion = isMorningOverstaffed && optimizationCandidate
        ? {
            type: 'OPTIMIZATION',
            message: `Morning shift is unbalanced (${morningCount} vs ${eveningCount}). Move ${optimizationCandidate.name} to Evening?`,
            actionLabel: 'Balance Shifts',
            candidateId: optimizationCandidate.id,
            targetShift: 'Evening'
          }
        : {
            type: 'STABLE',
            message: 'Shift distribution is currently optimal based on predicted volume.',
            actionLabel: null
          };

    const activeStaffCount = staff.filter(s => s.status === 'Active').length;
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenuId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- SAVE TO BACKEND (CREATE / UPDATE) ---
    const handleSaveStaff = async () => {
        if (!formData.name.trim()) return;
        setIsSaving(true);
        
        const newSkills = formData.role === 'Sr. Reviewer' ? ["Audit"] : ["Data Entry"];
        const payload = { ...formData, skills: newSkills };

        try {
            if (modalMode === 'add') {
                // Backend Call: CREATE
                await fetch(`${API_URL}/api/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else if (modalMode === 'edit') {
                // Backend Call: UPDATE
                await fetch(`${API_URL}/api/staff/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            await refreshStaff(); // Reload data from backend to UI
            setIsModalOpen(false);
        } catch (e) {
            alert("Failed to save data to backend. Is uvicorn running?");
        } finally {
            setIsSaving(false);
        }
    };

    // --- DELETE FROM BACKEND ---
    const handleDeleteStaff = async (id) => {
        if(!confirm("Are you sure? This is permanent.")) return;
        try {
            await fetch(`${API_URL}/api/staff/${id}`, { method: 'DELETE' });
            await refreshStaff();
        } catch (e) { alert("Delete failed"); }
        setActiveMenuId(null);
    };

    // --- DYNAMIC APPLY (BACKEND) ---
    const handleApplyRecommendation = async () => {
        if (aiSuggestion.candidateId) {
            setRecApplied(true);
            try {
                // Update specific staff member on backend
                const personToUpdate = staff.find(s => s.id === aiSuggestion.candidateId);
                if(personToUpdate) {
                    const updatedPerson = { ...personToUpdate, shift: aiSuggestion.targetShift };
                    await fetch(`${API_URL}/api/staff/${aiSuggestion.candidateId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedPerson)
                    });
                    await refreshStaff(); // UI Update
                }
            } catch(e) { console.error(e); }
        }
    };

    const filteredStaff = filter === 'All' ? staff : staff.filter(s => s.role.includes(filter));

    if(loading) return <div className="flex items-center justify-center h-64 text-slate-400"><Loader2 className="animate-spin mr-2"/> Loading Workforce Data...</div>;

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* 1. TOP STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dashboard-800 p-4 rounded-xl border border-dashboard-700 flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue"><Users size={24}/></div>
                    <div><p className="text-slate-400 text-xs uppercase">Total Workforce</p><h3 className="text-2xl font-bold text-white">{staff.length}</h3></div>
                </div>
                <div className="bg-dashboard-800 p-4 rounded-xl border border-dashboard-700 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><Activity size={24}/></div>
                    <div><p className="text-slate-400 text-xs uppercase">Active Now</p><h3 className="text-2xl font-bold text-white">{activeStaffCount}</h3></div>
                </div>
                <div className="bg-dashboard-800 p-4 rounded-xl border border-dashboard-700 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><TrendingUp size={24}/></div>
                    <div><p className="text-slate-400 text-xs uppercase">Avg. Efficiency</p><h3 className="text-2xl font-bold text-white">91.4%</h3></div>
                </div>
            </div>

            {/* 2. HEADER & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Workforce Allocation</h2>
                    <p className="text-slate-400 text-sm">Real-time database management.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-dashboard-800 rounded-lg p-1 border border-dashboard-700">
                        {['All', 'Intake', 'Reviewer', 'Approver'].map((f) => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-brand-blue text-white shadow' : 'text-slate-400 hover:text-white'}`}>{f}</button>
                        ))}
                    </div>
                    <button onClick={() => { setModalMode('add'); setFormData({ id: null, name: '', role: 'Intake Specialist', status: 'Active', efficiency: 75, shift: 'Morning' }); setIsModalOpen(true); }} className="px-4 py-2 bg-brand-blue hover:bg-blue-600 active:scale-95 transition-all rounded-lg text-white flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus size={18}/> Add Staff</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 3. MAIN TABLE */}
                <div className="lg:col-span-3 bg-dashboard-800 rounded-xl border border-dashboard-700 overflow-visible min-h-[400px]">
                    <div className="overflow-visible">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-dashboard-900 text-slate-200 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Role & Skills</th>
                                    <th className="px-6 py-4">Shift</th>
                                    <th className="px-6 py-4">Performance</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dashboard-700">
                                {filteredStaff.map((s) => (
                                    <tr key={s.id} className="hover:bg-dashboard-700/50 transition-colors relative">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${s.status === 'Active' ? 'bg-gradient-to-tr from-blue-500 to-cyan-500' : 'bg-slate-600'}`}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{s.name}</p>
                                                    <p className="text-[10px] text-slate-500">{s.status}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-200 mb-1">{s.role}</p>
                                            <div className="flex gap-1 flex-wrap">
                                                {s.skills && s.skills.map(skill => (
                                                    <span key={skill} className="px-1.5 py-0.5 rounded bg-dashboard-700 border border-dashboard-600 text-[10px] text-slate-400">{skill}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock size={14} className="text-slate-500"/> 
                                                <span className={s.shift === 'Morning' ? 'text-amber-200' : 'text-indigo-200'}>{s.shift}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-dashboard-900 rounded-full overflow-hidden">
                                                    <div className={`h-full ${s.efficiency > 90 ? 'bg-green-500' : s.efficiency > 75 ? 'bg-brand-blue' : 'bg-amber-500'}`} style={{width: `${s.efficiency}%`}}></div>
                                                </div>
                                                <span className={`text-xs font-bold ${s.efficiency > 90 ? 'text-green-400' : 'text-slate-400'}`}>{s.efficiency}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === s.id ? null : s.id); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dashboard-600"><MoreVertical size={16}/></button>
                                            {activeMenuId === s.id && (
                                                <div ref={menuRef} className="absolute right-8 top-10 w-48 bg-dashboard-800 rounded-lg shadow-xl border border-dashboard-700 z-50 overflow-hidden animate-fade-in origin-top-right">
                                                    <button onClick={() => { setModalMode('view'); setFormData(s); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-slate-300 hover:bg-dashboard-700 hover:text-white flex items-center gap-2 text-xs"><User size={14}/> View Profile</button>
                                                    <button onClick={() => { setModalMode('edit'); setFormData(s); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-slate-300 hover:bg-dashboard-700 hover:text-white flex items-center gap-2 text-xs"><Edit size={14}/> Edit Details</button>
                                                    <div className="border-t border-dashboard-700 my-1"></div>
                                                    <button onClick={() => handleDeleteStaff(s.id)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-xs"><Trash2 size={14}/> Fire Employee</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. HONEY AI AUDIT (Dynamic Panel) */}
                <div className="bg-dashboard-800 rounded-xl border border-dashboard-700 p-5 flex flex-col gap-4">
                     <div className="flex items-center gap-2 text-white font-bold pb-4 border-b border-dashboard-700">
                         <Brain className="text-purple-400" size={20}/>
                         Honey AI Audit
                     </div>
                     
                     <div className="space-y-4">
                         {/* Dynamic Staffing Recommendation */}
                         <div className={`p-3 rounded-lg border transition-all ${isMorningOverstaffed ? 'bg-dashboard-900 border-amber-500/30' : 'bg-dashboard-900/50 border-dashboard-700 opacity-70'}`}>
                             <div className="flex justify-between items-start mb-2">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMorningOverstaffed ? 'text-amber-400 bg-amber-400/10' : 'text-green-400 bg-green-400/10'}`}>
                                     {isMorningOverstaffed ? 'IMBALANCE DETECTED' : 'SYSTEM OPTIMAL'}
                                 </span>
                             </div>
                             <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                 {aiSuggestion.message}
                             </p>
                             
                             {aiSuggestion.actionLabel && (
                                <button 
                                    onClick={handleApplyRecommendation}
                                    className="w-full py-2 bg-brand-blue hover:bg-blue-600 rounded text-[10px] font-bold text-white transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {aiSuggestion.actionLabel}
                                </button>
                             )}
                         </div>

                         {/* Status Alert (Static for demo) */}
                         <div className="p-3 bg-dashboard-900 rounded-lg border border-dashboard-700">
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">BREAK MONITOR</span>
                             </div>
                             <p className="text-xs text-slate-300 leading-relaxed">
                                 <span className="text-white font-medium">Bob Smith</span> has been on 'Break' status for >45 mins.
                             </p>
                         </div>
                     </div>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-dashboard-800 p-6 rounded-xl border border-dashboard-700 w-96 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">{modalMode === 'add' ? 'Add Employee' : modalMode === 'view' ? 'Profile' : 'Edit Details'}</h3><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
                        {modalMode === 'view' ? (
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-2xl font-bold border-2 border-white/20">{formData.name.charAt(0)}</div>
                                <div><h4 className="text-xl font-bold text-white">{formData.name}</h4><p className="text-slate-400 text-sm">{formData.role}</p></div>
                                <div className="grid grid-cols-3 gap-2 py-4 border-y border-dashboard-700">
                                    <div className="text-center"><p className="text-xs text-slate-500">Cases</p><p className="font-bold text-white">240</p></div>
                                    <div className="text-center border-l border-dashboard-700"><p className="text-xs text-slate-500">Accuracy</p><p className="font-bold text-green-400">98%</p></div>
                                    <div className="text-center border-l border-dashboard-700"><p className="text-xs text-slate-500">Tenure</p><p className="font-bold text-white">2y</p></div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label><input type="text" className="w-full bg-dashboard-900 border border-dashboard-700 rounded-lg px-4 py-2 text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                                <div><label className="block text-xs font-medium text-slate-400 mb-1">Role</label><div className="relative"><select className="w-full bg-dashboard-900 border border-dashboard-700 rounded-lg px-4 py-2 text-white appearance-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}><option>Intake Specialist</option><option>Sr. Reviewer</option><option>Approver</option><option>Auditor</option></select><ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16}/></div></div>
                                <div><label className="block text-xs font-medium text-slate-400 mb-1">Shift</label><div className="relative"><select className="w-full bg-dashboard-900 border border-dashboard-700 rounded-lg px-4 py-2 text-white appearance-none" value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})}><option>Morning</option><option>Evening</option><option>Night</option></select><ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16}/></div></div>
                                <button onClick={handleSaveStaff} disabled={isSaving} className="w-full mt-4 py-2 bg-brand-blue hover:bg-blue-600 rounded-lg text-white font-medium flex justify-center items-center gap-2">{isSaving && <Loader2 className="animate-spin" size={16}/>} {modalMode === 'add' ? 'Confirm' : 'Save'}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 4. SETTINGS VIEW (ADMIN PANEL) ---
const SettingsView = ({ params, setParams }) => {
    const [notifications, setNotifications] = useState({ email: true, sms: false, slack: true });
    const [slaThreshold, setSlaThreshold] = useState(85);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const handleExportLogs = () => {
        setIsExporting(true);
        setTimeout(() => {
            const data = [
                ["Timestamp", "Event", "User", "Status"],
                ["2025-01-20 09:15:00", "System Start", "System", "Success"],
                ["2025-01-20 09:30:00", "User Login", "Hemang Dubey", "Success"],
                ["2025-01-20 10:45:00", "SLA Breach Alert", "System", "Warning"],
                ["2025-01-20 11:20:00", "Staff Added: Ethan Hunt", "Hemang Dubey", "Success"],
            ];
            const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "Appian_System_Logs_2025.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsExporting(false);
        }, 1500);
    };

    const handleResetHistory = () => {
        if(window.confirm("Are you sure? This will clear all simulation data.")) {
            setIsResetting(true);
            setTimeout(() => {
                alert("System History Successfully Purged.");
                setIsResetting(false);
            }, 2000);
        }
    };

    return (
        <div className="animate-fade-in max-w-5xl space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div><h2 className="text-2xl font-bold text-white">System Configuration</h2><p className="text-slate-400 text-sm">Control operational thresholds and alerts.</p></div>
                <button onClick={handleSave} className="px-6 py-2 bg-brand-blue hover:bg-blue-600 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-all">{isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} {isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARD 1: OPERATIONAL PARAMS */}
                <div className="bg-dashboard-800 p-6 rounded-xl border border-dashboard-700">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Zap className="text-brand-blue" size={20}/> Operational Parameters</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="block text-xs font-medium text-slate-400 mb-1">Default Intake Staff</label><input type="number" value={params.intakeStaff} onChange={(e)=>setParams({...params, intakeStaff: parseInt(e.target.value)})} className="w-full bg-dashboard-900 border border-dashboard-700 rounded-lg px-4 py-2 text-white focus:border-brand-blue focus:outline-none"/></div>
                             <div><label className="block text-xs font-medium text-slate-400 mb-1">Default Review Staff</label><input type="number" value={params.reviewStaff} onChange={(e)=>setParams({...params, reviewStaff: parseInt(e.target.value)})} className="w-full bg-dashboard-900 border border-dashboard-700 rounded-lg px-4 py-2 text-white focus:border-brand-blue focus:outline-none"/></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-slate-400">SLA Risk Threshold</label><span className="text-xs font-bold text-amber-400">{slaThreshold}%</span></div>
                            <input type="range" min="50" max="100" value={slaThreshold} onChange={(e)=>setSlaThreshold(e.target.value)} className="w-full h-2 bg-dashboard-900 rounded-lg appearance-none cursor-pointer accent-amber-400"/>
                            <p className="text-[10px] text-slate-500 mt-1">Alerts will trigger when case backlog exceeds this capacity percentage.</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-dashboard-900 rounded-lg border border-dashboard-700">
                             <span className="text-sm text-slate-300">Auto-Scale Resources</span>
                             <div className="w-10 h-5 bg-brand-blue rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: NOTIFICATIONS */}
                <div className="bg-dashboard-800 p-6 rounded-xl border border-dashboard-700">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Bell className="text-purple-400" size={20}/> Notification Center</h3>
                    <div className="space-y-4">
                        {[
                            { id: 'email', label: 'Email Digests', desc: 'Daily summary of breached SLAs.' },
                            { id: 'slack', label: 'Slack Alerts', desc: 'Real-time alerts for critical backlog spikes.' },
                            { id: 'sms', label: 'SMS / PagerDuty', desc: 'Emergency override for system outages.' }
                        ].map((n) => (
                            <div key={n.id} className="flex items-center justify-between p-3 hover:bg-dashboard-700/50 rounded-lg transition-colors">
                                <div><p className="text-sm font-medium text-white">{n.label}</p><p className="text-xs text-slate-400">{n.desc}</p></div>
                                <div onClick={() => setNotifications({...notifications, [n.id]: !notifications[n.id]})} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notifications[n.id] ? 'bg-green-500' : 'bg-slate-600'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${notifications[n.id] ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CARD 3: DATA & MAINTENANCE */}
                <div className="md:col-span-2 bg-dashboard-800 p-6 rounded-xl border border-dashboard-700 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                         <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2"><Database className="text-slate-400" size={20}/> Data Management</h3>
                         <p className="text-sm text-slate-400">Export audit logs or reset simulation data.</p>
                     </div>
                     <div className="flex gap-4">
                         <button onClick={handleExportLogs} className="px-4 py-2 bg-dashboard-900 hover:bg-dashboard-700 border border-dashboard-600 text-slate-300 rounded-lg text-sm flex items-center gap-2">{isExporting ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>} {isExporting ? 'Downloading...' : 'Export Logs'}</button>
                         <button onClick={handleResetHistory} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-center gap-2">{isResetting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>} {isResetting ? 'Resetting...' : 'Reset History'}</button>
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- SHARED UI COMPONENTS ---
const NavItem = ({ icon, label, active, onClick }) => (<button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20 translate-x-1' : 'text-slate-400 hover:bg-dashboard-700 hover:text-white'}`}>{icon} {label}</button>);
const StatCard = ({ title, value, icon, trend, alert }) => (<div className={`p-5 rounded-xl border bg-dashboard-800 transition-all hover:translate-y-[-2px] ${alert ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse-slow' : 'border-dashboard-700 shadow-lg'}`}><div className="flex justify-between items-start mb-4"><div className="p-2 rounded-lg bg-dashboard-900 border border-dashboard-700">{icon}</div>{trend && <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{trend}</span>}</div><h3 className="text-2xl font-bold text-white mb-1">{value}</h3><p className="text-sm text-slate-400">{title}</p></div>);
const SliderControl = ({ label, value, setValue, min, max, suffix = "", color = "blue" }) => (<div><div className="flex justify-between mb-2"><label className="text-sm text-slate-300">{label}</label><span className="text-sm font-mono text-brand-blue">{value}{suffix}</span></div><input type="range" min={min} max={max} value={value} onChange={(e) => setValue(parseInt(e.target.value))} className="w-full h-2 bg-dashboard-900 rounded-lg appearance-none cursor-pointer accent-brand-blue"/></div>);

export default App;