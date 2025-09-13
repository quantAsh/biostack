import React from 'react';
import { useUserStore } from '../stores/userStore';
import { diagnosticModules } from '../data/diagnostics';

const DiagnosticsPanel: React.FC = () => {
    const activeDiagnosticModules = useUserStore(state => state.activeDiagnosticModules);
    const toggleDiagnosticModule = useUserStore(state => state.toggleDiagnosticModule);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <h2 className="font-title text-2xl font-bold text-gray-200 mb-1">Diagnostic Modules</h2>
            <p className="text-gray-400 mb-6">Activate diagnostic data streams to power your Digital Twin and enable AI-driven triage.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {diagnosticModules.map(module => {
                    const isActive = activeDiagnosticModules.includes(module.id);
                    return (
                        <div key={module.id} className={`bg-gray-800/50 rounded-lg p-4 flex flex-col border-2 transition-all duration-300 ${isActive ? 'border-cyan-400' : 'border-gray-700 hover:border-gray-600'}`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`flex-shrink-0 mt-1 ${isActive ? 'text-cyan-300' : 'text-gray-500'}`}>{module.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-200">{module.name}</h3>
                                    <p className="text-xs text-gray-500">{module.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleDiagnosticModule(module.id)}
                                className={`w-full mt-auto py-2 text-xs font-bold rounded-md transition-colors duration-300 ${isActive ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DiagnosticsPanel;
