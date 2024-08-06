<template>
  <u-form
    ref="formRef"
    :model="formState"
    :error-type="['toast']"
    label-position="top"
    label-width="auto"
  >
    <view class="u-m-l-32 u-m-r-32 u-m-t-24 u-m-b-24 form-block">
      <view class="u-p-t-24 u-p-b-24 type">
        <view
          v-for="(type, index) in feedbackType"
          :key="index"
          :class="['type-item', { active: formState.feedbackType === type.code }]"
          @click="formState.feedbackType = type.code"
        >
          <text>{{ type.desc }}</text>
        </view>
      </view>
    </view>
    <view class="u-m-l-32 u-m-r-32 u-m-t-24 u-m-b-24 form-block">
      <u-form-item label="反馈内容" prop="content" required :custom-style="{ ...formValueStyle }">
        <view>
          <textarea
            v-model="formState.content"
            maxlength="500"
            placeholder="您可以在这里尽可能详细地描述您的问题或建议"
            placeholder-class="textarea-placeholder"
            style="width: 622rpx"
            @blur="handleContentBlur"
          />
          <text class="form-item__desc float-right">{{ formState.content.length }}/500</text>
        </view>
      </u-form-item>
      <u-form-item
        :label="`上传视频（${formState.videoId ? 1 : 0}/1）`"
        :custom-style="{ ...formValueStyle }"
      >
        <video-upload v-model="formState.videoId" :max-size="50" />
      </u-form-item>
      <u-form-item
        :label="`上传照片（${formState.imageIds?.length || 0}/5）`"
        :custom-style="{ ...formValueStyle }"
      >
        <image-upload
          v-model="formState.imageIds"
          :default-file-list="imageList"
          :per-choose-count="5 - (formState.imageIds?.length || 0)"
          :max-count="5"
          :max-size="5"
        />
      </u-form-item>
      <u-form-item
        label="发生时间"
        label-position="left"
        :custom-style="{ ...formValueStyle }"
        :border-bottom="false"
      >
        <date-time v-model="formState.occurrenceTime" placeholder="请选择" step="1" />
      </u-form-item>
    </view>
  </u-form>
  <view>
    <view class="safe-area-inset-bottom fixed-button">
      <view class="u-m-l-32 u-m-r-32 u-p-t-24 u-p-b-24" style="height: auto">
        <u-button type="primary" :loading="loading" @click="handleSubmit">提交</u-button>
      </view>
    </view>
    <view class="safe-area-inset-bottom">
      <view style="height: 128rpx"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import VideoUpload from '@/app-platform/components/video-upload/index.vue';
import DateTime from '@/app-platform/infos/components/date-time/index.vue';
import ImageUpload from '@/app-platform/infos/components/upload/index.vue';
import { delay } from '@/utils/lodash-es';
import { request } from '@/utils/request';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, toRaw, watch } from 'vue';

interface FeedbackType {
  code: string;
  desc: string;
}

const formValueStyle = { lineHeight: 1.375, fontSize: '32rpx', fontWeight: 400 };
const rules = {
  content: [{ required: true, type: 'string', message: '请输入反馈内容' }],
};

const loading = ref<boolean>();
const formRef = ref();
const feedbackType = ref<FeedbackType[]>([]);
const imageList = ref([]);
const formState = reactive<{
  feedbackType: string;
  content: string;
  imageIds?: string[];
  videoId?: string;
  occurrenceTime: string | number;
}>({
  feedbackType: '1',
  content: '',
  imageIds: [],
  videoId: '',
  occurrenceTime: Date.now(),
});

const fetchFeedbackType = () => {
  request<FeedbackType[]>('/enum/values', { enumName: 'FeedbackTypeEnum' }, 'GET', {
    spaceType: request.service.data,
  }).then(res => {
    if (res && Array.isArray(res)) {
      feedbackType.value = res;
      formState.feedbackType = res[0].code;
    }
  });
};

const handleSubmit = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      const data = toRaw(formState);
      data.occurrenceTime = dayjs(data.occurrenceTime).format('YYYY-MM-DD HH:mm:ss');
      request('/feedback', data, 'POST', {
        spaceType: request.service.data,
      })
        .then(() => {
          uni.showToast({
            title: '反馈已提交',
            icon: 'success',
            success() {
              delay(() => {
                loading.value = false;
                uni.navigateBack();
              }, 1000);
            },
          });
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
};

const handleContentBlur = () => {
  if (formState.content) {
    formState.content = formState.content.trim();
  }
};

watch(formRef, () => {
  if (formRef.value) {
    formRef.value.setRules(rules);
  }
});

onBeforeMount(() => {
  fetchFeedbackType();
});
</script>

<style lang="scss" scoped>
.form-block {
  padding: 0 32rpx;
  background-color: #fff;
  border-radius: $radius-base;
  box-shadow: $shadow-light-down-base;
}
.form-item {
  &__desc {
    color: $color-text-description;
    line-height: 20 /12;
    font-size: 24rpx;
  }
}
.type {
  display: flex;
  justify-content: space-between;

  &-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 182rpx;
    height: 80rpx;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: $radius-sm;
    color: rgba(0, 0, 0, 0.65);

    &.active {
      background-color: #e6f4ff;
      color: $color-primary;
    }
  }
}

.textarea-placeholder {
  color: $color-text-description;
}
.fixed-button {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: $color-background-base;
  box-shadow: $shadow-light-up-md;
  z-index: 3;

  &.relative {
    position: static;
    background: transparent;
    box-shadow: none;
  }
}
</style>
