<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Hong_Kong');

const OPENING = [
    0 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
    1 => ['closed' => true,  'opens' => null,    'closes' => null],
    2 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
    3 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
    4 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
    5 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
    6 => ['closed' => false, 'opens' => '10:00', 'closes' => '18:00'],
];

const PHONE_CODES = ['+852', '+86', '+853', '+886', '+44', '+1'];
const PHONE_FORMATS = [
    '+852' => ['min' => 8, 'max' => 8],
    '+86' => ['min' => 11, 'max' => 11],
    '+853' => ['min' => 8, 'max' => 8],
    '+886' => ['min' => 9, 'max' => 10],
    '+44' => ['min' => 10, 'max' => 10],
    '+1' => ['min' => 10, 'max' => 10],
];
const REFERRALS = [
    'social_media' => ['en' => 'Social media', 'zh-Hant' => '社交媒體'],
    'university_website' => ['en' => 'University website', 'zh-Hant' => '大學網站'],
    'friend_family_colleague' => ['en' => 'Friend / family / colleague', 'zh-Hant' => '親友 / 同事'],
    'campus_posters' => ['en' => 'On-campus posters or banners', 'zh-Hant' => '校園海報或橫額'],
    'email_newsletter' => ['en' => 'Email / newsletter', 'zh-Hant' => '電郵 / 通訊'],
    'search_engine' => ['en' => 'Search engine', 'zh-Hant' => '搜尋引擎'],
    'other' => ['en' => 'Other', 'zh-Hant' => '其他'],
];

function cfg(): array {
    static $c = null;
    if ($c !== null) return $c;
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        return [];
    }
    $c = require $path;
    return $c;
}

function locale(): string {
    if (!empty($_GET['lang']) && in_array($_GET['lang'], ['en', 'zh-Hant'], true)) {
        $loc = $_GET['lang'];
        setcookie('syum_locale', $loc, time() + 86400 * 365, '/');
        return $loc;
    }
    $cookie = $_COOKIE['syum_locale'] ?? '';
    if (in_array($cookie, ['en', 'zh-Hant'], true)) return $cookie;
    $al = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    return (stripos($al, 'zh') !== false) ? 'zh-Hant' : 'en';
}

function h(?string $s): string {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function today(): string {
    return (new DateTimeImmutable('now'))->format('Y-m-d');
}

function add_days(string $iso, int $days): string {
    return (new DateTimeImmutable($iso))->modify(($days >= 0 ? '+' : '') . $days . ' days')->format('Y-m-d');
}

function weekday(string $iso): int {
    return (int) (new DateTimeImmutable($iso))->format('w');
}

function slots_for_date(string $iso): array {
    $cfg = cfg();
    $minAhead = 0;
    $maxAhead = (int) ($cfg['max_days_ahead'] ?? 180);
    $minutes = (int) ($cfg['session_minutes'] ?? 90);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $iso)) return [];
    if ($iso < add_days(today(), $minAhead) || $iso > add_days(today(), $maxAhead)) return [];
    $w = weekday($iso);
    $hours = OPENING[$w] ?? null;
    if (!$hours || $hours['closed'] || !$hours['opens']) return [];
    [$oh, $om] = array_map('intval', explode(':', $hours['opens']));
    [$ch, $cm] = array_map('intval', explode(':', $hours['closes']));
    $start = $oh * 60 + $om;
    $end = $ch * 60 + $cm;
    $starts = [];
    for ($t = $start; $t + $minutes <= $end; $t += $minutes) {
        $starts[] = $t;
    }
    $lastStart = $end - $minutes;
    if ($lastStart >= $start) {
        if ($starts && $starts[count($starts) - 1] !== $lastStart) {
            if ($starts[count($starts) - 1] + $minutes > $lastStart) {
                array_pop($starts);
            }
            if (!$starts || end($starts) + $minutes <= $lastStart) {
                $starts[] = $lastStart;
            }
        } elseif (!$starts) {
            $starts[] = $lastStart;
        }
    }
    $slots = [];
    foreach ($starts as $t) {
        $slots[] = sprintf('%02d:%02d', intdiv($t, 60), $t % 60);
    }
    if ($iso === today()) {
        $now = ((int) date('G')) * 60 + (int) date('i');
        $slots = array_values(array_filter($slots, static function ($slot) use ($now) {
            [$h, $m] = array_map('intval', explode(':', $slot));
            return ($h * 60 + $m) > $now;
        }));
    }
    return $slots;
}

function slot_end(string $slot): string {
    $minutes = (int) (cfg()['session_minutes'] ?? 90);
    [$h, $m] = array_map('intval', explode(':', $slot));
    $end = $h * 60 + $m + $minutes;
    return sprintf('%02d:%02d', intdiv($end, 60), $end % 60);
}

function db(): mysqli {
    static $m = null;
    if ($m instanceof mysqli) return $m;
    $c = cfg();
    if (!$c) {
        throw new RuntimeException('Missing inc/config.php — run /setup.php first.');
    }
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $m = new mysqli($c['db_host'], $c['db_user'], $c['db_pass'], $c['db_name']);
    $m->set_charset('utf8mb4');
    ensure_extra_guests_column($m);
    return $m;
}

function ensure_extra_guests_column(mysqli $m): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    try {
        $m->query('ALTER TABLE museum_bookings ADD COLUMN extra_guests TEXT NULL');
    } catch (Throwable $e) {
        // Column already exists.
    }
}

function phone_ok(string $code, string $national): bool
{
    $digits = preg_replace('/\D+/', '', $national) ?? '';
    $fmt = PHONE_FORMATS[$code] ?? null;
    if (!$fmt) {
        return false;
    }
    $len = strlen($digits);
    return $len >= $fmt['min'] && $len <= $fmt['max'];
}

function email_ok(string $email): bool
{
    if ($email === '' || strlen($email) > 254 || strpos($email, ' ') !== false) {
        return false;
    }
    return (bool) preg_match('/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})*$/', $email);
}

function json_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_out(array $payload, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function new_id(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $hex = bin2hex($b);
    return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20, 12));
}

function new_reference(): string {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $out = 'SYUM-';
    for ($i = 0; $i < 6; $i++) {
        $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $out;
}
