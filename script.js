document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. INisialisasi CONFIG FIREBASE
    // ==========================================
    // Pengguna harus mengganti isi objek ini sesuai dengan kredensial dari Konsol Firebase mereka.
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Cegah inisialisasi ganda
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    // ==========================================
    // 2. TRANSLASI ERROR FIREBASE (BAHASA INDONESIA)
    // ==========================================
    function translateFirebaseError(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                return "Email atau kata sandi yang Anda masukkan salah.";
            case 'auth/user-not-found':
                return "Akun dengan email ini belum terdaftar.";
            case 'auth/weak-password':
                return "Kata sandi terlalu lemah. Minimal harus terdiri dari 6 karakter.";
            case 'auth/email-already-in-use':
                return "Email tersebut sudah terdaftar sebagai pengguna aktif.";
            case 'auth/invalid-email':
                return "Format penulisan alamat email Anda tidak valid.";
            case 'auth/network-request-failed':
                return "Cek koneksi internet Anda dan coba lagi.";
            case 'auth/popup-closed-by-user':
                return "Proses masuk dibatalkan oleh pengguna.";
            default:
                return "Terjadi kesalahan sistem. Silakan coba kembali.";
        }
    }

    // ==========================================
    // 3. IDENTIFIKASI HALAMAN & PROTEKSI RUTE
    // ==========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    auth.onAuthStateChanged((user) => {
        // Alihkan halaman dashboard jika pengguna berhasil masuk
        if (user) {
            if (currentPage === 'login.html' || currentPage === 'signup.html' || currentPage === 'forgot-password.html') {
                window.location.href = 'dashboard.html';
            }
            if (currentPage === 'dashboard.html') {
                const displayEmail = document.getElementById('userEmailDisplay');
                if (displayEmail) displayEmail.innerText = user.email;
            }
        } else {
            // Alihkan kembali ke login jika membuka halaman rahasia tanpa otentikasi
            if (currentPage === 'dashboard.html') {
                window.location.href = 'login.html';
            }
        }
    });

    // ==========================================
    // 4. KONTROL INTERAKSI SHOW / HIDE PASSWORD
    // ==========================================
    const passwordToggles = document.querySelectorAll('.toggle-password-btn');
    passwordToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.parentElement;
            const input = wrapper.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerText = 'Sembunyikan';
            } else {
                input.type = 'password';
                btn.innerText = 'Lihat';
            }
        });
    });

    // Helper untuk menampilkan status umpan balik (feedback) form
    function showFeedback(elementId, text, isError = true) {
        const fb = document.getElementById(elementId);
        if (!fb) return;
        fb.style.color = isError ? 'var(--accent-pink)' : 'var(--accent-secondary)';
        fb.innerText = text;
    }

    // ==========================================
    // 5. PENANGANAN FLOW EMAIL & PASSWORD SIGN IN
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const passwordEl = document.getElementById('loginPassword');
            const password = passwordEl.value;
            const submitBtn = document.getElementById('loginSubmitBtn');

            // Set loading state
            submitBtn.innerText = "Masuk...";
            submitBtn.disabled = true;
            showFeedback('authFeedback', '');

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    showFeedback('authFeedback', "Masuk Berhasil! Mengalihkan...", false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
                })
                .catch((error) => {
                    // Balikkan loading state & hapus sandi
                    submitBtn.innerText = "Masuk ke Sistem";
                    submitBtn.disabled = false;
                    passwordEl.value = '';
                    showFeedback('authFeedback', translateFirebaseError(error.code));
                });
        });
    }

    // ==========================================
    // 6. PENANGANAN FLOW PENDAFTARAN AKUN BARU
    // ==========================================
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value.trim();
            const passwordEl = document.getElementById('signupPassword');
            const confirmPasswordEl = document.getElementById('confirmPassword');
            const submitBtn = document.getElementById('signupSubmitBtn');

            const password = passwordEl.value;
            const confirmPassword = confirmPasswordEl.value;

            showFeedback('authFeedback', '');

            // Validasi lokal sebelum memanggil Firebase
            if (password.length < 6) {
                showFeedback('authFeedback', "Kata sandi minimal berisi 6 karakter.");
                return;
            }

            if (password !== confirmPassword) {
                showFeedback('authFeedback', "Konfirmasi kata sandi tidak cocok.");
                return;
            }

            // Set loading state
            submitBtn.innerText = "Mendaftarkan...";
            submitBtn.disabled = true;

            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    showFeedback('authFeedback', "Akun Berhasil Dibuat! Mengalihkan...", false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
                })
                .catch((error) => {
                    submitBtn.innerText = "Buat Akun Saya";
                    submitBtn.disabled = false;
                    passwordEl.value = '';
                    confirmPasswordEl.value = '';
                    showFeedback('authFeedback', translateFirebaseError(error.code));
                });
        });
    }

    // ==========================================
    // 7. PENANGANAN LUPA KATA SANDI
    // ==========================================
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value.trim();
            const submitBtn = document.getElementById('resetSubmitBtn');

            submitBtn.innerText = "Mengirim...";
            submitBtn.disabled = true;
            showFeedback('authFeedback', '');

            auth.sendPasswordResetEmail(email)
                .then(() => {
                    showFeedback('authFeedback', "Tautan berhasil dikirim! Silakan periksa kotak masuk email Anda.", false);
                    submitBtn.innerText = "Tautan Dikirim ✔";
                })
                .catch((error) => {
                    submitBtn.innerText = "Kirim Tautan Setel Ulang";
                    submitBtn.disabled = false;
                    showFeedback('authFeedback', translateFirebaseError(error.code));
                });
        });
    }

    // ==========================================
    // 8. AUTENTIKASI SOSIAL (GOOGLE & GITHUB)
    // ==========================================
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            showFeedback('authFeedback', '');
            
            auth.signInWithPopup(provider)
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    showFeedback('authFeedback', translateFirebaseError(error.code));
                });
        });
    }

    const githubBtn = document.getElementById('githubLoginBtn');
    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GithubAuthProvider();
            showFeedback('authFeedback', '');

            auth.signInWithPopup(provider)
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    showFeedback('authFeedback', translateFirebaseError(error.code));
                });
        });
    }

    // ==========================================
    // 9. PROSES LOGOUT (SIGN OUT)
    // ==========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        });
    }


    // =========================================================================
    // 10. KONTROL LANDING PAGE MURNI (Tetap Berfungsi Sebagaimana Mestinya)
    // =========================================================================

    // Navbar Scroll Adaptation
    const navbar = document.getElementById('navbar');
    if (navbar) {
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
    }

    // Mobile Menu Toggle Control
    const mobileBtn = document.querySelector('.mobile-toggle-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    if (mobileBtn && mobileOverlay) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
        });

        const mobileLinks = document.querySelectorAll('.mobile-menu-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll Spy & Reveal Animations
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    if (sections.length > 0 && navLinks.length > 0) {
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
        }, { root: null, threshold: 0.3, rootMargin: '-50px 0px -50px 0px' });

        sections.forEach(sec => {
            if (sec.getAttribute('id')) scrollSpyObserver.observe(sec);
        });
    }

    const revealSections = document.querySelectorAll('.reveal-section');
    if (revealSections.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    if (entry.target.id === 'hero') {
                        startStatsCounting();
                    }
                }
            });
        }, { threshold: 0.15 });

        revealSections.forEach(sec => revealObserver.observe(sec));
    }

    // Stats counter (Count up)
    function startStatsCounting() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const current = parseInt(stat.innerText, 10);
            if (current === 0) {
                let count = 0;
                const speed = target / 50;
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

    // Mouse Hover Tilt & Shine
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

    // Portfolio Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');
                portfolioCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // Portfolio Lightbox
    const lightbox = document.getElementById('portfolioLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (portfolioCards.length > 0 && lightbox) {
        portfolioCards.forEach(card => {
            card.addEventListener('click', () => {
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
    }

    // Auto-Rotating Carousel Testimoni
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
        setInterval(rotateCarousel, 4000);
        track.addEventListener('mouseenter', () => isPaused = true);
        track.addEventListener('mouseleave', () => isPaused = false);
    }

    // Accordion FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const panel = item.querySelector('.faq-panel');
        if (trigger && panel) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(el => {
                    el.classList.remove('active');
                    el.querySelector('.faq-panel').style.maxHeight = null;
                    el.querySelector('.faq-panel').style.paddingBottom = '0px';
                });
                if (!isActive) {
                    item.classList.add('active');
                    panel.style.maxHeight = panel.scrollHeight + "px";
                    panel.style.paddingBottom = "16px";
                }
            });
        }
    });

    // Contact Form & WA Integration
    const contactForm = document.getElementById('contactForm');
    const packageButtons = document.querySelectorAll('[data-pkg]');

    packageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pkgName = btn.getAttribute('data-pkg');
            const selectEl = document.getElementById('service');
            if (selectEl) selectEl.value = pkgName;
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameEl = document.getElementById('fullName');
            const serviceEl = document.getElementById('service');
            const budgetEl = document.getElementById('budget');
            const messageEl = document.getElementById('message');

            const nameError = document.getElementById('nameError');
            const serviceError = document.getElementById('serviceError');
            const budgetError = document.getElementById('budgetError');
            const messageError = document.getElementById('messageError');

            let isValid = true;
            [nameError, serviceError, budgetError, messageError].forEach(err => { if (err) err.innerText = ''; });

            if (nameEl.value.trim() === '') {
                if (nameError) nameError.innerText = 'Nama lengkap wajib diisi.';
                isValid = false;
            }
            if (serviceEl.value === '') {
                if (serviceError) serviceError.innerText = 'Silakan pilih layanan/paket.';
                isValid = false;
            }
            if (budgetEl.value.trim() === '') {
                if (budgetError) budgetError.innerText = 'Estimasi anggaran harus diisi.';
                isValid = false;
            }
            if (messageEl.value.trim().length < 10) {
                if (messageError) messageError.innerText = 'Pesan terlalu pendek (min. 10 karakter).';
                isValid = false;
            }

            if (isValid) {
                const textMessage = `Halo Aether Studio, saya ingin berkonsultasi mengenai proyek desain.\n\n` +
                                    `*Nama:* ${nameEl.value.trim()}\n` +
                                    `*Paket/Layanan:* ${serviceEl.value}\n` +
                                    `*Estimasi Budget:* Rp ${budgetEl.value.trim()}\n` +
                                    `*Deskripsi Projek:* ${messageEl.value.trim()}`;
                const phoneNumber = "6281234567890"; 
                const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`;
                window.open(waUrl, '_blank');
            }
        });
    }
});
