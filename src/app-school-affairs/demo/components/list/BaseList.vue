<template>
  <view
    :style="{
      height: !hasTabBar
        ? 'calc(100vh - 200rpx - var(--window-top) - env(safe-area-inset-bottom))'
        : 'calc(100vh - 200rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))',
    }"
  >
    <u-empty-custom v-if="state.status !== 'loading' && state.list.length === 0" />
    <scroll-view
      v-else
      :scroll-y="true"
      style="height: 100%"
      scroll-with-animation
      @scrolltolower="loadMore"
    >
      <main>
        <slot></slot>
      </main>
      <view class="u-p-b-24">
        <u-loadmore
          :status="state.status"
          :load-text="{
            loadmore: '上拉刷新',
            loading: '正在加载',
            nomore: '没有更多了',
          }"
          @loadmore="loadMore"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
//传参
const props = defineProps({
  hasTabBar: Boolean,
  loadMore: Function,
  state: {},
});
</script>

<style scoped lang="scss">
@import '@/app-school-affairs/demo/assets/styles/common.scss';
</style>
