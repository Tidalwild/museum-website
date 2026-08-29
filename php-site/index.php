<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
$L = t(locale());
render_header('SYU History Museum', '/');
?>
<aside class="banner"><p><?= h($L['announce']) ?></p><?= pill('/book.php', $L['register']) ?></aside>
<main id="main">
  <div class="shell"><div class="hero"><img src="/images/hero-museum.jpg" alt="The museum entrance corridor with teal exhibition walls."></div></div>
  <section class="welcome shell">
    <h1><?= h($L['welcome']) ?></h1>
    <p><?= h($L['welcomeBody']) ?></p>
    <p class="center"><?= pill('/about.php', $L['learn']) ?></p>
  </section>
  <section class="cards">
    <div class="shell">
      <h2 class="skip"><?= h($L['explore']) ?></h2>
      <ul>
        <li><a href="https://archives.hksyu.edu/" target="_blank" rel="noopener"><span class="thumb"><img src="/images/card-collection.jpg" alt=""></span><span class="label"><?= h($L['collection']) ?></span></a></li>
        <li><a href="/events.php"><span class="thumb"><img src="/images/card-events.jpg" alt=""></span><span class="label"><?= h($L['events']) ?></span></a></li>
        <li><a href="/materials.php"><span class="thumb"><img src="/images/card-materials.jpg" alt=""></span><span class="label"><?= h($L['materials']) ?></span></a></li>
      </ul>
    </div>
  </section>
</main>
<?php render_footer();