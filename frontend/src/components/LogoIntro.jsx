import React, { useEffect, useState } from 'react';
import './LogoIntro.css';

const INTRO_SESSION_KEY = 'vyaparflow:intro-played';
const INTRO_DURATION_MS = 2950;

const LogoIntro = () => {
  const [isVisible, setIsVisible] = useState(
    () => !window.sessionStorage.getItem(INTRO_SESSION_KEY)
  );

  useEffect(() => {
    if (!isVisible) return undefined;

    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(false);
      return undefined;
    }

    const timerId = window.setTimeout(() => setIsVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="vf-intro" role="status" aria-label="Loading VyaparFlow">
      <div className="vf-intro-lockup">
        <div className="vf-intro-badge">
          <img src="/assets/vyaparflow-mark.png" alt="" />
        </div>
        <div className="vf-intro-copy">
          <p className="vf-intro-name">VyaparFlow</p>
          <p className="vf-intro-tagline">YOUR BUSINESS, IN PERFECT FLOW.</p>
        </div>
      </div>
    </div>
  );
};

export default LogoIntro;
