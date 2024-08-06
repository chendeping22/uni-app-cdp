<template>
  <c-top>
    <view class="search-container">
      <u-search
        v-model="studentName"
        placeholder="搜索"
        shape="square"
        :show-action="false"
        @input="handleSearch"
      />
    </view>
    <u-tabs
      v-model="activeTabIndex"
      :list="tabsList"
      :active-color="primaryColor"
      @change="handleChangeTab"
      :is-scroll="false"
    />
  </c-top>

  <view style="flex: 1; overflow: scroll">
    <refresh-scroll-view
      class="scroll-view"
      :refresher-triggered="refresherTriggered"
      @onRefresherRefresh="handleRefresherRefresh"
      @onScroll2Bottom="handleScroll2Bottom"
    >
      <view v-if="dataList?.length" :key="activeTabIndex" class="scroll-content">
        <ListItem v-for="item in dataList" :key="item.id" :data="item" />
      </view>
      <view v-else-if="!loading" class="empty-container empty-container-has-nav">
        <c-empty top="0" content="无服药登记" bg-type="gray" />
      </view>
    </refresh-scroll-view>
  </view>
</template>
<script lang="ts">
import { statusType } from '@/app-preprimary-education/services/feedMedicine';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { computed, defineComponent, ref } from 'vue';
import useListRecords from '../../hooks/useListRecords';
import ListItem from '../list-item.vue';

export default defineComponent({
  components: { ListItem },
  props: {},
  setup() {
    const unConfirmedNum = ref(0);
    const unTakeMedicineNum = ref(0);
    const tabsList = computed(() => {
      return [
        { name: `待确认(${unConfirmedNum.value})` },
        { name: `待服药(${unTakeMedicineNum.value})` },
        { name: '已服药' },
        { name: '其他' },
      ];
    });
    const refresherTriggered = ref(false);
    const loadMore = ref(false);
    const refresh = ref(false);
    const activeTabIndex = ref<number>(0);
    const reviewStatus = ref<statusType>(1);
    const studentName = ref<string>('');
    // 获取主题色
    const primaryColor = getPrimaryColor();
    let paddingTop = 88;
    // #ifdef MP-WEIXIN
    paddingTop = 0;
    // #endif

    const { dataList, loadMoreFn, loading } = useListRecords({
      reviewStatus,
      studentName,
      loadMore,
      refresh,
      loadComplete: (result, count?: { unConfirmedNum: number; unTakeMedicineNum: number }) => {
        refresherTriggered.value = false;
        loadMore.value = result;
        refresh.value = false;
        unConfirmedNum.value = count?.unConfirmedNum || 0;
        unTakeMedicineNum.value = count?.unTakeMedicineNum || 0;
      },
    });

    const handleChangeTab = function (index: number) {
      activeTabIndex.value = index;
      if (index === 0) {
        reviewStatus.value = 1;
      } else if (index === 1) {
        reviewStatus.value = 2;
      } else if (index === 2) {
        reviewStatus.value = 3;
      } else if (index === 3) {
        reviewStatus.value = 7;
      }
    };
    const handleRefresherRefresh = function () {
      refresherTriggered.value = true;
      refresh.value = true;
    };
    const handleScroll2Bottom = function () {
      loadMore.value = true;
      loadMoreFn();
    };

    function debounce(fn: any, delay: number) {
      return (args: any) => {
        clearTimeout(fn.id);

        fn.id = setTimeout(() => {
          fn.call(null, args);
        }, delay);
      };
    }

    const handleSearch = debounce(e => {
      studentName.value = e;
    }, 300);

    return {
      refresherTriggered,
      dataList,
      loadMore,
      refresh,
      reviewStatus,
      studentName,
      activeTabIndex,
      tabsList,
      primaryColor,
      handleScroll2Bottom,
      handleRefresherRefresh,
      handleChangeTab,
      handleSearch,
      loading,
      paddingTop,
    };
  },
});
</script>
<style lang="scss" scoped>
.search-container {
  padding: 16rpx 24rpx;
  background: #fff;
}

.scroll-view {
  width: 100%;
  box-sizing: border-box;
  .scroll-content {
    padding-bottom: 240rpx;
  }
}

.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-container-has-nav {
  height: calc(100% - env(safe-area-inset-bottom) - 88rpx);
}

.empty-container-not-nav {
  height: calc(100% - env(safe-area-inset-bottom));
}
</style>
