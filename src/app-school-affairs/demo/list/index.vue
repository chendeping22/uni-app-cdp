<template>
  <view class="searchbar">
    <!--  查询条件开始  -->
    <view class="select-area">
      <u-dropdown border-bottom @search="onSearch">
        <u-dropdown-item
          v-model="state.stage"
          title="阶段"
          :options="stageEnum"
          @change="onSearch"
        />
        <u-dropdown-item
          v-model="state.level"
          title="课题级别"
          :options="levelEnum"
          @change="onSearch"
        />
      </u-dropdown>
    </view>

    <view class="input-area">
      <u-search
        placeholder="批次名称"
        shape="square"
        :show-action="false"
        style=""
        :height="72"
        @search="onSearch"
      />
    </view>
    <!--  查询条件结束  -->
  </view>
  <BaseList :has-tab-bar="true" :load-more="loadMore" :state="state">
    <view>
      <template v-for="item in state.list" :key="item.id">
        <!--   列表项开始     -->
        <TopicItem :form-type="1" v-bind="item" @click="handleEdit(item)" />
        <!--    列表项结束    -->
      </template>
    </view>
  </BaseList>
  <view class="add-btn safe-area-inset-bottom" @click="handleAdd"> + </view>
</template>

<script setup lang="ts">
import { levelEnum, stageEnum } from '@/app-school-affairs/topic/helper/enum';
import { queryPage } from '@/app-school-affairs/topic/api/topicBatch';
import { usePageList } from '@/app-school-affairs/demo/components/list/list';
import { onLoad } from '@dcloudio/uni-app';
import BaseList from '@/app-school-affairs/demo/components/list/BaseList.vue';
import TopicItem from '@/app-school-affairs/topic/components/topic-item.vue';

//API
const api = {
  page: queryPage,
};

//封装方法
const { state, getPageList, loadMore, onSearch } = usePageList(api);

// 初始化
onLoad(() => {
  getPageList();
});

//跳转详情页
function handleEdit(item) {
  console.log('🚀ccc ~ item:', item);
  uni.navigateTo({
    url: `/app-school-affairs/topic/manage/detail?id=${item.id}`,
  });
}

function handleAdd(){
  console.log('🚀ccc ~ 新增');
}
</script>

<style scoped lang="scss">
@import '@/app-school-affairs/demo/assets/styles/common.scss';

.select-area {
  padding: 8rpx 0;
}
.input-area {
  height: 104rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
}
</style>
