<template>
  <view class="flex-column-plain font-secondary color-placeholder">
    <view class="flex flex-between mtb-xs">
      <view class="flex font-title">
        <c-avatar class-name="radius-round" :src="avatar" type="young" :size="48" />
        <view class="mlr-xs color-secondary text-ellipse">{{ handleName }}</view>
        <view class="handle-status no-shrink">{{ handleStatusName }}</view>
      </view>
      <view class="color-placeholder">{{ dayjs(time).format('MM-DD HH:mm') }}</view>
    </view>
    <view v-if="comment?.length" class="ptb-xs plr-s bg-fill-light radius-default">{{
      comment
    }}</view>
  </view>
</template>

<script lang="ts" setup>
import { WoHandleStatusEnum } from '@/app-school-safe/constants/WoHandleStatusEnum';
import avatar_default from '@/static/avatar.png';
import dayjs from 'dayjs';
import { computed, toRefs } from 'vue';

interface IProps {
  id: string;
  name: string;
  avatar?: string;
  handleStatus: number;
  comment?: string;
  time: number;
}

const props = withDefaults(defineProps<IProps>(), {
  avatar: avatar_default,
  comment: '',
});

const { handleStatus, id, name } = toRefs(props);

const handleName = computed(() => {
  if (id.value === '-1') return '系统';
  return name.value;
});

const handleStatusName = computed(() => {
  return WoHandleStatusEnum.find(item => item.value === handleStatus.value)?.label;
});
</script>

<style scoped lang="scss">
.handle-status {
  color: #52c41a;
}
</style>
