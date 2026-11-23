// Assemblage du Parthénon : crépis, colonnes, entablement, frontons, cella et blocs épars.
import * as THREE from 'three';
import { createMaterials } from './materials.js';
import { buildCrepidoma } from './crepidoma.js';
import { buildColumns } from './columns.js';
import { buildEntablature } from './entablature.js';
import { buildPediments } from './pediments.js';
import { buildCella } from './cella.js';
import { buildRuins } from './ruins.js';
import { buildContext } from './context.js';

export function buildParthenon() {
  const mat = createMaterials();
  const group = new THREE.Group();
  group.name = 'parthenon';
  const parts = [
    ...buildCrepidoma(mat),
    ...buildColumns(mat).meshes,
    ...buildEntablature(mat),
    ...buildPediments(mat),
    ...buildCella(mat),
    ...buildRuins(mat),
    ...buildContext(mat),
  ];
  for (const p of parts) group.add(p);
  return { group, materials: mat };
}
