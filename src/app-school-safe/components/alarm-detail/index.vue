<template>
  <c-empty v-if="!loading && isEmpty(data)" content="消息已被删除" bg-type="transparent" />
  <view v-else-if="!loading" class="flex-column content-wrapper bg-fill-default">
    <view class="header w100">
      <view class="title-wrapper">
        <text class="title mr-s">{{ data?.libraryName || data?.name || '/' }}</text>
        <template v-if="isNeedProcess">
          <text v-if="!data?.status" class="untreated">未处理</text>
          <text v-else class="processed">已处理</text>
        </template>
      </view>
      <view class="flex-between">
        <view class="flex">
          <alarm-badge v-if="alarmLevel" :code="alarmLevel.value" :name="alarmLevel.name" />
          <slot name="tag" />
        </view>
        <text class="time">{{
          data?.time ? dayjs(data.time).format('YYYY-MM-DD HH:mm:ss') : '/'
        }}</text>
      </view>
      <text class="content lh-6 mtb-s">{{ data?.content || '/' }}</text>
    </view>
    <slot name="header" />
    <view class="content-body w100 plr-l flex-grow scroll-auto">
      <slot />
      <view v-if="!data?.status && isNeedProcess && isProcessPermission" class="btn-wrap">
        <c-button class="handle-btn" @click="emits('processHandle')"> 处理 </c-button>
      </view>
      <c-empty-line height="24rpx" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/lodash-es';
import { computed, toRefs } from 'vue';
import AlarmBadge from '../alarm-badge/index.vue';

import { AlarmLevelEnum } from '@/app-school-safe/constants/AlarmLevelEnum';
import dayjs from 'dayjs';

interface IProps {
  loading: boolean;
  data: any;
  isNeedProcess?: boolean; // 是否需要处理告警
  isProcessPermission?: boolean; // 是否有权限处理告警
}

const props = withDefaults(defineProps<IProps>(), {
  isNeedProcess: true,
  isProcessPermission: true,
});
const { data } = toRefs(props);

const emits = defineEmits(['processHandle']);

const alarmLevel = computed(() => {
  return AlarmLevelEnum.find(item => item.value === data.value?.level);
});
</script>
<style lang="scss" scoped>
.content-wrapper {
  height: calc(100vh - var(--window-top));
  overflow: hidden;

  .header {
    display: flex;
    flex-direction: column;
    background: $ui-color-white;
    padding: $ui-gap-default $ui-gap-large;
    border-bottom-left-radius: $ui-radius-xl;
    border-bottom-right-radius: $ui-radius-xl;

    .title-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: $ui-font-size-xxt;
        color: $ui-color-base;
        letter-spacing: 0;
        line-height: 64rpx;
        font-weight: 600;
        word-break: break-all;
      }

      .untreated {
        font-size: $ui-font-size-title;
        color: $ui-color-primary;
        white-space: nowrap;
      }

      .processed {
        font-size: $ui-font-size-title;
        color: $color-success;
        white-space: nowrap;
      }
    }

    .content {
      font-size: $ui-font-size-content;
      color: #000000a6;
      letter-spacing: 0;
    }

    .time {
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
      letter-spacing: 0;
      line-height: 24rpx;
    }
  }

  .content-body {
    .btn-wrap {
      margin-top: 64rpx;
    }
  }
}
</style>
