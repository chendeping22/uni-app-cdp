<template>
  <view class="banner-bg">
    <view class="top-area">
      <c-dropdown
        class="flex-center flex-left h-72 mar-left"
        show-arrow
        @onChange="handleOpenPicker"
      >
        <c-dropdown-item v-if="dropdownText" :type="0" :title="dropdownText" width="300rpx" />
      </c-dropdown>
      <view class="flex pb-xxs color-success-light-1">
        <view class="mar-left font-secondary"> 学生数： </view>
        <view class="font-secondary">
          {{ studentNum }}
        </view>
      </view>
    </view>
  </view>
  <c-card
    class-name="mlr-l mtb-b everyday-task-select-date"
    padding-type="none"
    radius-type="default"
  >
    <dashboard-date-picker
      v-model:visible="showDatePicker"
      :default-date="date"
      :min-date="dayjs().subtract(12, 'M').valueOf()"
      @change="changeDate"
    >
      <c-cell-item title="日期" :value="dayjs(date).format('YYYY-MM-DD')" />
    </dashboard-date-picker>
  </c-card>
  <!-- 晨午检 -->
  <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default" @click="toDetail">
    <MorningNoon :data="MorningNoonData" :isPDA="isPDA" />
  </c-card>
  <view v-if="isShowOther2">
    <!-- 运动数据 -->
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <SportData
        :date="dayjs(date).format('YYYY-MM-DD')"
        :class-ids="clazzList"
        @jumpToStudentRecord="jumpToStudentRecord"
      />
    </c-card>
    <!-- 睡眠数据 -->
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <SleepData
        :date="dayjs(date).format('YYYY-MM-DD')"
        :class-ids="clazzList"
        @jumpToStudentRecord="jumpToStudentRecord"
      />
    </c-card>
    <!-- 心率数据 -->
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <HeartData
        :date="dayjs(date).format('YYYY-MM-DD')"
        :class-ids="clazzList"
        @jumpToStudentRecord="jumpToStudentRecord"
      />
    </c-card>
  </view>
  <ClazzPicker
    v-model:show="showClzPicker"
    v-model:value="classValue.array"
    title="年级/班级选择"
    :node-code="[0]"
    :has-grade-all="true"
    @onLoadPicker="handleLoadPicker"
  />
</template>

<script lang="ts" setup>
import DashboardDatePicker from '@/app-preprimary-education/components/dashboard-date-picker/index.vue';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, toRaw, watch, watchEffect } from 'vue';
import {
  bandingSchool,
  getHealthDayTasks,
  getInspectionDeviceType,
  statisticsByInspectionModel,
  statisticsByInspectionPDAModel,
} from '../services/health-day';
import {
  getClazzWithSectionByTeacherId2,
  getPositionInfoByUserId,
} from '../services/home-school-communication';
import ClazzPicker, { IPicker } from './components/clazz-picker/index.vue';
import HeartData from './components/heart-data.vue';
import MorningNoon from './components/morning-none.vue';
import SleepData from './components/sleep-data.vue';
import SportData from './components/sport-data.vue';

import { map } from '@/utils/lodash-es';
import { getClzFile } from '../services/health-day';

import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { showInfo } from '@/utils/tools';
import { isHigherMastorOrTeacher } from '../utils/constant';

const emits = defineEmits(['update:currentTab', 'update:extra']);

const locationId = loginStore().currentOrganization?.id;
const userInfo = loginStore().userInfo;
let handleUpdateMenu: (...args: any) => void;

const classValue = reactive({
  array: [] as any[],
});
const clzTree = reactive({
  array: [] as any[],
});
const dropdownText = ref('');
const treeDataList = ref<any[]>([]);
const isCurrentDate = ref(false);
const isShowMorningAndnoon = ref(false);
const isShowOther2 = ref(false);
const showClzPicker = ref(false);
const showDatePicker = ref(false); // 是否显示日期切换选择器
const date = ref(dayjs().subtract(0, 'day').format('YYYY-MM-DD'));
const studentNum = ref(0);
const MorningNoonData = ref();
const clazzList = ref([]);
const isPDA = ref(false);
const showClazzAll = ref(false);

/**选择年段 获取所有班级id */
const filterClazzList = (gradeId: string) => {
  let childrenList = [];

  for (var i = 0; i < treeDataList.value.length; i++) {
    if (treeDataList.value[i].nodeId === gradeId) {
      childrenList = treeDataList.value[i].childNodeList;
    }
  }
  const classList = childrenList.map((item: any) => {
    return item.nodeId;
  });
  clazzList.value = classList;
};

/**获取全部班级id */
const filterAllClazzList = () => {
  let childrenList = [];

  for (var i = 0; i < treeDataList.value.length; i++) {
    const clazz = treeDataList.value[i].childNodeList;
    !clazz || clazz.length !== 0 ? childrenList.push(...treeDataList.value[i].childNodeList) : null;
  }

  const classList = childrenList.map(item => {
    return item.nodeId;
  });
  clazzList.value = classList;
};

const getDeviceType = async () => {
  const res = await getInspectionDeviceType(false);
  if (res) isPDA.value = res.deviceType === 2;
};

const getMorningNoon = async () => {
  const data = {
    inspectionMode: null,
    date: dayjs(date.value).format('YYYY-MM-DD'),
    classIds: clazzList.value,
  };

  if (isPDA) {
    const res = await statisticsByInspectionPDAModel(data);
    MorningNoonData.value = res;
  } else {
    const res = await statisticsByInspectionModel(data);
    MorningNoonData.value = res;
  }
};
const isHaveHand_school = async () => {
  const data1 = {
    date: dayjs(date.value).format('YYYY-MM-DD'),
  };
  const res = await bandingSchool(data1);
  if (res) {
    isShowOther2.value = true;
  } else {
    isShowOther2.value = false;
  }
};
const changeDate = (dateObj: { value: string }) => {
  date.value = dateObj.value;
  getMorningNoon();
  isHaveHand_school();
};

watchEffect(() => {
  isCurrentDate.value = dayjs().format('YYYY-MM-DD') === dayjs(date.value).format('YYYY-MM-DD');
});

/**获取学生数 */
const getStudent = (_gradeId: any, _clzId: any) => {
  const allGrade = treeDataList.value.map(item => item.nodeId);
  const params = {
    clazzIdList: _clzId ? [_clzId] : [],
    gradeIdList: _gradeId ? [_gradeId] : allGrade,
    locationId,
  };
  getClzFile(params).then(res => {
    studentNum.value = res?.total;
  });
};

watch([classValue], () => {
  if (classValue.array.length < 3) return true;
  const _gradeId = classValue.array[1].value;
  const _clzId = classValue.array[2].value;
  getStudent(_gradeId, _clzId);
  if (!_gradeId) {
    filterAllClazzList();
  } else if (_gradeId && !_clzId) {
    filterClazzList(_gradeId);
  } else {
    clazzList.value = _clzId ? [_clzId] : [];
  }
  getMorningNoon();
});

const toDetail = () => {
  if (isCurrentDate.value && !isPDA.value && isShowMorningAndnoon.value) {
    uni.navigateTo({
      url: `/app-preprimary-education/everyday-task/widget/morning-noon/index?clazzList=${JSON.stringify(
        classValue.array,
      )}`,
    });
  } else {
    uni.navigateTo({
      url: `/app-preprimary-education/everyday-task/widget/inspection-record/index?data=${dayjs(
        date.value,
      ).format('YYYY-MM-DD')}&isHistory=0&clazzList=${JSON.stringify(classValue.array)}`,
    });
  }
};

const jumpToStudentRecord = () => {
  emits('update:currentTab', 1);
  emits('update:extra', {
    selectDate: dayjs(date.value).format('YYYY-MM-DD'),
    classValue: classValue.array,
  });
};

const madeData = (dataList: any[]) => {
  const data: { label: any; value: any; children: any[] }[] = [
    {
      label: '全部',
      value: '',
      children: [
        {
          label: '全部',
          value: '',
          children: [],
        },
      ],
    },
  ];
  for (var i = 0; i < dataList.length; i++) {
    if (dataList[i].children.length === 0) {
      data.push({
        label: dataList[i].name,
        value: dataList[i].id,
        children: [
          {
            label: '全部',
            value: '',
            children: [],
          },
        ],
      });
    } else {
      let data2 = [
        {
          label: '全部',
          value: '',
          children: [],
        },
      ];
      for (var j = 0; j < dataList[i].children.length; j++) {
        data2.push({
          label: dataList[i].children[j].name,
          value: dataList[i].children[j].id,
          children: [],
        });
      }
      data.push({
        label: dataList[i].name,
        value: dataList[i].id,
        children: data2,
      });
    }
  }
  return data;
};

const handleOpenPicker = ({ updateMenu }: any) => {
  showClzPicker.value = true;
  if (!handleUpdateMenu) {
    handleUpdateMenu = updateMenu;
  }
};
const fetchClzTree = async () => {
  const userId = loginStore().currentUserType !== EUserType.teacher ? userInfo.userId : userInfo.id;
  const res = await getClazzWithSectionByTeacherId2(userId);
  treeDataList.value = res[0].childNodeList;
};
watchEffect(() => {
  if (showClzPicker.value || !handleUpdateMenu) return;
  const arrValue = toRaw(classValue.array).slice(1);
  if (arrValue.length < 2) {
    handleUpdateMenu(
      0,
      {
        title: '全部',
        valueLabel: '全部',
        type: 0,
      },
      { repeatStatus: 2 },
    );
    return;
  }

  handleUpdateMenu(
    0,
    {
      title: '全部',
      valueLabel:
        arrValue[1].value === ''
          ? arrValue[0].value === ''
            ? classValue.array[0].label
            : arrValue[0].label
          : map(arrValue, item => item.label).join('/'),
      type: 0,
    },
    { repeatStatus: 2 },
  );
});

const getPermissions = async () => {
  const res = await getHealthDayTasks(userInfo.id);
  if (!res) {
    isShowMorningAndnoon.value = false;
  } else {
    isShowMorningAndnoon.value = true;
  }
};

/** 获取用户职位信息 */
const fetchPosition = async () => {
  const res = await getPositionInfoByUserId();
  const roles = res.map(t => t.code);
  showClazzAll.value = isHigherMastorOrTeacher(roles);
};

/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    uni.navigateBack({});
    setTimeout(() => {
      showInfo('暂无权限');
    }, 500);
    return;
  }
  let col_1 = data[0];
  let col_2 = col_1.children[0];
  let col_3 = col_2.children[0];
  await fetchPosition();
  if (userInfo?.clazzIds && userInfo.clazzIds.length && !showClazzAll.value) {
    const school = data.find(t => {
      const grade = t.children.find((k: any) => {
        const clazz = k.children.find((j: any) => {
          return j.value === userInfo.clazzIds[0];
        });
        col_3 = clazz;
        return clazz;
      });
      col_2 = grade;
      return grade;
    });
    col_1 = school;
  }
  classValue.array = [
    { value: col_1.value, label: col_1.label },
    { value: col_2.value, label: col_2.label },
    { value: col_3.value, label: col_3.label },
  ];
  const arrValue = toRaw(classValue.array).slice(1);
  const title =
    arrValue[1].value === ''
      ? arrValue[0].value === ''
        ? data[0].label
        : arrValue[0].label
      : map(arrValue, item => item.label).join('/');
  dropdownText.value = title || '全部';
};
onBeforeMount(() => {
  getDeviceType();
  fetchClzTree();
  getMorningNoon();
  getPermissions();
});
</script>

<style scoped lang="scss">
.mar-left {
  margin-left: 30rpx;
}
.pt-b {
  padding-top: 0;
}

.banner-bg {
  background-image: url('../static/image/health_banner_bg_img.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
  height: 200rpx;
  width: 100%;
  .top-area {
    margin-left: 80rpx;
    :deep {
      .height-cell-default {
        height: 50rpx;
      }
    }
  }
  .select-clazz {
    position: relative;
    top: 50rpx;
  }
}
</style>
