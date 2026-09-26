(() => {
  const secondaryLinks = [
    ["testimonials.html", "Testimonials"],
    ["events.html", "Events"],
    ["store.html", "Store"],
  ];

  document.querySelectorAll(".footer-nav").forEach((footerNav) => {
    secondaryLinks.forEach(([href, label]) => {
      if (footerNav.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      footerNav.append(link);
    });
  });

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");

  if (nav) {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const currentLink = nav.querySelector(`a[href="${currentFile}"]`);
    currentLink?.setAttribute("aria-current", "page");
    if (["testimonials.html", "events.html", "store.html"].includes(currentFile)) {
      nav.querySelector(".nav-more summary")?.setAttribute("aria-current", "page");
    }
  }

  const closeNavigation = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
    document.body.classList.remove("nav-open");
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const willOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", willOpen);
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navToggle.textContent = willOpen ? "Close" : "Menu";
      document.body.classList.toggle("nav-open", willOpen);
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
  }

  document.querySelectorAll("[data-announcement-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".announcement-slide")];
    const previous = carousel.querySelector("[data-carousel-previous]");
    const next = carousel.querySelector("[data-carousel-next]");
    const pause = carousel.querySelector("[data-carousel-pause]");
    const status = carousel.querySelector(".announcement-carousel__status");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let paused = reducedMotion;
    let timer;

    if (pause && paused) {
      pause.setAttribute("aria-pressed", "true");
      pause.textContent = "Play";
      pause.setAttribute("aria-label", "Play announcements");
    }

    const showSlide = (index, announce = true) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.hidden = !active;
        slide.classList.toggle("is-active", active);
      });
      if (announce && status) status.textContent = `Showing announcement ${current + 1} of ${slides.length}`;
    };

    const stopTimer = () => window.clearInterval(timer);
    const startTimer = () => {
      stopTimer();
      if (!paused && slides.length > 1) timer = window.setInterval(() => showSlide(current + 1, false), 7000);
    };

    previous?.addEventListener("click", () => { showSlide(current - 1); startTimer(); });
    next?.addEventListener("click", () => { showSlide(current + 1); startTimer(); });
    pause?.addEventListener("click", () => {
      paused = !paused;
      pause.setAttribute("aria-pressed", String(paused));
      pause.textContent = paused ? "Play" : "Pause";
      pause.setAttribute("aria-label", paused ? "Play announcements" : "Pause announcements");
      startTimer();
    });
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    carousel.addEventListener("focusin", stopTimer);
    carousel.addEventListener("focusout", startTimer);
    showSlide(0, false);
    startTimer();
  });

  const updatePagePosition = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    if (document.body.classList.contains("page-home")) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
    }
  };
  updatePagePosition();
  window.addEventListener("scroll", updatePagePosition, { passive: true });

  document.querySelectorAll("[data-cycle]").forEach((cycle) => {
    const tabs = [...cycle.querySelectorAll('[role="tab"]')];
    const panels = [...cycle.querySelectorAll('[role="tabpanel"]')];

    const selectTab = (tab, moveFocus = false) => {
      tabs.forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute("aria-selected", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[nextIndex], true);
      });
    });
  });

  const requestedInterest = new URLSearchParams(window.location.search).get("interest");
  const interestSelect = document.querySelector("[data-interest]");
  if (interestSelect && requestedInterest) {
    const hasOption = [...interestSelect.options].some((option) => option.value === requestedInterest);
    if (hasOption) interestSelect.value = requestedInterest;
  }

  const makeEventImage = (event) => {
    const image = document.createElement("img");
    image.src = event.image;
    image.alt = event.imageAlt || "";
    image.width = event.imageWidth || 1280;
    image.height = event.imageHeight || 720;
    image.loading = "lazy";
    return image;
  };

  const renderHomeEvent = (event) => {
    const region = document.querySelector("[data-events-home]");
    if (!region || !event) return;
    const replacements = [
      ["h2", event.title],
      [".announcement-slide__index", event.dateLabel],
      [".announcement-slide__copy h3", event.summary],
      [".announcement-slide__copy p", `${event.time}\n${event.location}`],
    ];
    replacements.forEach(([selector, value]) => {
      const element = region.querySelector(selector);
      if (element) element.textContent = value;
    });
    region.querySelector(".announcement-slide__visual")?.replaceChildren(makeEventImage(event));
  };

  const renderEventList = (events) => {
    const region = document.querySelector("[data-events-list]");
    if (!region || !events.length) return;
    const sections = events.map((event, index) => {
      const section = document.createElement("section");
      section.className = "page-shell section section-rule editorial-grid event-feature";
      const figure = document.createElement("figure");
      figure.className = "event-feature__poster";
      figure.append(makeEventImage(event));
      const caption = document.createElement("figcaption");
      caption.className = "caption";
      caption.textContent = event.caption || "Current event";
      figure.append(caption);
      const copy = document.createElement("div");
      copy.className = "event-feature__details";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Current event";
      const title = document.createElement("h2");
      title.id = `event-${index + 1}`;
      title.textContent = event.title;
      section.setAttribute("aria-labelledby", title.id);
      const date = document.createElement("p");
      date.className = "event-date";
      date.append(document.createTextNode(event.dateLabel));
      const time = document.createElement("span");
      time.textContent = event.time;
      date.append(time);
      const location = document.createElement("p");
      location.textContent = event.location;
      const description = document.createElement("p");
      description.textContent = event.description;
      const actions = document.createElement("div");
      actions.className = "actions";
      const link = document.createElement("a");
      link.className = "button";
      link.href = event.buttonLink;
      link.textContent = event.buttonLabel || "Event details";
      if (/^https?:/.test(event.buttonLink)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      actions.append(link);
      copy.append(eyebrow, title, date, location, description, actions);
      section.append(figure, copy);
      return section;
    });
    region.replaceChildren(...sections);
  };

  if (document.querySelector("[data-events-home], [data-events-list]")) {
    fetch("content/events.json")
      .then((response) => {
        if (!response.ok) throw new Error("Event data unavailable");
        return response.json();
      })
      .then(({ events = [] }) => {
        const current = events
          .filter((event) => event.status === "current")
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        renderHomeEvent(current.find((event) => event.showOnHome) || current[0]);
        renderEventList(current);
      })
      .catch(() => { /* Keep the HTML fallback during file-only previews. */ });
  }

  if (document.querySelector("[data-product-id]")) {
    fetch("content/products.json")
      .then((response) => {
        if (!response.ok) throw new Error("Product data unavailable");
        return response.json();
      })
      .then(({ products = [] }) => {
        products.forEach((product) => {
          const row = document.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
          if (!row) return;
          const price = row.querySelector(".store-row__price");
          const action = row.querySelector("[data-product-action]");
          if (price) price.textContent = product.priceDisplay;
          if (action && product.checkoutUrl) {
            action.href = product.checkoutUrl;
            action.textContent = product.checkoutLabel || "Buy securely";
            action.target = "_blank";
            action.rel = "noopener noreferrer";
          }
        });
      })
      .catch(() => { /* Keep email-order fallbacks if checkout data is unavailable. */ });
  }

  document.querySelectorAll("[data-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
