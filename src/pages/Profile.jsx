import { useEffect, useState } from 'react';
import { authApi, coursesApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const [profile, setProfile] = useState({ username: 'Learner', role: 'student', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [about, setAbout] = useState('Passionate lifelong learner focused on practical, project-based growth.');
  const [headline, setHeadline] = useState('Frontend Learner | Building job-ready skills');

  const [isSaving, setIsSaving] = useState(false);
  const [adminCategoryName, setAdminCategoryName] = useState('');
  const [isCreatingAdminCategory, setIsCreatingAdminCategory] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authApi.getProfile();
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const { showToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      };
      const response = await authApi.updateProfile(payload);
      setProfile(response.data);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateAdminCategory = async (e) => {
    e.preventDefault();
    const trimmed = adminCategoryName.trim();

    if (!trimmed) {
      showToast('Category name is required.', 'warning');
      return;
    }

    setIsCreatingAdminCategory(true);
    try {
      await coursesApi.createCategory({ name: trimmed });
      setAdminCategoryName('');
      showToast('Category created successfully.', 'success');
    } catch (err) {
      console.error('Profile admin category create failed:', err?.response?.data || err);
      if (err?.code === 'CATEGORY_CREATE_ENDPOINT_NOT_FOUND') {
        showToast('Backend category create endpoint is not available.', 'warning');
        return;
      }

      const data = err?.response?.data;
      const detail = data?.detail || (typeof data === 'string' ? data : null);
      const firstField = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      showToast(detail || firstField || 'Failed to create category.', 'error');
    } finally {
      setIsCreatingAdminCategory(false);
    }
  };

  if (isLoading) {
    return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading profile...</h2></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="glass p-8 rounded-3xl" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="flex justify-between items-start mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Edit Professional Profile</h1>
            <p className="text-text-muted" style={{ marginTop: '0.35rem' }}>
              Keep your marketplace profile complete so instructors and peers can better support your learning goals.
            </p>
          </div>
          <span className="glass" style={{ padding: '0.45rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem' }}>
            {String(profile.role || 'student').toUpperCase()} ACCOUNT
          </span>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Identity</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted text-sm">Username</label>
                <input className="glass" name="username" value={profile.username} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-text-muted text-sm">Email</label>
                <input className="glass" name="email" value={profile.email || ''} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-text-muted text-sm">First Name</label>
                <input className="glass" name="first_name" value={profile.first_name || ''} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-text-muted text-sm">Last Name</label>
                <input className="glass" name="last_name" value={profile.last_name || ''} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Public Learner Card</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-text-muted text-sm">Professional Headline</label>
                <input
                  className="glass"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label className="text-text-muted text-sm">About You</label>
                <textarea
                  className="glass"
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', resize: 'vertical', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          </div>

          {String(profile.role || '').toLowerCase() === 'admin' && (
            <div className="glass p-6 rounded-2xl">
              <h3 className="mb-4">Admin Tools</h3>
              <p className="text-text-muted text-sm" style={{ marginBottom: '0.8rem' }}>
                Create platform categories directly from your admin profile panel.
              </p>
              <form onSubmit={handleCreateAdminCategory} className="flex flex-col gap-3">
                <input
                  className="glass"
                  value={adminCategoryName}
                  onChange={(e) => setAdminCategoryName(e.target.value)}
                  placeholder="e.g. Cybersecurity"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                />
                <button className="btn btn-primary" type="submit" disabled={isCreatingAdminCategory}>
                  {isCreatingAdminCategory ? 'Creating...' : 'Create Category'}
                </button>
              </form>
            </div>
          )}

          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <p className="text-text-muted text-sm">Personalizing your profile helps in better course recommendations.</p>
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
