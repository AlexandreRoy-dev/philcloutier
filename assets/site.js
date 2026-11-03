(function () {
  document.documentElement.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");

  function setSolid() {
    if (!nav || nav.classList.contains("nav-solid")) return;
    nav.classList.toggle("is-solid", window.scrollY > 24);
  }
  setSolid();
  window.addEventListener("scroll", setSolid, { passive: true });

  function closeMenu() {
    if (!panel || !toggle) return;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    document.body.style.overflow = "";
  }
  function openMenu() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fermer le menu");
    document.body.style.overflow = "hidden";
    const first = panel.querySelector("a");
    if (first) first.focus();
  }
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      if (panel.hidden) openMenu();
      else closeMenu();
    });
    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      if (reduced) {
        window.scrollTo(0, top);
      } else {
        const start = window.scrollY;
        const distance = top - start;
        const duration = 800;
        const t0 = performance.now();
        const step = (now) => {
          const progress = Math.min(1, (now - t0) / duration);
          const eased = progress * (2 - progress);
          window.scrollTo(0, start + distance * eased);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      history.pushState(null, "", "#" + id);
    });
  });

  const animated = document.querySelectorAll("[data-anim]");
  if (reduced || !("IntersectionObserver" in window)) {
    animated.forEach((el) => el.classList.add("is-in"));
  } else {
    window.setTimeout(() => {
      animated.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    }, 1600);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    animated.forEach((el) => {
      const tall = el.getBoundingClientRect().height > window.innerHeight * 0.85;
      if (tall) {
        const loose = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-in");
              loose.unobserve(entry.target);
            });
          },
          { threshold: 0.15 }
        );
        loose.observe(el);
      } else {
        observer.observe(el);
      }
    });
  }

  const layer = document.querySelector(".atmosphere");
  if (layer && !reduced) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 36;
        targetY = (event.clientY / window.innerHeight - 0.5) * 24;
      },
      { passive: true }
    );
    const tick = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      layer.style.transform = "translate3d(" + currentX.toFixed(2) + "px," + currentY.toFixed(2) + "px,0)";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const answer = item.querySelector("dd");
      const open = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-item button").forEach((other) => {
        other.setAttribute("aria-expanded", "false");
        const dd = other.closest(".faq-item").querySelector("dd");
        if (dd) dd.hidden = true;
        const mark = other.querySelector("[aria-hidden]");
        if (mark) mark.textContent = "+";
      });
      if (!open) {
        button.setAttribute("aria-expanded", "true");
        answer.hidden = false;
        const mark = button.querySelector("[aria-hidden]");
        if (mark) mark.textContent = "–";
      }
    });
  });

  const form = document.getElementById("contact-form");
  if (form) {
    const submit = document.getElementById("form-submit");
    const status = document.getElementById("form-status");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submit.disabled = true;
      submit.textContent = "Envoi en cours…";
      status.textContent = "Transmission de votre message…";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Erreur");
        }
        status.textContent = "Message envoyé. Redirection…";
        window.setTimeout(() => {
          window.location.href = "/merci.html";
        }, 800);
      } catch (error) {
        status.textContent = "Une erreur est survenue. Veuillez réessayer ou nous appeler au (438) 495-4079.";
        submit.disabled = false;
        submit.textContent = "Envoyer le message";
      }
    });
  }

  const banner = document.getElementById("cookie-banner");
  const cookieKey = "pc_cookie_consent";
  if (banner && !localStorage.getItem(cookieKey)) {
    window.setTimeout(() => banner.classList.add("show"), 1200);
  }
  const accept = document.getElementById("cookie-accept");
  const reject = document.getElementById("cookie-reject");
  if (accept) {
    accept.addEventListener("click", () => {
      localStorage.setItem(cookieKey, "accepted");
      banner.classList.remove("show");
    });
  }
  if (reject) {
    reject.addEventListener("click", () => {
      localStorage.setItem(cookieKey, "rejected");
      banner.classList.remove("show");
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const reviewGrid = document.getElementById("google-reviews-grid");
  if (reviewGrid) {
    const fallback = {
      profileUrl: "https://www.google.com/maps/place/Philippe+Cloutier+-+Courtier+Immobilier+Saint-Eustache/@45.5671848,-73.9071601,17z",
      reviewUrl: "https://www.google.com/maps/place/Philippe+Cloutier+-+Courtier+Immobilier+Saint-Eustache/@45.5671848,-73.9071601,17z",
      businessName: "Philippe Cloutier, Courtier Immobilier Saint-Eustache",
      averageRating: 5,
      totalReviews: 60,
      reviews: []
    };
    fetch("/google-reviews.json")
      .then((response) => (response.ok ? response.json() : fallback))
      .then((data) => renderReviews(data))
      .catch(() => renderReviews(fallback));

    function renderReviews(data) {
      const profile = data.profileUrl || fallback.profileUrl;
      const reviewUrl = data.reviewUrl || profile;
      const rating = Number(data.averageRating || fallback.averageRating);
      const total = data.totalReviews || fallback.totalReviews;
      const score = document.getElementById("google-rating-score");
      const count = document.getElementById("google-review-count");
      const profileLink = document.getElementById("google-profile-link");
      const reviewsLink = document.getElementById("google-reviews-link");
      const writeLink = document.getElementById("google-write-review-link");
      if (score) score.textContent = rating.toFixed(1);
      if (count) count.textContent = String(total);
      if (profileLink) {
        profileLink.href = profile;
        profileLink.textContent = data.businessName || fallback.businessName;
      }
      if (reviewsLink) reviewsLink.href = profile;
      if (writeLink) writeLink.href = reviewUrl;
      const reviews = data.reviews || [];
      const loading = document.getElementById("google-reviews-loading");
      if (!reviews.length) {
        if (loading) loading.textContent = "Consultez les " + total + " avis sur la fiche Google de Philippe Cloutier.";
        return;
      }
      if (loading) loading.hidden = true;
      reviewGrid.innerHTML = reviews
        .slice(0, 6)
        .map((review) => {
          const stars = "★".repeat(review.rating || 5);
          return (
            '<blockquote class="review"><p>« ' +
            escapeHtml(review.text) +
            " »</p><footer><strong>" +
            escapeHtml(review.author) +
            "</strong>" +
            (review.date ? " · " + escapeHtml(review.date) : "") +
            ' <span class="stars" aria-label="' +
            (review.rating || 5) +
            ' étoiles sur 5">' +
            stars +
            "</span></footer></blockquote>"
          );
        })
        .join("");
    }
  }

  const shareUrl = "https://philippecloutier.net/";
  const shareTitle = "Philippe Cloutier | Courtier immobilier, Saint-Eustache";
  const shareText = "Philippe Cloutier, courtier immobilier résidentiel RE/MAX CRYSTAL à Saint-Eustache.";
  const setHref = (id, href) => {
    const node = document.getElementById(id);
    if (node) node.href = href;
  };
  setHref("share-facebook", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrl));
  setHref("share-linkedin", "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl));
  setHref("share-whatsapp", "https://wa.me/?text=" + encodeURIComponent(shareText + " " + shareUrl));
  setHref("share-email", "mailto:?subject=" + encodeURIComponent(shareTitle) + "&body=" + encodeURIComponent(shareText + "\n\n" + shareUrl));
  const nativeBtn = document.getElementById("share-native");
  if (nativeBtn && navigator.share) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener("click", () => {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(() => {});
    });
  }
  const copyBtn = document.getElementById("share-copy");
  const copyLabel = document.getElementById("share-copy-label");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (error) {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      if (copyLabel) {
        copyLabel.textContent = "Lien copié";
        window.setTimeout(() => {
          copyLabel.textContent = "Copier le lien";
        }, 2000);
      }
    });
  }

  const grid = document.querySelector("[data-listing-grid]");
  if (grid) {
    const cards = Array.from(grid.querySelectorAll(".card"));
    const city = document.getElementById("filter-city");
    const kind = document.getElementById("filter-kind");
    const status = document.getElementById("filter-status");
    const price = document.getElementById("filter-price");
    const count = document.getElementById("result-count");
    const empty = document.getElementById("listing-empty");
    const reset = document.getElementById("filter-reset");

    const apply = () => {
      let visible = 0;
      cards.forEach((card) => {
        let show = true;
        if (city && city.value && card.dataset.city !== city.value) show = false;
        if (kind && kind.value && card.dataset.kind !== kind.value) show = false;
        if (status && status.value === "visite-libre" && card.dataset.openHouse !== "1") show = false;
        if (status && status.value && status.value !== "visite-libre" && card.dataset.status !== status.value) show = false;
        if (price && price.value) {
          if (card.dataset.priceKind !== "sale" || !card.dataset.price) {
            show = false;
          } else {
            const amount = Number(card.dataset.price);
            const [minRaw, maxRaw] = price.value.split("-");
            const min = Number(minRaw || 0);
            const max = maxRaw === "" || maxRaw == null ? Infinity : Number(maxRaw);
            if (amount < min || amount >= max) show = false;
          }
        }
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) {
        count.textContent = visible + (visible > 1 ? " propriétés" : " propriété");
      }
      if (empty) empty.hidden = visible !== 0;
      const params = new URLSearchParams();
      if (city && city.value) params.set("ville", city.value);
      if (kind && kind.value) params.set("type", kind.value);
      if (status && status.value) params.set("statut", status.value);
      if (price && price.value) params.set("prix", price.value);
      const next = params.toString();
      history.replaceState(null, "", next ? "?" + next : window.location.pathname);
    };

    const params = new URLSearchParams(window.location.search);
    if (city && params.get("ville")) city.value = params.get("ville");
    if (kind && params.get("type")) kind.value = params.get("type");
    if (status && params.get("statut")) status.value = params.get("statut");
    if (price && params.get("prix")) price.value = params.get("prix");
    [city, kind, status, price].forEach((node) => node && node.addEventListener("change", apply));
    if (reset) {
      reset.addEventListener("click", () => {
        [city, kind, status, price].forEach((node) => {
          if (node) node.value = "";
        });
        apply();
      });
    }
    apply();
  }

  const mainPhoto = document.getElementById("gallery-main");
  document.querySelectorAll("[data-gallery-src]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!mainPhoto) return;
      mainPhoto.src = button.dataset.gallerySrc;
      mainPhoto.alt = button.dataset.galleryAlt || mainPhoto.alt;
      document.querySelectorAll("[data-gallery-src]").forEach((other) => {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
    });
  });
})();
