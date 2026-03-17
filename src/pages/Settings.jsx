import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    emailCourseUpdates: true,
    emailPromotions: false,
    pushReminders: true,
    weeklyDigest: true,
    profileVisibility: 'students-and-instructors',
    discussionPrivacy: 'public',
    language: 'English',
    timezone: 'UTC+05:45',
    playbackSpeed: '1.0x',
    autoplayNextLesson: true,
    subtitlesByDefault: true,
    twoFactorAuth: false,
    deviceAlerts: true,
  });

  const updateToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSelect = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const savePreferences = () => {
    showToast('Settings saved successfully!', 'success');
  };

  const Section = ({ title, description, children }) => (
    <section className="glass p-6 rounded-2xl">
      <h3 style={{ marginBottom: '0.4rem' }}>{title}</h3>
      <p className="text-text-muted" style={{ marginBottom: '1rem', fontSize: '0.92rem' }}>{description}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );

  const ToggleRow = ({ label, help, checked, onChange }) => (
    <label className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div className="text-text-muted text-sm">{help}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
    </label>
  );

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Advanced Settings</h1>
          <p className="text-text-muted">Manage notifications, privacy, learning behavior, and account security.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={savePreferences}>Save Preferences</button>
      </div>

      <div className="flex flex-col gap-5">
        <Section title="Notifications" description="Decide how and when LearnHub should contact you.">
          <ToggleRow
            label="Course updates by email"
            help="Receive instructor announcements and lesson release emails."
            checked={settings.emailCourseUpdates}
            onChange={() => updateToggle('emailCourseUpdates')}
          />
          <ToggleRow
            label="Promotions and marketplace offers"
            help="Get discount alerts and curated course recommendations."
            checked={settings.emailPromotions}
            onChange={() => updateToggle('emailPromotions')}
          />
          <ToggleRow
            label="Weekly progress digest"
            help="Summary of completed lessons, streaks, and pending tasks."
            checked={settings.weeklyDigest}
            onChange={() => updateToggle('weeklyDigest')}
          />
          <ToggleRow
            label="Push reminder notifications"
            help="Get nudges to continue your active learning paths."
            checked={settings.pushReminders}
            onChange={() => updateToggle('pushReminders')}
          />
        </Section>

        <Section title="Privacy and Visibility" description="Control who can view your profile and learning activity.">
          <div>
            <label className="text-text-muted text-sm">Profile visibility</label>
            <select
              className="glass"
              value={settings.profileVisibility}
              onChange={(e) => updateSelect('profileVisibility', e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              <option value="private">Only me</option>
              <option value="students-and-instructors">Students and instructors</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className="text-text-muted text-sm">Discussion privacy</label>
            <select
              className="glass"
              value={settings.discussionPrivacy}
              onChange={(e) => updateSelect('discussionPrivacy', e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              <option value="public">Public discussions</option>
              <option value="followers">Followers only</option>
              <option value="private">Private discussions</option>
            </select>
          </div>
        </Section>

        <Section title="Learning Experience" description="Personalize your course player and study environment.">
          <div>
            <label className="text-text-muted text-sm">Default playback speed</label>
            <select
              className="glass"
              value={settings.playbackSpeed}
              onChange={(e) => updateSelect('playbackSpeed', e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              <option value="0.75x">0.75x</option>
              <option value="1.0x">1.0x</option>
              <option value="1.25x">1.25x</option>
              <option value="1.5x">1.5x</option>
            </select>
          </div>
          <div>
            <label className="text-text-muted text-sm">Preferred language</label>
            <select
              className="glass"
              value={settings.language}
              onChange={(e) => updateSelect('language', e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Afaan Oromo</option>
             <option>Amharic</option>

            </select>
          </div>
          <div>
            <label className="text-text-muted text-sm">Timezone</label>
            <select
              className="glass"
              value={settings.timezone}
              onChange={(e) => updateSelect('timezone', e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border)' }}
            >
              <option>UTC-05:00</option>
              <option>UTC+00:00</option>
              <option>UTC+05:45</option>
              <option>UTC+08:00</option>
            </select>
          </div>
          <ToggleRow
            label="Autoplay next lesson"
            help="Automatically continue to the next lesson in a module."
            checked={settings.autoplayNextLesson}
            onChange={() => updateToggle('autoplayNextLesson')}
          />
          <ToggleRow
            label="Enable subtitles by default"
            help="Turn on captions whenever supported by the course content."
            checked={settings.subtitlesByDefault}
            onChange={() => updateToggle('subtitlesByDefault')}
          />
        </Section>

        <Section title="Security" description="Protect your account and monitor sign-in activity.">
          <ToggleRow
            label="Two-factor authentication"
            help="Require a verification code at sign-in for stronger protection."
            checked={settings.twoFactorAuth}
            onChange={() => updateToggle('twoFactorAuth')}
          />
          <ToggleRow
            label="New device sign-in alerts"
            help="Send alerts whenever your account is accessed from a new device."
            checked={settings.deviceAlerts}
            onChange={() => updateToggle('deviceAlerts')}
          />
          <button className="btn btn-outline" type="button">Review Active Sessions</button>
        </Section>
      </div>
    </div>
  );
};

export default Settings;
