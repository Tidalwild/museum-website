<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
$L = t(locale());
$loc = locale();
render_header($L['bookTitle'] . ' — SYU History Museum', '/book.php');
$cfg = cfg();
$ready = (bool) $cfg;
?>
<aside class="notice"><div class="shell"><?= h($L['notice']) ?></div></aside>
<main id="main" class="book-wrap">
  <div class="shell">
    <p><a href="/visit.php">← <?= h($L['visit']) ?></a></p>
    <h1><?= h($L['bookTitle']) ?></h1>
    <?php if (!$ready): ?>
      <p class="alert">Booking is not connected yet. Open <a href="/setup.php">/setup.php</a> to attach MySQL.</p>
    <?php endif; ?>
    <div id="booking-app" data-locale="<?= h($loc) ?>" data-ready="<?= $ready ? '1' : '0' ?>"></div>
  </div>
</main>
<script src="/assets/book.js?v=18" defer></script>
<?php render_footer();