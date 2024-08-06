<template>
  <CustomPage title="提交打卡" bg-type="clock-in">
    <card>
      <view class="textarea-wrap">
        <textarea
          v-model="content"
          focus
          auto-height
          class="textarea-dom"
          placeholder="请输入"
          :maxlength="1000"
        ></textarea>
      </view>
      <view class="medias-bar">
        <text class="color-placeholder"> {{ charLength }}/1000 </text>
      </view>
    </card>
    <view class="pic mlr-l">
      <view class="flex-between">
        <view class="pic-title">
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
            class="pr-s"
            :src="iconPunchPhoto"
            width="46"
            height="46"
            @click="pictureEvent"
          />
        </view>
      </view>
      <view class="mt-l">
        <Medias :model="''" :medias="mediaList" @delete="handleDelete" />
      </view>
    </view>
    <imp-bottom>
      <view class="add-btn">
        <u-button type="primary" :disabled="charLength === 0" @click="handleClick">提交</u-button>
      </view>
    </imp-bottom>
  </CustomPage>
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
<script lang="ts">
import Medias from '@/app-preprimary-education/clock-in/components/task-detail-card/medias.vue';
import {
  UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  UPLOAD_IMAGE_MAX_SIZE,
} from '@/app-preprimary-education/clock-in/utils/constants';
import { useClockIn } from '@/app-preprimary-education/clock-in/utils/use-clock-in';
import iconPunchCamera from '@/app-preprimary-education/static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';

import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpMedia from '@/app-preprimary-education/components/imp-media/imp-media.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import {
  executeClockin,
  getVideoSnapshot,
  IMedia,
} from '@/app-preprimary-education/services/clock-in';
import icon_punch_photo from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';
import { REGS } from '@/app-preprimary-education/utils/regs';
import { formatDate, getPageParams, showInfo } from '@/utils/tools';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from 'vue';

interface Iparams {
  taskId: string;
  clockinDate: string;
  studentId?: string;
  clockinWay: string;
}

interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
export default defineComponent({
  components: { CustomPage, ImpBottom, ImpButton, Card, ImpMedia, Medias },
  setup() {
    const params = reactive({ value: {} as Iparams });
    const content = ref('');
    const clockinWay = ref('');
    const medias = reactive({
      array: [] as IMedia[],
    });
    const charLength = computed(() => content.value.length);
    const store = useClockIn();
    const isOpenSelect = ref(false);
    const listSelect = ref([
      { text: '照片', checked: false, disabled: false },
      { text: '视频', checked: false, disabled: false },
    ]);
    const mediaList = computed(() => {
      const data = store.sourceUploadData.fileData;
      return data;
    });
    watch(
      () => content.value,
      () => {
        if (content.value.length > 1000) {
          content.value = content.value.substring(0, 1000);
        }
      },
    );

    const validate = () => {
      // 验证输入内容
      const nonWhiteStr = content.value?.trim()?.replace(/\n/g, '') || '';
      if (!content.value.length) {
        showInfo('请输入打卡内容');
        return false;
      }
      if (content.value.length > 0 && nonWhiteStr.length === 0) {
        showInfo('不能全是空格');
        return false;
      }
      if (!REGS.notAllSpecialChar.test(nonWhiteStr) && content.value.length > 0) {
        showInfo('不能全是特殊字符');
        return;
      }
      if (clockinWay.value.includes('1')) {
        if (!store.sourceUploadData.fileData.filter(m => m.kind == 'image').length) {
          showInfo('请上传图片');
          return false;
        }
      }
      if (clockinWay.value.includes('2')) {
        if (!store.sourceUploadData.fileData.filter(m => m.kind == 'video').length) {
          showInfo('请上传视频');
          return false;
        }
      }
      if (store.sourceUploadData.fileData.length > 9) {
        showInfo('最多上传9个');
        return false;
      }
      // if (clockinWay.value.includes('3')) {
      //   if (!medias.array.filter(m => m.type === 3).length) {
      //     showInfo('请上传录音');
      //     return false;
      //   }
      // }
      return true;
    };

    const handleClick = async () => {
      if (!validate()) return;
      const { taskId, clockinDate, studentId } = params.value; //原图
      const masterPicList = store.sourceUploadData.fileData;
      const list = [];

      for (let i = 0; i < masterPicList.length; i++) {
        list.push({
          url: masterPicList[i].url,
          fileId: masterPicList[i].fileId,
          type: masterPicList[i].kind == 'image' ? 1 : 2,
        });
      }
      await executeClockin({
        taskId,
        clockinDate: formatDate(Number.parseInt(clockinDate)),
        studentId,
        content: content.value,
        mediaList: list,
      });
      uni.navigateTo({
        url: '/app-preprimary-education/clock-in/guardian/punch/result',
      });
    };

    const handleSelectPhoto = async () => {
      // 批量上传
      const uploadRes = await chooseAndUploadImage(medias.array);
      medias.array.push(...uploadRes);
    };

    const handleDelete = (item: any) => {
      store.sourceUploadData.delFileData(item);
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
        const data = files[1]?.map((item: SportsTaskMedia) => {
          return {
            ...item,
            kind: 'image',
            url: item?.url,
          };
        });
        store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
        store.sourceUploadData.setOriginFileData([
          ...store.sourceUploadData.originFileData,
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
        store.sourceUploadData.setOriginFileData([
          ...store.sourceUploadData.originFileData,
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
        if (files[1]?.fileId) await getVideoSnapshot({ fileId: files[1]?.fileId });
      }
    };
    onBeforeMount(() => {
      const p = getPageParams<Iparams>();
      params.value = p;
      clockinWay.value = p.clockinWay || '';
    });

    onBeforeUnmount(() => {
      uni.$off('clock-in-new-edit-show');
      store.sourceUploadData.clear();
    });

    return {
      content,
      medias,
      charLength,
      handleClick,
      isOpenSelect,
      listSelect,
      mediaList,
      cameraEvent,
      pictureEvent,
      handleConfirmSelect,
      handleDelete,
      handleSelectPhoto,
      clockinWay,
      icon_punch_photo,
      iconPunchCamera,
      iconPunchPhoto,
    };
  },
});
</script>
<style lang="scss" scoped>
.textarea-wrap {
  min-height: 400rpx;
  max-height: 50vh;
  overflow: auto;
  .textarea-dom {
    color: $ui-color-base;
    font-size: $ui-font-size-content;
    min-height: 400rpx;
    width: 100%;
  }
}

.medias-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: $ui-gap-large;
  .punch-image {
    width: 44rpx;
    height: 44rpx;
    margin-right: $ui-gap-xl;
  }
}
.pic {
  padding: $ui-gap-large;
  margin-top: 24rpx;
  background: #ffffff;
  border-radius: 12rpx;

  &-title {
    text-align: left;
    font-size: 30rpx;
    color: #1d2129;
    font-weight: 400;
  }
}
.add-btn {
  padding: 0rpx 32rpx;
}
</style>
