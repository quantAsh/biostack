import React, { useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import ProtocolCard from './ProtocolCard';
import { Protocol } from '../types';
import toast from 'react-hot-toast';

const MarketplacePanel: React.FC = () => {
    const { protocols } = useDataStore();

    const nftProtocols = useMemo(() => {
        return protocols.filter(p => p.isNft);
    }, [protocols]);
    
    const handlePurchase = (protocol: Protocol) => {
        toast.success(`Purchase functionality for "${protocol.name}" coming soon!`);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="font-title text-2xl font-bold text-gray-200">NFT Protocol Marketplace</h3>
                <p className="text-gray-400 text-sm">Discover, buy, and sell player-forged NFT protocols.</p>
            </div>

            {nftProtocols.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {nftProtocols.map(protocol => (
                        <div key={protocol.id} className="space-y-2">
                            <ProtocolCard protocol={protocol} />
                            <div className="p-2 bg-gray-800/50 rounded-md text-center">
                                <p className="text-xs text-gray-400">Forged by: {protocol.artist}</p>
                                <button 
                                    onClick={() => handlePurchase(protocol)}
                                    className="w-full mt-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-500"
                                >
                                    Purchase
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="arena-sub-panel text-center">
                    <p className="text-gray-500">The marketplace is empty. No NFT protocols have been forged yet.</p>
                </div>
            )}
        </div>
    );
};

export default MarketplacePanel;