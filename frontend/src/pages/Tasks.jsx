import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { HiOutlineFilter, HiOutlinePlus } from 'react-icons/hi';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', project: '', assignedTo: '' });
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchTasks(); 
    if (isAdmin) {
      fetchProjectsAndUsers();
    }
  }, [filter, isAdmin]);

  const fetchProjectsAndUsers = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        tasksAPI.getAll().then(() => projectsAPI.getAll()), // Wait, we can just use projectsAPI
        authAPI.getUsers()
      ]);
      setProjectsList(projRes.data.data);
      setUsersList(userRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      await tasksAPI.create(taskForm);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', project: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch { toast.error('Failed to delete task'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const isOverdue = (d) => d && new Date(d) < new Date();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Tasks</h1>
          <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} style={{ marginRight: '0.5rem' }}>
              <HiOutlinePlus /> Create Task
            </button>
          )}
          <HiOutlineFilter style={{ color: 'var(--text-muted)' }} />
          <select className="form-group" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 0 }}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
            style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 0 }}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="tasks-container">
          {tasks.map(task => (
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
                  {task.assignedTo && <span className="task-assignee">👤 {task.assignedTo.name}</span>}
                </div>
              </div>
              <div className="task-actions">
                {task.status === 'todo' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(task._id, 'in-progress')}>
                    Start →
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <button className="btn btn-sm btn-secondary" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                    onClick={() => handleStatusChange(task._id, 'done')}>
                    Done ✓
                  </button>
                )}
                {isAdmin && (
                  <button className="btn btn-sm btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginLeft: 'auto' }}
                    onClick={() => handleDeleteTask(task._id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>{filter.status || filter.priority ? 'Try changing your filters.' : 'Tasks will appear here once created.'}</p>
        </div>
      )}

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

export default Tasks;
