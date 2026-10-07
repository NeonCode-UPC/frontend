<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  interactive: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'p-4'
  },
  rounded: {
    type: String,
    default: 'border-round-xl'
  }
});
</script>

<template>
  <div
    :class="[
      interactive ? 'screen-card-interactive cursor-pointer' : 'screen-card',
      rounded,
      padding
    ]"
  >
    <!-- Header opcional si hay título, subtítulo o slots de cabecera -->
    <header
      v-if="title || subtitle || $slots.header || $slots['header-actions']"
      class="card-header flex justify-content-between align-items-start gap-3 mb-3"
    >
      <slot name="header">
        <div>
          <h3 v-if="title" class="m-0 text-base md:text-lg font-bold text-main">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="m-0 mt-1 text-xs text-muted">
            {{ subtitle }}
          </p>
        </div>
      </slot>

      <div v-if="$slots['header-actions']" class="card-header-actions flex align-items-center gap-2">
        <slot name="header-actions" />
      </div>
    </header>

    <!-- Contenido Principal -->
    <div class="card-body">
      <slot />
    </div>

    <!-- Footer Opcional -->
    <footer v-if="$slots.footer" class="card-footer mt-3 pt-3 border-top-1 surface-border">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card-header-actions {
  flex-shrink: 0;
}
</style>
