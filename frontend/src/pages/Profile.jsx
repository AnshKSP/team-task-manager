import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const [stats, setStats] = useState({ projects: 0, tasksDone: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        
        const myProjects = projRes.data.data.filter(p => p.members.some(m => m.user._id === user._id));
        const myTasks = tasksRes.data.data.filter(t => t.assignedTo?._id === user._id && t.status === 'DONE');
        
        setStats({
          projects: myProjects.length,
          tasksDone: myTasks.length
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Core */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Profile Card */}
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/30 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-container/20 to-transparent"></div>
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-gradient-to-tr from-primary to-surface-container-low">
                <div className="w-full h-full object-cover rounded-full border-4 border-surface-container-low bg-primary text-on-primary flex items-center justify-center text-4xl font-headline font-bold">
                  {user?.name?.charAt(0)}
                </div>
              </div>

              {!isEditing ? (
                <>
                  <h2 className="font-headline text-3xl text-on-surface mb-1">{user?.name}</h2>
                  <p className="font-label text-on-surface-variant text-sm tracking-wide uppercase mb-6">{user?.title || 'Team Member'}</p>
                  
                  {user?.bio && <p className="text-sm font-body text-on-surface-variant mb-6 px-4 italic">"{user.bio}"</p>}

                  <div className="flex justify-center gap-4 mb-8">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label text-sm font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-sm block">share</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="text-left space-y-4 mb-8 relative z-10 bg-surface-container-highest/50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs font-label text-on-surface-variant mb-1 block">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded p-2 text-sm focus:ring-1 focus:ring-primary" required />
                  </div>
                  <div>
                    <label className="text-xs font-label text-on-surface-variant mb-1 block">Job Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded p-2 text-sm focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-label text-on-surface-variant mb-1 block">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded p-2 text-sm focus:ring-1 focus:ring-primary" rows="2"></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-label text-on-surface-variant mb-1 block">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded p-2 text-sm focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-outline-variant text-on-surface py-2 rounded font-label text-xs hover:bg-surface-variant transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 bg-primary text-on-primary py-2 rounded font-label text-xs hover:bg-primary-container hover:text-on-primary-container transition-colors">Save</button>
                  </div>
                </form>
              )}

              <div className="border-t border-outline-variant/50 pt-6 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>location_on</span>
                  <span className="font-body text-sm text-on-surface-variant">{user?.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>mail</span>
                  <span className="font-body text-sm text-on-surface-variant">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>calendar_month</span>
                  <span className="font-body text-sm text-on-surface-variant">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Stats & Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>folder_open</span>
                  </div>
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Active Projects</span>
                </div>
                <div className="font-headline text-4xl text-on-surface">{stats.projects}</div>
              </div>
              
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
                  </div>
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Tasks Done</span>
                </div>
                <div className="font-headline text-4xl text-on-surface">{stats.tasksDone}</div>
              </div>
            </div>

            {/* Recent Contributions */}
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/30 shadow-sm">
              <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                <h3 className="font-headline text-2xl text-on-surface">Recent Contributions</h3>
                <span className="font-label text-sm text-primary hover:underline transition-all cursor-pointer">View All</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 flex items-center justify-center border border-outline-variant/50 group-hover:bg-primary-container/20 transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">waving_hand</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body font-medium text-on-surface mb-1">Joined Sahara</h4>
                    <p className="font-body text-sm text-on-surface-variant mb-2">Welcome to your new premium workspace.</p>
                    <div className="flex items-center gap-2 font-label text-xs text-on-surface-variant/70">
                      <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>System</span>
                    </div>
                  </div>
                </div>
                {/* Placeholder for future activity items based on real data */}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;
