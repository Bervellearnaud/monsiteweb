<?php
/* ==========================================================================
   TechZen — réception du formulaire de contact et envoi par e-mail
   --------------------------------------------------------------------------
   Appelé en POST par script.js (fetch). Répond toujours du JSON :

       { "ok": true,  "message": "…" }
       { "ok": false, "message": "…", "errors": { champ: "…" } }

   Aucune dépendance : l'envoi SMTP est implémenté ici, ce qui évite
   d'installer Composer sur un hébergement mutualisé.
   ========================================================================== */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* Pas de cache : chaque réponse dépend de la requête. */
header('Cache-Control: no-store');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, array $errors = [], int $status = 400): void
{
    respond(['ok' => false, 'message' => $message, 'errors' => $errors], $status);
}

/* --- Diagnostic (lecture seule, aucun secret) ----------------------------- */
/* Ouvrir https://techzen.ci/contact.php?ping=1 dans le navigateur indique si
   la configuration est en place, sans révéler le mot de passe. */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['ping'])) {
    $cfgFile = __DIR__ . '/config.php';
    $loaded = is_file($cfgFile) ? require $cfgFile : [];
    respond([
        'ok'             => true,
        'config_present' => is_file($cfgFile),
        'to_email'       => cfg($loaded, 'to_email', null),
        'from_email'     => cfg($loaded, 'from_email', null),
        'use_smtp'       => (bool) cfg($loaded, 'use_smtp', true),
        'smtp_host'      => cfg($loaded, 'smtp_host', null),
        'smtp_port'      => cfg($loaded, 'smtp_port', null),
        'smtp_user'      => cfg($loaded, 'smtp_user', null),
        'smtp_pass_set'  => (string) cfg($loaded, 'smtp_pass', '') !== '',
        'php_version'    => PHP_VERSION,
        'openssl'        => extension_loaded('openssl'),
        'mail_sent_via'  => (bool) cfg($loaded, 'use_smtp', true) ? 'smtp' : 'mail()',
    ]);
}

/* --- Méthode -------------------------------------------------------------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail('Méthode non autorisée.', [], 405);
}

/* --- Configuration -------------------------------------------------------- */
$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    /* On renvoie un 500 explicite : le site fonctionne, seul l'envoi manque. */
    fail("L'envoi par e-mail n'est pas encore configuré sur le serveur.", [], 500);
}
$config = require $configFile;

function cfg(array $config, string $key, $default = null)
{
    return array_key_exists($key, $config) ? $config[$key] : $default;
}

function logLine(array $config, string $line): void
{
    $file = cfg($config, 'log_file');
    if (!$file) {
        return;
    }
    @file_put_contents($file, '[' . date('c') . '] ' . $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/* --- Lecture des champs --------------------------------------------------- */
$raw = file_get_contents('php://input');
$data = [];
if ($raw !== false && $raw !== '' && strpos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== false) {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
} else {
    $data = $_POST;
}

function field(array $data, string $key, int $max = 5000): string
{
    $value = isset($data[$key]) && is_scalar($data[$key]) ? (string) $data[$key] : '';
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = trim(preg_replace('/[ \t]+/u', ' ', $value) ?? $value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

$name    = field($data, 'name', 120);
$email   = field($data, 'email', 190);
$phone   = field($data, 'phone', 40);
$need    = field($data, 'need', 120);
$message = field($data, 'message', 5000);
$trap    = field($data, 'website', 200);   // champ piège, invisible pour un humain
$started = (int) ($data['started_at'] ?? 0);

/* --- Anti-spam ------------------------------------------------------------ */
/* 1. champ piège rempli → robot */
if ($trap !== '') {
    logLine($config, 'SPAM trap: ' . substr($trap, 0, 60));
    respond(['ok' => true, 'message' => 'Merci, votre demande a bien été reçue.']); // on ne renseigne pas le robot
}

/* 2. formulaire envoyé en moins de 3 s → robot */
if ($started > 0 && (time() * 1000 - $started) < 3000) {
    logLine($config, 'SPAM too fast');
    respond(['ok' => true, 'message' => 'Merci, votre demande a bien été reçue.']);
}

/* 3. limitation par IP */
$maxPerHour = (int) cfg($config, 'max_per_hour', 5);
$ip = filter_var($_SERVER['REMOTE_ADDR'] ?? '', FILTER_VALIDATE_IP) ?: 'inconnue';
$throttleFile = sys_get_temp_dir() . '/techzen-contact-' . md5($ip) . '.txt';
$hits = [];
if (is_file($throttleFile)) {
    $hits = array_filter(array_map('intval', explode(',', (string) @file_get_contents($throttleFile))));
    $hits = array_values(array_filter($hits, fn($t) => $t > time() - 3600));
}
if (count($hits) >= $maxPerHour) {
    logLine($config, 'THROTTLE ' . $ip);
    fail('Trop de demandes envoyées depuis cet appareil. Réessayez dans une heure ou écrivez-nous sur WhatsApp.', [], 429);
}

/* --- Validation ----------------------------------------------------------- */
$errors = [];
if ($name === '') {
    $errors['name'] = 'Indiquez votre nom.';
} elseif (strlen($name) < 2) {
    $errors['name'] = 'Ce nom semble incomplet.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Indiquez une adresse e-mail valide.';
}

if ($message === '') {
    $errors['message'] = 'Décrivez votre projet en quelques mots.';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Ajoutez un peu de détail (10 caractères minimum).';
}

/* Téléphone : identique à la normalisation du navigateur. En Côte d'Ivoire le
   0 initial fait partie du numéro international. */
function normalizePhone(string $raw, array &$errors): array
{
    $value = trim($raw);
    if ($value === '') {
        return ['display' => '', 'intl' => ''];
    }

    $codes = ['225', '226', '221', '228', '229', '223', '224', '227', '237', '33', '32', '41', '1', '44'];
    $explicit = (strpos($value, '+') === 0 || strpos($value, '00') === 0);
    $digits = preg_replace('/\D+/', '', $value) ?? '';
    if (strpos($value, '00') === 0 && strpos($value, '+') !== 0) {
        $digits = substr($digits, 2);
    }
    if ($digits === '' || strlen($digits) < 7) {
        $errors['phone'] = 'Ce numéro semble trop court.';
        return ['display' => '', 'intl' => ''];
    }

    $code = '';
    $rest = $digits;
    if ($explicit) {
        foreach ([3, 2, 1] as $len) {
            if (in_array(substr($digits, 0, $len), $codes, true)) {
                $code = substr($digits, 0, $len);
                break;
            }
        }
        if ($code === '') {
            $errors['phone'] = "Indicatif pays non reconnu.";
            return ['display' => '', 'intl' => ''];
        }
        $rest = substr($digits, strlen($code));
    } elseif (strlen($digits) === 10) {
        $code = '225';
    } elseif (strlen($digits) > 10) {
        foreach ([3, 2, 1] as $len) {
            if (in_array(substr($digits, 0, $len), $codes, true)) {
                $code = substr($digits, 0, $len);
                break;
            }
        }
        if ($code === '') {
            $errors['phone'] = "Indicatif pays manquant.";
            return ['display' => '', 'intl' => ''];
        }
        $rest = substr($digits, strlen($code));
    } else {
        $errors['phone'] = "Ajoutez l'indicatif pays, par exemple +225.";
        return ['display' => '', 'intl' => ''];
    }

    if (strlen($rest) < 6) {
        $errors['phone'] = 'Ce numéro semble trop court.';
        return ['display' => '', 'intl' => ''];
    }

    return [
        'display' => '+' . $code . ' ' . trim(chunk_split($rest, 2, ' ')),
        'intl'    => '+' . $code . $rest,
    ];
}

$phoneParts = normalizePhone($phone, $errors);

if ($errors) {
    fail('Merci de corriger les champs signalés.', $errors, 422);
}

/* --- En-têtes anti-injection --------------------------------------------- */
function singleLine(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

$safeName  = singleLine($name);
$safeEmail = singleLine($email);
$safeNeed  = singleLine($need !== '' ? $need : 'Non précisé');
$subject   = '[Site] ' . $safeNeed . ' — ' . $safeName;

/* --- Corps du message ----------------------------------------------------- */
$body = "Nouvelle demande depuis le site techzen.ci\n"
    . str_repeat('=', 46) . "\n\n"
    . "Nom              : {$safeName}\n"
    . "E-mail           : {$safeEmail}\n"
    . 'Téléphone        : ' . ($phoneParts['display'] !== '' ? $phoneParts['display'] : '—') . "\n"
    . "Besoin           : {$safeNeed}\n\n"
    . "Projet\n"
    . str_repeat('-', 46) . "\n"
    . $message . "\n\n"
    . str_repeat('-', 46) . "\n"
    . 'Reçu le ' . date('d/m/Y à H:i') . ' — IP ' . $ip . "\n";

/* --- Envoi SMTP ----------------------------------------------------------- */
/**
 * Dialogue SMTP minimal : EHLO, STARTTLS ou SSL direct, AUTH LOGIN, MAIL FROM,
 * RCPT TO, DATA. Renvoie null si tout va bien, sinon le message d'erreur.
 */
function smtpSend(array $cfg, string $from, string $fromName, string $to, string $subject, string $body, string $replyTo): ?string
{
    $host = (string) cfg($cfg, 'smtp_host', '');
    $port = (int) cfg($cfg, 'smtp_port', 465);
    $secure = strtolower((string) cfg($cfg, 'smtp_secure', 'ssl'));
    $user = (string) cfg($cfg, 'smtp_user', '');
    $pass = (string) cfg($cfg, 'smtp_pass', '');

    if ($host === '' || $user === '' || $pass === '') {
        return 'SMTP incomplet : hôte, utilisateur ou mot de passe manquant dans config.php.';
    }

    $target = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $errno = 0;
    $errstr = '';
    $sock = @stream_socket_client($target, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$sock) {
        return "Connexion SMTP impossible ({$errno}) : {$errstr}";
    }
    stream_set_timeout($sock, 15);

    $read = static function ($sock): string {
        $out = '';
        while (($line = fgets($sock, 515)) !== false) {
            $out .= $line;
            if (strlen($line) < 4 || $line[3] !== '-') {
                break;
            }
        }
        return $out;
    };
    $cmd = static function ($sock, string $c, array $codes) use ($read): ?string {
        fwrite($sock, $c . "\r\n");
        $resp = $read($sock);
        $code = (int) substr($resp, 0, 3);
        return in_array($code, $codes, true) ? null : ($c . ' → ' . trim($resp));
    };

    $greeting = $read($sock);
    if ((int) substr($greeting, 0, 3) !== 220) {
        fclose($sock);
        return 'Accueil SMTP inattendu : ' . trim($greeting);
    }

    $hostname = gethostname() ?: 'techzen.ci';
    if (($e = $cmd($sock, 'EHLO ' . $hostname, [250])) !== null) {
        fclose($sock);
        return $e;
    }

    if ($secure === 'tls') {
        if (($e = $cmd($sock, 'STARTTLS', [220])) !== null) {
            fclose($sock);
            return $e;
        }
        if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($sock);
            return 'STARTTLS refusé par le serveur.';
        }
        if (($e = $cmd($sock, 'EHLO ' . $hostname, [250])) !== null) {
            fclose($sock);
            return $e;
        }
    }

    if (($e = $cmd($sock, 'AUTH LOGIN', [334])) !== null) {
        fclose($sock);
        return $e;
    }
    if (($e = $cmd($sock, base64_encode($user), [334])) !== null) {
        fclose($sock);
        return $e;
    }
    if (($e = $cmd($sock, base64_encode($pass), [235])) !== null) {
        fclose($sock);
        return 'Authentification refusée — vérifiez smtp_user / smtp_pass. (' . $e . ')';
    }

    if (($e = $cmd($sock, 'MAIL FROM:<' . $from . '>', [250])) !== null) {
        fclose($sock);
        return $e;
    }
    if (($e = $cmd($sock, 'RCPT TO:<' . $to . '>', [250, 251])) !== null) {
        fclose($sock);
        return $e;
    }
    if (($e = $cmd($sock, 'DATA', [354])) !== null) {
        fclose($sock);
        return $e;
    }

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = [
        'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <' . $from . '>',
        'To: <' . $to . '>',
        'Reply-To: ' . $replyTo,
        'Subject: ' . $encodedSubject,
        'Date: ' . date('r'),
        'Message-ID: <' . bin2hex(random_bytes(8)) . '@' . ($hostname ?: 'techzen.ci') . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: TechZen contact.php',
    ];

    /* En SMTP, une ligne commençant par « . » terminerait le message :
       on la double (dot-stuffing, RFC 5321 §4.5.2). */
    $safeBody = str_replace("\n", "\r\n", $body);
    $safeBody = preg_replace("/(^|\r\n)\./", "$1..", $safeBody);

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $safeBody . "\r\n.";
    fwrite($sock, $payload . "\r\n");
    $resp = $read($sock);
    fclose($sock);

    return (int) substr($resp, 0, 3) === 250 ? null : 'Message refusé : ' . trim($resp);
}

/** Repli sans authentification (dépannage : souvent classé en spam). */
function mailFallback(array $cfg, string $from, string $fromName, string $to, string $subject, string $body, string $replyTo): ?string
{
    $headers = implode("\r\n", [
        'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <' . $from . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $from);
    return $ok ? null : 'La fonction mail() du serveur a échoué.';
}

$to = (string) cfg($config, 'to_email');
$from = (string) cfg($config, 'from_email');
$fromName = (string) cfg($config, 'from_name', 'Site TechZen');

$error = null;
if ((bool) cfg($config, 'use_smtp', true)) {
    $error = smtpSend($config, $from, $fromName, $to, $subject, $body, $safeEmail);
} else {
    $error = mailFallback($config, $from, $fromName, $to, $subject, $body, $safeEmail);
}

if ($error !== null) {
    logLine($config, 'SEND FAILED ' . $safeEmail . ' :: ' . $error);
    fail("L'envoi a échoué de notre côté. Écrivez-nous sur WhatsApp au +225 07 14 23 28 71.", [], 502);
}

/* --- Accusé de réception au visiteur -------------------------------------- */
$receipt = '';
if ((bool) cfg($config, 'send_receipt', true)) {
    $receiptBody = "Bonjour {$safeName},\n\n"
        . "Nous avons bien reçu votre demande concernant : {$safeNeed}.\n"
        . "Nous revenons vers vous sous 24 heures ouvrées, à cette adresse.\n\n"
        . "Récapitulatif\n"
        . str_repeat('-', 46) . "\n"
        . $body
        . "\n" . (string) cfg($config, 'signature', 'TechZen') . "\n";

    $receiptSubject = (string) cfg($config, 'receipt_subject', 'Nous avons bien reçu votre demande — TechZen');
    $receiptError = (bool) cfg($config, 'use_smtp', true)
        ? smtpSend($config, $from, $fromName, $safeEmail, $receiptSubject, $receiptBody, $to)
        : mailFallback($config, $from, $fromName, $safeEmail, $receiptSubject, $receiptBody, $to);

    if ($receiptError !== null) {
        /* L'essentiel est passé : la demande est arrivée. On journalise seulement. */
        logLine($config, 'RECEIPT FAILED ' . $safeEmail . ' :: ' . $receiptError);
        $receipt = 'no-receipt';
    } else {
        $receipt = 'receipt';
    }
}

/* --- Journal de la limitation -------------------------------------------- */
$hits[] = time();
@file_put_contents($throttleFile, implode(',', $hits));

logLine($config, 'OK ' . $safeEmail . ' :: ' . $safeNeed . ' :: ' . $phoneParts['intl'] . ' :: ' . $receipt);

respond([
    'ok'      => true,
    'message' => 'Merci ' . $safeName . ' ! Votre demande est bien envoyée'
        . ($receipt === 'receipt' ? ', et un accusé de réception part vers ' . $safeEmail . '.' : '.'),
    'receipt' => $receipt,
]);
