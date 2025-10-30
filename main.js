import { initFluidAnimation } from './fluid.js';
import { initCardAnimations } from './animations.js';

window.addEventListener('load', () => {
  initFluidAnimation();

  if (document.readyState === 'complete') {
    initCardAnimations();
  } else {
    document.addEventListener('DOMContentLoaded', initCardAnimations);
  }
});
