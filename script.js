document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navbar Scroll Adaptation
    const navbar = document.querySelector('.glass-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Hamburger Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Kunci scroll body saat menu overlay aktif
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Menutup menu saat navigasi diklik
        const mobileLinks = document.querySelectorAll('.mobile-link:not(.mobile-dropdown-trigger), .mobile-sublink');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 3. Mobile Submenu Toggle
    const mobileDropdownTrigger = document.querySelector('.mobile-dropdown-trigger');
    const mobileSubmenu = document.querySelector('.mobile-submenu');

    if (mobileDropdownTrigger && mobileSubmenu) {
        mobileDropdownTrigger.addEventListener('click', () => {
            mobileSubmenu.classList.toggle('active');
            mobileDropdownTrigger.innerHTML = mobileSubmenu.classList.contains('active') ? 'Layanan ▴' : 'Layanan ▾';
        });
    }

    // 4. Interactive Liquid Glass Glow Effect (Pelacak Kursor Mouse)
    const glassCards = document.querySelectorAll('.hover-glow, .premium-glass');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Koordinat X kursor di dalam element
            const y = e.clientY - rect.top;  // Koordinat Y kursor di dalam element

            // Memasukkan koordinat ke CSS Custom Variable
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
