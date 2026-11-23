// Monte la scène 3D plein écran et la petite surcouche HTML (carte, barre de commandes, aide).
import { useEffect, useRef, useState } from 'react';
import { createExperience } from './scene/experience.js';
import { VIEWPOINTS, viewFromHash } from './viewpoints.js';
import InfoCard from './ui/InfoCard.jsx';
import ControlBar from './ui/ControlBar.jsx';
import './ui/overlay.css';

const isDark = () => document.documentElement.dataset.theme === 'dark';

export default function App() {
  const hostRef = useRef(null);
  const expRef = useRef(null);
  const [view, setView] = useState(() => viewFromHash());
  const [night, setNight] = useState(isDark);
  const [touring, setTouring] = useState(false);

  useEffect(() => {
    const exp = createExperience(hostRef.current, { view: viewFromHash(), night: isDark(), onTourStop: () => setTouring(false) });
    expRef.current = exp;
    const onHash = () => {
      const id = viewFromHash();
      setView(id);
      setTouring(false);
      exp.goTo(id);
    };
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      const v = VIEWPOINTS.find((p) => p.key === e.key);
      if (v) selectView(v.id);
      else if (e.key === 'n' || e.key === 'N') setNight((n) => !n);
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onKey);
      exp.dispose();
      expRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = night ? 'dark' : 'light';
    expRef.current?.setNight(night);
  }, [night]);

  useEffect(() => {
    expRef.current?.setTour(touring);
  }, [touring]);

  function selectView(id) {
    if (location.hash === `#${id}`) {
      setTouring(false);
      expRef.current?.goTo(id);
    } else {
      location.hash = id;
    }
  }

  return (
    <div className={`stage ${night ? 'is-night' : 'is-day'}`}>
      <div ref={hostRef} className="stage__canvas" />
      <InfoCard />
      <ControlBar
        view={view}
        night={night}
        touring={touring}
        onView={selectView}
        onNight={() => setNight((n) => !n)}
        onTour={() => setTouring((t) => !t)}
      />
    </div>
  );
}
