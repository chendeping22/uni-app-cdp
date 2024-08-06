<template>
  <c-refresh-scroll
    :fetch-data-func="throttledFetchDataFunc"
    :is-open-scroll2-bottom="false"
    :auto-mount="false"
  >
    <template #top_area>
      <ProfileHome
        :store="store"
        @onLoadClazz="throttledFetchDataFunc"
        @openCameraEvent="openCameraEvent"
        @openPictureEvent="openPictureEvent"
        @openDraftEvent="openDraftEvent"
      />
    </template>
    <view>
      <view class="plr-l pb-b">
        <StudentList :students="students" />
      </view>
      <c-empty v-if="students.length === 0" bg-type="fill-default" content="暂无数据" />
    </view>
  </c-refresh-scroll>
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
</template>

<script lang="ts" setup>
import ProfileHome from '@/app-preprimary-education/observation-record/components/profile-home/index.vue';
import StudentList from '@/app-preprimary-education/observation-record/components/student-list/index.vue';
import {
  UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  UPLOAD_IMAGE_MAX_SIZE,
} from '@/app-preprimary-education/observation-record/utils/constants';
import { useTimeImpression } from '@/app-preprimary-education/observation-record/utils/use-time-impression';
import { throttle } from '@/utils/lodash-es';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { ref, toRefs } from 'vue';

interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
const store = useTimeImpression();
const { students } = toRefs(store.homePage);
const { curClazz } = toRefs(store);
const isOpen = ref(false);
const list = ref([
  { text: '照片', checked: false, disabled: false },
  { text: '视频', checked: false, disabled: false },
]);
const fetchDataFunc = async () => {
  const res = await store.homePage.getHomeList(curClazz.value.clazzId);
  return res;
};
onLoad(() => {
  uni.$on('reLoad', reLoadEvent);
  uni.$on('reLoadDelete', reLoadEvent);
});
onShow(() => {
  if (curClazz.value.clazzId) reLoadEvent();
});
const reLoadEvent = () => {
  console.log('*****************************************');
  throttledFetchDataFunc();
};
const throttledFetchDataFunc = throttle(fetchDataFunc, 1000);
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
    console.log('🚀 ~ file: home.vue:71 ~ imageEvent ~ files:' + JSON.stringify(files));
    if (files.length === 0) {
      return;
    }
    // 旧基座取files[1]
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
      url: `/app-preprimary-education/observation-record/add?type=addNew`,
    });
  });
};
const handleConfirm = async (type: any) => {
  if (type[0] == 0) {
    //  打开图片相册
    imageEvent(['album']);
  } else {
    //  打开视频相册
    chooseAndUploadVideo({ sourceType: ['album'], compressed: false, maxSize: 200 }).then(files => {
      if (!files[1]?.fileId) return;
      // 旧基座取files[1]?.presignedUrl
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
        url: `/app-preprimary-education/observation-record/add?type=addNew`,
      });
    });
  }
  isOpen.value = false;
  store.PointsOfObservationData.clearIndicatorCacheData();
};
const openCameraEvent = async () => {
  store.PointsOfObservationData.clearIndicatorCacheData();
  // 打开摄像头
  imageEvent(['camera']);
};
const openPictureEvent = async () => {
  isOpen.value = true;
};
const openDraftEvent = async () => {
  // 打开草稿箱
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/draft?type=dartf&from=recordPage`,
  });
};
</script>
