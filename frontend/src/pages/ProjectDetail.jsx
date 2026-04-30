import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import { HiOutlinePlus, HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import toast from 'react-hot-toast';

const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const STATUS_ICONS = { todo: '📋', 'in-progress': '⏳', done: '✅' };

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', status:'todo', priority:'medium', dueDate:'', assignedTo:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProject(); fetchUsers(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await projectsAPI.getOne(id);
      setProject(res.data.data);
      setTasks(res.data.data.tasks || []);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await authAPI.getUsers(); setUsers(res.data.data); } catch {}
  };

  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm({ title:'', description:'', status:'todo', priority:'medium', dueDate:'', assignedTo:'' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || ''
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTask) {
        await tasksAPI.update(editTask._id, taskForm);
        toast.success('Task updated!');
      } else {
        await tasksAPI.create({ ...taskForm, project: id });
        toast.success('Task created!');
      }
      setShowTaskModal(false);
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save task'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? {...t, status: newStatus} : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted');
      fetchProject();
    } catch { toast.error('Failed to delete'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
  const isOverdue = (d) => d && new Date(d) < new Date();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!project) return null;

  const grouped = { todo: tasks.filter(t=>t.status==='todo'), 'in-progress': tasks.filter(t=>t.status==='in-progress'), done: tasks.filter(t=>t.status==='done') };

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}><HiOutlineArrowLeft /></button>
          <div>
            <h1 style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span style={{width:14,height:14,borderRadius:4,background:project.color,display:'inline-block'}}/>
              {project.title}
            </h1>
            <p>{project.description || 'No description'}</p>
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateTask}>
            <HiOutlinePlus /> Add Task
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {['todo','in-progress','done'].map(status => (
          <div key={status} className="kanban-column">
            <div className="kanban-header">
              <h3>{STATUS_ICONS[status]} {STATUS_LABELS[status]}</h3>
              <span className="kanban-count">{grouped[status].length}</span>
            </div>
            <div className="kanban-tasks">
              {grouped[status].map(task => (
                <div key={task._id} className="kanban-task">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <div className={`task-priority-dot ${task.priority}`} style={{marginTop:0}}/>
                      <strong style={{fontSize:'0.9rem'}}>{task.title}</strong>
                    </div>
                    <div style={{display:'flex',gap:'0.25rem'}}>
                      {(isAdmin || task.assignedTo?._id === user?.id) && (
                        <button className="btn btn-ghost btn-sm" style={{padding:'0.25rem'}} onClick={() => openEditTask(task)}><HiOutlinePencil size={14}/></button>
                      )}
                      {isAdmin && (
                        <button className="btn btn-ghost btn-sm" style={{padding:'0.25rem',color:'var(--danger)'}} onClick={() => handleDeleteTask(task._id)}><HiOutlineTrash size={14}/></button>
                      )}
                    </div>
                  </div>
                  {task.description && <p style={{fontSize:'0.8rem',color:'var(--text-secondary)',marginBottom:'0.5rem'}}>{task.description}</p>}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem'}}>
                    {task.dueDate && (
                      <span className={`task-date ${isOverdue(task.dueDate)&&task.status!=='done'?'overdue':''}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>👤 {task.assignedTo.name}</span>
                    )}
                  </div>
                  {/* Status change buttons for members */}
                  {(task.assignedTo?._id === user?.id || isAdmin) && task.status !== 'done' && (
                    <div style={{display:'flex',gap:'0.35rem',marginTop:'0.75rem'}}>
                      {task.status === 'todo' && (
                        <button className="btn btn-sm btn-secondary" style={{fontSize:'0.7rem'}} onClick={() => handleStatusChange(task._id,'in-progress')}>
                          Start →
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button className="btn btn-sm btn-secondary" style={{fontSize:'0.7rem',borderColor:'var(--success)',color:'var(--success)'}} onClick={() => handleStatusChange(task._id,'done')}>
                          Complete ✓
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {grouped[status].length === 0 && (
                <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem',padding:'2rem 0'}}>No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSaveTask}>
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
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.dueDate}
                onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
