import React, { useState } from 'react';
import { Goal } from '../types';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';

const goals: Goal[] = [
  { id: 'energy', title: 'Boost Energy', description: 'Combat fatigue and increase vitality.' },
  { id: 'focus', title: 'Improve Focus', description: 'Enhance concentration and mental clarity.' },
  { id: 'sleep', title: 'Enhance Sleep', description: 'Improve sleep quality and wake up refreshed.' },
  { id: 'stress', title: 'Reduce Stress', description: 'Build resilience and calm your mind.' },
  { id: 'longevity', title: 'Promote Longevity', description: 'Support long-term health and wellness.' },
  { id: 'fitness', title: 'Physical Fitness', description: 'Improve strength and endurance.' },
];

const OnboardingModal: React.FC = () => {
  const { showOnboarding, closeOnboarding, startWalkthrough } = useUIStore(state => ({
    showOnboarding: state.showOnboarding,
    closeOnboarding: state.closeOnboarding,
    startWalkthrough: state.startWalkthrough,
  }));
  const setUserGoals = useUserStore(state => state.setUserGoals);
  const platformConfig = useDataStore(state => state.platformConfig);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  if (!showOnboarding) return null;

  const toggleGoal = (goalTitle: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalTitle)) return prev.filter(g => g !== goalTitle);
      // Enforce max 3 selections
      if (prev.length >= 3) return prev;
      return [...prev, goalTitle];
    });
  };

  const handleSubmit = async () => {
    if (selectedGoals.length === 0) return;

    // Persist goals first to avoid race conditions where the walkthrough
    // starts before the goals are saved.
    await setUserGoals(selectedGoals);
    closeOnboarding();

    if (platformConfig?.isGuidedWalkthroughEnabled) {
      // Start walkthrough with the chosen primary goal (first selected)
      startWalkthrough({ primaryGoal: selectedGoals[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl text-white p-8">
  <h1 className="font-title text-4xl font-extrabold text-cyan-300 mb-2">Welcome to biostack!</h1>
        <p className="text-gray-400 mb-6">Let's personalize your experience. What are your primary goals? (Select up to 3)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {goals.map(goal => {
            const isSelected = selectedGoals.includes(goal.title);
            const isDisabled = !isSelected && selectedGoals.length >= 3;
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.title)}
                disabled={isDisabled}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${isSelected ? 'bg-cyan-500/20 border-cyan-400' : 'bg-gray-800 border-gray-700 hover:border-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <h3 className="font-bold text-lg text-white">{goal.title}</h3>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedGoals.length === 0}
          className="w-full bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Start My Journey
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;