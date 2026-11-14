# TechZen — Landing page

Landing page statique de **TechZen**, une agence à Abidjan qui réunit :

- création de sites web et applications métier ;
- référencement naturel (SEO) et SEO local ;
- e-commerce ;
- analyse de données et tableaux de bord ;
- réseaux informatiques, Wi-Fi, Windows Server et cybersécurité ;
- vidéosurveillance IP ;
- installation Starlink.

> « Créez un site web à votre image, performant et sur-mesure. »

Le site est **100 % statique** : HTML, CSS et JavaScript vanilla, sans framework,
sans bundler et sans étape de build.

## Aperçu rapide

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Ouvrir directement `index.html` fonctionne aussi ; un serveur local est préférable
pour tester le manifeste PWA, les chemins relatifs et les démos.

## Structure du dépôt

```text
index.html               Page unique : toutes les sections (navigation → footer)
styles.css               Design system, composants, responsive et thème clair / sombre
script.js                Interactions (pas de dépendance)
manifest.webmanifest     Manifeste PWA du site
favicon.png              Icône générale

assets/logo/             Logos TechZen et tailles dérivées
assets/img/              Visuels des réalisations, optimisés en WebP

demo/                    Démos autonomes exécutées dans le navigateur
  finatrack.html           FinaTrack CI     — pilotage budgétaire
  voxnote/                 VoxNote          — notes vocales et photos (PWA)
  splat-arena.html         Paintball 2D     — arène canvas
  puzzle/                  Puzzle Studio    — puzzle hors-ligne
  manifest.json            Manifeste des démos
  icons/                   Icônes des démos
```

## Contenu et ordre des sections

La page suit un parcours de conversion classique : promesse, preuves, méthode,
offre, réassurance, action.

1. **Hero (`#accueil`)** — proposition de valeur, CTA, preuves rapides et maquette
   d'interface animée.
2. **Bandeau technos** — « Les briques que nous maîtrisons » : bandeau défilant
   automatiquement et contrôlable manuellement (boutons, molette, glisser, clavier).
3. **Expertises (`#services`)** — web, SEO, e-commerce, data, réseaux et serveurs.
4. **Réalisations (`#realisations`)** — projets réels en grille 2 × 2 sur desktop,
   avec filtres, galeries d'images, visionneuse et liens vers les démos.
5. **Chiffres clés** — bandeau sombre : délai de réponse, étendue des expertises,
   sur-mesure et interlocuteur unique.
6. **Croissance / SEO (`#croissance`)** — visibilité Google, acquisition locale,
   conversion et SEO e-commerce.
7. **Méthode (`#methode`)** — cadrage, conception, mise en ligne, mesure.
8. **Infrastructure (`#infrastructure`)** — audits, refontes, nouveau réseau,
   Windows Server et continuité d'activité.
9. **Vidéosurveillance (`#videosurveillance`)** — étude, plan de pose, PoE, NVR,
   accès mobile, maintenance et zones d'intervention.
10. **Installation Starlink (`#starlink`)** — vérification du site, fixation,
    câblage, mise en service, réseau local, continuité 4G et tarifs indicatifs.
11. **FAQ (`#faq`)** — délais, SEO, reprise de l'existant, propriété des accès,
    interventions hors Abidjan et maintenance.
12. **Contact (`#contact`)** — formulaire pré-rempli vers WhatsApp, WhatsApp,
    e-mail et localisation.
13. **CTA final** — prise de rendez-vous de 15 minutes.
14. **Footer** — services, réalisations, contact et rappel de positionnement.

## Fonctionnalités

| Domaine | Détail |
| --- | --- |
| Navigation | Barre fixe, progression de lecture, menu mobile, liens actifs selon la section visible, disparition au scroll descendant |
| Thème | Bascule clair / sombre, préférence système par défaut, choix mémorisé dans `localStorage` |
| Révélations | Animation d'apparition via `IntersectionObserver` |
| Compteurs | Chiffres du bandeau KPI animés à l'arrivée dans le viewport |
| Projets | Filtres Web / Applications / Jeux, vignettes, lightbox clavier et tactile |
| Bandeau technos | Défilement continu, pause au survol / focus / interaction |
| FAQ | Accordéon natif (`details` / `summary`), une réponse ouverte à la fois |
| Formulaire | Validation navigateur, ouverture d'un message WhatsApp pré-rempli |
| WhatsApp | Tous les CTA basculent vers un e-mail pré-rempli tant que `WHATSAPP_NUMBER` est vide |
| Lightbox | Navigation Précédent / Suivant, fermeture au clavier et au clic sur le fond |

## Personnalisation

### Numéro WhatsApp et e-mail

Le haut de `script.js` centralise la configuration :

```js
var CONFIG = {
    WHATSAPP_NUMBER: "",            // ex. "2250700000000" (sans +, espaces ou tirets)
    EMAIL: "contact@techzen.ci",
    BRAND: "TechZen"
};
```

- **WhatsApp** : tant que `WHATSAPP_NUMBER` est vide, aucun lien cassé n'est produit :
  les boutons WhatsApp ouvrent un e-mail pré-rempli à la place.
- **E-mail** : l'adresse est aussi présente dans les liens `mailto:` de `index.html`.
  Mettez-la à jour dans les deux endroits.
- **Marque** : `BRAND` est disponible pour les évolutions JS ; le texte visible est
  principalement dans `index.html`.

### Couleurs et design tokens

Tout le design system vit dans `styles.css` :

- palette et gradients : `--brand`, `--brand-strong`, `--brand-soft`, `--grad` ;
- surfaces et fonds : `--bg`, `--bg-alt`, `--surface`, `--surface-2`, `--surface-3` ;
- typographie : `--font`, `--font-mono` ;
- rythme : `--wrap`, `--pad`, `--section`, `--radius-*` ;
- ombres et transitions : `--shadow-*`, `--t-fast`, `--t`, `--ease-out`.

### Texte, FAQ et prestations

Les contenus sont volontairement écrits en clair dans `index.html` :

- titres et argumentaire : directement dans chaque `<section>` ;
- FAQ : éléments `<details class="qa">` ;
- forfaits Starlink et tarifs : bloc `.sl-plans` ;
- réalisations et liens de démonstration : cartes `.project`.

## Accessibilité

- lien d'évitement « Aller au contenu » ;
- navigation clavier complète, focus visible et `aria-expanded` sur le burger ;
- sections décorées avec `aria-label` lorsque nécessaire ;
- composants interactifs nommés (`aria-label`, `aria-modal`, `role="dialog"`) ;
- `prefers-reduced-motion` respecté pour les animations ;
- taille et dimensions des images déclarées pour limiter le décalage de mise en page ;
- boutons de filtre, navigation et lightbox utilisables au clavier.

## Performance et SEO

- pages statiques, aucun framework côté runtime ;
- images WebP, `loading="lazy"` hors premier visuel et dimensions déclarées ;
- polices Google Fonts préchargées proprement (`preconnect`) ;
- données structurées `ProfessionalService` en JSON-LD ;
- balises Open Graph, Twitter Card, description et auteur ;
- thème sombre sans flash via préférence système et `localStorage` ;
- poids HTML/CSS/JS contenu, adapté à un hébergement statique économique.

## Déploiement

Le site est statique et ne nécessite ni Node ni serveur applicatif.

- **Netlify / Vercel** : brancher le dépôt, racine `/`, aucune commande de build.
- **GitHub Pages** : publier la racine de `main`.
- **Hébergement classique** : copier le contenu du dépôt sur Apache, Nginx ou un
  espace fichiers mutualisé.

Pensez à servir `index.html`, `styles.css`, `script.js`, `manifest.webmanifest`,
`assets/` et `demo/` avec les chemins relatifs intacts.

## Réalisations présentées

| Projet | Type | Démo locale | En ligne |
| --- | --- | --- | --- |
| FinaTrack CI | Application de pilotage budgétaire (PWA) | `demo/finatrack.html` | https://finnatrack.netlify.app |
| VoxNote | Notes vocales et photos (PWA) | `demo/voxnote/` | — |
| Paintball 2D | Arène arcade canvas | `demo/splat-arena.html` | https://painballvoom.netlify.app |
| Puzzle Studio | Puzzle hors-ligne | `demo/puzzle/` | https://mypuzzle.netlify.app |

Les démos sont des copies autonomes exécutées localement : les essais des
visiteurs restent dans leur navigateur.

## Vérifications utiles

Il n'y a pas encore de suite de tests automatisés. Avant une mise en production :

```bash
python3 -m http.server 8080
node --check script.js
```

Puis vérifier manuellement : menu mobile, filtres projets, démos, lightbox,
formulaire (e-mail puis WhatsApp), thème clair / sombre, navigation clavier et
affichage mobile.

## Licence et propriété

Aucun `LICENSE` n'est fourni à ce jour : le contenu, la marque, les visuels et les
textes restent la propriété de TechZen. N'ajoutez pas de licence sans décision du
propriétaire du projet.
