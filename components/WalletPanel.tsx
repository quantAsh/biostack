import React from 'react';
import { useUserStore } from '../stores/userStore';
import { CryptoTransaction } from '../types';

const WalletPanel: React.FC = () => {
    const { bioTokens, cryptoTransactions } = useUserStore();

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex-grow">
                    <h3 className="font-title text-xl font-bold text-green-300">My Wallet</h3>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Track your $BIO token balance and transaction history.
                    </p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <p className="font-title font-bold text-4xl text-white">
                        {bioTokens.toLocaleString()} <span className="text-2xl text-green-300">$BIO</span>
                    </p>
                </div>
            </div>

            <div>
                <h4 className="font-title text-lg font-bold text-gray-300 mb-4">Transaction History</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {cryptoTransactions.length > 0 ? (
                        cryptoTransactions.map((tx: CryptoTransaction) => (
                            <div key={tx.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-200 text-sm capitalize">{tx.description}</p>
                                    <p className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                                </div>
                                <div className={`text-lg font-bold font-mono ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount} $BIO
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-600 text-sm">
                            No transactions yet. Complete protocols to earn $BIO!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletPanel;