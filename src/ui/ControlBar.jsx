// Barre du bas : points de vue (1 à 4), jour/nuit, visite guidée, et aide discrète.
import { VIEWPOINTS } from '../viewpoints.js';

const ICONS = { facade: 'account_balance', angle: 'view_in_ar', detail: 'zoom_in', aerien: 'flight' };

export default function ControlBar({ view, night, touring, onView, onNight, onTour }) {
  return (
    <div className="control-dock">
      <nav className="control-bar" aria-label="Commandes">
        {VIEWPOINTS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`chip ${view === v.id ? 'is-active' : ''}`}
            onClick={() => onView(v.id)}
            title={`${v.hint} (touche ${v.key})`}
            aria-pressed={view === v.id}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {ICONS[v.id]}
            </span>
            <span className="chip__key">{v.key}</span>
            {v.label}
          </button>
        ))}
        <span className="control-bar__sep" aria-hidden="true" />
        <button type="button" className="chip" onClick={onNight} aria-pressed={night} title="Basculer jour / nuit (touche N)">
          <span className="material-symbols-outlined" aria-hidden="true">
            {night ? 'light_mode' : 'dark_mode'}
          </span>
          {night ? 'Jour' : 'Nuit'}
        </button>
        <button type="button" className={`chip ${touring ? 'is-active' : ''}`} onClick={onTour} aria-pressed={touring} title="Tour lent autour du temple">
          <span className="material-symbols-outlined" aria-hidden="true">
            {touring ? 'pause' : 'play_arrow'}
          </span>
          Visite
        </button>
      </nav>
      <p className="control-help">Glisser : tourner · Molette : zoomer · Clic droit : déplacer</p>
    </div>
  );
}
