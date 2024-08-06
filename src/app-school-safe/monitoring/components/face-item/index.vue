<template>
  <view class="item">
    <view class="img-wrap">
      <image :src="captureImgUrl" alt="抓拍图" class="photo" />
      <image :src="usePersonType(libraryType, personType).icon" alt="icon" class="icon" />
    </view>
    <view class="name">{{ personName || '/' }}</view>
    <view class="time">{{ captureTimeStr }}</view>
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, toRefs } from 'vue';
import PersonTypeEnum from '../../constants/PersonTypeEnum';
import usePersonType from '../../hooks/usePersonType';

interface IProps {
  captureImgUrl: string;
  captureTime: number;
  personType: number;
  libraryType: number;
}

const props = withDefaults(defineProps<IProps>(), {});
const { captureTime, personType } = toRefs(props);

const captureTimeStr = computed(() => {
  const currentDate = dayjs(captureTime.value);
  if (currentDate.isSame(dayjs(new Date()), 'date')) return currentDate.format('HH:mm:ss');
  else if ((currentDate.isSame(dayjs(new Date()).subtract(1, 'day')), 'date'))
    return `昨天${currentDate.format('HH:mm:ss')}`;
  else return currentDate.format('YYYY-MM-DD HH:mm:ss');
});

const personName = computed(() => {
  return PersonTypeEnum.find(item => item.value === personType.value)?.label;
});
</script>

<style lang="scss" scoped>
.img-wrap {
  width: 164rpx;
  height: 164rpx;
  border-radius: $ui-radius-small;
  position: relative;
}
.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon {
  width: 32rpx;
  height: 32rpx;
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
}
.name {
  height: 42rpx;
  font-family: PingFangSC-Medium;
  font-size: $ui-font-size-title;
  color: $ui-color-base;
  letter-spacing: 0;
  font-weight: 500;
  margin-top: $ui-gap-small;
  margin-bottom: $ui-gap-xxs;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  height: 66px;
  font-family: PingFangSC-Regular;
  font-size: $ui-font-size-secondary;
  color: $ui-color-placeholder;
  letter-spacing: 0;
  font-weight: 400;
}
</style>
