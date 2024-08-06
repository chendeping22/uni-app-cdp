<script setup lang="ts">
import DateSelector from '@/app-class-evaluation/components/date-selector/index.vue';
import { DateTypeEnum, LimitTypeEnum } from '@/app-class-evaluation/components/date-selector/type';
import scanIcon from '@/app-class-evaluation/static/scan.svg';
import searchIcon from '@/app-class-evaluation/static/search.svg';
import { loginStore } from '@/store/modules/login';
import { chooseImgStore, updatePhoto } from '@/utils/choose-image';
import { showInfo } from '@/utils/tools';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, onBeforeMount, onBeforeUnmount, reactive, watch } from 'vue';
import ClassItem from '../../components/evaluation/class-item.vue';
import Toolbar from '../../components/evaluation/toolbar.vue';
import SchemeEmpty from '../../components/scheme-empty.vue';
import SwitchGrade from '../../components/switch-grade/index.vue';
import { GradeTypeEnum, IGradeItem } from '../../components/switch-grade/utils';
import {
  IFaceStudentInfo,
  getClassRecord,
  getIntelligentIdentificationFace,
  getSchemeInfoByClazzIdAndDate,
} from '../../services/evaluation';
import { useStudentSelectorStore } from '../../store/student-selector';
import { ClassItem as IClassItem, ListTypeEnum } from '../../types/evaluation';

const store = chooseImgStore();
const stuStore = useStudentSelectorStore();
const loginStoreInfo = loginStore();
const { userInfo } = loginStoreInfo;

const tabList = [
  {
    key: '',
    name: '全部',
  },
  {
    key: '1',
    name: '已点评',
  },
  {
    key: '2',
    name: '未点评',
  },
];

const state = reactive<{
  tabIndex: number;
  list: IClassItem[];
  date: number;
  status: string;
  listType: ListTypeEnum;
  editable: boolean;
  selectIds: string[];
  selectSchemeId: string;
  curSchemeIds: string[];
  gradeSelect: IGradeItem[];
  /** 是否多方案 */
  existMultiScheme: boolean;
  /** 是否有方案 */
  existScheme: boolean;
}>({
  tabIndex: 0,
  list: [],
  date: dayjs(dayjs().format('YYYY-MM-DD')).valueOf(),
  status: 'loading',
  listType: ListTypeEnum.card,
  editable: false,
  selectIds: [],
  selectSchemeId: '',
  curSchemeIds: [],
  gradeSelect: [],
  // 是否有方案
  existScheme: true,
  existMultiScheme: false,
});

const empty = computed(() => {
  return state.status !== 'loading' && state.list.length === 0;
});

const allClassIds = computed(() => {
  return state.list.map(i => i.classId);
});

const editSchemeId = computed(() => {
  if (state.curSchemeIds.length) {
    return state.curSchemeIds;
  }
  if (state.list[0]) {
    return [state.list[0].initialSchemeId, state.list[0].schemeId];
  }
  return [];
});

const gradeInfo = computed(() => {
  const gradeIdList: string[] = [];
  const classIdList: string[] = [];
  if (state.gradeSelect.length) {
    state.gradeSelect.forEach(item => {
      if (item.type === GradeTypeEnum.Class) {
        classIdList.push(item.id);
      } else if (item.type === GradeTypeEnum.Grade) {
        gradeIdList.push(item.id);
      }
    });
  }
  return { gradeIdList, classIdList };
});

const getPageList = async (update?: boolean) => {
  state.status = 'loading';
  const _params = {
    date: `${state.date}`,
    commentState: [, true, false][state.tabIndex],
    ...gradeInfo.value,
  };
  const _params_ = JSON.stringify(_params);

  try {
    const response: any = await getClassRecord(_params);

    // 最新数据 防止网络慢多点击出现数据闪现与目前结果不一致
    const _newParams = JSON.stringify({
      date: `${state.date}`,
      commentState: [, true, false][state.tabIndex],
      ...gradeInfo.value,
    });

    if (_params_ === _newParams) {
      state.list = response.classRecordList || [];
      state.existScheme = response.existScheme;
      state.existMultiScheme = response.existMultiScheme;
      if (!update && state.selectIds.length) {
        const _selectIds = state.selectIds.filter(
          _classId => !!state.list.find(i => i.classId === _classId),
        );
        if (_selectIds.length !== state.selectIds.length) {
          state.selectIds = _selectIds;
          // 清空要同步情况选择方案信息
          if (!_selectIds.length) {
            state.selectSchemeId = '';
            state.curSchemeIds = [];
          }
        }
      }
    }
  } catch (error: any) {
    const _newParams = JSON.stringify({
      date: `${state.date}`,
      commentState: [, true, false][state.tabIndex],
      ...gradeInfo.value,
    });

    if (_params_ === _newParams) {
      state.list = [];
      state.existMultiScheme = false;
      if (state.selectIds.length) {
        state.selectIds = [];
        state.selectSchemeId = '';
        state.curSchemeIds = [];
      }
    }

    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    uni.hideLoading();
    state.status = 'nomore';
    uni.stopPullDownRefresh();
  }
};

const changeListType = () => {
  state.listType = state.listType === ListTypeEnum.list ? ListTypeEnum.card : ListTypeEnum.list;
};

const onSelect = (checked: boolean, data: IClassItem) => {
  if (state.selectSchemeId !== data.schemeId) {
    state.selectSchemeId = data.schemeId;
    state.curSchemeIds = [data.initialSchemeId, data.schemeId];
  }

  if (checked) {
    state.selectIds = [...state.selectIds, data.classId];
  } else {
    state.selectIds = state.selectIds.filter(i => i !== data.classId);
  }

  // 反选要清空
  if (!state.selectIds.length) {
    state.selectSchemeId = '';
    state.curSchemeIds = [];
  }
};

const clearSelected = () => {
  state.selectSchemeId = '';
  state.curSchemeIds = [];
  state.selectIds = [];
};

const handlePicture = () => {
  updatePhoto({ sourceType: ['camera'], showUploadResult: false });
};

const searchStudent = () => {
  uni.navigateTo({
    url: `/app-class-evaluation/pages/student-selector/search?date=${state.date}`,
  });
};

const onEditPage = ({
  initialSchemeId,
  schemeId,
  moreQuery,
  clazzIds,
}: {
  initialSchemeId?: string;
  schemeId?: string;
  moreQuery?: string;
  clazzIds: string[];
}) => {
  if (!initialSchemeId || !schemeId) {
    return;
  }

  stuStore.$setClass(clazzIds);
  uni.navigateTo({
    url: `/app-class-evaluation/pages/evaluation/edit?schemeId1=${initialSchemeId}&schemeId=${schemeId}&date=${state.date}${moreQuery}`,
    success: () => {
      state.editable = false;
    },
  });
};

const onJumpEdit = type => {
  if (type === 'all') {
    onEditPage({
      initialSchemeId: editSchemeId.value[0],
      schemeId: editSchemeId.value[1],
      clazzIds: allClassIds.value,
      moreQuery: '&title=全部班级',
    });
  } else if (type === 'select') {
    onEditPage({
      initialSchemeId: editSchemeId.value[0],
      schemeId: editSchemeId.value[1],
      clazzIds: state.selectIds,
      moreQuery: '&title=点评多班',
    });
  }
};

/**人脸拍照后跳转到点评页面 */
const getMethodInfo = async (val: any) => {
  const fileInfo = {
    imgUrl: val?.[0]?.url,
    imgId: val?.[0]?.fileId,
    locationId: userInfo?.locationId,
  };
  try {
    const studentRes: IFaceStudentInfo = (await getIntelligentIdentificationFace(fileInfo)) || {};
    if (!studentRes?.clazzId) {
      showInfo('该学生不在点评班级范围内');
      return;
    }
    const methodRes: any = await getSchemeInfoByClazzIdAndDate({
      clazzId: studentRes?.clazzId,
      date: state.date,
    });
    if (!(methodRes?.initialSchemeId && methodRes?.id)) {
      showInfo('该学生不在点评班级范围内');
      return;
    }

    onEditPage({
      initialSchemeId: methodRes?.initialSchemeId,
      schemeId: methodRes?.id,
      moreQuery: `&title=${studentRes?.clazzName || '点评'}&stuId=${
        studentRes?.personId || ''
      }&stuName=${studentRes.personName || ''}&claId=${studentRes?.clazzId || ''}`,
      clazzIds: studentRes.clazzId ? [studentRes.clazzId] : [],
    });
  } catch (e: any) {
    showInfo(e?.desc || '查询失败');
  }
};

watch(
  () => store.chooseImgRes,
  val => {
    getMethodInfo(val);
  },
);

watch(
  () => state.editable,
  n => {
    if (!n) {
      clearSelected();
    }
  },
);

watch(
  () => stuStore.isClearEdit,
  value => {
    if (value) {
      state.editable = false;
      stuStore.$setClearEdit(false);
    }
  },
);

watch(
  () => [state.tabIndex, state.date, state.gradeSelect],
  () => {
    getPageList();
  },
);

onBeforeMount(() => {
  getPageList();
  uni.$on('onPullDownRefreshFromEvaluationPage', getPageList);
});

onBeforeUnmount(() => {
  uni.$off('onPullDownRefreshFromEvaluationPage', getPageList);
});

onShow(() => {
  // 返回时要更新列表数据
  getPageList(true);
});
</script>

<template>
  <view class="evaluation-page">
    <view class="evaluation-page-header">
      <view class="evaluation-page-header-filter u-flex">
        <switch-grade
          v-model:value="state.gradeSelect"
          :startDate="state.date"
          :endDate="state.date"
          :multiple="true"
        ></switch-grade>
        <view class="u-flex">
          <view class="evaluation-page-operate" @click="searchStudent">
            <u-image
              width="48rpx"
              height="48rpx"
              :fade="false"
              :show-loading="false"
              :src="searchIcon"
            />
          </view>
          <view class="evaluation-page-operate" @click="handlePicture">
            <u-image
              width="48rpx"
              height="48rpx"
              :fade="false"
              :show-loading="false"
              :src="scanIcon"
            />
          </view>
          <view class="evaluation-page-operate" @click="changeListType">
            <u-icon
              v-if="state.listType === ListTypeEnum.list"
              name="grid"
              size="48"
              color="rgba(0, 0, 0, 0.65)"
            />
            <u-icon v-else name="list-dot" size="48" color="rgba(0, 0, 0, 0.65)" />
          </view>
        </view>
      </view>
      <view class="evaluation-page-header-tab u-flex">
        <view class="evaluation-page-header-date">
          <date-selector
            style="padding: 0"
            v-model="state.date"
            :date-type="DateTypeEnum.Day"
            :limit-type="LimitTypeEnum.Scheme"
          ></date-selector>
        </view>
        <view class="evaluation-page-header-subsection">
          <u-subsection :list="tabList" v-model="state.tabIndex"></u-subsection>
        </view>
      </view>
    </view>
    <view class="evaluation-page-header-placeholder" />
    <template v-if="state.list.length">
      <view :class="['evaluation-class-list', `item-type-${state.listType}`]">
        <class-item
          v-for="item in state.list"
          :key="item.classId"
          :type="state.listType"
          :data="item"
          :selected="state.selectIds.includes(item.classId)"
          :selectable="state.editable"
          :disabled="!!state.selectSchemeId && state.selectSchemeId !== item.schemeId"
          @selected="onSelect"
          @edit="onEditPage"
        />
      </view>
      <u-loadmore status="nomore" margin-top="0" margin-bottom="48" />
      <Toolbar
        v-model:editable="state.editable"
        :select-ids="state.selectIds"
        :existMultiScheme="state.existMultiScheme"
        @jump-edit="onJumpEdit"
      ></Toolbar>
    </template>
    <template v-if="empty">
      <view v-if="state.existScheme" class="class-list-empty">
        <u-empty-custom v-if="empty" text="暂无数据" mode="data"></u-empty-custom>
      </view>
      <scheme-empty v-else></scheme-empty>
    </template>
    <!-- #ifdef APP-PLUS -->
    <view class="tabbar-placeholder"></view>
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
.evaluation-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  &-header {
    position: fixed;
    left: 0;
    width: 100%;
    z-index: 9999;
    &-placeholder {
      padding-top: 220rpx;
    }
  }
  &-header-filter {
    padding: 0 32rpx;
    justify-content: space-between;
    background-color: #fff;
  }
  &-header-tab {
    border-top: 1px solid $color-split;
    padding: 16rpx 32rpx;
    background-color: #fff;
    box-shadow: $shadow-light-down-md;
  }
  &-header-subsection {
    margin-left: 24rpx;
    flex: 1;
  }
  &-operate {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 112rpx;
    padding: 0 16rpx;
  }
}
.evaluation-class-list {
  flex: 1;
  &.item-type-list {
    margin: 24rpx 32rpx;
    background-color: #fff;
    border-radius: $radius-base;
  }
  &.item-type-card {
    margin: 12rpx 20rpx;
    display: grid;
    grid-template-columns: repeat(3, 33.3%);
    grid-template-rows: max-content;
  }
}
.class-list-empty {
  flex: 1;
  padding-top: 80rpx;
}
.tabbar-placeholder {
  padding-top: 112rpx;
}
</style>
