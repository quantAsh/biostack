import { create } from 'zustand';
import { LogEntry, LogLevel } from '../types';

const MAX_LOGS = 200;

interface LogState {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, context?: Record<string, any>) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (level, message, context) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    console[level.toLowerCase() === 'error' ? 'error' : 'log'](`[${level}] ${message}`, context || '');

    set(state => ({
      logs: [newLog, ...state.logs].slice(0, MAX_LOGS),
    }));
  },
  clearLogs: () => set({ logs: [] }),
}));

export const log = (level: LogLevel, message: string, context?: Record<string, any>) => {
  useLogStore.getState().addLog(level, message, context);
};