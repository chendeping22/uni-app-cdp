<template>
  <view class="topic-item" @click="handleClick">
    <view class="top">
      <view class="title"> 【{{ levelText }}】{{ titleText }}</view>
      <view v-if="!isNil(status)" class="tag">
        <TopicStatusTag :status="status" />
      </view>
    </view>
    <view class="bottom">
      <view v-if="[1, 3].includes(+formType)" class="tag-area">
        <view v-if="!!stageText" class="tag">
          <Tag :text="stageText" :color="stage == 5 ? 'default' : 'blue'" />
        </view>
      </view>

      <view class="time-area">
        <view v-if="deadline.show" class="tip">{{ deadline.tip }}</view>
        <view class="time">{{ deadline.text }}</view>
      </view>
      <view v-if="[2].includes(+formType)" class="button-area">
        <u-button
          :type="canDeclare && 'primary'"
          size="mini"
          :custom-style="{ height: '64rpx', lineHeight: '64rpx' }"
          @click="handleClick"
        >
          {{ canDeclare ? '课题申报' : '已截止' }}
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import TopicStatusTag from '@/app-teacher-personnel/topic/components/TopicStatusTag/index.vue';
import { levelEnum, stageEnum } from '@/app-teacher-personnel/topic/helper/enum';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { computed } from 'vue';

const emits = defineEmits(['click']);
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  level: {
    type: Number,
    required: true,
  },
  stage: {
    type: Number,
    required: true,
  },
  stageDeadline: {
    type: Number,
    default: null,
    required: false,
  },
  approvalDeadline: {
    type: Number,
    default: null,
    required: false,
  },
  status: {
    type: Number,
    default: null,
    required: false,
  },
  // 来源：1课题管理 2课题申报 3我的课题
  formType: {
    type: Number,
    required: true,
    default: 1,
  },
});

const titleText = computed(() => {
  if (props.formType === 3) {
    return props.name;
  }
  return props.title;
});

const stageText = computed(() => {
  const text = stageEnum.find(l => l.value === props.stage)?.label;
  return text;
});
const levelText = computed(() => {
  const text = levelEnum.find(l => l.value === props.level)?.label;
  return text;
});

const canDeclare = computed(() => {
  return props.stage == 1 && props.approvalDeadline > dayjs();
});

const deadline = computed(() => {
  let key = 'stageDeadline';
  if (props.formType === 2) {
    key = 'approvalDeadline';
  }
  const val = props[key];
  const text = !val ? '-' : dayjs(val).format('YYYY-MM-DD HH:mm');

  if (props.formType === 1) {
    return {
      show: true,
      tip: '阶段截止时间',
      text,
    };
  }
  if (props.formType === 2) {
    return {
      show: true,
      tip: '申报截止时间',
      text,
    };
  }
  return {
    show: true,
    tip: '截止时间',
    text,
  };
});

function handleClick() {
  emits('click', props);
}
</script>

<style scoped lang="scss">
.topic-item {
  min-height: px2rpx(92);
  background: $color-background-base;
  border-radius: $radius-base;
  overflow: hidden;
  padding: $space-size-ms $space-size-md;
  box-shadow: $shadow-light-down-base;
  margin: px2rpx(12) px2rpx(16);
  display: flex;
  flex-direction: column;
  .top {
    flex: 1;
    display: flex;
    .title {
      flex: 1;
      font-weight: 500;
      font-size: $icon-size-xs;
      word-break: break-all;
    }
    .tag {
      flex: none;
      margin-left: px2rpx(8);
    }
  }
  .bottom {
    margin-top: px2rpx(4);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tag-area {
      display: flex;
      flex: none;
      margin-right: px2rpx(4);
      .tag + .tag {
        margin-left: px2rpx(4);
      }
    }
    .time-area {
      display: flex;
      align-items: center;
      overflow: hidden;
      color: rgba($color-text-base, 0.45);
      @include caption-2-regular;
      .tip {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: px2rpx(4);
      }
      .time {
        flex: none;
      }
    }
  }
}
</style>
