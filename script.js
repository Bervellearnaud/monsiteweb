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
        WHATSAPP_NUMBER: "2250714232871",          // +225 07 14 23 28 71
        WHATSAPP_DISPLAY: "+225 07 14 23 28 71",
        EMAIL: "techzenc@techzen.ci",
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

    function currentMainSrc(main) {
        // <picture> : le navigateur peut afficher un <source> différent de l'attribut src
        var pic = main.closest("picture");
        if (pic) {
            var sources = $$("source", pic);
            for (var i = 0; i < sources.length; i++) {
                var mq = sources[i].getAttribute("media");
                var ok = true;
                try { ok = !mq || !window.matchMedia || window.matchMedia(mq).matches; } catch (e) { ok = true; }
                if (ok) return sources[i].getAttribute("srcset") || main.getAttribute("src");
            }
        }
        return main.getAttribute("src");
    }

    function galleryOf(card) {
        var items = [];
        var main = $("img[data-main]", card);
        if (main) {
            items.push({ src: currentMainSrc(main), caption: main.getAttribute("alt") || "", alt: main.getAttribute("alt") || "" });
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
        var picked = -1;   // -1 : l'affiche de couverture est encore à l'écran

        thumbs.forEach(function (btn, i) {
            btn.addEventListener("click", function (e) {
                picked = i;
                e.preventDefault();
                e.stopPropagation();
                if (!main) return;
                main.style.opacity = "0";
                window.setTimeout(function () {
                    var pic = main.closest("picture");
                    if (pic) $$("source", pic).forEach(function (src) { src.remove(); });
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
                openLightbox(items, picked + 1, zoom);
            });
        }

        if (main) {
            main.style.transition = "opacity .25s ease, transform .85s cubic-bezier(.16,1,.3,1)";
            main.style.cursor = "zoom-in";
            media.style.cursor = "zoom-in";
            media.addEventListener("click", function (e) {
                if (e.target.closest("button, a")) return;
                openLightbox(items, picked + 1, media);
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

    /* Carrousel des technos : défilement horizontal, automatique par défaut.
       Le défilement est natif (scroll-snap) : molette, trackpad, balayage
       tactile et clavier fonctionnent sans code. Le JS ajoute l'avance
       automatique, les boutons, le compteur « 3 / 11 », la barre de
       progression, le glisser à la souris et l'alignement carte par carte.

       L'autoplay s'arrête temporairement dès que l'utilisateur manifeste une
       intention (survol, focus, molette, glisser, bouton) puis reprend tout
       seul : un carrousel qui repart sous le doigt est plus déroutant qu'un
       carrousel figé. Il se met en pause pour de bon si l'utilisateur clique
       sur pause, si l'onglet est masqué, si la section sort de l'écran ou si
       `prefers-reduced-motion` est demandé. */
    (function () {
        var track = $("[data-carousel]");
        if (!track) return;

        var prev = $("[data-carousel-prev]");
        var next = $("[data-carousel-next]");
        var counter = $("[data-carousel-count]");
        var progress = $("[data-carousel-progress]");
        var cards = $$(".tech-card", track);
        var toggle = $("[data-carousel-toggle]");
        var reduce = window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)")
            : { matches: false };

        /* Cadence de l'avance automatique. Le minuteur ne repart qu'une fois la
           carte arrivée : la glissade (≈ 0,6 s) ne rogne donc plus le temps de
           lecture. 2,6 s d'arrêt + 0,6 s de transition ≈ 3,2 s par carte. */
        var DELAY = 2600;        /* temps d'arrêt sur chaque carte, en ms */
        var SCROLL_MS = 620;     /* durée approximative de la glissade, en ms */
        var IDLE_RESUME = 4000;  /* reprise après la dernière interaction */
        var userPaused = false;  /* pause explicite (bouton) ou reduce-motion */
        var inView = true;       /* la section est visible à l'écran */
        var hovering = false;    /* le curseur est sur le carrousel */
        var dragging = false;
        var interactingUntil = 0;
        var timer = null;

        function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }

        /* Largeur d'une carte + gouttière = pas d'avance d'un cran */
        function stride() {
            if (cards.length < 2) return track.clientWidth;
            return cards[1].offsetLeft - cards[0].offsetLeft;
        }

        /* Position de défilement qui amène la carte i au bord gauche utile */
        function leftOf(i) {
            var card = cards[i];
            if (!card) return 0;
            var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
            return Math.max(0, card.offsetLeft - track.offsetLeft - pad);
        }

        /* Aligne la piste sur la carte la plus proche de la position voulue */
        function nearestIndex() {
            if (!cards.length) return 0;
            var best = 0, bestDist = Infinity;
            var x = track.scrollLeft;
            for (var i = 0; i < cards.length; i++) {
                var d = Math.abs(leftOf(i) - x);
                if (d < bestDist) { bestDist = d; best = i; }
            }
            return best;
        }

        var snapEndTimer = null;

        /* Le moteur de scroll-snap annule parfois un scrollTo fluide vers un
           point d'alignement (bug connu de Chromium et WebKit) : le bouton
           semblait alors sans effet. On coupe le snap pendant le déplacement,
           puis on le rétablit à la fin (événement scrollend, ou délai de
           sécurité s'il n'existe pas). */
        function restoreSnap() {
            track.style.scrollSnapType = "";
            track.classList.remove("is-snap-off");
        }

        function goToIndex(i, smooth) {
            i = Math.max(0, Math.min(cards.length - 1, i));
            if (!cards[i]) return;

            var animate = smooth && !reduce.matches;
            var snapping = "";
            try { snapping = getComputedStyle(track).scrollSnapType || ""; } catch (e) {}
            if (snapping && snapping !== "none") {
                track.style.scrollSnapType = "none";
                track.classList.add("is-snap-off");
            }

            window.clearTimeout(snapEndTimer);
            snapEndTimer = window.setTimeout(restoreSnap, animate ? 750 : 140);
            if ("onscrollend" in window) {
                track.addEventListener("scrollend", function once() {
                    track.removeEventListener("scrollend", once);
                    window.clearTimeout(snapEndTimer);
                    restoreSnap();
                });
            }

            try {
                track.scrollTo({ left: leftOf(i), behavior: animate ? "smooth" : "auto" });
            } catch (err) {
                track.scrollLeft = leftOf(i);   /* navigateurs sans options */
            }

            /* certains navigateurs n'émettent pas `scroll` pour un scrollTo
               instantané : on rafraîchit l'état sans attendre l'événement */
            update();
        }

        /* Un clic = une carte. Un saut de page entière donnait l'impression que
           rien ne se passait près du début (borné à 0) et téléportait ailleurs. */
        function step(dir) {
            goToIndex(nearestIndex() + dir, true);
        }

        /* Nombre de cartes entièrement visibles : sert au saut de page et au compteur */
        function visibleCount() {
            var w = track.clientWidth;
            var st = stride();
            return st > 0 ? Math.max(1, Math.floor(w / st)) : 1;
        }

        function update() {
            var max = maxScroll();
            var x = track.scrollLeft;
            var atStart = x <= 2;
            var atEnd = x >= max - 2;

            if (prev) prev.disabled = atStart;
            if (next) next.disabled = atEnd || max <= 2;

            /* Barre de progression : le curseur a la largeur de la part visible et
               se déplace de 0 à « 100 % – largeur » du rail. */
            if (progress) {
                var ratio = max > 0 ? Math.min(1, Math.max(0, x / max)) : 0;
                var visible = track.scrollWidth > 0
                    ? Math.min(1, track.clientWidth / track.scrollWidth)
                    : 1;
                var widthPct = Math.max(9, visible * 100);   /* jamais plus fin qu'une poignée */
                progress.style.width = widthPct + "%";
                /* translation exprimée en % de la largeur du curseur */
                progress.style.transform = "translateX(" +
                    (max > 0 ? ratio * ((100 - widthPct) / widthPct) * 100 : 0).toFixed(2) + "%)";
            }

            /* Compteur : cartes visibles / total */
            if (counter) {
                var first = nearestIndex() + 1;
                var shown = Math.min(cards.length, first + visibleCount() - 1);
                counter.textContent = (cards.length ? (first === shown ? first : first + "–" + shown) : 0) +
                    " / " + cards.length;
            }
        }

        /* ------------------------------------------------------------------
           Avance automatique
           ------------------------------------------------------------------ */
        function blocked() {
            return userPaused || reduce.matches || document.hidden || !inView
                || hovering || dragging || maxScroll() <= 2;
        }

        /* Un seul minuteur, recalculé à chaque changement d'état : on attend
           exactement la fin de la pause au lieu de sonder toutes les 3 s. */
        function scheduleNext() {
            window.clearTimeout(timer);
            var remaining = interactingUntil - Date.now();
            var wait;
            if (remaining > 0) {
                wait = remaining;            /* pause demandée : on la respecte */
            } else if (blocked()) {
                wait = 600;                  /* survol, hors écran : on re-sonde */
            } else {
                wait = DELAY;                /* cadence normale */
            }
            timer = window.setTimeout(tick, Math.max(80, wait));
        }

        function tick() {
            if (blocked()) {
                /* survol / onglet masqué / hors écran : on réessaie, sans avancer */
                timer = window.setTimeout(tick, 600);
                return;
            }
            /* à la fin, on revient au début plutôt que de rester en butée */
            if (track.scrollLeft >= maxScroll() - 2) goToIndex(0, true);
            else goToIndex(nextIndex(), true);

            /* On attend la fin du déplacement avant de relancer le décompte :
               sinon le temps de lecture est écourté de la durée de la glissade. */
            window.clearTimeout(timer);
            timer = window.setTimeout(scheduleNext, reduce.matches ? 0 : SCROLL_MS);
        }

        /* Prochaine carte hors écran : l'autoplay avance carte par carte,
           une page entière ferait sauter les cartes intermédiaires. */
        function nextIndex() {
            var last = nearestIndex();
            var limit = last + visibleCount();
            var i = last + 1;
            while (i < cards.length && i <= limit && leftOf(i) <= maxScroll() + 1) {
                if (leftOf(i) > track.scrollLeft + 2) return i;
                i++;
            }
            return last + 1;
        }

        /* Pause temporaire : toute interaction repousse la reprise */
        function holdPlayback(ms) {
            interactingUntil = Math.max(interactingUntil, Date.now() + (ms == null ? IDLE_RESUME : ms));
            scheduleNext();
        }

        function syncToggle() {
            if (!toggle) return;
            var paused = userPaused || reduce.matches;
            toggle.setAttribute("aria-pressed", paused ? "true" : "false");
            toggle.setAttribute("aria-label", paused
                ? "Reprendre le défilement automatique"
                : "Mettre le défilement automatique en pause");
            toggle.classList.toggle("is-paused", paused);
        }

        if (toggle) {
            toggle.addEventListener("click", function () {
                userPaused = !userPaused;
                syncToggle();
                if (userPaused) {
                    window.clearTimeout(timer);
                } else {
                    interactingUntil = Date.now() + 800;
                    scheduleNext();
                }
            });
        }

        /* Survol : on met en pause, on reprend quand la souris s'en va */
        track.addEventListener("pointerenter", function (e) {
            if (e.pointerType && e.pointerType !== "mouse") return;
            hovering = true;
        });
        track.addEventListener("pointerleave", function () {
            hovering = false;
            scheduleNext();
        });

        var ticking = false;
        track.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () { update(); ticking = false; });
        }, { passive: true });

        /* Après un clic, on laisse 8 s : le temps de lire la carte atteinte
           avant que l'avance automatique ne reprenne. */
        if (prev) prev.addEventListener("click", function () { holdPlayback(8000); step(-1); });
        if (next) next.addEventListener("click", function () { holdPlayback(8000); step(1); });

        /* Clavier : flèches, Début, Fin, Page précédente/suivante */
        track.addEventListener("keydown", function (e) {
            var k = e.key;
            if (k === "Escape" && toggle && userPaused) {
                userPaused = false; syncToggle(); holdPlayback(); return;
            }
            if (k.indexOf("Arrow") === 0 || k === "Home" || k === "End" ||
                k === "PageUp" || k === "PageDown") {
                holdPlayback();
            }
            if (k === "ArrowRight" || k === "ArrowLeft") {
                e.preventDefault();
                goToIndex(nearestIndex() + (k === "ArrowRight" ? 1 : -1), true);
            } else if (k === "Home") {
                e.preventDefault(); goToIndex(0, true);
            } else if (k === "End") {
                e.preventDefault(); goToIndex(cards.length - 1, true);
            } else if (k === "PageDown") {
                e.preventDefault(); step(1);
            } else if (k === "PageUp") {
                e.preventDefault(); step(-1);
            }
        });

        /* Molette verticale → défilement horizontal, uniquement si le carrousel
           peut encore avancer : sinon la page reprend la main. */
        track.addEventListener("wheel", function (e) {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            var max = maxScroll();
            if (max <= 2) return;
            var goingRight = e.deltaY > 0;
            if ((!goingRight && track.scrollLeft <= 0) || (goingRight && track.scrollLeft >= max)) return;
            e.preventDefault();
            track.scrollLeft = Math.max(0, Math.min(max, track.scrollLeft + e.deltaY));
            update();
            holdPlayback(5000);
        }, { passive: false });

        /* Glisser à la souris (le tactile est déjà géré nativement) */
        var dragging = false, moved = false, startX = 0, startLeft = 0;
        track.addEventListener("pointerdown", function (e) {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            dragging = true; moved = false;
            window.clearTimeout(timer);
            startX = e.clientX; startLeft = track.scrollLeft;
        });
        track.addEventListener("pointermove", function (e) {
            if (!dragging) return;
            var dx = e.clientX - startX;
            if (!moved && Math.abs(dx) > 4) {
                moved = true;
                track.classList.add("is-dragging");
                track.setPointerCapture && track.setPointerCapture(e.pointerId);
            }
            if (moved) track.scrollLeft = startLeft - dx;
        });
        function endDrag() {
            if (!dragging) return;
            dragging = false;
            if (moved) {
                track.classList.remove("is-dragging");
                goToIndex(nearestIndex(), true);
                holdPlayback(5000);
            }
            update();
            scheduleNext();
            moved = false;
        }
        ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
            track.addEventListener(ev, endDrag);
        });

        /* Redimensionnement / chargement des polices : la géométrie change */
        function refresh() { update(); scheduleNext(); }
        window.addEventListener("resize", refresh);
        window.addEventListener("load", refresh);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
        if ("ResizeObserver" in window) {
            new ResizeObserver(refresh).observe(track);
        }

        /* Onglet en arrière-plan : on ne fait pas défiler dans le vide */
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) window.clearTimeout(timer);
            else scheduleNext();
        });

        /* Hors écran : pause ; au retour, on repart */
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    inView = entry.isIntersecting;
                    if (inView) scheduleNext();
                });
            }, { threshold: 0.25 }).observe(track);
        }

        /* Changement de préférence d'animation en cours de session */
        if (reduce.addEventListener) {
            reduce.addEventListener("change", function () { syncToggle(); scheduleNext(); });
        }

        syncToggle();
        update();
        scheduleNext();
    })();

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
