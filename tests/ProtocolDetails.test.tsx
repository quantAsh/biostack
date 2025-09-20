/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ReactDOM from 'react-dom/client';
import ProtocolDetails from '../components/ProtocolDetails';
import { ThemeProvider, useTheme } from '../components/ThemeContext';
import * as uiStore from '../stores/uiStore';

// Minimal fake protocol
const fakeProtocol = {
  id: 'proto-1',
  name: 'Test Protocol',
  categories: ['Breathwork'],
  difficulty: 'Beginner',
  duration: '10m',
  creator: 'Test',
  benefits: ['calm'],
  instructions: ['breathe'],
  originStory: 'story',
  description: 'desc',
  bioScore: 42,
  theme: 'digital-human',
};

// Helper component to introspect the current theme
const ThemeObserver: React.FC<{onTheme: (t: any) => void}> = ({ onTheme }) => {
  const { theme } = useTheme();
  // Call onTheme when theme changes. Do not return the result of onTheme (e.g. array.push)
  React.useEffect(() => { onTheme(theme); }, [theme, onTheme]);
  return null;
};

describe('ProtocolDetails theme integration', () => {
  let originalUseUIStore: any;

  beforeEach(() => {
    originalUseUIStore = { ...uiStore };
    // Mock the ui store to provide detailedProtocol and closeDetails
    vi.spyOn(uiStore, 'useUIStore' as any).mockImplementation((selector: any) => {
      // Return the pieces that ProtocolDetails selects
      const state = {
        detailedProtocol: fakeProtocol,
        closeDetails: () => {},
        isDetailsFullScreen: false,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies protocol theme on mount and restores on unmount', async () => {
    let observedThemes: any[] = [];
    const onTheme = (t: any) => observedThemes.push(t);

    // Mount into a detached container using ReactDOM
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(
      <ThemeProvider>
        <ThemeObserver onTheme={onTheme} />
        <ProtocolDetails />
      </ThemeProvider>
    );

    // Wait for the theme observer to receive the protocol theme.
    // Effects can be async in the test environment, so poll briefly.
    const waitForTheme = async (expected: string, timeout = 500) => {
      const start = Date.now();
      // simple poll loop
      while (Date.now() - start < timeout) {
        if (observedThemes.length > 0 && observedThemes[observedThemes.length - 1] === expected) return;
        // yield to event loop
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 10));
      }
      throw new Error('Timed out waiting for theme: ' + expected + ' observed: ' + JSON.stringify(observedThemes));
    };

    await waitForTheme('digital-human');

    // Unmount and ensure theme restored to initial
    root.unmount();

  // The observer recorded initial 'classic' then 'digital-human'
  expect(observedThemes[0]).toBe('classic');
  expect(observedThemes[observedThemes.length - 1]).toBe('digital-human');
  });
});
