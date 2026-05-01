import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ title: '', description: '' });
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-full"><p>Loading...</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="p-8 lg:p-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-headline text-4xl lg:text-5xl font-semibold text-on-background tracking-tight mb-2">Active Projects</h2>
              <p className="text-secondary text-lg">Curated initiatives and ongoing developments.</p>
            </div>
            <div className="flex gap-4">
              {user?.role === 'ADMIN' && (
                <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-medium transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Project
                </button>
              )}
            </div>
          </div>

          {/* Projects Grid (Bento style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              // Assign a pseudo-random color/icon based on index for variety
              const isPrimary = index % 3 === 0;
              const isTertiary = index % 3 === 1;
              const colorClass = isTertiary ? 'tertiary' : isPrimary ? 'primary' : 'secondary';
              const icon = isTertiary ? 'landscape' : isPrimary ? 'architecture' : 'chair';
              
              return (
                <Link to={`/projects/${project._id}`} key={project._id} className="group bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 shadow-[0_2px_16px_rgba(58,48,42,0.04)] hover:shadow-[0_8px_24px_rgba(58,48,42,0.08)] hover:border-outline-variant transition-all duration-300 flex flex-col h-full relative overflow-hidden block cursor-pointer">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}-container/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-${colorClass} border border-outline-variant/30`}>
                      <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>{icon}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-headline text-2xl font-medium text-on-background mb-3">{project.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed mb-8 flex-1">{project.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-6 mt-auto">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {project.creator?.name?.charAt(0) || 'C'}
                      </div>
                      {project.members?.length > 0 && (
                        <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-xs font-medium text-secondary">
                          +{project.members.length}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      {new Date(project.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {projects.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">folder_open</span>
                <h3 className="text-xl font-headline text-on-surface mb-2">No projects yet</h3>
                <p className="text-secondary">Create a new project to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center">
              <h3 className="font-headline text-2xl text-on-surface">New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6">
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Project Title</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g. Website Redesign"
                    value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
                  <textarea 
                    rows="3"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Describe the project goals..."
                    value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-secondary hover:bg-surface-container transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-medium disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
