import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const ProjectBoard = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Slide-over state (Task Details)
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [reviewAction, setReviewAction] = useState({ status: 'APPROVED', message: '' });

  // Filter states
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Status flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects`), 
        api.get(`/projects/${id}/tasks`)
      ]);
      const currentProject = projectRes.data.data.find(p => p._id === id);
      setProject(currentProject);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    const handleTaskUpdate = (task) => {
      if (task.project === id) fetchProjectData();
    };

    socket.on('taskUpdated', handleTaskUpdate);
    socket.on('taskCreated', handleTaskUpdate);
    socket.on('taskDeleted', handleTaskUpdate);

    return () => socket.disconnect();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/projects/${id}/tasks`, newTask);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handlePostProgress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/tasks/${selectedTask._id}/progress`, { message: progressMessage });
      setShowProgressModal(false);
      setProgressMessage('');
      fetchProjectData();
      
      // Update selectedTask locally to reflect changes immediately in panel
      setSelectedTask(prev => ({
        ...prev,
        progressUpdates: [...prev.progressUpdates, { message: progressMessage, createdAt: new Date(), user: { name: user.name } }]
      }));
    } catch (error) {
      toast.error('Failed to post update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/tasks/${selectedTask._id}/review`, { message: progressMessage });
      setShowReviewModal(false);
      setProgressMessage('');
      fetchProjectData();
      setIsPanelOpen(false);
    } catch (error) {
      toast.error('Failed to request review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/tasks/${selectedTask._id}/approve`, reviewAction);
      setReviewAction({ status: 'APPROVED', message: '' });
      fetchProjectData();
      setIsPanelOpen(false);
    } catch (error) {
      toast.error('Failed to process review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await api.put(`/projects/${id}/members`, { email: inviteEmail });
      setInviteSuccess(`Added ${inviteEmail}!`);
      setInviteEmail('');
      fetchProjectData();
    } catch (error) {
      setInviteError(error.response?.data?.error || 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  const openTaskPanel = (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  if (loading) return (
    <Layout>
      <div className="p-8 h-full flex flex-col gap-6 bg-surface-container-lowest">
        <div className="h-12 w-1/3 bg-surface-container-high rounded-xl animate-pulse"></div>
        <div className="flex gap-6 h-full overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="h-8 w-1/2 bg-surface-container-high rounded animate-pulse"></div>
              <div className="h-32 w-full bg-surface-container-high rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );

  if (!project) return <Layout><div className="flex items-center justify-center h-full bg-surface-container-lowest"><p>Project not found.</p></div></Layout>;

  const filteredTasks = tasks.filter(t => {
    if (filterMyTasks && t.assignedTo?._id !== user?._id) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const columns = [
    { id: 'TODO', title: 'To Do', tasks: filteredTasks.filter(t => t.status === 'TODO'), bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
    { id: 'IN_PROGRESS', title: 'In Progress', tasks: filteredTasks.filter(t => t.status === 'IN_PROGRESS'), bg: 'bg-primary-container', text: 'text-on-primary-container' },
    { id: 'IN_REVIEW', title: 'In Review', tasks: filteredTasks.filter(t => t.status === 'IN_REVIEW'), bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
    { id: 'DONE', title: 'Done', tasks: filteredTasks.filter(t => t.status === 'DONE'), bg: 'bg-secondary-container', text: 'text-on-secondary-container' }
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] md:h-screen relative bg-surface-container-lowest overflow-hidden">
        
        {/* Board Header */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-outline-variant/40 bg-surface-bright flex flex-col md:flex-row md:justify-between md:items-end flex-shrink-0 gap-4">
          <div>
            <p className="text-sm font-label text-on-surface-variant uppercase tracking-widest mb-1">Project Details</p>
            <h2 className="text-4xl font-headline text-on-surface leading-tight">{project.title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
               <div title="Owner" className="w-10 h-10 rounded-full border-2 border-surface-bright bg-primary flex items-center justify-center text-xs font-bold text-on-primary z-20 shadow-sm">
                {project.createdBy === user?.id ? "Me" : "OW"}
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface-bright bg-surface-container-high flex items-center justify-center text-sm font-label text-on-surface-variant z-10">
                +{project.members?.length || 0}
              </div>
            </div>
            
            {user?.role === 'ADMIN' && (
              <>
                <button onClick={() => setShowInviteModal(true)} className="flex items-center space-x-2 bg-surface border border-outline-variant px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span className="font-label text-sm hidden sm:inline">Invite</span>
                </button>
                <button onClick={() => setShowTaskModal(true)} className="flex items-center space-x-2 bg-primary px-4 py-2 rounded-lg text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span className="font-label text-sm font-medium">New Task</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-4 md:px-8 py-3 border-b border-outline-variant/30 flex items-center gap-4 bg-surface-container-lowest flex-shrink-0 z-10 overflow-x-auto kanban-scroll">
          <button 
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-2 ${filterMyTasks ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-[14px]">person</span>
            My Tasks
          </button>

          <div className="flex items-center gap-2 border border-outline-variant/50 rounded-full px-3 py-1 bg-surface">
             <span className="material-symbols-outlined text-[14px] text-on-surface-variant">filter_alt</span>
             <select 
               value={filterPriority} 
               onChange={(e) => setFilterPriority(e.target.value)}
               className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
             >
               <option value="ALL">All Priorities</option>
               <option value="HIGH">High Priority</option>
               <option value="MEDIUM">Medium Priority</option>
               <option value="LOW">Low Priority</option>
             </select>
          </div>
        </div>

        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scroll p-4 md:p-8">
          <div className="flex space-x-4 md:space-x-6 h-full items-start min-w-max pb-4">
            {columns.map((col) => (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col max-h-full">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
                    {col.title} <span className={`${col.bg} ${col.text} text-xs px-2 py-0.5 rounded-full font-label`}>{col.tasks.length}</span>
                  </h3>
                  {col.id === 'TODO' && (
                     <button onClick={() => setShowTaskModal(true)} className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">add</span>
                     </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 kanban-scroll">
                  {col.tasks.length === 0 ? (
                    <div className="border border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2 opacity-50">inventory_2</span>
                      <p className="font-label text-sm">Drop tasks here</p>
                    </div>
                  ) : (
                    col.tasks.map((task) => (
                      <motion.div 
                        key={task._id}
                        layoutId={task._id}
                        onClick={() => openTaskPanel(task)}
                        className={`rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                          task.status === 'IN_PROGRESS' ? 'bg-surface border-2 border-primary/30 shadow-[0_4px_24px_rgba(194,101,42,0.08)]' :
                          task.status === 'DONE' ? 'bg-surface-container-low border border-outline-variant/30 opacity-70' :
                          'bg-surface-bright border border-outline-variant/60'
                        }`}
                      >
                        {task.status === 'IN_PROGRESS' && <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>}
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                            task.status === 'TODO' ? 'bg-surface-container-highest text-on-surface-variant' :
                            task.status === 'IN_PROGRESS' ? 'bg-primary-container/20 text-primary-fixed-variant' :
                            task.status === 'IN_REVIEW' ? 'bg-tertiary-container/20 text-tertiary' :
                            'bg-secondary-container/30 text-secondary'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          
                          {task.priority && (
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                              task.priority === 'HIGH' ? 'border-error text-error bg-error-container/20' :
                              task.priority === 'LOW' ? 'border-secondary text-secondary bg-secondary-container/20' :
                              'border-primary text-primary bg-primary-container/20'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        
                        <h4 className={`font-body font-medium mb-2 leading-snug ${task.status === 'DONE' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                          {task.title}
                        </h4>
                        
                        {task.status !== 'DONE' && (
                          <p className="text-sm font-label text-on-surface-variant line-clamp-2 mb-4">{task.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center mt-auto pt-2">
                           {task.status === 'DONE' ? (
                             <>
                              <span className="text-xs font-label text-secondary">{new Date(task.createdAt).toLocaleDateString()}</span>
                              <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
                             </>
                           ) : (
                             <>
                                <div className={`flex items-center space-x-1 text-xs font-label font-medium ${new Date(task.dueDate) < new Date() ? 'text-error' : 'text-on-surface-variant'}`}>
                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                  <span>{new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                </div>
                                {task.progressUpdates?.length > 0 && (
                                   <div className="flex items-center space-x-1 text-primary text-xs font-label font-medium">
                                      <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                      <span>{task.progressUpdates.length}</span>
                                   </div>
                                )}
                             </>
                           )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-over Panel (Task Details) */}
        <AnimatePresence>
          {isPanelOpen && selectedTask && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPanelOpen(false)}
                className="absolute inset-0 bg-scrim/20 backdrop-blur-[1px] z-20"
              />
              
              <motion.aside 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 h-full w-full sm:w-[400px] lg:w-[480px] bg-surface-bright border-l border-outline-variant shadow-[-8px_0_32px_rgba(58,48,42,0.08)] flex flex-col z-30"
              >
                {/* Panel Header */}
                <div className="px-8 py-6 border-b border-outline-variant/40 flex justify-between items-start bg-surface">
                  <div className="flex items-center space-x-3 text-sm font-label text-on-surface-variant mb-2">
                    <span className="bg-primary-container/20 text-primary-fixed-variant text-xs px-2 py-1 rounded uppercase tracking-wider font-semibold">
                      Task Status
                    </span>
                    <span>•</span>
                    <span className="font-bold">{selectedTask.status.replace('_', ' ')}</span>
                    
                    {selectedTask.priority && (
                      <>
                        <span className="ml-2 bg-surface-variant text-on-surface-variant text-xs px-2 py-1 rounded uppercase tracking-wider font-semibold">
                          Priority
                        </span>
                        <span className={`font-bold ${
                          selectedTask.priority === 'HIGH' ? 'text-error' : 
                          selectedTask.priority === 'LOW' ? 'text-secondary' : 'text-primary'
                        }`}>
                          {selectedTask.priority}
                        </span>
                      </>
                    )}
                  </div>
                  <button onClick={() => setIsPanelOpen(false)} className="text-outline hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-8 kanban-scroll">
                  <h2 className="font-headline text-3xl text-on-surface leading-tight mb-6">{selectedTask.title}</h2>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <div>
                      <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Assignee</p>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden">
                          {selectedTask.assignee?.avatar ? (
                            <img src={selectedTask.assignee.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            selectedTask.assignee?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className="font-body text-sm font-medium">{selectedTask.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Due Date</p>
                      <div className={`flex items-center space-x-2 font-medium text-sm ${new Date(selectedTask.dueDate) < new Date() ? 'text-error' : 'text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="font-headline text-xl text-on-surface mb-3 border-b border-outline-variant/30 pb-2">Description</h3>
                    <p className="font-label text-on-surface-variant leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>

                  {/* Progress Updates (Subtasks/Chat) */}
                  <div className="mb-8">
                    <h3 className="font-headline text-xl text-on-surface mb-3 border-b border-outline-variant/30 pb-2 flex justify-between items-center">
                      Progress Updates
                      <span className="text-sm font-label text-on-surface-variant font-normal">{selectedTask.progressUpdates?.length || 0} items</span>
                    </h3>
                    
                    <ul className="space-y-4">
                      {selectedTask.progressUpdates?.length > 0 ? (
                        selectedTask.progressUpdates.map((upd, i) => (
                          <li key={i} className="flex items-start space-x-3 font-label text-sm bg-surface p-3 rounded-lg border border-outline-variant/50">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                              {upd.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-on-surface mb-1">"{upd.message}"</p>
                              <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant">
                                <span className="font-semibold text-primary">{upd.user?.name || 'System'}</span>
                                <span>•</span>
                                <span>{new Date(upd.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-on-surface-variant italic">No updates yet.</p>
                      )}
                    </ul>
                  </div>

                  {/* Admin Review Action Form */}
                  {selectedTask.status === 'IN_REVIEW' && (user?.role === 'ADMIN' || project.createdBy === user?.id) && (
                    <div className="bg-tertiary-container/10 p-6 rounded-2xl border border-tertiary/20 mt-8 mb-4">
                      <h4 className="font-headline text-lg text-tertiary mb-4">Review Action</h4>
                      <div className="flex gap-4 mb-4">
                        <button 
                          onClick={() => setReviewAction({...reviewAction, status: 'APPROVED'})}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${reviewAction.status === 'APPROVED' ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-secondary hover:bg-surface'}`}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => setReviewAction({...reviewAction, status: 'CHANGES_REQUESTED'})}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${reviewAction.status === 'CHANGES_REQUESTED' ? 'bg-error text-white border-error' : 'border-outline-variant text-secondary hover:bg-surface'}`}
                        >
                          Request Changes
                        </button>
                      </div>
                      <textarea 
                        rows="3"
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-tertiary focus:outline-none text-sm mb-4"
                        placeholder="Feedback for the developer..."
                        value={reviewAction.message} onChange={e => setReviewAction({...reviewAction, message: e.target.value})}
                      />
                      <button 
                        onClick={handleApproveAction}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-tertiary text-on-tertiary rounded-xl font-bold shadow-lg shadow-tertiary/20 hover:bg-tertiary/90 transition-colors"
                      >
                        Submit Review Decision
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel Footer Actions */}
                <div className="p-6 border-t border-outline-variant/40 bg-surface flex flex-wrap gap-4">
                  {selectedTask.status === 'TODO' && (
                    <button onClick={() => { handleUpdateStatus(selectedTask._id, 'IN_PROGRESS'); setIsPanelOpen(false); }} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm whitespace-nowrap">
                      Start Task
                    </button>
                  )}
                  {selectedTask.status === 'IN_PROGRESS' && (
                    <>
                      <button onClick={() => setShowProgressModal(true)} className="flex-1 bg-surface-container border border-outline-variant text-on-surface py-2.5 rounded-lg font-label font-medium hover:bg-surface-container-high transition-colors text-sm whitespace-nowrap">
                        Post Update
                      </button>
                      <button onClick={() => setShowReviewModal(true)} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm text-sm whitespace-nowrap">
                        Request Review
                      </button>
                    </>
                  )}
                  {selectedTask.status === 'DONE' && (
                     <button className="flex-1 bg-secondary-container text-on-secondary-container py-2.5 rounded-lg font-label font-medium opacity-70 cursor-not-allowed text-sm">
                       Completed
                     </button>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODALS --- */}

      {/* Create Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border border-outline-variant/50"
            >
              <div className="p-6 border-b border-outline-variant/50">
                <h3 className="font-headline text-2xl text-on-surface">New Task</h3>
                <p className="text-sm font-body text-on-surface-variant mt-1">Add a new item to the To Do column.</p>
              </div>
              <form onSubmit={handleCreateTask} className="p-6">
                <div className="space-y-4 mb-8">
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm font-body transition-all"
                    placeholder="Task Title (e.g. Wireframe Homepage)"
                    value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                  <textarea 
                    rows="3"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm font-body transition-all"
                    placeholder="Task Description..."
                    value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  />
                  <div className="flex gap-4">
                    <input 
                      type="date" required
                      className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm font-body transition-all text-on-surface-variant"
                      value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                    <select
                      className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm font-body transition-all"
                      value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Update Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border-t-4 border-primary"
            >
              <div className="p-6 border-b border-outline-variant/50">
                <h3 className="font-headline text-xl text-on-surface">Post Progress Update</h3>
                <p className="text-xs font-body text-secondary mt-1">Briefly describe what you've accomplished so far.</p>
              </div>
              <form onSubmit={handlePostProgress} className="p-6">
                <textarea 
                  required rows="4"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-sm font-body"
                  placeholder="Worked on the API, successfully connected..."
                  value={progressMessage} onChange={e => setProgressMessage(e.target.value)}
                />
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setShowProgressModal(false)} className="px-5 py-2 text-sm font-bold text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-secondary text-on-secondary rounded-lg text-sm font-bold shadow-sm hover:bg-secondary/90 transition-colors">
                    {isSubmitting ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Request Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border-t-4 border-tertiary"
            >
              <div className="p-6">
                <h3 className="font-headline text-xl text-tertiary">Request Review</h3>
                <p className="text-xs font-body text-secondary mt-1">Finalize your work and ask the team to check it.</p>
              </div>
              <form onSubmit={handleRequestReview} className="p-6 pt-0">
                <textarea 
                  required rows="4"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-tertiary focus:border-tertiary focus:outline-none text-sm font-body transition-all"
                  placeholder="I have completed all requirements. Ready for final review!"
                  value={progressMessage} onChange={e => setProgressMessage(e.target.value)}
                />
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="px-5 py-2 text-sm font-bold text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-tertiary text-on-tertiary rounded-lg text-sm font-bold shadow-sm hover:bg-tertiary/90 transition-colors">
                    {isSubmitting ? 'Submitting...' : 'Send to Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border border-outline-variant/50"
            >
              <div className="p-6 border-b border-outline-variant/50">
                <h3 className="font-headline text-2xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span>
                  Invite Member
                </h3>
                <p className="text-xs font-body text-on-surface-variant mt-1">The user must already have a Sahara account.</p>
              </div>
              <form onSubmit={handleInviteMember} className="p-6">
                {inviteError && <div className="mb-4 p-3 bg-error-container/30 text-error rounded-lg text-xs font-label">{inviteError}</div>}
                {inviteSuccess && <div className="mb-4 p-3 bg-secondary-container/50 text-on-secondary-container rounded-lg text-xs font-label">{inviteSuccess}</div>}
                <input 
                  type="email" required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm mb-6 font-body transition-all"
                  placeholder="member@email.com"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => { setShowInviteModal(false); setInviteError(null); setInviteSuccess(null); }} className="px-5 py-2 text-sm font-bold text-secondary hover:bg-surface-container rounded-lg transition-colors">Close</button>
                  <button type="submit" disabled={isInviting} className="px-6 py-2 bg-on-surface text-surface rounded-lg text-sm font-bold hover:bg-on-surface-variant transition-colors shadow-sm">
                    {isInviting ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProjectBoard;
