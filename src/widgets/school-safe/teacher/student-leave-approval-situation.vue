<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="handleOnMount"
    @show="handleOnMount"
  >
    <view class="w100">
      <view class="total">待审批：{{ data?.total || 0 }}条</view>
      <u-empty-custom v-if="!data?.total" card content="暂无数据" />
      <view v-else class="items">
        <view
          v-for="item in data.result"
          :key="item.id"
          class="item"
          @click="handleLeaveItem(item.id)"
        >
          <text class="font-title mr-s bold">{{ item.personName || '/' }}</text>
          <text class="font-content color-secondary">{{ item.className || '/' }}</text>
          <text :class="item.leaveType === 0 ? 'tag tag0' : 'tag tag1'">{{
            EnumLeaveType[item.leaveType]
          }}</text>
        </view>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import type { TLeaveItem } from '@/services/widgets';
import { fetchLeaveList } from '@/services/widgets';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';

enum EnumLeaveType {
  '事假' = 0,
  '病假',
  '异常离园',
}

const data = ref<{
  total: number;
  result: TLeaveItem[];
}>({
  total: 0,
  result: [],
});

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
  const res = await fetchLeaveList({ ccFlag: '0', pageNum: 1, pageSize: 3, reviewStatus: '0' });
  return res || {};
}

async function handleOnMount() {
  let res = await fetchData();
  data.value = {
    total: res.total,
    result: res.result,
  };
  isLoad.value = true;
}

onMounted(() => {
  handleOnMount();
});

const handleClickNavigator = () => {
  goToWebView(ETargetType.TargetTypeRelativeH5AtImp, 'student-leave/index', EApplicationType.Old);
};

const handleLeaveItem = (id: string) => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `student-leave/detail?leaveId=${id}`,
    EApplicationType.Old,
  );
};
</script>

<style lang="scss" scoped>
.w100 {
  width: 100%;
}
.mr-s {
  margin-right: 16rpx;
}
.font-content {
  font-size: 28rpx;
}
.font-title {
  font-size: 30rpx;
}
.bold {
  font-weight: 600;
}
.color-secondary {
  color: #4e5969;
}
.total {
  font-size: 30rpx;
  color: #1d2129;
  line-height: 48rpx;
  height: 48rpx;
  margin-top: 16rpx;
  margin-bottom: 16rpx;
}
.items {
  .item {
    position: relative;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #f7f8fa;
    border-radius: 12rpx;
    margin-bottom: 12rpx;
    padding-left: 32rpx;
    padding-right: 32rpx;
    .bold {
      font-weight: 600;
    }
    .tag {
      position: absolute;
      right: 32rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24rpx;
      line-height: 32rpx;
      padding: 4rpx 16rpx;
      border-radius: 12rpx;
      &.tag0 {
        color: #fe7c00;
        background-color: #fff7e8;
      }
      &.tag1 {
        color: #f53f3f;
        background-color: #ffece8;
      }
    }
  }
}
</style>
