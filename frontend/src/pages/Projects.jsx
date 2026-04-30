import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUsers, HiOutlineClipboardList } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#0ea5e9','#06b6d4'];

const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', members: [], color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.data);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await projectsAPI.create(form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ title: '', description: '', members: [], color: '#6366f1' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId) ? f.members.filter(id => id !== userId) : [...f.members, userId]
    }));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> New Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}
              style={{'--card-color': p.color || '#6366f1'}}>
              <div style={{position:'absolute',top:0,left:0,width:4,height:'100%',background:p.color||'#6366f1',borderRadius:'4px 0 0 4px'}}/>
              <div className="project-title">{p.title}</div>
              <div className="project-desc">{p.description || 'No description'}</div>
              <div className="project-meta">
                <span className="members-count"><HiOutlineUsers /> {p.members?.length || 0} members</span>
                <span className="tasks-count"><HiOutlineClipboardList /> {p.taskCounts?.total || 0} tasks</span>
              </div>
              {isAdmin && (
                <div className="project-actions" style={{position:'absolute',top:'1rem',right:'1rem'}}>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => handleDelete(e, p._id)} style={{color:'var(--danger)'}}>
                    <HiOutlineTrash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> Create Project</button>}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Project Title *</label>
            <input type="text" placeholder="e.g. Website Redesign" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="Brief project description..." value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm({...form, color: c})}
                  style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',
                    border: form.color === c ? '3px solid white' : '3px solid transparent',
                    transition:'all 0.2s'}} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Add Members</label>
            <div style={{maxHeight:150,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {users.filter(u => u.role === 'member').map(u => (
                <label key={u._id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem',
                  background: form.members.includes(u._id) ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                  border:'1px solid '+(form.members.includes(u._id)?'var(--accent)':'var(--border)'),
                  borderRadius:'var(--radius-sm)',cursor:'pointer',transition:'all 0.2s'}}>
                  <input type="checkbox" checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)} style={{accentColor:'var(--accent)'}} />
                  <span style={{fontSize:'0.9rem'}}>{u.name}</span>
                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)',marginLeft:'auto'}}>{u.email}</span>
                </label>
              ))}
              {users.filter(u => u.role === 'member').length === 0 && (
                <p style={{fontSize:'0.85rem',color:'var(--text-muted)',padding:'0.5rem'}}>No members available yet.</p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
