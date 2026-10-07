<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true,
    // Cada elemento: { label: string, value: any, icon?: string, badge?: string, count?: number, danger?: boolean }
    default: () => []
  },
  variant: {
    type: String,
    default: 'solid', // 'solid', 'subtle', 'segmented'
    validator: (v) => ['solid', 'subtle', 'segmented'].includes(v)
  },
  size: {
    type: String,
    default: 'sm', // 'sm', 'md'
    validator: (v) => ['sm', 'md'].includes(v)
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

function selectOption(value) {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <div
    class="pill-tabs-container flex align-items-center gap-1"
    :class="[`variant-${variant}`, `size-${size}`]"
    role="tablist"
  >
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      role="tab"
      :aria-selected="modelValue === opt.value"
      class="pill-tab-btn"
      :class="{
        'is-active': modelValue === opt.value,
        'has-danger': opt.danger
      }"
      @click="selectOption(opt.value)"
    >
      <i v-if="opt.icon" :class="[opt.icon, 'tab-icon']"></i>
      <span class="tab-label">{{ opt.label }}</span>
      <span v-if="opt.badge != null || opt.count != null" class="tab-badge">
        {{ opt.badge ?? opt.count }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.pill-tabs-container {
  display: inline-flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.pill-tabs-container::-webkit-scrollbar {
  display: none;
}

/* Variant: Segmented (Contenedor agrupado gris suave) */
.pill-tabs-container.variant-segmented {
  background-color: #ECEAE1;
  padding: 3px;
  border-radius: 9999px;
}

.pill-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  transition: all 0.15s ease;
  user-select: none;
}

/* Size: SM */
.size-sm .pill-tab-btn {
  padding: 0.32rem 0.75rem;
  font-size: 0.75rem;
}

/* Size: MD */
.size-md .pill-tab-btn {
  padding: 0.45rem 0.95rem;
  font-size: 0.8125rem;
}

/* Variant: Solid (Defecto) */
.variant-solid .pill-tab-btn {
  color: var(--text-secondary, #5A706A);
}

.variant-solid .pill-tab-btn:hover {
  background-color: var(--bg-card-subtle, #F9F8F5);
  color: var(--text-main, #10312F);
}

.variant-solid .pill-tab-btn.is-active {
  background-color: var(--color-brand-dark, #10312F);
  color: #FFFFFF;
  border-color: var(--color-brand-dark, #10312F);
}

.variant-solid .pill-tab-btn.is-active i {
  color: var(--color-brand-mint, #B9DDA0);
}

.variant-solid .pill-tab-btn.has-danger.is-active {
  background-color: var(--color-alert-red, #E05A46) !important;
  border-color: var(--color-alert-red, #E05A46) !important;
  color: #FFFFFF !important;
}

/* Variant: Segmented Active */
.variant-segmented .pill-tab-btn {
  color: var(--text-secondary, #5A706A);
}

.variant-segmented .pill-tab-btn.is-active {
  background-color: #FFFFFF;
  color: var(--text-main, #10312F);
  box-shadow: 0 1px 3px rgba(16, 49, 47, 0.08);
}

/* Badges */
.tab-badge {
  font-size: 0.6875rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgba(185, 221, 160, 0.2);
  color: var(--color-brand-teal, #0F7A70);
  font-weight: 700;
}

.pill-tab-btn.is-active .tab-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}
</style>
