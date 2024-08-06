<template>
  <view class="apply-container">
    <view class="group-container">
      <u-cell-group>
        <u-cell-item title="补签" @click="handleCountersign">
          <template #icon>
            <u-image
              width="54"
              height="54"
              style="margin-right: 30rpx"
              :src="icon_countersign"
            ></u-image>
          </template>
        </u-cell-item>
        <u-cell-item title="请假" @click="handleLeave">
          <template #icon>
            <u-image width="54" height="54" style="margin-right: 30rpx" :src="icon_leave"></u-image>
          </template>
        </u-cell-item>
      </u-cell-group>
    </view>

    <view class="group-container">
      <u-cell-group>
        <u-cell-item title="申请记录" @click="linkToWorkOrder"></u-cell-item>
      </u-cell-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { onMounted, ref } from 'vue';
import icon_countersign from '../../static/attendance/icon_countersign.svg';
import icon_leave from '../../static/attendance/icon_leave.svg';
import { fetchWorkFlowId } from '../services/employeeAttendance';

const leaveFlowId = ref('');
const reSinningFlowId = ref('');
onMounted(() => {
  initApply();
});

async function initApply() {
  fetchWorkFlowId('ygqj').catch(res => {
    if (res.id) {
      leaveFlowId.value = res.id;
    }
  });
  fetchWorkFlowId('kqbq').catch(res => {
    if (res.id) {
      reSinningFlowId.value = res.id;
    }
  });
}
// tab切换
const linkToWorkOrder = () => {
  const url = '/pages/todoCenter/home/index?tab=2&flowCodes=ygqj,kqbq';
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};

const linkToWorkFlowDetails = (flowId: string) => {
  const baseUrl = '/pages/workFlow/flowBefore/index?config=';
  const params = {
    id: '',
    flowId: flowId,
    pageType: 'checkOnWork',
    opType: '-1',
  };
  const url = baseUrl + JSON.stringify(params);
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};
const handleCountersign = () => {
  linkToWorkFlowDetails(reSinningFlowId.value);
};

const handleLeave = () => {
  linkToWorkFlowDetails(leaveFlowId.value);
};
</script>

<style lang="scss" scoped>
.apply-container {
  margin: 36rpx 36rpx;
}
.group-container {
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 36rpx;
}
</style>
