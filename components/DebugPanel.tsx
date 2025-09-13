import React, { useState } from 'react';
import { useLogStore } from '../stores/logStore';
import { LogLevel } from '../types';
import toast from 'react-hot-toast';

const levelStyles: Record<LogLevel, string> = {
  INFO: 'text-gray-400',
  SUCCESS: 'text-green-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  DEBUG: 'text-purple-400',
};

const DebugPanel: React.FC = () => {
  const { logs, clearLogs } = useLogStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = () => {
    const logText = logs
      .slice()
      .reverse()
      .map(log => `[${log.timestamp}] [${log.level}] ${log.message}${log.context ? `\n${JSON.stringify(log.context, null, 2)}` : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(logText);
    toast.success('Logs copied to clipboard!');
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h4 className="font-semibold text-white">Diagnostics & Logging</h4>
            <p className="text-sm text-gray-400">View real-time application logs for debugging.</p>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-sm font-semibold text-red-400 hover:text-red-300 flex-shrink-0">
          {isOpen ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isOpen && (
        <div className="mt-4">
          <div className="flex gap-4 mb-4">
            <button onClick={handleCopy} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 text-sm">
              Copy to Clipboard
            </button>
            <button onClick={clearLogs} className="bg-red-800/80 text-red-100 font-bold py-2 px-4 rounded-lg hover:bg-red-700/80 text-sm">
              Clear Logs
            </button>
          </div>
          <div className="bg-black/50 p-4 rounded-lg border border-gray-800 max-h-96 overflow-y-auto custom-scrollbar font-mono text-xs">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="border-b border-gray-800/50 py-1 last:border-b-0">
                  <span className="text-gray-600 mr-2">{log.timestamp.split('T')[1].replace('Z', '')}</span>
                  <span className={`font-bold mr-2 ${levelStyles[log.level]}`}>[{log.level}]</span>
                  <span className="text-gray-300">{log.message}</span>
                  {log.context && <pre className="text-gray-500 text-[10px] whitespace-pre-wrap">{JSON.stringify(log.context, null, 2)}</pre>}
                </div>
              ))
            ) : (
              <p className="text-gray-600">Log is empty. Interact with the app to generate events.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;