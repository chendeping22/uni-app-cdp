<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <c-refresh-scroll
      ref="refreshScroll"
      :fetch-data-func="fetchDataFunc"
      :page-size="20"
      :auto-mount="true"
    >
      <template #top_area>
        <view class="bg-white plr-l ptb-b flex-between">
          <view class="flex-inline">
            <view class="font-xt mr-s bold">{{ studentData?.name }}</view>
            <c-icon
              v-if="studentData?.gender == 2"
              name="icon_gender_female"
              color-type="warnning"
              :size="32"
            />
            <c-icon v-else name="icon_male" color-type="primary" :size="32" />
          </view>
        </view>
      </template>
      <view class="plr-l ptb-s flex-between button-area">
        <view class="button-camera" :style="{ width: '48%' }" @click="cameraEvent">
          <text class="mr-l button-camera-text">拍照记录</text>
        </view>
        <view class="button-picture" :style="{ width: '48%' }" @click="pictureEvent">
          <text class="mr-l button-picture-text">本地选择</text>
        </view>
      </view>
      <TimeImpressionGroup :list="lists" />
    </c-refresh-scroll>
    <view v-if="isGuardian" class="draft-button" @click="draftEvent">
      <c-image :src="iconDraft" width="80" height="80" />
      <text>草稿箱</text>
    </view>
    <c-select
      v-model:show="isOpen"
      v-model:list="list"
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
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { getPageParams } from '@/utils/tools';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, onBeforeMount, ref } from 'vue';
import iconDraft from '../static/image/draft_btn.png';
import TimeImpressionGroup from './components/time-impression-group/index.vue';
import { UPLOAD_IMAGE_DEFAULT_SIZE_TYPE, UPLOAD_IMAGE_MAX_SIZE } from './utils/constants';
import { getChildsById } from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';
const title = computed(() => '观察记录');
interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
const store = useTimeImpression();
const lists = ref<any>([]);
const studentData = ref<any>({});
const currentId = ref<any>();
const isOpen = ref(false);
const refreshScroll = ref();
const isFromPortfolio = ref(0);
const list = ref([
  { text: '照片', checked: false, disabled: false },
  { text: '视频', checked: false, disabled: false },
]);

const fetchDataFunc = async (pager: any, loadType: any) => {
  const { pageSize, pageNum } = pager;
  const studentId = currentId.value ? currentId.value : store.studentData.studentsData.studentId;
  console.log('studentId : ' + studentId);
  const res: any = await store.viewPicturePage.getCommonQuery(pageSize, pageNum, studentId);
  if (loadType === 'new') lists.value = [];
  lists.value.push(...res.result);
  console.log('getCommonQuery : ' + JSON.stringify(lists.value));
  return res;
};
onBeforeMount(() => {
  if (isGuardian || isFromPortfolio.value) {
    getChildsById(currentId.value).then(res => {
      studentData.value = res;
    });
  } else if (!isGuardian) {
    studentData.value = {
      ...store.studentData.studentsData,
      name: store.studentData.studentsData.studentName,
    };
  }
});
onLoad(() => {
  const { id, isPortfolio, curClazz } = getPageParams();
  currentId.value = id;
  isFromPortfolio.value = Number(isPortfolio || 0);
  if (Number(isPortfolio || 0)) {
    store.setClazz(JSON.parse(curClazz));
  }
});
onShow(() => {
  if (currentId.value || store.studentData.studentsData.studentId) refreshScroll?.value?.initData();
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
        url: `/app-preprimary-education/observation-record/add?type=addNew${
          isGuardian
            ? ''
            : `&studentId=${currentId.value || store.studentData.studentsData.studentId}`
        }`,
      });
    });
  }
  isOpen.value = false;
  store.PointsOfObservationData.clearIndicatorCacheData();
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
      url: `/app-preprimary-education/observation-record/add?type=addNew${
        isGuardian
          ? ''
          : `&studentId=${currentId.value || store.studentData.studentsData.studentId}`
      }`,
    });
  });
};
const cameraEvent = async () => {
  store.PointsOfObservationData.clearIndicatorCacheData();

  // 打开摄像头
  imageEvent(['camera']);
};
const pictureEvent = async () => {
  isOpen.value = true;
};
const draftEvent = async () => {
  // 打开草稿箱
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/draft?from=recordPage`,
  });
};
</script>
<style lang="scss" scoped>
.button-camera {
  display: flex;
  height: 80rpx;
  background: url(../static/image/take_photo_btn.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: right;
  &-text {
    color: $ui-color-error-light-1;
    font-weight: bold;
    font-size: $ui-font-size-xt;
    width: 100%;
    text-align: end;
  }
}
.button-picture {
  display: flex;
  height: 80rpx;
  background: url(../static/image/select_btn.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: right;
  &-text {
    color: $ui-color-warnning-light-1;
    font-weight: bold;
    font-size: $ui-font-size-xt;
    width: 100%;
    text-align: end;
  }
}

.draft-button {
  position: absolute;
  z-index: 999;
  bottom: 380rpx;
  right: 12rpx;
  background: $ui-color-success-light-3;
  color: $ui-color-success-light-1;
  padding: 12rpx 32rpx;
  border-radius: $uni-border-radius-base;
  box-shadow: 0rpx 0rpx 20rpx 6rpx rgba(24, 25, 68, 0.15);
}
</style>
