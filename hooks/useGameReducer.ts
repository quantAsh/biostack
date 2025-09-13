import { useReducer } from 'react';
import { DuelState, GameAction, Protocol, StatusEffect, StatusEffectType } from '../types';
import { combos } from '../data/combos';
import toast from 'react-hot-toast';

export const initialDuelState: DuelState = {
    playerHp: 100,
    opponentHp: 100,
    maxPlayerHp: 100,
    maxOpponentHp: 100,
    turn: 'player',
    hand: [],
    opponentHand: [],
    message: null,
    status: 'pending',
    playerStamina: 10,
    opponentStamina: 10,
    bioRhythm: 0,
    playerStatusEffects: [],
    opponentStatusEffects: [],
    primedCategory: null,
    activeCombo: null,
    ui: {
        attackingCardId: null,
        playerDamage: null,
        opponentDamage: null,
        screenEffect: null,
        playerVfx: null,
        opponentVfx: null,
    }
};

const applyStartOfTurnEffects = (state: DuelState, isPlayer: boolean): DuelState => {
    let newState = { ...state };
    const target = isPlayer ? 'player' : 'opponent';
    const opponentName = newState.opponent?.displayName || newState.challenge?.name || 'Opponent';
    
    const statusEffects = isPlayer ? newState.playerStatusEffects : newState.opponentStatusEffects;
    let hp = isPlayer ? newState.playerHp : newState.opponentHp;
    let damageTaken = 0;

    const inflamedEffect = statusEffects.find(e => e.type === 'Inflamed');
    if (inflamedEffect) {
        damageTaken = 10;
        hp -= damageTaken;
        toast.error(`${isPlayer ? 'You' : opponentName} took ${damageTaken} damage from Inflamed!`);
        newState.ui = { ...newState.ui, [`${target}Vfx`]: { type: 'status', color: '#f87171' } };
    }

    const updatedEffects = statusEffects
        .map(effect => ({ ...effect, duration: effect.duration - 1 }))
        .filter(effect => effect.duration > 0);

    if (isPlayer) {
        newState.playerHp = hp;
        newState.playerStatusEffects = updatedEffects;
        newState.ui.playerDamage = damageTaken > 0 ? damageTaken : null;
    } else {
        newState.opponentHp = hp;
        newState.opponentStatusEffects = updatedEffects;
        newState.ui.opponentDamage = damageTaken > 0 ? damageTaken : null;
    }
    
    if (hp <= 0) {
        newState.status = isPlayer ? 'defeat' : 'victory';
        newState.message = isPlayer ? "You have been defeated!" : "Victory!";
    }

    return newState;
};

const playCard = (state: DuelState, card: Protocol, isPlayer: boolean): DuelState => {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy for mutation
    const attacker = isPlayer ? 'player' : 'opponent';
    const defender = isPlayer ? 'opponent' : 'player';

    // 1. Check Costs & Conditions
    const stamina = isPlayer ? newState.playerStamina : newState.opponentStamina;
    const energizedEffect = (isPlayer ? newState.playerStatusEffects : newState.opponentStatusEffects).find(e => e.type === 'Energized');
    let cost = card.staminaCost || 0;
    if (energizedEffect) cost = Math.max(0, cost - 2);

    if (stamina < cost) {
        toast.error("Not enough Stamina!");
        return state;
    }

    const fatiguedEffect = (isPlayer ? newState.playerStatusEffects : newState.opponentStatusEffects).find(e => e.type === 'Fatigued');
    if (fatiguedEffect && (card.staminaCost || 0) > 5) {
        toast.error("Fatigued: Cannot play high-cost protocols.");
        return state;
    }

    // 2. Calculate Damage & Effects
    let damage = card.gameStats?.attack || 0;
    
    // Power-ups
    const focusedEffect = (isPlayer ? newState.playerStatusEffects : newState.opponentStatusEffects).find(e => e.type === 'Focused');
    if (focusedEffect) damage = Math.round(damage * 1.3);

    // Combo
    const comboToActivate = newState.primedCategory && card.categories.includes(newState.primedCategory)
        ? combos.find(c => c.primeCategory === newState.primedCategory && card.categories.includes(c.triggerCategory))
        : null;
    if (comboToActivate) {
        newState.activeCombo = comboToActivate;
        newState.primedCategory = null;
        toast(`${comboToActivate.name} Combo!`);
        if (comboToActivate.effect === 'double_damage') damage *= 2;
    } else {
        newState.primedCategory = card.primesCategory || newState.primedCategory;
    }
    
    // Defense
    const calmEffect = (isPlayer ? newState.opponentStatusEffects : newState.playerStatusEffects).find(e => e.type === 'Calm');
    if (calmEffect) damage = Math.round(damage * 0.5);

    // 3. Update State
    newState[`${attacker}Stamina`] -= cost;
    newState.bioRhythm = Math.max(-100, Math.min(100, newState.bioRhythm + (card.bioRhythmImpact || 0)));
    newState[`${defender}Hp`] -= damage;

    // Remove consumed effects
    if (energizedEffect) newState[`${attacker}StatusEffects`] = newState[`${attacker}StatusEffects`].filter((e: StatusEffect) => e.id !== energizedEffect.id);
    if (focusedEffect) newState[`${attacker}StatusEffects`] = newState[`${attacker}StatusEffects`].filter((e: StatusEffect) => e.id !== focusedEffect.id);
    
    // Apply new effects
    if (card.appliesStatusEffect) {
        const target = card.appliesStatusEffect.target === 'self' ? attacker : defender;
        const newEffect: StatusEffect = { id: crypto.randomUUID(), type: card.appliesStatusEffect.type, duration: card.appliesStatusEffect.duration };
        newState[`${target}StatusEffects`].push(newEffect);
    }
    
    // Remove played card from hand
    const attackerHandProperty = isPlayer ? 'hand' : 'opponentHand';
    newState[attackerHandProperty] = newState[attackerHandProperty].filter((c: Protocol) => c.id !== card.id);
    
    // 4. Update UI state
    newState.ui = {
        ...newState.ui,
        attackingCardId: `${attacker}-${card.id}`,
        [`${defender}Damage`]: damage,
        screenEffect: 'shake'
    };

    return newState;
};


export const useGameReducer = (state: DuelState, action: GameAction): DuelState => {
    switch (action.type) {
        case 'INITIALIZE_DUEL':
            const { payload: duelData } = action;
            const { protocolMastery } = duelData as any;
            
            let initializedState = { ...initialDuelState, ...duelData };

            initializedState.hand = initializedState.hand.map((card: Protocol) => {
                const mastery = protocolMastery[card.id];
                if (mastery && ['Adept', 'Expert', 'Master'].includes(mastery.level)) {
                    toast.success(`${card.name} gets +5/+5 Adept bonus!`);
                    return { ...card, gameStats: { attack: (card.gameStats?.attack || 0) + 5, defense: (card.gameStats?.defense || 0) + 5 } };
                }
                return card;
            });

            initializedState.hand.forEach((card: Protocol) => {
                 const mastery = protocolMastery[card.id];
                 if (mastery && ['Expert', 'Master'].includes(mastery.level) && card.expertAbility?.description.includes("Passive: At the start of the duel")) {
                    if (card.expertAbility.name === "Cellular Cleanup") {
                        initializedState.maxPlayerHp += 10;
                        initializedState.playerHp += 10;
                        toast.success(`Expert Passive: ${card.expertAbility.name} activated!`);
                    }
                }
            });
            initializedState.status = 'ongoing';
            return initializedState;
        
        case 'PROCESS_START_OF_TURN':
            return applyStartOfTurnEffects(state, action.payload.isPlayer);
        
        case 'PLAY_CARD':
            return playCard(state, action.payload.card, action.payload.isPlayer);
            
        case 'OPPONENT_TURN':
            const { opponentHand, opponentStamina, opponentStatusEffects } = state;
            if (opponentHand.length === 0) {
                toast("Opponent has no cards and passes.");
                return { ...state, turn: 'player', message: "Your turn!", opponentStamina: opponentStamina + 2 };
            }
            const isOpponentFatigued = opponentStatusEffects.some(e => e.type === 'Fatigued');
            const hasEnergized = opponentStatusEffects.some(e => e.type === 'Energized');
            const effectiveStamina = opponentStamina + (hasEnergized ? 2 : 0);
            
            let playableCards = opponentHand.filter(card => {
                const cost = card.staminaCost || 0;
                if (isOpponentFatigued && cost > 5) return false;
                return cost <= effectiveStamina;
            });
            
            if (playableCards.length === 0) {
                toast("Opponent is out of stamina and passes.");
                return { ...state, turn: 'player', message: "Your turn!", opponentStamina: opponentStamina + 2 };
            }

            const cardToPlay = playableCards.sort((a, b) => (b.gameStats?.attack || 0) - (a.gameStats?.attack || 0))[0];
            return playCard(state, cardToPlay, false);
        
        case 'END_DUEL':
             return { ...state, status: action.payload.victory ? 'victory' : 'defeat', message: action.payload.victory ? 'Victory!' : 'Defeat!' };
        
        case 'ATTACK_ANIMATION_COMPLETE':
            const { wasPlayerAttack } = action.payload;
            const newTurn = wasPlayerAttack ? 'opponent' : 'player';
            const newMessage = newTurn === 'player' ? "Your turn!" : "Opponent's turn.";
            return {
                ...state,
                turn: newTurn,
                message: newMessage,
                ui: {
                    ...state.ui,
                    attackingCardId: null,
                    playerDamage: null,
                    opponentDamage: null,
                    screenEffect: null,
                    playerVfx: null,
                    opponentVfx: null
                }
            };

        default:
            return state;
    }
};