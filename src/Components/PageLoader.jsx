import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/PageLoader.css';

export default function PageLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 390);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="pl-backdrop">

      {/* Centre ring */}
      <div className="pl-ring">
        <svg className="pl-ring__svg" viewBox="0 0 100 100" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          {/* Gold gradient definition */}
          <defs>
            <linearGradient id="plGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#e8c96a" />
              <stop offset="50%"  stopColor="#c9a84c" />
              <stop offset="100%" stopColor="#a8872e" />
            </linearGradient>
          </defs>
          {/* Faint track */}
          <circle className="pl-ring__track" cx="50" cy="50" r="44" strokeWidth="4" />
          {/* Spinning gold arc */}
          <circle className="pl-ring__arc"   cx="50" cy="50" r="44" strokeWidth="4" />
        </svg>

        {/* VJN text */}
        <span className="pl-ring__text">VJN</span>
      </div>

      {/* Tagline */}
      <p className="pl-tagline">Cooperative Bank</p>

    </div>
  );
}
