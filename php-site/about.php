<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
$L = t(locale());
render_header($L['aboutTitle'] . ' — SYU History Museum', '/about.php');
?>
<main id="main" class="page shell">
  <h1><?= h($L['aboutTitle']) ?></h1>
  <p class="lede"><?= h($L['welcomeBody']) ?></p>
  <p class="center"><?= pill('/book.php', $L['book']) ?></p>
</main>
<?php render_footer();