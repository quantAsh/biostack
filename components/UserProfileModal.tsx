import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { Protocol, CommunityStack, Badge } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useQuery } from '@tanstack/react-query';

const UserProfileModal: React.FC = () => {
  const { isProfileModalOpen, closeProfileModal, viewingProfileId } = useUIStore();
  const { fetchPublicProfile } = useDataStore();

  const { data: viewingProfileData, isLoading: isProfileLoading, error } = useQuery({
    queryKey: ['publicProfile', viewingProfileId],
    queryFn: () => {
        if (!viewingProfileId) return null;
        return fetchPublicProfile(viewingProfileId);
    },
    enabled: !!viewingProfileId && isProfileModalOpen, // Only fetch when the modal is open and has an ID
  });

  if (!isProfileModalOpen) return null;

  const renderContribution = (item: Protocol | CommunityStack, type: 'protocol' | 'stack') => (
    <div key={item.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <p className="font-semibold text-purple-300 text-sm">{item.name}</p>
      <p className="text-xs text-gray-400">{type === 'stack' ? (item as CommunityStack).description : (item as Protocol).description}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={closeProfileModal}>
      <div 
        className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl text-white p-6 sm:p-8 relative shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {isProfileLoading && (
          <div className="flex items-center justify-center h-96">
            <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {!isProfileLoading && (!viewingProfileData || error) && (
          <div className="text-center h-96 flex flex-col justify-center">
            <h2 className="font-title text-2xl font-bold text-red-400">Profile Not Found</h2>
            <p className="text-gray-500">Could not retrieve this user's profile.</p>
          </div>
        )}

        {!isProfileLoading && viewingProfileData && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
              <h2 className="font-title text-4xl font-extrabold text-gray-100">{viewingProfileData.displayName}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                <span>LVL {viewingProfileData.level}</span>
                <span>{viewingProfileData.totalXp.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4 space-y-6">
              {/* Badges */}
              <div>
                <h3 className="font-title text-lg font-bold text-purple-300 mb-3">Unlocked Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {viewingProfileData.badges.length > 0 ? viewingProfileData.badges.map(badge => (
                    <div key={badge.id} className="bg-gray-800/50 p-2.5 rounded-md flex items-center gap-2 border border-gray-700" title={`${badge.name}: ${badge.description}`}>
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs font-semibold text-gray-300">{badge.name}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">No badges unlocked yet.</p>
                  )}
                </div>
              </div>

              {/* Contributions */}
              <div>
                <h3 className="font-title text-lg font-bold text-purple-300 mb-3">Community Contributions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Published Stacks ({viewingProfileData.publishedStacks.length})</h4>
                    <div className="space-y-3">
                      {viewingProfileData.publishedStacks.length > 0 ? viewingProfileData.publishedStacks.map(stack => renderContribution(stack, 'stack'))
                       : <p className="text-sm text-gray-500">No stacks published yet.</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Shared Protocols ({viewingProfileData.sharedProtocols.length})</h4>
                     <div className="space-y-3">
                      {viewingProfileData.sharedProtocols.length > 0 ? viewingProfileData.sharedProtocols.map(protocol => renderContribution(protocol, 'protocol'))
                       : <p className="text-sm text-gray-500">No protocols shared yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <button onClick={closeProfileModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default UserProfileModal;