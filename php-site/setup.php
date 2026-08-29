<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Hong_Kong');
$configPath = __DIR__ . '/inc/config.php';
$schemaCandidates = [
    __DIR__ . '/inc/schema.sql',
    __DIR__ . '/sql/museum_bookings.sql',
    dirname(__DIR__) . '/sql/museum_bookings.sql',
];
$done = false;
$error = '';
$ok = '';
$configDump = '';

function schema_sql(array $candidates): string
{
    foreach ($candidates as $path) {
        if (is_file($path)) {
            $raw = (string) file_get_contents($path);
            if (trim($raw) !== '') {
                return $raw;
            }
        }
    }
    return 'CREATE TABLE IF NOT EXISTS museum_bookings (
  id CHAR(36) NOT NULL,
  reference VARCHAR(16) NOT NULL,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  phone_country_code VARCHAR(8) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(254) NOT NULL,
  visit_date DATE NOT NULL,
  visit_slot CHAR(5) NOT NULL,
  guests TINYINT UNSIGNED NOT NULL,
  extra_guests TEXT NULL,
  referral_source VARCHAR(40) NOT NULL,
  accepted_terms_at DATETIME NOT NULL,
  locale VARCHAR(16) NOT NULL DEFAULT \'en\',
  status VARCHAR(16) NOT NULL DEFAULT \'confirmed\',
  confirmation_email_sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY reference (reference),
  KEY slot_idx (visit_date, visit_slot, status),
  KEY email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $host = trim((string) ($_POST['db_host'] ?? 'localhost'));
    $name = trim((string) ($_POST['db_name'] ?? 'museumdb'));
    $user = trim((string) ($_POST['db_user'] ?? 'museum'));
    $pass = (string) ($_POST['db_pass'] ?? '');
    $from = trim((string) ($_POST['mail_from'] ?? 'museum@hksyu.edu'));
    $staff = (string) ($_POST['staff_password'] ?? '');
    if ($pass === '' || $staff === '') {
        $error = 'Database password and staff password are required.';
    } elseif (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        $error = 'Confirmation From address must be a valid email.';
    } else {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try {
            $m = new mysqli($host, $user, $pass, $name);
            $m->set_charset('utf8mb4');
            $m->query(schema_sql($schemaCandidates));
            $export = var_export([
                'db_host' => $host,
                'db_name' => $name,
                'db_user' => $user,
                'db_pass' => $pass,
                'mail_from' => $from,
                'mail_from_name' => 'SYU History Museum',
                'staff_password_hash' => password_hash($staff, PASSWORD_DEFAULT),
                'session_capacity' => 30,
                'session_minutes' => 90,
                'min_guests' => 1,
                'max_guests' => 30,
                'min_days_ahead' => 0,
                'max_days_ahead' => 180,
            ], true);
            $php = "<?php\nreturn {$export};\n";
            @mkdir(dirname($configPath), 0755, true);
            $wrote = @file_put_contents($configPath, $php);
            if ($wrote === false) {
                $done = true;
                $ok = 'Connected and table is ready, but PHP (www-data) could not write inc/config.php. Save the file below via SFTP as inc/config.php, then delete setup.php.';
                $configDump = $php;
            } else {
                $done = true;
                $ok = 'Connected, table ready, config saved. Delete setup.php and museum-install.php from the server now.';
            }
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Museum setup</title>
  <link rel="stylesheet" href="/assets/museum.css">
</head>
<body>
  <main class="setup">
    <h1>SYU History Museum — server setup</h1>
    <p>This writes <code>inc/config.php</code> and creates the <code>museum_bookings</code> table. Use the MySQL account from phpMyAdmin. Delete this file after it succeeds.</p>
    <?php if ($error): ?><p class="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <?php if ($ok): ?><p><?= htmlspecialchars($ok, ENT_QUOTES, 'UTF-8') ?></p>
      <?php if ($configDump): ?>
        <p>Create folder <code>inc</code> if needed, then save this as <code>inc/config.php</code>:</p>
        <textarea rows="18" style="width:100%;font-family:monospace;font-size:12px;"><?= htmlspecialchars($configDump, ENT_QUOTES, 'UTF-8') ?></textarea>
      <?php endif; ?>
      <p><a class="btn" href="/">Open the site</a> <a class="btn outline" href="/staff/">Staff bookings</a></p>
    <?php else: ?>
    <form method="post">
      <label>MySQL host<input name="db_host" value="localhost" required></label>
      <p style="font-size:.85rem;color:#6e5a3e;">If connection fails, try <code>www13.hksyu.edu</code> or the host shown in phpMyAdmin.</p>
      <label>Database name<input name="db_name" value="museumdb" required></label>
      <label>Database user<input name="db_user" value="museum" required></label>
      <label>Database password<input name="db_pass" type="password" required></label>
      <label>Confirmation From address<input name="mail_from" value="museum@hksyu.edu" required></label>
      <label>Staff page password<input name="staff_password" type="password" required autocomplete="new-password"></label>
      <p class="actions"><button class="btn" type="submit">Create table and save</button></p>
    </form>
    <?php endif; ?>
  </main>
</body>
</html>
