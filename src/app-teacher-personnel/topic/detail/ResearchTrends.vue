<template>
  <page>
    <view
      class="content-wrap"
      style="height: calc(100vh - 128rpx - var(--window-top) - env(safe-area-inset-bottom))"
    >
      <scroll-view :scroll-y="true" style="height: 100%" scroll-with-animation>
        <u-form ref="formRef" :model="formData" label-position="top">
          <view class="card">
            <view class="title"> <text>阶段</text><text class="required-mark"></text> </view>
            <view class="content">
              <u-form-item :border-bottom="false" prop="stage">
                <view class="form-item-inner">
                  <RadioButtonGroup
                    v-model="formData.stage"
                    :options="stageEnum"
                    @change="
                      () => {
                        formData.trend = '';
                        validate('stage');
                      }
                    "
                  ></RadioButtonGroup>
                </view>
              </u-form-item>
            </view>
          </view>
          <view class="card">
            <view class="title"> <text>动态类型</text><text class="required-mark"></text> </view>
            <view class="content">
              <u-form-item :border-bottom="false" prop="trend">
                <view class="form-item-inner">
                  <RadioButtonGroup
                    v-model="formData.trend"
                    :options="tags"
                    @change="validate('trend')"
                  ></RadioButtonGroup>
                </view>
              </u-form-item>
            </view>
          </view>
          <view class="card">
            <view class="title">
              <text>材料</text>
            </view>
            <view class="content">
              <u-form-item :border-bottom="false" prop="fileList">
                <view class="form-item-inner">
                  <UploadFile
                    :max-size="20"
                    :max-count="10"
                    button-text="上传文件"
                    :default-file-list="formData.fileList"
                    @after-upload="handleAfterUpload"
                  ></UploadFile>
                </view>
              </u-form-item>
            </view>
          </view>
          <view class="card">
            <view class="title"> <text>内容</text><text class="required-mark"></text> </view>
            <view class="content">
              <u-form-item :border-bottom="false" prop="content">
                <view class="form-item-inner">
                  <view
                    class="content-placeholder"
                    v-if="!formData.content"
                    @click="handleClickContent"
                    ><text>请输入内容</text></view
                  >
                  <view v-else class="rich-text-wrap" @click="handleClickContent">
                    <rich-text
                      :style="{ pointerEvents: 'none' }"
                      :nodes="formData.content"
                    ></rich-text>
                  </view>
                </view>
              </u-form-item>
            </view>
          </view>
        </u-form>
      </scroll-view>
    </view>
    <view class="page-bottom">
      <u-button class="btn" plain @click="cancelHandle">取消</u-button>
      <u-button class="btn" type="primary" @click="submitHandle">确定</u-button>
    </view>
  </page>
</template>

<script setup lang="ts">
import { addTrend, editTrend, getTopicDetail } from '@/app-teacher-personnel/topic/api/topicInfo';
import RadioButtonGroup from '@/app-teacher-personnel/topic/components/RadioButtonGroup/index.vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { castArray, find, map } from 'lodash-es';
import { computed, getCurrentInstance, reactive, ref } from 'vue';
import UploadFile from '../components/upload/UploadFile.vue';
import { stageEnum as _stageEnum } from '../helper/enum';
import { wordCount } from '../helper/wordCount';

const instance: any = getCurrentInstance()?.proxy;
const eventChannel = instance?.getOpenerEventChannel();
const stageEnum = _stageEnum.filter(s => s.value <= 4);
const query = ref({ id: '', contentId: '' });
const isAdd = computed(() => !query.value.contentId);

const formRef = ref();

const formData = reactive({
  stage: undefined,
  trend: '',
  content: '',
  fileList: [] as any[],
});
const detail = ref<any>({});
const currentTrend = ref<any>({});
const tags = computed(() => {
  const trends = map(
    find(detail.value?.trendItems, one => one.stage == formData.stage)?.trends || [],
    t => ({
      label: t,
      value: t,
    }),
  );
  return trends;
});

const validate = (fields: string | string[]) => {
  const arr = castArray(fields);
  arr.forEach(i => {
    formRef.value?.fields?.find(f => f.prop === i)?.validation?.();
  });
};

onReady(() => {
  formRef.value.setRules({
    stage: [{ required: true, message: '请选择阶段' }],
    trend: [
      {
        required: true,
        message: '请选择动态类型',
      },
    ],
    content: [
      { required: true, message: '请输入内容' },
      {
        validator(rule, value) {
          if (value && wordCount(value) > 2000) {
            return false;
          }
          return true;
        },
        message: `最多支持2000个字`,
      },
    ],
  });
});
console.log('...... > onReady > formRef:', formRef);

const handleAfterUpload = (files: any[]) => {
  formData.fileList = files;
};

const handleClickContent = () => {
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/detail/ResearchTrendEditor`,
    events: {
      acceptDataFromOpenedPage: (event: any) => {
        formData.content = event?.content;
        console.log('...... > handleClickContent > event?.content:', event?.content);
        validate('content');
      },
    },
    success(res) {
      res.eventChannel.emit('acceptDataFromOpener', {
        content: formData.content,
      });
    },
  });
};

const cancelHandle = () => {
  uni.navigateBack();
};

const submitHandle = async () => {
  const valid = await formRef.value.validate();
  if (!valid) {
    return;
  }
  const data = {
    ...currentTrend.value,
    batchId: detail.value?.batchId,
    topicId: detail.value?.id,
    stage: formData.stage,
    trend: formData.trend,
    content: formData.content,
    attachment: map(formData.fileList, f => f.fileId).join(','),
  };
  if (isAdd.value) {
    await addTrend(data);
  } else {
    await editTrend(query.value.contentId, data);
  }
  eventChannel?.emit('reload', {});
  uni.navigateBack();
};

onLoad(async options => {
  query.value = { id: options?.id || '', contentId: options?.contentId || '' };
  if (query.value.id) {
    const res: any = await getTopicDetail(query.value.id);
    detail.value = res;
    if (query.value.contentId) {
      const trend = find(res?.trendContents, one => one.id == options?.contentId);
      currentTrend.value = trend;
      formData.content = trend?.content;
      formData.stage = trend?.stage;
      formData.trend = trend?.trend;
      formData.fileList = map(trend?.attachmentList, f => ({
        fileId: f.fileId,
        name: f.fileName,
        url: f.fileUrl,
      }));
    } else {
      formData.stage = res.stage;
    }
  }
});
</script>

<style scoped lang="scss">
.content-wrap {
  padding: px2rpx(12px) px2rpx(16px);
}
.page-bottom {
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
  .btn {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
  }
}
.card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 24rpx 32rpx;
  &:not(:first-child) {
    margin-top: 24rpx;
  }
  .title {
    font-size: 32rpx;
    line-height: 44rpx;
    margin-bottom: 16rpx;
    color: #000000e0;
    display: flex;
    align-items: center;
  }
  :deep(.rich-text-image) {
    max-width: 100%;
    height: auto;
  }
}
.content {
  :deep(.u-form-item) {
    padding: 0;
    display: block;
  }
  .form-item-inner {
    flex: auto;
  }
  .content-placeholder {
    color: rgba(0, 0, 0, 0.45);
    font-size: 28rpx;
    line-height: 70rpx;
  }
}
.required-mark {
  color: #ff4d4f;
  font-size: 30rpx;
  line-height: 40rpx;
  margin-inline-start: 8rpx;
  &::after {
    display: inline;
    content: '*';
    font-family: SimSun, sans-serif;
  }
}

// .rich-text-wrap {
//   max-height: 288rpx;
//   overflow: hidden;
// }
</style>
