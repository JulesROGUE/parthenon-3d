# Parthénon 3D — v1.0.0

Première version : le Parthénon de l'Acropole d'Athènes reconstruit en 3D uniquement avec du code (Three.js), dans une application de bureau Electron.

## Points clés

- **46 colonnes doriques** (8 × 17) à 20 cannelures, avec galbe, échine et abaque, en un seul `InstancedMesh`.
- **Entablement complet** : architrave, frise à triglyphes et **92 métopes**, corniche avec mutules.
- **Frontons ruinés** modélisés d'après des photos réelles, cella dans son état actuel, porche ouest avec frise ionique.
- **Le rocher de l'Acropole** : murs, falaises, pentes boisées, Érechthéion et Propylées simplifiés, ville d'Athènes autour.
- **4 points de vue** (façade ouest, angle nord-ouest, entablement, vue aérienne) avec transitions douces, touches `1` à `4`.
- **Jour et nuit** : soleil de fin d'après-midi ou projecteurs chauds, étoiles et fenêtres éclairées (touche `N`).
- **Visite guidée** en option, rendu à la demande pour économiser le processeur.
- Aucun modèle 3D ni texture téléchargés : tout est généré en code.

## Fichiers à télécharger

| Système | Fichier | Utilisation |
| --- | --- | --- |
| Windows | `…-portable.exe` | Exécutable portable : aucune installation, double-cliquez pour lancer |
| Linux | `….AppImage` | `chmod +x` puis lancez-le |
| Linux (Debian, Ubuntu…) | `….deb` | `sudo apt install ./fichier.deb` |

Il n'y a pas d'installateur Windows : l'exécutable portable suffit. Il n'est pas signé, Windows SmartScreen peut donc afficher un avertissement (« Informations complémentaires » puis « Exécuter quand même »).

Reproduction stylisée et non officielle, réalisée avec l'aide de l'IA.
