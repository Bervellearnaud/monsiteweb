<?php
/* ==========================================================================
   TechZen — configuration de l'envoi des demandes par e-mail
   --------------------------------------------------------------------------
   Modèle à copier sur le serveur sous le nom « config.php » :

       cp config.example.php config.php

   « config.php » contient le mot de passe de la boîte : il ne doit JAMAIS
   être versionné (il est déjà dans .gitignore).

   Les valeurs ci-dessous correspondent à l'hébergement cPanel de techzen.ci
   (TPEcloud) ; adaptez-les si l'hébergeur change.
   ========================================================================== */

return [

    /* --- Destination ------------------------------------------------------ */
    /* Boîte qui reçoit réellement les demandes (elle existe et fonctionne). */
    'to_email'   => 'mysupport@techzen.ci',
    'to_name'    => 'TechZen',

    /* --- Expéditeur (compte SMTP) ----------------------------------------- */
    /* OBLIGATOIREMENT la boîte authentifiée chez l'hébergeur : envoyer avec
       une autre adresse casse SPF/DKIM et part en spam. */
    'from_email' => 'mysupport@techzen.ci',
    'from_name'  => 'Site TechZen',

    /* --- SMTP ------------------------------------------------------------- */
    'smtp_host'   => 'mail.techzen.ci',   /* cPanel : mail.<domaine> */
    'smtp_port'   => 465,                 /* 465 = SSL, 587 = STARTTLS */
    'smtp_secure' => 'ssl',               /* 'ssl' ou 'tls' */
    'smtp_user'   => 'mysupport@techzen.ci',
    'smtp_pass'   => '',                  /* à remplir sur le serveur, jamais ici */

    /* --- Comportement ----------------------------------------------------- */
    /* true  : envoi authentifié par SMTP (recommandé, fiable)
       false : repli sur la fonction mail() de PHP (dépannage seulement) */
    'use_smtp'        => true,

    /* Accusé de réception automatique envoyé au visiteur. */
    'send_receipt'    => true,
    'receipt_subject' => 'Nous avons bien reçu votre demande — TechZen',
    'signature'       => "L'équipe TechZen\nAbidjan, Côte d'Ivoire\n+225 07 14 23 28 71",

    /* Anti-spam : nombre d'envois autorisés par adresse IP et par heure. */
    'max_per_hour' => 5,

    /* Journal technique (hors dossier public si possible). */
    'log_file' => __DIR__ . '/contact.log',
];
