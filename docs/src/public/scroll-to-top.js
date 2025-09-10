/**
 * ScrollToTop 버튼 컴포넌트
 * 트렌디한 디자인의 상단으로 가는 버튼
 */

class ScrollToTopButton {
  constructor() {
    this.button = null;
    this.isVisible = false;
    this.scrollThreshold = 300;

    this.init();
  }

  init() {
    console.log("ScrollToTop 버튼 초기화 시작");
    this.createButton();
    this.setupEventListeners();
    this.setupThemeWatcher();
    this.handleScroll(); // 초기 상태 확인
  }

  createButton() {
    // 버튼 요소 생성
    this.button = document.createElement("button");
    this.button.innerHTML = "↑";
    this.button.className = "scroll-to-top-btn";
    this.button.setAttribute("aria-label", "페이지 상단으로 이동");
    this.button.setAttribute("title", "페이지 상단으로 이동");

    // 트렌디한 스타일 설정
    this.button.style.cssText = `
      position: fixed !important;
      bottom: 2rem !important;
      right: 2rem !important;
      width: 3.5rem !important;
      height: 3.5rem !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3) !important;
      z-index: 9999 !important;
      font-size: 1.2rem !important;
      font-weight: 600 !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      opacity: 0 !important;
      transform: translateY(30px) scale(0.8) !important;
      pointer-events: none !important;
    `;

    // DOM에 추가
    document.body.appendChild(this.button);
    console.log("ScrollToTop 버튼이 DOM에 추가됨:", this.button);
  }

  setupEventListeners() {
    // 스크롤 기능
    this.button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    // 스크롤 감지
    window.addEventListener("scroll", () => this.handleScroll());

    // 호버 효과
    this.button.addEventListener("mouseenter", () => this.handleMouseEnter());
    this.button.addEventListener("mouseleave", () => this.handleMouseLeave());

    // 클릭 효과
    this.button.addEventListener("mousedown", () => this.handleMouseDown());
    this.button.addEventListener("mouseup", () => this.handleMouseUp());
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const shouldShow = scrollY > this.scrollThreshold;
    console.log("스크롤 위치:", scrollY, "버튼 표시:", shouldShow);

    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      if (this.isVisible) {
        console.log("버튼 표시");
        this.showButton();
      } else {
        console.log("버튼 숨김");
        this.hideButton();
      }
    }
  }

  showButton() {
    this.button.style.setProperty("opacity", "1", "important");
    this.button.style.setProperty(
      "transform",
      "translateY(0) scale(1)",
      "important"
    );
    this.button.style.setProperty("pointer-events", "auto", "important");
  }

  hideButton() {
    this.button.style.setProperty("opacity", "0", "important");
    this.button.style.setProperty(
      "transform",
      "translateY(30px) scale(0.8)",
      "important"
    );
    this.button.style.setProperty("pointer-events", "none", "important");
  }

  handleMouseEnter() {
    if (this.isVisible) {
      this.button.style.setProperty(
        "background",
        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
        "important"
      );
      this.button.style.setProperty(
        "transform",
        "translateY(-4px) scale(1.05)",
        "important"
      );
      this.button.style.setProperty(
        "box-shadow",
        "0 12px 40px rgba(102, 126, 234, 0.4)",
        "important"
      );
      this.button.style.setProperty(
        "border",
        "1px solid rgba(255, 255, 255, 0.3)",
        "important"
      );
    }
  }

  handleMouseLeave() {
    if (this.isVisible) {
      this.button.style.setProperty(
        "background",
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "important"
      );
      this.button.style.setProperty(
        "transform",
        "translateY(0) scale(1)",
        "important"
      );
      this.button.style.setProperty(
        "box-shadow",
        "0 8px 32px rgba(102, 126, 234, 0.3)",
        "important"
      );
      this.button.style.setProperty(
        "border",
        "1px solid rgba(255, 255, 255, 0.2)",
        "important"
      );
    }
  }

  handleMouseDown() {
    if (this.isVisible) {
      this.button.style.setProperty(
        "transform",
        "translateY(-2px) scale(0.95)",
        "important"
      );
    }
  }

  handleMouseUp() {
    if (this.isVisible) {
      this.button.style.setProperty(
        "transform",
        "translateY(-4px) scale(1.05)",
        "important"
      );
    }
  }

  setupThemeWatcher() {
    // 다크 모드 감지 및 스타일 적용
    const updateTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (isDark) {
        this.button.style.setProperty(
          "background",
          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          "important"
        );
        this.button.style.setProperty(
          "box-shadow",
          "0 8px 32px rgba(79, 70, 229, 0.4)",
          "important"
        );
        this.button.style.setProperty(
          "border",
          "1px solid rgba(255, 255, 255, 0.1)",
          "important"
        );
      } else {
        this.button.style.setProperty(
          "background",
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "important"
        );
        this.button.style.setProperty(
          "box-shadow",
          "0 8px 32px rgba(102, 126, 234, 0.3)",
          "important"
        );
        this.button.style.setProperty(
          "border",
          "1px solid rgba(255, 255, 255, 0.2)",
          "important"
        );
      }
    };

    // 다크 모드 변경 감지
    const darkModeObserver = new MutationObserver(updateTheme);
    darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 미디어 쿼리 변경 감지
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateTheme);

    // 초기 테마 적용
    updateTheme();
  }

  // 공개 메서드들
  setScrollThreshold(threshold) {
    this.scrollThreshold = threshold;
  }

  destroy() {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }
  }
}

// 페이지 로드 후 자동 초기화
function initScrollToTopButton() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.scrollToTopButton = new ScrollToTopButton();
    });
  } else {
    window.scrollToTopButton = new ScrollToTopButton();
  }
}

// 전역 초기화 함수 실행
initScrollToTopButton();
