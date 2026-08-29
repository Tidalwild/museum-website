<?php
declare(strict_types=1);

function t(string $loc): array {
    $en = [
        'home' => 'Home', 'about' => 'About', 'visit' => 'Visit',
        'book' => 'Book your visit', 'register' => 'Register',
        'announce' => 'Book Your Visit Now',
        'welcome' => 'Welcome to SYU History Museum',
        'welcomeBody' => 'Shue Yan University History Museum presents a permanent exhibition on the lifelong dedication of founders Dr. Henry Hu Hung Lick and Dr. Chung Chi-yung to education, social welfare, and community development. Through their pioneering journey, the exhibition also offers a critical lens on the broader evolution of Hong Kong\'s higher education system — its challenges, transformations, and changing societal roles over time.',
        'learn' => 'Learn More', 'explore' => 'Explore the museum',
        'collection' => 'Collection', 'events' => 'Events', 'materials' => 'Materials',
        'hours' => 'Opening Hours', 'contact' => 'Contact Us',
        'h1' => 'Tuesday to Sunday: 10am – 6pm',
        'h2' => 'Closed on Mondays',
        'h3' => 'Each visit is 1.5 hours',
        'maps' => 'View on Google Maps',
        'copy' => 'Copyright © 2026 Shue Yan University History Museum. All Rights Reserved.',
        'staff' => 'Staff', 'soon' => 'Coming soon',
        'soonBody' => 'This page is still being written. In the meantime you can book a visit or return to the home page.',
        'aboutTitle' => 'About the Museum',
        'visitTitle' => 'Plan Your Visit',
        'visitBody' => 'Everything you need to know before you arrive: opening hours, how to find us, and how to reserve your place.',
        'sessions' => 'Sessions',
        'sessionsBody' => 'Visits are booked in 1.5-hour sessions. Each session admits up to 30 visitors so galleries stay comfortable. Remaining places are shown live when you register.',
        'capacity' => 'Up to 30 visitors in each 1.5-hour session',
        'bookTitle' => 'Exhibition Visit Booking',
        'notice' => 'Please ensure all information is accurate to avoid any inconvenience on the day of your visit.',
        'addr1' => 'Braemar Hill Campus, 10 Wai Tsui Crescent,',
        'addr2' => 'Braemar Hill, North Point, Hong Kong',
    ];
    $zh = [
        'home' => '主頁', 'about' => '關於我們', 'visit' => '參觀資訊',
        'book' => '預約參觀', 'register' => '登記',
        'announce' => '立即預約參觀',
        'welcome' => '歡迎蒞臨樹仁大學校史館',
        'welcomeBody' => '樹仁大學校史館以常設展覽，呈現創辦人胡鴻烈博士與鍾期榮博士終身致力教育、社會福利與社區發展的事蹟。透過兩位創辦人的開拓歷程，展覽亦審視香港高等教育制度的演變——其挑戰、轉型，以及在社會中角色的轉變。',
        'learn' => '了解更多', 'explore' => '探索校史館',
        'collection' => '館藏', 'events' => '活動', 'materials' => '資料',
        'hours' => '開放時間', 'contact' => '聯絡我們',
        'h1' => '星期二至星期日：上午10時至下午6時',
        'h2' => '星期一休館',
        'h3' => '每次參觀 1.5 小時',
        'maps' => '在 Google 地圖上檢視',
        'copy' => '版權所有 © 2026 樹仁大學校史館。',
        'staff' => '職員', 'soon' => '即將推出',
        'soonBody' => '此頁仍在編寫。您可以先預約參觀，或返回主頁。',
        'aboutTitle' => '關於校史館',
        'visitTitle' => '參觀資訊',
        'visitBody' => '到訪前須知：開放時間、交通，以及如何預約名額。',
        'sessions' => '參觀時段',
        'sessionsBody' => '參觀以 1.5 小時時段預約。每個時段最多 30 人，以保持展廳舒適。登記時即時顯示剩餘名額。',
        'capacity' => '每個 1.5 小時時段最多 30 人',
        'bookTitle' => '展覽參觀預約',
        'notice' => '請確保所有資料正確無誤，以免影響您當日的參觀。',
        'addr1' => 'Braemar Hill Campus, 10 Wai Tsui Crescent,',
        'addr2' => 'Braemar Hill, North Point, Hong Kong',
    ];
    return $loc === 'zh-Hant' ? array_merge($en, $zh) : $en;
}

function render_header(string $title, string $path = '/'): void {
    $loc = locale();
    $L = t($loc);
    $lang = $loc === 'zh-Hant' ? 'zh-Hant-HK' : 'en';
    $nav = [
        '/' => $L['home'],
        '/about.php' => $L['about'],
        '/visit.php' => $L['visit'],
    ];
    echo '<!doctype html><html lang="' . h($lang) . '"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
    echo '<title>' . h($title) . '</title>';
    echo '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&family=Source+Sans+3:wght@400;600&family=Source+Serif+4:wght@400;600;700&display=swap">';
    echo '<link rel="stylesheet" href="/assets/museum.css?v=21">';
    echo '</head><body>';
    echo '<a class="skip" href="#main">Skip to main content</a>';
    echo '<header class="site-header"><div class="shell head-inner">';
    echo '<a class="wordmark" href="/"><span class="zh">樹仁大學校史館</span><span class="en">SHUE YAN UNIVERSITY HISTORY MUSEUM</span></a>';
    echo '<div class="head-right"><nav aria-label="Main"><ul>';
    foreach ($nav as $href => $label) {
        $cur = ($path === $href) ? ' aria-current="page" class="current"' : '';
        echo '<li><a href="' . h($href) . '"' . $cur . '>' . h($label) . '</a></li>';
    }
    echo '</ul></nav><span class="rule" aria-hidden="true"></span>';
    echo '<div class="langs" role="group" aria-label="Language">';
    echo '<a href="?lang=zh-Hant"' . ($loc === 'zh-Hant' ? ' aria-current="true" class="current"' : '') . '>中</a>';
    echo '<a href="?lang=en"' . ($loc === 'en' ? ' aria-current="true" class="current"' : '') . '>Eng</a>';
    echo '</div></div></div></header>';
}

function render_footer(): void {
    $L = t(locale());
    echo '<footer class="site-footer"><div class="shell foot-grid">';
    echo '<div class="wordmark sm"><span class="zh">樹仁大學校史館</span><span class="en">SHUE YAN UNIVERSITY HISTORY MUSEUM</span></div>';
    echo '<section><h2>' . h($L['hours']) . '</h2><ul><li>' . h($L['h1']) . '</li><li>' . h($L['h2']) . '</li><li>' . h($L['h3']) . '</li></ul></section>';
    echo '<section><h2>' . h($L['contact']) . '</h2><address>' . h($L['addr1']) . '<br>' . h($L['addr2']) . '</address>';
    echo '<p><a href="https://maps.google.com/?q=Hong+Kong+Shue+Yan+University" target="_blank" rel="noopener">' . h($L['maps']) . '</a></p></section>';
    echo '</div><div class="shell foot-base"><p>' . h($L['copy']) . '</p>';
    echo '<a href="/staff/">' . h($L['staff']) . '</a></div></footer></body></html>';
}

function pill(string $href, string $label): string {
    return '<a class="btn" href="' . h($href) . '">' . h($label) . '</a>';
}
