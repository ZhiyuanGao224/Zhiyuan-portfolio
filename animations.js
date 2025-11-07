export function initCardAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
    console.error('Required libraries not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const smoothStep = (p) => p * p * (3 - 2 * p);

  ScrollTrigger.create({
    trigger: ".cards-hero",
    start: "top top",
    end: "75% top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const heroCardContainerOpacity = gsap.utils.interpolate(
        1,
        0.5,
        smoothStep(progress)
      );
      gsap.set(".hero-cards", { opacity: heroCardContainerOpacity });

      ["#hero-card-1", "#hero-card-2", "#hero-card-3"].forEach(
        (cardId, index) => {
          const delay = index * 0.9;
          const cardProgress = gsap.utils.clamp(
            0,
            1,
            (progress - delay * 0.1) / (1 - delay * 0.1)
          );

          const y = gsap.utils.interpolate("0%", "250%", smoothStep(cardProgress));
          const scale = gsap.utils.interpolate(1, 0.75, smoothStep(cardProgress));

          let x = "0%";
          let rotation = 0;
          if (index === 0) {
            x = gsap.utils.interpolate("0%", "90%", smoothStep(cardProgress));
            rotation = gsap.utils.interpolate(0, -15, smoothStep(cardProgress));
          } else if (index === 2) {
            x = gsap.utils.interpolate("0%", "-90%", smoothStep(cardProgress));
            rotation = gsap.utils.interpolate(0, 15, smoothStep(cardProgress));
          }

          gsap.set(cardId, { y, scale, x, rotation });
        }
      );
    }
  });

  ScrollTrigger.create({
    trigger: ".services-section",
    start: "top top",
    end: `+=${window.innerHeight * 2}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const headerProgress = gsap.utils.clamp(0, 1, self.progress);
      const headerY = gsap.utils.interpolate("400%", "0%", smoothStep(headerProgress));
      gsap.set(".services-header", { y: headerY });
    }
  });

  ScrollTrigger.create({
    trigger: ".flip-cards-section",
    start: "top top",
    end: `+=${window.innerHeight * 3}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      ["#card-1", "#card-2", "#card-3"].forEach((cardId, index) => {
        const adjustedProgress = Math.max(0, (progress - 0.2) / 0.8);

        const delay = index * 0.5;
        const cardProgress = gsap.utils.clamp(
          0,
          1,
          (adjustedProgress - delay * 0.1) / (0.9 - delay * 0.1)
        );
        const innerCard = document.querySelector(`${cardId} .flip-card-inner`);

        if (!innerCard) return;

        let y;
        if (cardProgress < 0.4) {
          const normalizedProgress = cardProgress / 0.4;
          y = gsap.utils.interpolate("-100%", "50%",
            smoothStep(normalizedProgress));
        } else if (cardProgress < 0.6) {
          const normalizedProgress = (cardProgress - 0.4) / 0.2;
          y = gsap.utils.interpolate("50%", "0%", smoothStep(normalizedProgress));
        } else {
          y = "0%";
        }

        let scale;
        if (cardProgress < 0.4) {
          const normalizedProgress = cardProgress / 0.4;
          scale = gsap.utils.interpolate(0.25, 0.75, smoothStep(normalizedProgress));
        } else if (cardProgress < 0.6) {
          const normalizedProgress = (cardProgress - 0.4) / 0.2;
          scale = gsap.utils.interpolate(0.75, 1, smoothStep(normalizedProgress));
        } else {
          scale = 1;
        }

        let opacity;
        if (cardProgress < 0.2) {
          const normalizedProgress = cardProgress / 0.2;
          opacity = smoothStep(normalizedProgress);
        } else {
          opacity = 1;
        }

        let x, rotate, rotateY;
        if (cardProgress < 0.6) {
          x = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
          rotate = index === 0 ? -5 : index === 1 ? 0 : 5;
          rotateY = 0;
        } else if (cardProgress < 1) {
          const normalizedProgress = (cardProgress - 0.6) / 0.4;
          x = gsap.utils.interpolate(
            index === 0 ? "100%" : index === 1 ? "0%" : "-100%",
            "0%",
            smoothStep(normalizedProgress)
          );
          rotate = gsap.utils.interpolate(
            index === 0 ? -5 : index === 1 ? 0 : 5,
            0,
            smoothStep(normalizedProgress)
          );
          rotateY = smoothStep(normalizedProgress) * 180;
        } else {
          x = "0%";
          rotate = 0;
          rotateY = 180;
        }

        // 不再在外层加 rotate，避免覆盖 3D 翻转
        gsap.set(cardId, {
          y,
          x,
          scale,
          opacity,
        });

        // 把旋转和翻转都交给内层处理
        gsap.set(innerCard, {
          rotationY: rotateY,
          rotate,
        });

      });
    }
  });

  console.log('Card animations initialized');
}
