# FORGE Favicon Package — Flame variant (_2 naming)

All filenames have `_2` appended before the extension so this set can sit alongside
the original anvil-based favicons without overwriting them.

## Files

| File                          | Purpose                                  |
|-------------------------------|------------------------------------------|
| `favicon_2.ico`               | Multi-resolution ICO (16/32/48 px)       |
| `favicon-16_2.png`            | Browser tab fallback                     |
| `favicon-32_2.png`            | Browser tab fallback                     |
| `favicon-48_2.png`            | Windows site tiles                       |
| `apple-touch-icon_2.png`      | iOS homescreen (180x180)                 |
| `android-chrome-192_2.png`    | Android homescreen                       |
| `android-chrome-512_2.png`    | Android splash / PWA                     |

## Activating this set in index.html

Open `index.html` and find the favicon `<link>` block in the `<head>`. Replace it with this
version (note the `_2` suffix in each href):

```html
<!-- FORGE favicons (flame _2) -->
<link rel="icon" type="image/x-icon" href="assets/img/favicons/favicon_2.ico">
<link rel="icon" type="image/png" sizes="16x16"  href="assets/img/favicons/favicon-16_2.png">
<link rel="icon" type="image/png" sizes="32x32"  href="assets/img/favicons/favicon-32_2.png">
<link rel="icon" type="image/png" sizes="48x48"  href="assets/img/favicons/favicon-48_2.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/img/favicons/apple-touch-icon_2.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/img/favicons/android-chrome-192_2.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/img/favicons/android-chrome-512_2.png">
```

To switch back to the original anvil set later, just remove the `_2` from every href.

After saving: commit, push, hard-refresh (Ctrl+Shift+R) to bust the favicon cache.
