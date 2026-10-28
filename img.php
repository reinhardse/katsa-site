<?php
// Лёгкие копии картинок для телефонов: img.php?f=assets/x/y.webp&w=900
$f = $_GET['f'] ?? '';
$w = (int)($_GET['w'] ?? 900);
if (!preg_match('~^assets/[A-Za-z0-9_\-/]+\.(webp|jpe?g|png)$~', $f) || strpos($f, '..') !== false) { http_response_code(400); exit; }
$w = max(300, min(1600, $w));
$src = __DIR__ . '/' . $f;
if (!is_file($src)) { http_response_code(404); exit; }
$ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
$dst = __DIR__ . '/assets/_m/' . $w . '/' . substr($f, 7);
function orig($f) { header('Location: /' . $f, true, 302); exit; }
if (!is_file($dst)) {
    $info = @getimagesize($src);
    if (!$info || $info[0] <= $w) orig($f);
    $fn = ['webp' => 'imagecreatefromwebp', 'jpg' => 'imagecreatefromjpeg', 'jpeg' => 'imagecreatefromjpeg', 'png' => 'imagecreatefrompng'][$ext];
    if (!function_exists($fn)) orig($f);
    @ini_set('memory_limit', '512M');
    $im = @$fn($src);
    if (!$im) orig($f);
    $new = imagescale($im, $w, -1, IMG_BICUBIC);
    imagedestroy($im);
    if (!$new) orig($f);
    imagealphablending($new, false); imagesavealpha($new, true);
    @mkdir(dirname($dst), 0755, true);
    $tmp = $dst . '.' . getmypid() . '.tmp';
    $ok = false;
    if ($ext === 'webp' && function_exists('imagewebp')) $ok = imagewebp($new, $tmp, 74);
    elseif ($ext === 'png') $ok = imagepng($new, $tmp, 8);
    elseif ($ext !== 'webp') $ok = imagejpeg($new, $tmp, 78);
    imagedestroy($new);
    if (!$ok || !@rename($tmp, $dst)) { @unlink($tmp); orig($f); }
}
$types = ['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png'];
header('Content-Type: ' . $types[$ext]);
header('Cache-Control: public, max-age=31536000, immutable');
header('Content-Length: ' . filesize($dst));
readfile($dst);
