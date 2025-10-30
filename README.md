# Zhiyuan's Portfolio

A modern, interactive portfolio website featuring fluid animations and card-based content display using Three.js ES Modules.

## 🎨 Features

- **Interactive Fluid Animation** - WebGL-based fluid simulation using Three.js r160
- **Scroll-Triggered Animations** - GSAP ScrollTrigger for smooth card animations
- **3D Card Flips** - CSS 3D transforms with scroll-based reveals
- **Smooth Scrolling** - Lenis for buttery-smooth scroll experience
- **Fully Responsive** - Mobile-first design with multiple breakpoints
- **ES Modules** - Modern JavaScript with no deprecation warnings

## 📂 Project Structure

```
project/
├── index.html          (5.7KB) - Semantic HTML5 structure
├── styles.css          (8.4KB) - Responsive CSS with custom properties
├── main.js            (329B)  - ES Module entry point
├── fluid.js           (7.3KB) - Three.js fluid animation (ES Module)
├── animations.js      (5.6KB) - GSAP card animations
├── assets/
│   ├── portrait_top.JPG
│   └── portrait_bottom.PNG
├── README.md          - This file
└── MIGRATION.md       - ES Module migration guide
```

## 🚀 Technologies

- **Three.js r160** - ES Module version (no deprecation warnings)
- **GSAP 3.12.5** with ScrollTrigger
- **Lenis 1.3.4** - Smooth scrolling
- **CSS3** - Variables, Flexbox, Grid, 3D Transforms
- **ES6 Modules** - Modern JavaScript with imports/exports

## 📜 Page Sections

1. **Fluid Section** - Interactive WebGL fluid animation canvas
2. **Hero Cards** - Three animated cards (Education, Experience, Interests)
3. **Section Divider** - Scroll indicator with dark background
4. **Services Section** - Pinned section with animated header
5. **Flip Cards** - Three cards that fly in and flip to reveal details
6. **Outro** - Closing section

## 🎯 Animation Flow

### Hero Cards Animation
- Cards start centered
- On scroll: spread apart horizontally
- Rotate slightly (left -15°, right +15°)
- Scale down to 75%
- Fade to 50% opacity

### Flip Cards Animation
- Start off-screen (top -100%)
- Phase 1 (0-40%): Animate down to 50% with scale 0.25 → 0.75
- Phase 2 (40-60%): Settle to center with scale 0.75 → 1
- Phase 3 (60-100%): Spread horizontally and flip 180°
- Sequential delay: Card 2 starts after Card 1, Card 3 after Card 2

## 🖥️ Browser Support

Requires modern browsers with ES Module support:
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Firefox 108+
- ✅ Safari 16.4+

## 🔧 Development

No build process required - just open `index.html` in a modern browser.

For local development with CORS support:
```bash
python -m http.server 8000
# or
npx serve
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: < 480px

## ⚡ Performance

- Optimized WebGL rendering with ping-pong buffers
- Hardware-accelerated CSS transforms
- Efficient ScrollTrigger updates
- Lazy loading for images
- Minimal dependencies (all from CDN)

## 📝 Notes

- Images are loaded asynchronously with fallback placeholders
- Fluid animation uses float textures for smooth effects
- All animations use `smoothStep` easing for natural motion
- ScrollTrigger pins the services section for 4 viewport heights

## 🐛 Troubleshooting

### No fluid animation
- Check browser console for WebGL support
- Verify `assets/` images are accessible

### Animations not working
- Hard refresh (Ctrl+Shift+R) to clear cache
- Check console for library loading errors
- Verify GSAP, ScrollTrigger, and Lenis are loaded

### Deprecation warnings
- Should be gone! Using Three.js ES Module r160
- If you see warnings, verify `importmap` is correct

## 📄 License

Personal portfolio project
