<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { debounce } from 'lodash-es';
import { computed, reactive, watch } from 'vue';
import StudentItem from '../../components/student-item.vue';
import { searchStudent } from '../../services/student-selector';
import { useStudentSelectorStore } from '../../store/student-selector';
import { Student } from '../../types/student-selector';
const store = useStudentSelectorStore();

const state = reactive<{
  list: Student[];
  keyword: string;
  date: number;
  loading: boolean;
  focus: boolean;
}>({
  list: [],
  keyword: '',
  date: Date.now(),
  focus: false,
  loading: false,
});

const empty = computed(() => {
  return !state.loading && state.keyword && state.list.length === 0;
});

const getPageList = async () => {
  const _searchValues = state.keyword;
  try {
    state.loading = true;
    const response: any = await searchStudent({
      keyword: state.keyword,
      date: state.date,
    });
    if (_searchValues === state.keyword) {
      state.list = response || [];
      state.loading = false;
    }
  } catch (error: any) {
    if (_searchValues === state.keyword) {
      state.list = [];
      state.loading = false;
    }
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  }
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

const onClick = (data: any) => {
  if (!data.initialSchemeId || !data.schemeId) {
    return;
  }

  store.$setClass(data.clazzId ? [data.clazzId] : []);

  uni.redirectTo({
    url: `/app-class-evaluation/pages/evaluation/edit?schemeId1=${data.initialSchemeId}&schemeId=${
      data.schemeId
    }&title=${data.clazzName || ''}&stuId=${data.studentId || ''}&stuName=${
      data.studentName || ''
    }&claId=${data.clazzId || ''}&date=${state.date}`,
    success: () => {
      store.$setClearEdit(true);
    },
  });
};

watch(
  () => state.keyword,
  (newVal, oldVal) => {
    if (newVal) {
      state.loading = true;
    }
    if (newVal !== oldVal) {
      debounceSearch();
    }
  },
);

onLoad((options: any) => {
  if (options.date) {
    state.date = options.date;
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
    </view>
    <view class="searchbar-placeholder"></view>

    <view v-if="state.list.length" class="student-list">
      <student-item
        v-for="item in state.list"
        :key="item.studentId"
        :data="item"
        @click="onClick"
      ></student-item>
    </view>
    <view v-if="state.list.length" class="student-list-nomore">
      <u-loadmore status="nomore" margin-top="0" margin-bottom="0"
    /></view>

    <view v-if="empty" class="student-list-empty">
      <u-empty-custom mode="search" text="暂无数据"></u-empty-custom>
    </view>
  </page>
</template>

<style lang="scss" scoped>
.searchbar {
  position: fixed;
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

.student-list {
  margin: 24rpx 32rpx;
  padding-left: 32rpx;
  background-color: #fff;
  border-radius: $radius-base;
  &-empty {
    padding-top: 80rpx;
  }
  &-nomore {
    padding-bottom: 48rpx;
  }
}

:deep(.student-list .student-item:last-child) {
  border-bottom: none;
}
</style>
