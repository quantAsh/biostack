import React from 'react';

const ProtocolCustomizer: React.FC = () => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 h-fit">
            <h3 className="font-title text-2xl font-bold mb-3 text-red-300">Component Disabled</h3>
            <p className="text-gray-400 mb-6 text-sm">The Protocol Customizer is temporarily disabled due to a critical error. We are working on a fix.</p>
        </div>
    );
};

export default ProtocolCustomizer;