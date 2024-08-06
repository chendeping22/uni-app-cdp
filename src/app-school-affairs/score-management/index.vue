<template>
  <view v-if="hasSchoolTerm === 1">
    <view class="relative">
      <view class="flex-between shadow-search">
        <view
          class="h100 no-shrink flex-center scroll-hidden plr-s"
          style="flex: 1"
          @click="showSelectSchoolTerms = true"
        >
          <view class="filter-value text-ellipse active">
            {{ schoolTerms[searchParams.schoolYearTermIndex]?.label || '' }}
          </view>
          <u-icon name="arrow-down-fill" color="rgba(0, 0, 0, 0.45)" size="28" />
        </view>
        <view
          class="h100 no-shrink flex-center scroll-hidden plr-s ml-s"
          style="flex: 1"
          @click="showSelectScoreType = true"
        >
          <view class="filter-value text-ellipse active">
            {{ scoreTypes[searchParams.scoreTypeIndex]?.name || '' }}
          </view>
          <u-icon name="arrow-down-fill" color="rgba(0, 0, 0, 0.45)" size="28" />
        </view>
      </view>
      <!-- <view class="score-management-dropdown" :class="filterDropdownShow ? '' : 'filter-closed'">
        <u-dropdown ref="dropdownRef" :close-on-click-mask="false" :close-on-click-self="false">
          <u-dropdown-item>
            <view class="bg-white">
              <view>
                <view @click="showSelectSchoolTerms = true">
                  {{ schoolTerms[filterData.schoolYearTermIndex]?.label }}
                </view>
                <view @click="showSelectScoreType = true">
                  {{
                    filterData.scoreTypeIndex > -1
                      ? scoreTypes[filterData.scoreTypeIndex]?.name || ''
                      : '选择成绩类型'
                  }}
                </view>
              </view>
              <view class="border-top border-line-light border-thick">
                <view class="flex-center plr-l ptb-b">
                  <view
                    class="flex-center bold font-title color-primary h-76 border-thick border-solid border-primary radius-default"
                    style="flex: 1"
                    @click="handleFilterReset"
                  >
                    重置
                  </view>
                  <view
                    class="flex-center bold bg-primary font-title color-white h-76 border-thick border-solid border-primary radius-default ml-b"
                    style="flex: 1"
                    @click="handleFilterConfirm"
                  >
                    确定
                  </view>
                </view>
              </view>
            </view>
          </u-dropdown-item>
        </u-dropdown>
      </view> -->
    </view>
    <view v-if="total > 0" class="plr-l pt-b">
      <view
        v-for="item in dataSource"
        :key="item.scoreTaskId"
        class="score-card"
        @click="handleToDetail(item)"
      >
        <image class="score-icon" :src="iconScore" />
        <view class="score-detail">
          <view class="score-name text-ellipsis-2">
            {{ item.name }}
          </view>
          <view class="info-item mt-s">
            <view class="info-label">成绩类型</view>
            <view class="info-value text-ellipse">
              {{ item.scoreTypeName }}
            </view>
          </view>
          <view class="info-item mt-xxs">
            <view class="info-label">发布时间</view>
            <view class="info-value text-ellipse">
              {{ dayjs(item.publishTime).format('YYYY-MM-DD HH:mm') }}
            </view>
          </view>
        </view>
      </view>
      <u-loadmore :status="status" margin-top="24" @loadmore="loadMore" />
      <view class="safe-area-inset-bottom"></view>
    </view>
  </view>
  <view
    v-if="hasSchoolTerm === 0 || total === 0"
    :style="{
      height: emptyHeight + 'px',
    }"
  >
    <u-empty-custom mode="search" class="color-base no-shrink" text="暂无发布的成绩" />
  </view>
  <u-picker
    v-model="showSelectSchoolTerms"
    mode="selector"
    title="学年学期"
    range-key="label"
    :default-selector="[searchParams.schoolYearTermIndex]"
    :range="schoolTerms"
    @confirm="handleSelectedSchoolTerm"
  />
  <u-picker
    v-model="showSelectScoreType"
    mode="selector"
    range-key="name"
    title="成绩类型"
    :default-selector="[searchParams.scoreTypeIndex]"
    :range="scoreTypes"
    @confirm="handleSelectedScoreType"
  />
</template>
<script lang="ts" setup>
import useStudentId from '@/hooks/use-student-id';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { getSchoolYear, getScoreList, getScoreTypesList } from '../services/score-management';
// import IconFilterActive from '../static/course-info/filter-active.svg';
// import IconFilter from '../static/course-info/filter.svg';
import iconScore from '../static/score.svg';

const schoolTerms = ref<any[]>([]);
const scoreTypes = ref<any[]>([
  {
    id: '',
    name: '全部',
  },
]);
const hasSchoolTerm = ref(-1); // -1 还未请求，0没有校历，1有校历
const studentId = useStudentId();
// const dropdownRef = ref<any>();
// const filterDropdownShow = ref(false);
// const defaultSchoolYearTermIndex = ref(-1);
// const filterData = ref<any>({
//   schoolYearTermIndex: -1,
//   scoreTypeIndex: -1,
// });
const showSelectSchoolTerms = ref(false);
const showSelectScoreType = ref(false);
const searchParams = ref<any>({
  pageNum: 1,
  pageSize: 20,
  schoolYearTermIndex: -1,
  scoreTypeIndex: 0,
  userId: studentId.value,
});

const total = ref<number>(-1); // -1 表示还未初始化
const status = ref<string>('loading');
const dataSource = ref<any[]>([]);

// const filterActive = computed(() => {
//   if (defaultSchoolYearTermIndex.value !== searchParams.value.schoolYearTermIndex) {
//     return true;
//   }
//   if (searchParams.value.scoreTypeIndex > -1) {
//     return true;
//   }
//   return false;
// });

const emptyHeight = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const safeAreaInsetBottom = systemInfo?.safeAreaInsets?.bottom || 0;
  if (hasSchoolTerm.value === 1 && windowHeight) {
    return windowHeight - uni.upx2px(96) - safeAreaInsetBottom;
  }

  if (hasSchoolTerm.value === 0 && windowHeight) {
    return windowHeight - safeAreaInsetBottom;
  }
  return 0;
});

// function handleToggleFilter() {
//   if (filterDropdownShow.value) {
//     closeFilter();
//   } else {
//     showFilter();
//   }
// }

// function showFilter() {
//   filterData.value.schoolYearTermIndex = searchParams.value.schoolYearTermIndex;
//   if (searchParams.value.scoreType) {
//     filterData.value.scoreTypeIndex = scoreTypes.value.findIndex(
//       (i: any) => i.id === searchParams.value.scoreType,
//     );
//   } else {
//     filterData.value.scoreTypeIndex = -1;
//   }
//   if (dropdownRef.value) {
//     dropdownRef.value.menuClick(0);
//     filterDropdownShow.value = true;
//   }
// }

// function closeFilter() {
//   if (dropdownRef.value) {
//     dropdownRef.value.close();
//     filterDropdownShow.value = false;
//   }
// }

function handleSelectedSchoolTerm(e: any) {
  searchParams.value.schoolYearTermIndex = e[0];
  handleSearch();
}

function handleSelectedScoreType(e: any) {
  searchParams.value.scoreTypeIndex = e[0];
  handleSearch();
}

async function handleSearch() {
  searchParams.value.pageNum = 1;
  total.value = -1;
  showLoading();
  getPageList();
}

// function handleFilterReset() {
//   if (defaultSchoolYearTermIndex.value > -1) {
//     const schoolTerm = schoolTerms.value[defaultSchoolYearTermIndex.value];
//     if (schoolTerm) {
//       searchParams.value.schoolYearTermIndex = defaultSchoolYearTermIndex.value;
//       searchParams.value.schoolYear = schoolTerm.schoolYear;
//       searchParams.value.term = schoolTerm.termNo;
//     }
//   }

//   searchParams.value.scoreType = '';
//   closeFilter();
//   handleSearch();
// }

// function handleFilterConfirm() {
//   const schoolTerm = schoolTerms.value[filterData.value.schoolYearTermIndex];
//   searchParams.value.schoolYearTermIndex = filterData.value.schoolYearTermIndex;
//   searchParams.value.schoolYear = schoolTerm.schoolYear;
//   searchParams.value.term = schoolTerm.termNo;

//   if (filterData.value.scoreTypeIndex > -1) {
//     searchParams.value.scoreType = scoreTypes.value[filterData.value.scoreTypeIndex].id;
//   } else {
//     searchParams.value.scoreType = '';
//   }

//   closeFilter();
//   handleSearch();
// }

function handleToDetail(item: any) {
  uni.navigateTo({
    url: `/app-school-affairs/score-management/detail?scoreTaskId=${item.scoreTaskId}`,
  });
}

async function fetchSchoolYear() {
  try {
    const res: any = await getSchoolYear({});
    const data: any[] = [];
    let index = 0;
    res.forEach((i: any) => {
      const schoolYear = i.schoolYear.replace('学年', '');
      i.schoolTerms.forEach((j: any) => {
        const label = `${i.schoolYear}${j.termNo === 1 ? '上学期' : '下学期'}`;
        data.push({ schoolYear: schoolYear, termNo: j.termNo, label });
        if (j.defaultFlag === 1) {
          // defaultSchoolYearTermIndex.value = index;
          searchParams.value.schoolYearTermIndex = index;
          // searchParams.value.schoolYear = schoolYear;
          // searchParams.value.term = j.termNo;
        }
        index += 1;
      });
    });
    schoolTerms.value = data;
    if (data.length > 0) {
      hasSchoolTerm.value = 1;
    } else {
      hasSchoolTerm.value = 0;
    }
  } catch (error) {
    console.log('score-management fetchSchoolYear error', error);
    hasSchoolTerm.value = 0;
  }
}

async function fetchScoreTypesList() {
  const res: any = await getScoreTypesList({
    needCountUse: false,
  });
  scoreTypes.value = [
    {
      id: '',
      name: '全部',
    },
    ...(res || []),
  ];
}

async function getPageList() {
  if (hasSchoolTerm.value !== 1) {
    hideLoading();
    uni.stopPullDownRefresh();
    return;
  }
  try {
    status.value = 'loading';
    const schoolTerm = schoolTerms.value[searchParams.value.schoolYearTermIndex];
    const params: any = {
      pageNum: searchParams.value.pageNum,
      pageSize: searchParams.value.pageSize,
      schoolYear: schoolTerm.schoolYear,
      term: schoolTerm.termNo,
      userId: searchParams.value.userId,
      scoreType: scoreTypes.value[searchParams.value.scoreTypeIndex].id,
    };

    const res: any = await getScoreList(params);
    hideLoading();
    if (searchParams.value.pageNum === 1) {
      dataSource.value = [...(res.result || [])];
    } else {
      dataSource.value = [...dataSource.value, ...(res.result || [])];
    }
    total.value = res?.total || 0;
  } catch (error: any) {
    hideLoading();
    showInfo(error?.msg || error?.desc || '请求数据出错');
  } finally {
    status.value = dataSource.value.length >= total.value ? 'nomore' : 'loadmore';
    uni.stopPullDownRefresh();
  }
}

function loadMore() {
  if (status.value === 'loadmore') {
    searchParams.value.pageNum = searchParams.value.pageNum + 1;
    getPageList();
  }
}

onPullDownRefresh(() => {
  searchParams.value.pageNum = 1;
  getPageList();
});

onReachBottom(() => {
  loadMore();
});

onLoad(async () => {
  try {
    showLoading();
    await Promise.all([fetchSchoolYear(), fetchScoreTypesList()]);
    searchParams.value.pageNum = 1;
    total.value = -1;
    getPageList();
  } catch (error: any) {
    hideLoading();
    showInfo(error?.msg || error?.desc || '请求数据出错');
  }
});
</script>

<style lang="scss">
.shadow-search {
  height: 96rpx;
  background: #ffffff;
  padding: 0 16rpx;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  .filter-value {
    font-size: 26rpx;
    line-height: 36rpx;
    color: #86909c;
    margin-right: 16rpx;
    &.active {
      color: rgba(0, 0, 0, 0.88);
    }
  }
}
.score-card {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  .score-icon {
    flex-shrink: 0;
    display: block;
    height: 144rpx;
    width: 144rpx;
    margin-right: 24rpx;
  }
  .score-detail {
    flex: 1;
    overflow: hidden;
  }
  .score-name {
    font-size: 32rpx;
    font-weight: 500;
    line-height: 44rpx;
    color: rgba(0, 0, 0, 0.88);
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    font-size: 30rpx;
    line-height: 40rpx;
  }
  .info-label {
    flex-shrink: 0;
    color: rgba(0, 0, 0, 0.65);
    margin-right: 24rpx;
  }
  .info-value {
    flex: 1;
    color: rgba(0, 0, 0, 0.88);
  }
}

// .score-management-dropdown {
//   position: relative;
//   :deep(.u-dropdown__menu) {
//     height: 0rpx !important;
//     overflow: hidden !important;
//   }
//   :deep(.u-dropdown__content) {
//     top: 0 !important;
//   }
//   &.filter-closed {
//     overflow: hidden;
//     :deep(.u-dropdown__content) {
//       top: 0 !important;
//       height: 0 !important;
//     }
//   }
// }
</style>

<style lang="scss" scoped></style>
