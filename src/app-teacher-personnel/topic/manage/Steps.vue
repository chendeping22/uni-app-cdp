<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
const props = defineProps({
  /** 当前进行到的阶段序号 */
  current: {
    type: Number,
    default: 0,
  },
  /** 当前激活的阶段序号（Tab） */
  active: {
    type: Number,
    default: 0,
  },
  data: Object,
  self: Boolean,
});

const emit = defineEmits<{
  (e: 'update:active', index: number): void;
}>();

const scrollLeft = ref(0);

const items = [
  {
    title: '课题申报',
  },
  {
    title: '开题论证',
  },
  {
    title: '中期检查',
  },
  {
    title: '结题鉴定',
  },
];

function handleSwitch(index) {
  emit('update:active', index);
}

watch(
  () => props.active,
  val => {
    const left = (val - 1) * 100;
    scrollLeft.value = left < 0 ? 0 : left;
  },
  { immediate: true },
);
</script>
<template>
  <view class="tab-area">
    <scroll-view :scroll-x="true" style="" scroll-with-animation :scroll-left="scrollLeft">
      <view class="tab-area-inner"
        ><template v-for="(item, index) in items" :key="index">
          <view
            :class="[
              'tab-item',
              {
                active: index === active,
              },
              {
                current: index <= current,
              },
            ]"
            @click="index <= current ? handleSwitch(index) : null"
          >
            <view class="tab-item-title">{{ item.title }} </view>
            <view class="tab-item-time">
              {{ dayjs(data?.materials[index]?.deadline).format('YYYY-MM-DD HH:mm') }}
            </view>
          </view>
        </template></view
      >
    </scroll-view>
  </view>
</template>
<style lang="scss" scoped>
.tab-area {
  margin-bottom: px2rpx(12);
  .tab-area-inner {
    display: flex;
  }
  .tab-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    border-radius: px2rpx(4);
    height: px2rpx(54);
    background: #fff;
    box-shadow: 0 1px 2px 0 #0000000a;
    padding: px2rpx(8);
    margin-right: px2rpx(12);
    flex: none;
    &.active {
      background: #e6f4ff;
      .tab-item-title,
      .tab-item-time {
        color: $color-primary;
      }
    }
    &-title {
      @include body-medium;
      color: rgba($color-text-base, 0.65);
    }
    &-time {
      @include caption-2-regular;
      color: rgba($color-text-base, 0.45);
    }
  }
}
</style>
