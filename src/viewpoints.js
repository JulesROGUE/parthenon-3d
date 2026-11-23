// Points de vue nommés (choisis près des angles des photos de référence). Ouvrables par #id, boutons ou touches 1 à 4.
export const VIEWPOINTS = [
  {
    id: 'facade',
    key: '1',
    label: 'Façade ouest',
    hint: 'Comme en arrivant des Propylées',
    position: [-75, 2.6, 4],
    target: [-32, 10.8, 0],
  },
  {
    id: 'angle',
    key: '2',
    label: 'Angle nord-ouest',
    hint: 'Façade ouest et colonnade nord',
    position: [-60, 2.2, -50],
    target: [-2, 10, -1],
  },
  {
    id: 'detail',
    key: '3',
    label: 'Entablement',
    hint: 'Triglyphes, métopes et chapiteaux',
    position: [-42, 3.2, -22.5],
    target: [-33.5, 12.6, -14.5],
  },
  {
    id: 'aerien',
    key: '4',
    label: 'Vue aérienne',
    hint: "Le rocher de l'Acropole",
    position: [-235, 78, 300],
    target: [-30, 0, 0],
  },
];

export const DEFAULT_VIEW = 'angle';

export function viewFromHash(hash = location.hash) {
  const id = hash.replace('#', '');
  return VIEWPOINTS.find((v) => v.id === id) ? id : DEFAULT_VIEW;
}
