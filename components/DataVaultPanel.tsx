import React, { useMemo, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import toast from 'react-hot-toast';

const DataVaultPanel: React.FC = () => {
  const { isDataProcessingAllowed, toggleDataProcessing, journalEntries, sealedDataVaults, sealDataVault, isPremium, archivedSnapshots, archiveBaselineSnapshot } = useUserStore();
  const { openUpgradeModal } = useUIStore();
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isSealing, setIsSealing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const availableMonthsToSeal = useMemo(() => {
    const sealedMonths = new Set(sealedDataVaults.map(v => `${v.year}-${v.month}`));
    const available = journalEntries.reduce((acc, entry) => {
      const entryDate = new Date(entry.date + 'T00:00:00Z');
      const year = entryDate.getUTCFullYear();
      const month = entryDate.getUTCMonth() + 1;
      const key = `${year}-${month}`;
      if (!sealedMonths.has(key)) {
        acc.add(key);
      }
      return acc;
    }, new Set<string>());

    return Array.from(available).map((key: string) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, key, label: new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) };
    }).sort((a, b) => b.year - a.year || b.month - a.month);
  }, [journalEntries, sealedDataVaults]);

  const handleSealVault = async () => {
    if (!selectedMonth) return;
    setIsSealing(true);
    const [year, month] = selectedMonth.split('-').map(Number);
    await sealDataVault({ year, month });
    setIsSealing(false);
    setSelectedMonth('');
  };

  const handleArchive = async () => {
      if (!isPremium) {
          openUpgradeModal();
          return;
      }
      setIsArchiving(true);
      await archiveBaselineSnapshot();
      setIsArchiving(false);
  }
  
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 my-8 mx-auto max-w-4xl">
      <div className="flex items-start gap-4 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-purple-300 flex-shrink-0">
            <path fillRule="evenodd" d="M10 1.5c-3.314 0-6 2.686-6 6v3c0 .878.342 1.717.95 2.326l3.268 3.268a2.5 2.5 0 003.536 0l3.268-3.268A4.48 4.48 0 0016 10.5v-3c0-3.314-2.686-6-6-6zm-4.5 9v-3c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5v3c0 .445-.173.871-.476 1.185l-3.256 3.256a1 1 0 01-1.414 0L6.024 11.685A2.983 2.983 0 015.5 10.5z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="font-title text-xl font-bold text-purple-300">Data Vault & Sovereignty</h3>
          <p className="text-gray-400 text-sm max-w-xl">You own your data. Control its use, create verifiable backups, and permanently archive your most critical records.</p>
        </div>
      </div>
      
      {/* Permanent Archival */}
      <div className="mb-6 bg-gray-800/40 p-4 rounded-lg border border-purple-500/30 relative">
        {!isPremium && <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center"><button onClick={openUpgradeModal} className="bg-yellow-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-yellow-400">Unlock with Kai+</button></div>}
        <h4 className="font-semibold text-gray-200 mb-2">Permanent Archival (Kai+ Feature)</h4>
        <p className="text-xs text-gray-500 mb-4">Create a "Baseline Health Snapshot" of your current state and store it immutably on the Arweave permaweb, ensuring it is preserved forever.</p>
        <button onClick={handleArchive} disabled={isArchiving || !isPremium} className="w-full sm:w-auto bg-purple-700 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-600">
            {isArchiving ? 'Archiving...' : 'Archive New Snapshot'}
        </button>
        {archivedSnapshots.length > 0 && (
             <div className="mt-4 space-y-2">
                {archivedSnapshots.map(snap => (
                    <div key={snap.id} className="text-xs flex justify-between items-center bg-gray-900/50 p-2 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-300">{snap.name}</p>
                            <p className="text-gray-500">Archived on {formatTimestamp(snap.timestamp)}</p>
                        </div>
                        <a href={`https://viewblock.io/arweave/tx/${snap.arweaveTxId}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View on Arweave</a>
                    </div>
                ))}
             </div>
        )}
      </div>

      {/* Seal & Verify */}
      <div className="mb-6 bg-gray-800/40 p-4 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-gray-200 mb-2">Seal & Verify Data Vault (IPFS)</h4>
        <p className="text-xs text-gray-500 mb-4">Select a month of journal data to encrypt and anchor on the Polygon zkEVM blockchain. This creates a permanent, verifiable "receipt" of your data's integrity.</p>
        <div className="flex flex-col sm:flex-row gap-3">
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={availableMonthsToSeal.length === 0 || isSealing}
                className="w-full flex-grow bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
            >
                <option value="">{availableMonthsToSeal.length > 0 ? 'Select a month to seal...' : 'No unsealed data available'}</option>
                {availableMonthsToSeal.map(m => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                ))}
            </select>
            <button
                onClick={handleSealVault}
                disabled={!selectedMonth || isSealing}
                className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isSealing ? (
                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : 'Seal & Verify'}
            </button>
        </div>
      </div>
      
      {/* My Sealed Vaults Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-200 mb-2">My Sealed Vaults</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {sealedDataVaults.length > 0 ? (
                sealedDataVaults.map(vault => (
                    <div key={vault.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-semibold text-purple-300">{new Date(vault.year, vault.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} Vault</p>
                                <p className="text-xs text-gray-500">Sealed on {formatTimestamp(vault.timestamp)} with {vault.entryCount} entries.</p>
                           </div>
                           <div className="flex gap-4 text-xs">
                               <a href={`https://ipfs.io/ipfs/${vault.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View on IPFS</a>
                               <a href={`https://www.oklink.com/polygon-zkevm/tx/${vault.txHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Verify on-chain</a>
                           </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-gray-600 text-sm">You haven't sealed any data vaults yet.</div>
            )}
        </div>
      </div>
      
      <div className="border-t border-gray-700/50 pt-6 space-y-4">
        <div className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg border border-gray-700">
          <div>
            <h4 className="font-semibold text-gray-200">Allow Kai to process my data</h4>
            <p className="text-xs text-gray-500">Allows Kai to analyze journal entries for personalized insights.</p>
          </div>
          <label htmlFor="data-processing-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="data-processing-toggle" className="sr-only" checked={isDataProcessingAllowed} onChange={toggleDataProcessing} />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isDataProcessingAllowed ? 'translate-x-6 bg-purple-400' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DataVaultPanel;