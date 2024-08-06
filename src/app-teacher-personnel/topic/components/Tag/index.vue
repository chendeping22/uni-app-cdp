<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  color: String,
  text: String,
  textOnly: { type: Boolean, default: false },
});

const colorsMap: any = {
  default: {
    color: 'rgba(0, 0, 0, 0.65)',
    background: 'rgba(0, 0, 0, 0.04)',
    border: 'transparent',
  },
  red: {
    color: '#F5222D',
    border: '#FFA39E',
    background: '#FFF1F0',
  },
  orange: {
    color: '#FAAD14',
    border: '#FFE58F',
    background: '#FFFBE6',
  },
  blue: {
    color: '#1677FF',
    border: '#91CAFF',
    background: '#E6F4FF',
  },
  purple: {
    color: '#722ED1',
    border: '#D3ADF7',
    background: '#F9F0FF',
  },
  green: {
    color: '#52C41A',
    border: '#B7EB8F',
    background: '#F6FFED',
  },
  status_default: {
    color: 'rgba(0, 0, 0, 0.88)',
    background: 'rgba(0, 0, 0, 0.15)',
    border: 'transparent',
  },
  status_blue: {
    color: '#fff',
    background: '#1677FF',
    border: 'transparent',
  },
  status_green: {
    color: '#fff',
    background: '#52C41A',
    border: 'transparent',
  },
  status_red: {
    color: '#fff',
    background: '#FF4D4F',
    border: 'transparent',
  },
};

const color = computed(() => colorsMap[props.color!]);
</script>
<template>
  <text v-if="textOnly" :style="{ color: color?.color }">{{ text }}</text>
  <u-tag
    v-else-if="!!text"
    :text="text"
    size="mini"
    :bg-color="color?.background"
    :color="color?.color"
    :border-color="color?.border"
  />
</template>
<style lang="scss" scoped></style>
