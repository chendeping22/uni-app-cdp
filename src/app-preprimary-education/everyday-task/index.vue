<template>
  <mt-page v-if="isGuardian" title="健康详情" theme="default" :show-top-gap="false">
    <view class="flex bg-white p-all-b">
      <c-avatar
        class-name="radius-round "
        :src="headImgUrl || ''"
        :sex="String(baseInfoResp?.gender) === '1' ? 'man' : 'woman'"
        type="child"
        :size="108"
      />
      <view class="flex-grow ml-l">
        <view class="flex-inline">
          <text class="font-xt font-base"> {{ baseInfoResp?.name }} </text>
          <c-icon
            v-if="baseInfoResp?.gender === 2"
            name="icon_gender_female"
            size="32"
            color-type="error"
          />
          <c-icon v-else name="icon_male" size="32" color-type="primary" />
        </view>
        <view class="font-secondary color-placeholder pt-xxs flex">
          <view class="ml-xs"> 今日情况 </view>
          <view :class="['ml-xs', alertMessage === '正常' ? 'color-success' : 'color-error']">
            {{ alertMessage }}
          </view>
        </view>
      </view>
    </view>
    <c-card class-name="mlr-l mtb-b" padding-type="none" radius-type="default">
      <dashboard-date-picker
        v-model:visible="showDatePicker"
        :default-date="dayjs(date)"
        :min-date="dayjs().subtract(12, 'M').valueOf()"
        @change="changeDate"
      >
        <c-cell-item title="时间" :value="dayjs(date)?.format('YYYY-MM-DD')" />
      </dashboard-date-picker>
    </c-card>
    <!-- 晨午检 -->
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <MorningNoon :data="allDatas" />
    </c-card>
    <view v-if="isShowOther2">
      <!-- 运动数据 -->
      <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
        <SportData :data="allDatas" :date="date" :student-id="id || ''" :isGuardian="isGuardian" />
      </c-card>
      <!-- 睡眠数据 -->
      <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
        <Sleep :data="allDatas" />
      </c-card>
      <!-- 心率数据 -->
      <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
        <Heart
          :data="allDatas"
          :date="date"
          :student-id="id || ''"
          :isGuardian="isGuardian"
          @toHeartDetail="toHeartDetail"
        />
      </c-card>
    </view>
  </mt-page>
  <mt-page
    v-else
    title="一日三检"
    theme="default"
    :show-top-gap="false"
    :show-bottom-gap="false"
    :show-notice-bar="false"
  >
    <Statistics v-if="currentTab === 0" v-model:currentTab="currentTab" v-model:extra="extra" />
    <StudentRecord v-else :extra="extra" />
    <c-tab-bar
      v-model:current="currentTab"
      class-name="class-clound-gurrdian"
      :list="barList"
      :icon-size="40"
      :inactive-color="uiColor.secondary"
      :active-color="uiColor.primary"
      bg-color="white"
      @change="onChangeTab"
    />
  </mt-page>
</template>
<script lang="ts" setup>
import DashboardDatePicker from '@/app-preprimary-education/components/dashboard-date-picker/index.vue';
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import Heart from '@/app-preprimary-education/everyday-task/common/healthday-detail/components/heart.vue';
import MorningNoon from '@/app-preprimary-education/everyday-task/common/healthday-detail/components/morning-none.vue';
import Sleep from '@/app-preprimary-education/everyday-task/common/healthday-detail/components/sleep.vue';
import SportData from '@/app-preprimary-education/everyday-task/common/healthday-detail/components/sport.vue';
import {
  bandingParent,
  bandingSchool,
  getHealthData,
  getHealthData_teacher,
  getStudentRecords,
} from '@/app-preprimary-education/services/health-day';
import { studentDetail } from '@/app-preprimary-education/services/home-school-communication';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { onBeforeMount, ref } from 'vue';

import statisticsDefault from '../static/image/tabbar/bar_icon_statistics_default.png';
import statisticsNormal from '../static/image/tabbar/bar_icon_statistics_pitch.png';
import recordDefault from '../static/svg/icon_apply_default.svg';
import recordNormal from '../static/svg/icon_apply_normal.svg';
import { uiColor } from '../utils/ui-js-value';
import Statistics from './statistics.vue';
import StudentRecord from './studentRecord.vue';
import { getStudentDetailAvatarUrl } from './util';

const id = ref(null);
const isGuardian = loginStore().currentUserType != EUserType.teacher;
const showDatePicker = ref(false); // 是否显示日期切换选择器
const date = ref('');
const isShowOther2 = ref(false);
const baseInfoResp = ref({});
const allDatas = ref({});
const alertMessage = ref('');
const headImgUrl = ref('');

const getBaseInfo = async () => {
  const res = await studentDetail(id.value);
  baseInfoResp.value = res.baseInfoResp;
  headImgUrl.value = getStudentDetailAvatarUrl(res?.baseInfoResp?.imageResps);
};
const getMainInfo = async () => {
  const data = {
    studentId: id.value,
    date: dayjs(date.value).format('YYYY-MM-DD'),
  };
  const res = await getHealthData(data);
  allDatas.value = res;
};
const getMainInfo_teacher = async () => {
  const data = {
    studentId: id.value,
    date: dayjs(date.value).format('YYYY-MM-DD'),
  };
  const res = await getHealthData_teacher(data);
  allDatas.value = res;
};
const todaySituation = async () => {
  const res = await getStudentRecords(id.value);
  if (res?.checkResultPrompt) {
    alertMessage.value = '异常';
  } else {
    alertMessage.value = '正常';
  }
};
const isHaveHand_guardian = async () => {
  const data = {
    date: dayjs(date.value).format('YYYY-MM-DD'),
    studentId: id.value,
  };
  const res = await bandingParent(data);
  if (res) {
    isShowOther2.value = true;
  } else {
    isShowOther2.value = false;
  }
};
const isHaveHand_school = async () => {
  const data = {
    date: dayjs(date.value).format('YYYY-MM-DD'),
    studentId: id.value,
  };
  const res = await bandingSchool(data);
  if (res) {
    isShowOther2.value = true;
  } else {
    isShowOther2.value = false;
  }
};
const changeDate = (dateObj: { value: string }) => {
  date.value = dateObj.value;
  //判断是有有手环，没有只展示晨午检
  if (isGuardian) {
    isHaveHand_guardian();
  } else {
    isHaveHand_school();
  }
  if (isGuardian) {
    getMainInfo();
  } else {
    getMainInfo_teacher();
  }
};
const toHeartDetail = () => {
  const allData = JSON.stringify(allDatas.value);
  uni.navigateTo({
    url: `/app-preprimary-education/everyday-task/common/heart-detail/index?date=${dayjs(
      date.value,
    ).format('YYYY-MM-DD')}&id=${id.value}&data=${allData}`,
  });
};
const init = async () => {
  getBaseInfo();
  todaySituation();
  if (isGuardian) {
    isHaveHand_guardian();
    getMainInfo();
  } else {
    isHaveHand_school();
    getMainInfo_teacher();
  }
};
onBeforeMount(() => {
  if (isGuardian) {
    const { id: id2, selectDate } = getPageParams();
    id.value = id2;
    if (!id.value) {
      id.value = loginStore().currentOrganization?.childId;
    }
    date.value = selectDate ? selectDate : dayjs().subtract(0, 'day').format('YYYY-MM-DD');
    init();
  }
});

const currentTab = ref(0);
const extra = ref({});
const barList = [
  {
    text: '统计',
    iconPath: statisticsDefault,
    selectedIconPath: statisticsNormal,
  },
  {
    text: '学生记录',
    iconPath: recordDefault,
    selectedIconPath: recordNormal,
  },
];

// const emits = defineEmits(['handleToDetail']);
/**tab-bar切换事件*/
const onChangeTab = (val: number) => {
  currentTab.value = val;
  extra.value = {};
};
</script>

<style scoped lang="scss">
.color-success {
  color: $uni-color-success;
}
.color-error {
  color: $uni-color-error;
}
</style>
