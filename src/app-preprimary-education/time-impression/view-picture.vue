<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <c-refresh-scroll ref="refreshScroll" :fetch-data-func="fetchDataFunc" :auto-mount="false">
      <template #top_area>
        <ProfileStudent
          :student="curStudent"
          :is-batch-check-parent="isBatchCheck"
          @on-batch-check="handleBatchCheck"
          @on-add-source="handleAddSource"
          @openCameraEvent="openCameraEvent"
          @openPictureEvent="openPictureEvent"
        />
        <CcDropdown class-name="bg-white" show-arrow @onChange="handleDropdownOnChange">
          <CcDropdownItem :type="0" title="上传时间" width="220rpx" />
          <CcDropdownItem
            v-model:value="params.resourceType"
            :type="1"
            title="照片/视频"
            :list="typeOptions"
            @onSelect="handleSelectMediaType"
          />
        </CcDropdown>
      </template>

      <TimeImpressionGroup
        :is-batch-check="isBatchCheck"
        :type="pageParams.type"
        :task-id="pageParams.observeTaskId"
        :student-id="pageParams.id"
      />
    </c-refresh-scroll>
    <c-bottom v-if="isBatchCheck">
      <view class="flex-between">
        <view class="flex-between w100 pr-l">
          <c-checkbox v-model:model-value="isCheckAll" @change="handleCheckAll">
            <text class="font-title"> 全选 </text>
          </c-checkbox>
          <view class="flex color-secondary" hover-class="none" hover-stop-propagation="false">
            已选择
            <view class="flex-center icon-44 bg-line-default radius-round mlr-xs">
              <text class="lh-0 font-secondary"> {{ curSelects.length || '0' }} </text>
            </view>
          </view>
        </view>
        <c-button height-size="button-xxs" :disabled="curSelects.length === 0" @click="handleOper">
          <text class="plr-b">操作</text>
        </c-button>
      </view>
    </c-bottom>
    <c-calendar
      v-model:open="showCalendar"
      v-model="calendarData"
      mode="date"
      z-index="10000000"
      @change="handleSwitchDate"
    />
    <c-select
      v-model:show="isOpen"
      v-model:list="listSelect"
      :auto-close-after-select="false"
      :show-check-icon="true"
      :mask-close-able="false"
      title="请选择"
      title-type="text"
      @onConfirm="handleConfirm"
    />
  </mt-page>
</template>
<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { flatten, omit } from '@/utils/lodash-es';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { onShow } from '@dcloudio/uni-app';
import { onBeforeMount, ref, toRaw, toRefs, watch, watchEffect } from 'vue';
import { IDataLoadType, IPager } from '../components/imp-refresh-scroll/imp-refresh-scroll.vue';
import mtPage from '../components/mt-page/mt-page.vue';
import { batchDownLoad } from '../utils/download';
import { getPageParams } from '../utils/tools';
import CcDropdownItem from './components/cc-dropdown-item/index.vue';
import CcDropdown from './components/cc-dropdown/index.vue';
import ProfileStudent from './components/profile-student/index.vue';
import TimeImpressionGroup from './components/time-impression-group/index.vue';
import {
  IPageTimeSetType,
  SourceType,
  UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  UPLOAD_IMAGE_MAX_SIZE,
} from './utils/constants';
import { getTitle } from './utils/get-title';
import { isGuardian } from './utils/is';
import { resourceStudents } from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

const title = ref(getTitle());
interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
const typeOptions = [
  {
    label: '照片/视频',
    value: undefined,
  },
  ...SourceType,
];
const store = useTimeImpression();
const { params, curSelects, curStudent, list, total, timeList } = toRefs(store.viewPicturePage);
const isBatchCheck = ref(false);
const isCheckAll = ref(false);
const showCalendar = ref(false);
const calendarData = ref('');
const refreshScroll = ref();
const isOpen = ref(false);
const listSelect = ref([
  { text: '照片', checked: false, disabled: false },
  { text: '视频', checked: false, disabled: false },
]);
const pageParams = ref({} as IPageTimeSetType);
const isFromPortfolio = ref(0);

let handleUpdateMenu: (...args: any) => void;

const handleDropdownOnChange = (e: { inx: number; updateMenu: any }) => {
  if (!handleUpdateMenu) {
    handleUpdateMenu = e.updateMenu;
  }
  if (e.inx === 0) {
    showCalendar.value = true;
  }
};
onShow(() => {
  reLoadEvent();
});
const reLoadEvent = () => {
  refreshScroll.value?.initData();
};
const handleBatchCheck = (val: boolean) => {
  isBatchCheck.value = val;
  if (isBatchCheck.value) {
    store.viewPicturePage.curSelects = [];
  }
};
const downLoads = () => {
  const urls = store.viewPicturePage.curSelects.map(t => t.resourceURL);
  const types = store.viewPicturePage.curSelects.map(t => t.resourceType);
  batchDownLoad(urls, types);

  isBatchCheck.value = false;
};
const handleAddSource = () => {
  const { id, type } = pageParams.value;
  store.sourceLibPage.curSelects = [];
  // NOTE: 对应功能无操作入口，暂不迁移
  // uni.navigateTo({
  //   url: `/subPackages/time-impression/add-source?id=${id}&type=${type}&studentName=${curStudent.value.studentName}`,
  // });
};

const handleCheckAll = (val: boolean) => {
  if (val) {
    const all: any[] = [];
    flatten(
      toRaw(timeList.value).map(t =>
        t.resourceGroups.map(one => one.resourceList.map(item => all.push(item))),
      ),
    );
    store.viewPicturePage.updateCurSelects(all);
  } else {
    store.viewPicturePage.updateCurSelects([]);
  }
};

const handleOper = () => {
  if (curSelects.value.length > 50) {
    uni.showToast({
      title: '最多选择50张图片或视频',
      icon: 'none',
    });
    return;
  }
  const { id, type } = pageParams.value;
  isBatchCheck.value = false;

  const { observeTaskId: taskId, id: studentId } = pageParams.value;
  const query = `id=${id}&type=${type}&taskId=${taskId}&studentId=${studentId}&studentName=${curStudent.value.studentName}`;
  uni.navigateTo({
    url: `/app-preprimary-education/time-impression/operation-way?${query}`,
  });
};

watchEffect(() => {
  isCheckAll.value = curSelects.value.length > 0 && curSelects.value.length === total.value;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
  const { id, type: pageType, observeTaskId } = pageParams.value;
  await store.viewPicturePage.getCommonQuery(pageType, id, observeTaskId);
  return { total: 0 };
};

const handleSelectMediaType = (type?: number) => {
  if (!type) {
    store.viewPicturePage.setParams({
      ...omit(params.value, 'resourceType'),
    });
  } else {
    store.viewPicturePage.setParams({
      ...params.value,
      resourceType: type,
    });
  }

  fetchDataFunc({} as any, 'new');
};

const handleSwitchDate = (date: { result: string }) => {
  // 无效选择
  if (date.result.includes('NaN')) {
    calendarData.value = '';
    return;
  }
  calendarData.value = date.result;
  handleUpdateMenu(
    0,
    {
      title: date.result,
      valueLabel: '',
      type: 0,
    },
    { repeatStatus: 2 },
  );
  store.viewPicturePage.setParams({
    ...params.value,
    startDate: `${date.result}`,
    endDate: `${date.result}`,
  });
  fetchDataFunc({} as any, 'new');
};

watch(
  () => showCalendar.value,
  val => {
    if (val) return;
    handleUpdateMenu &&
      handleUpdateMenu(
        0,
        {
          title: calendarData.value || '上传时间',
          valueLabel: '',
          type: 0,
        },
        { repeatStatus: 2 },
      );
  },
);

const getInfo = async () => {
  const { id } = pageParams.value;
  const data: { id: string } = {
    id,
  };

  if (isGuardian() || isFromPortfolio.value) {
    //消息中心跳转过来
    const res = await resourceStudents(data);
    curStudent.value = { ...res, studentName: res.name };
  }
};
onBeforeMount(() => {
  const urlParams = getPageParams();
  if (!urlParams.id) {
    const { currentOrganization } = loginStore();
    urlParams.id = currentOrganization?.childId;
  }
  if (!urlParams.type) {
    urlParams.type = 'timeset';
  }
  pageParams.value = urlParams;
  isFromPortfolio.value = Number(urlParams.isPortfolio || 0);

  params.value = {} as any;
  list.value = [];
  fetchDataFunc({} as any, 'new');
  getInfo();

  uni.setNavigationBarTitle({
    title: title.value,
  });
});
const handleConfirm = async (type: any) => {
  if (type[0] == 0) {
    //  打开图片相册
    imageEvent(['album']);
  } else {
    //  打开视频相册
    chooseAndUploadVideo({ sourceType: ['album'], compressed: false, maxSize: 200 }).then(files => {
      const data = [
        {
          kind: 'video',
          url: files[1]?.presignedUrl,
          fileId: files[1]?.fileId,
        },
      ];
      const data2 = [
        {
          fileId: '',
          type: 2,
          url: '',
        },
      ];
      store.sourceUploadData.setFileData(data);
      store.sourceUploadData.setOrigionFileData([data2]);
      //页面跳转
      uni.navigateTo({
        url: `/app-preprimary-education/time-impression/add`,
      });
    });
  }
  isOpen.value = false;
};
const imageEvent = (typeList: any) => {
  chooseAndUploadImage(
    [],
    10,
    false,
    false,
    false,
    UPLOAD_IMAGE_MAX_SIZE,
    true,
    typeList,
    true,
    UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  ).then((files: any) => {
    console.log('🚀 ~ file: home.vue:60 ~ chooseAndUploadImage ~ files:', files);
    if (files.length === 0) {
      return;
    }
    const data = files[1]?.map((item: SportsTaskMedia) => {
      return {
        ...item,
        kind: 'image',
        url: item?.url,
      };
    });
    store.sourceUploadData.setFileData(data);
    store.sourceUploadData.setOrigionFileData(files[2]);
    //页面跳转
    uni.navigateTo({
      url: `/app-preprimary-education/time-impression/add`,
    });
  });
};
const openCameraEvent = async () => {
  // 打开摄像头
  imageEvent(['camera']);
};
const openPictureEvent = async () => {
  isOpen.value = true;
};
</script>
