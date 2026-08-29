<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/email.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['status' => 'error', 'errorKey' => 'unexpected'], 405);
}

$in = json_body();
$first = trim((string) ($in['firstName'] ?? ''));
$last = trim((string) ($in['lastName'] ?? ''));
$code = (string) ($in['phoneCountryCode'] ?? '+852');
$phone = preg_replace('/[\s-]/', '', (string) ($in['phone'] ?? ''));
$email = strtolower(trim((string) ($in['email'] ?? '')));
$date = (string) ($in['visitDate'] ?? '');
$slot = (string) ($in['visitSlot'] ?? '');
$guests = (int) ($in['guests'] ?? 0);
$referral = (string) ($in['referralSource'] ?? '');
$accepted = !empty($in['acceptedTerms']);
$loc = in_array($in['locale'] ?? '', ['en', 'zh-Hant'], true) ? $in['locale'] : 'en';
$cfg = cfg();
$minG = (int) ($cfg['min_guests'] ?? 1);
$maxG = (int) ($cfg['max_guests'] ?? 20);
$cap = (int) ($cfg['session_capacity'] ?? 20);

$errors = [];
if ($first === '' || mb_strlen($first) > 60) $errors['firstName'] = 'firstNameRequired';
if ($last === '' || mb_strlen($last) > 60) $errors['lastName'] = 'lastNameRequired';
if (!in_array($code, PHONE_CODES, true) || !phone_ok($code, $phone)) $errors['phone'] = 'phoneInvalid';
if ($email === '') $errors['email'] = 'emailRequired';
elseif (!email_ok($email)) $errors['email'] = 'emailInvalid';
$offered = slots_for_date($date);
if (!$offered) $errors['visitDate'] = 'dateClosed';
if (!in_array($slot, $offered, true)) $errors['visitSlot'] = 'slotRequired';
if ($guests < $minG || $guests > $maxG) $errors['guests'] = 'guestsRange';
if (!isset(REFERRALS[$referral])) $errors['referralSource'] = 'referralRequired';
if (!$accepted) $errors['acceptedTerms'] = 'termsRequired';

$extraNeeded = max(0, $guests - 1);
$extraClean = [];
$extraIn = $in['extraGuests'] ?? [];
if (!is_array($extraIn)) {
    $extraIn = [];
}
if ($extraNeeded > 0) {
    for ($i = 0; $i < $extraNeeded; $i++) {
        $row = is_array($extraIn[$i] ?? null) ? $extraIn[$i] : [];
        $ef = trim((string) ($row['firstName'] ?? ''));
        $el = trim((string) ($row['lastName'] ?? ''));
        if ($ef === '' || mb_strlen($ef) > 60 || $el === '' || mb_strlen($el) > 60) {
            $errors['extraGuests'] = 'extraGuestsRequired';
            break;
        }
        $extraClean[] = ['firstName' => $ef, 'lastName' => $el];
    }
}
if ($errors) json_out(['status' => 'invalid', 'errors' => $errors]);

$db = db();
$id = new_id();
$ref = new_reference();

try {
    $db->begin_transaction();
    $sum = $db->prepare(
        'SELECT COALESCE(SUM(guests), 0) AS n FROM museum_bookings
         WHERE visit_date = ? AND visit_slot = ? AND status = "confirmed" FOR UPDATE'
    );
    $sum->bind_param('ss', $date, $slot);
    $sum->execute();
    $n = (int) $sum->get_result()->fetch_assoc()['n'];
    $sum->close();
    if ($n + $guests > $cap) {
        $db->rollback();
        json_out([
            'status' => 'invalid',
            'errors' => ['guests' => 'capacityFull'],
            'messageValues' => ['remaining' => max($cap - $n, 0)],
        ]);
    }
    $extraJson = json_encode($extraClean, JSON_UNESCAPED_UNICODE);
    $ins = $db->prepare(
        'INSERT INTO museum_bookings
         (id, reference, first_name, last_name, phone_country_code, phone, email,
          visit_date, visit_slot, guests, extra_guests, referral_source, accepted_terms_at, locale, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,"confirmed")'
    );
    $ins->bind_param('sssssssssisss', $id, $ref, $first, $last, $code, $phone, $email, $date, $slot, $guests, $extraJson, $referral, $loc);
    $ins->execute();
    $ins->close();
    $db->commit();
} catch (Throwable $e) {
    try { $db->rollback(); } catch (Throwable $ignore) {}
    error_log('[booking] ' . $e->getMessage());
    json_out(['status' => 'error', 'errorKey' => 'unexpected'], 500);
}

$booking = [
    'reference' => $ref,
    'first_name' => $first,
    'last_name' => $last,
    'email' => $email,
    'visit_date' => $date,
    'visit_slot' => $slot,
    'guests' => $guests,
    'extra_guests' => $extraClean,
    'locale' => $loc,
];
$sent = send_confirmation($booking);
if ($sent) {
    $u = $db->prepare('UPDATE museum_bookings SET confirmation_email_sent_at = NOW() WHERE id = ?');
    $u->bind_param('s', $id);
    $u->execute();
    $u->close();
}

json_out([
    'status' => 'success',
    'reference' => $ref,
    'email' => $email,
    'visitDate' => $date,
    'visitSlot' => $slot,
    'guests' => $guests,
    'emailSent' => $sent,
]);
