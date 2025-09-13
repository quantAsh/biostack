import React from 'react';
import Logo from './Logo';

const CardBack: React.FC = () => {
    return (
        <div className="w-full h-full rounded-2xl bg-gray-900 border border-gray-700/50 noise-bg flex items-center justify-center">
            <div className="card-back-design">
                <Logo className="w-16 h-16 text-cyan-500/30" />
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
        </div>
    );
};

export default CardBack;