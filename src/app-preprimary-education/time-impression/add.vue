<template>
  <mt-page :title="`新建${title}`" theme="default" :show-top-gap="false">
    <view class="page-padding">
      <view v-if="!isGuardian" class="setting">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text class="mr-s" style="color: red">*</text>
            <text>关联幼儿</text>
          </view>
          <view class="setting-item-btn flex" @click="openEvent">
            <text> {{ studentNames }}</text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="des">
        <view class="des-title">这一刻记录</view>
        <c-input
          v-model:value="description"
          placeholder="选填"
          type="textarea"
          height="240rpx"
          maxlength="200"
          class-name="des-textarea"
          :show-clear="false"
        ></c-input>
      </view>
      <view class="pic">
        <view class="flex-between">
          <view class="pic-title">
            <text class="mr-s" style="color: red">*</text>
            <text>照片/视频</text>
          </view>
          <view class="flex">
            <c-image
              class="mr-l"
              :src="iconPunchCamera"
              width="46"
              height="46"
              @click="cameraEvent"
            />
            <c-image
              class="pr-l"
              :src="iconPunchPhoto"
              width="46"
              height="46"
              @click="pictureEvent"
            />
          </view>
        </view>
        <view class="mt-l">
          <Midias :model="''" :medias="mediaList" @delete="handleDelete" />
        </view>
      </view>
    </view>
    <imp-bottom>
      <view class="submit-btn">
        <u-button type="primary" :disabled="buttonDisabled" @click="hanldeSubmit">发布</u-button>
      </view>
    </imp-bottom>
  </mt-page>
  <c-select
    v-model:show="isOpen"
    v-model:list="list"
    :auto-close-after-select="false"
    :show-check-icon="true"
    multiple
    :mask-close-able="false"
    title="关联幼儿"
    title-type="text"
    @onConfirm="handleConfirm"
  />
  <c-select
    v-model:show="isOpenSelect"
    v-model:list="listSelect"
    :auto-close-after-select="false"
    :show-check-icon="true"
    :mask-close-able="false"
    title="请选择"
    title-type="text"
    @onConfirm="handleConfirmSelect"
  />
</template>
<script lang="ts" setup>
import ImpBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import iconPunchCamera from '@/app-preprimary-education/static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';
import { loginStore } from '@/store/modules/login';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { computed, onBeforeMount, onBeforeUnmount, ref, toRefs } from 'vue';
import mtPage from '../components/mt-page/mt-page.vue';
import Midias from './components/task-detial-card/medias.vue';
import { UPLOAD_IMAGE_DEFAULT_SIZE_TYPE, UPLOAD_IMAGE_MAX_SIZE } from './utils/constants';
import { getTitle } from './utils/get-title';
import { isGuardian as isGuardianFn } from './utils/is';
import { batchAssignLabels, batchSaveResource, publishApi } from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

const title = ref(getTitle());
interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
const isOpen = ref(false);
const isOpenSelect = ref(false);
const buttonDisabled = ref(false);
const totalPerson = ref(0);
const studentNames = ref('请选择');

const description = ref('');
const list = ref<any>([]);
const studentList = ref<any>([]);
const listSelect = ref([
  { text: '照片', checked: false, disabled: false },
  { text: '视频', checked: false, disabled: false },
]);
const { currentOrganization } = loginStore();
const store = useTimeImpression();
const { curClazz } = toRefs(store);
const isGuardian = isGuardianFn();
const loginSt = loginStore();
// const { taskRefStudents } = toRefs(store.observeRecordPage);

// 关联幼儿名称
const getStudentNames = (data: any) => {
  if (data.length > 0) {
    studentNames.value = `${data
      .map((item: any) => item.text)
      .filter((one: any, index: number) => index < 2)
      .join('，')}${data.length > 2 ? `等${data.length}人` : ''}`;
  } else {
    studentNames.value = '请选择';
  }
};

const fetchDataFunc = async () => {
  const data = await store.homePage.getHomeList(curClazz.value.clazzId);
  return data;
};
const init = () => {
  !isGuardian &&
    fetchDataFunc().then(res => {
      list.value = res.map(item => {
        return {
          text: item.name,
          checked: false,
          disabled: false,
          id: item.id,
        };
      });
    });
};
const mediaList = computed(() => {
  const data = store.sourceUploadData.fileData;
  return data;
});
onBeforeMount(() => {
  init();
});
onBeforeUnmount(() => {
  store.sourceUploadData.clear();
});
const handleDelete = (item: any) => {
  store.sourceUploadData.delFileData(item);
};
const openEvent = () => {
  isOpen.value = true;
};
const handleConfirm = (inx: any) => {
  const data = list.value.filter((item: any, index: any) => {
    return inx.includes(index);
  });
  studentList.value = data.map((item: any) => {
    return item.id;
  });
  getStudentNames(data);
  totalPerson.value = studentList.value.length;
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
    store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
    store.sourceUploadData.setOrigionFileData([
      ...store.sourceUploadData.origionFileData,
      ...files[2],
    ]);
  });
};
const cameraEvent = () => {
  // 打开摄像头
  imageEvent(['camera']);
};
const pictureEvent = () => {
  isOpenSelect.value = true;
};
const hanldeSubmit = () => {
  buttonDisabled.value = true;
  if (!isGuardian && !studentList.value.length) {
    uni.showToast({
      title: '请选择关联幼儿',
      icon: 'none',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }

  if (store.sourceUploadData.fileData.length > 9) {
    uni.showToast({
      title: '最多上传9个',
      icon: 'none',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }
  if (!store.sourceUploadData.fileData.length) {
    uni.showToast({
      title: '请上传照片或者视频',
      icon: 'none',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }
  //原图
  const masterPicList = store.sourceUploadData.fileData;
  const thumbnailPicList = store.sourceUploadData.origionFileData;
  const list = [];
  for (let i = 0; i < masterPicList.length; i++) {
    list.push({
      resourceFileId: masterPicList[i].fileId,
      resourceType: masterPicList[i].kind == 'image' ? 1 : 2,
      thumbnailFileId: masterPicList[i].kind == 'image' ? thumbnailPicList[i]?.fileId : '',
      remark: description.value,
    });
  }
  publishApi(list)
    .then(res => {
      const resourceIds = res.map(item => {
        return item.id;
      });
      const studentIds = isGuardian ? [currentOrganization?.childId || ''] : studentList.value;
      const params = {
        resourceIds,
        studentIds,
      };
      (isGuardian ? batchSaveResource(params) : batchAssignLabels(params)).then(res => {
        uni.showToast({
          title: '已发布',
          icon: 'none',
          duration: 2000,
        });

        setTimeout(() => {
          uni.$emit('reLoads');
          uni.navigateBack();
          buttonDisabled.value = false;
        }, 2000);
      });
    })
    .catch(() => {
      buttonDisabled.value = false;
    });
};
const handleConfirmSelect = async (type: any) => {
  if (type[0] == 0) {
    //  打开图片相册
    const files = await chooseAndUploadImage(
      [],
      10,
      false,
      false,
      false,
      UPLOAD_IMAGE_MAX_SIZE,
      true,
      ['album'],
      true,
      UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
    );
    const data = files[1]?.map((item: SportsTaskMedia) => {
      return {
        ...item,
        kind: 'image',
        url: item?.url,
      };
    });

    const data2 = [
      {
        fileId: '',
        type: 2,
        url: '',
      },
    ];

    store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
    store.sourceUploadData.setOrigionFileData([
      ...store.sourceUploadData.origionFileData,
      ...data2,
    ]);
  } else {
    //  打开视频相册
    const files = await chooseAndUploadVideo({
      sourceType: ['album'],
      compressed: false,
      maxSize: 200,
    });
    const data = [
      {
        kind: 'video',
        url: files[1]?.presignedUrl,
        fileId: files[1]?.fileId,
      },
    ];

    store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
  }
};
</script>
<style lang="scss" scoped>
.page-padding {
  padding: 0 32rpx 200rpx 32rpx;
  .setting {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 0 33rpx;
    &-item {
      height: 88rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-title {
        font-size: 30rpx;
        color: #1d2129;
        text-align: left;
        line-height: 48rpx;
        font-weight: 400;
      }
      &-btn {
        font-size: 30rpx;
        color: #86909b;
        text-align: right;
        line-height: 48rpx;
        font-weight: 400;
      }
    }
  }
  .des {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 28rpx 0rpx;
    display: flex;
    flex-direction: column;
    &-title {
      padding-left: 32rpx;
      text-align: left;
      font-size: 30rpx;
      color: #1d2129;
      line-height: 48rpx;
      font-weight: 400;
      height: 88rpx;
    }
    &-textarea {
      padding-left: 0 !important;
    }
    &-number {
      text-align: right;
      padding-right: 32rpx;
      font-size: 30rpx;
      line-height: 48rpx;
      font-weight: 400;
      color: #86909c;
    }
  }
  .pic {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 28rpx 0rpx;

    &-title {
      padding-left: 32rpx;
      text-align: left;
      font-size: 30rpx;
      color: #1d2129;
      font-weight: 400;
    }
  }
}
.submit-btn {
  padding: 0rpx 32rpx;
}
</style>
