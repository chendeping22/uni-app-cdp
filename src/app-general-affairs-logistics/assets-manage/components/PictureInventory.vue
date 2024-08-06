<template>
  <view>
    <u-popup
      v-model="show"
      mode="bottom"
      closeable
      height="90%"
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
      @close="handleClose"
      @open="show = true"
    >
      <view class="popup">
        <view class="popup-header">{{ popupTitle }}</view>
        <scroll-view scroll-y class="popup-scroll" :scrollTop="scrollTop">
          <view class="popup-scroll-inner">
            <view class="popup-picture" v-if="showPicture">
              <view>
                <view v-if="hasFiles">
                  <u-image
                    :src="state.files?.[0]?.url"
                    :width="(state.pictureWidth || 0) * 2"
                    :height="(state.pictureHeight || 0) * 2"
                    :border-radius="32"
                    :show-loading="false"
                  />
                </view>
                <view
                  v-else
                  class="popup-picture-view"
                  :style="{
                    height: `${state.pictureHeight}px`,
                    width: `${state.pictureWidth}px`,
                  }"
                >
                  <u-image :src="picture" :width="112" :height="112" />
                  <view class="popup-picture-note">您需要通过拍照进行盘点</view>
                </view>
              </view>
              <view class="popup-picture-bottom">
                <view class="popup-picture-btn" v-if="!hasFiles" @click="handlePicture">
                  <u-image :src="camera" width="40rpx" height="40rpx" />
                </view>
                <view class="popup-picture-btn" v-if="hasFiles" @click="handlePicture">
                  <u-image :src="refresh" width="40rpx" height="40rpx" />
                </view>
                <view class="popup-picture-btn" v-if="showDelete" @click="handleDeletePicture">
                  <u-image :src="deleteIcon" width="40rpx" height="40rpx" />
                </view>
              </view>
            </view>
            <view :style="{ 'padding-bottom': '24rpx', height: areaHeight, minHeight: '224rpx' }">
              <textarea
                v-model="state.comment"
                :maxlength="200"
                auto-height
                class="textarea"
                placeholder-class="textarea-placeholder"
                placeholder="请输入盘点备注信息"
                :cursor-spacing="150"
                adjust-position
                @blur="handleChangeComment"
                @focus="handleCommentFocus"
                @linechange="handleLineChange"
              ></textarea>
            </view>
          </view>
        </scroll-view>
        <view class="popup-bottom">
          <u-button type="primary" @click="handleCommit" :loading="loading">提交</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import camera from '@/app-general-affairs-logistics/static/assets-manage/camera.svg';
import deleteIcon from '@/app-general-affairs-logistics/static/assets-manage/delete-icon.svg';
import picture from '@/app-general-affairs-logistics/static/assets-manage/picture.svg';
import refresh from '@/app-general-affairs-logistics/static/assets-manage/refresh.svg';

import { chooseImgStore, updatePhoto } from '@/utils/choose-image';
import { showInfo } from '@/utils/tools';
import { PropType, computed, reactive, ref, watch } from 'vue';
import {
  getTaskItemDetail,
  saveAssetInventory,
  saveInventorySubtasks,
} from '../services/operate-inventory';

interface IFile {
  fileId?: string;
  name?: string;
  url?: string;
  [x: string]: any;
}

interface IPopupParams {
  isEdit?: boolean;
}

interface IDetailData {
  assetId?: string;
  /**盘点任务id */
  inventoryTaskId?: string;
  /** 盘点详情列表记录id */
  subTaskId?: string;
  /**是否严格拍照 1-是 0-否 */
  photograph?: string;
  /**允许手动盘点：1-是 0-否 */
  manual?: string;
  /** 盘点类型 */
  type?: string;
}

const props = defineProps({
  // 详情
  detailData: {
    type: Object as PropType<IDetailData>,
    default: {},
  },
});

const emit = defineEmits(['onPictureClose']);

const show = ref<boolean>(false);
const loading = ref<boolean>(false);
const popupTitle = ref<string>('手动盘点');
const popupParams = ref<IPopupParams>(); // 弹窗参数
const store = chooseImgStore();
const state = reactive<{
  comment?: string;
  files?: IFile[];
  // 1:手动，2：扫码
  inventoryMode?: number;
  pictureWidth?: number;
  pictureHeight?: number;
}>({
  files: undefined,
  inventoryMode: 1,
  comment: undefined,
});
const scrollTop = ref<any>(0);
/** 已上传图片 */
const hasFiles = computed(() => state.files?.length);
/** 是否展示删除按钮 */
const showDelete = computed(() => state.files?.length && state.inventoryMode === 2);
/** 是否严格拍照 */
const showPicture = computed(() => props?.detailData?.photograph === '1');
const areaHeight = ref<string>();

const handlePicture = () => {
  updatePhoto({ sourceType: ['camera'] });
};

const handleDeletePicture = () => {
  state.files = [];
};

const handleLineChange = (e: any) => {
  const height = e.detail?.heightRpx + 80;
  areaHeight.value = `${height > 224 ? height : 224}rpx`;
};

watch(
  () => store.chooseImgRes,
  val => {
    state.files = val;
  },
);

const getDetail = async () => {
  try {
    const params = {
      id: props?.detailData?.subTaskId || '',
    };
    const res: any = await getTaskItemDetail(params);
    state.files = res?.image ? [res?.image] : [];
    state.comment = res?.remark;
    state.inventoryMode = res?.inventoryMode;
  } catch (e: any) {
    showInfo(e?.msg || '获取详情失败');
  }
};

/** 弹窗展示 */
const handleShowPopup = (params: IPopupParams) => {
  popupParams.value = params;
  show.value = true;
  const { windowWidth = 0 } = uni.getSystemInfoSync();
  state.pictureWidth = windowWidth - 32 || 300;
  state.pictureHeight = +((state.pictureWidth / 3) * 4).toFixed(2);
  if (params?.isEdit) {
    popupTitle.value = '已盘点信息';
    getDetail();
    return;
  }
  popupTitle.value = '手动盘点';
};

/** 提交 */
const handleCommit = async () => {
  if (showPicture.value && !state.files?.length && state.inventoryMode === 1) {
    showInfo('请通过拍照进行盘点');
    return;
  }
  const params = {
    assetId: props?.detailData?.assetId,
    inventoryType: 1, //1:移动端，2-web端
    inventoryMode: 1, // 1:手动，2：扫码
    inventoryTaskId: props.detailData?.inventoryTaskId,
    remark: state.comment,
    ...(showPicture.value ? { fileId: state.files?.[0]?.fileId } : {}),
  };

  const editParams = {
    ...(showPicture.value ? { image: state.files?.[0]?.fileId } : {}),
    remark: state.comment,
    subTaskId: props?.detailData?.subTaskId,
  };
  try {
    loading.value = true;
    popupParams.value?.isEdit
      ? await saveInventorySubtasks(editParams)
      : await saveAssetInventory(params);
    showInfo('盘点成功');
    handleClose();
    if (!popupParams.value?.isEdit) {
      emit('onPictureClose');
    }
  } catch (e: any) {
    showInfo(e?.msg || '盘点失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  show.value = false;
  scrollTop.value = 0;
  state.comment = undefined;
  state.files = [];
};

const handleChangeComment = (e?: any) => {
  const value = e.detail.value;
  // 清除头尾空格，连续空格替换为1个
  let _newValue = value.trim()?.replace(/ +/g, ' ');
  state.comment = _newValue.length ? _newValue : undefined;
};

const handleCommentFocus = () => {
  setTimeout(() => {
    scrollTop.value = 200;
  }, 10);
};

defineExpose({
  handleShowPopup,
  handleClose,
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.popup-header {
  display: flex;
  justify-content: center;
  font-size: 34rpx;
  color: $textDefaultColor;
  margin: 24rpx 0;
  font-weight: 500;
}
.popup-scroll {
  height: 100%;
  flex: 1;
  overflow: hidden;
  &-inner {
    padding: 0 32rpx 24rpx 32rpx;
    height: 100%;
  }
}
.popup-bottom {
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
}
.upload-file {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.notice-txt {
  padding: 24rpx 0;
  font-size: 26rpx;
  color: $textSecondaryColor;
}
.popup-picture {
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  &-view {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 32rpx;
    flex: 1;
    background-color: rgba(0, 0, 0, 0.04);
  }
  &-bottom {
    position: absolute;
    z-index: 999;
    display: flex;
    bottom: 32rpx;
  }
  &-note {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 16rpx;
  }
  &-btn {
    background-color: #ffffff;
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    box-shadow: 0 4px 8px 0 #00000029;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 16rpx;
  }
}
.textarea {
  background-color: rgba(0, 0, 0, 0.06);
  width: 100%;
  border-radius: 16rpx;
  padding: 32rpx;
  min-height: 100%;
  font-size: 32rpx;
  line-height: 32rpx;
  margin-bottom: 32rpx;
}
.textarea-placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 28rpx;
}
</style>
