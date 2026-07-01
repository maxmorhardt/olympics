import { keyframes } from '@emotion/react';

// shifting amber gradient backdrop
export const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// emojis drifting up across the entire background before fading out
export const rise = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  6% { opacity: 0.55; }
  94% { opacity: 0.55; }
  100% { transform: translateY(-108vh) rotate(24deg); opacity: 0; }
`;

// gentle bob
export const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

// pulsing glow around the emblem
export const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 30px 4px rgba(245, 166, 35, 0.35); transform: scale(1); }
  50% { box-shadow: 0 0 55px 12px rgba(255, 112, 67, 0.55); transform: scale(1.04); }
`;

// rotating conic ring
export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// shimmering gradient text
export const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

// staggered content entrance
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

// team reveal pop
export const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.6) translateY(16px); }
  60% { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`;

// dramatic glow pulse for high-stakes bracket elements
export const stakesPulse = keyframes`
  0%, 100% { box-shadow: 0 0 16px 0 rgba(245,166,35,0.35); }
  50% { box-shadow: 0 0 28px 6px rgba(255,112,67,0.6); }
`;

// big attention-grabbing entrance for the score popup
export const bounceIn = keyframes`
  0% { opacity: 0; transform: scale(0.5) translateY(-50px); }
  55% { opacity: 1; transform: scale(1.1) translateY(0); }
  75% { transform: scale(0.96); }
  100% { transform: scale(1); }
`;

// pulsing glow ring for the popup
export const popupGlow = keyframes`
  0%, 100% { box-shadow: 0 0 30px 4px rgba(245,166,35,0.5), 0 0 0 2px rgba(245,166,35,0.6) inset; }
  50% { box-shadow: 0 0 60px 14px rgba(255,112,67,0.75), 0 0 0 2px rgba(255,210,125,0.9) inset; }
`;
