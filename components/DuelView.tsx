import React, { useEffect, useReducer } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { Protocol, ChallengeCard, PublicUserProfile, DuelState, StatusEffectType, InitializeDuelPayload } from '../types';
import ProtocolCard from './ProtocolCard';
import CardBack from './CardBack';
import { useGameReducer, initialDuelState } from '../hooks/useGameReducer';
import toast from 'react-hot-toast';
import { calculateStackScore } from '../utils/gameLogic';
import { CATEGORY_DETAILS } from '../constants';

const HealthBar: React.FC<{ currentHp: number; maxHp: number; label: string; isPlayer?: boolean }> = ({ currentHp, maxHp, label, isPlayer }) => {
    const percentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
    return (
        <div className="w-full max-w-sm">
            <div className="flex justify-between items-baseline mb-1">
                <p className="font-hud font-bold text-lg text-white">{label}</p>
                <p className="font-mono text-xl font-bold text-white">{Math.max(0, Math.round(currentHp))} <span className="text-sm">/ {maxHp}</span></p>
            </div>
            <div className="w-full bg-black/50 rounded-full h-4 border-2 border-gray-800 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isPlayer ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const statusEffectDetails: Record<StatusEffectType, { icon: string, color: string, description: string }> = {
    'Focused': { icon: '🎯', color: 'border-green-400', description: 'Next attack deals 30% more damage.' },
    'Calm': { icon: '🧘', color: 'border-blue-400', description: 'Defense increased by 50%.' },
    'Energized': { icon: '⚡', color: 'border-yellow-400', description: 'Next protocol costs 2 less Stamina.' },
    'Inflamed': { icon: '🔥', color: 'border-red-400', description: 'Take 10 damage at the start of your turn.' },
    'Fatigued': { icon: '💤', color: 'border-gray-500', description: 'Cannot play protocols costing more than 5 Stamina.' },
};

const StatusEffectsBar: React.FC<{ effects: DuelState['playerStatusEffects'] }> = ({ effects }) => {
    if (effects.length === 0) return null;
    return (
        <div className="status-effects-bar z-20">
            {effects.map(effect => (
                <div key={effect.id} className="status-effect-icon" style={{ borderColor: statusEffectDetails[effect.type].color }}>
                    <span className="text-xl">{statusEffectDetails[effect.type].icon}</span>
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{effect.duration}</span>
                    <div className="tooltip">
                        <p className="font-bold">{effect.type}</p>
                        <p>{statusEffectDetails[effect.type].description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const VfxDisplay: React.FC<{ effect: DuelState['ui']['playerVfx'] }> = ({ effect }) => {
    if (!effect) return null;
    if (effect.type === 'heal') {
        return (
            <div className="vfx-container">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="vfx-heal-particle" style={{ '--x': `${Math.random() * 100}%`, '--delay': `${Math.random() * 0.5}s` } as React.CSSProperties}></div>
                ))}
            </div>
        );
    }
    return (
        <div className="vfx-container">
            <div className="vfx-burst-effect" style={{ '--vfx-color': effect.color || 'white' } as React.CSSProperties}></div>
        </div>
    );
};

const OpponentDisplay: React.FC<{ opponent: ChallengeCard | PublicUserProfile; damage: number | null; statusEffects: DuelState['opponentStatusEffects']; vfx: DuelState['ui']['opponentVfx'] }> = ({ opponent, damage, statusEffects, vfx }) => (
    <div className="relative w-72 h-[450px]">
        {'hp' in opponent ? ( // It's a ChallengeCard
            <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/50 rounded-2xl overflow-hidden w-full h-full flex flex-col">
                <div className="relative h-1/2 w-full overflow-hidden"><img src={opponent.imageUrl} alt={opponent.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div></div>
                <div className="p-4 flex flex-col flex-grow text-center"><h3 className="font-title text-xl font-bold text-white">{opponent.name}</h3><p className="text-sm text-gray-400 mt-1 flex-grow">{opponent.description}</p></div>
            </div>
        ) : ( // It's a PublicUserProfile
            <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl p-4 w-full h-full flex flex-col items-center justify-center text-center">
                <h3 className="font-title text-2xl font-bold text-white">{opponent.displayName}</h3>
            </div>
        )}
        {damage !== null && <div className="damage-popup">-{damage}</div>}
        <StatusEffectsBar effects={statusEffects} />
        <VfxDisplay effect={vfx} />
    </div>
);

const DuelView: React.FC = () => {
    const { activeDuel, endDuel } = useUIStore();
    const { protocolMastery, updatePvpRating } = useUserStore();
    const [gameState, dispatch] = useReducer(useGameReducer, initialDuelState);

    useEffect(() => {
        if (activeDuel) {
            const { opponent: duelOpponent, ...restOfDuel } = activeDuel;
            const payload: InitializeDuelPayload = {
                ...restOfDuel,
                protocolMastery,
            };
    
            if (duelOpponent && 'hp' in duelOpponent) { // Duck typing for ChallengeCard
                payload.challenge = duelOpponent;
            } else { // It's a PublicUserProfile
                payload.opponent = duelOpponent as PublicUserProfile;
            }
    
            dispatch({ type: 'INITIALIZE_DUEL', payload });
        }
    }, [activeDuel, protocolMastery]);

    useEffect(() => {
        if (gameState.status === 'victory' || gameState.status === 'defeat') {
            const victory = gameState.status === 'victory';
            if(gameState.opponent) {
                updatePvpRating(victory);
            }
            endDuel();
        } else if (gameState.turn === 'opponent' && gameState.status === 'ongoing') {
            const opponentTurnTimeout = setTimeout(() => {
                dispatch({ type: 'PROCESS_START_OF_TURN', payload: { isPlayer: false } });
                const aiThinkTimeout = setTimeout(() => dispatch({ type: 'OPPONENT_TURN' }), 1200);
                return () => clearTimeout(aiThinkTimeout);
            }, 1000);
            return () => clearTimeout(opponentTurnTimeout);
        } else if (gameState.turn === 'player' && gameState.status === 'ongoing') {
            const playerTurnTimeout = setTimeout(() => dispatch({ type: 'PROCESS_START_OF_TURN', payload: { isPlayer: true } }), 500);
            return () => clearTimeout(playerTurnTimeout);
        }
    }, [gameState.status, gameState.turn]);
    
    // New effect to handle post-attack state changes like turn switching
    useEffect(() => {
        if (gameState.ui.attackingCardId) {
            const timer = setTimeout(() => {
                dispatch({
                    type: 'ATTACK_ANIMATION_COMPLETE',
                    payload: { wasPlayerAttack: gameState.ui.attackingCardId!.startsWith('player') }
                });
            }, 1000); // Duration of the attack animation
            return () => clearTimeout(timer);
        }
    }, [gameState.ui.attackingCardId]);

    const handleCardPlay = (protocol: Protocol) => {
        if (gameState.turn !== 'player' || gameState.ui.attackingCardId) {
            toast.error(gameState.ui.attackingCardId ? "Attack in progress." : "Not your turn.");
            return;
        }
        dispatch({ type: 'PLAY_CARD', payload: { card: protocol, isPlayer: true } });
    };

    const handleSurrender = () => {
        dispatch({ type: 'END_DUEL', payload: { victory: false }});
    };
    
    const { challenge, opponent, playerHp, maxPlayerHp, opponentHp, maxOpponentHp, turn, hand, opponentHand, status, message, activeCombo, bioRhythm, playerStamina, playerStatusEffects, opponentStatusEffects, primedCategory, ui } = gameState;

    if (status !== 'ongoing' && status !== 'victory' && status !== 'defeat') {
      return <div className="duel-overlay" />;
    }

    const currentOpponent = challenge || opponent;
    
    const opponentName = opponent?.displayName || challenge?.name || 'Opponent';
    const opponentStackScore = opponentHand ? calculateStackScore(opponentHand) : 0;
    const isPlayerTurn = turn === 'player' && status === 'ongoing';
    const bioRhythmPercent = ((bioRhythm + 100) / 200) * 100;

    return (
        <div className="duel-overlay">
            {status === 'victory' && (
                <div className="victory-screen">
                    <h2 className="victory-text">VICTORY</h2>
                    {opponent && (
                        <div className="victory-reward">
                            <p>🔥 STREAK CATALYST ACQUIRED! 🔥</p>
                            <p>Your next protocol streak increase is DOUBLED!</p>
                        </div>
                    )}
                </div>
            )}
            {status === 'defeat' && <div className="defeat-screen"><h2 className="defeat-text">DEFEAT</h2></div>}

            <button onClick={handleSurrender} className="absolute top-6 right-6 z-[3000] bg-red-800/80 text-red-100 font-bold py-2 px-4 rounded-lg">Surrender</button>
            {activeCombo && <div className="combo-popup">{activeCombo.name}!</div>}

            <div className={`duel-arena ${ui.screenEffect === 'shake' ? 'screen-shake' : ''}`}>
                <div className="opponent-info-panel">
                    <div className="flex flex-col gap-2">
                        <HealthBar currentHp={opponentHp} maxHp={maxOpponentHp} label={opponent ? `${opponent.displayName} - Lvl ${opponent.level}` : opponentName} />
                    </div>
                    {opponent && (
                        <div className="relative has-tooltip">
                            <div className="stack-score-display cursor-help">
                                <p className="value">{opponentStackScore}</p>
                                <p className="label">Stack Score</p>
                            </div>
                            <div className="tooltip">
                                This score represents the aggregate power of your opponent's hand, including potential protocol synergies.
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="player-info-panel">
                    <HealthBar currentHp={playerHp} maxHp={maxPlayerHp} label="Your Vitality" isPlayer />
                    <div className="flex items-center gap-2"><span className="stamina-display">{playerStamina}</span><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.986 4.31a1.5 1.5 0 012.028 2.028l-2.33 2.33a1.5 1.5 0 01-2.122 0l-.884-.884-1.18 1.18a.75.75 0 001.06 1.06l1.18-1.18.884.884a1.5 1.5 0 010 2.122l-2.33 2.33a1.5 1.5 0 01-2.028 2.028l-.16-.16a1.5 1.5 0 01-2.028-2.028l2.33-2.33a1.5 1.5 0 012.122 0l.884.884 1.18-1.18a.75.75 0 00-1.06-1.06l-1.18 1.18-.884-.884a1.5 1.5 0 010-2.122l2.33-2.33c.556-.556 1.472-.556 2.028 0l.16.16z" clipRule="evenodd" /></svg></div>
                </div>

                <div className="opponent-area">
                    <OpponentDisplay opponent={currentOpponent!} damage={ui.opponentDamage} statusEffects={opponentStatusEffects} vfx={ui.opponentVfx} />
                    {opponent && (
                        <div className="absolute top-0 w-full">
                            <div className="opponent-hand">
                                {opponentHand.map((card, i) => (
                                    <div key={`opponent-${i}-${card.id}`} className={`hand-card w-48 ${ui.attackingCardId === `opponent-${card.id}` ? 'attacking-card-opponent' : ''}`} style={{ transform: `rotate(${(i - Math.floor(opponentHand.length / 2)) * 5}deg)` }}>
                                        {ui.attackingCardId === `opponent-${card.id}` ? <ProtocolCard protocol={card} isPlayable /> : <CardBack />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mid-area flex items-center justify-center gap-8">
                    <div className="bio-rhythm-meter"><div className="bio-rhythm-indicator" style={{top: `${100 - bioRhythmPercent}%`}}></div></div>
                    <div>
                        <p className="font-hud text-2xl text-white tracking-widest">{message}</p>
                        {primedCategory && <p className="primed-indicator text-center mt-2" style={{color: CATEGORY_DETAILS[primedCategory].color}}>PRIMED: {primedCategory}</p>}
                    </div>
                </div>
                
                 <div className="player-area">
                    <div className="relative flex flex-col items-center w-full gap-2">
                        <div className={`player-hand ${isPlayerTurn ? 'player-turn' : ''} z-10`}>
                            {hand.map((protocol, i) => (
                                <div key={protocol.id} className={`hand-card w-48 ${ui.attackingCardId === `player-${protocol.id}` ? 'attacking-card' : ''} ${primedCategory && protocol.categories.includes(primedCategory) ? 'card-glow-primed' : ''}`} style={{ transform: `rotate(${(i - Math.floor(hand.length / 2)) * 5}deg) translateY(0rem)` }} onClick={isPlayerTurn ? () => handleCardPlay(protocol) : undefined}>
                                    <ProtocolCard protocol={protocol} isPlayable />
                                </div>
                            ))}
                        </div>
                        <StatusEffectsBar effects={playerStatusEffects} />
                        <VfxDisplay effect={ui.playerVfx} />
                    </div>
                </div>
            </div>
            {ui.playerDamage !== null && <div className="damage-popup bottom-1/3 left-1/2">-{ui.playerDamage}</div>}
        </div>
    );
};

export default DuelView;