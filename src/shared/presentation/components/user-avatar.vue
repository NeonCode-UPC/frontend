<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: ''
  },
  size: {
    type: String,
    default: 'sm', // 'sm' (28px), 'md' (34px), 'lg' (42px)
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  variant: {
    type: String,
    default: 'teal', // 'teal', 'subtle'
    validator: (v) => ['teal', 'subtle'].includes(v)
  }
});

const initials = computed(() => {
  if (!props.name || typeof props.name !== 'string') return '--';
  const parts = props.name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
});
</script>

<template>
  <div
    class="user-avatar-badge flex align-items-center justify-content-center flex-shrink-0"
    :class="[`size-${size}`, `variant-${variant}`]"
    :title="name"
  >
    <span>{{ initials }}</span>
  </div>
</template>

<style scoped>
.user-avatar-badge {
  border-radius: 50%;
  font-weight: 700;
  user-select: none;
  letter-spacing: 0.02em;
}

/* Tamaños */
.size-sm {
  width: 28px;
  height: 28px;
  font-size: 0.6875rem;
}

.size-md {
  width: 34px;
  height: 34px;
  font-size: 0.75rem;
}

.size-lg {
  width: 42px;
  height: 42px;
  font-size: 0.875rem;
}

/* Variantes */
.variant-teal {
  background-color: var(--color-brand-mint-subtle, #EAF7EE);
  color: var(--color-brand-teal, #0F7A70);
  border: 1px solid rgba(15, 122, 112, 0.2);
}

.variant-subtle {
  background-color: #ECEAE1;
  color: var(--text-main, #10312F);
}
</style>
