import React from 'react';
import { useUIStore } from '../stores/uiStore';
import Logo from './Logo';

interface MobileHeaderProps {
    title: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
    const { openMobileMenu } = useUIStore();
    
    return (
        <header className="mobile-header">
            <button onClick={openMobileMenu} className="p-2 -ml-2">
                <Logo className="w-6 h-6 text-gray-300" />
            </button>
            <h2 className="font-hud text-lg font-bold text-gray-200 tracking-wider absolute left-1/2 -translate-x-1/2">{title}</h2>
            {/* Right side can have context actions if needed */}
            <div></div> 
        </header>
    );
};

export default MobileHeader;