import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, updatePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('General');
  
  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    setIsUpdatingPassword(true);
    try {
      await updatePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    settings: {
      notifications: user?.settings?.notifications ?? true,
      emailAlerts: user?.settings?.emailAlerts ?? true,
      theme: user?.settings?.theme || 'system',
    }
  });

  const handleSettingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const handleNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const fileInputRef = React.useRef(null);
  
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size must be less than 2MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        avatar: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      
      // Apply theme changes to DOM
      if (formData.settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        window.dispatchEvent(new Event('themeChanged'));
      } else if (formData.settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        window.dispatchEvent(new Event('themeChanged'));
      }
      // If system mode, could check system preference here
      
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 lg:px-12 lg:py-20 w-full">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-on-background mb-3 tracking-tight">Workspace Settings</h1>
          <p className="font-body text-on-surface-variant text-lg max-w-2xl">Manage your premium environment, account details, and preferences.</p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inner Sidebar / Secondary Nav */}
          <div className="lg:col-span-3 space-y-1">
            {['General', 'Security', 'Notifications', 'Appearance'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg font-label transition-colors flex items-center justify-between ${
                  activeTab === tab 
                    ? 'bg-surface-container-low text-primary font-semibold border-l-2 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-lowest'
                }`}
              >
                {tab}
                {activeTab === tab && <span className="material-symbols-outlined text-[18px]">chevron_right</span>}
              </button>
            ))}
          </div>

          {/* Settings Forms Area */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-9 space-y-12"
          >
            {activeTab === 'General' && (
              <section className="bg-surface-container-low rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="border-b border-outline-variant pb-6 mb-8">
                  <h2 className="font-headline text-2xl font-semibold text-on-background">Workspace Profile</h2>
                  <p className="font-body text-sm text-on-surface-variant mt-1">Configure your primary environment identity.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label text-sm font-medium text-on-background">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={handleNameChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-body" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-sm font-medium text-on-background">Email Address</label>
                      <div className="flex">
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          disabled
                          className="flex-1 bg-surface-container border border-outline-variant text-on-surface-variant rounded-lg px-4 py-2.5 font-body opacity-70 cursor-not-allowed" 
                        />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed directly.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-sm font-medium text-on-background">Avatar</label>
                    <div className="flex items-center gap-6 mt-2">
                      <div className="h-20 w-20 rounded-lg bg-primary text-on-primary flex items-center justify-center overflow-hidden text-3xl font-headline font-bold">
                        {(formData.avatar || user?.avatar) ? (
                          <img src={formData.avatar || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.name?.charAt(0)
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-3">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                          />
                          <button 
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-surface text-on-background border border-outline-variant rounded-lg font-label text-sm font-medium hover:bg-surface-variant transition-colors"
                          >
                            Upload new
                          </button>
                          {(formData.avatar || user?.avatar) && (
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                              className="px-4 py-2 text-error bg-error-container/10 border border-error/20 rounded-lg font-label text-sm font-medium hover:bg-error-container/30 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="font-body text-xs text-on-surface-variant">Recommended size: 256x256px. JPG, PNG, or SVG (Max 2MB).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Notifications' && (
              <section className="bg-surface-container-low rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="border-b border-outline-variant pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="font-headline text-2xl font-semibold text-on-background">Notification Preferences</h2>
                    <p className="font-body text-sm text-on-surface-variant mt-1">Adjust how your team interacts with the workspace.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Toggle Item 1 */}
                  <div className="flex items-center justify-between">
                    <div className="pr-8">
                      <h3 className="font-label text-base font-semibold text-on-background">In-App Notifications</h3>
                      <p className="font-body text-sm text-on-surface-variant mt-1">Receive toast notifications for real-time socket events (task updates, etc).</p>
                    </div>
                    <button 
                      onClick={() => handleSettingChange('notifications', !formData.settings.notifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.settings.notifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      role="switch"
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow ring-0 transition duration-200 ease-in-out ${formData.settings.notifications ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                  </div>

                  {/* Toggle Item 2 */}
                  <div className="flex items-center justify-between">
                    <div className="pr-8">
                      <h3 className="font-label text-base font-semibold text-on-background">Email Alerts</h3>
                      <p className="font-body text-sm text-on-surface-variant mt-1">Receive summary emails for overdue tasks and project assignments.</p>
                    </div>
                    <button 
                      onClick={() => handleSettingChange('emailAlerts', !formData.settings.emailAlerts)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.settings.emailAlerts ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      role="switch"
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow ring-0 transition duration-200 ease-in-out ${formData.settings.emailAlerts ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Appearance' && (
              <section className="bg-surface-container-low rounded-xl p-8 shadow-sm border border-outline-variant/30">
                 <div className="border-b border-outline-variant pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="font-headline text-2xl font-semibold text-on-background">Appearance Preferences</h2>
                    <p className="font-body text-sm text-on-surface-variant mt-1">Customize the Sahara experience.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label text-sm font-medium text-on-background block mb-3">Theme Selection</label>
                    <div className="flex gap-4">
                      {['light', 'dark', 'system'].map(themeOption => (
                        <button
                          key={themeOption}
                          onClick={() => handleSettingChange('theme', themeOption)}
                          className={`flex-1 py-3 px-4 border rounded-lg font-label capitalize transition-all ${
                            formData.settings.theme === themeOption
                            ? 'bg-primary-container/20 border-primary text-primary font-bold'
                            : 'border-outline-variant text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {themeOption} Mode
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">Note: Quick toggle available in sidebar overrides this temporary preference.</p>
                  </div>
                </div>
              </section>
            )}
            
            {activeTab === 'Security' && (
              <section className="bg-surface-container-low rounded-xl p-8 shadow-sm border border-outline-variant/30">
                <div className="border-b border-outline-variant pb-6 mb-8">
                  <h2 className="font-headline text-2xl font-semibold text-on-background">Security Settings</h2>
                  <p className="font-body text-sm text-on-surface-variant mt-1">Manage your account security and password.</p>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="font-label text-sm font-medium text-on-background">Current Password</label>
                    <input 
                      type="password" 
                      name="currentPassword"
                      required
                      value={passwords.currentPassword} 
                      onChange={handlePasswordChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-body" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-sm font-medium text-on-background">New Password</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      required
                      minLength="6"
                      value={passwords.newPassword} 
                      onChange={handlePasswordChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-body" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-sm font-medium text-on-background">Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      required
                      minLength="6"
                      value={passwords.confirmPassword} 
                      onChange={handlePasswordChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-body" 
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 bg-on-surface text-surface rounded-lg font-label font-semibold hover:bg-on-surface-variant transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'Billing' && (
              <section className="bg-surface-container-low rounded-xl p-16 shadow-sm border border-outline-variant/30 text-center flex flex-col items-center justify-center">
                 <span className="material-symbols-outlined text-4xl text-outline mb-4">construction</span>
                 <h2 className="font-headline text-2xl text-on-background mb-2">Coming Soon</h2>
                 <p className="text-on-surface-variant font-body text-sm">This feature is currently under development for Phase 3.</p>
              </section>
            )}

            {/* Form Actions */}
            {!(activeTab === 'Security' || activeTab === 'Billing') && (
              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <button 
                  onClick={() => {
                    setFormData({
                      name: user?.name || '',
                      settings: {
                        notifications: user?.settings?.notifications ?? true,
                        emailAlerts: user?.settings?.emailAlerts ?? true,
                        theme: user?.settings?.theme || 'system',
                      }
                    });
                  }}
                  className="px-6 py-2.5 bg-surface text-on-background border border-outline-variant rounded-lg font-label font-semibold hover:bg-surface-variant transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
