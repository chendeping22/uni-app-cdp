<template>
  <view class="teacher-archive-edit">
    <view class="edit-body">
      <Form
        v-show="canShow"
        ref="formRef"
        :schema="schema"
        :dictionaries="dictionaries"
        :preview="false"
        :initial-data="initialData"
      ></Form>
    </view>
    <view class="edit-bottom">
      <view class="button-area">
        <u-button type="primary" style="height: 80rpx" :loading="loading" @click="confirm"
          >保存</u-button
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onBackPress } from '@dcloudio/uni-app';
import {
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue';
import Form from '../components/SchemaForm/Form.vue';

const instance = getCurrentInstance().proxy;
const eventChannel = instance.getOpenerEventChannel();

const props = reactive({});
const currentIsNew = ref(false);
const schema = ref({});
const dictionaries = ref();
const preview = ref();
const initialData = ref();
const loading = ref(false);

const formRef = ref();
const canShow = ref(false);

async function confirm() {
  // eventChannel.emit('dataToParent', {
  //   data: map(
  //     filter(list.value, one => one.checked),
  //     t => t.name,
  //   ),
  // });
  // uni.navigateBack();
  const values = await formRef.value?.submit();
  if (!values) {
    return Promise.reject();
  }
  // emit('submit', values);
  loading.value = true;
  eventChannel.emit('dataToParent', values);
}

async function handleGoBack() {
  uni.navigateBack();
}

onBeforeMount(() => {
  uni.$on('editGoBack', handleGoBack);
});

onBeforeUnmount(() => {
  uni.$off('editGoBack', handleGoBack);
});

// ArrayForm去掉new_id
onBackPress(() => {
  // if (currentIsNew.value) {
  // uni.$emit('updateArrayForm');
  // }
});

// 模拟ObjectFrom传参给Form
onMounted(() => {
  eventChannel.on('dataToChild', function (_data) {
    canShow.value = true;
    // console.log('ccc dataToChild ', _data);
    const { props: _props, formData = {} } = _data;
    // currentIsNew.value = formData?.isNew;
    // merge(props, _props);
    schema.value = _props.schema || {};
    dictionaries.value = _props.dictionaries;
    preview.value = _props.preview || false;
    initialData.value = _props.initialData || {};

    uni.setNavigationBarTitle({
      title: _props?.schema?.title,
    });
    // setValue依赖上面的属性(schema等)先赋值进去
    nextTick(() => {
      formRef.value?.setValue?.({ ...formData });
    });
  });
});
</script>

<style scoped lang="scss">
.teacher-archive-edit {
  $bodyPaddingBottom: 80rpx + 48rpx + 24rpx;
  .edit-body {
    padding: 24rpx 32rpx;
    overflow: hidden;
    padding-bottom: $bodyPaddingBottom;
    padding-bottom: calc(constant(safe-area-inset-bottom) + $bodyPaddingBottom);
    padding-bottom: calc(env(safe-area-inset-bottom) + $bodyPaddingBottom);
    .edit-block {
      border-radius: 16rpx;
      background-color: #fff;
    }
  }
  .edit-bottom {
    z-index: 2;
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    .button-area {
      padding: 24rpx 32rpx;
    }
  }
}

// #ifdef MP-WEIXIN
/* 兼容wx小程序 */
:deep(.form-block--common) {
  .u-form {
    .u-form-item {
      padding: 13rpx 0;
    }
    .u-form-item--left {
      flex: none !important;
      width: auto !important;
      max-width: 50%;
      padding-right: 32rpx;
      line-height: 44rpx;
    }
    .u-form-item__body {
      padding: 0 32rpx;
      min-height: 56rpx;
    }
    .u-form-item--right__content__slot {
      display: flex;
      flex-direction: row-reverse;
    }
    .u-form-item__message {
      padding-right: 32rpx !important;
      text-align: right !important;
    }
    .pure-text {
      line-height: 44rpx;
      color: rgba(0, 0, 0, 0.25);
    }
    .u-input__textarea {
      /* min-height: 70rpx !important; */
      padding: 0;
    }
    .textarea-form-item {
      .u-form-item--left__content {
        align-self: flex-start;
      }
    }

    .dictDisabled {
      .uni-input-placeholder {
        color: rgba(0, 0, 0, 0.25) !important;
      }
    }

    .uni-input-placeholder {
      color: rgba(0, 0, 0, 0.45) !important;
    }
    .textarea-input {
      width: 100%;
      text-align: right;
      font-size: 28rpx;
      color: #303133;
    }
  }
}

:deep(.object-form-wrap) {
  .button-area {
    flex: none;
    .u-btn {
      padding: 0;
      font-size: 26rpx;
      height: 36rpx;
      background-color: transparent;
      &::after {
        display: none;
      }
    }
    .button-text {
      margin-left: 12rpx;
    }
  }
}

// #endif
</style>
