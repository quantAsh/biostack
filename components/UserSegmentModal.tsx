import React, { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useDataStore } from '../stores/dataStore';
import { UserSegmentCondition } from '../types';
import toast from 'react-hot-toast';

interface UserSegmentModalProps {
    onClose: () => void;
}

const UserSegmentModal: React.FC<UserSegmentModalProps> = ({ onClose }) => {
    const { createUserSegment } = useDataStore();
    const [name, setName] = useState('');
    const [rules, setRules] = useState<UserSegmentCondition[]>([{ field: 'level', operator: 'gt', value: 10 }]);

    const addRule = () => {
        setRules([...rules, { field: 'level', operator: 'gt', value: 10 }]);
    };

    const updateRule = (index: number, field: keyof UserSegmentCondition, value: string) => {
        const newRules = [...rules];
        // @ts-ignore
        newRules[index][field] = field === 'value' && newRules[index].field !== 'journey_completed' ? Number(value) : value;
        setRules(newRules);
    };
    
    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || rules.length === 0) {
            toast.error("Please provide a name and at least one rule.");
            return;
        }
        createUserSegment({ name, rules });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-2xl text-white p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-blue-300 mb-4">Create User Segment</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="segment-name" className="block text-sm font-medium text-gray-300 mb-1">Segment Name</label>
                        <input id="segment-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm" required />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Rules</h3>
                        <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                        {rules.map((rule, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <select value={rule.field} onChange={e => updateRule(index, 'field', e.target.value)} className="bg-gray-700 p-2 rounded text-xs"><option value="level">Level</option><option value="journey_completed">Journey Completed</option><option value="inactive_days">Inactive Days</option></select>
                                <select value={rule.operator} onChange={e => updateRule(index, 'operator', e.target.value)} className="bg-gray-700 p-2 rounded text-xs"><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="eq">=</option></select>
                                <input type={rule.field === 'journey_completed' ? 'text' : 'number'} value={rule.value} onChange={e => updateRule(index, 'value', e.target.value)} className="flex-grow bg-gray-700 p-2 rounded text-xs" />
                                <button type="button" onClick={() => removeRule(index)} className="text-red-400 p-1">&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={addRule} className="text-xs text-blue-300 hover:underline">+ Add Rule</button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-blue-500 rounded-lg hover:bg-blue-400">Create Segment</button>
                    </div>
                 </form>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default UserSegmentModal;
