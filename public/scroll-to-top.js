class ScrollButtons {
  constructor() {
    this.container = null;
    this.topBtn = null;
    this.bottomBtn = null;
    this.isVisible = false;
    this.scrollThreshold = 300;

    this.init();
  }

  init() {
    this.createButtons();
    this.setupEventListeners();
    this.setupThemeWatcher();
    this.handleScroll();
  }

  btnStyle() {
    return `
      width: 2.2rem !important;
      height: 2.2rem !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      transition: background 0.2s ease, opacity 0.15s ease !important;
      padding: 0 !important;
      line-height: 1 !important;
    `;
  }

  createButtons() {
    this.container = document.createElement("div");
    this.container.style.cssText = `
      position: fixed !important;
      bottom: 1.5rem !important;
      right: 1.5rem !important;
      display: flex !important;
      flex-direction: column !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3) !important;
      z-index: 9999 !important;
      opacity: 0 !important;
      transform: translateY(20px) scale(0.85) !important;
      pointer-events: none !important;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    `;

    this.topBtn = document.createElement("button");
    this.topBtn.innerHTML = "↑";
    this.topBtn.setAttribute("aria-label", "페이지 상단으로 이동");
    this.topBtn.style.cssText = this.btnStyle() + `
      border-bottom: 1px solid rgba(255,255,255,0.15) !important;
    `;

    this.bottomBtn = document.createElement("button");
    this.bottomBtn.innerHTML = "↓";
    this.bottomBtn.setAttribute("aria-label", "페이지 하단으로 이동");
    this.bottomBtn.style.cssText = this.btnStyle();

    this.container.appendChild(this.topBtn);
    this.container.appendChild(this.bottomBtn);
    document.body.appendChild(this.container);
  }

  setupEventListeners() {
    this.topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    this.bottomBtn.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => this.handleScroll());

    [this.topBtn, this.bottomBtn].forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        btn.style.setProperty("opacity", "0.85", "important");
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.setProperty("opacity", "1", "important");
      });
      btn.addEventListener("mousedown", () => {
        btn.style.setProperty("transform", "scale(0.93)", "important");
      });
      btn.addEventListener("mouseup", () => {
        btn.style.setProperty("transform", "scale(1)", "important");
      });
    });
  }

  handleScroll() {
    const shouldShow = window.scrollY > this.scrollThreshold;
    if (shouldShow === this.isVisible) return;
    this.isVisible = shouldShow;

    if (this.isVisible) {
      this.container.style.setProperty("opacity", "1", "important");
      this.container.style.setProperty("transform", "translateY(0) scale(1)", "important");
      this.container.style.setProperty("pointer-events", "auto", "important");
    } else {
      this.container.style.setProperty("opacity", "0", "important");
      this.container.style.setProperty("transform", "translateY(20px) scale(0.85)", "important");
      this.container.style.setProperty("pointer-events", "none", "important");
    }
  }

  setTheme(isDark) {
    const bg = isDark
      ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    const shadow = isDark
      ? "0 8px 32px rgba(79, 70, 229, 0.4)"
      : "0 8px 32px rgba(102, 126, 234, 0.3)";

    [this.topBtn, this.bottomBtn].forEach((btn) => {
      btn.style.setProperty("background", bg, "important");
    });
    this.container.style.setProperty("box-shadow", shadow, "important");
  }

  setupThemeWatcher() {
    const update = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.setTheme(isDark);
    };

    new MutationObserver(update).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);
    update();
  }

  destroy() {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

function initScrollButtons() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.scrollButtons = new ScrollButtons();
    });
  } else {
    window.scrollButtons = new ScrollButtons();
  }
}

initScrollButtons();
