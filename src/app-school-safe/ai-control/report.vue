<template>
  <c-page :title="`${name}AI日报`" :add-top-gap="false">
    <c-card class="mtb-b mlr-l">
      <view class="flex-between">
        <view class="flex-column item-box">
          <text class="color-secondary font-content mt-s">紧急事件</text>
          <text class="font-xxt">{{ emergencyVal }}</text>
        </view>
        <view class="flex-column item-box">
          <text class="color-secondary font-content mt-s">其他事件</text>
          <text class="font-xxt">{{ otherCount }}</text>
        </view>
      </view>
    </c-card>
    <c-card class="mtb-b mlr-l">
      <view class="font-title bold"> 整体概况 </view>
      <view class="color-secondary mt-xs">
        <text>{{ `今日${name}方面发生${overviewData?.total || 0}起告警事件，` }}</text>
        <text>{{ renderRatio }}</text>
        <text>{{
          `其中紧急事件${overviewData?.emergencyCount || 0}起、重要事件${
            overviewData?.importantCount || 0
          }起、一般事件${overviewData?.normalCount || 0}起。`
        }}</text>
      </view>
    </c-card>
    <c-card class="mtb-b mlr-l">
      <view class="font-title bold">紧急事件</view>
      <view
        v-if="eventData.data?.[0]?.emergencyOverview?.alarmList?.length"
        class="color-secondary mt-xs"
      >
        <view>{{ `今日紧急事件包括${emergencyText}：` }}</view>
        <view
          v-for="(item, idx) in eventData.data?.[0]?.emergencyOverview?.alarmList"
          :key="`${item?.reportTime}_${Math.random()}`"
          class="mb-xs"
        >
          <text>{{
            `${idx + 1}. ${dayjs(item?.reportTime).format('HH:mm')} 在${
              item?.spaceName || '未知空间'
            }发生${item?.title}，目前`
          }}</text>
          <text>{{ item?.handleStatus ? '已处理，' : '未处理，请及时查看并处理。' }}</text>
          <text v-if="item?.handleStatus && item?.handleTime">{{
            `处理时长${dayjs(item?.handleTime).diff(item?.reportTime, 'minutes')}分钟。`
          }}</text>
        </view>
      </view>
      <c-empty v-else content="未识别到异常事件" bg-type="transparent" type="mini" />
    </c-card>
    <c-card class="mtb-b mlr-l plr-l ptb-b">
      <view class="font-title bold">其他事件</view>
      <view
        v-if="!isNil(otherData?.improve) && !isNil(otherData?.ratio) && !isNil(otherData?.more)"
        class="color-secondary mt-xs"
      >
        <text>{{ `其他事件较昨日相比` }}</text>
        <text>{{ percentData(otherData?.ratio) }}</text>
        <text v-if="otherData?.improve">{{ `,改善较大的是${otherData?.improve}` }}</text>
        <text v-if="otherData?.more">{{ `，${otherData?.more}发生频次较多，需要重点关注。` }}</text>
      </view>
      <c-empty v-else content="未识别到异常事件" bg-type="transparent" type="mini" />
    </c-card>
    <c-card class="mtb-b mlr-l">
      <view class="color-primary flex-around flex-left" @click="linkToWorkOrder">
        <c-icon name="icon_add" :size="48" />
        <text class="ml-b font-title">补充人工巡查</text>
      </view>
    </c-card>
    <c-empty-line need-safe-bottom :height="180" />
    <c-bottom>
      <c-button @click="handleDetail">查看事件详情</c-button>
    </c-bottom>
  </c-page>
</template>

<script lang="ts" setup>
import { EApplicationType, ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { isNil } from '@/utils/lodash-es';
import { getPageParams, setPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, onBeforeMount, reactive, ref, unref } from 'vue';
import { IEventData, IMiscOverview, IOverData, getSceneReportApi } from '../services/ai-control';

const pageParams = getPageParams();
const name = ref('AI日报');
const emergencyVal = ref(0);
const otherCount = ref(0);
const ratioValue = ref(0);
const overviewData = ref({} as IOverData);
const eventData = reactive<{ data: IEventData[] }>({ data: [] });
const otherData = ref({} as IMiscOverview);
const currentSceneId = ref('');

const renderRatio = computed(() => {
  if (ratioValue.value === 0) {
    return '环比持平。';
  }
  if (ratioValue.value > 0) {
    return `环比上升${ratioValue.value}%，`;
  }
  if (ratioValue.value < 0) {
    return `环比下降${-ratioValue.value}%，`;
  }
  return '';
});

const emergencyText = computed(() => {
  const { emergencyOverview } = eventData.data[0];
  const text = (emergencyOverview?.alarmCounts || []).map(t => `${t.count}起${t?.alarmName}`);
  if (text.length) {
    return text.toString();
  }
  return '';
});

const percentData = (val: number) => {
  if (val === 0) {
    return '持平。';
  }
  if (val > 0) {
    return `上升${val}%`;
  }
  if (val < 0) {
    return `下降${-val}%`;
  }
  return '';
};

const fetchDetail = async () => {
  const { reportId } = pageParams;
  const reqData = {
    dailyId: reportId,
  };
  const data = await getSceneReportApi(reqData);
  const { sceneName, overview, spaceReport, sceneId } = data;
  const { ratio, normalCount, importantCount, emergencyCount } = overview;
  overviewData.value = overview;
  ratioValue.value = ratio;
  name.value = sceneName;
  emergencyVal.value = emergencyCount;
  otherCount.value = importantCount + normalCount;
  eventData.data = spaceReport;
  otherData.value = spaceReport?.[0]?.miscOverview;
  currentSceneId.value = sceneId;
};

onBeforeMount(() => {
  fetchDetail();
});

/** 跳转到新版审批中心 */
const linkToWorkOrder = () => {
  const pagePath = `/subPackages/work-order/query/index?${setPageParams({
    processTypes: JSON.stringify([2]),
    defaultFormValues: JSON.stringify({
      aiSceneDailyId: unref(pageParams).reportId,
    }),
    tabBarIndex: 1,
  })}`;
  goToWebView(ETargetType.TargetTypeRelativeH5AtImp, pagePath, EApplicationType.Old);
};

const handleDetail = () => {
  uni.navigateTo({
    url: `/ai-control/index?${setPageParams({
      reportSceneId: currentSceneId.value,
    })}`,
  });
};
</script>

<style lang="scss" scoped>
.item-box {
  width: 300rpx;
  height: 140rpx;
  background: #f8f8fa;
  border-radius: $ui-radius-default;
}
</style>
