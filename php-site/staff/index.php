<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
require __DIR__ . '/../inc/email.php';

$cfg = cfg();
if (!$cfg) {
    header('Location: /setup.php');
    exit;
}

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/staff/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
]);
session_start();
$err = '';
$mailMsg = '';
if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: /staff/');
    exit;
}

function staff_password_ok(array $cfg, string $pw): bool
{
    $hash = (string) ($cfg['staff_password_hash'] ?? '');
    if ($hash !== '' && password_verify($pw, $hash)) {
        return true;
    }
    $plain = (string) ($cfg['staff_password'] ?? '');
    return $plain !== '' && hash_equals($plain, $pw);
}

function staff_slot_tone(string $slot): string
{
    $tones = ['10:00' => 'teal', '11:30' => 'green', '13:00' => 'brown', '14:30' => 'navy', '16:30' => 'gold'];
    if (isset($tones[$slot])) {
        return $tones[$slot];
    }
    $keys = array_values($tones);
    return $keys[crc32($slot) % count($keys)];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && empty($_SESSION['museum_staff'])) {
    $pw = (string) ($_POST['password'] ?? '');
    if (staff_password_ok($cfg, $pw)) {
        $_SESSION['museum_staff'] = true;
        header('Location: /staff/');
        exit;
    }
    $err = 'Incorrect password.';
}
$authed = !empty($_SESSION['museum_staff']);
if ($authed && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['cancel_reference']) && (string) ($_POST['cancel_confirm'] ?? '') === 'yes') {
    $ref = strtoupper(trim((string) $_POST['cancel_reference']));
    $keepDate = (string) ($_POST['keep_date'] ?? '');
    $keepMonth = (string) ($_POST['keep_month'] ?? '');
    $ok = false;
    if (preg_match('/^SYUM-[A-Z0-9]{5,8}$/', $ref)) {
        $st = db()->prepare('UPDATE museum_bookings SET status = "cancelled" WHERE reference = ? AND status = "confirmed"');
        $st->bind_param('s', $ref);
        $st->execute();
        $ok = $st->affected_rows > 0;
        $st->close();
    }
    $_SESSION['museum_staff_flash'] = $ok ? ('cancelled:' . $ref) : 'cancel_fail';
    $qs = [];
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $keepDate)) {
        $qs[] = 'date=' . rawurlencode($keepDate);
    }
    if (preg_match('/^\d{4}-\d{2}$/', $keepMonth)) {
        $qs[] = 'month=' . rawurlencode($keepMonth);
    }
    header('Location: /staff/' . ($qs ? ('?' . implode('&', $qs)) : ''));
    exit;
}
if ($authed && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['test_email'])) {
    $to = strtolower(trim((string) ($_POST['test_email'] ?? '')));
    $keepDate = (string) ($_POST['keep_date'] ?? '');
    $keepMonth = (string) ($_POST['keep_month'] ?? '');
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $mailMsg = 'Enter a valid email for the test.';
    } else {
        $mailMsg = send_test_mail($to)
            ? 'Test mail accepted by the server for ' . $to . '. Check inbox and spam.'
            : 'mail() returned false. Ask Computing Services to allow this vhost to send as museum@hksyu.edu. Bookings still save without email.';
    }
    $qs = [];
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $keepDate)) {
        $qs[] = 'date=' . rawurlencode($keepDate);
    }
    if (preg_match('/^\d{4}-\d{2}$/', $keepMonth)) {
        $qs[] = 'month=' . rawurlencode($keepMonth);
    }
    $_SESSION['museum_mail_msg'] = $mailMsg;
    header('Location: /staff/' . ($qs ? ('?' . implode('&', $qs) . '&mail=1') : '?mail=1'));
    exit;
}
if ($authed && isset($_GET['mail']) && !empty($_SESSION['museum_mail_msg'])) {
    $mailMsg = (string) $_SESSION['museum_mail_msg'];
    unset($_SESSION['museum_mail_msg']);
}

$staffFlash = '';
if ($authed && !empty($_SESSION['museum_staff_flash'])) {
    $staffFlash = (string) $_SESSION['museum_staff_flash'];
    unset($_SESSION['museum_staff_flash']);
}

$pendingCancel = '';
if ($authed && isset($_GET['cancel']) && preg_match('/^SYUM-[A-Z0-9]{5,8}$/', strtoupper((string) $_GET['cancel']))) {
    $pendingCancel = strtoupper((string) $_GET['cancel']);
}

$loc = locale();
$L = t($loc);
$zh = $loc === 'zh-Hant';

if (!$authed) {
    render_header($zh ? '職員 — 參觀預約' : 'Staff bookings — SYU History Museum', '/staff/');
    echo '<main id="main" class="page shell staff-page">';
    echo '<h1>' . h($zh ? '參觀預約' : 'Bookings') . '</h1>';
    echo '<form class="setup" method="post"><p>' . h($zh ? '職員查看已確認參觀。訪客無需登入。' : 'Staff list of confirmed visits. Visitors do not need this.') . '</p>';
    if ($err) echo '<p class="alert">' . h($err) . '</p>';
    echo '<label>' . h($zh ? '密碼' : 'Password') . ' <input type="password" name="password" required autocomplete="current-password"></label>';
    echo '<p class="actions"><button class="btn" type="submit">' . h($zh ? '開啟' : 'Open') . '</button></p></form>';
    echo '</main>';
    render_footer();
    exit;
}

function staff_app_start(string $title, bool $zh): void
{
    $lang = $zh ? 'zh-Hant-HK' : 'en';
    echo '<!doctype html><html lang="' . h($lang) . '"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
    echo '<title>' . h($title) . '</title>';
    echo '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&family=Source+Sans+3:wght@400;600&family=Source+Serif+4:wght@400;600;700&display=swap">';
    echo '<link rel="stylesheet" href="/assets/museum.css?v=21">';
    echo '</head><body class="staff-body">';
}

staff_app_start($zh ? '職員 — 參觀預約' : 'Staff bookings — SYU History Museum', $zh);

$db = db();
$cap = (int) ($cfg['session_capacity'] ?? 30);
$today = today();
$byDate = [];
$res = $db->query(
    'SELECT visit_date, COUNT(*) AS bookings, COALESCE(SUM(guests), 0) AS guests
     FROM museum_bookings
     WHERE status = "confirmed"
     GROUP BY visit_date
     ORDER BY visit_date'
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $byDate[(string) $row['visit_date']] = $row;
    }
}

$selected = (string) ($_GET['date'] ?? '');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selected)) {
    $selected = '';
}
if ($selected === '') {
    foreach ($byDate as $iso => $row) {
        if ($iso >= $today) {
            $selected = $iso;
            break;
        }
    }
    if ($selected === '' && $byDate) {
        $keys = array_keys($byDate);
        $selected = $keys[count($keys) - 1];
    }
    if ($selected === '') {
        $selected = $today;
    }
}

$month = (string) ($_GET['month'] ?? substr($selected, 0, 7));
if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
    $month = substr($selected, 0, 7);
}
$monthStart = new DateTimeImmutable($month . '-01');
$prevMonth = $monthStart->modify('-1 month')->format('Y-m');
$nextMonth = $monthStart->modify('+1 month')->format('Y-m');
$monthLabel = $zh
    ? $monthStart->format('Y年n月')
    : $monthStart->format('F Y');

$monthBookings = 0;
$monthGuests = 0;
foreach ($byDate as $iso => $row) {
    if (substr($iso, 0, 7) === $month) {
        $monthBookings += (int) $row['bookings'];
        $monthGuests += (int) $row['guests'];
    }
}

$visitors = [];
$stmt = $db->prepare(
    'SELECT reference, first_name, last_name, phone_country_code, phone, email,
            visit_slot, guests, extra_guests, locale, confirmation_email_sent_at, created_at
     FROM museum_bookings
     WHERE status = "confirmed" AND visit_date = ?
     ORDER BY visit_slot, created_at'
);
$stmt->bind_param('s', $selected);
$stmt->execute();
$result = $stmt->get_result();
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $visitors[] = $row;
    }
}
$stmt->close();

$bySlot = [];
$dayGuests = 0;
foreach ($visitors as $v) {
    $slot = (string) $v['visit_slot'];
    if (!isset($bySlot[$slot])) {
        $bySlot[$slot] = ['guests' => 0, 'n' => 0];
    }
    $g = (int) $v['guests'];
    $bySlot[$slot]['guests'] += $g;
    $bySlot[$slot]['n'] += 1;
    $dayGuests += $g;
}

$weekdays = $zh ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
$startPad = (int) $monthStart->format('w');
$daysInMonth = (int) $monthStart->format('t');
$dayLabel = pretty_date($selected, $zh ? 'zh-Hant' : 'en');

echo '<main id="main" class="staff-dash">';
echo '<div class="staff-shell">';
echo '<p class="staff-appbar">';
echo '<a href="/">' . h($zh ? '返回校史館主頁' : 'Museum home') . '</a>';
echo '<span class="langs" role="group">';
echo '<a href="?lang=zh-Hant"' . ($zh ? ' aria-current="true" class="current"' : '') . '>中</a> ';
echo '<a href="?lang=en"' . (!$zh ? ' aria-current="true" class="current"' : '') . '>Eng</a>';
echo '</span></p>';
echo '<div class="staff-top">';
echo '<div><h1>' . h($zh ? '參觀預約' : 'Bookings') . '</h1>';
echo '<p>' . h($zh ? '日曆顯示有預約的日子。點選日期核對訪客與時段人數。' : 'The calendar marks days with bookings. Open a date to check visitors and how full each session is.') . '</p></div>';
echo '<a class="staff-out" href="/staff/?logout=1">' . h($zh ? '登出' : 'Sign out') . '</a>';
echo '</div>';
if ($staffFlash !== '') {
    if (strpos($staffFlash, 'cancelled:') === 0) {
        $doneRef = substr($staffFlash, 10);
        echo '<p class="staff-mail-ok">' . h($zh
            ? ('已取消預約 ' . $doneRef . '。該時段名額已釋放。')
            : ('Cancelled ' . $doneRef . '. Those places are open again.')) . '</p>';
    } else {
        echo '<p class="alert">' . h($zh ? '未能取消該預約，請再試。' : 'Could not cancel that booking. Please try again.') . '</p>';
    }
}

echo '<div class="staff-stats">';
echo '<div><strong>' . h((string) $monthBookings) . '</strong><span>' . h($zh ? '本月預約' : 'Bookings this month') . '</span></div>';
echo '<div><strong>' . h((string) $monthGuests) . '</strong><span>' . h($zh ? '本月人數' : 'Guests this month') . '</span></div>';
echo '<div><strong>' . h((string) count($visitors)) . '</strong><span>' . h($zh ? '當日預約' : 'On selected day') . '</span></div>';
echo '<div><strong>' . h((string) $dayGuests) . '</strong><span>' . h($zh ? '當日人數（合計）' : 'Guests that day in total') . '</span></div>';
echo '</div>';

echo '<div class="staff-grid">';

echo '<section class="staff-panel staff-cal" aria-label="' . h($zh ? '預約日曆' : 'Bookings calendar') . '">';
echo '<div class="staff-cal-head">';
echo '<a href="/staff/?month=' . h($prevMonth) . '&date=' . h($selected) . '" aria-label="' . h($zh ? '上個月' : 'Previous month') . '">‹</a>';
echo '<h2>' . h($monthLabel) . '</h2>';
echo '<a href="/staff/?month=' . h($nextMonth) . '&date=' . h($selected) . '" aria-label="' . h($zh ? '下個月' : 'Next month') . '">›</a>';
echo '</div>';
echo '<div class="staff-cal-week">';
foreach ($weekdays as $w) {
    echo '<span>' . h($w) . '</span>';
}
echo '</div>';
echo '<div class="staff-cal-days">';
for ($i = 0; $i < $startPad; $i++) {
    echo '<span class="empty"></span>';
}
for ($d = 1; $d <= $daysInMonth; $d++) {
    $iso = $monthStart->format('Y-m') . '-' . str_pad((string) $d, 2, '0', STR_PAD_LEFT);
    $closed = weekday($iso) === 1;
    $info = $byDate[$iso] ?? null;
    $cls = 'day';
    if ($closed) {
        $cls .= ' closed';
    }
    if ($iso === $today) {
        $cls .= ' today';
    }
    if ($iso === $selected) {
        $cls .= ' sel';
    }
    if ($info) {
        $cls .= ' booked';
    }
    if ($closed) {
        echo '<span class="' . $cls . '"><em>' . $d . ($iso === $today ? ' <b class="staff-today-tag">' . h($zh ? '今天' : 'Today') . '</b>' : '') . '</em><small>' . h($zh ? '休館' : 'Closed') . '</small></span>';
    } else {
        echo '<a class="' . $cls . '" href="/staff/?month=' . h($month) . '&date=' . h($iso) . '">';
        echo '<em>' . $d;
        if ($iso === $today) {
            echo ' <b class="staff-today-tag">' . h($zh ? '今天' : 'Today') . '</b>';
        }
        echo '</em>';
        if ($info) {
            echo '<small>' . h($zh ? ((int) $info['guests'] . ' 人') : ((int) $info['guests'] . ' guests')) . '</small>';
        } else {
            echo '<small class="mute">' . h($zh ? '無預約' : 'None') . '</small>';
        }
        echo '</a>';
    }
}
echo '</div></section>';

echo '<section class="staff-panel staff-agenda">';
echo '<h2>' . h($dayLabel) . '</h2>';
echo '<p class="staff-summary">' . h($zh
    ? (count($visitors) . ' 筆預約 · 共 ' . $dayGuests . ' 人')
    : (count($visitors) . ' bookings · ' . $dayGuests . ' guests')) . '</p>';

if (!$visitors) {
    echo '<p class="staff-empty">' . h($zh ? '這天沒有已確認預約。' : 'No confirmed bookings on this day.') . '</p>';
} else {
    echo '<div class="staff-box">';
    echo '<h3>' . h($zh ? '時段名額' : 'Session fill') . '</h3>';
    echo '<ul class="staff-fill">';
    foreach ($bySlot as $slot => $info) {
        $end = slot_end($slot);
        $left = max($cap - (int) $info['guests'], 0);
        $pct = $cap > 0 ? min(100, (int) round(100 * $info['guests'] / $cap)) : 0;
        $g = (int) $info['guests'];
        $n = (int) $info['n'];
        $id = 'vis-' . str_replace(':', '', $slot);
        echo '<li><button type="button" class="staff-jump' . ($left === 0 ? ' full' : '') . '" data-target="' . h($id) . '">';
        echo '<strong>' . h($slot . ' – ' . $end) . '</strong>';
        echo '<span>' . h($zh
            ? ($g . ' / ' . $cap . ' 人 · ' . $n . ' 筆')
            : ($g . ' / ' . $cap . ' guests · ' . $n . ' ' . ($n === 1 ? 'booking' : 'bookings')));
        echo ($left === 0 ? ' · ' . h($zh ? '已滿' : 'Full') : '') . '</span>';
        echo '<span class="staff-meter" aria-hidden="true"><i style="width:' . $pct . '%"></i></span>';
        echo '</button></li>';
    }
    echo '</ul></div>';

    echo '<div class="staff-box">';
    echo '<h3>' . h($zh ? '訪客資料' : 'Visitor details') . '</h3>';
    foreach ($bySlot as $slot => $info) {
        $end = slot_end($slot);
        $g = (int) $info['guests'];
        $id = 'vis-' . str_replace(':', '', $slot);
        echo '<article class="staff-session" id="' . h($id) . '">';
        echo '<h4>' . h($slot . ' – ' . $end) . ' · ' . h($zh
            ? ($g . ' 人')
            : ($g . ' ' . ($g === 1 ? 'guest' : 'guests')));
        echo ' <span class="staff-chosen">' . h($zh ? '已選' : 'Selected') . '</span></h4>';
        echo '<ul class="staff-people">';
        foreach ($visitors as $v) {
            if ((string) $v['visit_slot'] !== (string) $slot) {
                continue;
            }
            $tel = preg_replace('/\s+/', '', (string) $v['phone_country_code'] . (string) $v['phone']);
            $vg = (int) $v['guests'];
            echo '<li>';
            echo '<p class="staff-name"><span class="staff-who">' . h($v['first_name'] . ' ' . $v['last_name']) . '</span>';
            echo '<span class="staff-count">' . h($zh ? ($vg . ' 人') : ($vg . ' ' . ($vg === 1 ? 'guest' : 'guests'))) . '</span></p>';
            $party = extra_guest_names($v['extra_guests'] ?? '');
            if ($party) {
                echo '<p class="staff-party">' . h($zh ? '同行：' : 'With: ') . h(implode(' · ', $party)) . '</p>';
            }
            echo '<p><a href="tel:' . h($tel) . '">' . h($v['phone_country_code'] . ' ' . $v['phone']) . '</a></p>';
            echo '<p><a href="mailto:' . h($v['email']) . '">' . h($v['email']) . '</a></p>';
            echo '<p class="staff-ref"><code>' . h($v['reference']) . '</code> · ' . h($v['confirmation_email_sent_at']
                ? ($zh ? '電郵已寄' : 'Email sent')
                : ($zh ? '電郵未寄' : 'Email not sent')) . '</p>';
            $ref = (string) $v['reference'];
            $stay = '/staff/?month=' . rawurlencode($month) . '&date=' . rawurlencode($selected);
            if ($pendingCancel === $ref) {
                echo '<form class="staff-warn" method="post">';
                echo '<p>' . h($zh
                    ? '確定取消這筆預約？名額會即時釋放，此操作不能從本頁還原。網站不會向訪客發送取消電郵，請另行通知。'
                    : 'Cancel this booking? Places reopen at once. This cannot be undone here. The site does not email the visitor — please tell them yourself.') . '</p>';
                echo '<p><strong>' . h($ref) . ' · ' . h($v['first_name'] . ' ' . $v['last_name']) . '</strong></p>';
                echo '<input type="hidden" name="cancel_reference" value="' . h($ref) . '">';
                echo '<input type="hidden" name="cancel_confirm" value="yes">';
                echo '<input type="hidden" name="keep_date" value="' . h($selected) . '">';
                echo '<input type="hidden" name="keep_month" value="' . h($month) . '">';
                echo '<p class="staff-warn-actions">';
                echo '<a class="btn outline" href="' . h($stay) . '">' . h($zh ? '保留預約' : 'Keep booking') . '</a> ';
                echo '<button class="btn danger" type="submit">' . h($zh ? '確定取消' : 'Yes, cancel booking') . '</button>';
                echo '</p></form>';
            } else {
                echo '<p class="staff-cancel"><a class="btn outline" href="' . h($stay . '&cancel=' . rawurlencode($ref)) . '">' . h($zh ? '取消預約' : 'Cancel booking') . '</a></p>';
            }
            echo '</li>';
        }
        echo '</ul></article>';
    }
    echo '</div>';
}
echo '</section>';
echo '</div>';

echo '<form class="staff-test" method="post">';
echo '<h2>' . h($zh ? '測試確認電郵' : 'Test confirmation email') . '</h2>';
echo '<p>' . h($zh ? '從' : 'Sends a short test from') . ' <code>' . h((string) ($cfg['mail_from'] ?? 'museum@hksyu.edu')) . '</code>' . h($zh ? ' 發送短訊。' : ' using PHP mail().') . '</p>';
if ($mailMsg) echo '<p class="staff-mail-ok">' . h($mailMsg) . '</p>';
echo '<input type="hidden" name="keep_date" value="' . h($selected) . '">';
echo '<input type="hidden" name="keep_month" value="' . h($month) . '">';
echo '<div class="staff-test-row">';
echo '<label>' . h($zh ? '發送至' : 'Send test to') . ' <input type="email" name="test_email" required></label>';
echo '<button class="btn outline" type="submit">' . h($zh ? '發送測試電郵' : 'Send test email') . '</button>';
echo '</div></form>';

echo '<script>
(function(){
  function clearSel(){
    document.querySelectorAll(".staff-jump, .staff-session").forEach(function(el){
      el.classList.remove("sel");
    });
  }
  document.querySelectorAll(".staff-jump").forEach(function(btn){
    btn.addEventListener("click", function(){
      var id = btn.getAttribute("data-target");
      var t = document.getElementById(id);
      if (!t) return;
      clearSel();
      btn.classList.add("sel");
      t.classList.add("sel");
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
</script>';

echo '</div></main></body></html>';
