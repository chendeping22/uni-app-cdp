<template>
  <u-popup
    v-model="show"
    mode="right"
    width="80%"
    safe-area-inset-bottom
    @close="handleClose"
    :border-radius="32"
  >
    <view class="type-popup">
      <view class="type-popup-title">
        <view>筛选</view>
        <view class="type-popup-title-link" @click="handleToCustom">+自定义评价</view>
      </view>
      <scroll-view scroll-y class="type-popup-scroll">
        <TypeContent v-model="typeData" :multiple="false" :list="list" @on-change="handleChange" />
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { getPageParams } from '@/utils/tools';
import { ref, watch } from 'vue';
import TypeContent from '../TypeContent.vue';

const props = defineProps<{ list: { label: string; value: string }[]; value: number }>();

const emit = defineEmits<{
  (e: 'update:value', value: number): void;
}>();

const show = ref<boolean>(false);
const typeData = ref<string>(`${props.value}`);

watch(
  () => props.value,
  newVal => {
    if (newVal !== +typeData.value) {
      typeData.value = `${newVal}`;
    }
  },
  {
    immediate: true,
  },
);

const handleClose = () => {
  show.value = false;
};

const handleChange = (data: any) => {
  emit('update:value', +data);
  show.value = false;
};

const handleToCustom = () => {
  const params = getPageParams();
  uni.navigateTo({
    url: `/app-class-evaluation/pages/evaluation/custom?schemeId=${
      params?.schemeId || ''
    }&initialSchemeId=${params?.schemeId1}`,
  });
  show.value = false;
};

const open = () => {
  show.value = true;
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
.type-popup {
  padding: 24rpx 32rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  &-title {
    margin-bottom: 24rpx;
    color: $color-text;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-link {
      color: $color-primary;
    }
  }
  &-scroll {
    height: 100%;
    flex: 1;
    overflow: hidden;
  }
}
</style>
