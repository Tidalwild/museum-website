<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
$L = t(locale());
render_header($L['visitTitle'] . ' — SYU History Museum', '/visit.php');
?>
<main id="main" class="page shell">
  <h1><?= h($L['visitTitle']) ?></h1>
  <p class="lede"><?= h($L['visitBody']) ?></p>
  <div class="grid3">
    <section class="card"><h2><?= h($L['hours']) ?></h2><ul><li><?= h($L['h1']) ?></li><li><?= h($L['h2']) ?></li><li><?= h($L['h3']) ?></li></ul></section>
    <section class="card"><h2><?= h($L['sessions']) ?></h2><p><?= h($L['capacity']) ?></p><p><?= h($L['sessionsBody']) ?></p></section>
    <section class="card"><h2><?= h($L['contact']) ?></h2><address><?= h($L['addr1']) ?><br><?= h($L['addr2']) ?></address></section>
  </div>
  <p class="center"><?= pill('/book.php', $L['book']) ?></p>
</main>
<?php render_footer();