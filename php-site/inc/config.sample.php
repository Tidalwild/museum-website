<?php
/**
 * Copy this file to config.php on the server (or use /setup.php).
 * Do not commit real passwords. Do not put this file in GitHub.
 */
return [
    'db_host' => 'localhost',          // if that fails, try www13.hksyu.edu
    'db_name' => 'museumdb',
    'db_user' => 'museum',
    'db_pass' => 'CHANGE_ME',
    'mail_from' => 'museum@hksyu.edu',
    'mail_from_name' => 'SYU History Museum',
    'staff_password_hash' => '',       // password_hash('your-staff-password', PASSWORD_DEFAULT)
    'session_capacity' => 30,
    'session_minutes' => 90,
    'min_guests' => 1,
    'max_guests' => 30,
    'min_days_ahead' => 0,
    'max_days_ahead' => 180,
];
