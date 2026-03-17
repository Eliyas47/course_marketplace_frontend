import { useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`glass animate-fade-in ${toast.type === 'success' ? 'border-primary' : 'border-error'}`} style={{ 
            padding: '1rem 1.5rem', 
            borderRadius: '16px', 
            background: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            minWidth: '300px',
            borderLeft: `6px solid ${toast.type === 'success' ? 'var(--primary)' : 'var(--error)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>{toast.type === 'success' ? '✅' : '❌'}</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
