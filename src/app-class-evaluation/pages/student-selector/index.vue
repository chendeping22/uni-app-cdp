<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { debounce } from 'lodash-es';
import { computed, reactive, watch } from 'vue';
import CircleCheckbox from '../../components/circle-checkbox.vue';
import StudentItem from '../../components/student-item.vue';
import { getStudentByClass } from '../../services/student-selector';
import { useStudentSelectorStore } from '../../store/student-selector';
import { Student } from '../../types/student-selector';

const pages = getCurrentPages();
const p = pages[pages.length - 1] as any;
const eventChannel = p.getOpenerEventChannel();

const store = useStudentSelectorStore();

interface ClassItem {
  studentInfoVOList: Student[];
  clazzId: string;
  clazzName: string;
}

const state = reactive<{
  list: ClassItem[];
  searchList: Student[];
  curClass: { clazzId: string; clazzName: string; index: number };
  keyword: string;
  loading: boolean;
  focus: boolean;
  selectedMap: Record<string, Student[]>;
  empty: boolean;
}>({
  list: [],
  searchList: [],
  curClass: {} as any,
  keyword: '',
  selectedMap: {},
  focus: false,
  loading: false,
  empty: false,
});

const isBreadcrumbs = computed(() => {
  if (state.empty) {
    return false;
  }

  return !state.searchList.length && state.list.length > 1;
});

const studentItems = computed(() => {
  if (state.curClass.index >= 0) {
    return state.list[state.curClass.index].studentInfoVOList || [];
  }
  return [];
});

const allLen = computed(() => {
  return state.list.reduce((all, item) => {
    return all + item.studentInfoVOList.length;
  }, 0);
});

const selectedLen = computed(() => {
  return Object.values(state.selectedMap).reduce((all, item) => {
    return all + (item || []).length;
  }, 0);
});

const isSelectedAll = computed(() => {
  if (!selectedLen.value) {
    return false;
  }

  if (state.searchList.length > 0) {
    if (selectedLen.value < state.searchList.length) {
      return false;
    }

    let isAll = true;

    for (let i = 0; i < state.searchList.length; i++) {
      const _item = state.searchList[i];
      if (!state.selectedMap[_item.clazzId]?.map(i => i.studentId).includes(_item.studentId)) {
        isAll = false;
        break;
      }
    }

    return isAll;
  }

  if (state.curClass.index >= 0) {
    return (
      state.selectedMap[state.curClass.clazzId]?.length ===
      state.list[state.curClass.index].studentInfoVOList?.length
    );
  }

  return allLen.value === selectedLen.value;
});

const getPageList = async () => {
  state.loading = true;
  const _searchValues = state.keyword;
  try {
    const response: any = await getStudentByClass({
      keyword: state.keyword,
      clazzIds: store.selectedClassIds,
    } as any);
    // 判断结果
    if (_searchValues === state.keyword) {
      if (state.keyword) {
        state.searchList = (response || []).reduce((all, item) => {
          return all.concat(item.studentInfoVOList || []);
        }, []);
        state.empty = state.searchList.length === 0;
      } else {
        state.list = (response || []).filter(i => i.studentInfoVOList?.length);
        if (state.list.length === 1) {
          state.curClass = {
            index: 0,
            clazzId: state.list[0].clazzId,
            clazzName: state.list[0].clazzName,
          };
        }
        state.empty = state.list.length === 0;
      }
    }
  } catch (error: any) {
    if (_searchValues === state.keyword) {
      if (state.keyword) {
        state.searchList = [];
      } else {
        state.list = [];
      }

      state.empty = true;
    }
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

const handleConfirmClick = () => {
  if (eventChannel) {
    eventChannel.emit('acceptDataFromStudentSelectorPage', {
      value: Object.values(state.selectedMap).reduce((all, item) => {
        return all.concat(item || []);
      }, []),
      isSelectedAll: allLen.value === selectedLen.value,
    });
  }

  uni.navigateBack();
};

const debounceSearch = debounce(() => {
  getPageList();
}, 500);

const onClearSearch = () => {
  state.focus = true;
};

const onBlurSearch = () => {
  state.focus = false;
};

const onSelected = (checked: boolean, data: Student) => {
  const { studentId, clazzId } = data;
  if (checked) {
    state.selectedMap[clazzId] = state.selectedMap[clazzId]
      ? [...state.selectedMap[clazzId], data]
      : [data];
  } else if (state.selectedMap[clazzId]) {
    state.selectedMap[clazzId] = state.selectedMap[clazzId].filter(i => i.studentId !== studentId);
  }
};

const onSelectedClass = (index: number, clazzId: string) => {
  if (state.selectedMap[clazzId]?.length) {
    state.selectedMap[clazzId] = [];
  } else {
    state.selectedMap[clazzId] = state.list[index].studentInfoVOList;
  }
};

const onSelectedAll = () => {
  if (state.searchList.length > 0) {
    const _isSelectedAll = isSelectedAll.value;
    state.searchList.forEach(item => {
      console.log('file: index.vue:197 ~ onSelectedAll ~ state.searchList.length:', item);
      const isChecked = !!state.selectedMap[item.clazzId]?.find(
        i => i.studentId === item.studentId,
      );
      // 反选
      if (_isSelectedAll) {
        if (isChecked) {
          state.selectedMap[item.clazzId] = state.selectedMap[item.clazzId].filter(
            i => i.studentId !== item.studentId,
          );
        }
      } else if (!isChecked) {
        // 选中
        state.selectedMap[item.clazzId] = (state.selectedMap[item.clazzId] || []).concat(item);
      }
    });

    return;
  }

  /** 多个班级才需要处理选择 */
  if (state.curClass.index >= 0) {
    if (
      state.selectedMap[state.curClass.clazzId]?.length ===
      state.list[state.curClass.index].studentInfoVOList.length
    ) {
      state.selectedMap[state.curClass.clazzId] = [];
    } else {
      state.selectedMap[state.curClass.clazzId] =
        state.list[state.curClass.index].studentInfoVOList;
    }
    return;
  }

  if (isSelectedAll.value) {
    state.selectedMap = {};
  } else {
    state.selectedMap = state.list.reduce((all, item) => {
      all[item.clazzId] = item.studentInfoVOList;
      return all;
    }, {});
  }
};

const onClickClass = (index: number, clazzId: string, clazzName: string) => {
  console.log('file: index.vue:211 ~ onClickClass ~ index:', index);
  state.curClass = { index, clazzId, clazzName };
};

const handleBreadcrumbsClick = () => {
  state.curClass = {} as any;
};

watch(
  () => state.keyword,
  (newVal, oldVal) => {
    if (!newVal) {
      state.searchList = [];
      state.empty = state.list.length === 0;
    } else if (newVal !== oldVal) {
      debounceSearch();
    }
  },
);

onLoad(() => {
  getPageList();
  if (store.selectedMap) {
    state.selectedMap = store.selectedMap;
  }
});
</script>

<template>
  <page custom-overflow="visible">
    <view class="searchbar">
      <u-search
        v-model="state.keyword"
        placeholder="请输入学生姓名/姓名首拼/班内学号"
        shape="square"
        :show-action="false"
        :focus="state.focus"
        :input-style="{ fontSize: '32rpx' }"
        :height="72"
        style="flex: 1"
        @clear="onClearSearch"
        @blur="onBlurSearch"
      ></u-search>
      <template v-if="isBreadcrumbs">
        <view class="breadcrumbs" v-if="state.curClass.clazzName">
          <scroll-view scroll-x style="width: 100%; white-space: nowrap">
            <view class="breadcrumbs__item subheadline-regular">
              <view
                class="breadcrumbs__item breadcrumbs__item__clickable"
                @click="handleBreadcrumbsClick"
                >班级</view
              >
            </view>
            <view v-if="state.curClass.clazzName" class="breadcrumbs__item subheadline-regular">
              <text style="padding: 0 4px">/</text>
              <text>{{ state.curClass.clazzName }}</text>
            </view>
          </scroll-view>
        </view>
        <view class="breadcrumbs" v-else>
          <view class="breadcrumbs__item subheadline-regular">
            <text>班级</text>
          </view>
        </view>
      </template>
    </view>
    <view class="searchbar-placeholder">
      <view class="breadcrumbs-placeholder" v-if="isBreadcrumbs"> </view>
    </view>
    <view v-if="state.empty" class="class-list-empty">
      <u-empty-custom text="暂无数据" :mode="state.keyword ? 'search' : 'data'"></u-empty-custom>
    </view>
    <template v-else-if="state.list.length">
      <view class="class-list">
        <view class="class-item" @click="onSelectedAll">
          <circle-checkbox @click="onSelectedAll" :selected="isSelectedAll" />
          <view class="class-item-name body-regular">全选</view>
        </view>
      </view>
      <view class="class-list" v-if="state.searchList.length">
        <student-item
          v-for="stu in state.searchList"
          selectable
          :key="stu.studentId"
          :data="stu"
          :selected="
            state.selectedMap[stu.clazzId]?.findIndex(i => i.studentId === stu.studentId) >= 0
          "
          @selected="onSelected"
        ></student-item>
      </view>
      <view class="class-list" v-else-if="studentItems.length">
        <student-item
          v-for="stu in studentItems"
          selectable
          :key="stu.studentId"
          :data="stu"
          :selected="
            state.selectedMap[stu.clazzId]?.findIndex(i => i.studentId === stu.studentId) >= 0
          "
          @selected="onSelected"
        ></student-item>
      </view>
      <view class="class-list" v-else>
        <view
          class="class-item"
          v-for="(item, index) in state.list"
          :key="item.clazzId"
          :index="index"
          @click="onClickClass(index, item.clazzId, item.clazzName)"
        >
          <circle-checkbox
            @click="onSelectedClass(index, item.clazzId)"
            :selected="state.selectedMap[item.clazzId]?.length > 0"
          />
          <view class="class-item-name body-regular">{{ item.clazzName }}</view>
          <view class="class-item-count footnote-regular">
            <text v-if="!state.selectedMap[item.clazzId]?.length">选择学生</text>
            <text
              class="color-primary"
              v-else-if="state.selectedMap[item.clazzId]?.length === item.studentInfoVOList.length"
              >已全选</text
            >
            <text class="color-primary" v-else
              >已选{{ state.selectedMap[item.clazzId]?.length }}人</text
            >
            <u-icon class="class-item-more" name="arrow-right" color="#00000073"></u-icon>
          </view>
        </view>
      </view>
      <view class="toolbar">
        <u-button style="width: 100%" type="primary" @click="handleConfirmClick">确定</u-button>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
      <view class="toolbar-placeholder">
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
    </template>
  </page>
</template>

<style lang="scss" scoped>
.searchbar {
  position: fixed;
  // top: calc(44px + env(safe-area-inset-top));
  left: 0;
  width: 100%;
  z-index: 2;
  padding: 24rpx 32rpx;
  background-color: #fff;
  box-shadow: 0px 1px 2px 0px #0000000a;
  &-placeholder {
    padding-top: 112rpx;
  }
}

.breadcrumbs {
  padding: 16rpx 0 0;
  &__item {
    display: inline-block;

    &__clickable {
      color: $color-primary;
    }
  }
  &-placeholder {
    padding-top: 64rpx;
  }
}

.class-list {
  margin: 24rpx 0;
  padding-left: 32rpx;
  background-color: #fff;
  // border-radius: $radius-base;
  &-empty {
    padding-top: 80rpx;
  }
  .class-item:last-child {
    border-bottom: none;
  }
}

:deep(.class-list .student-item:last-child) {
  border-bottom: none;
}

.class-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 0;
  border-bottom: 1px solid $color-border-secondary;
  &-name {
    flex: 1;
    padding-left: 32rpx;
    padding-right: 24rpx;
  }
  &-count {
    color: $color-text-description;
  }
  &-more {
    padding-left: 16rpx;
  }
  .color-primary {
    color: $color-primary;
  }
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
</style>
