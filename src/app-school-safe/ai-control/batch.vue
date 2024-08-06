<template>
  <c-page title="批量处理">
    <template #navbarRight>
      <view class="text-right" @click="handleBatchStatusChange">{{
        batchStatus ? '取消全选' : '全选'
      }}</view>
    </template>
    <view class="bg-white plr-l">
      <c-refresh-scroll ref="refreshScrollRef" :fetch-data-func="fetchRecords" :page-size="10">
        <alarm-item
          v-for="{ id, levelName, levelCode, title, subTitle, snapTime, snapImageUrl } in alarmData"
          :id="id"
          :key="id + checkSelected(id)"
          :is-can-select="true"
          :is-selected="checkSelected(id)"
          :level-name="levelName"
          :level-code="levelCode"
          :title="title"
          :sub-title="subTitle"
          :snap-time="snapTime"
          :snap-image-url="snapImageUrl"
          @select-changed="handleSelectedChange"
        />
      </c-refresh-scroll>
    </view>

    <view class="footer" :class="`${disabled ? 'disabled' : ''}`">
      <view class="count-container">
        已选
        <view class="count">{{ selected.length }}</view>
      </view>
      <u-button class="handle-button" :disabled="disabled" type="primary" @click="onClickRelation">
        处理
      </u-button>
    </view>
  </c-page>
</template>
<script lang="ts" setup>
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { AlarmTypeEnum } from '../constants/AlarmTypeEnum';
import { getFaceRecord, getPersonMonitorRecords } from '../services/ai-control';
import { getAlarmLevels } from '../services/common';
import AlarmItem from './components/alarm-item/index.vue';

type paramsType = {
  type: string;
  status: string;
  typeId: string;
  libraryId: string;
  alarmTimeStart: string;
  alarmTimeEnd: string;
};
interface ILevel {
  name: string;
  id: number;
  code: string;
}

const refreshScrollRef = ref(null as any);
const batchStatus = ref(false);
const params = ref<paramsType>({} as paramsType);
const alarmData = ref<any[]>([]);
const alarmList = ref<ILevel[]>([]);

const selected = ref<string[]>([]);

const getAlarmInfo = (code: string) => {
  return alarmList.value.find((item: ILevel) => item.code === code);
};

const allIds = computed(() => {
  return alarmData.value.map(item => item.id);
});

const disabled = computed(() => selected.value.length === 0);

const checkSelected = (id: string) => {
  return selected.value?.includes(id);
};

const handleSelectedChange = (data: { id: string; isSelected: boolean }) => {
  if (data.isSelected) {
    selected.value = selected.value.concat(data.id);
  } else {
    const index = selected.value.lastIndexOf(data.id);
    selected.value.splice(index, 1);
  }
};

const handleAlarmSelectAll = () => {
  selected.value = [...allIds.value];
};
const handleAlarmSelectCancle = () => {
  selected.value = [];
};

const handleBatchStatusChange = () => {
  const oldStatus = batchStatus.value;

  if (oldStatus) {
    handleAlarmSelectCancle();
  } else {
    handleAlarmSelectAll();
  }

  batchStatus.value = !oldStatus;
};

const fetchAlarmLevels = async () => {
  const resLibs = await getAlarmLevels();

  alarmList.value = resLibs.map((item: ILevel) => {
    const { name, id, code } = item;

    return { name, id, code };
  });
};

const fetchRecords = async (pager: any, type: any) => {
  const { pageSize, pageNum } = pager;
  const reqData = {
    pageNum,
    pageSize,
    ...params.value,
  };

  let resData: any = [];
  if (reqData.type === '1') {
    //人员布控
    resData = await getFaceRecord(reqData);
  } else {
    resData = await getPersonMonitorRecords(reqData);
  }

  const newData = resData.result.map(
    (item: {
      id: any;
      alarmLevel: any;
      levelCode: any;
      libraryName: any;
      spaceName: any;
      snapTime: any;
      snapImageUrl: any;
      snapImgUrl: any;
      monitorName: any;
      name: string;
    }) => {
      const {
        id,
        levelCode,
        libraryName,
        spaceName,
        snapTime,
        snapImageUrl,
        snapImgUrl,
        monitorName,
        name,
      } = item;

      const title = reqData.type === '1' ? libraryName : monitorName;
      const imgUrl = reqData.type === '1' ? snapImageUrl : snapImgUrl;
      const subTitle = `在${spaceName ?? '未知空间'}处发现${title}${
        reqData.type === '1' ? '出现，人员姓名为' + name : ''
      },请注意`;

      const levelInfo = getAlarmInfo(levelCode);
      return {
        id,
        levelName: levelInfo?.name,
        levelCode: levelInfo?.code,
        title,
        subTitle: subTitle,
        snapTime,
        snapImageUrl: imgUrl,
      };
    },
  );
  if (type === 'new') {
    alarmData.value = [];
  }
  alarmData.value = alarmData.value.concat(newData);
  return resData;
};

const onClickRelation = () => {
  const popParams = {
    alarmType: params.value.type === '1' ? AlarmTypeEnum.FACE : AlarmTypeEnum.BEHAVIOR,
    recordIds: selected.value,
  };
  uni.navigateTo({
    url: `/app-school-safe/ai-control/dispose?params=${JSON.stringify(popParams)}`,
  });
};

const alarmDisposeCallBack = async () => {
  fetchRecords(
    {
      pageNum: 1,
      pageSize: 10,
      total: 0,
    },
    'new',
  );
  selected.value = [];
  batchStatus.value = false;
};

onBeforeMount(async () => {
  const pageParams = getPageParams();
  params.value = pageParams;
  await fetchAlarmLevels();
  uni.$on('alarmDisposeCallBack', alarmDisposeCallBack);
});

onBeforeUnmount(() => {
  uni.$off('alarmDisposeCallBack', alarmDisposeCallBack);
});
</script>

<style lang="scss" scoped>
.scroll-view {
  width: 100%;
  box-sizing: border-box;
  background-color: $ui-color-white;
  padding: 0 $ui-gap-large 96rpx $ui-gap-large;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $ui-color-white;
  height: 96rpx;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-left: $ui-gap-large;
  .count-container {
    display: flex;
    align-items: center;
    font-size: $ui-font-size-title;
    color: $ui-color-base;

    .count {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 44rpx;
      border-radius: $ui-radius-large;
      min-width: 44rpx;
      margin-left: $ui-gap-xs;
      background-color: $ui-color-blue;
      color: $ui-color-white;
      padding: 0 $ui-gap-xs;
    }
  }

  .button {
    border-radius: 0;
  }
  .handle-button {
    margin: 0;
    width: 288rpx;
  }

  &.disabled {
    .count-container {
      .count {
        padding: 0;
        background-color: $ui-color-fill-deep;
        color: $ui-color-placeholder;
      }
    }
  }
}
</style>
