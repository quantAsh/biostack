import React from 'react';
import { Protocol, Theme } from '../types';
import PROTOCOL_ASSETS from '../data/protocol-assets';
import { CATEGORY_DETAILS } from '../constants';

interface CardGraphicProps {
  protocol: Protocol;
  theme: Theme;
}

const pRNG = (seed: number) => {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
};

const CardGraphic: React.FC<CardGraphicProps> = ({ protocol, theme }) => {
  const { id, categories, imageUrl } = protocol;
  const seed = parseInt(id, 10) * 1337;
  const primaryColor = CATEGORY_DETAILS[categories[0]]?.color || '#ffffff';
  const secondaryColor = CATEGORY_DETAILS[categories[1]]?.color || primaryColor;

  const ClassicGraphic = () => {
    const generatePath = (radius: number, points: number, noise: number) => {
      let path = '';
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = radius + pRNG(seed + i * 10) * radius * noise - (radius * noise / 2);
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        if (i === 0) {
          path += `M ${x},${y}`;
        } else {
          const prevAngle = ((i - 1) / points) * Math.PI * 2;
          const prevR = radius + pRNG(seed + (i-1) * 10) * radius * noise - (radius * noise / 2);
          const prevX = 50 + Math.cos(prevAngle) * prevR;
          const prevY = 50 + Math.sin(prevAngle) * prevR;
          const c1Angle = prevAngle + (angle - prevAngle) / 3;
          const c1R = r * (pRNG(seed + i * 11) * 0.2 + 0.9);
          const c1X = 50 + Math.cos(c1Angle) * c1R;
          const c1Y = 50 + Math.sin(c1Angle) * c1R;
          const c2Angle = prevAngle + (angle - prevAngle) * 2 / 3;
          const c2R = r * (pRNG(seed + i * 12) * 0.2 + 0.9);
          const c2X = 50 + Math.cos(c2Angle) * c2R;
          const c2Y = 50 + Math.sin(c2Angle) * c2R;
          path += ` C ${c1X},${c1Y} ${c2X},${c2Y} ${x},${y}`;
        }
      }
      path += ' Z';
      return path;
    };
    const layers = [
      { radius: 45, points: 5, noise: 0.3, opacity: 0.1 },
      { radius: 40, points: 7, noise: 0.4, opacity: 0.15 },
      { radius: 30, points: 6, noise: 0.2, opacity: 0.2 },
    ];
    return (
        <svg width="200%" height="200%" viewBox="0 0 100 100" className="absolute opacity-80 mix-blend-soft-light">
            <defs>
            <radialGradient id={`grad-bg-${id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
            </radialGradient>
            <filter id={`filter-glow-${id}`}>
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grad-bg-${id})`} />
            <g style={{ filter: `url(#filter-glow-${id})` }}>
                {layers.map((layer, index) => (
                <path
                    key={index}
                    d={generatePath(layer.radius, layer.points, layer.noise)}
                    fill="none"
                    stroke={index % 2 === 0 ? primaryColor : secondaryColor}
                    strokeWidth={pRNG(seed + index * 2) * 0.5 + 0.25}
                    opacity={layer.opacity}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                ))}
            </g>
        </svg>
    )
  }

  const AuraGraphic = () => {
    const numSpikes = 8 + Math.floor(pRNG(seed) * 5);
    const points = Array.from({ length: numSpikes * 2 }, (_, i) => {
        const angle = (i / (numSpikes * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 
            ? 30 + pRNG(seed + i) * 15
            : 15 + pRNG(seed + i) * 10;
        return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
    }).join(' ');

    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute opacity-70">
            <defs>
                 <filter id={`aura-filter-${id}`}>
                    <feTurbulence type="fractalNoise" baseFrequency={pRNG(seed+1) * 0.01 + 0.02} numOctaves="3" result="turbulence"/>
                    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale={pRNG(seed+2) * 8 + 4} xChannelSelector="R" yChannelSelector="G"/>
                    <feGaussianBlur stdDeviation="1" />
                </filter>
                <radialGradient id={`aura-grad-${id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                    <stop offset="70%" stopColor={secondaryColor} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
                </radialGradient>
            </defs>
            <g filter={`url(#aura-filter-${id})`}>
                 <polygon points={points} fill={`url(#aura-grad-${id})`} />
            </g>
        </svg>
    );
  }

  const isAnatomical = categories && categories.some((c: string) => /anatom/i.test(c));
  const fallbackAnatomical = '/assets/digitaltwin.jpeg';
  const DigitalHumanGraphic = () => (
    <>
      {((PROTOCOL_ASSETS[id] || imageUrl || isAnatomical) ? (
        <img src={PROTOCOL_ASSETS[id] || imageUrl || fallbackAnatomical} alt={protocol.name} className="w-full h-full object-cover"/>
      ) : (
         <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-600 text-sm">No Image</p>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
       <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      ></div>
    </>
  );

  const renderGraphic = () => {
    switch(theme) {
      case 'classic': return <ClassicGraphic />;
      case 'aura': return <AuraGraphic />;
      case 'digital-human': return <DigitalHumanGraphic />;
      default: return null;
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        {renderGraphic()}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ transform: `translate(calc(var(--mouse-x, 50%) - 50%) , calc(var(--mouse-y, 50%) - 50%))`, transition: 'transform 0.12s linear' }}>
          <div className="w-full h-full bg-gradient-to-b from-transparent to-black/30 mix-blend-overlay" />
        </div>
    </div>
  );
};

export default CardGraphic;