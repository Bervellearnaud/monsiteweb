# TechZen — Site vitrine (landing page)

Landing page de **TechZen** : création de sites web, référencement, e-commerce,
analyse de données, réseaux informatiques, Windows Server, caméras de vidéosurveillance
et **installation Starlink**.

> « Créez un site web à votre image, performant et sur-mesure. »

Le site est **100 % statique** (HTML + CSS + JavaScript, aucune dépendance ni build).
Il suffit d'ouvrir `index.html` ou de servir le dossier.

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html               Page d'accueil (toutes les sections)
styles.css               Design system + styles (thème clair / sombre)
script.js                Interactions (menu, filtres, galerie, formulaire WhatsApp)
manifest.webmanifest     Manifeste PWA
favicon.png              Icône
assets/logo/             Logo TechZen (emblème extrait du visuel fourni)
assets/img/              Visuels des projets, optimisés en WebP
demo/                    Démos réelles des projets, jouables dans le navigateur
  finatrack.html           FinaTrack CI     (application de pilotage budgétaire)
  voxnote/                 VoxNote          (notes vocales & photos, PWA React)
  splat-arena.html         Paintball 2D     (arcade canvas)
  puzzle/                  Puzzle Studio    (jeu de puzzle autonome)
```

## Sections de la page

1. **Hero** — promesse, aperçu d'interface animé, appels à l'action
2. **Expertises** — sites web, référencement, e-commerce, analyse de données,
   réseaux informatiques, Windows Server & vidéosurveillance
3. **Réalisations** — 4 projets réels dans une grille régulière 2 × 2
   (cartes de hauteur égale, visuels au format 16/9, sans libellé de catégorie),
   filtres, galeries, visionneuse et liens directs vers les démos
4. **Croissance / SEO** — visibilité, acquisition locale, conversion, SEO e-commerce
5. **Méthode** — cadrage, conception, mise en ligne, mesure
6. **Infrastructure** — amélioration d'un réseau existant, nouveau réseau,
   Windows Server, sauvegardes
7. **Vidéosurveillance** — étude et plan de pose, câblage PoE, NVR et stockage,
   accès mobile sécurisé, caméras Wi-Fi / sites isolés, maintenance
8. **Installation Starlink** — vérification du site, fixation et câblage, mise en
   service, réseau local et continuité (avec aperçu de liaison satellite)
9. **Offres** — Présence / Croissance / E-commerce & IT
10. **FAQ**, **Contact** (formulaire → WhatsApp) et pied de page

## Personnalisation rapide

Tout se règle en haut de `script.js` :

```js
var CONFIG = {
    WHATSAPP_NUMBER: "",            // ex. "2250700000000" (sans +, sans espaces)
    EMAIL: "contact@techzen.ci",
    BRAND: "TechZen"
};
```

* **Numéro WhatsApp** : tant qu'il est vide, tous les boutons WhatsApp
  basculent automatiquement vers un e-mail pré-rempli (aucun lien cassé).
  ⏳ À renseigner dès qu'il est disponible.
* **E-mail** : remplacez `contact@techzen.ci` — adresse provisoire, également
  présente dans `index.html` (liens `mailto:`). ⏳ À renseigner.
* **Couleurs** : variables `--brand`, `--brand-soft`, `--grad` dans `styles.css`.
* **Textes / offres / FAQ** : directement dans `index.html`.

## Thème clair / sombre

Le bouton de la barre de navigation bascule le thème ; le choix est mémorisé
(`localStorage`) et, par défaut, suit la préférence du système.

## Accessibilité & performances

* Navigation clavier complète, lien d'évitement, `aria-*` sur les composants interactifs.
* Contrastes vérifiés, focus visible, respect de `prefers-reduced-motion`.
* Visuels en WebP, `loading="lazy"`, dimensions déclarées (pas de décalage).
* Aucune librairie externe hormis les polices Google Fonts.

## Déploiement

Le site est statique : dépôt direct sur Netlify, Vercel, GitHub Pages ou tout
serveur web (Apache, Nginx). Pour GitHub Pages, publiez la racine du dépôt.

## Projets présentés

| Projet | Type | Démo | En ligne |
| --- | --- | --- | --- |
| FinaTrack CI | Application de suivi budgétaire (PWA) | `demo/finatrack.html` | https://finnatrack.netlify.app |
| VoxNote | Notes vocales & photos (PWA React) | `demo/voxnote/` | — |
| Paintball 2D | Arcade canvas | `demo/splat-arena.html` | https://painballvoom.netlify.app |
| Puzzle Studio | Jeu de puzzle hors-ligne | `demo/puzzle/` | https://mypuzzle.netlify.app |

> Les liens vers le code source et l'icône GitHub ont été retirés du site sur demande.

Les démos sont des copies autonomes exécutées localement : les essais des
visiteurs restent dans leur navigateur.
