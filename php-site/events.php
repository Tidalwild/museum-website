<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
$L = t(locale());
render_header($L['events'] . ' — SYU History Museum');
?>
<main id="main" class="page shell">
  <h1><?= h($L['events']) ?></h1>
  <p class="lede"><?= h($L['soonBody']) ?></p>
  <p class="center"><?= pill('/book.php', $L['book']) ?></p>
</main>
<?php render_footer();