import { Alert, Snackbar } from '@mui/material';
import { useCallback, useState, type ReactNode } from 'react';
import { ToastContext, type Severity, type ShowToast } from './toastContext';

interface ToastState {
  message: string;
  severity: Severity;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback<ShowToast>((message, severity = 'info') => {
    setToast({ message, severity });
    setOpen(true);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: { xs: 64, sm: 76 } }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setOpen(false)}
            sx={{ color: 'white' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}
