document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const cardContainers = document.querySelectorAll(".card-container");
    const stickyHeader = document.querySelector(".sticky-header h1");
    const responsiveElements = document.querySelectorAll(".card, .card-container, .sticky-header h1");
    const mm = gsap.matchMedia();

    function resetInlineStyles() {
        responsiveElements.forEach((el) => {
            el.removeAttribute("style");
        });
    }

    function initAnimations() {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        mm.revert();

        mm.add("(max-width: 999px)", () => {
            resetInlineStyles();
            return () => resetInlineStyles();
        });

        mm.add("(min-width: 1000px)", () => {
            resetInlineStyles();

            let isGapAnimationCompleted = false;
            let isFlipAnimationCompleted = false;

            const trigger = ScrollTrigger.create({
                trigger: ".sticky",
                start: "top top",
                end: `+=${window.innerHeight * 4}px`,
                scrub: 1,
                pin: true,
                pinSpacing: true,
                onUpdate: (self) => {
                    const progress = self.progress;

                    if (progress < 0.1 && progress <= 0.25) {
                        const headerProgress = gsap.utils.mapRange(
                            0.1,
                            0.25,
                            0,
                            1,
                            progress
                        );
                        const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
                        const opacityValue = gsap.utils.mapRange(
                            0,
                            1,
                            0,
                            1,
                            headerProgress
                        );

                        gsap.set(stickyHeader, {
                            y: yValue,
                            opacity: opacityValue
                        });
                    } else if (progress <= 0.1) {
                        gsap.set(stickyHeader, {
                            y: 40,
                            opacity: 0
                        });
                    } else if (progress > 0.25) {
                        gsap.set(stickyHeader, {
                            y: 0,
                            opacity: 1
                        });
                    }

                    if (progress <= 0.25) {
                        const widthPercentage = gsap.utils.mapRange(
                            0,
                            0.25,
                            75,
                            60,
                            progress
                        );
                        gsap.set(cardContainers, { width: `${widthPercentage}%` });
                    } else {
                        gsap.set(cardContainers, { width: "60%" });
                    }

                    if (progress >= 0.35 && !isGapAnimationCompleted) {
                        gsap.to(cardContainers, {
                            gap: "20px",
                            duration: 0.5,
                            ease: "power3.out",
                        })

                        gsap.to(["#card-1", "#card-2", "#card-3"], {
                            borderRadius: "20px",
                            duration: 0.5,
                            ease: "power3.out",
                        });

                        isGapAnimationCompleted = true;
                    } else if (progress < 0.35 && isGapAnimationCompleted) {
                        gsap.to(cardContainers, {
                            gap: "0px",
                            duration: 0.5,
                            ease: "power3.out"
                        });

                        gsap.to("#card-1", {
                            borderRadius: "20px 0 0 20px",
                            duration: 0.5,
                            ease: "power3.out"
                        });

                        gsap.to("#card-2", {
                            borderRadius: "0px",
                            duration: 0.5,
                            ease: "power3.out"
                        });

                        gsap.to("#card-3", {
                            borderRadius: "0 20px 20px 0",
                            duration: 0.5,
                            ease: "power3.out"
                        });

                        isGapAnimationCompleted = false;
                    }

                    if (progress >= 0.7 && !isFlipAnimationCompleted) {
                        gsap.to(".card", {
                            rotationY: 180,
                            duration: 0.75,
                            ease: "power3.inOut",
                            stagger: 0.1,
                        });

                        gsap.to(["#card-1", "#card-3"], {
                            y: 30,
                            rotationZ: (i) => [-15, 15][i],
                            duration: 0.75,
                            ease: "power3.inOut",
                        })

                        isFlipAnimationCompleted = true;
                    } else if (progress < 0.7 && isFlipAnimationCompleted) {
                        gsap.to(".card", {
                            rotationY: 0,
                            duration: 0.75,
                            ease: "power3.inOut",
                            stagger: 0.1,
                        });

                        gsap.to(["#card-1", "#card-3"], {
                            y: 0,
                            rotationZ: 0,
                            duration: 0.75,
                            ease: "power3.inOut",
                        });

                        isFlipAnimationCompleted = false;
                    }
                }
            });

            return () => {
                trigger.kill();
            };
        });
    }

    initAnimations();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initAnimations();
            ScrollTrigger.refresh();
        }, 200);
    });
});
