<?php
/*
 * Единый приёмник заявок с сайта KATSA.
 * Все формы сайта (на всех страницах и во всплывающем окне) отправляют данные сюда.
 *
 * Что делает:
 *  1. проверяет данные и защищается от спама (скрытое поле, лимиты, проверка источника);
 *  2. ВСЕГДА сохраняет заявку в файл на сервере (htdocs/leads/*.jsonl), чтобы ничего не потерялось;
 *  3. отправляет заявку в Telegram и/или на почту (что включено в htdocs/config.php);
 *  4. отвечает сайту в формате JSON.
 *
 * Секреты (токен бота, пароли) лежат в файле htdocs/config.php ВНЕ папки сайта и в GitHub не попадают.
 * Служебные адреса (нужен секрет из config.php):
 *   /send.php?selftest=СЕКРЕТ  отправить тестовую заявку и показать, что сработало
 *   /send.php?setup=СЕКРЕТ     показать id чата для Telegram (после того как написал боту)
 *   /send.php?health=СЕКРЕТ    состояние приёмника (JSON) для проверки
 */

declare(strict_types=1);
mb_internal_encoding('UTF-8');
date_default_timezone_set('Europe/Moscow');

$BASE   = dirname(__DIR__);                 // htdocs (выше папки сайта, из браузера недоступна)
$CONFIG = $BASE . '/config.php';
$LEADS  = $BASE . '/leads';
$cfg = is_file($CONFIG) ? (array)(include $CONFIG) : [];
$cfg += [
    'secret'        => '',
    'telegram_token'=> '',
    'telegram_chat' => '',     // один id или несколько через запятую
    'mail_to'       => '',     // куда слать копию на почту (пусто = не слать)
    'mail_from'     => 'no-reply@katsa.ru',
    'allowed_hosts' => ['katsa.ru', 'www.katsa.ru'],
];

function out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function http_post(string $url, array $fields): array {
    if (!function_exists('curl_init')) { return [false, 'нет curl']; }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($fields),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_CONNECTTIMEOUT => 8,
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($body === false) { return [false, 'сеть: ' . $err]; }
    $j = json_decode((string)$body, true);
    if ($code === 200 && ($j['ok'] ?? false)) { return [true, 'ok']; }
    return [false, 'Telegram ответил ' . $code . ': ' . ($j['description'] ?? mb_substr((string)$body, 0, 120))];
}

function send_telegram(array $cfg, string $textHtml): array {
    if ($cfg['telegram_token'] === '' || $cfg['telegram_chat'] === '') { return [null, 'не настроен']; }
    $errors = [];
    foreach (array_filter(array_map('trim', explode(',', $cfg['telegram_chat']))) as $chat) {
        [$ok, $msg] = http_post('https://api.telegram.org/bot' . $cfg['telegram_token'] . '/sendMessage', [
            'chat_id' => $chat, 'text' => $textHtml, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true',
        ]);
        if (!$ok) { $errors[] = $msg; }
    }
    return $errors ? [false, implode('; ', $errors)] : [true, 'ok'];
}

function send_mail(array $cfg, string $subject, string $text): array {
    if ($cfg['mail_to'] === '') { return [null, 'не настроена']; }
    $subject = str_replace(["\r", "\n"], ' ', $subject);
    $headers = 'From: KATSA сайт <' . $cfg['mail_from'] . ">\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0";
    $ok = @mail($cfg['mail_to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $text, $headers);
    return [$ok, $ok ? 'ok' : 'mail() вернул ошибку'];
}

function clean(?string $s, int $max): string {
    $s = trim((string)$s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function deliver(array $cfg, array $lead): array {
    $h = fn(string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $lines = ['<b>🔔 Новая заявка с katsa.ru</b>'];
    if ($lead['name'] !== '')    { $lines[] = 'Имя: ' . $h($lead['name']); }
    $lines[] = 'Контакт: <b>' . $h($lead['contact']) . '</b>';
    if ($lead['service'] !== '') { $lines[] = 'Услуга: ' . $h($lead['service']); }
    if ($lead['task'] !== '')    { $lines[] = "Задача:\n" . $h($lead['task']); }
    $lines[] = '';
    $lines[] = 'Страница: ' . $h($lead['page']);
    $lines[] = 'Время: ' . $h($lead['time']);
    $tg = send_telegram($cfg, implode("\n", $lines));

    $plain = "Новая заявка с katsa.ru\n\nИмя: " . ($lead['name'] ?: '—') . "\nКонтакт: " . $lead['contact']
        . "\nУслуга: " . ($lead['service'] ?: '—') . "\n\nЗадача:\n" . ($lead['task'] ?: '—')
        . "\n\nСтраница: " . $lead['page'] . "\nВремя: " . $lead['time'] . "\n";
    $ml = send_mail($cfg, 'Заявка с сайта KATSA' . ($lead['name'] ? ' — ' . $lead['name'] : ''), $plain);
    return ['telegram' => $tg, 'mail' => $ml];
}

function secret_ok(array $cfg, string $key): bool {
    return $cfg['secret'] !== '' && hash_equals($cfg['secret'], $key);
}

// ───────── Служебные запросы (GET с секретом) ─────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $key = (string)($_GET['selftest'] ?? $_GET['setup'] ?? $_GET['health'] ?? '');
    if ($key === '' || !secret_ok($cfg, $key)) { out(['ok' => false, 'error' => 'not found'], 404); }

    if (isset($_GET['health'])) {
        $files = glob($LEADS . '/*.jsonl') ?: [];
        $last = null; $total = 0; $undelivered = 0;
        foreach ($files as $f) {
            foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $r = json_decode($line, true); if (!$r) { continue; }
                $total++; $last = $r['time'] ?? $last;
                if (!($r['delivered'] ?? false)) { $undelivered++; }
            }
        }
        out([
            'ok' => true, 'time' => date('c'),
            'telegram_configured' => $cfg['telegram_token'] !== '' && $cfg['telegram_chat'] !== '',
            'mail_configured' => $cfg['mail_to'] !== '',
            'leads_total' => $total, 'leads_undelivered' => $undelivered, 'last_lead' => $last,
            'leads_dir_writable' => is_dir($LEADS) ? is_writable($LEADS) : is_writable($BASE),
        ]);
    }

    if (isset($_GET['setup'])) {
        if ($cfg['telegram_token'] === '') { out(['ok' => false, 'error' => 'Сначала впиши telegram_token в config.php']); }
        $res = @file_get_contents('https://api.telegram.org/bot' . $cfg['telegram_token'] . '/getUpdates');
        $j = $res ? json_decode($res, true) : null;
        $chats = [];
        foreach (($j['result'] ?? []) as $u) {
            $c = $u['message']['chat'] ?? $u['channel_post']['chat'] ?? null;
            if ($c) { $chats[(string)$c['id']] = trim(($c['title'] ?? '') . ' ' . ($c['first_name'] ?? '') . ' ' . ($c['username'] ?? '')); }
        }
        out(['ok' => (bool)$j, 'hint' => 'Сначала напиши боту любое сообщение, затем открой эту страницу снова. В telegram_chat впиши нужный id.', 'chats' => $chats, 'raw_ok' => $j['ok'] ?? null]);
    }

    // selftest
    $lead = ['name' => 'Тест', 'contact' => 'selftest', 'service' => '', 'task' => 'Проверка приёмника заявок. Если ты это видишь, всё работает.',
             'page' => 'selftest', 'time' => date('Y-m-d H:i:s')];
    $r = deliver($cfg, $lead);
    out(['ok' => true, 'telegram' => $r['telegram'], 'mail' => $r['mail']]);
}

// ───────── Приём заявки (POST из форм сайта) ─────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { out(['ok' => false, 'error' => 'method'], 405); }

// 1. Проверка источника
$origin = parse_url((string)($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST);
if ($origin && !in_array($origin, $cfg['allowed_hosts'], true)) { out(['ok' => false, 'error' => 'origin'], 403); }

// 2. Данные
$lead = [
    'name'    => clean($_POST['name'] ?? '', 100),
    'contact' => clean($_POST['contact'] ?? '', 150),
    'task'    => clean($_POST['task'] ?? '', 4000),
    'service' => clean($_POST['service'] ?? '', 300),
    'page'    => clean(($_POST['page'] ?? '') . ' ' . ($_POST['url'] ?? ''), 300),
    'form'    => clean($_POST['form'] ?? '', 60),
    'time'    => date('Y-m-d H:i:s'),
    'ip'      => $_SERVER['REMOTE_ADDR'] ?? '',
];

// 3. Защита от спама: скрытое поле и слишком быстрая отправка (боты)
if (clean($_POST['website'] ?? '', 50) !== '') { out(['ok' => true]); }          // бот: делаем вид, что ок
$elapsed = (int)($_POST['elapsed'] ?? 0);
if ($elapsed > 0 && $elapsed < 2000) { out(['ok' => true]); }
if (mb_strlen($lead['contact']) < 3) { out(['ok' => false, 'error' => 'Укажите любой способ связи'], 422); }

// 4. Лимиты: не чаще 5 заявок за 10 минут с одного адреса и 60 в час всего
if (!is_dir($LEADS)) { @mkdir($LEADS, 0755, true); }
$rateFile = $LEADS . '/.rate.json';
$rate = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
$now = time();
foreach ($rate as $ip => $times) { $rate[$ip] = array_values(array_filter($times, fn($t) => $t > $now - 3600)); if (!$rate[$ip]) { unset($rate[$ip]); } }
$mine  = array_filter($rate[$lead['ip']] ?? [], fn($t) => $t > $now - 600);
$total = array_sum(array_map('count', $rate));
if (count($mine) >= 5 || $total >= 60) { out(['ok' => false, 'error' => 'Слишком много заявок, попробуйте позже'], 429); }
$rate[$lead['ip']][] = $now;
@file_put_contents($rateFile, json_encode($rate), LOCK_EX);

// 5. Сохраняем ВСЕГДА (чтобы заявка не потерялась, даже если Telegram или почта недоступны)
$file = $LEADS . '/' . date('Y-m') . '.jsonl';
$lead['delivered'] = false;
$saved = @file_put_contents($file, json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) !== false;

// 6. Отправляем
$r = deliver($cfg, $lead);
$delivered = ($r['telegram'][0] === true) || ($r['mail'][0] === true);

if ($saved && $delivered) {
    // отмечаем доставку у последней строки файла
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    if ($lines) {
        $last = json_decode((string)end($lines), true);
        if ($last) { $last['delivered'] = true; $lines[count($lines) - 1] = json_encode($last, JSON_UNESCAPED_UNICODE); @file_put_contents($file, implode("\n", $lines) . "\n", LOCK_EX); }
    }
}

if (!$saved && !$delivered) { out(['ok' => false, 'error' => 'Не удалось принять заявку'], 500); }
out(['ok' => true, 'delivered' => $delivered]);
