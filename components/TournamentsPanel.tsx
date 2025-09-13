import React from 'react';
import { useDataStore } from '../stores/dataStore';
import { useUserStore } from '../stores/userStore';
import { useMutation } from '@tanstack/react-query';
import { Tournament } from '../types';
import toast from 'react-hot-toast';
import LiveMatchCard from './LiveMatchCard';

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    const { registerForTournament } = useDataStore();
    const { enrolledTournamentIds, user, bioTokens, spendBioTokens } = useUserStore();
    const isEnrolled = enrolledTournamentIds.includes(tournament.id);

    const mutation = useMutation({
        mutationFn: async (tournamentId: string) => {
            if (bioTokens < tournament.entryFee) {
                throw new Error("Insufficient $BIO balance.");
            }
            await spendBioTokens(tournament.entryFee, `Entry for ${tournament.name}`);
            await registerForTournament(tournamentId);
        },
        onSuccess: () => {
            // Toast is handled in the store
        },
        onError: (error: Error) => {
            // TODO: refund logic if spend succeeded but register failed.
            toast.error(error.message);
        }
    });

    return (
        <div className="arena-sub-panel">
            <h4 className="font-title text-xl font-bold text-white">{tournament.name}</h4>
            <p className="text-sm text-gray-400 mt-1 mb-4 h-16">{tournament.description}</p>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div className="bg-black/40 p-2 rounded-md">
                    <p className="text-xs text-green-300 uppercase font-semibold">Prize Pool</p>
                    <p className="font-mono font-bold text-lg text-white">{tournament.prizePool.toLocaleString()} $BIO</p>
                </div>
                <div className="bg-black/40 p-2 rounded-md">
                    <p className="text-xs text-purple-300 uppercase font-semibold">Entry Fee</p>
                    <p className="font-mono font-bold text-lg text-white">{tournament.entryFee} $BIO</p>
                </div>
            </div>
            <button
                onClick={() => mutation.mutate(tournament.id)}
                disabled={tournament.status !== 'upcoming' || isEnrolled || mutation.isPending || !user}
                className="w-full bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                {isEnrolled ? 'Registered' : tournament.status === 'upcoming' ? 'Register Now' : tournament.status.toUpperCase()}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Starts: {new Date(tournament.startDate).toLocaleDateString()}</p>
        </div>
    );
};

const TournamentsPanel: React.FC = () => {
    const { tournaments } = useDataStore();

    const liveTournament = tournaments.find(t => t.isLive);
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming' && !t.isLive);
    const pastChampions = [
        { tournament: 'Mindful Mogul Championship', winner: 'Dr. Anya Sharma' },
        { tournament: 'The Beta Bash', winner: 'QuantumLeaper' },
    ];

    return (
        <div className="space-y-12">
            {liveTournament && <LiveMatchCard tournament={liveTournament} />}

            <div>
                <h3 className="font-title text-2xl font-bold text-gray-200 text-center mb-6">Upcoming Events</h3>
                {upcomingTournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </div>
                ) : (
                    <div className="arena-sub-panel text-center">
                        <p className="text-gray-500">No upcoming tournaments scheduled. Check back soon!</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="arena-sub-panel">
                     <h4 className="font-title text-xl font-bold text-white mb-3">Prize Information</h4>
                     <p className="text-sm text-gray-400">Winners receive a share of the prize pool in $BIO tokens, an exclusive NFT trophy, and a featured spot on the platform.</p>
                </div>
                 <div className="arena-sub-panel">
                     <h4 className="font-title text-xl font-bold text-white mb-3">Past Champions</h4>
                     <ul className="space-y-2">
                        {pastChampions.map(c => (
                            <li key={c.tournament} className="text-sm flex justify-between">
                                <span className="text-gray-400">{c.tournament}</span>
                                <span className="font-bold text-white">{c.winner}</span>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>
        </div>
    );
};

export default TournamentsPanel;