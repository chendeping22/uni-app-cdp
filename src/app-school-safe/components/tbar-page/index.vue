<template>
  <view :class="['container', className]">
    <slot :current="current" />
  </view>
  <u-tabbar
    v-model="current"
    :list="dataArray || []"
    active-color="#3491fa"
    :before-switch="beforeSwitch"
  />
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';

interface ITabBarItem {
  iconPath: string;
  selectedIconPath: string;
  text: string;
}

interface IProps {
  className?: string | string[];
  list: ITabBarItem[];
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
});

const emits = defineEmits(['beforeSwitch']);

const { list } = toRefs(props);

const dataArray = computed(() => {
  return list.value?.map(item => ({
    ...item,
    customIcon: false,
  }));
});

const current = ref(0);

const beforeSwitch = (index: number) => {
  emits('beforeSwitch', index);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};
</script>

<style scoped lang="scss">
.container {
  height: calc(100% - 100rpx);
  overflow: hidden;
}

:deep(.u-tabbar__content__item__text .u-line-1) {
  font-size: 20rpx;
  line-height: 20rpx;
}

:deep(.u-tabbar__content__item .u-badge) {
  padding: 4rpx 10rpx;
}

:deep(.u-tabbar__content__item__button) {
  top: 12rpx !important;
}

:deep(.u-tabbar__content__item__text) {
  bottom: 12rpx !important;
}
</style>
