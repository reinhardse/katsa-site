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
    'telegram_relay'        => '',  // адрес Cloudflare Worker (ретранслятор в Telegram), если сервер не достаёт до Telegram напрямую
    'telegram_relay_secret' => '',  // общий секрет между сервером и Worker
    'max_token'     => '',     // токен бота MAX
    'max_user'      => '',     // id получателя(ей) в MAX через запятую
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

function relay_call(array $cfg, array $payload): array {
    if (!function_exists('curl_init')) { return [false, 'нет curl', null]; }
    $ch = curl_init($cfg['telegram_relay']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Relay-Secret: ' . $cfg['telegram_relay_secret']],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 8,
    ]);
    $body = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
    if ($body === false) { return [false, 'ретранслятор недоступен: ' . $err, null]; }
    $j = json_decode((string)$body, true);
    if ($code === 200 && ($j['ok'] ?? false)) { return [true, 'ok', $j]; }
    return [false, 'ретранслятор ответил ' . $code . ': ' . ($j['error'] ?? mb_substr((string)$body, 0, 120)), $j];
}

function send_telegram(array $cfg, string $textHtml): array {
    // Через ретранслятор: токен бота хранится в Worker, на хостинге его нет
    if ($cfg['telegram_relay'] !== '') {
        [$ok, $msg] = relay_call($cfg, ['action' => 'send', 'text' => $textHtml]);
        return [$ok, $msg];
    }
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

function max_call(array $cfg, string $method, string $path, ?array $json = null): array {
    $ch = curl_init('https://platform-api.max.ru' . $path);
    $opt = [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => ['Authorization: ' . $cfg['max_token'], 'Content-Type: application/json']];
    if ($json !== null) { $opt[CURLOPT_POSTFIELDS] = json_encode($json, JSON_UNESCAPED_UNICODE); }
    curl_setopt_array($ch, $opt);
    $body = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
    if ($body === false) { return [false, 'сеть: ' . $err, null]; }
    $j = json_decode((string)$body, true);
    return [$code === 200, 'MAX ответил ' . $code . ': ' . mb_substr((string)$body, 0, 200), $j];
}

function send_max(array $cfg, string $text): array {
    if ($cfg['max_token'] === '' || $cfg['max_user'] === '') { return [null, 'не настроен']; }
    $errors = [];
    foreach (array_filter(array_map('trim', explode(',', $cfg['max_user']))) as $u) {
        [$ok, $msg] = max_call($cfg, 'POST', '/messages?user_id=' . urlencode($u), ['text' => $text]);
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
    if (($lead['url'] ?? '') !== '') { $lines[] = 'Ссылка: ' . $h($lead['url']); }
    if (($lead['via'] ?? '') !== '') { $lines[] = 'Откуда: ' . $h($lead['via']); }
    $lines[] = 'Время: ' . $h($lead['time']);
    $tg = send_telegram($cfg, implode("\n", $lines));
    $mx = send_max($cfg, strip_tags(str_replace(['<b>', '</b>'], '', implode("\n", $lines))));

    $plain = "Новая заявка с katsa.ru\n\nИмя: " . ($lead['name'] ?: '—') . "\nКонтакт: " . $lead['contact']
        . "\nУслуга: " . ($lead['service'] ?: '—') . "\n\nЗадача:\n" . ($lead['task'] ?: '—')
 . "\n\nСтраница: " . $lead['page'] . "\nСсылка: " . ($lead['url'] ?? '') . "\nОткуда: " . ($lead['via'] ?? '') . "\nВремя: " . $lead['time'] . "\n";
    $ml = send_mail($cfg, 'Заявка с сайта KATSA' . ($lead['name'] ? ' — ' . $lead['name'] : ''), $plain);
    return ['telegram' => $tg, 'max' => $mx, 'mail' => $ml];
}


// Журнал отклонённых заявок (не спам): по нему проверка поднимает тревогу при необычном числе отказов
function log_reject(string $dir, string $reason, array $lead = []): void {
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    $row = ['time' => date('Y-m-d H:i:s'), 'reason' => $reason, 'ip' => $_SERVER['REMOTE_ADDR'] ?? '', 'page' => $lead['page'] ?? ''];
    @file_put_contents($dir . '/rejects.log', json_encode($row, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}

function secret_ok(array $cfg, string $key): bool {
    return $cfg['secret'] !== '' && hash_equals($cfg['secret'], $key);
}

// ───────── Служебные запросы (GET с секретом) ─────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $key = (string)($_GET['selftest'] ?? $_GET['setup'] ?? $_GET['health'] ?? $_GET['heartbeat'] ?? '');
    if ($key === '' || !secret_ok($cfg, $key)) { out(['ok' => false, 'error' => 'not found'], 404); }

    // Ежедневная отбивка в MAX: формы работают, сколько заявок пришло за сутки, сколько не дошло в MAX.
    // Запускается по расписанию (cron на хостинге): curl -s "https://katsa.ru/send.php?heartbeat=СЕКРЕТ"
    if (isset($_GET['heartbeat'])) {
        $since = time() - 86400; $n24 = 0; $notMax = 0;
        foreach (glob($LEADS . '/*.jsonl') ?: [] as $f) {
            foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $r = json_decode($line, true);
                if (!$r || strtotime((string)($r['time'] ?? '')) <= $since) { continue; }
                $n24++;
                if (!($r['max_ok'] ?? ($r['delivered'] ?? false))) { $notMax++; }
            }
        }
        $problems = [];
        [$mok, $mmsg] = $cfg['max_token'] !== '' ? max_call($cfg, 'GET', '/me') : [false, 'токен бота MAX не задан'];
        if (!$mok) { $problems[] = 'бот MAX не отвечает'; }
        if (!(is_dir($LEADS) ? is_writable($LEADS) : is_writable($BASE))) { $problems[] = 'сервер не может сохранять заявки'; }
        if ($notMax > 0) { $problems[] = 'не дошло в MAX: ' . $notMax . ' (они сохранены на сервере)'; }
        $period = 'Заявок за последние 24 часа (со вчерашних ' . date('H:i', $since) . '): ' . $n24;
        $text = $problems
            ? "🤖 Проверка связи\n\n⚠️ KATSA: проблема с формами\n\n• " . implode("\n• ", $problems) . "\n\n" . $period
            : "🤖 Проверка связи\n\n✅ KATSA: формы работают\n\n" . $period . "\nНе дошло в MAX: 0";
        $mx = send_max($cfg, $text);
        out(['ok' => $mx[0] === true, 'status' => $problems ? 'PROBLEM' : 'ALL_OK', 'problems' => $problems, 'max' => $mx]);
    }

    if (isset($_GET['health'])) {
        $files = glob($LEADS . '/*.jsonl') ?: [];
        $last = null; $total = 0; $undelivered = 0;
        foreach ($files as $f) {
            foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $r = json_decode($line, true); if (!$r) { continue; }
                $total++; $last = $r['time'] ?? $last;
                if (!($r['delivered'] ?? false) && strtotime((string)($r['time'] ?? '')) > time() - 3 * 86400) { $undelivered++; }
            }
        }
        // Глубокая проверка: токен MAX рабочий? Есть ли недоставленные заявки?
        $problems = [];
        if ($cfg['max_token'] !== '') {
            [$mok, $mmsg] = max_call($cfg, 'GET', '/me');
            if (!$mok) { $problems[] = 'MAX: ' . $mmsg; }
        }
        if ($cfg['max_token'] === '' && $cfg['telegram_token'] === '' && $cfg['mail_to'] === '') { $problems[] = 'Не настроен ни один канал доставки'; }
        $rejects24 = 0;
        if (is_file($LEADS . '/rejects.log')) {
            foreach (file($LEADS . '/rejects.log', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $r = json_decode($line, true);
                if ($r && strtotime((string)($r['time'] ?? '')) > time() - 86400) { $rejects24++; }
            }
        }
        if ($rejects24 > 5) { $problems[] = 'Много отказанных заявок за сутки: ' . $rejects24 . ' (см. leads/rejects.log)'; }
        if ($undelivered > 0) { $problems[] = 'Недоставленных заявок: ' . $undelivered; }
        if (!(is_dir($LEADS) ? is_writable($LEADS) : is_writable($BASE))) { $problems[] = 'Папка заявок недоступна для записи'; }
        out([
            'status' => $problems ? 'PROBLEM' : 'ALL_OK', 'problems' => $problems,
            'ok' => !$problems, 'time' => date('c'),
            'telegram_configured' => $cfg['telegram_relay'] !== '' || ($cfg['telegram_token'] !== '' && $cfg['telegram_chat'] !== ''),
            'max_configured' => $cfg['max_token'] !== '' && $cfg['max_user'] !== '',
            'mail_configured' => $cfg['mail_to'] !== '',
            'leads_total' => $total, 'rejects_24h' => $rejects24, 'leads_undelivered' => $undelivered, 'last_lead' => $last,
            'leads_dir_writable' => is_dir($LEADS) ? is_writable($LEADS) : is_writable($BASE),
        ], $problems ? 503 : 200);
    }

    if (isset($_GET['setup'])) {
        if ($cfg['max_token'] !== '' && ($_GET['setup'] ?? '') !== '' && isset($_GET['max'])) {
            [$ok, $msg, $j] = max_call($cfg, 'GET', '/updates?limit=100&timeout=0&types=bot_started,message_created');
            $ids = [];
            $walk = function ($a) use (&$walk, &$ids) { foreach ((array)$a as $k => $v) { if (is_array($v)) { $walk($v); } elseif ($k === 'user_id' && $v) { $ids[(string)$v] = 1; } } };
            $walk($j['updates'] ?? []);
            out(['ok' => $ok, 'info' => $msg, 'user_ids' => array_keys($ids), 'hint' => 'Напиши боту в MAX, открой страницу снова, id впиши в max_user']);
        }
        if ($cfg['telegram_relay'] !== '') {
            [$ok, $msg, $j] = relay_call($cfg, ['action' => 'chats']);
            out(['ok' => $ok, 'info' => $msg, 'chats' => $j['chats'] ?? [], 'hint' => 'Напиши боту любое сообщение, открой страницу снова. id впиши в TG_CHATS у Worker.']);
        }
        if ($cfg['telegram_token'] === '') { out(['ok' => false, 'error' => 'Сначала впиши telegram_token в config.php']); }
        $ch = curl_init('https://api.telegram.org/bot' . $cfg['telegram_token'] . '/getUpdates');
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 8]);
        $res = curl_exec($ch); $curlErr = curl_error($ch); $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        if ($res === false) { out(['ok' => false, 'error' => 'Сервер не достучался до Telegram: ' . $curlErr]); }
        $j = $res ? json_decode($res, true) : null;
        $chats = [];
        foreach (($j['result'] ?? []) as $u) {
            $c = $u['message']['chat'] ?? $u['channel_post']['chat'] ?? null;
            if ($c) { $chats[(string)$c['id']] = trim(($c['title'] ?? '') . ' ' . ($c['first_name'] ?? '') . ' ' . ($c['username'] ?? '')); }
        }
        out(['ok' => (bool)$j, 'hint' => 'Сначала напиши боту любое сообщение, затем открой эту страницу снова. В telegram_chat впиши нужный id.', 'chats' => $chats, 'raw_ok' => $j['ok'] ?? null, 'http' => $httpCode, 'desc' => $j['description'] ?? null]);
    }

    // selftest
    $lead = ['name' => 'Тест', 'contact' => 'selftest', 'service' => '', 'task' => 'Проверка приёмника заявок. Если ты это видишь, всё работает.',
             'page' => 'selftest', 'time' => date('Y-m-d H:i:s')];
    $r = deliver($cfg, $lead);
    out(['ok' => true, 'telegram' => $r['telegram'], 'max' => $r['max'], 'mail' => $r['mail']]);
}

// ───────── Приём заявки (POST из форм сайта) ─────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { out(['ok' => false, 'error' => 'method'], 405); }

// 1. Проверка источника
$origin = parse_url((string)($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST);
if ($origin && !in_array($origin, $cfg['allowed_hosts'], true)) { log_reject($LEADS, 'origin'); out(['ok' => false, 'error' => 'origin'], 403); }

// 2. Данные
$lead = [
    'name'    => clean($_POST['name'] ?? '', 100),
    'contact' => clean($_POST['contact'] ?? '', 150),
    'task'    => clean($_POST['task'] ?? '', 4000),
    'service' => clean($_POST['service'] ?? '', 300),
    'page'    => clean($_POST['page'] ?? '', 200),
    'url'     => clean($_POST['url'] ?? '', 300),
    'via'     => clean($_POST['via'] ?? '', 200),
    'form'    => clean($_POST['form'] ?? '', 60),
    'time'    => date('Y-m-d H:i:s'),
    'consent' => 'yes',
    'ip'      => $_SERVER['REMOTE_ADDR'] ?? '',
];

// 3. Защита от спама: скрытое поле и слишком быстрая отправка (боты)
if (clean($_POST['website'] ?? '', 50) !== '') { out(['ok' => true]); }          // бот: делаем вид, что ок
$elapsed = (int)($_POST['elapsed'] ?? 0);
if ($elapsed > 0 && $elapsed < 2000) { out(['ok' => true]); }
if (($_POST['consent'] ?? '') !== '1') { log_reject($LEADS, 'no_consent', $lead); out(['ok' => false, 'error' => 'Нужно согласие на обработку персональных данных'], 422); }
if (mb_strlen($lead['contact']) < 3) { log_reject($LEADS, 'short_contact', $lead); out(['ok' => false, 'error' => 'Укажите любой способ связи'], 422); }

// 4. Лимиты: не чаще 5 заявок за 10 минут с одного адреса и 60 в час всего
if (!is_dir($LEADS)) { @mkdir($LEADS, 0755, true); }
$rateFile = $LEADS . '/.rate.json';
$rate = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
$now = time();
foreach ($rate as $ip => $times) { $rate[$ip] = array_values(array_filter($times, fn($t) => $t > $now - 3600)); if (!$rate[$ip]) { unset($rate[$ip]); } }
$mine  = array_filter($rate[$lead['ip']] ?? [], fn($t) => $t > $now - 600);
$total = array_sum(array_map('count', $rate));
if (count($mine) >= 5 || $total >= 60) { log_reject($LEADS, 'rate_limit', $lead); out(['ok' => false, 'error' => 'Слишком много заявок, попробуйте позже'], 429); }
$rate[$lead['ip']][] = $now;
@file_put_contents($rateFile, json_encode($rate), LOCK_EX);

// 5. Сохраняем ВСЕГДА (чтобы заявка не потерялась, даже если Telegram или почта недоступны)
$file = $LEADS . '/' . date('Y-m') . '.jsonl';
$lead['delivered'] = false;
$saved = @file_put_contents($file, json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) !== false;

// 6. Если заявка сохранена, сразу отвечаем сайту, а отправку в мессенджеры/почту делаем уже после ответа
if ($saved) {
    ignore_user_abort(true);
    $payload = json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('Connection: close');
    header('Content-Length: ' . strlen($payload));
    echo $payload;
    if (function_exists('fastcgi_finish_request')) { fastcgi_finish_request(); }
    else { while (ob_get_level() > 0) { @ob_end_flush(); } @flush(); }
}

// 7. Отправляем
$r = deliver($cfg, $lead);
$delivered = ($r['telegram'][0] === true) || ($r['max'][0] === true) || ($r['mail'][0] === true);

if ($saved) {
    // отмечаем итог у последней строки файла: доставлена ли заявка и дошла ли она именно в MAX
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    if ($lines) {
        $last = json_decode((string)end($lines), true);
        if ($last) {
            $last['delivered'] = $delivered;
            $last['max_ok'] = ($r['max'][0] === true);
            $lines[count($lines) - 1] = json_encode($last, JSON_UNESCAPED_UNICODE);
            @file_put_contents($file, implode("\n", $lines) . "\n", LOCK_EX);
        }
    }
}

if ($saved) { exit; }
if (!$delivered) { log_reject($LEADS, 'save_and_delivery_failed', $lead); out(['ok' => false, 'error' => 'Не удалось принять заявку'], 500); }
out(['ok' => true, 'delivered' => $delivered]);
