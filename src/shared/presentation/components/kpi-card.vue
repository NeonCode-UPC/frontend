<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  accent: {
    type: String,
    default: 'none', // 'teal', 'red', 'amber', 'mint', 'none'
    validator: (val) => ['teal', 'red', 'amber', 'mint', 'none'].includes(val) || val.startsWith('#')
  },
  icon: {
    type: String,
    default: ''
  },
  subtext: {
    type: String,
    default: ''
  }
});

const borderTopStyle = computed(() => {
  if (props.accent === 'teal') return '3px solid var(--color-brand-teal, #0F7A70)';
  if (props.accent === 'red') return '3px solid var(--color-alert-red, #E05A46)';
  if (props.accent === 'amber') return '3px solid var(--color-alert-amber, #E89332)';
  if (props.accent === 'mint') return '3px solid var(--color-brand-mint, #B9DDA0)';
  if (props.accent && props.accent !== 'none') return `3px solid ${props.accent}`;
  return undefined;
});
</script>

<template>
  <div
    class="kpi-card screen-card p-3 border-round-xl flex flex-column justify-content-between h-full"
    :style="borderTopStyle ? { borderTop: borderTopStyle } : {}"
  >
    <div class="flex justify-content-between align-items-start gap-2">
      <span class="kpi-value text-2xl md:text-3xl font-bold text-main block">
        {{ value }}
      </span>
      <i v-if="icon" :class="[icon, 'text-muted text-base']"></i>
    </div>
    <div class="mt-2">
      <span class="kpi-label text-xs text-muted block font-medium">
        {{ label }}
      </span>
      <span v-if="subtext" class="kpi-subtext text-xs text-secondary mt-1 block">
        {{ subtext }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  min-height: 80px;
}

.kpi-value {
  color: var(--text-main, #10312F);
  letter-spacing: -0.02em;
}

.kpi-label {
  color: var(--text-secondary, #5A706A);
}
</style>
