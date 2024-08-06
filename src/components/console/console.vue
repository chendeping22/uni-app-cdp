<template>
  <view v-if="isDev">
    <movable-area class="move-area">
      <movable-view direction="all" class="move-view" x="500" y="200" :out-of-bounds="true">
        <view
          v-if="!showDebuggerWindow"
          class="u-flex bg-success radius-default u-p-l-16 u-p-r-16"
          @click="showDebuggerWindow = true"
        >
          <text class="color-white"> vConsole </text>
        </view>
      </movable-view>
    </movable-area>

    <debuggerBox v-if="showDebuggerWindow" @close="showDebuggerWindow = false" />
  </view>
</template>
<script lang="ts">
import debuggerBox from '@/uni_modules/imengyu-IMDebuggerWindow/pages/components/debuggerBox.vue';
import { EnvType } from '@/utils/env.ts';
import { defineComponent, ref } from 'vue';
const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const isDev = process.env.NODE_ENV === 'development' || VITE_SERVER_ENV !== EnvType.EnvType_PROD;

export default defineComponent({
  components: {
    debuggerBox,
  },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  setup() {
    const showDebuggerWindow = ref(false);

    return { showDebuggerWindow, VITE_SERVER_ENV, isDev };
  },
});
</script>
<style scoped lang="scss">
.move-area {
  position: fixed;
  width: 100vw;
  bottom: 0;
  height: 300px;
  z-index: 999999999;
  pointer-events: none;
  padding: 24rpx;
  .move-view {
    display: inline-flex;
    width: 100px;
    height: 30px;
    pointer-events: all;
  }
}
.bg-success {
  background: #00b42a;
}
.radius-default {
  border-radius: 12rpx;
}
.color-white {
  color: white;
}
</style>
