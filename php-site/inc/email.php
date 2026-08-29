<?php
declare(strict_types=1);

function pretty_date(string $iso, string $locale): string {
    $d = new DateTimeImmutable($iso);
    if ($locale === 'zh-Hant') {
        $w = ['日','一','二','三','四','五','六'][(int) $d->format('w')];
        return $d->format('Y年n月j日') . '（星期' . $w . '）';
    }
    return $d->format('l, j F Y');
}

function build_confirmation_email(array $b): array {
    $loc = $b['locale'] === 'zh-Hant' ? 'zh-Hant' : 'en';
    $name = trim($b['first_name'] . ' ' . $b['last_name']);
    $date = pretty_date($b['visit_date'], $loc);
    $slot = $b['visit_slot'] . '–' . slot_end($b['visit_slot']);
    $ref = $b['reference'];
    $from = cfg()['mail_from'] ?? 'museum@hksyu.edu';
    $zh = $loc === 'zh-Hant';
    $details = ticket_detail_rows($b, $zh);
    $detailText = [];
    foreach ($details as $row) {
        $detailText[] = $zh ? ($row[0] . '：' . $row[1]) : ($row[0] . ': ' . $row[1]);
    }

    if ($loc === 'zh-Hant') {
        $subject = "您的參觀預約已確認 — {$ref}";
        $text = implode("\n", array_merge(
            [
                "{$name} 您好，",
                '',
                '感謝您預約參觀香港樹仁大學校史館，您的預約已確認。',
                '',
                "預約編號：{$ref}",
            ],
            $detailText,
            [
                '請於入口出示此預約編號（列印本或手機畫面均可）。',
                '',
                '請於預約時段開始時到達。本館逢星期一休館。',
                "如需更改或取消，請電郵至 {$from} 並註明預約編號。",
                '',
                '期待您的蒞臨。',
                '樹仁大學校史館',
            ]
        ));
        $intro = '感謝您預約參觀香港樹仁大學校史館，您的預約已確認。';
        $ticket = '入場券';
        $hint = '請於入口出示此預約編號（列印本或手機畫面均可）。';
        $greet = h($name) . ' 您好，';
        $sign = '期待您的蒞臨。<br><strong>樹仁大學校史館</strong>';
    } else {
        $subject = "Your museum visit is confirmed — {$ref}";
        $text = implode("\n", array_merge(
            [
                "Dear {$name},",
                '',
                'Thank you for booking a visit to the Shue Yan University History Museum. Your reservation is confirmed.',
                '',
                "Booking reference: {$ref}",
            ],
            $detailText,
            [
                'Show this reference at the entrance, printed or on your phone.',
                '',
                'Arrive at the start of your booked session. The museum is closed on Mondays.',
                "To change or cancel, write to {$from} quoting your booking reference.",
                '',
                'We look forward to welcoming you.',
                'Shue Yan University History Museum',
            ]
        ));
        $intro = 'Thank you for booking a visit to the Shue Yan University History Museum. Your reservation is confirmed.';
        $ticket = 'Admission Ticket';
        $hint = 'Show this reference at the entrance, printed or on your phone.';
        $greet = 'Dear ' . h($name) . ',';
        $sign = 'We look forward to welcoming you.<br><strong>Shue Yan University History Museum</strong>';
    }

    $html = '<!doctype html><html><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="color-scheme" content="light">'
        . '<meta name="supported-color-schemes" content="light">'
        . '</head><body style="margin:0;background:#e5e1d6;font-family:Georgia,serif;color-scheme:light;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:14px;overflow:hidden;">'
        . '<tr><td style="background:#0a5449;padding:22px 28px;color:#fff;">'
        . '<div style="font-size:20px;letter-spacing:1px;">樹仁大學校史館</div>'
        . '<div style="color:#d9d2c0;font-size:11px;letter-spacing:2px;padding-top:4px;">SHUE YAN UNIVERSITY HISTORY MUSEUM</div></td></tr>'
        . '<tr><td style="padding:24px 20px;color:#2a2118;font-size:15px;line-height:1.7;">'
        . "<p>{$greet}</p><p>" . h($intro) . '</p>'
        . '<div style="border:1px solid #b7ae9a;border-radius:12px;background:#f6f1e4;padding:16px 18px;">'
        . '<div style="font-size:11px;letter-spacing:2px;color:#5b442c;">' . h($ticket) . '</div>'
        . '<div style="font-size:24px;letter-spacing:1px;font-weight:bold;color:#0a5449;padding:8px 0;word-break:break-all;">' . h($ref) . '</div>'
        . '<div style="font-size:12px;color:#4a3d2f;">' . h($hint) . '</div>'
        . ticket_detail_html($details) . '</div>'
        . "<p style=\"margin-top:22px;\">{$sign}</p>"
        . '</td></tr></table></td></tr></table></body></html>';

    return ['subject' => $subject, 'html' => $html, 'text' => $text];
}

function extra_guest_names($raw): array
{
    if (is_array($raw)) {
        $list = $raw;
    } else {
        $list = json_decode((string) $raw, true);
    }
    if (!is_array($list)) {
        return [];
    }
    $out = [];
    foreach ($list as $row) {
        if (!is_array($row)) {
            continue;
        }
        $n = trim((string) ($row['firstName'] ?? '') . ' ' . (string) ($row['lastName'] ?? ''));
        if ($n !== '') {
            $out[] = $n;
        }
    }
    return $out;
}

function extra_guest_line(array $b, bool $zh): string
{
    $names = extra_guest_names($b['extra_guests'] ?? []);
    if (!$names) {
        return '';
    }
    return ($zh ? '同行：' : 'Also visiting: ') . implode(' · ', $names);
}

function guest_ordinal(int $n, bool $zh): string
{
    if ($zh) {
        return '第' . $n . '位訪客';
    }
    $mod100 = $n % 100;
    $mod10 = $n % 10;
    if ($mod100 >= 11 && $mod100 <= 13) {
        $suf = 'th';
    } elseif ($mod10 === 1) {
        $suf = 'st';
    } elseif ($mod10 === 2) {
        $suf = 'nd';
    } elseif ($mod10 === 3) {
        $suf = 'rd';
    } else {
        $suf = 'th';
    }
    return $n . $suf . ' guest';
}

function ticket_detail_rows(array $b, bool $zh): array
{
    $name = trim((string) ($b['first_name'] ?? '') . ' ' . (string) ($b['last_name'] ?? ''));
    $date = pretty_date((string) $b['visit_date'], $zh ? 'zh-Hant' : 'en');
    $slot = $b['visit_slot'] . '–' . slot_end((string) $b['visit_slot']);
    $rows = [
        [$zh ? '主訪客' : 'Name', $name],
        [$zh ? '日期' : 'Date', $date],
        [$zh ? '時段' : 'Time', $slot],
        [$zh ? '參觀人數' : 'Guests', (string) (int) $b['guests']],
    ];
    $n = 2;
    foreach (extra_guest_names($b['extra_guests'] ?? []) as $guestName) {
        $rows[] = [guest_ordinal($n, $zh), $guestName];
        $n++;
    }
    return $rows;
}

function ticket_detail_html(array $rows): string
{
    $html = '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-collapse:collapse;">';
    foreach ($rows as $i => $row) {
        $pad = $i === 0 ? '10px 0 8px' : '8px 0';
        $html .= '<tr><td style="padding:' . $pad . ';border-top:1px solid #d9d0c0;">'
            . '<div style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#5b442c;padding-bottom:3px;">'
            . h($row[0]) . '</div>'
            . '<div style="font-size:16px;line-height:1.45;color:#2a2118;">'
            . h($row[1]) . '</div>'
            . '</td></tr>';
    }
    return $html . '</table>';
}

function send_confirmation(array $booking): bool {
    $c = cfg();
    $fromAddr = $c['mail_from'] ?? 'museum@hksyu.edu';
    $fromName = $c['mail_from_name'] ?? 'SYU History Museum';
    $mail = build_confirmation_email($booking);
    $fromHeader = sprintf('%s <%s>', '=?UTF-8?B?' . base64_encode($fromName) . '?=', $fromAddr);
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $fromHeader,
        'Reply-To: ' . $fromAddr,
        'X-Mailer: SYU-Museum',
    ];
    $subject = '=?UTF-8?B?' . base64_encode($mail['subject']) . '?=';
    $envelope = '-f' . $fromAddr;
    return @mail($booking['email'], $subject, $mail['html'], implode("\r\n", $headers), $envelope);
}

function send_test_mail(string $to): bool {
    $c = cfg();
    $fromAddr = $c['mail_from'] ?? 'museum@hksyu.edu';
    $fromName = $c['mail_from_name'] ?? 'SYU History Museum';
    $fromHeader = sprintf('%s <%s>', '=?UTF-8?B?' . base64_encode($fromName) . '?=', $fromAddr);
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . $fromHeader,
        'Reply-To: ' . $fromAddr,
        'X-Mailer: SYU-Museum',
    ];
    $subject = '=?UTF-8?B?' . base64_encode('SYU History Museum — test email') . '?=';
    $body = "This is a test from the museum booking system.\nIf you received this, automatic confirmation mail is working.\n";
    return @mail($to, $subject, $body, implode("\r\n", $headers), '-f' . $fromAddr);
}

