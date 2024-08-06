<template>
  <view ref="editorContentRef" class="edit-content">
    <view class="notice-editor">
      <Editor v-model="content" :detailed="!isEdit" class="editor-page" />
      <view class="bottom-bar bg-white">
        <u-button type="primary" class="bottom-bar-item" @click="handleSave">完成</u-button>
        <u-button type="primary" class="bottom-bar-item" @click="handleReview">{{
          isEdit ? '预览' : '回到编辑'
        }}</u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Editor from '@/app-teacher-personnel/components/Editor/index.vue';
import { onLoad } from '@dcloudio/uni-app';
import { getCurrentInstance, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const title = ref(); // 标题
const content = ref(); // 文本内容
const showPopup = ref<boolean>(false);
const isEdit = ref(true); // 是否为编辑
const editorContentRef = ref();

const instance: any = getCurrentInstance()?.proxy;
const eventChannel = instance?.getOpenerEventChannel();

onLoad(() => {
  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
  eventChannel?.on(
    'acceptDataFromOpener',
    (data: { content: any; title: any; isEdit: boolean }) => {
      content.value = data?.content;
    },
  );
});

/** 显示富文本 */
const handleShowPopup = () => {
  showPopup.value = true;
};

/** 完成富文本 */
const handleSave = () => {
  if (eventChannel) {
    eventChannel.emit('acceptDataFromOpenedPage', { content: content.value });
  }
  uni.navigateBack();
};

/** 预览 */
const handleReview = () => {
  isEdit.value = !isEdit.value;
};

/** 富文本预览 */
const handleContentPreview = () => {
  isEdit.value = false;
  showPopup.value = true;
};

watch(
  () => props?.modelValue,
  val => {
    content.value = val;
  },
);

defineExpose({
  handleShowPopup,
  handleContentPreview,
});
</script>

<style scoped lang="scss">
// @import "@/pages/collaborateNotice/notice.scss";
page {
  height: 100%;
  width: 100%;
  background-color: #fff;
}
.edit-content {
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  width: 100%;
  .notice-editor {
    height: calc(100vh - var(--window-top) - var(--window-bottom));
  }
  .review-btn {
    width: 100%;
    height: 60rpx;
  }
}
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
  z-index: 2;
  &-item {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
  }
}

.editor-page {
  height: calc(100vh - var(--window-top) - constant(safe-area-inset-bottom) - 48rpx - 80rpx);
  height: calc(100vh - var(--window-top) - env(safe-area-inset-bottom) - 48rpx - 80rpx);
  // :deep(.ql-container) {
  //   height: calc(
  //     100vh - var(--window-top) - 250rpx - px2rpx(64px) - constant(safe-area-inset-bottom)
  //   );
  //   height: calc(100vh - var(--window-top) - 250rpx - px2rpx(64px) - env(safe-area-inset-bottom));
  // }
  // :deep(.ql-editor.ql-blank::before) {
  //   font-style: normal;
  // }
  // :deep(.ql-editor) {
  //   line-height: 48rpx !important;
  // }
}
.editor-preview {
  height: calc(
    100vh - var(--window-top) - constant(safe-area-inset-bottom) - 48rpx - 80rpx - 48rpx
  );
  height: calc(100vh - var(--window-top) - env(safe-area-inset-bottom) - 48rpx - 80rpx - 48rpx);
  width: calc(100% - 64rpx);
  margin: 24rpx 32rpx;
  padding: 32rpx;
  word-wrap: break-word;
  word-break: break-all;
  border-radius: 16rpx;
  :deep(img),
  :deep(image) {
    max-width: 100%;
  }
  :deep(.rich-text-image) {
    max-width: 100%;
    height: auto;
  }
}
.editor-title {
  margin-bottom: 24rpx;
  font-size: 40rpx;
}
.editor-txt {
  line-height: 48rpx;
}
</style>
