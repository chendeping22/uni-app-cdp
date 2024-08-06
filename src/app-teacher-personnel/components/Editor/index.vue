<template>
  <view class="jnpf-editor">
    <template v-if="!detailed">
      <view class="toolbar">
        <view class="iconfont icon-undo" @tap="undo"></view>
        <view class="iconfont icon-redo" @tap="redo"></view>
        <view
          :class="{ 'ql-active': state.formats.fontSize === '24px' }"
          class="iconfont icon-fontsize"
          data-name="fontSize"
          data-value="24px"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.bold }"
          class="iconfont icon-zitijiacu"
          data-name="bold"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.italic }"
          class="iconfont icon-zitixieti"
          data-name="italic"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.underline }"
          class="iconfont icon-zitixiahuaxian"
          data-name="underline"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.strike }"
          class="iconfont icon-zitishanchuxian"
          data-name="strike"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.color === '#0000ff' }"
          class="iconfont icon-text_color"
          data-name="color"
          data-value="#0000ff"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.backgroundColor === '#00ff00' }"
          class="iconfont icon-fontbgcolor"
          data-name="backgroundColor"
          data-value="#00ff00"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.list === 'ordered' }"
          class="iconfont icon-youxupailie"
          data-name="list"
          data-value="ordered"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.list === 'bullet' }"
          class="iconfont icon-wuxupailie"
          data-name="list"
          data-value="bullet"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.align === 'left' }"
          class="iconfont icon-zuoduiqi"
          data-name="align"
          data-value="left"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.align === 'center' }"
          class="iconfont icon-juzhongduiqi"
          data-name="align"
          data-value="center"
          @tap="format"
        ></view>
        <view
          :class="{ 'ql-active': state.formats.align === 'right' }"
          class="iconfont icon-youduiqi"
          data-name="align"
          data-value="right"
          @tap="format"
        ></view>
        <view class="iconfont icon-outdent" data-name="indent" data-value="-1" @tap="format"></view>
        <view class="iconfont icon-indent" data-name="indent" data-value="+1" @tap="format"></view>
        <view
          :class="{ 'ql-active': state.formats.lineHeight }"
          class="iconfont icon-line-height"
          data-name="lineHeight"
          data-value="2"
          @tap="format"
        ></view>
        <view class="iconfont icon-charutupian" @tap="insertImage"></view>
      </view>
      <view class="editor-wrapper">
        <editor
          id="editor"
          class="ql-container"
          :placeholder="placeholder"
          show-img-size
          show-img-toolbar
          show-img-resize
          :read-only="disabled"
          @statuschange="onStatusChange"
          @ready="onEditorReady"
          @input="getValue"
        >
        </editor>
      </view>
    </template>
    <view v-else class="preview-wrapper">
      <div class="preview-card">
        <rich-text class="editor-box" :nodes="modelValue" />
      </div>
    </view>
  </view>
</template>

<script setup>
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { getFileInfo, getUploadUrl, updateUploadResult } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { getCurrentInstance, reactive, watch } from 'vue';
// #ifdef H5
import quill from 'quill';
window.Quill = quill;
// #endif

const instance = getCurrentInstance();

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请输入',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  detailed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits('update:modelValue');

const state = reactive({
  innerValue: '',
  readOnly: false,
  formats: {},
  editorChange: false,
  showMoreTools: false,
  editorCtx: null,
});

const store = loginStore();
const { userInfo } = store;

const getExtname = path => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

watch(
  () => props.modelValue,
  val => {
    if (state.editorChange && val) return;
    state.editorChange = false;
    state.editorCtx &&
      state.editorCtx.setContents({
        html: val,
      });
  },
);

onLoad(() => {
  uni.loadFontFace({
    family: 'Pacifico',
    source: 'url("/Pacifico-Regular.ttf")',
  });
});

const readOnlyChange = () => {
  state.readOnly = !state.readOnly;
};

const onEditorReady = e => {
  // #ifdef APP-PLUS || H5 ||MP-WEIXIN
  uni
    .createSelectorQuery()
    .in(instance.proxy)
    .select('#editor')
    .context(res => {
      console.log('...... > onEditorReady > res:', res);
      state.editorCtx = res.context;
      state.editorCtx.setContents({
        html: props.modelValue,
      });
    })
    .exec();
  // #endif
};

const undo = () => {
  state.editorCtx.undo();
};

const redo = () => {
  state.editorCtx.redo();
};

const format = e => {
  let { name, value } = e.target.dataset;
  if (!name) return;
  state.editorCtx.format(name, value);
};

const onStatusChange = e => {
  const formats = e.detail;
  state.formats = formats;
};

const insertDivider = () => {
  state.editorCtx.insertDivider();
};

const clear = () => {
  state.editorCtx.clear();
};

const removeFormat = () => {
  state.editorCtx.removeFormat();
};

const insertDate = () => {
  const date = new Date();
  const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  state.editorCtx.insertText({
    text: formatDate,
  });
};

const insertImage = async () => {
  console.log('........... insertImage');
  let file = null;
  let fileType = null;
  let filePath = null;
  let fileName = null;

  // #ifdef APP-PLUS
  file = await callBridge({
    service: Service.file,
    action: Action.filePicker,
    data: { fileFilter: 'image/*' },
  }).catch(err => {
    const { code, msg } = err;
    console.log('code : ' + code + ', msg : ' + msg);
    // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
    if (code === 201 && msg === '取消') {
      return;
    }
    showInfo('未选择文件');
  });
  if (file) {
    fileType = file.fileType;
    filePath = file.filePath;
    fileName = file.fileName;
  } else {
    return;
  }
  // #endif
  // #ifdef MP-WEIXIN || H5
  let chooseFile = null;
  if (uni.chooseFile) {
    chooseFile = uni.chooseFile;
  } else if (uni.chooseMessageFile) {
    chooseFile = uni.chooseMessageFile;
  }
  if (!chooseFile) {
    showInfo('未选择文件');
    return;
  }
  await new Promise((resolve, reject) => {
    chooseFile({
      count: 1,
      extension: '.jpg,.jpeg,.gif,.png,.webp'.split(','),
      async success(res) {
        if (res.tempFiles && res.tempFiles[0]) {
          file = res.tempFiles[0];
          resolve(true);
        } else {
          reject();
        }
      },
      fail: async function (res) {
        const { code, errMsg } = res;
        console.log('code: ' + code + ', errMsg: ' + errMsg);
        reject(res);
      },
    });
  });
  console.log('........ 22222');
  if (file) {
    fileType = file.name ? file.name.split('.').pop() : getExtname(file.path);
    filePath = file.path;
    fileName = file.name;
  } else {
    return;
  }
  // #endif
  const requestParams = {
    locationId: userInfo?.locationId,
    // locationId: '172',
    fileType: fileType,
    bucketType: 'public',
  };
  let getUploadUrlData = null;
  try {
    getUploadUrlData = await getUploadUrl(requestParams);
    console.log('...... > insertImage > getUploadUrlData:', getUploadUrlData);
  } catch (error) {
    console.log('...... > insertImage > error:', error);
    if ((error?.data?.message).includes('fileService.fileType.is.limited')) {
      showInfo('文件格式不支持');
    } else {
      showInfo(error?.msg || error?.desc || error?.data?.message || '请求服务器失败');
    }
    return;
  }
  console.log('getUploadUrlData..........', getUploadUrlData);
  if (!getUploadUrlData) {
    return;
  }
  uni.showLoading();
  try {
    // #ifdef APP-PLUS
    const { status } = await callBridge({
      service: Service.file,
      action: Action.fileUpload,
      data: {
        uploadUrl: getUploadUrlData.uploadUrl,
        header: getUploadUrlData.header,
        filePath,
        fileType: getUploadUrlData.fileType,
      },
    }).catch(err => {
      const { code, msg } = err;
      console.log('code : ' + code + ', msg : ' + msg);
      // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
      if (code === 201 && msg === '取消') {
        return;
      }
      showInfo('上传失败');
      console.log('status : ' + status);
    });
    // #endif
    // #ifdef H5
    await new Promise((resolve, reject) => {
      uni.request({
        url: filePath,
        method: 'GET',
        responseType: 'arraybuffer',
        success(response) {
          uni.request({
            url: getUploadUrlData.uploadUrl,
            method: 'PUT',
            data: response.data,
            header: getUploadUrlData.header,
            success(res) {
              if (res.statusCode === 200) {
                resolve(true);
              } else {
                showInfo('上传失败');
                reject({ msg: '上传失败' });
              }
            },
            fail: function (error) {
              showInfo(error.msg || error.desc || '上传失败');
              reject({ msg: error.msg || error.desc || '上传失败' });
            },
          });
        },
        fail: function (error) {
          showInfo(error.msg || error.desc || '上传失败');
          reject({ msg: error.msg || error.desc || '上传失败' });
        },
      });
    });
    // #endif
    // #ifdef MP-WEIXIN
    await new Promise((resolve, reject) => {
      const fs = uni.getFileSystemManager();
      fs.readFile({
        filePath: filePath,
        success: res => {
          uni.request({
            url: getUploadUrlData.uploadUrl,
            method: 'PUT',
            data: res.data,
            header: getUploadUrlData.header,
            success(res) {
              if (res.statusCode === 200) {
                resolve(true);
              } else {
                showInfo('上传失败');
                reject({ msg: '上传失败' });
              }
            },
            fail: function (error) {
              showInfo(error.msg || error.desc || '上传失败');
              reject({ msg: error.msg || error.desc || '上传失败' });
            },
          });
        },
        fail: function (error) {
          showInfo(error.msg || error.desc || '上传失败');
          reject({ msg: error.msg || error.desc || '上传失败' });
        },
      });
    });
    // #endif
    const updateResult = await updateUploadResult(getUploadUrlData.fileId, 1, fileName);
    if (updateResult) {
      const fileInfo = await getFileInfo(getUploadUrlData.fileId);
      console.log('...... > insertImage > fileInfo:', fileInfo);
      state.editorCtx.insertImage({
        src: fileInfo.fullUrl,
        alt: fileInfo.fileName,
        extClass: 'rich-text-image',
        success: function () {},
      });
      state.editorCtx.insertText({ text: '\n' });
    }
  } finally {
    uni.hideLoading();
  }
};

const getValue = e => {
  state.editorChange = true;
  // let val = e.detail.text === '\n' ? '' : e.detail.html
  state.editorCtx.getContents({
    success: function (res) {
      const isIOS = uni.getSystemInfoSync()?.platform == 'ios';
      let val = '';
      // let val = res.text === '\n' ? '' : res.html
      //修复只选择图片时, e.detail.text === '\n' ,返回val为空的问题
      if (res.html.includes('img') || isIOS) {
        val = res.html;
      } else {
        val = res.text === '\n' ? '' : res.html;
      }
      emit('update:modelValue', val);
    },
  });
};
</script>

<style lang="scss" scoped>
@import './editor-icon.css';

:deep(.ql-editor) {
  word-break: break-all;
}

.jnpf-editor {
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;

  .iconfont {
    display: inline-block;
    width: 80rpx;
    height: 80rpx;
    cursor: pointer;
    font-size: 20px;
    line-height: 80rpx;
    text-align: center;
  }

  .toolbar {
    flex: none;
    background: #f5f5f5;
    overflow-y: auto;
    box-sizing: border-box;
    border-bottom: 0;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  }

  .editor-wrapper {
    flex: auto;
    overflow: auto;
    background-color: #fff;
    :deep(.rich-text-image) {
      max-width: 100%;
      height: auto;
    }
  }

  .preview-wrapper {
    flex: auto;
    overflow: auto;
    background-color: #f5f5f5;
    :deep(.rich-text-image) {
      max-width: 100%;
      height: auto;
    }
    .preview-card {
      background-color: #fff;
      margin: 24rpx 32rpx;
      padding: 24rpx 32rpx;
      border-radius: 10rpx;
    }
  }

  .ql-container {
    box-sizing: border-box;
    padding: 20rpx;
    width: 100%;
    font-size: 30rpx;
    line-height: 1.5;
    height: 100%;
  }

  .ql-active {
    color: #06c;
  }
}
</style>
