<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    required: true,
    default: 100
  },
  variant: {
    type: String,
    default: 'capsule', // 'capsule', 'bar', 'compact'
    validator: (v) => ['capsule', 'bar', 'compact'].includes(v)
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  warningThreshold: {
    type: Number,
    default: 30
  },
  criticalThreshold: {
    type: Number,
    default: 15
  }
});

const clampedLevel = computed(() => {
  if (props.level == null || isNaN(props.level)) return 0;
  return Math.min(100, Math.max(0, Math.round(props.level)));
});

const colorClass = computed(() => {
  if (clampedLevel.value <= props.criticalThreshold) return 'bat-critical';
  if (clampedLevel.value <= props.warningThreshold) return 'bat-warning';
  return 'bat-normal';
});
</script>

<template>
  <div class="battery-gauge-wrapper inline-flex align-items-center gap-2">
    <!-- Variante 1: Cápsula (para tablas) -->
    <div
      v-if="variant === 'capsule'"
      class="battery-capsule"
      :title="`Batería: ${clampedLevel}%`"
    >
      <div
        class="battery-fill"
        :class="colorClass"
        :style="{ width: `${clampedLevel}%` }"
      ></div>
    </div>

    <!-- Variante 2: Barra (para tarjetas KPI) -->
    <div
      v-else-if="variant === 'bar'"
      class="battery-bar flex-grow-1"
      :title="`Batería: ${clampedLevel}%`"
    >
      <div
        class="battery-fill"
        :class="colorClass"
        :style="{ width: `${clampedLevel}%` }"
      ></div>
    </div>

    <!-- Variante 3: Compact con icono -->
    <div
      v-else-if="variant === 'compact'"
      class="battery-compact flex align-items-center gap-1"
    >
      <i
        class="pi"
        :class="[
          clampedLevel <= criticalThreshold ? 'pi-bolt text-red' : 'pi-bolt text-teal'
        ]"
      ></i>
      <span class="text-xs font-semibold text-main">{{ clampedLevel }}%</span>
    </div>

    <!-- Etiqueta de porcentaje opcional -->
    <span v-if="showLabel && variant !== 'compact'" class="battery-label text-xs font-medium text-main">
      {{ clampedLevel }}%
    </span>
  </div>
</template>

<style scoped>
.battery-gauge-wrapper {
  vertical-align: middle;
}

/* Cápsula de Tabla */
.battery-capsule {
  width: 44px;
  height: 12px;
  background-color: #ECEEEB;
  border-radius: 6px;
  padding: 2px;
  position: relative;
  display: flex;
  align-items: center;
}

/* Barra de KPI */
.battery-bar {
  height: 8px;
  background-color: #ECEEEB;
  border-radius: 4px;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bat-normal {
  background-color: #10B981;
}

.bat-warning {
  background-color: #F59E0B;
}

.bat-critical {
  background-color: #EF4444;
}

.text-red {
  color: #EF4444;
}

.text-teal {
  color: var(--color-brand-teal, #0F7A70);
}
</style>
