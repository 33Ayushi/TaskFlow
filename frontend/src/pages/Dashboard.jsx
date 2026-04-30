import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineLightningBolt, HiOutlinePlus } from 'react-icons/hi';
import Modal from '../components/Modal';
import { projectsAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', project: '', assignedTo: '' });
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
    if (isAdmin) {
      fetchProjectsAndUsers();
    }
  }, [isAdmin]);

  const fetchProjectsAndUsers = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        projectsAPI.getAll(),
        authAPI.getUsers()
      ]);
      setProjectsList(projRes.data.data);
      setUsersList(userRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await tasksAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      await tasksAPI.create(taskForm);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', project: '', assignedTo: '' });
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (d) => d && new Date(d) < new Date();

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const sc = stats?.statusCounts || { todo: 0, 'in-progress': 0, done: 0, total: 0 };
  const pc = stats?.priorityCounts || { low: 0, medium: 0, high: 0 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>{isAdmin ? 'Here\'s your team overview' : 'Here are your assigned tasks'}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <HiOutlinePlus /> Quick Add Task
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><HiOutlineClipboardList style={{color:'var(--accent)'}}/></div>
          <div className="stat-value">{sc.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card todo">
          <div className="stat-icon"><HiOutlineLightningBolt style={{color:'var(--info)'}}/></div>
          <div className="stat-value">{sc.todo}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon"><HiOutlineClock style={{color:'var(--warning)'}}/></div>
          <div className="stat-value">{sc['in-progress']}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card done">
          <div className="stat-icon"><HiOutlineCheckCircle style={{color:'var(--success)'}}/></div>
          <div className="stat-value">{sc.done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-icon"><HiOutlineExclamation style={{color:'var(--danger)'}}/></div>
          <div className="stat-value">{stats?.overdueCount || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'2rem'}}>
        <div style={{background:'#ffffff', border:'2px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem', boxShadow:'var(--shadow-card)'}}>
          <h3 style={{fontSize:'1rem', fontWeight:600, marginBottom:'1rem'}}>Priority Breakdown</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
            {[{l:'High',v:pc.high,c:'#ef4444'},{l:'Medium',v:pc.medium,c:'#f59e0b'},{l:'Low',v:pc.low,c:'#10b981'}].map(p=>(
              <div key={p.l} style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:p.c,boxShadow:`0 0 8px ${p.c}40`}}/>
                <span style={{flex:1,fontSize:'0.85rem',fontWeight:500,color:'#475569'}}>{p.l}</span>
                <span style={{fontWeight:700,color:'#1e1b4b'}}>{p.v}</span>
                <div style={{width:80,height:6,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${sc.total?((p.v/(pc.high+pc.medium+pc.low))*100):0}%`,background:p.c,borderRadius:3,transition:'width 0.5s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rate */}
        <div style={{background:'#ffffff', border:'2px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-card)'}}>
          <h3 style={{fontSize:'1rem', fontWeight:600, marginBottom:'1rem'}}>Completion Rate</h3>
          <div style={{position:'relative',width:120,height:120}}>
            <svg viewBox="0 0 36 36" style={{transform:'rotate(-90deg)',width:'100%',height:'100%'}}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#e2e8f0" strokeWidth="3"/>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--success)" strokeWidth="3"
                strokeDasharray={`${sc.total ? (sc.done/sc.total)*100 : 0}, 100`}
                strokeLinecap="round" style={{transition:'stroke-dasharray 0.5s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
              <span style={{fontSize:'1.5rem',fontWeight:800,color:'#1e1b4b'}}>{sc.total ? Math.round((sc.done/sc.total)*100) : 0}%</span>
            </div>
          </div>
          <p style={{fontSize:'0.8rem',color:'#64748b',marginTop:'0.5rem',fontWeight:500}}>{sc.done} of {sc.total} done</p>
        </div>
      </div>

      {/* Overdue Tasks */}
      {stats?.overdueTasks?.length > 0 && (
        <div style={{marginBottom:'2rem'}}>
          <div className="section-header">
            <h2>⚠️ Overdue Tasks</h2>
          </div>
          <div className="tasks-container">
            {stats.overdueTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className={`task-priority-dot ${task.priority}`} />
                <div className="task-content">
                  <h3>{task.title}</h3>
                  <div className="task-meta">
                    <span className="task-badge badge-overdue">OVERDUE</span>
                    <span className="task-date overdue">Due {formatDate(task.dueDate)}</span>
                    {task.project && <span className="task-assignee">📁 {task.project.title}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <div className="section-header">
          <h2>📋 Recent Tasks</h2>
        </div>
        {stats?.recentTasks?.length > 0 ? (
          <div className="tasks-container">
            {stats.recentTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className={`task-priority-dot ${task.priority}`} />
                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span className={`task-badge badge-${task.status}`}>
                      {task.status === 'todo' ? 'TO DO' : task.status === 'in-progress' ? 'IN PROGRESS' : 'DONE'}
                    </span>
                    {task.dueDate && (
                      <span className={`task-date ${isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : ''}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.project && <span className="task-assignee">📁 {task.project.title}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Tasks assigned to you will appear here.</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title *</label>
              <input type="text" placeholder="Task title" value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Task details..." value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="form-group">
                <label>Project</label>
                <select value={taskForm.project} onChange={e => setTaskForm({...taskForm, project: e.target.value})}>
                  <option value="">Select Project</option>
                  {projectsList.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
              <div className="form-group">
                <label>Status</label>
                <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate}
                  onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
