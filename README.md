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

1. **Hero (`#accueil`)** — proposition de valeur, CTA, preuves rapides, maquette
   d'interface animée et rangée de trois cartes de synthèse alignées sous la
   maquette (aucune superposition).
2. **Carrousel technos** — « Les briques que nous maîtrisons » : 11 cartes en
   défilement horizontal visible, qui avance **automatiquement** avec un
   arrêt de 2,6 s sur chaque carte (≈ 3,2 s par carte, glissade comprise),
   avec pause/lecture, boutons précédent/suivant, compteur « 4–6 / 11 »,
   barre de progression, molette, glisser à la souris, balayage tactile et
   navigation clavier.
3. **Expertises (`#services`)** — web, SEO, e-commerce, data, réseaux et serveurs.
4. **Réalisations (`#realisations`)** — projets réels en grille 2 × 2 sur desktop,
   avec filtres, galeries d'images, visionneuse et liens vers les démos. Les quatre
   cartes partagent le même principe d'affiche : titre, accroche et badges à gauche,
   maquette multi-écrans à droite. Paintball 2D et Puzzle Studio utilisent en plus
   une variante verticale (`*-cover-tall.webp`) sous 620 px via `<picture>`.
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
| Carrousel technos | Avance automatique (2,6 s d'arrêt par carte + 0,6 s de transition, retour au début en fin de liste), pause au survol / focus / molette / glisser, bouton pause-lecture, alignement par carte (`scroll-snap`), compteur et barre de progression |
| FAQ | Accordéon natif (`details` / `summary`), une réponse ouverte à la fois |
| Formulaire | Validation navigateur, normalisation du téléphone, message WhatsApp pré-rempli, lien de secours si l'onglet est bloqué |
| WhatsApp | Tous les CTA basculent vers un e-mail pré-rempli tant que `WHATSAPP_NUMBER` est vide |
| Lightbox | Navigation Précédent / Suivant, fermeture au clavier et au clic sur le fond |

## Personnalisation

### Numéro WhatsApp et e-mail

Le haut de `script.js` centralise la configuration :

```js
var CONFIG = {
    WHATSAPP_NUMBER: "2250714232871",           // +225 07 14 23 28 71
    WHATSAPP_DISPLAY: "+225 07 14 23 28 71",    // forme lisible sur le site
    EMAIL: "mysupport@techzen.ci",
    BRAND: "TechZen"
};
```

Ces coordonnées sont reprises à trois endroits, à garder alignés :

| Où | Quoi |
| --- | --- |
| `index.html` — section `#contact` | e-mail, numéro affiché, lien `tel:+2250714232871` |
| `config.example.php` | adresse de réception et expéditeur SMTP |
| `index.html` — pied de page | e-mail et numéro cliquables |
| `index.html` — données structurées `ld+json` | `telephone`, `email`, `contactPoint` |

- **WhatsApp** : si `WHATSAPP_NUMBER` est vide, aucun lien cassé n'est produit :
  les boutons WhatsApp ouvrent un e-mail pré-rempli à la place. Les attributs
  `data-wa="…"` de `index.html` ne contiennent que le message pré-rempli.
- **E-mail** : les liens `mailto:` de `index.html` portent l'adresse en clair (utile
  pour les visiteurs sans JavaScript).
- **Marque** : `BRAND` est disponible pour les évolutions JS ; le texte visible est
  principalement dans `index.html`.

### Formulaire de contact

Le formulaire n'envoie rien à un serveur : il **prépare** un message et l'ouvre
dans WhatsApp (ou dans le client de messagerie si `WHATSAPP_NUMBER` est vide).

- **Téléphone** : `07 14 23 28 71`, `0714232871`, `+225 07 14 23 28 71` et
  `002250714232871` sont tous normalisés en `+225 07 14 23 28 71`. En Côte
  d'Ivoire le `0` initial fait partie du numéro international, il n'est donc
  jamais retiré. Un numéro étranger est accepté s'il porte son indicatif
  (`+221`, `+33`…) et garde la mise en forme tapée.
- **Objet** : `wa.me` ne transporte pas d'objet, il est donc placé en tête du
  message (`[Site] <besoin> — <nom>`) pour trier les demandes dans WhatsApp.
- **Onglet bloqué** : si `window.open` est refusé (bloqueur de pop-up, mode
  PWA), un lien de secours cliquable s'affiche dans le message de confirmation.
- **Second canal** : un lien « Pas de WhatsApp ? Écrivez-nous par e-mail » est
  toujours visible sous le bouton.

> Pour recevoir les demandes **par e-mail** (et non par WhatsApp), il faut un
> service côté serveur : Formspree, Web3Forms, Netlify Forms ou une fonction
> Netlify. Voir la section « Recevoir les demandes par e-mail » du README.

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
- réalisations et liens de démonstration : cartes `.project` ;
- affiches de couverture : images `assets/img/*-cover.webp` (1200 × 675) et leur
  variante mobile `*-cover-tall.webp` (880 × 1100), stylées par `.project--poster`
  (recadrage à gauche pour ne jamais couper le titre).

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

## Formulaire : envoi par e-mail (PHP + SMTP)

Le formulaire envoie désormais réellement un e-mail : `contact.php` reçoit le
`POST`, valide les champs et expédie le message par **SMTP authentifié** sur la
boîte de l'hébergement. WhatsApp reste proposé juste sous le bouton, pour qui
préfère discuter tout de suite.

```
index.html ──fetch──▶ contact.php ──SMTP──▶ mysupport@techzen.ci
                                   └─accusé──▶ adresse du visiteur
```

### 1. Créer `config.php` sur le serveur

`config.example.php` est le modèle. **Il ne contient aucun secret et peut être
versionné** ; `config.php`, lui, porte le mot de passe SMTP et est ignoré par
Git.

```bash
# sur le serveur, dans le dossier du site
cp config.example.php config.php
```

Puis renseignez au minimum :

| Clé | Valeur attendue |
| --- | --- |
| `smtp_host` | `mail.techzen.ci` (cPanel : `mail.<domaine>`) |
| `smtp_port` | `465` (SSL) ou `587` (STARTTLS) |
| `smtp_secure` | `'ssl'` ou `'tls'` |
| `smtp_user` | `mysupport@techzen.ci` |
| `smtp_pass` | **le mot de passe de la boîte** (jamais dans Git) |
| `to_email` | `mysupport@techzen.ci` |
| `from_email` | impérativement la boîte authentifiée, sinon SPF/DKIM casse |

### 2. Vérifier la configuration

Ouvrez `https://techzen.ci/contact.php?ping=1` : la réponse indique si
`config.php` est présent, l'hôte SMTP, et si le mot de passe est renseigné —
**sans jamais l'afficher**. Exemple :

```json
{ "config_present": true, "smtp_host": "mail.techzen.ci",
  "smtp_pass_set": true, "php_version": "8.2.x", "openssl": true }
```

### 3. Tester un envoi

Remplissez le formulaire du site : vous devez recevoir la demande sur
`mysupport@techzen.ci`, et le visiteur un accusé de réception. En cas d'échec :

- `contact.log` (à la racine, non servi par Apache) contient la raison exacte :
  authentification refusée, port fermé, message rejeté ;
- le formulaire propose alors **un lien WhatsApp** au visiteur, avec le même
  contenu — aucune demande n'est perdue.

### 4. Comportement

| Situation | Résultat |
| --- | --- |
| Envoi réussi | confirmation « Votre demande est bien envoyée » + accusé au visiteur |
| Champ invalide (serveur) | champ marqué, message explicite, pas de bascule |
| SMTP en panne / mal configuré | lien WhatsApp de secours, raison affichée |
| Réseau coupé, ou site ouvert sans PHP | lien WhatsApp de secours |
| Robot (champ piège, envoi < 3 s) | réponse neutre, rien n'est expédié |
| Plus de 5 envois/heure par IP | message d'attente, WhatsApp proposé |

### 5. Sécurité

- `.htaccess` interdit l'accès à `config.php`, `config.example.php` et
  `contact.log` ;
- toutes les valeurs affichées dans le mail sont nettoyées (pas d'injection
  d'en-têtes : retours à la ligne retirés) ;
- l'e-mail du visiteur part en `Reply-To` : vous répondez directement à la
  bonne personne ;
- les messages ne sont ni stockés ni relus par le site : ils partent
  immédiatement, l'accusé de réception compris ;
- limite de 5 envois par heure et par IP, journalisée sur le serveur.

### 6. Sans hébergement PHP

Si le site est ouvert depuis un simple serveur statique (aperçu local, Netlify,
GitHub Pages), `contact.php` n'est pas exécuté : le formulaire le détecte et
bascule automatiquement sur WhatsApp. Pour un envoi par e-mail sans PHP, il
faudrait un service tiers (Formspree, Web3Forms) branché sur l'attribut
`action`.

## Déploiement

Le site est statique, à l'exception du formulaire (`contact.php`, PHP + SMTP).

### Hébergement actuel : cPanel (TPEcloud) sur techzen.ci

1. Téléverser à la racine publique (`public_html`) : `index.html`, `styles.css`,
   `script.js`, `manifest.webmanifest`, `favicon.png`, `assets/`, `demo/`,
   `contact.php`, `config.example.php` et `.htaccess`.
2. Créer `config.php` **sur le serveur** (jamais dans le dépôt) et y mettre le
   mot de passe de `mysupport@techzen.ci`.
3. Vérifier PHP 8.x dans « Select PHP Version » (extensions `openssl` et
   `mbstring` recommandées).
4. Contrôler `https://techzen.ci/contact.php?ping=1`, puis envoyer une demande
   de test.
5. Dans « Email Deliverability », vérifier SPF et DKIM : sans eux, les mails
   peuvent tomber en spam.

⚠️ `techzenc@techzen.ci` est un compte **système** et le plan ne prévoit
qu'une boîte : c'est `mysupport@techzen.ci` qui reçoit et expédie. L'adresse
affichée partout sur le site est donc `mysupport@techzen.ci`.

### Autres hébergements

- **Netlify / Vercel** : brancher le dépôt, racine `/`, aucune commande de
  build. PHP n'y tourne pas : le formulaire bascule sur WhatsApp.
- **GitHub Pages** : publier la racine de `main`, même remarque.
- Pensez à servir `index.html`, `styles.css`, `script.js`,
  `manifest.webmanifest`, `assets/` et `demo/` avec les chemins relatifs
  intacts.

## Réalisations présentées

| Projet | Type | Démo locale | En ligne |
| --- | --- | --- | --- |
| FinaTrack CI | Application de pilotage budgétaire (PWA) | `demo/finatrack.html` | https://finnatrack.netlify.app |
| VoxNote | Notes vocales et photos (PWA) | `demo/voxnote/` | https://voxxnote.netlify.app/ |
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
