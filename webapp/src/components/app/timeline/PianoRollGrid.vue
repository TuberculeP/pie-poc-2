<template>
  <GridLayout
    v-model:layout="internalLayout"
    :col-num="colNum"
    :row-height="rowHeight"
    :is-draggable="true"
    :is-resizable="true"
    :auto-size="false"
    :use-css-transforms="true"
    is-bounded
    vertical-compact
    class="grid-wrapper"
    @drag="onDrag"
    @resize="onResize"
  >
    <template #item="{ item }">
      <slot name="item" :item="item" />
    </template>
  </GridLayout>
</template>

<script setup lang="ts">
import { toRef, watch, defineEmits, defineProps } from 'vue'
import { GridLayout } from 'grid-layout-plus'

const props = defineProps<{
  layout: Array<any>
  colNum: number
  rowHeight: number
}>()

const emit = defineEmits<{
  (e: 'update:layout', val: Array<any>): void
  (e: 'drag', item: any): void
  (e: 'resize', item: any, newW:number, newH:number): void
}>()

const internalLayout = toRef(props, 'layout')
watch(internalLayout, val => emit('update:layout', val), { deep: true })

function onDrag(item:any) { emit('drag', item) }
function onResize(item:any, w:number, h:number) { emit('resize', item, w, h) }
</script>

<style scoped>
.grid-wrapper {
  background-color: #2d3b45;
  /* grille : maille visible */
  background-image:
    linear-gradient(to right, #3f4a52 1px, transparent 1px),
    linear-gradient(to bottom, #3f4a52 1px, transparent 1px);
  background-size: var(--step-width) var(--row-height);
  position: relative;
}
</style>
