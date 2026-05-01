import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { notifications, unreadCount, markAllRead } = useContext(NotificationContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8 h-full flex flex-col gap-6">
          <div className="h-12 w-1/3 bg-surface-container-high rounded-xl animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-container-high rounded-2xl animate-pulse"></div>)}
          </div>
          <div className="h-64 w-full bg-surface-container-high rounded-2xl animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const activeTasks = tasks.filter(t => t.status !== 'DONE').length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'DONE');

  // Format date
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const chartData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'TODO').length, color: '#cec6be' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#e08850' },
    { name: 'In Review', value: tasks.filter(t => t.status === 'IN_REVIEW').length, color: '#d47070' },
    { name: 'Done', value: completedTasks, color: '#78706a' },
  ].filter(d => d.value > 0);

  return (
    <Layout>
      {/* Dashboard Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-4 md:pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-on-background tracking-tight mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-on-surface-variant text-lg font-body">Here is what's happening with your projects today.</p>
        </div>
        <div className="hidden sm:flex space-x-3 items-center relative">
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">search</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-surface animate-pulse"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-low border border-outline-variant/40 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
                  <h3 className="font-headline font-semibold text-on-surface">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline font-label">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                   {notifications.length === 0 ? (
                     <div className="p-6 text-center text-on-surface-variant text-sm">
                       No new notifications
                     </div>
                   ) : (
                     notifications.map(notif => (
                       <div key={notif.id} className={`p-4 border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors flex gap-3 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
                         <div className={`w-8 h-8 rounded-full ${notif.type === 'success' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'} flex items-center justify-center shrink-0`}>
                           <span className="material-symbols-outlined text-sm">{notif.type === 'success' ? 'verified' : 'campaign'}</span>
                         </div>
                         <div>
                           <p className="text-sm font-medium text-on-surface">{notif.message}</p>
                           <p className="text-[10px] text-outline mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                         </div>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center bg-primary text-on-primary font-bold ml-2 shadow-sm overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-4 md:gap-6">
        
        {/* Active Projects */}
        <div className="col-span-1 sm:col-span-2 row-span-1 bg-surface-container-low/70 backdrop-blur-md border border-outline-variant/40 shadow-sm rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-6 z-10">
            <div>
              <h3 className="font-label text-sm uppercase tracking-wider text-on-surface-variant mb-1">Active Projects</h3>
              <p className="font-headline text-4xl font-semibold text-on-background">{projects.length}</p>
            </div>
            <div className="p-3 bg-surface-container rounded-lg text-primary">
              <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>layers</span>
            </div>
          </div>
          <div className="z-10 mt-auto">
            <div className="flex justify-between text-sm mb-2 font-body text-on-surface-variant">
              <span>Overall Progress</span>
              <span className="font-semibold text-primary">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="col-span-1 row-span-1 bg-surface-container-low/70 backdrop-blur-md border border-outline-variant/40 shadow-sm rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="p-3 bg-surface-container rounded-full text-on-surface mb-4">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h3 className="font-label text-sm uppercase tracking-wider text-on-surface-variant mb-1">Completed</h3>
          <p className="font-headline text-3xl font-semibold text-on-background">{completedTasks}</p>
          <p className="text-xs text-primary mt-2 font-medium">Keep it up!</p>
        </div>

        {/* Open Tasks */}
        <div className="col-span-1 row-span-1 bg-surface-container-low/70 backdrop-blur-md border border-outline-variant/40 shadow-sm rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="p-3 bg-surface-container rounded-full text-on-surface mb-4">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <h3 className="font-label text-sm uppercase tracking-wider text-on-surface-variant mb-1">Open Tasks</h3>
          <p className="font-headline text-3xl font-semibold text-on-background">{activeTasks}</p>
          <p className="text-xs text-on-surface-variant mt-2">On track</p>
        </div>

        {/* Overdue (Red Tinted) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 row-span-1 bg-error-container/40 border border-error/20 rounded-xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="p-3 bg-error/10 rounded-full text-error mb-4">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <h3 className="font-label text-sm uppercase tracking-wider text-on-error-container mb-1">Overdue</h3>
          <p className="font-headline text-3xl font-semibold text-error">{overdueTasks.length}</p>
          {overdueTasks.length > 0 ? (
             <Link to={`/projects/${overdueTasks[0]?.project?._id}`} className="text-xs text-error underline mt-2 hover:text-on-error-container transition-colors">Review now</Link>
          ) : (
             <span className="text-xs text-error mt-2">All caught up</span>
          )}
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 bg-surface-container-low/70 backdrop-blur-md border border-outline-variant/40 shadow-sm rounded-xl p-6 md:p-8 flex flex-col h-[400px] md:h-[500px]">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline text-2xl font-semibold text-on-background">Recent Activity</h2>
            <Link to="/projects" className="text-sm font-medium text-primary hover:text-on-primary-fixed-variant">View All</Link>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {tasks.slice(0, 8).map(task => (
              <div key={task._id} className="flex items-start gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.status === 'DONE' ? 'bg-surface-container text-secondary' : 'bg-surface-container text-primary'}`}>
                  <span className="material-symbols-outlined text-sm">{task.status === 'DONE' ? 'check_circle' : 'edit_document'}</span>
                </div>
                <div>
                  <Link to={`/projects/${task.project._id}`} className="font-body text-sm text-on-background font-medium hover:text-primary transition-colors block">
                    {task.title}
                  </Link>
                  <p className="text-xs text-on-surface-variant mt-1">Project: {task.project.title}</p>
                  <p className="text-xs text-outline mt-1">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-secondary py-8">No recent tasks found.</div>
            )}
          </div>
        </div>

        {/* Task Distribution (Chart) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 row-span-2 bg-surface-container-low/70 backdrop-blur-md border border-outline-variant/40 shadow-sm rounded-xl p-6 md:p-8 flex flex-col items-center justify-center relative h-[300px] md:h-[500px]">
          <div className="w-full flex justify-between items-center mb-8 absolute top-8 left-8 right-8 px-8">
            <h2 className="font-headline text-2xl font-semibold text-on-background">Task Distribution</h2>
          </div>
          <div className="w-full h-64 mt-12">
            {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '8px', border: 'none' }}
                     itemStyle={{ color: 'var(--color-on-surface)' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                 </PieChart>
               </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-secondary text-sm">No tasks available.</div>
            )}
          </div>
        </div>
        
      </div>
    </Layout>
  );
};

export default Dashboard;
