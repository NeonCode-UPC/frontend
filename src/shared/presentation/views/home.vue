<script setup>
import { ref, computed } from 'vue';
import BaseScreen from '../components/base-screen.vue';

const selectedFilter = ref('todos');

const kpis = [
  { value: '18', label: 'Transportes activos', borderClass: '' },
  { value: '11 / 12', label: 'SmartBox en línea', borderClass: 'border-top-3 border-teal-600' },
  { value: '2', label: 'Alertas activas', borderClass: 'border-top-3 border-red-500' },
  { value: '14:35', label: 'Próxima llegada', borderClass: '' }
];

const filters = [
  { id: 'todos', label: 'Todos', count: 18 },
  { id: 'transito', label: 'En tránsito', count: 11 },
  { id: 'retraso', label: 'Retraso', count: 3 },
  { id: 'critica', label: 'Crítica', count: 2 }
];

const sampleOrders = [
  { id: 'TR-0417', route: 'Lima → Arequipa', box: 'SB-0182', plate: 'ABQ-742', temp: '4,2 °C', eta: '14:35', status: 'En tránsito', severity: 'success' },
  { id: 'TR-0251', route: 'Lima → Trujillo', box: 'SB-0177', plate: 'CDE-661', temp: '8,7 °C', eta: '16:10', status: 'Crítica', severity: 'danger' },
  { id: 'TR-0249', route: 'Callao → Ica', box: 'SB-0190', plate: 'AUC-215', temp: '3,8 °C', eta: '15:02', status: 'En tránsito', severity: 'success' },
  { id: 'TR-0246', route: 'Lima → Huancayo', box: 'SB-0165', plate: 'BHM-903', temp: '6,4 °C', eta: '18:40', status: 'Retraso', severity: 'warn' }
];

const attentionItems = [
  { icon: 'pi pi-compass', title: 'Temperatura fuera de rango', code: 'TR-0251 · SB-0177 · 8,7 °C', tag: 'Crítica', tagSeverity: 'danger', time: '13:42' },
  { icon: 'pi pi-bolt', title: 'Batería crítica', code: 'SB-0177 · 18 %', tag: 'Aviso', tagSeverity: 'warn', time: '12:20' },
  { icon: 'pi pi-clock', title: 'Retraso por tráfico', code: 'TR-0246 · +22 min', tag: 'Aviso', tagSeverity: 'warn', time: '11:05' }
];
</script>

<template>
  <base-screen
    breadcrumb="Panel"
    title="Transportes activos"
    subtitle="Martes 29 de septiembre · actualizado hace 40 s"
    bounded-context="Centro de Operaciones Medical SMARTBOX"
    search-placeholder="Filtrar por ruta, estado o SmartBox"
    action-label="Nuevo traslado"
    action-icon="pi pi-plus"
  >
    <template #default="{ searchQuery }">
      <!-- 4 Top KPI Cards (matching design) -->
      <div class="grid mb-4">
        <div v-for="(kpi, idx) in kpis" :key="idx" class="col-12 sm:col-6 lg:col-3">
          <div class="surface-card border-round-xl p-3 shadow-1 h-full flex flex-column justify-content-between" :class="kpi.borderClass">
            <span class="text-3xl font-extrabold text-900 tnum block">{{ kpi.value }}</span>
            <span class="text-xs text-secondary mt-1 font-medium block">{{ kpi.label }}</span>
          </div>
        </div>
      </div>

      <!-- Filter Buttons Row -->
      <div class="flex flex-wrap gap-2 mb-4">
        <pv-button
          v-for="f in filters"
          :key="f.id"
          :label="`${f.label} ${f.count}`"
          icon="pi pi-circle-fill"
          size="small"
          :outlined="selectedFilter !== f.id"
          :class="selectedFilter === f.id ? 'bg-teal-900 border-none text-white' : 'surface-card text-700 border-200'"
          @click="selectedFilter = f.id"
        />
      </div>

      <!-- Main Columns Layout (Table on Left + Attention Cards on Right) -->
      <div class="grid">
        <!-- Left Table Container -->
        <div class="col-12 lg:col-8">
          <div class="surface-card border-round-xl p-3 shadow-1">
            <pv-data-table :value="sampleOrders" responsiveLayout="scroll" class="p-datatable-sm">
              <pv-column field="id" header="TRASLADO">
                <template #body="{ data }">
                  <strong class="text-teal-900">{{ data.id }}</strong>
                  <span class="block text-xs text-secondary">{{ data.route }}</span>
                </template>
              </pv-column>
              <pv-column header="AMBULANCIA · SMARTBOX">
                <template #body="{ data }">
                  <span class="text-xs font-semibold block">{{ data.plate }}</span>
                  <span class="text-xs text-secondary font-mono">{{ data.box }}</span>
                </template>
              </pv-column>
              <pv-column field="temp" header="TEMPERATURA">
                <template #body="{ data }">
                  <span class="font-bold tnum text-sm" :class="data.severity === 'danger' ? 'text-red-600' : 'text-teal-800'">
                    {{ data.temp }}
                  </span>
                </template>
              </pv-column>
              <pv-column field="eta" header="ETA">
                <template #body="{ data }">
                  <span class="text-sm font-semibold tnum">{{ data.eta }}</span>
                </template>
              </pv-column>
              <pv-column field="status" header="ESTADO">
                <template #body="{ data }">
                  <pv-tag :severity="data.severity" :value="data.status" rounded />
                </template>
              </pv-column>
              <pv-column header="">
                <template #body>
                  <pv-button label="Ver detalle" text size="small" class="text-xs p-1" />
                </template>
              </pv-column>
            </pv-data-table>
          </div>
        </div>

        <!-- Right: Require Attention Panel -->
        <div class="col-12 lg:col-4">
          <div class="surface-card border-round-xl p-4 shadow-1 flex flex-column gap-3">
            <h3 class="text-sm font-bold text-900 m-0">Requieren atención</h3>

            <div v-for="(item, idx) in attentionItems" :key="idx" class="border-round-lg p-3 surface-50 border-1 surface-border flex align-items-center justify-content-between gap-2">
              <div class="flex align-items-center gap-3">
                <div class="w-2rem h-2rem border-round bg-red-50 text-red-600 flex align-items-center justify-content-center">
                  <i :class="item.icon"></i>
                </div>
                <div>
                  <strong class="text-xs text-900 block">{{ item.title }}</strong>
                  <span class="text-xs text-secondary block font-mono">{{ item.code }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold block" :class="item.tagSeverity === 'danger' ? 'text-red-600' : 'text-orange-600'">
                  {{ item.tag }}
                </span>
                <span class="text-xs text-secondary tnum">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
