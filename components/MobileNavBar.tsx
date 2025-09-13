import React, { useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { View } from '../types';
import { VIEW_THEMES } from '../constants';

const MobileNavBar: React.FC = () => {
    const { view, setView } = useUIStore();
    const { myStack } = useUserStore();
    const { platformConfig } = useDataStore();

    const navigationOrder: View[] = useMemo(() => {
        const order: View[] = ['explore', 'kai', 'arena'];
        if (platformConfig?.isStoreEnabled) {
            order.push('store');
        }
        order.push('my-stack-lab', 'settings');
        return order;
    }, [platformConfig?.isStoreEnabled]);


    const NavButton: React.FC<{ targetView: View }> = ({ targetView }) => {
        const theme = VIEW_THEMES[targetView];
        const isActive = view === targetView;
        const isMyStack = targetView === 'my-stack-lab';
        
        const colorMap: Record<string, string> = {
            'cyan-300': '#67e8f9',
            'blue-300': '#93c5fd',
            'teal-300': '#5eead4',
            'gray-300': '#d1d5db',
            'yellow-300': '#fde047',
            'red-300': '#fca5a5',
        }

        return (
            <button
                onClick={() => setView(targetView)}
                className={`mobile-nav-button relative ${isActive ? 'active' : ''}`}
                style={isActive ? { color: colorMap[theme.textColor.replace('text-','')] } : {}}
            >
                {theme.icon}
                <span>{theme.name}</span>
                 {isMyStack && myStack.length > 0 && (
                    <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold ring-2 ring-gray-900 bg-cyan-400 text-black">
                        {myStack.length}
                    </span>
                )}
            </button>
        )
    };

    return (
        <nav className="mobile-nav-bar">
            {navigationOrder.map(v => <NavButton key={v} targetView={v} />)}
        </nav>
    );
};

export default MobileNavBar;