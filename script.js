document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Adaptations (Navbar & Back to Top)
    const navbar = document.getElementById('navbar');
    
    // Debounce Scroll Listener untuk performa optimal
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    });

    // 2. Mobile Menu Toggle Control
    const mobileBtn = document.querySelector('.mobile-toggle-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileBtn && mobileOverlay) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            // Kunci scroll saat overlay terbuka
            document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // Klik salah satu link langsung menutup menu
        const mobileLinks = document.querySelectorAll('.mobile-menu-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 3. Scroll Spy (Aktif Menu Berdasarkan Section)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    const scrollSpyOptions = {
        root: null,
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px'
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === currentId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(sec => {
        if (sec.getAttribute('id')) {
            scrollSpyObserver.observe(sec);
        }
    });

    // 4. Scroll-Triggered Reveal Animations (IntersectionObserver)
    const revealSections = document.querySelectorAll('.reveal-section');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Memicu penghitung angka statistik saat hero masuk viewport
                if (entry.target.id === 'hero') {
                    startStatsCounting();
                }
            }
        });
    }, { threshold: 0.15 });

    revealSections.forEach(sec => {
        revealObserver.observe(sec);
    });

    // 5. Animasi Penghitung Angka Statistik (Count Up)
    function startStatsCounting() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const current = parseInt(stat.innerText, 10);
            
            if (current === 0) { // Hanya berjalan sekali
                let count = 0;
                const speed = target / 50; // Durasi animasi konstan
                
                const updateCount = () => {
                    count += speed;
                    if (count < target) {
                        stat.innerText = Math.floor(count);
                        setTimeout(updateCount, 25);
                    } else {
                        stat.innerText = target + (stat.getAttribute('data-target') === '98' ? '%' : '+');
                    }
                };
                updateCount();
            }
        });
    }

    // 6. Mouse Hover Tilt & Shine Effect
    const tiltElements = document.querySelectorAll('.hover-tilt');
    tiltElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            elem.style.setProperty('--mouse-x', `${x}px`);
            elem.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 7. Portfolio Filtering Engine
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    // Animasi enteng
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 8. Custom Portfolio Lightbox Modal
    const lightbox = document.getElementById('portfolioLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxClose = document.querySelector('.lightbox-close');

    portfolioCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Cegah terpicu jika mengklik area non-gambar
            const img = card.querySelector('.portfolio-img');
            const title = card.querySelector('.portfolio-title').innerText;
            
            if (img) {
                lightboxImage.src = img.src;
                lightboxTitle.innerText = title;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // 9. Auto-Rotating Carousel Testimoni
    const track = document.getElementById('carouselTrack');
    const cards = document.querySelectorAll('.testimonial-card');
    
    if (track && cards.length > 0) {
        let currentIndex = 0;
        let isPaused = false;
        
        const rotateCarousel = () => {
            if (!isPaused) {
                currentIndex = (currentIndex + 1) % cards.length;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
        };

        let carouselInterval = setInterval(rotateCarousel, 4000);

        // Jeda rotasi saat kursor melayang (hover) di atas carousel
        track.addEventListener('mouseenter', () => isPaused = true);
        track.addEventListener('mouseleave', () => isPaused = false);
    }

    // 10. Accordion FAQ Transition Engine
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const panel = item.querySelector('.faq-panel');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Tutup semua accordion terlebih dahulu
            faqItems.forEach(el => {
                el.classList.remove('active');
                el.querySelector('.faq-panel').style.maxHeight = null;
                el.querySelector('.faq-panel').style.paddingBottom = '0px';
            });

            // Aktifkan item yang diklik jika belum aktif sebelumnya
            if (!isActive) {
                item.classList.add('active');
                panel.style.maxHeight = panel.scrollHeight + "px";
                panel.style.paddingBottom = "16px";
            }
        });
    });

    // 11. WhatsApp Form Validation & Generator Link
    const form = document.getElementById('contactForm');
    const packageButtons = document.querySelectorAll('[data-pkg]');

    // Otomatis memilih opsi paket ketika mengklik tombol "Pilih Paket"
    packageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pkgName = btn.getAttribute('data-pkg');
            const selectEl = document.getElementById('service');
            if (selectEl) {
                selectEl.value = pkgName;
            }
        });
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Elemen Formulir
            const nameEl = document.getElementById('fullName');
            const serviceEl = document.getElementById('service');
            const budgetEl = document.getElementById('budget');
            const messageEl = document.getElementById('message');

            // Kontainer validasi pesan error
            const nameError = document.getElementById('nameError');
            const serviceError = document.getElementById('serviceError');
            const budgetError = document.getElementById('budgetError');
            const messageError = document.getElementById('messageError');

            let isValid = true;

            // Reset Error
            [nameError, serviceError, budgetError, messageError].forEach(err => err.innerText = '');

            // Validasi Input
            if (nameEl.value.trim() === '') {
                nameError.innerText = 'Nama lengkap wajib diisi.';
                isValid = false;
            }
            if (serviceEl.value === '') {
                serviceError.innerText = 'Silakan pilih layanan/paket.';
                isValid = false;
            }
            if (budgetEl.value.trim() === '') {
                budgetError.innerText = 'Estimasi anggaran harus diisi.';
                isValid = false;
            }
            if (messageEl.value.trim().length < 10) {
                messageError.innerText = 'Pesan terlalu pendek (min. 10 karakter).';
                isValid = false;
            }

            if (isValid) {
                // Format Pesan WhatsApp
                const textMessage = `Halo Aether Studio, saya ingin berkonsultasi mengenai proyek desain.\n\n` +
                                    `*Nama:* ${nameEl.value.trim()}\n` +
                                    `*Paket/Layanan:* ${serviceEl.value}\n` +
                                    `*Estimasi Budget:* Rp ${budgetEl.value.trim()}\n` +
                                    `*Deskripsi Projek:* ${messageEl.value.trim()}`;

                // Ganti nomor dengan nomor tujuan WhatsApp Anda
                const phoneNumber = "6281234567890"; 
                const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`;

                // Redirect ke URL WhatsApp resmi
                window.open(waUrl, '_blank');
            }
        });
    }
});
