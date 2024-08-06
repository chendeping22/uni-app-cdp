<script setup lang="ts">
import {
publishAlbum,
querySchoolPublishInfosDetail,
updateAlbum,
} from '@/app-platform/services/infos';
import { assign, delay, forEach, keys, map, omit, pick } from '@/utils/lodash-es';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { EVENTS, formLabelStyle, formValueStyle, isCheckSwitch, switchSizeStyle } from '../../util';
import auditorSelector from '../auditor-selector/index.vue';
import DateTime from '../date-time/index.vue';
import spaceSelector from '../space-selector/index.vue';
import Upload from '../upload/index.vue';
import WrapSafe from '../wrap-safe/index.vue';
import Wrap from '../wrap/index.vue';

enum formInOutType {
  in,
  out,
}

const props = withDefaults(
  defineProps<{
    /** 是否编辑 */
    edit: boolean;
  }>(),
  {},
);
const auditEnabled = ref(false);
const form1 = ref();
const id = ref();
const readonly = ref();
const loading = ref(false);
const data = reactive({
  formData: {
    auditorId: undefined,
    fileIds: [] as string[],
    spaceIds: [] as string[],
    title: '',
    /** 班牌显示 */
    isTop: false,
    topEndTime: '',
    topStartTime: '',
    /** 发布类型 */
    type: 4,
    status: 1,
    /** 终端类型 */
    imgs: [] as { url: string }[],
  },
  rules: {
    fileIds: [{ required: true, type: 'array', message: '请上传图片' }],
    title: [{ required: true, message: '请输入相册名称', trigger: 'blur' }],
    auditorId: [
      {
        validator: (_, value) => {
          if (auditEnabled.value && !value) {
            return false;
          }
          return true;
        },
        message: '请选择审批人',
      },
    ],
    spaceIds: [{ required: true, type: 'array', message: '请选择空间' }],
    topStartTime: [
      {
        validator: (_, value) => {
          if (data.formData.isTop && !value) {
            return false;
          }
          return true;
        },
        message: '请选择开始时间',
        trigger: 'blur',
      },
    ],
    topEndTime: [
      {
        validator: (_, value) => {
          if (data.formData.isTop && !value) {
            return false;
          }
          return true;
        },
        message: '请选择结束时间',
      },
      {
        asyncValidator: (_rule, value, callback) => {
          const startTime = dayjs(data.formData.topStartTime);
          const endTime = dayjs(value);

          if (!startTime.isValid() || !endTime.isValid()) {
            callback();
            return;
          }

          const diffTime = endTime.diff(startTime);

          if (diffTime <= 0) {
            callback(new Error('结束时间应晚于开始时间'));
            return;
          }

          if (diffTime % (5 * 60 * 1000) !== 0) {
            callback(new Error('选择时间步长为5分钟'));
            return;
          }

          callback();
        },
      },
    ],
  },
});
const text = reactive<{ auditorName?: string; spaceNames?: string[] }>({});

function getFormDataInOut(type: formInOutType, formData: Record<string, any>) {
  let newFormData = { ...formData };
  const bool2NumberKeys = ['isTop'];
  const dateStr2NumberKey2 = ['topEndTime', 'topStartTime'];
  const offRmKeyMap = {
    isTop: ['topEndTime', 'topStartTime'],
  };
  const omitFields = ['imgs'];

  if (type === formInOutType.in) {
    const targets = formData.target;
    newFormData = omit(formData, omitFields);
    forEach(bool2NumberKeys, key => {
      newFormData[key] = Number(newFormData[key]);
    });

    forEach(dateStr2NumberKey2, key => {
      newFormData[key] = newFormData[key] ? dayjs(newFormData[key]).valueOf() : undefined;
    });

    forEach(targets, key => {
      newFormData[key] = 1;
    });

    // 开关关闭下，字段进行清空
    forEach(keys(offRmKeyMap), key => {
      if (newFormData[key] !== 1) {
        const rmKeys = offRmKeyMap[key];
        forEach(rmKeys, rmKey => {
          newFormData[rmKey] = undefined;
        });
      }
    });
  }

  if (type === formInOutType.out) {
    assign(
      data.formData,
      pick(newFormData, [
        'title',
        'fileIds',
        'auditorId',
        'status',
        'spaceIds',
        ...dateStr2NumberKey2,
      ]),
    );
    data.formData.imgs = map(newFormData.fileList, file => ({ ...file, url: file.fileUrl }));
    data.formData.fileIds = map(newFormData.fileList, file => file.fileId);
    data.formData.auditorId = newFormData.auditorId || undefined;

    forEach(bool2NumberKeys, key => {
      data.formData[key] = newFormData[key] ? true : false;
    });

    text.auditorName = newFormData.auditorName;
    text.spaceNames = newFormData.spaceNames;
  }

  return newFormData;
}

function submit() {
  form1.value.validate(async valid => {
    if (!valid) return;
    loading.value = true;

    try {
      const params = getFormDataInOut(formInOutType.in, data.formData);
      if (props.edit) {
        await updateAlbum(id.value, params);
      } else {
        await publishAlbum(params);
      }

      if (!props.edit) {
        uni.$emit(EVENTS.publish);
      }
      uni.showToast({
        title: props.edit ? '已更新' : '已提交',
        icon: 'success',
        success() {
          delay(() => {
            loading.value = false;
            uni.navigateBack();
          }, 1000);
        },
      });
    } catch (_) {
      loading.value = false;
    }
  });
}

onMounted(() => {
  form1.value.setRules(data.rules);
});

onBeforeMount(() => {
  if (!props.edit) {
    isCheckSwitch().then(conf => {
      auditEnabled.value = conf;
    });
  }
});

onLoad(async option => {
  if (option?.id && props.edit) {
    id.value = option.id;
    const data: any = await querySchoolPublishInfosDetail(option.id);
    if (!data) {
      uni.showToast({
        icon: 'none',
        title: '此信息不存在',
      });
    }
    readonly.value = data.reviewStatus === 2;
    getFormDataInOut(formInOutType.out, data);
  }
});
</script>

<template>
  <view class="form">
    <u-form ref="form1" :model="data.formData" :error-type="['toast']" label-width="auto">
      <view class="u-m-t-12 form-item-bg">
        <u-form-item prop="fileIds" label-align="left" :label-style="formLabelStyle">
          <Upload
            v-model="data.formData.fileIds"
            :readonly="readonly"
            :default-file-list="data.formData.imgs"
            :max-count="10"
          />
        </u-form-item>
        <u-form-item
          label="相册名称"
          prop="title"
          :label-style="formLabelStyle"
          :custom-style="{ padding: '14rpx 0' }"
        >
          <Wrap>
            <u-input
              v-model="data.formData.title"
              clearable
              placeholder="请输入"
              maxlength="20"
              input-align="right"
              height="68"
              :custom-style="formValueStyle"
            />
          </Wrap>
        </u-form-item>
        <u-form-item
          v-if="auditEnabled || data.formData.auditorId"
          label="审核人"
          prop="auditorId"
          :label-style="formLabelStyle"
          :custom-style="{ padding: '26rpx 0', height: '96rpx', overflow: 'hidden' }"
        >
          <Wrap>
            <auditor-selector
              v-model="data.formData.auditorId"
              :readonly="readonly"
              :selected-text="text.auditorName"
            />
          </Wrap>
        </u-form-item>
        <u-form-item
          label="空间"
          prop="spaceIds"
          :label-style="formLabelStyle"
          :custom-style="{ padding: '24rpx 0' }"
        >
          <Wrap>
            <space-selector v-model="data.formData.spaceIds" :selected-text="text.spaceNames" />
          </Wrap>
        </u-form-item>
      </view>
      <view class="u-m-t-24 form-item-bg">
        <u-form-item
          label="霸屏显示"
          prop="isTop"
          :label-style="formLabelStyle"
          :custom-style="{ padding: '21rpx 0' }"
        >
          <template #right>
            <Wrap>
              <u-switch v-model="data.formData.isTop" size="58" :custom-style="switchSizeStyle" />
            </Wrap>
          </template>
        </u-form-item>
        <template v-if="data.formData.isTop">
          <u-form-item
            label="开始时间"
            prop="topStartTime"
            :label-style="formLabelStyle"
            :custom-style="{ padding: '24rpx 0' }"
          >
            <Wrap>
              <date-time v-model="data.formData.topStartTime" step="5" />
            </Wrap>
          </u-form-item>
          <u-form-item
            label="结束时间"
            prop="topEndTime"
            :label-style="formLabelStyle"
            :custom-style="{ padding: '24rpx 0' }"
          >
            <Wrap>
              <date-time v-model="data.formData.topEndTime" step="5" />
            </Wrap>
          </u-form-item>
        </template>
      </view>
    </u-form>
    <WrapSafe :height="40 + 16" />
  </view>
  <WrapSafe>
    <u-button type="primary" :loading="loading" @click="submit">发布</u-button>
  </WrapSafe>
</template>

<style lang="scss" scoped>
.form {
  background: $color-bg-layout;
  padding: $space-size-ms $space-size-md;

  .setting {
    &.icon {
      width: 100%;
    }

    .desc {
      @include callout-medium;
    }

    .r-txt {
      color: $color-primary;
      padding-right: $space-size-md;
    }

    &::after {
      top: 22rpx;
    }
  }

  &-item-bg {
    background: $color-background-base;
    margin: $space-size-s 0;
    border-radius: $radius-base;
    overflow: hidden;
    padding: 0 0 0 $space-size-md;
  }
}
</style>
