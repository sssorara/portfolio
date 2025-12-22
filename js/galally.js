document.addEventListener('DOMContentLoaded', function () {
    const scrollContainer = document.querySelector('.scroll-container');
    const cards = document.querySelectorAll('.artwork-card');

    // ================================================================
    // 1. Horizontal Scroll for PC (Mouse Wheel)
    // ================================================================
    scrollContainer.addEventListener('wheel', (evt) => {
        // Only trigger if screen > 768px (PC view)
        if (window.innerWidth > 768) {
            // Check if delta is vertical
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                scrollContainer.scrollLeft += evt.deltaY;
            }
        }
    }, { passive: false });

    // ================================================================
    // 2. Performance-First 'Reveal' Animation (IntersectionObserver)
    // ================================================================
    // Use IntersectionObserver to add 'visible' class when elements enter viewport
    const observerOptions = {
        root: null, // Use viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal: Remove waiting, add visible
                entry.target.classList.remove('waiting');
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        // Init: Add 'waiting' class to hide them for animation *only if JS runs*
        card.classList.add('waiting');
        revealObserver.observe(card);

        // Click Interaction: Jelly Bounce
        card.addEventListener('click', () => {
            // Reset to allow re-trigger
            card.classList.remove('blob-click');
            void card.offsetWidth; // Force Reflow
            card.classList.add('blob-click');
        });

        // Cleanup after animation
        card.addEventListener('animationend', (e) => {
            if (e.animationName === 'jellyBounce') {
                card.classList.remove('blob-click');
            }
        });
    });
    
    // ================================================================
    // 3. Fallback Safety
    // ================================================================
    // Ensure content is visible after 1 second even if observer fails or laggy
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.add('visible');
        });
    }, 2000);

    // ================================================================
    // Resize Handle (Optional Refresh)
    // ================================================================
    window.addEventListener('resize', () => {
        // No complex logic needed, CSS media queries handle layout
    });
});
