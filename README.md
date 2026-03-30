# ZAVOD

Minimalist artist portfolio. Static HTML + CSS, hosted on GitHub Pages.

## Setup

1. Push to GitHub
2. Enable GitHub Pages (Settings → Pages → Source: main branch)
3. Custom domain: `zavod.art` (configure DNS A records to GitHub Pages IPs)

## Adding artworks

Replace the `<div class="placeholder"></div>` blocks in `index.html` with:

```html
<figure class="work">
  <img src="images/artwork-name.jpg" alt="Artwork title">
</figure>
```

Place images in an `images/` folder.
