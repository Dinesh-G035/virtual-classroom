import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const toastConfig = {
  success: { icon: FiCheckCircle, bg: 'bg-green-500/15 border-green-500/30', text: 'text-green-400', iconColor: 'text-green-400' },
  error: { icon: FiAlertCircle, bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', iconColor: 'text-red-400' },
  warning: { icon: FiAlertTriangle, bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', iconColor: 'text-amber-400' },
  info: { icon: FiInfo, bg: 'bg-primary-500/15 border-primary-500/30', text: 'text-primary-400', iconColor: 'text-primary-400' },
};

const Toast = ({ toast, onClose }) => {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} backdrop-blur-lg shadow-glass animate-slide-in-right max-w-sm`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <p className={`text-sm font-medium ${config.text} flex-1`}>{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="text-surface-400 hover:text-white transition-colors">
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      {/* Toast container — visual notifications */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
