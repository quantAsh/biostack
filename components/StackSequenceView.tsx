import React, { useState, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { Protocol } from '../types';
import { getProtocolTimeOfDay } from '../utils/scheduling';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_DETAILS } from '../constants';

type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

const DraggableCard: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("protocolId", protocol.id);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="sequence-card"
        >
            <div className="flex items-center gap-2">
                <CategoryIcon category={protocol.categories[0]} className="w-5 h-5 flex-shrink-0" style={{ color: CATEGORY_DETAILS[protocol.categories[0]]?.color }} />
                <p className="text-sm font-semibold text-white truncate">{protocol.name}</p>
            </div>
        </div>
    );
};

const SequenceColumn: React.FC<{ title: TimeOfDay, protocols: Protocol[], onDrop: (protocolId: string) => void }> = ({ title, protocols, onDrop }) => {
    const [isOver, setIsOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const protocolId = e.dataTransfer.getData("protocolId");
        onDrop(protocolId);
        setIsOver(false);
    };

    return (
        <div 
            className={`sequence-column ${isOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h3 className="font-hud text-xl font-bold text-teal-300 mb-4 tracking-wider">{title}</h3>
            <div className="space-y-3">
                {protocols.map(p => <DraggableCard key={p.id} protocol={p} />)}
            </div>
        </div>
    );
};

const StackSequenceView: React.FC = () => {
    const { myStack } = useUserStore();
    const myProtocols = myStack.filter((p): p is Protocol => 'id' in p);
    const [sequencedProtocols, setSequencedProtocols] = useState<Record<TimeOfDay, Protocol[]>>({
        Morning: [],
        Afternoon: [],
        Evening: [],
    });

    useEffect(() => {
        const morning: Protocol[] = [];
        const afternoon: Protocol[] = [];
        const evening: Protocol[] = [];

        myProtocols.forEach(p => {
            const timeOfDay = getProtocolTimeOfDay(p);
            if (timeOfDay === 'Morning') morning.push(p);
            else if (timeOfDay === 'Afternoon') afternoon.push(p);
            else evening.push(p);
        });
        
        setSequencedProtocols({ Morning: morning, Afternoon: afternoon, Evening: evening });
    }, [myStack]);

    const handleDrop = (protocolId: string, targetColumn: TimeOfDay) => {
        const protocolToMove = myProtocols.find(p => p.id === protocolId);
        if (!protocolToMove) return;

        setSequencedProtocols(prev => {
            // Remove from all columns first
            const newMorning = prev.Morning.filter(p => p.id !== protocolId);
            const newAfternoon = prev.Afternoon.filter(p => p.id !== protocolId);
            const newEvening = prev.Evening.filter(p => p.id !== protocolId);

            // Add to the target column
            if (targetColumn === 'Morning') newMorning.push(protocolToMove);
            if (targetColumn === 'Afternoon') newAfternoon.push(protocolToMove);
            if (targetColumn === 'Evening') newEvening.push(protocolToMove);
            
            return { Morning: newMorning, Afternoon: newAfternoon, Evening: newEvening };
        });
    };
    
    if (myProtocols.length === 0) {
      return (
          <div className="text-center py-16 text-gray-500 col-span-full">
              <h3 className="font-title text-2xl mb-2">Your Stack is Empty</h3>
              <p>Add protocols to sequence them in your day.</p>
          </div>
      );
    }

    return (
        <div className="sequence-container">
            <SequenceColumn title="Morning" protocols={sequencedProtocols.Morning} onDrop={(id) => handleDrop(id, 'Morning')} />
            <SequenceColumn title="Afternoon" protocols={sequencedProtocols.Afternoon} onDrop={(id) => handleDrop(id, 'Afternoon')} />
            <SequenceColumn title="Evening" protocols={sequencedProtocols.Evening} onDrop={(id) => handleDrop(id, 'Evening')} />
        </div>
    );
};

export default StackSequenceView;
