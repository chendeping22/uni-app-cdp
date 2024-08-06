<template>
  <view class="alarm-container" :class="{ 'can-selected': isCanSelect }" @click="handleDetail">
    <u-checkbox v-if="isCanSelect" v-model="checked" class="icon" shape="circle" />
    <view class="info">
      <view class="title-container">
        <text class="title">{{ title }}</text>
        <alarm-badge class="tag" :name="levelName" :code="levelCode"></alarm-badge>
        <large-model
          v-if="!isNil(largeModelResult)"
          :id="id"
          class="tag"
          :status="largeModelResult"
          :fail-reason="largeModelFailReason"
          disabled
        />
      </view>
      <view class="space-name">{{ subTitle }}</view>
      <view class="created-time">
        {{ timeFormat }}
      </view>
    </view>
    <view class="capture">
      <u-image :src="snapImageUrl" :height="144" :width="240" :preview="false" :border-radius="8">
        <template #error>
          <u-image :src="multimedia_image_error" :height="80" :width="80" />
        </template>
      </u-image>
    </view>
  </view>
</template>
<script lang="ts" setup>
import AlarmBadge from '@/app-school-safe/components/alarm-badge/index.vue';
import multimedia_image_error from '@/app-school-safe/static/image/multimedia_image_error.png';
import dayjs from 'dayjs';
import { computed, ref, toRefs, watch, watchEffect } from 'vue';
import { LargeModelCode } from '../../constants/LargeModelEnum';
import LargeModel from '../large-model/index.vue';

import { isNil } from 'lodash-es';

interface IProps {
  id: string;
  typeCode: string;
  levelName: string;
  levelCode: string;
  title: string;
  subTitle: string;
  snapTime?: number;
  snapImageUrl?: string;
  isSelected?: boolean;
  isCanSelect?: boolean;
  largeModelResult?: LargeModelCode; // 大模型校验状态
  largeModelFailReason?: string; // 校验失败原因
}

const props = withDefaults(defineProps<IProps>(), {
  id: '',
  typeCode: '',
  levelName: '',
  levelCode: '',
  title: '',
  subTitle: '',
  snapTime: 0,
  snapImageUrl: '',
  isSelected: false,
  isCanSelect: false,
  largeModelResult: undefined,
  largeModelFailReason: '',
});

const emits = defineEmits(['selectChanged', 'navigateToDetail']);

const checked = ref(false);
const { id, typeCode, isSelected, snapTime } = toRefs(props);
const timeFormat = computed(() => dayjs(snapTime.value).format('YYYY-MM-DD HH:mm:ss'));
const handleDetail = () => {
  emits('navigateToDetail', {
    id: id.value,
    typeCode: typeCode.value,
  });
};
watchEffect(() => {
  checked.value = isSelected.value;
});
watch(checked, () => {
  emits('selectChanged', {
    id: id.value,
    isSelected: checked.value,
  });
});
</script>

<style scoped lang="scss">
.alarm-container {
  height: 210rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e6ec;
  column-gap: $ui-gap-base;
  &.can-selected {
    .title-container .title {
      max-width: 272rpx;
    }
    .space-name {
      max-width: 360rpx;
    }
  }
  .info {
    flex: 1;
  }
  .title-container {
    font-size: $ui-font-size-xt;
    color: $ui-color-base;
    display: flex;
    height: 40rpx;
    align-items: center;
    column-gap: $ui-gap-xxs;
    .title {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 280rpx;
    }
    .tag {
      flex-shrink: 0;
    }
  }
  .icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: $ui-gap-default;
  }
  .space-name {
    font-size: $ui-font-size-content;
    color: $ui-color-placeholder;
    margin-top: $ui-gap-default;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 428rpx;
  }

  .created-time {
    font-size: $ui-font-size-secondary;
    color: $ui-color-placeholder;
    margin-top: $ui-gap-large;
  }

  .capture {
    width: 240rpx;
    height: 144rpx;
    border-radius: 8rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
