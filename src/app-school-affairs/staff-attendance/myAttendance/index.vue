<template>
  <view class="my-attendance">
    <view class="attendance-head">
      <u-avatar
        size="100"
        class="avatar"
        mode="square"
        :src="reportData.personHeadImg || icon_avatar"
        :show-sex="true"
        :sex-icon="reportData.gender === 1 ? 'man' : 'woman'"
      ></u-avatar>
      <view class="header-details">
        <view class="person-name">{{ reportData.personName }}</view>
        <view class="depart-name">
          <text>{{ reportData.departName }}</text>
          <view v-if="reportData.exceptionCode !== 2" class="rule-tips" @click="handleToRules">
            <text class="color-primary">查看规则</text>
            <u-icon color="#176bfb" name="arrow-right" size="24" />
          </view>
        </view>
      </view>
    </view>
    <view v-if="reportData.exceptionCode === 2" class="empty-container">
      <u-empty-custom text="未配置考勤规则，请联系管理员" />
    </view>
    <template v-else>
      <view>
        <view class="tabs-content">
          <u-tabs
            v-model="currentTab"
            :list="dateCycleList"
            :is-scroll="false"
            @change="(index: number) => changeTabs(index)"
          />
        </view>
        <view class="content-item">
          <DashboardDatePicker :mode="dateMode" :default-date="dateTime" @change="changeDateObj">
            <u-cell-group :border="false">
              <u-cell-item
                title-style="fontSize: 34rpx; color: #000000e0;"
                value-style="fontSize: 34rpx; color: #000000a6;"
                :border-bottom="false"
                title="统计时间"
                :value="dateLabel"
              />
            </u-cell-group>
          </DashboardDatePicker>
          <AttendanceList
            v-if="dateMode === dateCycleCode.DAY"
            :attendance-data-list="reportData.staffReportDetailDtoList"
            @applyCounterSign="applyCounterSign"
          />
          <ArcProgress
            v-else
            :attendance="reportData.attendance"
            :should-arrive="reportData.shouldArrive"
            :attendance-text="'出勤天数'"
            :should-arrive-text="'应到天数'"
          />
        </view>
        <view v-if="dateMode !== dateCycleCode.DAY" class="content-list-con">
          <AbNormalList
            :exception-data-map="{
              [exceptionCode.LATE]: reportData.lateList || [],
              [exceptionCode.EARLY]: reportData.earlyList || [],
              [exceptionCode.ABSENCE]: reportData.absenceList || [],
              [exceptionCode.COUNTERSIGN]: reportData.counterSignList || [],
            }"
            @applyCounterSign="applyCounterSign"
          />
        </view>
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import AbNormalList from '../components/abNormalList.vue';
import ArcProgress from '../components/arcProgress.vue';
import AttendanceList from '../components/attendanceList.vue';
import { dateCycleCode, dateCycleEnum } from '../constants/dateCycleEnum';
import { exceptionCode } from '../constants/exceptionTypeEnum';
import { fetchWorkFlowId } from '../services/employeeAttendance';
import useReportData from '../services/useReportData';
import DashboardDatePicker from '/src/components/dashboard-date-picker/index.vue';
import icon_avatar from '/static/avatar.png';

const currentTab = ref(0);
const dateLabel = ref<any>(dayjs().format('YYYY-MM-DD'));
const dateTime = ref<any>(dayjs());
const dateMode = ref(dateCycleCode.DAY);
const refresh = ref(false);
const dateCycleList = ref(dateCycleEnum);
const reportData = useReportData({
  dataCycle: dateMode,
  dataDate: dateTime,
  refresh,
});
const reSinningFlowId = ref('');
const changeTabs = (index: number) => {
  currentTab.value = index;
  dateMode.value = dateCycleEnum[index].value;
};
const changeDateObj = (dateObj: any) => {
  dateMode.value = dateObj.mode;
  dateLabel.value = dateObj.label;
  dateTime.value = dateObj.value;
  refresh.value = true;
};

const applyCounterSign = async () => {
  const baseUrl = '/pages/workFlow/flowBefore/index?config=';
  const params = {
    id: '',
    flowId: reSinningFlowId.value,
    opType: '-1',
    pageType: 'checkOnWork',
  };
  const url = baseUrl + JSON.stringify(params);
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};
onMounted(() => {
  refresh.value = true;
  fetchWorkFlowId('kqbq').catch(res => {
    if (res.id) {
      reSinningFlowId.value = res.id;
    }
  });
});

const handleToRules = () => {
  uni.navigateTo({
    url: `/app-school-affairs/staff-attendance/rule/index`,
  });
};
</script>

<style lang="scss" scoped>
.attendance-head {
  display: flex;
  background: #fff;
  padding: 24rpx;
  margin-top: 2rpx;
  align-items: center;
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  flex: none;
}
.header-details {
  margin-left: 32rpx;
  flex: auto;
  width: 1px;
}
.person-name {
  color: #1d2129;
  font-size: 32rpx;
  line-height: 60rpx;
  height: 60rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.depart-name {
  display: flex;
  color: #86909c;
  font-size: 24rpx;
}
.tabs-content {
  margin-bottom: 24rpx;
  border-radius: 10rpx;
  border-top: 2rpx solid #f5f5f5;
  // box-shadow: 0px 0px 1.25rem 0px rgba(29, 33, 41, 0.05);
}
.content-item {
  margin: 0 32rpx;
  padding-bottom: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0px 0px 1.25rem 0px rgba(29, 33, 41, 0.05);
  overflow: hidden;
}
.content-list-con {
  margin: 20rpx 32rpx 150rpx;
  padding: 20rpx 32rpx 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0px 0px 1.25rem 0px rgba(29, 33, 41, 0.05);
}
.color-primary {
  margin: 0 10rpx;
  color: #176bfb;
}
.empty-container {
  margin-top: 280rpx;
}
</style>
