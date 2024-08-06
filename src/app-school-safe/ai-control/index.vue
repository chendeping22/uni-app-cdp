<template>
  <c-page title="AI布控" class="ai-control" :add-top-gap="false">
    <!-- 接入审批工单后，批量处理无法满足，暂时隐藏入口 -->
    <!-- <template #navbarRight>
      <view
        v-if="reqParams.status === '0'"
        :class="['text-ellipse', 'text-right', { disabled: alarmData.length === 0 }]"
        @click="batchHandle"
      >
        <text>批量处理</text>
      </view>
    </template> -->
    <view class="container">
      <view class="container-header">
        <c-tabs
          v-model:current="activeTabIndex"
          bg-color="white"
          :list="[{ name: '行为布控' }, { name: '人员布控' }]"
          @change="handleChangeTab"
        />
        <view :key="activeTabIndex" class="bg-white mb-b">
          <view :class="{ 'flex-between': !moreSearch, 'plr-xl': !moreSearch }">
            <c-dropdown :key="moreSearch ? 1 : 0" :class="{ 'c-dropdown-custom': !moreSearch }">
              <c-dropdown-item
                v-if="activeTabIndex === 0"
                v-model:value="behaviorValue"
                :type="1"
                title="全部类型"
                width="200rpx"
                :list="behaviorOptions.array"
              />
              <c-dropdown-item
                v-if="activeTabIndex === 1"
                v-model:value="alarmTypeValue"
                :type="1"
                title="布控库"
                width="200rpx"
                :list="alarmTypeOptions.array"
              />
              <c-dropdown-item
                v-model:value="timeRangeValue"
                :type="1"
                title="全部时间"
                width="200rpx"
                :list="timeRangeOptions.array"
              />
              <c-dropdown-item
                v-if="moreSearch"
                v-model:value="statusValue"
                :type="1"
                title="全部状态"
                width="200rpx"
                :list="statusOptions"
              />
            </c-dropdown>
            <view v-if="!moreSearch" class="color-secondary flex-between" @click="moreSearch = true"
              >更多筛选
              <c-icon name="icon_arrow_down" :size="48"></c-icon>
            </view>
          </view>
          <view v-if="moreSearch" class="flex-between plr-xl">
            <c-dropdown :class="activeTabIndex === 0 && largeModelPermission ? 'flex-grow' : ''">
              <c-dropdown-item
                v-if="!sceneList.array.length"
                :type="3"
                title="全部场景"
                width="200rpx"
              >
                <view class="p-all-xl color-placeholder">暂未配置场景</view>
              </c-dropdown-item>
              <c-dropdown-item
                v-else
                v-model:value="sceneId"
                :type="1"
                title="全部场景"
                width="200rpx"
                :list="sceneList.array"
              />
              <c-dropdown-item
                v-if="activeTabIndex === 0 && largeModelPermission"
                v-model:value="largeModelValue"
                :type="1"
                title="大模型校验"
                width="200rpx"
                :list="largeModelOptions.array"
              />
            </c-dropdown>
            <view class="color-primary-light-1 flex-between" @click="moreSearch = false"
              >收起
              <c-icon name="icon_arrow_up" :size="48"></c-icon>
            </view>
          </view>
        </view>
      </view>
      <view class="container-body bg-white">
        <c-refresh-scroll
          ref="refreshScrollRef"
          :fetch-data-func="fetchRecords"
          :page-size="10"
          :auto-mount="false"
        >
          <template #top_area>
            <view v-if="total" class="count">{{ total }}条警告</view>
          </template>
          <view v-if="total" class="scroll-content">
            <alarm-item
              v-for="{
                id,
                levelName,
                levelCode,
                title,
                subTitle,
                snapTime,
                snapImageUrl,
                typeCode,
                largeModelResult,
                largeModelFailReason,
              } in alarmData"
              :id="id"
              :key="id"
              :type-code="typeCode"
              :level-name="levelName"
              :level-code="levelCode"
              :title="title"
              :sub-title="subTitle"
              :snap-time="snapTime"
              :snap-image-url="snapImageUrl"
              :large-model-result="largeModelResult"
              :large-model-fail-reason="largeModelFailReason"
              @navigate-to-detail="navigateToDetail"
            />
            <c-empty-line
              :key="moreSearch ? 1 : 0"
              need-safe-bottom
              :height="moreSearch ? 210 : 130"
            />
          </view>
          <c-empty v-else content="暂无数据" bg-type="gray" />
        </c-refresh-scroll>
      </view>
    </view>
    <tab-bar :current="1" />
  </c-page>
</template>
<script lang="ts" setup>
import usePermissions from '@/hooks/use-permissions';
import { isNil, isNumber } from '@/utils/lodash-es';
import { hasPermission } from '@/utils/permissions';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
getFaceRecord,
getMonitorLibraries,
getPersonMonitorRecords,
getSceneListApi,
} from '../services/ai-control';
import { getAlarmLevels, getAlarmTypeList, getAllSystemConfig } from '../services/common';
import AlarmItem from './components/alarm-item/index.vue';
import TabBar from './components/tab-bar/index.vue';
import { BehaviorMonitorEnum } from './constants/BehaviorMonitorEnum';
import { FaceMonitorEnum } from './constants/FaceMonitorEnum';
import { LargeModelCode, LargeModelEnum } from './constants/LargeModelEnum';

interface ILevel {
  name: string;
  id: number;
  code: string;
}

type IAlarmTypeItem = {
  typeCode: BehaviorMonitorEnum;
  typeName: string;
};

type IOption = {
  label: string;
  value: string | number;
};

const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const total = ref(0);
const activeTabIndex = ref(0);
// 状态筛选条件
const statusOptions = [
  {
    label: '全部状态',
    value: '',
  },
  {
    label: '已处理',
    value: '1',
  },
  {
    label: '未处理',
    value: '0',
  },
];
// 状态
const statusValue = ref('');
const moreSearch = ref(false);
// 行为布控类型筛选条件
const behaviorOptions = reactive<{ array: IOption[] }>({
  array: [{ label: '全部类型', value: '' }],
});
// 行为布控类型选择的值
const behaviorValue = ref('');
// 布控库筛选条件
const alarmTypeOptions = reactive<{ array: IOption[] }>({
  array: [{ label: '布控库', value: '' }],
});
// 布控库选择的值
const alarmTypeValue = ref('');
const timeRangeOptions = reactive<{ array: IOption[] }>({
  array: [
    {
      label: '全部时间',
      value: '',
    },
    {
      label: '今日',
      value: 'today',
    },
    {
      label: '本周',
      value: 'week',
    },
    {
      label: '本月',
      value: 'month',
    },
  ],
});
// 大模型二次校验选择的值
const largeModelValue = ref('');
const largeModelOptions = reactive<{ array: IOption[] }>({
  array: [
    {
      label: '全部结果',
      value: '',
    },
    ...LargeModelEnum,
  ],
});

const sceneList = reactive<{ array: IOption[] }>({
  array: [],
});
const timeRangeValue = ref<string>('');
const sceneId = ref<string>('');
const refreshScrollRef = ref(null as any);
const initPages = {
  pageNum: 1,
  pageSize: 10,
  total: 0,
};

// 是否有大数据模式校验权限
const largeModelPermission = computed(() => {
  return hasPermission(
    usePermissions().value || [],
    'Security:monitor:XWBKRecord:largeModel:Mobile',
  );
});

const hideAlarmTypeCode = async () => {
  // algorithm -- 1':AI布控；'2':智能布控
  const { algorithm } = await getAllSystemConfig();
  return algorithm === '2'
    ? [
        BehaviorMonitorEnum.ANIMAL_ALARM,
        BehaviorMonitorEnum.VIOLENCE_DETECT,
        BehaviorMonitorEnum.CHAIR_DETECTION,
      ]
    : [BehaviorMonitorEnum.FIGHT_MONITOR];
};

const alarmList = reactive({
  value: [],
});

const getAlarmInfo = (code: string) => {
  return alarmList.value.find((item: ILevel) => item.code === code);
};

const alarmData = ref([]);

const getReqTime = (type: string) => {
  const time = {
    alarmTimeStart: '',
    alarmTimeEnd: '',
  };
  switch (type) {
    case 'today':
      time.alarmTimeStart = dayjs().startOf('day').format(FORMAT);
      time.alarmTimeEnd = dayjs().endOf('day').format(FORMAT);
      break;
    case 'week':
      time.alarmTimeStart = dayjs().startOf('week').format(FORMAT);
      time.alarmTimeEnd = dayjs().endOf('week').format(FORMAT);
      break;
    case 'month':
      time.alarmTimeStart = dayjs().startOf('month').format(FORMAT);
      time.alarmTimeEnd = dayjs().endOf('month').format(FORMAT);
      break;
    default:
      time;
      break;
  }
  return time;
};
const reqParams = computed(() => {
  const timeType = timeRangeValue.value;
  const range = getReqTime(timeType);
  const params = {
    status: statusValue.value,
    typeCode: behaviorValue.value,
    libraryId: alarmTypeValue.value,
    alarmTimeStart: range.alarmTimeStart,
    alarmTimeEnd: range.alarmTimeEnd,
    sceneId: sceneId.value,
  };
  // 针对有大数据二次校验的权限，但未选中时, 查询全部数据
  if (largeModelPermission.value && !isNumber(largeModelValue.value)) {
    params.largeModelResults = [
      LargeModelCode.NONE,
      LargeModelCode.PENDING,
      LargeModelCode.SUCCESS,
      LargeModelCode.FAIL,
    ];
  } else if (isNumber(largeModelValue.value)) {
    params.largeModelResults = [largeModelValue.value];
  }
  return params;
});

const fetchRecords = async (pager: any, type: any) => {
  const { pageSize, pageNum } = pager;
  const reqData = {
    pageNum,
    pageSize,
    ...reqParams.value,
  };
  let resData: any = [];
  if (activeTabIndex.value === 1) {
    //人员布控
    resData = await getFaceRecord(reqData);
  } else {
    resData = await getPersonMonitorRecords(reqData);
  }
  const newData = resData.result.map((item: any) => {
    const {
      id,
      typeCode,
      levelCode,
      libraryName,
      spaceName,
      snapTime,
      snapImageUrl,
      snapImgUrl,
      monitorName,
      name,
      largeModelResult,
      largeModelFailReason,
    } = item;

    const title = activeTabIndex.value === 1 ? libraryName : monitorName;
    const imgUrl = activeTabIndex.value === 1 ? snapImageUrl : snapImgUrl;
    const subTitle = `在${spaceName ?? '未知空间'}处发现${title}${
      activeTabIndex.value === 1 ? '出现，人员姓名为' + name : ''
    },请注意`;
    const levelInfo = getAlarmInfo(levelCode);
    return {
      id,
      typeCode,
      levelName: levelInfo?.name,
      levelCode: levelInfo?.code,
      title,
      subTitle,
      snapTime,
      snapImageUrl: imgUrl,
      largeModelResult,
      largeModelFailReason,
    };
  });
  if (type === 'new') {
    alarmData.value = [];
  }
  alarmData.value = alarmData.value.concat(newData);
  total.value = resData.total;
  return resData;
};

const navigateToDetail = (detailInfo: { id: string; typeCode: string }) => {
  const detail = {
    bizDataJson: JSON.stringify({
      alarmRecordId: detailInfo.id,
      alarmTypeCode:
        activeTabIndex.value === 1 ? FaceMonitorEnum.PERSON_CONTROL : detailInfo.typeCode,
    }),
  };
  uni.navigateTo({ url: `/app-school-safe/ai-control/detail?detail=${JSON.stringify(detail)}` });
};

// const batchHandle = () => {
//   if (alarmData.value.length === 0) return;

//   const { status, typeCode, libraryId, alarmTimeStart, alarmTimeEnd } = reqParams.value;
//   uni.navigateTo({
//     url: `/app-school-safe/ai-control/batch?type=${activeTabIndex.value}&status=${status}&typeCode=${typeCode}&libraryId=${libraryId}&alarmTimeStart=${alarmTimeStart}&alarmTimeEnd=${alarmTimeEnd}`,
//   });
// };

const fetchAlarmLevels = async () => {
  const resLibs = await getAlarmLevels();
  alarmList.value = resLibs.map((item: ILevel) => {
    const { name, id, code } = item;
    return { name, id, code };
  });
};

// 获取场景列表
const fetchSceneList = async () => {
  const res = await getSceneListApi();
  const options = (res || []).map((item: { id: string; name: string }) => ({
    value: item.id,
    label: item.name,
  }));
  if (options.length) {
    sceneList.array = [{ label: '全部场景', value: '' }].concat(options);
  }
};

const fetchAlarmTypeList = async () => {
  const hideCode = await hideAlarmTypeCode();
  const pageParams = getPageParams();
  const res = await getAlarmTypeList();
  const sas =
    res.filter((item: any) => {
      return item.applicationCode === 'AI:Monitor'; // 安全校园
    })[0] || {};
  const { alarmCategories = [] } = sas;
  const behaviorControl =
    alarmCategories.filter((category: any) => {
      return category.categoryCode === 'Behavior:Control';
    })[0] || {};
  const libList = (behaviorControl.alarmTypes || [])
    .filter((item: IAlarmTypeItem) => {
      return !hideCode.includes(item.typeCode);
    })
    .map((item: IAlarmTypeItem) => ({
      value: item.typeCode,
      label: item.typeName,
    }));
  behaviorOptions.array = behaviorOptions.array.concat(libList);
  const { viewType, alarmType, typeCode, timeScope, reportSceneId } = pageParams;
  if (viewType === 'item') {
    if (alarmType === '2' && typeCode) {
      behaviorValue.value = typeCode;
    }
    timeRangeValue.value = timeScope;
    activeTabIndex.value = alarmType === '2' ? 0 : 1;
  }
  if (!isNil(reportSceneId)) {
    sceneId.value = reportSceneId;
    moreSearch.value = true;
  }
  fetchRecords(initPages, 'new');
};

const handleChangeTab = (inx: number) => {
  activeTabIndex.value = inx;
  moreSearch.value = false;
  statusValue.value = '';
  behaviorValue.value = '';
  alarmTypeValue.value = '';
  timeRangeValue.value = '';
  sceneId.value = '';
  largeModelValue.value = '';
};

const renderAlarmInit = async () => {
  const resLibs: any = await getMonitorLibraries();
  const libsOptions = (resLibs || []).map(
    (item: { value: any; id: any; label?: string; name: string }) => {
      item.value = item.id;
      item.label = item.name;
      return item;
    },
  );
  alarmTypeOptions.array = alarmTypeOptions.array.concat(libsOptions);
};

const reloadData = () => {
  refreshScrollRef.value.initData();
  alarmData.value = [];
  total.value = 0;
};

watch(
  () => [
    statusValue.value,
    behaviorValue.value,
    alarmTypeValue.value,
    timeRangeValue.value,
    activeTabIndex.value,
    sceneId.value,
    largeModelValue.value,
  ],
  () => {
    reloadData();
  },
);

onBeforeMount(() => {
  fetchAlarmTypeList();
  fetchAlarmLevels();
  renderAlarmInit();
  fetchSceneList();

  uni.$on('reloadAlarmList', reloadData);
});

onBeforeUnmount(() => {
  uni.$off('reloadAlarmList', reloadData);
});
</script>

<style lang="scss" scoped>
.ai-control {
  ::v-deep {
    .c-page-body {
      height: calc(100vh - 5.5rem);
    }
  }
}

.disabled {
  color: $ui-color-disabled;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .container-header {
    height: 274rpx;
  }

  .container-body {
    flex: 1;
    margin-bottom: 100rpx;
  }
}

.count {
  height: 58rpx;
  line-height: 58rpx;
  width: 100%;
  font-size: $ui-font-size-title;
  color: $ui-color-placeholder;
  padding-left: $ui-gap-large;
}

.scroll-content {
  padding: 0 $ui-gap-large;
}
.c-dropdown-custom {
  width: 360rpx;
}
</style>
