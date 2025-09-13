import React, { useState, useCallback } from 'react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import { Protocol, StackComparison } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getStackComparison } from '../services/geminiService';
import toast from 'react-hot-toast';
import { CategoryIcon } from './CategoryIcon';
import StackLabHeader from './StackLabHeader';
import { CATEGORY_DETAILS } from '../constants';

const DraggableProtocol: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("protocolId", protocol.id);
    };
    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="arsenal-item"
        >
            <p className="text-xs font-semibold text-white truncate">{protocol.name}</p>
        </div>
    );
};

const SimulationResultsModal: React.FC<{ results: StackComparison, onClose: () => void }> = ({ results, onClose }) => {
    const winnerColor = { alpha: 'text-blue-400', bravo: 'text-pink-400', tie: 'text-gray-300' }[results.winner];
    const winnerText = { alpha: 'Stack Alpha', bravo: 'Stack Bravo', tie: 'It\'s a Tie' }[results.winner];

    const ResultList: React.FC<{ title: string; items: string[]; color: string }> = ({ title, items, color }) => (
        <div>
            <h4 className={`font-semibold mb-2 ${color}`}>{title}</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    );

    return (
        <div className="simulation-modal-overlay" onClick={onClose}>
            <div className="simulation-modal-content" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-teal-500/30 text-center">
                    <h2 className="font-hud text-2xl font-bold text-teal-300">Simulation Complete</h2>
                    <p className="text-sm font-bold mt-2">WINNER: <span className={winnerColor}>{winnerText}</span></p>
                </header>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Kai's Analysis</h3>
                        <p className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-md">{results.analysis}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Alpha Column */}
                        <div className="space-y-4">
                            <ResultList title="Stack Alpha: Pros" items={results.alphaPros} color="text-green-400" />
                            <ResultList title="Stack Alpha: Cons" items={results.alphaCons} color="text-red-400" />
                        </div>
                         {/* Bravo Column */}
                        <div className="space-y-4">
                            <ResultList title="Stack Bravo: Pros" items={results.bravoPros} color="text-green-400" />
                            <ResultList title="Stack Bravo: Cons" items={results.bravoCons} color="text-red-400" />
                        </div>
                    </div>
                </div>
                <footer className="p-4 border-t border-teal-500/30 text-right">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-black bg-teal-500 rounded-lg hover:bg-teal-400">Close</button>
                </footer>
            </div>
        </div>
    );
};

const SandboxPanel: React.FC = () => {
    const { exitSandboxMode } = useUIStore();
    const { myStack, userGoals } = useUserStore();
    const myProtocols = myStack.filter((p): p is Protocol => 'id' in p);

    const [stackAlpha, setStackAlpha] = useState<Protocol[]>([]);
    const [stackBravo, setStackBravo] = useState<Protocol[]>([]);
    const [dragOver, setDragOver] = useState<'alpha' | 'bravo' | null>(null);
    const [simulationGoal, setSimulationGoal] = useState(userGoals[0] || 'Improve Focus');
    const [showResults, setShowResults] = useState<StackComparison | null>(null);

    const mutation = useMutation({
        mutationFn: () => getStackComparison(stackAlpha, stackBravo, simulationGoal),
        onSuccess: (data) => setShowResults(data),
        onError: (error: Error) => toast.error(`Simulation failed: ${error.message}`),
    });

    const handleDrop = (stackType: 'alpha' | 'bravo') => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const protocolId = e.dataTransfer.getData("protocolId");
        const protocol = myProtocols.find(p => p.id === protocolId);
        if (protocol) {
            const updater = stackType === 'alpha' ? setStackAlpha : setStackBravo;
            updater(prev => [...prev, protocol]);
        }
        setDragOver(null);
    };

    const handleRemove = (stackType: 'alpha' | 'bravo', protocolId: string) => {
        const updater = stackType === 'alpha' ? setStackAlpha : setStackBravo;
        updater(prev => prev.filter(p => p.id !== protocolId));
    };

    const handleRunSimulation = () => {
        if (stackAlpha.length === 0 || stackBravo.length === 0) {
            toast.error("Both Stack Alpha and Stack Bravo must contain at least one protocol.");
            return;
        }
        mutation.mutate();
    };

    const DropZone: React.FC<{ stack: Protocol[], name: string, type: 'alpha' | 'bravo', nameColor: string }> = ({ stack, name, type, nameColor }) => (
        <div
            className={`drop-zone ${dragOver === type ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(type); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={handleDrop(type)}
        >
            <h2 className="font-hud text-2xl font-bold mb-3" style={{ color: nameColor }}>{name}</h2>
            <div className="drop-zone-content custom-scrollbar space-y-2">
                {stack.length > 0 ? stack.map(p => (
                    <div key={`${type}-${p.id}`} className="arsenal-item !cursor-default flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CategoryIcon category={p.categories[0]} className="w-4 h-4" style={{ color: CATEGORY_DETAILS[p.categories[0]]?.color }} />
                            <span className="text-xs">{p.name}</span>
                        </div>
                        <button onClick={() => handleRemove(type, p.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">&times;</button>
                    </div>
                )) : <p className="text-center text-gray-500 text-sm p-8">Drag protocols here</p>}
            </div>
        </div>
    );

    return (
        <div className="mt-8">
            {showResults && <SimulationResultsModal results={showResults} onClose={() => setShowResults(null)} />}
            <StackLabHeader stackAlpha={stackAlpha} stackBravo={stackBravo} />
            <div className="sandbox-container mt-6">
                <DropZone stack={stackAlpha} name="Stack Alpha" type="alpha" nameColor="#38bdf8" />
                <DropZone stack={stackBravo} name="Stack Bravo" type="bravo" nameColor="#f472b6" />
                <div className="protocol-arsenal">
                    <h3 className="font-hud text-lg font-bold text-teal-300 mb-3 flex-shrink-0">Protocol Arsenal</h3>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow">
                        {myProtocols.map(p => <DraggableProtocol key={p.id} protocol={p} />)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-teal-500/30 flex-shrink-0">
                        <label className="text-xs font-semibold text-gray-300">Simulation Goal</label>
                        <input type="text" value={simulationGoal} onChange={e => setSimulationGoal(e.target.value)} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-600" />
                        <button
                            onClick={handleRunSimulation}
                            disabled={mutation.isPending}
                            className="w-full mt-3 bg-teal-500 text-black font-bold py-2 rounded-lg hover:bg-teal-400 disabled:bg-gray-600"
                        >
                            {mutation.isPending ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="text-center mt-6">
                <button onClick={exitSandboxMode} className="text-sm font-semibold text-gray-400 hover:text-white">Exit Sandbox Mode</button>
            </div>
        </div>
    );
};

export default SandboxPanel;