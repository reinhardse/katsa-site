<?php header('Content-Type: text/plain');
echo "exec: ", (function_exists('shell_exec') && !in_array('shell_exec', array_map('trim', explode(',', ini_get('disable_functions')))) ? 'yes' : 'no'), "\n";
echo "disabled: ", ini_get('disable_functions'), "\n";
foreach (['ffmpeg','/usr/bin/ffmpeg','/usr/local/bin/ffmpeg'] as $p) { echo $p, ': ', @file_exists($p) ? 'exists' : '-', "\n"; }
if (function_exists('shell_exec')) echo "which: ", @shell_exec('which ffmpeg 2>&1'), "\n";
echo "imagick: ", extension_loaded('imagick') ? 'yes' : 'no', " gd webp: ", function_exists('imagewebp') ? 'yes' : 'no', "\n";
$sizes = []; foreach (glob(__DIR__ . '/assets/*/*.mp4') as $f) $sizes[] = str_replace(__DIR__ . '/assets/', '', $f) . ' ' . round(filesize($f) / 1048576, 2) . 'MB';
echo implode("\n", $sizes), "\n";
