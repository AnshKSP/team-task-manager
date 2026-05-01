import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ActivityTimeline = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities');
        setActivities(res.data.data);
      } catch (error) {
        toast.error('Failed to load activity timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED_PROJECT': return { icon: 'layers', bg: 'bg-primary-container', text: 'text-primary' };
      case 'CREATED_TASK': return { icon: 'add_task', bg: 'bg-primary/20', text: 'text-primary' };
      case 'UPDATED_TASK_STATUS': return { icon: 'move_up', bg: 'bg-tertiary-container', text: 'text-tertiary' };
      case 'POSTED_UPDATE': return { icon: 'chat_bubble', bg: 'bg-secondary-container', text: 'text-secondary' };
      case 'REQUESTED_REVIEW': return { icon: 'rate_review', bg: 'bg-error-container', text: 'text-error' };
      case 'APPROVED_TASK': return { icon: 'verified', bg: 'bg-primary-container', text: 'text-primary' };
      case 'ADDED_MEMBER': return { icon: 'person_add', bg: 'bg-surface-variant', text: 'text-on-surface-variant' };
      default: return { icon: 'history', bg: 'bg-surface-variant', text: 'text-on-surface-variant' };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full">
          <div className="h-12 w-64 bg-surface-container-high rounded-xl animate-pulse mb-12"></div>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-container-high animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-4 w-3/4 bg-surface-container-high rounded animate-pulse"></div>
                  <div className="h-3 w-1/4 bg-surface-container-high rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12 lg:px-8 w-full">
        {/* Page Header */}
        <div className="mb-12 border-b border-outline-variant/30 pb-6">
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-on-background mb-3 tracking-tight">Activity Timeline</h1>
          <p className="font-body text-on-surface-variant text-lg">A complete audit log of workspace events.</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[23px] w-0.5 bg-outline-variant/30 z-0"></div>
          
          <div className="space-y-8 relative z-10">
            {activities.length === 0 ? (
              <div className="text-center p-12 text-on-surface-variant">No activity recorded yet.</div>
            ) : (
              activities.map((activity, i) => {
                const style = getActionIcon(activity.action);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={activity._id} 
                    className="flex gap-6"
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-surface ${style.bg} ${style.text} shadow-sm z-10`}>
                      <span className="material-symbols-outlined text-xl">{style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                            {activity.user?.avatar ? (
                              <img src={activity.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              activity.user?.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <span className="font-headline font-semibold text-on-surface text-sm block leading-none">{activity.user?.name || 'Unknown User'}</span>
                            <span className="text-[10px] text-primary uppercase tracking-widest font-bold mt-1 block">{activity.action.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <span className="text-xs font-label text-outline whitespace-nowrap">
                          {new Date(activity.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                        {activity.details}
                      </p>
                      
                      {(activity.project || activity.task) && (
                         <div className="mt-4 pt-3 border-t border-outline-variant/20 flex gap-4 text-xs font-label">
                           {activity.project && (
                             <span className="flex items-center gap-1.5 text-on-surface-variant">
                               <span className="material-symbols-outlined text-[14px]">layers</span>
                               {activity.project.title}
                             </span>
                           )}
                           {activity.task && (
                             <span className="flex items-center gap-1.5 text-on-surface-variant">
                               <span className="material-symbols-outlined text-[14px]">task</span>
                               {activity.task.title}
                             </span>
                           )}
                         </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityTimeline;
