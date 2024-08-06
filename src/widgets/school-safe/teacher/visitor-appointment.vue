<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="handleOnMount"
    @show="handleOnMount"
  >
    <view class="visitor-title w100 color-base font-title">今日访客：{{ data.total || 0 }}</view>
    <view
      v-for="item in data.signIns"
      :key="item.visitorStatus"
      class="visitor-item radius-default mb-b flex p-all-b"
    >
      <view class="flex-column flex-start no-shrink pr-b hairline">
        <view class="color-secondary font-content">{{ item.visitorStatusLabel }}</view>
        <view class="color-base font-xxt bold">{{ item.count || 0 }}</view>
      </view>
      <view class="text-ellipsis-2 color-secondary font-content pl-b">{{
        item.names.join('、')
      }}</view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import type { TTodayVisitor } from '@/services/widgets';
import { fetchTodayVisitor } from '@/services/widgets';
import { type IWidget } from '@/store/modules/workbench';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

const statusEnum = [
  {
    value: 1,
    label: '未来访',
  },
  {
    value: 2,
    label: '已签到',
  },
  {
    value: 3,
    label: '已签离',
  },
];

const data = ref<Partial<TTodayVisitor>>({});

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);

/** 调用API，获取真实数据 */
async function fetchData() {
  const res = await fetchTodayVisitor();
  return res || {};
}

async function handleOnMount() {
  let res = await fetchData();
  data.value = {
    total: res.total,
    signIns: res.signIns.map(item => {
      const statusItem = statusEnum.find(status => status.value === item.visitorStatus);
      return {
        ...item,
        visitorStatusLabel: statusItem?.label,
      };
    }),
  };
  isLoad.value = true;
}

onMounted(() => {
  handleOnMount();
});

const handleClickNavigator = () => {
  uni.navigateTo({
    url: '/app-school-safe/visitor-appointment/index',
  });
};
</script>

<style lang="scss" scoped>
.visitor-title {
  margin-top: 28rpx;
  margin-bottom: 16rpx;
}
.visitor-item {
  background: #f8f8fa;
}
.hairline {
  border-right: 1rpx solid #c9cdd5;
}

.flex {
  display: flex;
  align-items: center;
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flex-start {
  align-items: flex-start;
}

.no-shrink {
  flex-shrink: 0;
}

.color-base {
  color: #1d2129;
}

.color-secondary {
  color: #4e5969;
}

.font-title {
  font-size: 30rpx;
}

.font-content {
  font-size: 24rpx;
}

.mb-b {
  margin-bottom: 24rpx;
}

.pl-b {
  padding-left: 24rpx;
}

.pr-b {
  padding-right: 24rpx;
}

.w100 {
  width: 100%;
}

.radius-default {
  border-radius: 12rpx;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
</style>
