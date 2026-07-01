import { createContext, useContext } from 'react';

export type Severity = 'error' | 'warning' | 'info' | 'success';
export type ShowToast = (message: string, severity?: Severity) => void;

export const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
