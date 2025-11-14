<template>
  <div
    class="hero-3d-container"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 오른쪽 영역 3D 요소 -->
    <div class="floating-shapes right-shapes" ref="shapesContainer">
      <div
        v-for="(shape, index) in shapes"
        :key="index"
        :class="['shape', `shape-${index}`]"
        :style="getShapeStyle(index)"
      >
        <div class="shape-inner"></div>
      </div>
    </div>

    <div class="gradient-orbs">
      <div class="orb orb-1" ref="orb1"></div>
      <div class="orb orb-2" ref="orb2"></div>
      <div class="orb orb-3" ref="orb3"></div>
    </div>

    <div class="code-blocks" ref="codeBlocks">
      <div class="code-block code-block-1">
        <div class="code-line"></div>
        <div class="code-line"></div>
        <div class="code-line"></div>
      </div>
      <div class="code-block code-block-2">
        <div class="code-line"></div>
        <div class="code-line"></div>
      </div>
      <div class="code-block code-block-3">
        <div class="code-line"></div>
        <div class="code-line"></div>
        <div class="code-line"></div>
        <div class="code-line"></div>
      </div>
    </div>

    <div class="tech-icons" ref="techIcons">
      <div class="tech-icon icon-1">⚛️</div>
      <div class="tech-icon icon-2">📦</div>
      <div class="tech-icon icon-3">🎨</div>
      <div class="tech-icon icon-4">🚀</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const shapesContainer = ref<HTMLElement | null>(null);
const orb1 = ref<HTMLElement | null>(null);
const orb2 = ref<HTMLElement | null>(null);
const orb3 = ref<HTMLElement | null>(null);
const codeBlocks = ref<HTMLElement | null>(null);
const techIcons = ref<HTMLElement | null>(null);

const shapes = ref([
  { x: 20, y: 20, rotation: 0 },
  { x: 60, y: 40, rotation: 45 },
  { x: 30, y: 70, rotation: 90 },
  { x: 75, y: 25, rotation: 135 },
  { x: 50, y: 55, rotation: 180 },
]);

let animationFrameId: number;

const handleMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const moveX = (x - 0.5) * 40;
  const moveY = (y - 0.5) * 40;

  // Orbs 3D parallax effect
  if (orb1.value) {
    orb1.value.style.transform = `translate(${moveX * 0.5}px, ${
      moveY * 0.5
    }px) scale(1.1)`;
  }
  if (orb2.value) {
    orb2.value.style.transform = `translate(${moveX * 0.8}px, ${
      moveY * 0.8
    }px) scale(1.15)`;
  }
  if (orb3.value) {
    orb3.value.style.transform = `translate(${moveX * 0.3}px, ${
      moveY * 0.3
    }px) scale(1.05)`;
  }

  // Shapes parallax
  if (shapesContainer.value) {
    const shapeElements = shapesContainer.value.querySelectorAll(".shape");
    shapeElements.forEach((shape, index) => {
      const depth = (index + 1) * 0.2;
      (shape as HTMLElement).style.transform = `
        translate(${moveX * depth}px, ${moveY * depth}px) 
        rotate(${45 * index + moveX * 0.5}deg)
      `;
    });
  }

  // Code blocks tilt effect
  if (codeBlocks.value) {
    const rotateX = (y - 0.5) * 10;
    const rotateY = (x - 0.5) * 10;
    codeBlocks.value.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // Tech icons 3D rotation
  if (techIcons.value) {
    const icons = techIcons.value.querySelectorAll(".tech-icon");
    icons.forEach((icon, index) => {
      const rotateX = (y - 0.5) * 15 * (index % 2 === 0 ? 1 : -1);
      const rotateY = (x - 0.5) * 15 * (index % 2 === 0 ? 1 : -1);
      (icon as HTMLElement).style.transform = `
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(20px)
      `;
    });
  }
};

const handleMouseLeave = () => {
  // Reset to default positions
  if (orb1.value) orb1.value.style.transform = "translate(0, 0) scale(1)";
  if (orb2.value) orb2.value.style.transform = "translate(0, 0) scale(1)";
  if (orb3.value) orb3.value.style.transform = "translate(0, 0) scale(1)";
  if (codeBlocks.value)
    codeBlocks.value.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0)";

  if (shapesContainer.value) {
    const shapeElements = shapesContainer.value.querySelectorAll(".shape");
    shapeElements.forEach((shape, index) => {
      (shape as HTMLElement).style.transform = `translate(0, 0) rotate(${
        45 * index
      }deg)`;
    });
  }

  if (techIcons.value) {
    const icons = techIcons.value.querySelectorAll(".tech-icon");
    icons.forEach((icon) => {
      (icon as HTMLElement).style.transform =
        "rotateX(0) rotateY(0) translateZ(0)";
    });
  }
};

const getShapeStyle = (index: number) => {
  const shape = shapes.value[index];
  return {
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    animationDelay: `${index * 0.3}s`,
  };
};

const animate = () => {
  // Continuous floating animation
  shapes.value.forEach((shape, index) => {
    shape.rotation += 0.5;
  });

  animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
  animate();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.hero-3d-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: all;
  perspective: 1000px;
}

/* Floating Shapes */
.floating-shapes {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.right-shapes {
  right: 0;
  left: auto;
  width: 50%;
}

.shape {
  position: absolute;
  width: 80px;
  height: 80px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float 6s ease-in-out infinite;
  transform-style: preserve-3d;
}

.shape-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.15),
    rgba(139, 92, 246, 0.15)
  );
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
  animation: shapeRotate 8s linear infinite;
  transform-style: preserve-3d;
}

.shape-0 {
  animation-duration: 7s;
}
.shape-1 {
  animation-duration: 9s;
}
.shape-2 {
  animation-duration: 6s;
}
.shape-3 {
  animation-duration: 8s;
}
.shape-4 {
  animation-duration: 10s;
}

.shape-0 .shape-inner {
  border-radius: 50%;
}
.shape-1 .shape-inner {
  border-radius: 15px;
  width: 60px;
  height: 60px;
}
.shape-2 .shape-inner {
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}
.shape-3 .shape-inner {
  border-radius: 10px;
  width: 50px;
  height: 50px;
}
.shape-4 .shape-inner {
  border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
  width: 70px;
  height: 70px;
}

/* Gradient Orbs */
.gradient-orbs {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent);
  top: 10%;
  right: 15%;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent);
  top: 50%;
  right: 30%;
  animation-delay: 1s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent);
  bottom: 20%;
  right: 10%;
  animation-delay: 2s;
}

/* Code Blocks */
.code-blocks {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-block {
  position: absolute;
  background: rgba(30, 30, 46, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: codeFloat 7s ease-in-out infinite;
}

.code-block-1 {
  top: 15%;
  right: 20%;
  width: 120px;
  animation-delay: 0s;
}

.code-block-2 {
  top: 45%;
  right: 35%;
  width: 100px;
  animation-delay: 1s;
}

.code-block-3 {
  bottom: 25%;
  right: 15%;
  width: 140px;
  animation-delay: 2s;
}

.code-line {
  height: 4px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.6),
    rgba(139, 92, 246, 0.4)
  );
  border-radius: 2px;
  margin: 0.4rem 0;
  animation: codePulse 2s ease-in-out infinite;
}

.code-line:nth-child(1) {
  width: 80%;
  animation-delay: 0s;
}
.code-line:nth-child(2) {
  width: 60%;
  animation-delay: 0.3s;
}
.code-line:nth-child(3) {
  width: 90%;
  animation-delay: 0.6s;
}
.code-line:nth-child(4) {
  width: 70%;
  animation-delay: 0.9s;
}

/* Tech Icons */
.tech-icons {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  z-index: 3;
  transform-style: preserve-3d;
}

.tech-icon {
  position: absolute;
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 46, 0.6);
  border: 2px solid rgba(99, 102, 241, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: iconFloat 5s ease-in-out infinite;
  transform-style: preserve-3d;
  cursor: pointer;
}

.tech-icon:hover {
  transform: scale(1.2) rotateZ(10deg) !important;
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
}

.icon-1 {
  top: 20%;
  right: 25%;
  animation-delay: 0s;
}

.icon-2 {
  top: 40%;
  right: 10%;
  animation-delay: 0.5s;
}

.icon-3 {
  bottom: 35%;
  right: 30%;
  animation-delay: 1s;
}

.icon-4 {
  bottom: 15%;
  right: 18%;
  animation-delay: 1.5s;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(-10px);
  }
  75% {
    transform: translateY(-25px) translateX(5px);
  }
}

@keyframes shapeRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, 20px) scale(1.1);
  }
}

@keyframes codeFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes codePulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotateZ(0deg);
  }
  50% {
    transform: translateY(-10px) rotateZ(5deg);
  }
}

/* 반응형 */
@media (max-width: 1024px) {
  .hero-3d-container {
    width: 100%;
    height: 50%;
    top: auto;
    bottom: 0;
    opacity: 0.5;
  }

  .shape {
    width: 60px;
    height: 60px;
  }

  .code-block {
    width: 80px !important;
  }

  .tech-icon {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }

  .orb {
    filter: blur(40px);
  }
}

@media (max-width: 768px) {
  .hero-3d-container {
    height: 40%;
    opacity: 0.3;
  }

  .shape {
    width: 40px;
    height: 40px;
  }

  .tech-icon {
    display: none;
  }

  .code-block {
    width: 60px !important;
    padding: 0.5rem;
  }
}
</style>
