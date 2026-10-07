<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    default: () => []
  },
  orientation: {
    type: String,
    default: 'vertical',
    validator: (v) => ['vertical', 'horizontal'].includes(v)
  }
});
</script>

<template>
  <div class="app-timeline" :class="`timeline-${orientation}`">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="timeline-item"
      :class="[
        step.type ? `step-${step.type}` : '',
        { 'is-last': index === steps.length - 1 }
      ]"
    >
      <!-- Track & Marker -->
      <div class="timeline-track">
        <slot name="marker" :step="step" :index="index">
          <span
            class="timeline-dot"
            :class="[
              step.type ? `dot-${step.type}` : (index === 0 ? 'dot-origin' : index === steps.length - 1 ? 'dot-destination' : 'dot-checkpoint')
            ]"
          ></span>
        </slot>
        <span v-if="index < steps.length - 1" class="timeline-line"></span>
      </div>

      <!-- Detalle del paso -->
      <div class="timeline-content">
        <slot name="content" :step="step" :index="index">
          <div class="flex align-items-center justify-content-between gap-2">
            <span v-if="step.label" class="step-label text-xs text-secondary font-medium">
              {{ step.label }}
            </span>
            <span v-if="step.time" class="step-time text-xs text-muted">
              {{ step.time }}
            </span>
          </div>

          <strong class="step-name text-sm text-main font-semibold mt-1 block">
            {{ step.name || step.title }}
          </strong>

          <p v-if="step.subtext || step.detail" class="step-subtext text-xs text-muted m-0 mt-1 line-height-2">
            {{ step.subtext || step.detail }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-timeline.timeline-vertical {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  position: relative;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 16px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

/* Tipos de Marcadores */
.dot-origin {
  background: var(--color-brand-teal, #0F7A70);
  box-shadow: 0 0 0 3px rgba(15, 122, 112, 0.15);
}

.dot-destination {
  background: var(--color-alert-red, #E05A46);
  box-shadow: 0 0 0 3px rgba(224, 90, 70, 0.15);
}

.dot-checkpoint {
  background: var(--color-alert-amber, #E89332);
  box-shadow: 0 0 0 3px rgba(232, 147, 50, 0.15);
}

.dot-success {
  background: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
}

.dot-alert {
  background: var(--color-alert-red, #E05A46);
  box-shadow: 0 0 0 3px rgba(224, 90, 70, 0.15);
}

.timeline-line {
  display: block;
  width: 2px;
  min-height: 28px;
  background: var(--border-subtle, #E8E6DF);
  border-radius: 1px;
  margin: 3px 0;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  padding-bottom: 0.95rem;
  flex-grow: 1;
}

.timeline-item.is-last .timeline-content {
  padding-bottom: 0;
}
</style>
