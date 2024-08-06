<template>
  <mt-page
    title="服药登记"
    :show-top-gap="false"
    :show-notice-bar="false"
    style="display: flex; flex-direction: column; height: 100vh; overflow: hidden"
  >
    <view class="page-container">
      <view style="overflow: hidden">
        <refresh-scroll-view
          class="scroll-view pt-l"
          :refresher-triggered="refresherTriggered"
          @onRefresherRefresh="handleRefresherRefresh"
          @onScroll2Bottom="handleScroll2Bottom"
        >
          <view v-if="dataList?.length" :key="activeTabIndex" class="scroll-content">
            <ListItem v-for="(item, index) in dataList" :key="item.id" :data="item" />
          </view>
          <view v-else class="empty-container empty-container-not-nav">
            <c-empty top="0" content="无服药登记" bg-type="gray" />
          </view>
        </refresh-scroll-view>
      </view>
    </view>
    <c-bottom>
      <u-button @click="addMedicineRecord" type="primary">
        <c-icon name="icon_add" color="white" size="48" class-name="mr-xs" />
        服药登记
      </u-button>
    </c-bottom>
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { statusType } from '@/app-preprimary-education/services/feedMedicine';
import { defineComponent, ref } from 'vue';
import ListItem from '../components/list-item.vue';
import useListRecords from '../hooks/useListRecords';
export default defineComponent({
  components: { ListItem, mtPage },
  props: {},
  setup() {
    const refresherTriggered = ref(false);
    const loadMore = ref(false);
    const refresh = ref(false);
    const activeTabIndex = ref<number>(0);
    const reviewStatus = ref<statusType>(1);
    const studentName = ref<string>('');
    const { dataList, loadMoreFn } = useListRecords({
      loadMore,
      refresh,
      loadComplete: result => {
        refresherTriggered.value = false;
        loadMore.value = result;
        refresh.value = false;
      },
    });

    const handleRefresherRefresh = function () {
      refresherTriggered.value = true;
      refresh.value = true;
    };
    const handleScroll2Bottom = function () {
      loadMore.value = true;
      loadMoreFn();
    };
    const addMedicineRecord = function () {
      uni.navigateTo({
        url: `/app-preprimary-education/feed-medicine/guardian/add-detail/index`,
      });
    };
    return {
      refresherTriggered,
      dataList,
      loadMore,
      refresh,
      reviewStatus,
      studentName,
      activeTabIndex,
      handleScroll2Bottom,
      handleRefresherRefresh,
      addMedicineRecord,
    };
  },
});
</script>

<style lang="scss" scoped>
.scroll-view {
  width: 100%;
  box-sizing: border-box;
  .scroll-content {
    padding-bottom: 240rpx;
  }
}
</style>
