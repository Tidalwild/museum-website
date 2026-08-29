<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

$date = (string) ($_GET['date'] ?? '');
$offered = slots_for_date($date);
if (!$offered) json_out([]);

$cap = (int) (cfg()['session_capacity'] ?? 20);
$db = db();
$stmt = $db->prepare(
    'SELECT visit_slot, COALESCE(SUM(guests), 0) AS booked
     FROM museum_bookings
     WHERE visit_date = ? AND status = "confirmed"
     GROUP BY visit_slot'
);
$stmt->bind_param('s', $date);
$stmt->execute();
$res = $stmt->get_result();
$booked = [];
while ($row = $res->fetch_assoc()) {
    $booked[$row['visit_slot']] = (int) $row['booked'];
}
$stmt->close();

$out = [];
foreach ($offered as $slot) {
    $n = $booked[$slot] ?? 0;
    $out[] = [
        'slot' => $slot,
        'booked' => $n,
        'remaining' => max($cap - $n, 0),
        'capacity' => $cap,
        'end' => slot_end($slot),
    ];
}
json_out($out);
