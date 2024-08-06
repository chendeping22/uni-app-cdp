<template>
  <alarm-detail
    :loading="loading"
    :data="detail"
    :is-process-permission="isProcessPermission"
    @process-handle="processHandle"
  >
    <template #tag>
      <alarm-badge
        v-if="Boolean(detail?.persistEvent)"
        class="ml-xs"
        :name="detail?.eventStatus === EventStatusCode.PENDING ? '持续中' : '已结束'"
        code="default"
      />
      <large-model
        v-if="!isNil(detail?.largeModelResult)"
        :id="String(detail.id)"
        class="ml-xs"
        :status="detail.largeModelResult"
        :fail-reason="detail.largeModelFailReason"
        @update-status="largeModelResultChangeHandle"
      />
    </template>
    <template #header>
      <view class="mlr-l">
        <monitor-info
          :key="currentEventStatusIndex"
          :detail="{
            ...detail,
            ...(currentEventStatusIndex === 1
              ? {
                  snapTime: detail?.secondSnapTime,
                  snapImgId: detail?.secondSnapImgId,
                  snapImgUrl: detail?.secondSnapImgUrl,
                  videoId: detail?.secondVideoId,
                  videoUrl: detail?.secondVideoUrl,
                  objectRoi: detail?.secondObjectRoi,
                  finishCapture: detail?.secondFinishCapture,
                }
              : {}),
          }"
          :alarm-type="(alarmType as AlarmTypeEnum)"
        >
          <template #header>
            <view v-if="Boolean(detail?.persistEvent)" class="flex-between mb-b">
              <view class="font-title color-black bold">图像画面</view>
              <view :class="eventStatusEnum?.length > 1 ? 'col-8' : 'col-4'">
                <u-subsection
                  :current="currentEventStatusIndex"
                  :font-size="24"
                  :list="eventStatusEnum"
                  @change="setCurrentEventStatusIndex"
                />
              </view>
            </view>
          </template>
        </monitor-info>
      </view>
    </template>
    <task-assignee
      v-if="alarmType === AlarmTypeEnum.BEHAVIOR && detail?.taskAssigneeList?.length"
      :wo-status="detail?.woStatus"
      :task-assignee-list="detail?.taskAssigneeList"
    />
    <face-info v-if="alarmType === AlarmTypeEnum.FACE" :detail="detail" />
    <device-info :detail="detail" :alarm-type="(alarmType as AlarmTypeEnum)" />
    <persist-info
      v-if="Boolean(detail?.persistEvent)"
      :event-status="detail?.eventStatus"
      :snap-time="detail?.snapTime"
      :second-snap-time="detail?.secondSnapTime"
    />
    <monitor-condition v-if="alarmType === AlarmTypeEnum.BEHAVIOR" :detail="detail" />
    <result-info
      v-if="detail?.status && !detail?.taskAssigneeList?.length"
      :handle-way="detail.handleWay"
      :handle-description="detail.handleDescription"
      :handle-by-name="detail.handleByName"
      :handle-time="detail.handleTime"
      :disturb-desc="detail.disturbDesc"
      :command="detail.command"
    />
  </alarm-detail>
</template>
<script lang="ts" setup>
import AlarmBadge from '@/app-school-safe/components/alarm-badge/index.vue';
import AlarmDetail from '@/app-school-safe/components/alarm-detail/index.vue';
import DeviceInfo from '@/app-school-safe/components/alarm-device-info/index.vue';
import ResultInfo from '@/app-school-safe/components/alarm-result-info/index.vue';
import TaskAssignee from '@/app-school-safe/components/task-assignee/index.vue';
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  IFaceDetail,
  IMonitorDetail,
  getFaceAlarmDetail,
  getFaceAlarmRoi,
  getMonitorAlarmDetail,
} from '../services/ai-control';
import FaceInfo from './components/face-info/index.vue';
import LargeModel from './components/large-model/index.vue';
import MonitorCondition from './components/monitor-condition/index.vue';
import MonitorInfo from './components/monitor-info/index.vue';
import PersistInfo from './components/persist-info/index.vue';

import { loginStore } from '@/store/modules/login';
import { isNil, isString } from '@/utils/lodash-es';
import { BehaviorMonitorEnum } from './constants/BehaviorMonitorEnum';
import { EventStatusCode } from './constants/EventStatusEnum';
import { FaceMonitorEnum } from './constants/FaceMonitorEnum';

type paramsType = {
  bizDataJson: {
    alarmTypeCode: string;
    alarmRecordId: string;
  };
};

const alarmType = ref('');
const params = ref<paramsType>({} as paramsType);
const detail = ref<IFaceDetail | IMonitorDetail>();
const currentEventStatusIndex = ref(0);
const loading = ref<boolean>(true);

const userInfo = loginStore().userInfo;

/**
 * 针对行为布控：
 *  1. 未接入审批工单的均有权限处理告警（无审批节点记录）
 *  2. 接入审批工单的当前用户需是当前可审批的节点
 */
const isProcessPermission = computed(() => {
  if (alarmType.value === AlarmTypeEnum.FACE) return true;
  if (!(detail.value as IMonitorDetail)?.taskAssigneeList?.length) return true;
  return (detail.value as IMonitorDetail)?.currentFlowTaskOperatorUsers
    ?.map(item => item.userId)
    ?.includes(userInfo?.userId as string);
});

/**
 * 持续性开始结束选项
 */
const eventStatusEnum = computed(() => {
  if (!Boolean(detail.value?.persistEvent)) return [];
  const eventStatusList = [
    {
      name: '触发',
    },
  ];
  if (detail.value?.eventStatus === EventStatusCode.DONE)
    eventStatusList.push({
      name: '结束',
    });
  return eventStatusList;
});

const fetchDetail = async () => {
  loading.value = true;
  try {
    if (alarmType.value === AlarmTypeEnum.FACE) {
      const res = await getFaceAlarmDetail(params.value?.bizDataJson?.alarmRecordId);
      const { captureId } = res;
      const res2 = await getFaceAlarmRoi(captureId);
      const faceRoi = res2?.faceInfoDTO?.faceRoi;
      detail.value = {
        ...res,
        content: `在${res?.spaceName ?? '未知空间'}处发现${res?.libraryName}，请注意`,
        level: res?.levelCode,
        time: res?.snapTime,
        handleWay: res?.handleContent,
        objectRoi: JSON.stringify(faceRoi ? [faceRoi] : []),
      };
    } else {
      const res = await getMonitorAlarmDetail(params.value?.bizDataJson?.alarmRecordId);
      detail.value = {
        ...res,
        libraryName: res?.monitorName,
        content: `在${res?.spaceName ?? '未知空间'}出现${res.monitorName}，请注意`,
        level: res?.levelCode,
        time: res.snapTime,
        handleWay: res?.handleContent,
      };
    }
  } finally {
    loading.value = false;
  }
};

// 显示处理方式
const processHandle = () => {
  const popParams = {
    alarmType: alarmType.value,
    recordIds: [params.value.bizDataJson?.alarmRecordId],
    showDisturbInfo:
      alarmType.value === AlarmTypeEnum.BEHAVIOR && detail.value?.taskAssigneeList?.length <= 2,
  };
  uni.navigateTo({
    url: `/app-school-safe/ai-control/dispose?params=${JSON.stringify(popParams)}`,
  });
};

// 获取告警等级+详情
const getAlarmAndDetail = () => {
  // 人脸布控 faceAlarmCode
  if (
    Object.values(FaceMonitorEnum).includes(
      params.value.bizDataJson.alarmTypeCode as FaceMonitorEnum,
    )
  ) {
    alarmType.value = AlarmTypeEnum.FACE;
    fetchDetail();
  }
  // 行为布控 behaviorAlarmCode
  if (
    Object.values(BehaviorMonitorEnum).includes(
      params.value.bizDataJson.alarmTypeCode as BehaviorMonitorEnum,
    )
  ) {
    alarmType.value = AlarmTypeEnum.BEHAVIOR;
    fetchDetail();
  }
};

const setCurrentEventStatusIndex = (index: number) => {
  currentEventStatusIndex.value = index;
};

const largeModelResultChangeHandle = () => {
  fetchDetail();
  uni.$emit('reloadAlarmList');
};

onMounted(() => {
  getAlarmAndDetail();
});

onBeforeMount(() => {
  const pageParams = getPageParams();
  const formatData = JSON.parse(decodeURIComponent(pageParams.detail));
  params.value = {
    ...formatData,
    bizDataJson: isString(formatData.bizDataJson)
      ? JSON.parse(formatData.bizDataJson)
      : formatData.bizDataJson,
  };

  uni.$on('alarmDisposeCallBack', fetchDetail);
});

onBeforeUnmount(() => {
  uni.$off('alarmDisposeCallBack', fetchDetail);
});
</script>
<style scoped lang="scss" />
