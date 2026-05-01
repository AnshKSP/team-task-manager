import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Team = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="h-12 w-64 bg-surface-container-high rounded-xl animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-surface-container-high rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 lg:px-12 w-full">
        {/* Page Header */}
        <div className="mb-12 border-b border-outline-variant/30 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl lg:text-5xl font-bold text-on-background mb-3 tracking-tight">Team Directory</h1>
            <p className="font-body text-on-surface-variant text-lg">Meet the people driving Sahara forward.</p>
          </div>
          <div className="flex items-center space-x-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 text-sm font-label">
            <span className="material-symbols-outlined text-primary">groups</span>
            <span className="font-semibold">{users.length} Members</span>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((member) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={member._id} 
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl shadow-sm overflow-hidden shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-headline text-lg font-bold text-on-surface">{member.name}</h3>
                  <p className="text-sm font-label text-on-surface-variant mb-1">{member.title || 'Team Member'}</p>
                  <p className="text-xs text-outline">{member.email}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-label">
                   <span className="material-symbols-outlined text-[14px] text-primary">badge</span>
                   <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wide ${member.role === 'ADMIN' ? 'bg-primary-container/30 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                     {member.role}
                   </span>
                </div>
                
                {user?.role === 'ADMIN' && member._id !== user._id && (
                  <select 
                    value={member.role}
                    onChange={(e) => handleRoleChange(member._id, e.target.value)}
                    className="text-xs bg-surface border border-outline-variant rounded px-2 py-1 outline-none focus:border-primary text-on-surface"
                  >
                    <option value="MEMBER">Make Member</option>
                    <option value="ADMIN">Make Admin</option>
                  </select>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;
