# SPN Alphabetz (Static HTML/CSS/JS)

Pages included (matching your Figma page list):
- `index.html` (Home)
- `about.html` (About Us)
- `programs.html` (Programs)
- `why-choose-us.html` (Why Choose Us)
- `testimonials.html` (Testimonials)
- `admissions.html` (Admissions)

## What’s implemented
- Responsive layout (mobile-first)
- Sticky header + active nav highlighter (`aria-current="page"`)
- Mobile menu panel
- Hero slider (Home)
- Testimonials slider (Testimonials)
- FAQ accordion (Programs)
- Scroll-to-top button
- Admissions form (front-end only) with a small toast message

## Replace images / highlights
- Dummy images live in `assets/img/`.
  - `assets/img/placeholder.svg` is used as a placeholder for all sections.
  - `assets/img/avatar.svg` is used in testimonials.

You can replace any `<img src="assets/img/placeholder.svg">` with your exported Figma images.

## Run locally
Since this is a static site, you can open `index.html` directly.

Some browsers restrict module-like features or fetch requests when opening local files, but this site uses plain JS, so it should work as-is.

If you want a local server anyway (recommended), use **any** of these options:
- VS Code extension: “Live Server”
- Python: `python -m http.server`
- Node: any static server

## Notes
- Shared header/footer are duplicated across pages for simplicity.
- `_partials.html` contains the header/footer markup as a reference if you later switch to a templating system.
