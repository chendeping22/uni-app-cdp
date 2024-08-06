<template>
  <text :class="['iconfont', 'icon-icon_' + type]" :style="iconStyle" />
</template>

<script setup>
import { computed } from 'vue';
// props数据
const props = defineProps({
  // 图标图案
  type: {
    type: String,
    default: '',
  },
  // 图标大小
  size: {
    type: Number,
    default: 32,
  },
  // 图标颜色
  color: {
    type: String,
    default: '',
  },
});
const iconStyle = computed(() => {
  let style = `font-size:${props.size}rpx;`;
  if (props.color) {
    style = `font-size:${props.size}rpx;color:${props.color}`;
  }
  return style;
});
</script>
<style scoped>
.iconfont {
  vertical-align: middle;
}
</style>
