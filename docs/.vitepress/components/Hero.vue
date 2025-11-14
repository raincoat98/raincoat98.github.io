<template>
  <section class="custom-hero">
    <Hero3D />

    <div class="hero-content">
      <div class="hero-text-wrapper">
        <h1 class="hero-name">
          <span class="name-text">Raincoat</span>
        </h1>
        <p class="hero-text">프론트엔드 개발자</p>
        <p class="hero-tagline">웹 개발 경험과 지식을 공유합니다</p>

        <div class="hero-actions">
          <a href="/introduce/my-develop" class="action-btn action-btn-primary">
            소개 보기
          </a>
          <a href="/introduce/careers" class="action-btn action-btn-secondary">
            포트폴리오
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Hero3D from "./Hero3D.vue";
</script>

<style scoped>
.custom-hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  padding: 4rem 2rem;
  overflow: visible;
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-text-wrapper {
  position: relative;
  z-index: 11;
  max-width: 600px;
}

.hero-name {
  margin: 0 0 1rem 0;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.8s ease-out;
}

.name-text {
  display: inline-block;
  position: relative;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: var(--vp-c-brand-1);
}

/* fallback for browsers that don't support background-clip */
@supports not (-webkit-background-clip: text) {
  .name-text {
    color: var(--vp-c-brand-1);
    -webkit-text-fill-color: var(--vp-c-brand-1);
  }
}

.hero-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  animation: fadeInUp 0.8s ease-out 0.1s backwards;
}

.hero-tagline {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  margin: 0 0 2rem 0;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.3s backwards;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:hover::before {
  opacity: 1;
}

.action-btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  color: white;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  background: var(--vp-c-brand-2);
}

.action-btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.action-btn-secondary:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .custom-hero {
    min-height: 500px;
    padding: 2rem 1rem;
  }

  .hero-name {
    font-size: 2.5rem;
  }

  .hero-text {
    font-size: 1.5rem;
  }

  .hero-tagline {
    font-size: 1.1rem;
  }

  .action-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .hero-name {
    font-size: 2rem;
  }

  .hero-text {
    font-size: 1.25rem;
  }

  .hero-tagline {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
