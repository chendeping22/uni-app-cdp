<template>
  <swiper
    class="fill-report-swiper"
    :circular="canCircular"
    :current="displayIndex"
    :disable-touch="disableTouch"
    :previous-margin="'24'"
    :next-margin="'24'"
    @change="handleSwiperChange"
  >
    <swiper-item
      v-for="(i, index) in displayItems"
      :key="index"
      :catchtouchmove="disableTouch ? '不能滑动' : ''"
    >
      <view v-if="i === -1" class="h100 mlr-s"></view>
      <slot v-else name="item" :index="i"></slot>
    </swiper-item>
  </swiper>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  total: number;
  length: number;
  current: number;
  disableTouch: boolean;
}>();

const emits = defineEmits(['loadmore']);
const displayLength = 5;
const halfLength = Math.floor(displayLength / 2);
const displayItems = ref<any[]>([]);
const displayIndex = ref(0);
const currentIndex = ref(0);

const canCircular = computed(() => {
  if (props.total < 10) {
    return false;
  }

  return true;
});

function updateItems() {
  const _items: any[] = [];
  if (props.total < 10) {
    for (let i = 0; i < props.total; i += 1) {
      _items.push(i);
    }
    displayItems.value = _items;
  } else {
    _items[displayIndex.value] = currentIndex.value;
    for (let i = 1; i <= halfLength; i += 1) {
      const _index_l = (displayIndex.value - i + displayLength) % displayLength;
      const _index_l_2 = currentIndex.value - i;
      if (_index_l_2 < 0) {
        // 左边不轮播添加空数据
        _items[_index_l] = -1;
      } else {
        _items[_index_l] = _index_l_2;
      }
      const _index_r = (displayIndex.value + i) % displayLength;
      const _index_r_2 = currentIndex.value + i;
      if (_index_r_2 > props.total - 1) {
        // 右边不轮播添加空数据
        _items[_index_r] = -1;
      } else {
        _items[_index_r] = _index_r_2;
      }
    }

    displayItems.value = _items;
  }
}

function handleSwiperChange(e) {
  const { current } = e.detail;
  if (props.total < 10) {
    displayIndex.value = current;
    currentIndex.value = current;
    return;
  }
  const lastDisplayIndex = displayIndex.value;
  if (
    displayIndex.value === current + 1 ||
    (displayIndex.value === 0 && current === displayLength - 1)
  ) {
    // 展示上一个
    displayIndex.value = current;
    if (currentIndex.value > 0) {
      currentIndex.value -= 1;
    } else {
      nextTick(() => {
        displayIndex.value = lastDisplayIndex;
      });
      return;
    }
  } else if (
    displayIndex.value === current - 1 ||
    (displayIndex.value === displayLength - 1 && current === 0)
  ) {
    // 展示下一个
    displayIndex.value = current;
    if (currentIndex.value < props.total - 1) {
      currentIndex.value += 1;
    } else {
      nextTick(() => {
        displayIndex.value = lastDisplayIndex;
      });
      return;
    }
  }
  updateItems();
  if (currentIndex.value > props.length - displayLength) {
    emits('loadmore');
  }
}

watch(
  () => props.current,
  value => {
    currentIndex.value = value;
    displayIndex.value = value % displayLength;
    updateItems();
  },
);

onMounted(() => {
  currentIndex.value = props.current;
  displayIndex.value = props.current % displayLength;
  updateItems();
});
</script>

<style lang="scss">
.fill-report-swiper {
  height: 100%;
  width: 100%;
  :deep(.uni-swiper-wrapper) {
    overflow: visible;
  }
  :deep(.uni-swiper-slides) {
    left: 36rpx;
    right: 36rpx;
  }
}
</style>
