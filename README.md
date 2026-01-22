# Valentine Website

A cute, funny single-page site to ask your girlfriend to be your Valentine, with a playful Yes/No interaction and a mini photo gallery.

## Personalize

- Open `valentine-site/script.js` and edit:
  - `CONFIG.herName`, `CONFIG.question`, `CONFIG.subtitle`.
  - Add your image paths to `galleryImages`.

## Add your photos

1. Put your images in `valentine-site/assets/images/`.
2. In `valentine-site/script.js`, list them like:
   ```js
   const galleryImages = [
     'assets/images/first-date.jpg',
     'assets/images/cute-selfie.png',
   ];
   ```
3. Optionally, use captions instead of plain strings:
   ```js
   const galleryItems = [
     { src: 'assets/images/first-date.jpg', caption: 'First date! 💐' },
     { src: 'assets/images/cute-selfie.png', caption: 'Cuties' },
   ];
   ```
   If you use `galleryItems` manually, remove the auto-map from `galleryImages`.

## Preview locally

Just open `valentine-site/index.html` in your browser.

If your browser blocks local fonts on file://, you can start a tiny server:

- Python 3:
  ```bash
  python3 -m http.server 5500
  ```
  Then visit: http://localhost:5500/valentine-site/

## Optional deploy

- You can drag the `valentine-site/` folder into Netlify or Vercel for instant hosting.
- Or use GitHub Pages by placing these files in your repo's `docs/` and enabling Pages.

## Notes

- The "No" button dodges your cursor and the "Yes" button grows to be irresistible.
- Clicking "Yes" shows a celebration with falling heart confetti.
- Background has floating hearts for extra cuteness.
