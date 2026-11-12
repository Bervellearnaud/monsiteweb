/* ==========================================================================
   TechZen — interactions de la landing page
   Vanilla JS, sans dépendance.
   ========================================================================== */
(function () {
    "use strict";

    /* ----------------------------------------------------------------------
       Configuration
       Renseignez votre numéro WhatsApp au format international, sans "+",
       sans espaces ni tirets. Exemple : "2250700000000".
       Tant qu'il est vide, les boutons WhatsApp basculent automatiquement
       vers un e-mail pré-rempli (aucun lien cassé).
       ---------------------------------------------------------------------- */
    var CONFIG = {
        WHATSAPP_NUMBER: "",                       // ex. "2250700000000"
        EMAIL: "contact@techzen.ci",
        BRAND: "TechZen"
    };

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    /* ======================================================================
       1. Thème clair / sombre
       ====================================================================== */
    var STORAGE_KEY = "techzen-theme";
    var root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        var meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#06131f" : "#f4f9fc");
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    }

    (function initTheme() {
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        if (!saved) {
            saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        applyTheme(saved === "dark" ? "dark" : "light");
    })();

    var themeToggle = $("#themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
        });
    }

    /* ======================================================================
       2. Navigation : scroll, menu mobile, liens actifs
       ====================================================================== */
    var nav = $("#nav");
    var burger = $("#burger");
    var mobileNav = $("#mobileNav");
    var progress = $("#scrollProgress");
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;

        if (nav) nav.classList.toggle("is-scrolled", y > 24);

        if (progress) {
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + "%";
        }

        var atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 120;
        var goingDown = y > lastY && y > 400;
        if (nav) nav.style.transform = (goingDown && !atBottom) ? "translateY(-105%)" : "translateY(0)";
        lastY = y;

        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    onScroll();

    function closeMobileNav() {
        if (!mobileNav || !burger) return;
        mobileNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Ouvrir le menu");
        document.body.style.overflow = "";
    }

    if (burger && mobileNav) {
        burger.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            burger.setAttribute("aria-expanded", open ? "true" : "false");
            burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
            document.body.style.overflow = open ? "hidden" : "";
        });

        $$("a", mobileNav).forEach(function (link) {
            link.addEventListener("click", closeMobileNav);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeMobileNav();
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 1020) closeMobileNav();
        });
    }

    /* Lien de navigation actif en fonction de la section visible */
    var sectionLinks = $$('.nav__links a[href^="#"]');
    var sections = sectionLinks
        .map(function (link) { return document.getElementById(link.getAttribute("href").slice(1)); })
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach(function (link) {
                    link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        sections.forEach(function (section) { navObserver.observe(section); });
    }

    /* ======================================================================
       3. Apparition au défilement
       ====================================================================== */
    var revealEls = $$("[data-reveal]");

    if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }

    /* ======================================================================
       4. Compteurs animés
       ====================================================================== */
    function animateCounter(el) {
        var target = parseFloat(el.getAttribute("data-count"));
        if (isNaN(target)) return;
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null;
        var duration = 1100;

        function step(ts) {
            if (start === null) start = ts;
            var p = Math.min(1, (ts - start) / duration);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    var counters = $$("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
        var counterObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { counterObserver.observe(el); });
    }

    /* ======================================================================
       5. Filtres des réalisations
       ====================================================================== */
    var filterBtns = $$(".filter");
    var projects = $$("#projects .project");

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var filter = btn.getAttribute("data-filter");

            filterBtns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });

            projects.forEach(function (project) {
                var cats = (project.getAttribute("data-cat") || "").split(/\s+/);
                var show = filter === "all" || cats.indexOf(filter) !== -1;
                project.classList.toggle("is-hidden", !show);
                if (show) {
                    project.classList.add("is-in");
                }
            });
        });
    });

    /* ======================================================================
       6. Liens WhatsApp (avec repli e-mail)
       ====================================================================== */
    function buildWhatsAppURL(message) {
        var num = (CONFIG.WHATSAPP_NUMBER || "").replace(/\D/g, "");
        if (!num) return null;
        return "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
    }

    function buildMailtoURL(message, subject) {
        return "mailto:" + CONFIG.EMAIL +
            "?subject=" + encodeURIComponent(subject || "Demande de projet — " + CONFIG.BRAND) +
            "&body=" + encodeURIComponent(message);
    }

    function linkForWhatsApp(message, subject) {
        return buildWhatsAppURL(message) || buildMailtoURL(message, subject);
    }

    $$("[data-wa]").forEach(function (el) {
        var message = el.getAttribute("data-wa") || "Bonjour " + CONFIG.BRAND + " !";
        var url = buildWhatsAppURL(message);
        if (url) {
            el.setAttribute("href", url);
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener noreferrer");
        } else {
            el.setAttribute("href", buildMailtoURL(message));
            el.setAttribute("title", "Ouvrir un e-mail pré-rempli (numéro WhatsApp à configurer)");
        }
    });

    /* ======================================================================
       7. Formulaire de contact → WhatsApp / e-mail
       ====================================================================== */
    var form = $("#projectForm");
    var statusEl = $("#formStatus");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var name = ($("#f-name") || {}).value || "";
            var email = ($("#f-email") || {}).value || "";
            var phone = ($("#f-phone") || {}).value || "";
            var need = ($("#f-need") || {}).value || "";
            var message = ($("#f-msg") || {}).value || "";

            var missing = [];
            if (!name.trim()) missing.push("votre nom");
            if (!email.trim() || email.indexOf("@") === -1) missing.push("un e-mail valide");
            if (!message.trim()) missing.push("quelques mots sur votre projet");

            if (missing.length) {
                if (statusEl) {
                    statusEl.textContent = "Merci de compléter : " + missing.join(", ") + ".";
                    statusEl.classList.add("is-on");
                    statusEl.style.background = "rgba(200, 60, 60, .10)";
                    statusEl.style.color = "#b42318";
                    statusEl.style.borderColor = "rgba(200, 60, 60, .25)";
                }
                return;
            }

            var text =
                "Bonjour " + CONFIG.BRAND + ",\n\n" +
                "Nom : " + name.trim() + "\n" +
                "E-mail : " + email.trim() + "\n" +
                (phone.trim() ? "Téléphone / WhatsApp : " + phone.trim() + "\n" : "") +
                "Besoin : " + need + "\n\n" +
                "Projet :\n" + message.trim() + "\n\n" +
                "— Envoyé depuis la page d'accueil de " + CONFIG.BRAND;

            var url = linkForWhatsApp(text, "Demande de projet — " + need + " (" + name.trim() + ")");

            if (statusEl) {
                statusEl.textContent = CONFIG.WHATSAPP_NUMBER
                    ? "Merci " + name.trim().split(" ")[0] + " ! Votre message s'ouvre dans WhatsApp."
                    : "Merci " + name.trim().split(" ")[0] + " ! Votre message s'ouvre dans votre logiciel de messagerie.";
                statusEl.classList.remove("is-on");
                void statusEl.offsetWidth;
                statusEl.classList.add("is-on");
                statusEl.removeAttribute("style");
            }

            window.open(url, "_blank", "noopener");
            form.reset();
        });
    }

    /* ======================================================================
       8. Galerie de visuels + visionneuse (lightbox)
       ====================================================================== */
    var lightbox = $("#lightbox");
    var lbImg = $("#lbImg");
    var lbTitle = $("#lbTitle");
    var lbCount = $("#lbCount");
    var lbClose = $("#lbClose");
    var lbPrev = $("#lbPrev");
    var lbNext = $("#lbNext");
    var lbItems = [];
    var lbIndex = 0;
    var lbReturnFocus = null;

    function galleryOf(card) {
        var items = [];
        var main = $("img[data-main]", card);
        if (main) {
            items.push({ src: main.getAttribute("src"), caption: main.getAttribute("alt") || "", alt: main.getAttribute("alt") || "" });
        }
        $$(".project__thumbs button", card).forEach(function (btn) {
            var img = $("img", btn);
            items.push({
                src: btn.getAttribute("data-full") || (img ? img.getAttribute("src") : ""),
                caption: btn.getAttribute("data-caption") || (img ? img.getAttribute("alt") : "") || "",
                alt: img ? img.getAttribute("alt") || "" : ""
            });
        });
        return items;
    }

    function showAt(index) {
        if (!lbItems.length) return;
        lbIndex = (index + lbItems.length) % lbItems.length;
        var item = lbItems[lbIndex];
        lbImg.setAttribute("src", item.src);
        lbImg.setAttribute("alt", item.alt || item.caption);
        lbTitle.textContent = item.caption;
        lbCount.textContent = (lbIndex + 1) + " / " + lbItems.length;
        var single = lbItems.length < 2;
        lbPrev.style.display = single ? "none" : "";
        lbNext.style.display = single ? "none" : "";
        lbCount.style.display = single ? "none" : "";
    }

    function openLightbox(items, index, trigger) {
        if (!lightbox || !items.length) return;
        lbItems = items;
        lbReturnFocus = trigger || document.activeElement;
        lightbox.hidden = false;
        void lightbox.offsetWidth;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
        showAt(index || 0);
        lbClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
        window.setTimeout(function () { lightbox.hidden = true; }, 260);
        if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
    }

    $$(".project").forEach(function (card) {
        var media = $(".project__media", card);
        if (!media) return;
        var main = $("img[data-main]", media);
        var thumbs = $$(".project__thumbs button", card);
        var items = galleryOf(card);

        thumbs.forEach(function (btn, i) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!main) return;
                main.style.opacity = "0";
                window.setTimeout(function () {
                    main.setAttribute("src", items[i + 1].src);
                    main.setAttribute("alt", items[i + 1].caption);
                    main.style.opacity = "1";
                }, 140);
                thumbs.forEach(function (other) { other.classList.toggle("is-active", other === btn); });
            });
        });

        if (thumbs[0]) thumbs[0].classList.add("is-active");

        var zoom = $("[data-zoom]", media);
        if (zoom) {
            zoom.addEventListener("click", function (e) {
                e.preventDefault();
                var activeIndex = thumbs.findIndex(function (b) { return b.classList.contains("is-active"); });
                openLightbox(items, activeIndex + 1, zoom);
            });
        }

        if (main) {
            main.style.transition = "opacity .25s ease, transform .85s cubic-bezier(.16,1,.3,1)";
            main.style.cursor = "zoom-in";
            media.style.cursor = "zoom-in";
            media.addEventListener("click", function (e) {
                if (e.target.closest("button, a")) return;
                var activeIndex = thumbs.findIndex(function (b) { return b.classList.contains("is-active"); });
                openLightbox(items, activeIndex + 1, media);
            });
        }
    });

    if (lightbox) {
        lbClose.addEventListener("click", closeLightbox);
        lbPrev.addEventListener("click", function () { showAt(lbIndex - 1); });
        lbNext.addEventListener("click", function () { showAt(lbIndex + 1); });

        lightbox.addEventListener("click", function (e) {
            if (e.target === lightbox || e.target.classList.contains("lightbox__stage")) closeLightbox();
        });

        document.addEventListener("keydown", function (e) {
            if (lightbox.hidden) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") showAt(lbIndex + 1);
            if (e.key === "ArrowLeft") showAt(lbIndex - 1);
            if (e.key === "Tab") {
                var focusables = $$("button", lightbox);
                var first = focusables[0];
                var last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    }

    if (window.__TECHZEN_DEBUG__) {
        window.__techzen = { galleryOf: galleryOf, openLightbox: openLightbox, $$: $$ };
    }

    /* ======================================================================
       9. Détails divers
       ====================================================================== */
    var yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* FAQ : une seule réponse ouverte à la fois */
    var faqItems = $$("#faq details");
    faqItems.forEach(function (item) {
        item.addEventListener("toggle", function () {
            if (!item.open) return;
            faqItems.forEach(function (other) {
                if (other !== item) other.open = false;
            });
        });
    });

    /* Défilement doux pour les ancres (compatibilité navigateurs anciens) */
    $$('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            var id = link.getAttribute("href");
            if (!id || id === "#" || id.length < 2) return;
            var target = document.getElementById(id.slice(1));
            if (!target) return;
            e.preventDefault();
            var top = target.getBoundingClientRect().top + window.scrollY - 74;
            window.scrollTo({ top: top, behavior: "smooth" });
            history.replaceState(null, "", id);
        });
    });
})();
