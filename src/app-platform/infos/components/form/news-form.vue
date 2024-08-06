<script setup lang="ts">
import {
  editInfos,
  publishInfos,
  querySchoolPublishInfosDetail,
} from '@/app-platform/services/infos';
import {
  assign,
  delay,
  filter,
  forEach,
  get,
  includes,
  isEmpty,
  keys,
  map,
  omit,
  pick,
} from '@/utils/lodash-es';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import {
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import {
  EVENTS,
  LOG_STATUS,
  formLabelStyle,
  formValueStyle,
  isCheckSwitch,
  switchSizeStyle,
} from '../../util';
import auditorSelector from '../auditor-selector/index.vue';
import Dafter from '../dafter/index.vue';
import DateRange from '../date-range/index.vue';
import DateTime from '../date-time/index.vue';
import spaceSelector from '../space-selector/index.vue';
import Upload from '../upload/index.vue';
import WrapSafe from '../wrap-safe/index.vue';
import Wrap from '../wrap/index.vue';

enum formInOutType {
  /** 表单创建 */
  in,
  /** 表单编辑 */
  out,
}

const props = withDefaults(
  defineProps<{
    /** 是否编辑 */
    edit: boolean;
  }>(),
  {},
);

const classBoardTarget = 'classBoardTarget';
const auditEnabled = ref(false);
const readonly = ref(false);
const loading = ref(false);
const open = ref(false);
const form1 = ref();
const id = ref();
const collapse = ref();
const detail = reactive<Record<string, any>>({});
const hiddenFields = reactive<string[]>([]);
const data = reactive({
  formData: {
    auditorId: undefined,
    content: '',
    /**有效期 */
    isExpirate: false,
    expirationDate: '',
    /** 封面 */
    fileId: '',
    /** 置顶 */
    topDisplay: false,
    /** 定时发布 */
    scheduledRelease: false,
    /** 定时发布时间 */
    scheduledReleaseTime: '',
    spaceIds: [],
    title: '',
    /** 班牌显示 */
    isTop: false,
    topEndTime: '',
    topStartTime: '',
    /** 发布类型 */
    type: 1,
    status: 1,
    /** 终端类型 */
    target: [] as string[],
    imgs: [] as { url: string }[],
    editorText: '',
  },
  rules: {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    fileId: [{ required: true, message: '请上传封面', trigger: 'blur' }],
    content: [
      { required: true, message: '请输入内容', trigger: 'blur' },
      {
        asyncValidator: (_, __, callback) => {
          const text = data.formData.editorText || '';
          const html = data.formData.content || '';
          const hasImg = /<img/g.test(html);

          if (/^\s*$/g.test(text) && !hasImg) {
            callback(new Error('资讯内容不能全空字符'));
            return;
          }

          if (text.length > 3000) {
            callback(new Error('资讯内容长度不能超过3000个字符'));
            return;
          }
          callback();
        },
      },
    ],
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
    target: [{ required: true, type: 'array', message: '请选择发布终端' }],
    scheduledReleaseTime: [
      { required: true, message: '请选择发布时间' },
      {
        asyncValidator: (_rule, value, callback) => {
          // 若定时发布的时间早于审核通过的时间，则发布的时间以审核通过时间为准
          const today = dayjs().format('YYYY-MM-DD HH:mm');
          const publishTime = dayjs(data.formData.scheduledReleaseTime);
          const expirationTime = dayjs(data.formData.expirationDate);
          const isExpirate = get(data.formData, 'isExpirate', false);

          if (publishTime.isBefore(today)) {
            callback(new Error('发布时间不能是过去时间'));
            return;
          }

          if (
            isExpirate &&
            expirationTime.isValid() &&
            publishTime.isAfter(expirationTime.add(23, 'h').add(59, 'm').add(59, 's'))
          ) {
            callback(new Error('发布时间不能晚于下线时间'));
            return;
          }
          callback();
        },
      },
    ],
    expirationDate: [
      {
        asyncValidator: (_rule, value, callback) => {
          if (!value) {
            callback(new Error('请选择下线时间'));
            return;
          }

          if (data.formData.isExpirate && !value) {
            callback(new Error('请选择下线时间'));
            return;
          }

          const now = dayjs().format('YYYY-MM-DD');
          const eDate = dayjs(data.formData.expirationDate);

          if (eDate.isBefore(now)) {
            callback(new Error('下线时间应晚于当天'));
            return;
          }

          callback();
        },
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

const checkedList = reactive([
  {
    value: classBoardTarget,
    checked: false,
    name: '班牌',
  },
  {
    value: 'mobileBannerTarget',
    checked: false,
    name: '移动端 Banner',
  },
  {
    value: 'workbenchTarget',
    checked: false,
    name: '网页端工作台',
  },
]);

/** 发布终端映射 */
function filterTargetKeys(newFormData: Record<string, any>) {
  const _target = pick(
    newFormData,
    map(checkedList, check => check.value),
  );
  const targetKeys = filter(
    map(keys(_target), key => (_target[key] ? key : false)),
    Boolean,
  ) as string[];
  forEach(checkedList, item => {
    if (includes(targetKeys, item.value)) {
      item.checked = true;
    } else {
      item.checked = false;
    }
  });

  return targetKeys;
}

function getFormDataInOut(type: formInOutType, formData: Record<string, any>) {
  let newFormData = { ...formData };
  const bool2NumberKeys = ['isTop', 'isExpirate', 'scheduledRelease', 'topDisplay'];
  const offRmKeyMap = {
    isExpirate: ['expirationDate'],
    scheduledRelease: ['scheduledReleaseTime'],
    isTop: ['topEndTime', 'topStartTime', 'spaceIds'],
  };
  const dateStr2NumberKey2 = [
    'expirationDate',
    'scheduledReleaseTime',
    'topEndTime',
    'topStartTime',
  ];

  if (type === formInOutType.in) {
    const targets = formData.target;
    newFormData = omit(formData, ['imgs', 'editorText', 'target']);
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
          newFormData[rmKey] = rmKey === 'spaceIds' ? [] : undefined;
        });
      }
    });
  }

  if (type === formInOutType.out) {
    assign(
      data.formData,
      pick(newFormData, [
        'title',
        'content',
        'fileId',
        'auditorId',
        'status',
        'spaceIds',
        ...dateStr2NumberKey2,
      ]),
    );
    data.formData.imgs = [{ url: newFormData.fileUrl }];
    data.formData.auditorId = newFormData.auditorId || undefined;

    forEach(bool2NumberKeys, key => {
      data.formData[key] = newFormData[key] ? true : false;
    });
    data.formData.target = filterTargetKeys(newFormData);

    text.auditorName = newFormData.auditorName;
    text.spaceNames = newFormData.spaceNames;

    if (
      data.formData.isExpirate ||
      data.formData.topDisplay ||
      data.formData.isTop ||
      data.formData.scheduledRelease ||
      includes(data.formData.target, classBoardTarget)
    ) {
      open.value = true;
      nextTick(() => resetCollapseContainer(300));
    }
  }

  //特殊字符(&amp;)处理
  if (newFormData.content) {
    newFormData.content = newFormData.content.replace(/&amp;/g, '&');
  }

  return newFormData;
}

function submit() {
  form1.value.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    const params = getFormDataInOut(formInOutType.in, data.formData);

    try {
      if (props.edit) {
        await editInfos(params, id.value);
      } else {
        await publishInfos(params);
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

/** 重置容器collapse */
function resetCollapseContainer(timer = 100) {
  const oCollapse = collapse.value;
  if (oCollapse) {
    delay(() => oCollapse.init(), timer);
  }
}

function handleCheckboxGroup() {
  if (!includes(data.formData.target, classBoardTarget)) {
    data.formData.isTop = false;
  }
  resetCollapseContainer();
}

const cleanEffect = watchEffect(() => {
  if (isEmpty(detail)) {
    return;
  }

  if ([LOG_STATUS.time_publish, LOG_STATUS.publish].includes(detail.status)) {
    hiddenFields.push('scheduledReleaseTime');
  }
});

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
    assign(detail, data);
    readonly.value = data.reviewStatus === 2;
    getFormDataInOut(formInOutType.out, data);
  }
});

onBeforeUnmount(() => {
  cleanEffect();
});
</script>

<template>
  <view class="form">
    <u-form ref="form1" :model="data.formData" :error-type="['toast']" label-width="auto">
      <view class="u-m-t-12 form-item-bg u-p-t-2">
        <u-form-item
          prop="title"
          :label-style="formLabelStyle"
          :custom-style="{ padding: '12rpx 32rpx 12rpx 0' }"
        >
          <u-input
            v-model="data.formData.title"
            clearable
            placeholder="请输入标题"
            maxlength="50"
            :custom-style="formValueStyle"
          />
        </u-form-item>
        <u-form-item prop="content" :custom-style="{ ...formValueStyle, paddingBottom: '24rpx' }">
          <Dafter
            v-model="data.formData.content"
            v-model:text="data.formData.editorText"
            placeholder="请输入内容"
          />
        </u-form-item>
        <u-form-item
          label="封面"
          prop="fileId"
          :label-style="{ ...formLabelStyle, position: 'relative', top: '-48rpx' }"
        >
          <template #right>
            <Wrap>
              <Upload
                v-model="data.formData.fileId"
                :default-file-list="data.formData.imgs"
                _class="u-m-r-0"
              />
            </Wrap>
          </template>
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
          label="发布终端"
          prop="target"
          label-position="top"
          :border-bottom="false"
          :label-style="formLabelStyle"
        >
          <u-checkbox-group v-model="data.formData.target" wrap shape="circle">
            <u-checkbox
              v-for="(item, index) in checkedList"
              :key="index"
              v-model="item.checked"
              :name="item.value"
              @change="handleCheckboxGroup"
            >
              {{ item.name }}
            </u-checkbox>
          </u-checkbox-group>
        </u-form-item>
      </view>

      <view class="u-m-t-24 form-item-bg">
        <u-collapse ref="collapse" :accordion="false" hover-class="none">
          <u-collapse-item :open="open" @change="open = !open">
            <template #title-all>
              <view :class="['setting u-flex u-row-between icon', { 'u-border-bottom': open }]">
                <text class="desc">高级设置</text>
                <view v-if="open" class="r-txt">
                  收起
                  <u-icon name="arrow-down" />
                </view>
                <view v-else class="r-txt">
                  展开
                  <u-icon name="arrow-right" />
                </view>
              </view>
            </template>

            <u-form-item
              label="置顶"
              prop="topDisplay"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '16rpx 0' }"
            >
              <template #right>
                <Wrap>
                  <u-switch
                    v-model="data.formData.topDisplay"
                    size="58"
                    :custom-style="switchSizeStyle"
                  />
                </Wrap>
              </template>
            </u-form-item>

            <u-form-item
              v-if="!includes(hiddenFields, 'scheduledReleaseTime')"
              label="定时发布"
              prop="scheduledRelease"
              label-width="auto"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '16rpx 0' }"
            >
              <template #right>
                <Wrap>
                  <u-switch
                    v-model="data.formData.scheduledRelease"
                    size="58"
                    :custom-style="switchSizeStyle"
                    @change="resetCollapseContainer"
                  />
                </Wrap>
              </template>
            </u-form-item>
            <u-form-item
              v-if="
                data.formData.scheduledRelease && !includes(hiddenFields, 'scheduledReleaseTime')
              "
              label="发布时间"
              prop="scheduledReleaseTime"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '24rpx 0' }"
            >
              <Wrap>
                <date-time v-model="data.formData.scheduledReleaseTime" placeholder="请选择" />
              </Wrap>
            </u-form-item>

            <u-form-item
              label="设置有效期"
              prop="isExpirate"
              label-width="auto"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '16rpx 0' }"
            >
              <template #right>
                <Wrap>
                  <u-switch
                    v-model="data.formData.isExpirate"
                    size="58"
                    :custom-style="switchSizeStyle"
                    @change="resetCollapseContainer"
                  />
                </Wrap>
              </template>
            </u-form-item>
            <u-form-item
              v-if="data.formData.isExpirate"
              label="下线时间"
              prop="expirationDate"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '24rpx 0' }"
            >
              <Wrap>
                <date-range
                  v-model="data.formData.expirationDate"
                  :min-date="data.formData.scheduledReleaseTime"
                  placeholder="请选择"
                />
              </Wrap>
            </u-form-item>

            <u-form-item
              v-if="includes(data.formData.target, classBoardTarget)"
              label="在班牌霸屏显示"
              prop="isTop"
              :label-style="formLabelStyle"
              :custom-style="{ padding: '16rpx 0' }"
            >
              <template #right>
                <Wrap>
                  <u-switch
                    v-model="data.formData.isTop"
                    size="58"
                    :custom-style="switchSizeStyle"
                    @change="resetCollapseContainer"
                  />
                </Wrap>
              </template>
            </u-form-item>
            <template
              v-if="data.formData.isTop && includes(data.formData.target, classBoardTarget)"
            >
              <u-form-item
                label="空间"
                prop="spaceIds"
                :label-style="formLabelStyle"
                :custom-style="{ padding: '24rpx 0' }"
              >
                <Wrap>
                  <space-selector
                    v-model="data.formData.spaceIds"
                    :selected-text="text.spaceNames"
                  />
                </Wrap>
              </u-form-item>
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
          </u-collapse-item>
        </u-collapse>
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
    padding: 2rpx 0;
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

  &-item {
    padding: px2rpx(6px);
    padding-left: 0;
    padding-right: $space-size-md;
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
