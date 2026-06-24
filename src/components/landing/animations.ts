import { keyframes } from '@emotion/react';

// shifting amber gradient backdrop
export const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// emojis drifting upward and fading out
export const rise = keyframes`
  0% { transform: translateY(20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-120px) rotate(20deg); opacity: 0; }
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
