import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5001/api";

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      setTasks(res.data);
    } catch (err) { console.error("API Error", err); }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const action = isSignup ? 'signup' : 'login';
    try {
      const res = await axios.post(`${API_BASE}/auth/${action}`, formData);
      if (isSignup) { setIsSignup(false); alert("Secure Profile Created!"); }
      else { setUser(res.data.user); setIsLoggedIn(true); }
    } catch (err) { alert("Auth failed."); }
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API_BASE}/tasks/${id}`, { status });
    fetchTasks();
  };

  // --- SUB-VIEWS (This is what was missing!) ---
  
  const renderContent = () => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'Todo').length,
      doing: tasks.filter(t => t.status === 'Doing').length,
      done: tasks.filter(t => t.status === 'Done').length,
    };

    switch (activeTab) {
      case 'team':
        return (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f172a' }}>👥 Team Directory</h2>
            <p style={{ color: '#64748b' }}>Manage your organization's members and department roles.</p>
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block' }}>{user.name}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</span>
              </div>
              <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>{user.role}</span>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f172a' }}>📈 Performance Analytics</h2>
            <p style={{ color: '#64748b' }}>Visualizing team throughput and project completion rates.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <div style={{ flex: 1, height: '150px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0' }}>
                <span style={{ color: '#94a3b8' }}>Completion Chart Placeholder</span>
              </div>
              <div style={{ flex: 1, height: '150px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0' }}>
                <span style={{ color: '#94a3b8' }}>Team Velocity Placeholder</span>
              </div>
            </div>
          </div>
        );

      default: // DASHBOARD
        return (
          <>
            <div style={{ display: 'flex', gap: '25px', marginBottom: '50px' }}>
              {[{ label: 'Total Projects', count: stats.total, color: '#6366f1' }, { label: 'Backlog', count: stats.todo, color: '#94a3b8' }, { label: 'In Execution', count: stats.doing, color: '#f59e0b' }, { label: 'Finalized', count: stats.done, color: '#10b981' }].map(s => (
                <div key={s.label} style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', borderTop: `4px solid ${s.color}` }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>{s.label}</p>
                  <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800' }}>{s.count}</h2>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
              <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '30px' }}>📋 Active Workstream</h3>
                {tasks.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No active projects.</p> : tasks.map(t => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{t.title}</h4>
                      <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: t.status === 'Done' ? '#dcfce7' : '#fef3c7', color: t.status === 'Done' ? '#166534' : '#92400e', fontWeight: 'bold' }}>{t.status.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       {t.status !== 'Doing' && t.status !== 'Done' && <button onClick={() => updateStatus(t._id, 'Doing')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>Initiate</button>}
                       {t.status !== 'Done' && <button onClick={() => updateStatus(t._id, 'Done')} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>Finalize</button>}
                    </div>
                  </div>
                ))}
              </div>

              {user.role === 'Admin' && (
                <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px rgba(99, 102, 241, 0.4)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '25px' }}>Task Injection</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    await axios.post(`${API_BASE}/tasks`, { title: e.target.title.value }, { headers: { 'x-user-role': user.role } });
                    e.target.reset(); fetchTasks();
                  }}>
                    <input name="title" placeholder="Define objective..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', marginBottom: '15px' }} required />
                    <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: 'white', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }}>Deploy Task</button>
                  </form>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '280px', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
          <div style={{ padding: '40px 30px', borderBottom: '1px solid #1e293b' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>🚀 TeamFlow</h2>
          </div>
          <nav style={{ flex: 1, padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'team', label: 'Team Portal', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map(item => (
              <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', backgroundColor: activeTab === item.id ? '#1e293b' : 'transparent', color: activeTab === item.id ? '#6366f1' : '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </nav>
          <div style={{ padding: '30px 20px' }}>
            <button onClick={() => setIsLoggedIn(false)} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div style={{ flex: 1, marginLeft: '280px', padding: '40px 60px' }}>
          <header style={{ marginBottom: '50px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p style={{ color: '#64748b' }}>Active User: {user.name} | Role: {user.role}</p>
            </div>
          </header>
          
          {renderContent()} {/* Renders based on activeTab */}
        </div>
      </div>
    );
  }

  // --- AUTH PORTAL ---
  return (
    <div style={{ height: '100vh', display: 'flex', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '400px', backgroundColor: 'white', padding: '50px', borderRadius: '32px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>TeamFlow</h1>
        <form onSubmit={handleAuth}>
          {isSignup && <input type="text" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '16px', marginBottom: '15px', borderRadius: '14px', border: '1px solid #e2e8f0' }} required />}
          <input type="email" placeholder="Corporate Email" onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '16px', marginBottom: '15px', borderRadius: '14px', border: '1px solid #e2e8f0' }} required />
          <input type="password" placeholder="Passcode" onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '16px', marginBottom: '25px', borderRadius: '14px', border: '1px solid #e2e8f0' }} required />
          <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>{isSignup ? 'Secure Register' : 'System Login'}</button>
        </form>
        <p onClick={() => setIsSignup(!isSignup)} style={{ textAlign: 'center', color: '#6366f1', cursor: 'pointer', marginTop: '25px' }}>{isSignup ? 'Switch to Login' : 'Register New Employee'}</p>
      </div>
    </div>
  );
}

export default App;