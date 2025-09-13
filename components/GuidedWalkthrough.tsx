import React, { useState, useMemo, useLayoutEffect, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { AdminTab, ArenaSubView, MyStackLabSubView, SettingsTab, View, Category } from '../types';

interface WalkthroughStep {
    selector: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    view: View;
    adminTab?: AdminTab;
    settingsTab?: SettingsTab;
    arenaSubView?: ArenaSubView;
    myStackLabSubView?: MyStackLabSubView;
    kaiSubView?: 'today' | 'progress';
    adminOnly?: boolean;
}

const goalToCategoryMap: Record<string, Category> = {
  'Boost Energy': Category.Energy,
  'Improve Focus': Category.Cognitive,
  'Enhance Sleep': Category.Sleep,
  'Reduce Stress': Category.StressManagement,
  'Promote Longevity': Category.Longevity,
  'Physical Fitness': Category.Movement,
};

const generateWalkthroughSteps = (displayName: string, primaryGoal: string): WalkthroughStep[] => {
    const goalCategory = goalToCategoryMap[primaryGoal] || Category.Cognitive;
    const friendlyGoal = primaryGoal.toLowerCase().replace(/^(improve|enhance|reduce|promote)\s/, '');

    return [
            {
                // Prefer targeting the visible card's data-tour-id if present, else fall back to category-specific container
                selector: `.card[data-tour-id^="protocol-card-"], .protocol-card-container[data-category="${goalCategory}"] .card`,
                title: `Welcome, ${displayName}!`,
                content: `Kai here. Based on your goal to ${friendlyGoal}, I've found a protocol that might be a great starting point. Tap to flip it.`,
                position: 'right',
                view: 'explore',
            },
      {
        selector: '[data-tour-id="add-to-stack-button"]',
        title: 'Build Your Stack',
        content: "This is the 'Add to Stack' button. It's the core action for building your personalized wellness routine.",
        position: 'top',
        view: 'explore',
      },
            {
                selector: 'button[data-view-id="kai"]',
                title: 'Meet Kai, Your AI Coach',
                content: 'This is your command center. Kai helps you plan your day, analyze your progress, and run simulations.',
                position: 'bottom',
                view: 'kai',
            },
            // Show progress (console) before the agenda heading so the tour flows left->right
            {
                // Prefer the explicit progress tab button in the Kai panel
                selector: '[data-tour-id="kai-progress-tab"], [data-view-id="digital-twin-console"], button[data-view-id="digital-twin-console"], [data-tour-id="digital-twin-console"]',
                title: "Kai's AI Console",
                content: "Here you can triage diagnostic data, get intelligence briefings, and run predictive forecasts on your Digital Twin.",
                position: 'left',
                view: 'kai',
                kaiSubView: 'progress',
            },
            {
                // Prefer the stable title element we added to the Kai panel, otherwise fall back to a view-id or button
                selector: '[data-tour-id="intelligent-agenda-title"], [data-view-id="intelligent-agenda"], button[data-view-id="intelligent-agenda"]',
                title: "Kai's Intelligent Agenda",
                content: "Based on your stack and connected calendar, Kai automatically schedules your protocols for the optimal time of day.",
                position: 'bottom',
                view: 'kai',
                kaiSubView: 'today',
            },
            {
                // Prefer the header tab button (visible nav), fallback to other buttons with the view-id
                selector: '.main-header-hud [data-view-id="my-stack-lab"], header [data-view-id="my-stack-lab"], button[data-view-id="my-stack-lab"]',
                title: 'The Stack Lab',
                content: 'Here you can manage your stack, personalize protocols, and share your creations with the community.',
                position: 'bottom',
                view: 'my-stack-lab',
            },
      {
        selector: '[data-view-id="my-stack-content"]',
        title: 'Your Active Stack',
        content: 'All the protocols you add appear here. This is the core of your personalized wellness operating system.',
        position: 'right',
        view: 'my-stack-lab',
        myStackLabSubView: 'stack-x',
      },
      {
        selector: '[data-view-id="my-stack-lab-tools"]',
        title: 'The Lab Bench',
        content: 'Use these tools to publish your stacks, submit new protocols, or even fork an existing protocol to create your own personalized version.',
        position: 'left',
        view: 'my-stack-lab',
      },
      {
        selector: 'button[data-view-id="arena"]',
        title: 'The Arena',
        content: 'Ready to test your mastery? Challenge biological adversaries in PvE duels or compete against other users in the PvP Synapse Arena.',
        position: 'bottom',
        view: 'arena',
      },
      {
        selector: '[data-view-id="arena-player-vitals"]',
        title: 'Your Vitals',
        content: 'This is your status in the Arena. Your rank and rating will increase as you win duels against other players.',
        position: 'right',
        view: 'arena',
        arenaSubView: 'bio-duels',
      },
      {
        selector: '[data-view-id="arena-challenge-grid"]',
        title: 'Select a Challenge',
        content: 'These are biological adversaries. Defeating them will earn you XP and rewards.',
        position: 'top',
        view: 'arena',
        arenaSubView: 'bio-duels',
      },
      {
        selector: '[data-view-id="arena-challenge-card-stats"]',
        title: 'Adversary Stats',
        content: 'Each challenge has Health Points (HP) and Attack power. Choose your protocols wisely to counter them.',
        position: 'top',
        view: 'arena',
        arenaSubView: 'bio-duels',
      },
      {
        selector: '[data-view-id="arena-challenge-button"]',
        title: 'Initiate Duel',
        content: 'When you are ready, click here to begin the duel. Your active stack will become your weapon!',
        position: 'top',
        view: 'arena',
        arenaSubView: 'bio-duels',
      },
            {
                // Prefer header nav settings button when available
                selector: '.main-header-hud [data-view-id="settings"], header [data-view-id="settings"], button[data-view-id="settings"]',
                title: 'System Settings',
                content: 'Finally, the settings panel is where you can connect wearables, manage your data sovereignty, and customize the UI.',
                position: 'bottom',
                view: 'settings',
            },
      {
        selector: '[data-view-id="settings-integrations"]',
        title: 'Connect Your Devices',
        content: 'Connect wearables and other data sources here to give Kai a complete picture of your physiology.',
        position: 'right',
        view: 'settings',
        settingsTab: 'integrations',
      },
      {
        selector: '#admin-walkthrough-toggle',
        title: 'Admin Controls',
        content: 'As an admin, you can toggle this guided walkthrough for new users right here in the Platform settings.',
        position: 'top',
        adminOnly: true,
        view: 'admin',
        adminTab: 'platform',
      },
    ];
};

const GuidedWalkthrough: React.FC = () => {
    const { 
        view,
        walkthroughStep, 
        nextWalkthroughStep, 
        endWalkthrough, 
        setView, 
        setSettingsTab, 
        setAdminTab, 
        setMyStackLabSubView, 
        setArenaSubView, 
        setKaiSubView, 
        walkthroughContext,
        adminTab,
        settingsTab,
        arenaSubView,
        myStackLabSubView,
        kaiSubView
    } = useUIStore();
    const { isAdmin, displayName } = useUserStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
    const rafRef = useRef<number | null>(null);

    const activeSteps = useMemo(() => {
        const goal = walkthroughContext?.primaryGoal || 'Improve Focus';
        const name = displayName || 'Biohacker';
        const steps = generateWalkthroughSteps(name, goal);
        return steps.filter(step => !step.adminOnly || isAdmin);
    }, [isAdmin, displayName, walkthroughContext]);

    const currentStep = activeSteps[walkthroughStep];

    useLayoutEffect(() => {
        if (!currentStep) {
            endWalkthrough();
            return;
        }

        // Handle view changes required for the step
        if (view !== currentStep.view) setView(currentStep.view);
        if (currentStep.adminTab && adminTab !== currentStep.adminTab) setAdminTab(currentStep.adminTab);
        if (currentStep.settingsTab && settingsTab !== currentStep.settingsTab) setSettingsTab(currentStep.settingsTab);
        if (currentStep.arenaSubView && arenaSubView !== currentStep.arenaSubView) setArenaSubView(currentStep.arenaSubView);
        if (currentStep.myStackLabSubView && myStackLabSubView !== currentStep.myStackLabSubView) setMyStackLabSubView(currentStep.myStackLabSubView);
        if (currentStep.kaiSubView && kaiSubView !== currentStep.kaiSubView) setKaiSubView(currentStep.kaiSubView);

        let attempts = 0;
        const maxAttempts = 120; // 120 * 100ms = 12 seconds
        let intervalId: number | undefined;
        const startDelay = 1200; // ms

        const findAndPositionElement = async () => {
            attempts++;
            if (attempts > maxAttempts) {
                if (intervalId) clearInterval(intervalId);
                console.warn(`Walkthrough element not found after ${maxAttempts * 100}ms: ${currentStep.selector}. Attempts: ${attempts}. Pausing walkthrough until UI is ready.`);
                return;
            }

            if (attempts % 10 === 0) console.debug('[walkthrough] find attempt', attempts, 'for selector', currentStep.selector);

            // compute header height to ensure highlighted element sits below it
            const header = document.querySelector('.header, header, .dashboard-header') as HTMLElement | null;
            const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;

            const allNodes = Array.from(document.querySelectorAll(currentStep.selector)) as Element[];

            // Filter out hidden elements, ones with aria-hidden, zero opacity, or zero-size
            let nodes = allNodes.filter(n => {
                const el = n as HTMLElement;
                if (!el) return false;
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') < 0.05) return false;
                if (el.hasAttribute('aria-hidden') && el.getAttribute('aria-hidden') === 'true') return false;
                const r = el.getBoundingClientRect();
                if (r.width <= 0 || r.height <= 0) return false;
                return true;
            });

            // If none of the matched nodes are currently in the viewport, but matches do exist,
            // scroll the most reasonable candidate into view and then let the normal flow handle it.
            const visibleNodes = nodes.filter(n => {
                const r = (n as HTMLElement).getBoundingClientRect();
                return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
            });
            if (visibleNodes.length === 0 && nodes.length > 0) {
                // Prefer a node that is nearest to the top of the viewport on the page
                nodes.sort((a, b) => {
                    const ra = (a as HTMLElement).getBoundingClientRect();
                    const rb = (b as HTMLElement).getBoundingClientRect();
                    return Math.abs(ra.top) - Math.abs(rb.top);
                });
                const candidate = nodes[0] as HTMLElement;
                try {
                    const r = candidate.getBoundingClientRect();
                    const targetTopInDocument = r.top + window.scrollY;
                    const padding = 16;
                    const scrollToY = Math.max(0, Math.floor(targetTopInDocument - headerHeight - padding));
                    try { window.scrollTo({ top: scrollToY, behavior: 'smooth' }); } catch {}
                    // allow time for scroll/layout
                    await new Promise(res => setTimeout(res, 320));
                    // re-evaluate visible candidates after scrolling
                    const postNodes = nodes.filter(n => {
                        const rr = (n as HTMLElement).getBoundingClientRect();
                        return rr.bottom > 0 && rr.top < window.innerHeight && rr.right > 0 && rr.left < window.innerWidth;
                    });
                    if (postNodes.length > 0) nodes = postNodes;
                    else nodes = [candidate];
                } catch (e) {
                    // continue and allow normal timeout behavior
                }
            }

            // If no nodes match the precise selector, try a couple of safe fallbacks for protocol cards
            if (nodes.length === 0 && currentStep.selector.includes('protocol-card-container')) {
                const fallbackSelectors = ['.protocol-card-container .card', '[data-tour-id^="protocol-card-"] .card', '.card[data-tour-id^="protocol-card-"]'];
                for (const fs of fallbackSelectors) {
                    const fNodes = Array.from(document.querySelectorAll(fs));
                    if (fNodes.length > 0) {
                        nodes = fNodes;
                        console.debug('[walkthrough] using fallback selector', fs, 'candidates', nodes.length);
                        break;
                    }
                }
            }

            // If still none, check if any protocol cards exist at all; if not, keep trying
            if (nodes.length === 0) {
                const anyCard = document.querySelector('.protocol-card-container, [data-tour-id^="protocol-card-"]');
                if (!anyCard) return; // keep trying until timeout
            }

            // Score candidates by visible area and header placement
            const candidates = nodes.map(n => n as HTMLElement);
            if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('walkthrough_debug') === '1') {
                console.debug('[walkthrough] found candidates for selector', currentStep.selector, candidates.length);
            }

            const scored = candidates.map(n => {
                const r = n.getBoundingClientRect();
                const visibleWidth = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
                const visibleHeight = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
                const visibleArea = visibleWidth * visibleHeight;
                const area = r.width * r.height || 1;
                const inHeader = !!n.closest('header, .header, .dashboard-header, .main-header-hud');
                // Boost candidates that live inside the header when the selector is a header-nav target
                const headerSelectorBoost = currentStep.selector && currentStep.selector.includes('my-stack-lab') ? (inHeader ? 2.0 : 0.8) : 1.0;
                const belowHeaderBoost = (r.top >= headerHeight || inHeader) ? 1.5 : 1.0;
                // Penalize fixed elements near the bottom (e.g., sticky mobile nav) to avoid selecting them
                const style = window.getComputedStyle(n);
                const isFixedBottom = style.position === 'fixed' && r.top > window.innerHeight - 120;
                const bottomPenalty = isFixedBottom ? 0.35 : 1.0;
                const score = (visibleArea / area) * belowHeaderBoost * headerSelectorBoost * bottomPenalty;
                return { el: n, rect: r, score };
            }).filter(s => s.rect.width > 8 && s.rect.height > 8 && s.rect.bottom > 0 && s.rect.top < window.innerHeight);

            if (scored.length === 0) return;

            if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('walkthrough_debug') === '1') {
                console.debug('[walkthrough] scored candidates', scored.map(s => ({ score: s.score, top: s.rect.top, height: s.rect.height })));
            }

            scored.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.rect.top - b.rect.top;
            });
            const best = scored[0];

            // scroll the page so the element sits below the header (with some padding)
            const padding = 16;
            const targetTopInDocument = best.el.getBoundingClientRect().top + window.scrollY;
            const scrollToY = Math.max(0, Math.floor(targetTopInDocument - headerHeight - padding));
            try { window.scrollTo({ top: scrollToY, behavior: 'smooth' }); } catch {}

            await new Promise(res => setTimeout(res, 220));
            const finalRect = (best.el as HTMLElement).getBoundingClientRect();
            if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('walkthrough_debug') === '1') {
                console.debug('[walkthrough] chosen element', best.el, best.rect, 'finalRect', finalRect);
            }

            // Convert the final bounding rect (which is viewport-relative) into document coordinates
            // so absolute positioning on document.body aligns correctly with the element.
            const docTop = finalRect.top + window.scrollY;
            const docLeft = finalRect.left + window.scrollX;
            const adjustedRect = new DOMRect(docLeft, docTop, finalRect.width, finalRect.height);
            setTargetEl(best.el as HTMLElement);
            setTargetRect(adjustedRect);

            if (intervalId) clearInterval(intervalId);
        };

        const startTimeout = window.setTimeout(() => { intervalId = window.setInterval(findAndPositionElement, 100); }, startDelay);

        return () => {
            if (intervalId) clearInterval(intervalId);
            clearTimeout(startTimeout as unknown as number);
            // clear the chosen element when the step changes/cleanup
            setTargetEl(null);
        };
    }, [
        currentStep,
        view,
        adminTab,
        settingsTab,
        arenaSubView,
        myStackLabSubView,
        kaiSubView,
        setView,
        setAdminTab,
        setSettingsTab,
        setArenaSubView,
        setMyStackLabSubView,
        setKaiSubView,
        endWalkthrough,
        nextWalkthroughStep
    ]);


    if (!targetRect || !currentStep) return null;

    // targetRect is stored in document coordinates (top/left include page scroll)
    const highlightStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${targetRect.top - 8}px`,
        left: `${targetRect.left - 8}px`,
        width: `${targetRect.width + 16}px`,
        height: `${targetRect.height + 16}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        border: '2px solid #0ea5e9', // cyan-500
        borderRadius: '8px',
        zIndex: 15000,
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none',
    };

    // For tooltip placement we prefer computing from the viewport-relative rect
    // then translate the computed top/left back into document coordinates so
    // the absolutely-positioned tooltip (on document.body) sits in the correct
    // place even when the page is scrolled.
    const viewportRect = new DOMRect(targetRect.left - window.scrollX, targetRect.top - window.scrollY, targetRect.width, targetRect.height);
    const viewportPos = getPosition(viewportRect, currentStep.position);
    const tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        zIndex: 30000,
        pointerEvents: 'auto', // ensure the tooltip (and its buttons) receive pointer events
        top: `${viewportPos.top + window.scrollY}px`,
        left: `${viewportPos.left + window.scrollX}px`,
        transform: viewportPos.transform,
    };
    
    function getPosition(rect: DOMRect, position: string) {
        const offset = 16;
        const tooltipWidth = 320; // Corresponds to max-w-xs
    const tooltipHeight = 160; // Approximate height, adjust if needed

    // Account for sticky header height so tooltips don't render under it
    const headerOffset = Math.max(0, document.querySelector('header, .header, .dashboard-header')?.getBoundingClientRect().height || 0);

        const positions = {
            top: {
                top: rect.top - offset - tooltipHeight,
                left: rect.left + rect.width / 2,
                transform: 'translateX(-50%)',
            },
            bottom: {
                top: rect.bottom + offset,
                left: rect.left + rect.width / 2,
                transform: 'translateX(-50%)',
            },
            left: {
                top: rect.top + rect.height / 2,
                    left: rect.left - offset + 8,
                    transform: 'translate(-100%, -50%)',
            },
            right: {
                top: rect.top + rect.height / 2,
                left: rect.right + offset,
                transform: 'translate(-0%, -50%)',
            },
        };

        let pos = positions[position];

        // Viewport boundary checks and adjustments
        // If tooltip would be above the header, prefer rendering below the element
        if (pos.top < headerOffset + offset) {
            // Try switching to bottom placement
            if (positions.bottom) {
                pos = positions.bottom;
                pos.top = rect.bottom + offset;
                pos.transform = 'translateX(-50%)';
            }
        }

        if (pos.left - (position === 'left' || position === 'top' || position === 'bottom' ? tooltipWidth / 2 : 0) < 0) {
            pos.left = offset;
            pos.transform = position === 'top' || position === 'bottom' ? 'translateX(0)' : 'translateY(-50%)';
        }
        if (pos.left + (position === 'right' ? tooltipWidth : tooltipWidth / 2) > window.innerWidth) {
            pos.left = window.innerWidth - offset;
            pos.transform = position === 'top' || position === 'bottom' ? 'translateX(-100%)' : 'translate(-100%, -50%)';
        }
        if (pos.top - (position === 'top' ? tooltipHeight : 0) < headerOffset + offset) {
            // Not enough room above; position below
            pos.top = rect.bottom + offset;
            pos.transform = 'translateX(-50%)';
        }
        if (pos.top + tooltipHeight > window.innerHeight - offset) {
            // Not enough room below; position above
            pos.top = Math.max(headerOffset + offset, rect.top - offset - tooltipHeight);
            pos.transform = 'translateX(-50%)';
        }

        // Return numeric values for callers to translate between viewport and document coordinates
        return {
            top: pos.top,
            left: pos.left,
            transform: pos.transform,
        };
    }

    // Debug overlays when ?walkthrough_debug=1 (visual overlays removed)
    const debugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('walkthrough_debug') === '1';

    return createPortal(
        <>
            <div style={highlightStyle} aria-hidden="true"></div>
            <div
                style={tooltipStyle}
                className="bg-gray-800 text-white p-4 rounded-lg shadow-xl max-w-xs border border-gray-700 animate-fade-in"
                onClick={(e) => e.stopPropagation()} // prevent clicks from bubbling to underlying elements
            >
                <h3 className="font-bold text-lg text-cyan-300 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <button onClick={endWalkthrough} className="text-sm text-gray-500 hover:text-white">Skip</button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{walkthroughStep + 1} / {activeSteps.length}</span>
                        <button onClick={nextWalkthroughStep} className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-md text-sm">Next</button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
    </>,
        document.body
    );

    // Keep the highlight and tooltip in sync with live layout changes (scroll/resize/dom mutations).
    useEffect(() => {
        if (!targetEl) return;

        let ticking = false;
        const recompute = () => {
            if (!targetEl) return;
            const r = targetEl.getBoundingClientRect();
            const docTop = r.top + window.scrollY;
            const docLeft = r.left + window.scrollX;
            const newRect = new DOMRect(docLeft, docTop, r.width, r.height);
            setTargetRect(prev => {
                // only update if changed meaningfully to avoid extra renders
                if (!prev) return newRect;
                if (Math.round(prev.top) === Math.round(newRect.top) && Math.round(prev.left) === Math.round(newRect.left) && Math.round(prev.width) === Math.round(newRect.width) && Math.round(prev.height) === Math.round(newRect.height)) {
                    return prev;
                }
                return newRect;
            });
        };

        const onScrollOrResize = () => {
            if (!ticking) {
                ticking = true;
                rafRef.current = window.requestAnimationFrame(() => { recompute(); ticking = false; });
            }
        };

        recompute();
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);

        const mo = new MutationObserver(() => {
            // layout may have shifted
            onScrollOrResize();
        });
        mo.observe(document.body, { childList: true, subtree: true, attributes: true });

        return () => {
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
            mo.disconnect();
            if (rafRef.current) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [targetEl]);
};

export default GuidedWalkthrough;