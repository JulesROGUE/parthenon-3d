// Carte d'identité du monument (chiffres tirés des sources citées dans src/model/dimensions.js).
const FACTS = [
  { value: '69,5 × 30,9 m', label: 'stylobate' },
  { value: '8 × 17', label: 'colonnes doriques' },
  { value: '92', label: 'métopes sculptées' },
  { value: '3', label: 'degrés de marbre' },
];

export default function InfoCard() {
  return (
    <section className="info-card" aria-label="Le Parthénon">
      <p className="info-card__eyebrow">Acropole d'Athènes · Grèce</p>
      <h1 className="info-card__title">Le Parthénon</h1>
      <p className="info-card__meta">447 – 432 av. J.-C. · Ictinos, Callicratès, Phidias</p>
      <dl className="info-card__facts">
        {FACTS.map((f) => (
          <div key={f.label}>
            <dt>{f.value}</dt>
            <dd>{f.label}</dd>
          </div>
        ))}
      </dl>
      <p className="info-card__note">Reproduction stylisée de l'état actuel, modélisée en code</p>
    </section>
  );
}
