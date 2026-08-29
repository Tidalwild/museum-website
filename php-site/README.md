# PHP site for museum.hksyu.edu

This is the live Apache/PHP/MySQL port of the museum site.
The Next.js app in the repo root is the original prototype.

## Deploy

Upload the contents of this folder to the web root (`/var/www/html2/museum`).
Copy `inc/config.sample.php` to `inc/config.php` on the server and fill in
MySQL + staff password there. Do not commit `inc/config.php`.

## Recent work

- 1.5-hour sessions, 30 visitors, same-day booking
- Extra guest names, staff calendar + cancel
- Mobile layout (iOS Safari / Android Chrome)
- Confirmation email ticket: stacked rows, Chinese 參觀人數 (no `!`)
