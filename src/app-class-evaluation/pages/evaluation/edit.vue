<script setup lang="ts">
import iconFilter from '@/app-class-evaluation/static/filter.svg';
import { showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, reactive, ref, watch } from 'vue';
import IndicatorItem from '../../components/evaluation/indicator-item.vue';
import FormItem from '../../components/form-item.vue';
import TypePopup from '../../components/type-popup/index.vue';
import UploadMedia from '../../components/upload-media.vue';
import { addEvaluation, getEvaluationIndicator } from '../../services/evaluation';
import { useStudentSelectorStore } from '../../store/student-selector';
import { Indicator } from '../../types/evaluation';
import { selectStudent } from '../student-selector/show-selector';

const store = useStudentSelectorStore();

const _today = dayjs(dayjs().format('YYYY-MM-DD')).valueOf();

const _initFormData: any = {
  remark: '',
  commentTimes: 1,
  associatedStudent: [],
  fileInfo: [],
  privacySettings: 0,
  evaluationDate: _today,
};

const typePopupRef = ref();

const state = reactive<{
  loading: boolean;
  schemeId: string;
  initialSchemeId: string;
  currentTabIdx: number;
  selectIds: string[];
  tabList: any[];
  editData: any;
  activeIndicatorId: string;
  indicatorList: Indicator[][];
  isSelectedAllStudent: boolean;
  showModal: boolean;
  showPrivacy: boolean;
}>({
  loading: false,
  schemeId: '',
  initialSchemeId: '',
  currentTabIdx: 0,
  selectIds: [],
  activeIndicatorId: '',
  tabList: [],
  isSelectedAllStudent: false,
  indicatorList: [],
  editData: {},
  showModal: false,
  showPrivacy: false,
});

const formState = ref<any>({ ..._initFormData });

const currentIndicators = computed(() => {
  return state.indicatorList[state.currentTabIdx] || [];
});

const typeList = computed(() => {
  return state.tabList.map((i, idx) => ({ value: `${idx}`, label: i.indicatorName }));
});

const _associatedStudentName = computed(() => {
  if (!formState.value.associatedStudent?.length) {
    return '';
  }

  const len = formState.value.associatedStudent.length;

  if (len < 3) {
    return formState.value.associatedStudent.map(i => i.studentName).join('、');
  }

  if (state.isSelectedAllStudent) {
    return '所有学生';
  }

  if (store.selectedClassIds.length === 1) {
    return `${formState.value.associatedStudent
      .slice(0, 2)
      .map(i => i.studentName)
      .join('、')}共${len}人`;
  }

  return `已关联${len}人`;
});

const getIndicators = async () => {
  if (!state.initialSchemeId) {
    return;
  }
  try {
    state.loading = true;
    const response: any = await getEvaluationIndicator({
      schemeId: state.initialSchemeId,
    });
    if (response?.length) {
      const _list: any[] = [];
      const _indicators: any[] = [];
      response.forEach(item => {
        const { children, ...rest } = item;

        let name = rest.indicatorName || '';
        if (name.length > 4) {
          name = `${name.substring(0, 4)}...`;
        }
        _list.push({ ...rest, name });

        if (children?.length) {
          _indicators.push(children);
        } else {
          _indicators.push([rest]);
        }
      });
      state.tabList = _list;
      state.indicatorList = _indicators;

      const _indicator = _indicators[0]?.[0];
      if (_indicator?.id) {
        const { children, ...rest } = _indicator;
        state.editData[_indicator.id] = { ...rest, ..._initFormData };
        state.activeIndicatorId = _indicator.id;
      }
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
  }
};

const onActive = (data: Indicator, checked?: boolean) => {
  if (!state.editData[data.id]) {
    const { children, ...rest } = data;
    state.editData[data.id] = { ...rest, ..._initFormData };
  }

  if (checked) {
    state.selectIds = [...state.selectIds, data.id];
  }

  state.activeIndicatorId = data.id;
};

const onSelect = (checked: boolean, data: Indicator) => {
  if (checked) {
    onActive(data);
    state.selectIds = [...state.selectIds, data.id];
  } else {
    state.selectIds = state.selectIds.filter(i => i !== data.id);
  }
};

const handleConfirmClick = async () => {
  state.editData[state.activeIndicatorId] = {
    ...state.editData[state.activeIndicatorId],
    ...formState.value,
  };

  const recordDetailDTOS = state.selectIds.map(i => {
    const { associatedStudent, id, privacySettings, ...val } = state.editData[i] || {};
    return {
      ...val,
      indicatorId: id,
      privacySettings: privacySettings ? 1 : 0,
      associatedStudentIds: associatedStudent?.map((v: any) => v.studentId),
    };
  });

  try {
    await addEvaluation({
      clazzIdList: store.selectedClassIds,
      initialSchemeId: state.initialSchemeId,
      evaluationSchemeId: state.schemeId,
      recordDetailDTOS,
    });
    showInfo('点评成功');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '点评失败',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  }
};

const handleBeforeConfirmClick = async () => {
  if (!state.selectIds.length) {
    uni.showToast({
      title: '至少需要勾选1个评分项',
      icon: 'none',
    });
    return;
  }
  if (dayjs(_initFormData.evaluationDate).isBefore(dayjs(_today), 'day')) {
    state.showModal = true;
  } else {
    handleConfirmClick();
  }
};

const onOpenFilter = () => {
  typePopupRef.value?.open();
};

const onSelectStudent = () => {
  selectStudent({
    value: formState.value.associatedStudent,
    callback: data => {
      state.isSelectedAllStudent = data.isSelectedAll;
      formState.value.associatedStudent = data.value;
    },
  });
};

const emptyFillInfo = computed(() => !formState.value.fileInfo?.length);

watch(emptyFillInfo, newVal => {
  if (newVal) {
    formState.value.privacySettings = 0;
  }
});

/**
 * 切换选中的指标对应的编辑数据
 */
watch(
  () => state.currentTabIdx,
  (n, o) => {
    const _indicator = state.indicatorList[n]?.[0];
    if (n !== o && _indicator?.id) {
      const id = _indicator.id;
      if (!state.editData[id]) {
        const { children, ...rest } = _indicator;
        state.editData[id] = { ...rest, ..._initFormData };
      }

      state.activeIndicatorId = id;
    }
  },
);

/**
 * 切换选中的指标对应的编辑数据
 */
watch(
  () => state.activeIndicatorId,
  (newInd, oldInd) => {
    if (oldInd) {
      state.editData[oldInd] = { ...state.editData[oldInd], ...formState.value };
    }
    if (newInd) {
      formState.value = { ...state.editData[newInd] };
    }
  },
  { immediate: true },
);

onLoad((options: any) => {
  /** 获取指标数据 */
  state.initialSchemeId = options.schemeId1 || '';
  state.schemeId = options.schemeId || '';
  getIndicators();

  /** 关联学生 */
  if (options.stuId) {
    _initFormData.associatedStudent = [
      {
        studentId: options.stuId,
        studentName: options.stuName,
        clazzId: options.claId,
      },
    ];
  }

  if (options.date) {
    _initFormData.evaluationDate = +options.date;
  }

  setTimeout(
    () =>
      uni.setNavigationBarTitle({
        title: options.title || '',
      }),
    100,
  );
});

const changeRemark = (val?: string) => {
  formState.remark = val && val?.length > 200 ? val?.slice(0, 200) : val;
};
</script>

<template>
  <page custom-overflow="visible" class="evaluation-edit">
    <view class="evaluation-edit-header">
      <view class="evaluation-edit-tabs">
        <u-tabs
          v-model="state.currentTabIdx"
          :list="state.tabList"
          :is-scroll="true"
          inactive-color="rgba(0, 0, 0, 0.65)"
        ></u-tabs>
      </view>
      <view class="evaluation-edit-tabs-filter" @click="onOpenFilter">
        <u-image
          :src="iconFilter"
          width="40rpx"
          height="40rpx"
          :show-loading="false"
          :fade="false"
        ></u-image>
      </view>
    </view>
    <view class="evaluation-edit-header-placeholder" />
    <view class="evaluation-indicators">
      <scroll-view scroll-y class="evaluation-indicators-scroll">
        <view class="evaluation-indicators-content">
          <indicator-item
            v-for="item in currentIndicators"
            :key="item.id"
            :data="item"
            :selected="state.selectIds.includes(item.id)"
            :active="state.activeIndicatorId === item.id"
            @selected="onSelect"
            @click="onActive"
          ></indicator-item>
        </view>
      </scroll-view>
    </view>
    <view class="evaluation-form">
      <form-item
        v-if="formState.isRelatedToStudent"
        title="关联学生"
        className="form-item-auto form-item-student"
        @click="onSelectStudent"
      >
        <template #content>
          <view v-if="_associatedStudentName" class="student-value">{{
            _associatedStudentName
          }}</view>
          <view v-else class="student-value" style="color: rgba(0, 0, 0, 0.45)">请选择</view>
        </template>
        <template #right>
          <u-icon class="form-item-right" name="arrow-right" size="36rpx" color="#00000073"></u-icon
        ></template>
      </form-item>
      <form-item title="点评次数">
        <template #content>
          <u-number-box v-model="formState.commentTimes" :min="1" input-height="48"></u-number-box>
        </template>
      </form-item>
      <upload-media v-model:value="formState.fileInfo"></upload-media>
      <form-item v-if="formState.fileInfo.length" class-name="overflow-visible">
        <template #title>
          <view class="u-flex u-relative" @click="state.showPrivacy = true">
            <text>隐私设置</text>
            <u-icon
              style="margin-top: 1px; margin-left: 4px"
              name="info-circle"
              size="36rpx"
              color="#00000073"
            ></u-icon>
            <view
              v-if="state.showPrivacy"
              class="privacy-settings-tip-mask"
              @click.stop="state.showPrivacy = false"
            ></view>
            <view v-if="state.showPrivacy" class="privacy-settings-tip footnote-regular"
              >在隐私设置开启的状态下，仅有德育主任、班主任及该评价人可以查阅照片和视频</view
            >
          </view>
        </template>
        <template #content>
          <view class="u-flex u-row-right">
            <u-switch
              v-model="formState.privacySettings"
              :active-value="1"
              :inactive-value="0"
            ></u-switch>
          </view>
        </template>
      </form-item>
      <form-item className="form-item-auto edit-comment-textarea" title="备注">
        <template #content>
          <u-input
            v-model="formState.remark"
            type="textarea"
            input-align="right"
            placeholder="请输入"
            :maxlength="200"
            clearable
            :trim="true"
            :border="false"
            :auto-height="false"
            :custom-style="{ fontSize: '32rpx', height: '160rpx' }"
            @input="changeRemark"
          />
          <view class="remark-count body-small">{{ formState.remark?.length || 0 }}/200</view>
        </template>
      </form-item>
    </view>
    <view class="toolbar">
      <u-button style="width: 100%" type="primary" @click="handleBeforeConfirmClick">确定</u-button>
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
    <view class="toolbar-placeholder">
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
  </page>
  <type-popup :list="typeList" v-model:value="state.currentTabIdx" ref="typePopupRef" />
  <u-modal
    v-model="state.showModal"
    content="数据保存后将同步更新统计报表和荣誉统计数据。请确认是否进行更新？"
    show-cancel-button
    show-confirm-button
    @confirm="handleConfirmClick"
    @cancel="() => (state.showModal = false)"
  ></u-modal>
</template>

<style lang="scss" scoped>
.evaluation-edit {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  &-header {
    position: fixed;
    left: 0;
    width: 100%;
    z-index: 2;
    height: 88rpx;
    background-color: #fff;
    box-shadow: $shadow-light-down-md;
    display: flex;
    align-items: center;
    &-placeholder {
      padding-top: 88rpx;
    }
  }
  &-tabs {
    flex: 1;
    overflow: hidden;
    &-filter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80rpx;
      height: 88rpx;
      position: relative;
      &:before {
        content: ' ';
        position: absolute;
        left: -32rpx;
        top: 0;
        display: block;
        width: 32rpx;
        height: 88rpx;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.08) 100%);
      }
    }
  }
}
:deep(.indicator-item.active .item-checkbox.unselected) {
  background-color: $primary-bg !important;
}

:deep(.indicator-item.active .item-checkbox.unselected .u-icon) {
  opacity: 0;
}

.evaluation-indicators {
  margin: 24rpx 32rpx;
  padding: 24rpx 0;
  border-radius: $radius-base;
  background-color: #fff;
  &-scroll {
    height: 584rpx;
  }
  &-content {
    padding: 0 32rpx;
  }
}

.evaluation-form {
  margin-bottom: 32rpx;
  padding-left: 32rpx;
  border-radius: $radius-base;
  background-color: #fff;
  .form-item:last-child {
    border-bottom: none;
  }
}

.form-item-right {
  margin-left: 8rpx;
}
.remark-count {
  margin-top: 8rpx;
  color: $color-text-description;
}

.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #fff;
  padding: 24rpx 32rpx;
  box-shadow: $shadow-light-up-md;
  display: flex;
  flex-direction: column;
  &-placeholder {
    padding-top: 128rpx;
  }
}

.privacy-settings-tip {
  position: absolute;
  left: 0;
  bottom: 68rpx;
  width: 550rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: $radius-base;
  box-shadow: $shadow-light-down-lg;
  z-index: 10;
  &::after {
    content: '';
    width: 20rpx;
    height: 20rpx;
    background-color: #fff;
    position: absolute;
    left: 68rpx;
    bottom: -8rpx;
    transform: rotate(45deg);
  }
  &-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: transform 0.3s;
    z-index: 9;
  }
}
:deep(.edit-comment-textarea .u-input__right-icon) {
  align-items: flex-start !important;
  padding-top: 8rpx !important;
}

:deep(.form-item-auto.form-item-student) {
  padding-top: 24rpx;
  align-items: center;
}

:deep(.form-item-auto.form-item-student .form-item-title) {
  align-self: baseline;
}

.student-value {
  white-space: normal;
}
</style>
