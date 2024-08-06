<script setup lang="ts">
import auditorSelector from '@/app-platform/infos/components/auditor-selector/index.vue';
import DateTime from '@/app-platform/infos/components/date-time/index.vue';
import spaceSelector from '@/app-platform/infos/components/space-selector/index.vue';
import wrapSafe from '@/app-platform/infos/components/wrap-safe/index.vue';
import {
  EVENTS,
  formLabelStyle,
  formValueStyle,
  isCheckSwitch,
  switchSizeStyle,
} from '@/app-platform/infos/util';
import {
  IInfoType,
  ReviewStatus,
  fetchVideoSnapshot,
  publishAlbum,
  querySchoolPublishInfosDetail,
  updateAlbum,
} from '@/app-platform/services/infos';
import closePng from '@/app-platform/static/infos/close.png';
import { getFileInfo } from '@/services/upload';
import { assign, delay, forEach, keys, pick } from '@/utils/lodash-es';
import { chooseAndUploadVideo } from '@/utils/upload-medias';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, watch, withDefaults } from 'vue';
import Wrap from '../wrap/index.vue';

interface Props {
  action?: 'add' | 'edit';
  id?: string;
}

enum formInOutType {
  in,
  out,
}

const props = withDefaults(defineProps<Props>(), {
  action: 'add',
});

const readonly = ref();
const formRef = ref();
const loading = ref(false);
const auditEnabled = ref<boolean>(false);
const videoUrl = ref<string>();
const posterUrl = ref<string>();
const text = reactive<{ auditorName?: string; spaceNames?: string[] }>({});
const data = reactive({
  formData: {
    fileIds: [],
    title: '',
    auditorId: undefined,
    spaceIds: [],
    isTop: false,
    topStartTime: '',
    topEndTime: '',
    type: IInfoType.video,
    status: ReviewStatus.waiting,
  },
  rules: {
    title: [{ required: true, type: 'string', message: '请输入标题' }],
    fileIds: [{ required: true, type: 'array', message: '请上传视频文件' }],
    spaceIds: [{ required: true, type: 'array', message: '请选择空间' }],
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
    topStartTime: [
      {
        validator: (_, value) => {
          if (data.formData.isTop && !value) {
            return false;
          }
          return true;
        },
        message: '请选择开始时间',
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
const isPopupVisible = ref<boolean>(false);

const handleVideoUpload = async () => {
  try {
    posterUrl.value = '';
    const result = await chooseAndUploadVideo({}, { isPublic: true });
    if (Array.isArray(result)) {
      const info = result[1] as any;
      videoUrl.value = info.fullUrl;
      data.formData.fileIds = [info.fileId as never];

      fetchVideoSnapshot({ fileId: info.fileId }).then(snapshotFileId => {
        if (snapshotFileId) {
          getFileInfo(snapshotFileId as string).then(data => {
            if (data && data.fullUrl) {
              posterUrl.value = data.fullUrl;
            }
          });
        }
      });
    }
  } catch (ex) {
    console.debug('[FN:handleVideoUpload]ERROR ', ex);
  }
};

const handleVideoRemove = () => {
  posterUrl.value = '';
  videoUrl.value = '';
  data.formData.fileIds = [];
};

const handlePopupChange = (visible: boolean) => {
  // #ifndef MP-WEIXIN
  setTimeout(() => {
    isPopupVisible.value = visible;
  }, 250);
  // #endif
};

function getFormDataInOut(type: formInOutType, formData: Record<string, any>) {
  let newFormData = { ...formData };
  const bool2NumberKeys = ['isTop'];
  const dateStr2NumberKey2 = ['topEndTime', 'topStartTime'];
  const offRmKeyMap = {
    isTop: ['topEndTime', 'topStartTime'],
  };

  if (type === formInOutType.in) {
    forEach(bool2NumberKeys, key => {
      newFormData[key] = Number(newFormData[key]);
    });

    forEach(dateStr2NumberKey2, key => {
      newFormData[key] = newFormData[key] ? dayjs(newFormData[key]).valueOf() : undefined;
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
      pick(newFormData, ['title', 'auditorId', 'status', 'spaceIds', ...dateStr2NumberKey2]),
    );
    data.formData.auditorId = newFormData.auditorId || undefined;
    data.formData.status = newFormData.status || ReviewStatus.waiting;

    forEach(bool2NumberKeys, key => {
      data.formData[key] = newFormData[key] ? true : false;
    });

    if (Array.isArray(newFormData.fileList)) {
      forEach(newFormData.fileList, item => {
        if (item.type === 1) {
          data.formData.fileIds = [item.fileId as never];
          videoUrl.value = item.fileUrl;
        } else {
          posterUrl.value = item.fileUrl;
        }
      });
    }

    text.auditorName = newFormData.auditorName;
    text.spaceNames = newFormData.spaceNames;
  }

  return newFormData;
}

const submit = () => {
  const isEdit = props.action === 'edit';
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      const params = getFormDataInOut(formInOutType.in, data.formData);
      const r = isEdit && props.id ? updateAlbum(props.id, params) : publishAlbum(params);

      r.then(() => {
        if (!isEdit) {
          uni.$emit(EVENTS.publish);
        }
        uni.showToast({
          title: isEdit ? '已更新' : '已提交',
          icon: 'success',
          success() {
            delay(() => {
              loading.value = false;
              uni.navigateBack();
            }, 1000);
          },
        });
      }).catch(() => {
        loading.value = false;
      });
    }
  });
};

watch(formRef, () => {
  if (formRef.value) {
    formRef.value.setRules(data.rules);
  }
});

watch(
  () => props.id,
  id => {
    if (id) {
      querySchoolPublishInfosDetail(id).then((resData: any) => {
        if (!resData) {
          uni.showToast({
            icon: 'none',
            title: '此信息不存在',
          });
        }

        const detail = resData || {};

        // 已审核发布，不支持修改视频和审核人，其他字段均可编辑；
        readonly.value = detail.reviewStatus === 2;
        getFormDataInOut(formInOutType.out, detail);
      });
    }
  },
  { immediate: true },
);

onBeforeMount(() => {
  if (!props.id) {
    isCheckSwitch().then(conf => {
      auditEnabled.value = conf;
    });
  }
});
</script>

<template>
  <page custom-overflow="scroll">
    <view class="form">
      <u-form ref="formRef" :model="data.formData" :error-type="['toast']" label-width="auto">
        <view class="u-m-t-12 form-item-bg">
          <u-form-item prop="fileIds">
            <view class="video-container">
              <!-- #ifndef MP-WEIXIN -->
              <view v-if="isPopupVisible && videoUrl" class="video-cover"></view>
              <!-- #endif -->
              <video
                v-if="!isPopupVisible && videoUrl"
                class="u-relative"
                :src="videoUrl"
                :poster="posterUrl"
              >
                <!-- #ifndef MP-WEIXIN -->
                <cover-view
                  v-if="!readonly"
                  class="u-absolute u-flex u-row-center btn-remove"
                  @click="handleVideoRemove"
                >
                  <cover-image :src="closePng" class="icon-close" @click="handleVideoRemove" />
                </cover-view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <view
                  v-if="!readonly"
                  class="u-absolute u-flex u-row-center btn-remove"
                  @click="handleVideoRemove"
                >
                  <image :src="closePng" class="icon-close" />
                </view>
                <!-- #endif -->
              </video>
              <view v-if="!videoUrl" class="btn-upload" @click="handleVideoUpload">
                <u-icon name="plus" color="#00000073" size="50" />
              </view>
            </view>
          </u-form-item>
          <u-form-item
            label="视频名称"
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
            :custom-style="{ padding: '26rpx 0', height: '96rpx', overflow: 'hidden' }"
            :label-style="formLabelStyle"
          >
            <Wrap>
              <auditor-selector
                v-model="data.formData.auditorId"
                :selected-text="text.auditorName"
                :readonly="readonly"
              />
            </Wrap>
          </u-form-item>
          <u-form-item
            label="空间"
            prop="spaceIds"
            :custom-style="{ padding: '24rpx 0' }"
            :label-style="formLabelStyle"
            :border-bottom="false"
          >
            <Wrap>
              <space-selector v-model="data.formData.spaceIds" :selected-text="text.spaceNames" />
            </Wrap>
          </u-form-item>
        </view>

        <view class="u-m-t-12 form-item-bg">
          <u-form-item
            label="霸屏显示"
            prop="type"
            :label-style="{ fontSize: '32rpx', fontWeight: 500 }"
            :border-bottom="data.formData.isTop"
            :custom-style="{ padding: '14rpx 0' }"
          >
            <template #right>
              <Wrap>
                <u-switch v-model="data.formData.isTop" :custom-style="switchSizeStyle" size="58" />
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
                <date-time
                  v-model="data.formData.topStartTime"
                  placeholder="请选择"
                  step="5"
                  @on-popup-change="handlePopupChange"
                />
              </Wrap>
            </u-form-item>
            <u-form-item
              label="结束时间"
              prop="topEndTime"
              :label-style="formLabelStyle"
              :border-bottom="false"
              :custom-style="{ padding: '24rpx 0' }"
            >
              <Wrap>
                <date-time
                  v-model="data.formData.topEndTime"
                  placeholder="请选择"
                  step="5"
                  @on-popup-change="handlePopupChange"
                />
              </Wrap>
            </u-form-item>
          </template>
        </view>
      </u-form>
    </view>
    <wrap-safe>
      <u-button type="primary" :loading="loading" @click="submit">发布</u-button>
    </wrap-safe>
  </page>
</template>

<style lang="scss" scoped>
.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}
.video-container {
  position: relative;
  overflow: hidden;
  width: px2rpx(311);
  height: px2rpx(192);
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: $radius-base;

  video {
    width: 100%;
    height: 100%;
  }
  .btn-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
.btn-remove {
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  overflow: hidden;
  z-index: 2;
}

.icon-close {
  display: block;
  width: px2rpx(20);
  height: px2rpx(20);
  margin: 0;
  padding: 0;
}
.form {
  background: $color-bg-layout;
  padding: $space-size-ms $space-size-md;

  &-item-bg {
    background: $color-background-base;
    margin: $space-size-s 0;
    border-radius: $radius-base;
    overflow: hidden;
    padding: 0 0 0 $space-size-md;
  }

  &-divider {
    width: 100%;
    border-bottom: 1px solid $color-split;
  }
}
</style>
