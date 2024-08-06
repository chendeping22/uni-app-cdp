<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="handleOnMount"
    @show="handleOnMount"
  >
    <u-empty-custom v-if="data.exceptionCode === 1" card text="暂无数据" />
    <u-empty-custom v-else-if="data.exceptionCode === 2" card text="未配置考勤规则" />
    <u-empty-custom v-else-if="data.shouldArrive === 0" card text="今日无需考勤" />
    <template v-else>
      <view class="circleProgress">
        <c-circle-progress
          :percent="data.percent"
          :height="200"
          :width="400"
          :start-angle="270"
          :end-angle="90"
          :border-width="20"
        >
          <view class="flex-column extend-info">
            <view class="font-xxt color-base">{{ data.attendance }}/{{ data.shouldArrive }}</view>
            <view class="font-secondary no-bold color-secondary">出勤人数/应到人数</view>
          </view>
        </c-circle-progress>
      </view>
      <view class="flex flex-around w100 u-m-t-32">
        <view class="flex-column">
          <view class="color-base font-xt">{{ isNil(data.absence) ? '/' : data.absence }}</view>
          <view class="color-secondary font-content no-bold">缺勤</view>
        </view>
        <view class="flex-column">
          <view class="color-base font-xt">{{ isNil(data.late) ? '/' : data.late }}</view>
          <view class="color-secondary font-content no-bold">迟到</view>
        </view>
        <view class="flex-column">
          <view class="color-base font-xt">{{ isNil(data.leave) ? '/' : data.leave }}</view>
          <view class="color-secondary font-content no-bold">请假</view>
        </view>
        <view class="flex-column">
          <view class="color-base font-xt">{{ isNil(data.early) ? '/' : data.early }}</view>
          <view class="color-secondary font-content no-bold">早退</view>
        </view>
      </view>
    </template>
  </widget-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import type { TReportData } from '@/services/widgets';
import { fetchWorkbenchReportData } from '@/services/widgets';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { isNil } from '@/utils/lodash-es';
import widgetCard from '@/widgets/components/widget-card.vue';

const data = ref<TReportData>({
  attendance: 0,
  absence: 0,
  early: 0,
  late: 0,
  leave: 0,
  shouldArrive: 0,
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
  const res = await fetchWorkbenchReportData();
  return res || {};
}

async function handleOnMount() {
  let res = await fetchData();
  data.value = {
    ...res,
    percent:
      isNil(res.attendance) || !res.shouldArrive
        ? 0
        : ((res.attendance * 1.0) / res.shouldArrive) * 100,
  };
  isLoad.value = true;
}

onMounted(() => {
  handleOnMount();
});

const handleClickNavigator = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    '/student-attendance/index',
    EApplicationType.Old,
  );
};
</script>

<style lang="scss" scoped>
.extend-info {
  margin-top: 70rpx;
}

.circleProgress {
  width: 100%;
  height: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flex {
  display: flex;
  align-items: center;
}

.w100 {
  width: 100%;
}

.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.font-xxt {
  font-size: 40rpx;
}

.color-base {
  color: #1d2129;
}

.font-secondary {
  font-size: 0.75rem;
}

.no-bold {
  font-weight: 400;
}

.color-secondary {
  color: #4e5969;
}

.font-content {
  font-size: 24rpx;
}

.font-xt {
  font-size: 34rpx;
}

.flex-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
