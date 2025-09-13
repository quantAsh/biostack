import React, { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import { DiagnosticService } from '../types';

const ServiceCard: React.FC<{ service: DiagnosticService }> = ({ service }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col transition-all hover:border-cyan-400/50 hover:bg-gray-800">
            <div className="flex items-start gap-4 mb-4">
                <img src={service.providerLogoUrl} alt={`${service.provider} logo`} className="w-12 h-12 rounded-md bg-white p-1 object-contain" />
                <div>
                    <h3 className="font-bold text-lg text-white">{service.name}</h3>
                    <p className="text-sm text-gray-400">Provider: {service.provider}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 flex-grow mb-4">{service.description}</p>
            <div className="mt-auto pt-4 border-t border-gray-700/50 flex justify-between items-center">
                <span className="font-mono text-lg font-bold text-cyan-300">{service.priceRange}</span>
                <a href={service.bookingLink} target="_blank" rel="noopener noreferrer" className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg text-sm hover:bg-cyan-400 transition-colors">
                    Learn More
                </a>
            </div>
        </div>
    );
};

const DiagnosticsHubPanel: React.FC = () => {
    const { diagnosticServices } = useDataStore();
    const [filter, setFilter] = useState<'All' | DiagnosticService['category']>('All');
    
    const categories: ('All' | DiagnosticService['category'])[] = ['All', ...Array.from(new Set<DiagnosticService['category']>(diagnosticServices.map(s => s.category)))];

    const filteredServices = filter === 'All' 
        ? diagnosticServices 
        : diagnosticServices.filter(s => s.category === filter);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <h3 className="font-title text-xl font-bold text-cyan-300">Diagnostics Hub</h3>
            <p className="text-gray-400 text-sm mt-1 mb-6">
                Access advanced diagnostics to build a complete picture of your health. Find and book tests from leading providers, then upload the results to your Digital Twin.
            </p>
            
            <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2 overflow-x-auto custom-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filter === cat ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map(service => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
};

export default DiagnosticsHubPanel;