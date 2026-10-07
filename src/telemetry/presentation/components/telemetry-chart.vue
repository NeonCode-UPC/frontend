<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  /**
   * Array of telemetry logs or data points: [{ time: string, temperature: number, isExcursion?: boolean }]
   */
  data: {
    type: Array,
    default: () => []
  },
  height: {
    type: Number,
    default: 130
  },
  showXAxis: {
    type: Boolean,
    default: false
  },
  xLabels: {
    type: Array,
    default: () => []
  },
  isExcursion: {
    type: Boolean,
    default: false
  },
  safeMin: {
    type: Number,
    default: 2.0
  },
  safeMax: {
    type: Number,
    default: 8.0
  },
  interactive: {
    type: Boolean,
    default: true
  }
});

// ViewBox width for high resolution SVG
const svgWidth = 600;
const padding = { top: 16, right: 28, bottom: 24, left: 40 };

const chartWidth = computed(() => svgWidth - padding.left - padding.right);
const chartHeight = computed(() => props.height - padding.top - padding.bottom);

// Min and Max temperature scales
const tempMin = computed(() => 1.5);
const tempMax = computed(() => {
  const maxInData = props.data.length ? Math.max(...props.data.map(d => d.temperature || 0)) : 8.0;
  return Math.max(10.0, maxInData + 0.8);
});

// Coordinate conversion helpers
function getX(index, total) {
  if (total <= 1) return padding.left + chartWidth.value / 2;
  return padding.left + (index / (total - 1)) * chartWidth.value;
}

function getY(temp) {
  const range = tempMax.value - tempMin.value;
  const ratio = (temp - tempMin.value) / range;
  // In SVG, y is inverted: high temp is smaller y
  return padding.top + chartHeight.value - (ratio * chartHeight.value);
}

// Y position for safe bounds (8°C and 2°C)
const safeMaxY = computed(() => getY(props.safeMax));
const safeMinY = computed(() => getY(props.safeMin));

// Calculated points
const points = computed(() => {
  if (!props.data || props.data.length === 0) return [];
  const total = props.data.length;
  return props.data.map((item, index) => ({
    x: getX(index, total),
    y: getY(item.temperature),
    temp: item.temperature,
    time: item.time,
    isCritical: item.temperature > props.safeMax || item.isExcursion
  }));
});

// Smooth Catmull-Rom to Cubic Bezier curve algorithm
const curvePath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
});

// Area fill path closing down to safeMin baseline
const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  const baseline = getY(tempMin.value);

  return `${curvePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
});

// Last point for marker
const lastPoint = computed(() => {
  if (points.value.length === 0) return null;
  return points.value[points.value.length - 1];
});

// Interactive hover tracking
const hoveredIndex = ref(null);
const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !points.value[hoveredIndex.value]) return null;
  return points.value[hoveredIndex.value];
});

function handleMouseMove(event) {
  if (!props.interactive || points.value.length === 0) return;
  const svg = event.currentTarget;
  const rect = svg.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * svgWidth;

  // Find nearest point
  let closestIdx = 0;
  let minDist = Infinity;
  points.value.forEach((pt, idx) => {
    const dist = Math.abs(pt.x - mouseX);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });
  hoveredIndex.value = closestIdx;
}

function handleMouseLeave() {
  hoveredIndex.value = null;
}
</script>

<template>
  <div class="telemetry-chart-container relative select-none">
    <svg
      :viewBox="`0 0 ${svgWidth} ${height}`"
      preserveAspectRatio="none"
      class="w-full h-full block"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <defs>
        <!-- Safe Normal Fill Gradient -->
        <linearGradient id="safeAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0F7A70" stop-opacity="0.22" />
          <stop offset="70%" stop-color="#B9DDA0" stop-opacity="0.10" />
          <stop offset="100%" stop-color="#B9DDA0" stop-opacity="0.01" />
        </linearGradient>

        <!-- Critical Excursion Gradient -->
        <linearGradient id="criticalAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E05A46" stop-opacity="0.30" />
          <stop offset="60%" stop-color="#E89332" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#B9DDA0" stop-opacity="0.02" />
        </linearGradient>

        <!-- Stroke Gradient for Excursion transition -->
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0F7A70" />
          <stop offset="60%" stop-color="#0F7A70" />
          <stop offset="85%" stop-color="#E05A46" />
          <stop offset="100%" stop-color="#E05A46" />
        </linearGradient>
      </defs>

      <!-- Horizontal 8°C Dotted Safe Threshold Line -->
      <line
        :x1="padding.left"
        :y1="safeMaxY"
        :x2="svgWidth - padding.right"
        :y2="safeMaxY"
        stroke="#E05A46"
        stroke-width="1.2"
        stroke-dasharray="3 3"
        opacity="0.65"
      />
      <!-- 8°C Label -->
      <text
        :x="padding.left - 6"
        :y="safeMaxY + 3"
        text-anchor="end"
        class="chart-label-threshold"
      >
        8 °C
      </text>

      <!-- 2°C Baseline Label -->
      <text
        :x="padding.left - 6"
        :y="safeMinY + 3"
        text-anchor="end"
        class="chart-label-baseline"
      >
        2 °C
      </text>

      <!-- Area Fill Under Curve -->
      <path
        v-if="areaPath"
        :d="areaPath"
        :fill="isExcursion ? 'url(#criticalAreaGradient)' : 'url(#safeAreaGradient)'"
      />

      <!-- Main Temperature Curve -->
      <path
        v-if="curvePath"
        :d="curvePath"
        :stroke="isExcursion ? 'url(#strokeGradient)' : '#0F7A70'"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Last Data Point Dot / Marker -->
      <g v-if="lastPoint">
        <circle
          :cx="lastPoint.x"
          :cy="lastPoint.y"
          :r="isExcursion || lastPoint.isCritical ? 5 : 3.5"
          :fill="isExcursion || lastPoint.isCritical ? '#E05A46' : '#0F7A70'"
        />
        <circle
          v-if="isExcursion || lastPoint.isCritical"
          :cx="lastPoint.x"
          :cy="lastPoint.y"
          r="8"
          fill="none"
          stroke="#E05A46"
          stroke-width="1.5"
          opacity="0.4"
          class="pulse-ring"
        />
      </g>

      <!-- Hover Guide Line & Circle -->
      <g v-if="hoveredPoint">
        <line
          :x1="hoveredPoint.x"
          :y1="padding.top"
          :x2="hoveredPoint.x"
          :y2="getY(tempMin)"
          stroke="#10312F"
          stroke-width="1"
          stroke-dasharray="2 2"
          opacity="0.5"
        />
        <circle
          :cx="hoveredPoint.x"
          :cy="hoveredPoint.y"
          r="5"
          :fill="hoveredPoint.isCritical ? '#E05A46' : '#0F7A70'"
          stroke="#FFFFFF"
          stroke-width="2"
        />
      </g>

      <!-- Optional Bottom X-Axis Time Labels -->
      <g v-if="showXAxis && xLabels.length">
        <text
          v-for="(label, idx) in xLabels"
          :key="idx"
          :x="getX(idx, xLabels.length)"
          :y="height - 6"
          text-anchor="middle"
          class="chart-x-label"
        >
          {{ label }}
        </text>
      </g>
    </svg>

    <!-- Floating Interactive Tooltip -->
    <div
      v-if="hoveredPoint"
      class="chart-tooltip pointer-events-none"
      :style="{
        left: `${(hoveredPoint.x / svgWidth) * 100}%`,
        top: `${(hoveredPoint.y / height) * 100}%`
      }"
    >
      <div class="tooltip-body shadow-2">
        <span class="tooltip-time">{{ hoveredPoint.time }}</span>
        <strong :class="hoveredPoint.isCritical ? 'text-red' : 'text-teal'">
          {{ hoveredPoint.temp.toFixed(1) }} °C
        </strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.telemetry-chart-container {
  width: 100%;
  height: 100%;
  min-height: 90px;
}

.chart-label-threshold {
  font-size: 8.5px;
  fill: #E05A46;
  font-weight: 600;
  font-family: inherit;
}

.chart-label-baseline {
  font-size: 8.5px;
  fill: #8C9E99;
  font-weight: 500;
  font-family: inherit;
}

.chart-x-label {
  font-size: 9px;
  fill: #5A706A;
  font-weight: 500;
  font-family: inherit;
}

.pulse-ring {
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  transform-origin: center;
}

@keyframes pulse-ring {
  0% {
    r: 5px;
    opacity: 0.8;
  }
  70% {
    r: 10px;
    opacity: 0;
  }
  100% {
    r: 10px;
    opacity: 0;
  }
}

.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -120%);
  z-index: 10;
  transition: transform 0.08s ease;
}

.tooltip-body {
  background: rgba(16, 49, 47, 0.94);
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tooltip-time {
  font-size: 0.62rem;
  color: #B8CBC6;
}

.text-red {
  color: #FF8573 !important;
}

.text-teal {
  color: #B9DDA0 !important;
}
</style>
