<template>
  <page custom-overflow="visible">
    <u-navbar
      :custom-back="customBack"
      title="应用中心"
      back-icon-color="black"
      title-color="black"
      :border-bottom="false"
      :title-bold="true"
      :height="44"
    >
    </u-navbar>
    <view class="u-p-l-32 u-p-t-24 u-p-r-32 search-bar">
      <view style="display: flex">
        <u-search
          v-model="keyword"
          placeholder="搜索应用"
          :show-action="false"
          shape="square"
          :focus="false"
          style="flex: 1"
          @change="changeAction"
          @clear="clearAction"
          @focus="focusAction"
        ></u-search>
        <view
          v-if="isShowSearch"
          class="cancel"
          :style="{ color: primaryColor }"
          @click="cancelAction"
          >取消</view
        >
      </view>
      <view style="height: 24rpx"></view>
    </view>
    <view class="card-content" :style="{ height: contentHeight }">
      <view
        style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          box-shadow: 0px 2px 4px 0px #00000014;
          height: 1rpx;
          z-index: 2;
        "
      ></view>
      <scroll-view scroll-y style="width: 100%; height: 100%">
        <!--搜索的应用结果-->
        <view
          v-if="isShowSearch"
          :class="(searchApplications?.length || 0) > 0 ? 'search-content' : ''"
        >
          <template
            v-for="(application, index) in searchApplications"
            v-if="searchApplications?.length > 0"
            :key="index"
          >
            <view class="cell" @click="clickApplicationAction(application)">
              <view class="left">
                <u-image
                  :src="application.icon"
                  width="80"
                  height="80"
                  :show-loading="false"
                  :error-icon="applicationIcon"
                  :fade="false"
                ></u-image>
                <view class="title">
                  <rich-text :nodes="showSearchColor(application.name)"></rich-text>
                </view>
              </view>
              <u-icon name="arrow-right" color="#00000073"></u-icon>
            </view>
            <view v-if="index !== (searchApplications?.length || 0) - 1" class="line"></view>
          </template>

          <!--搜索结果为空页面-->
          <div v-else-if="keyword.length !== 0" class="empty-out-box">
            <u-empty-custom
              v-show="true"
              mode="search"
              model="list"
              class="content-empty"
              card="true"
              font-size="10"
            />
          </div>

          <!--历史搜索页面-->
          <view v-else-if="keyword.length === 0" class="history">
            <view class="bar">
              <view class="title">搜索历史</view>
              <view class="delete" @click="clearHistoryAction">
                <u-image
                  :src="IconDelete"
                  width="32"
                  height="32"
                  :show-loading="false"
                  :fade="false"
                ></u-image
              ></view>
            </view>
            <view class="list">
              <u-row v-if="historyApplicationList.length > 0" gutter="16">
                <u-col v-for="application in historyApplicationList" :key="application.id" span="6">
                  <view class="row" @click="clickApplicationAction(application)">
                    <view class="icon">
                      <u-image
                        :src="IconHistory"
                        width="32"
                        height="32"
                        :show-loading="false"
                        :fade="false"
                      ></u-image>
                    </view>
                    <view class="title">{{ application.name }}</view>
                  </view>
                </u-col>
              </u-row>
              <view v-else class="title">没有最近搜索记录</view>
            </view>
          </view>
        </view>
        <!--现有应用分组应用模块-->
        <applicationCard
          v-for="(item, index) in applicationCategorys"
          v-else
          :key="index"
          :list="item.applications"
          :title="item.categoryName"
          :is-hide-no-application="item.categoryId !== '-10000'"
          :sub-title="item.categoryId === '-10000' ? '编辑' : ''"
          :sub-title-color="primaryColor"
          @click-title-right="editAction"
          @click="selectItemAction"
        ></applicationCard>
        <view v-if="!isHaveSafeBottom" :style="{ height: '32rpx' }"></view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
      </scroll-view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import applicationIcon from '@/static/application.png';
import { IApplication, IApplicationCategory, workbenchStore } from '@/store/modules/workbench';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { goToApplication } from '@/utils/go-to-application';
import { cloneDeep, isNil } from '@/utils/lodash-es';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import IconDelete from '../static/workbench/icon_delete.png';
import IconHistory from '../static/workbench/icon_history.png';
import applicationCard from './components/application-card.vue';

// 获取主题色
const primaryColor = getPrimaryColor();
// store
const store = workbenchStore();
const keyword = ref('');
const searchApplications = ref<IApplication[]>();
const isHaveSafeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom > 0;
const isShowSearch = ref(false);
const isHaveClickItem = ref(false);
const historyKey = 'workbench_search_application_history_list';
const historyApplicationList = ref<IApplication[]>([]);
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
let contentHeight = `calc(100vh - 44px - ${statusBarHeight}px - 112rpx)`;

onLoad(async () => {
  store.fetchApplicationCategorysData(
    isNil(store.applicationCategoryList) || store.applicationCategoryList.length === 0,
  );
});

const applicationCategorys = computed(() => {
  const favoriteApplicationList: IApplicationCategory[] = cloneDeep(
    store.applicationCategoryList || [],
  );
  const moreApplication: IApplicationCategory = {
    categoryId: '-10000',
    categoryName: '收藏应用',
    applications: store.favoriteApplicationList || [],
  };
  favoriteApplicationList.unshift(moreApplication);
  return favoriteApplicationList;
});

const selectItemAction = (item: IApplication) => {
  goToApplication(item);
};
const editAction = () => {
  uni.navigateTo({
    url: '/app-platform/workbench/application-center-edit',
  });
};

const focusAction = () => {
  isShowSearch.value = true;
  historyApplicationList.value = uni.getStorageSync(historyKey);
};
const changeAction = (value: string) => {
  console.log('search', value);

  const tempSearchApplications: IApplication[] = [];
  if (value.length < 1) {
    searchApplications.value = tempSearchApplications;
    historyApplicationList.value = uni.getStorageSync(historyKey);
    return;
  }
  store.applicationCategoryList.forEach((category: IApplicationCategory) => {
    category.applications.forEach((application: IApplication) => {
      if (application.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
        tempSearchApplications.push(application);
      }
    });
  });
  searchApplications.value = tempSearchApplications;
};

const clearAction = () => {
  keyword.value = '';
  historyApplicationList.value = uni.getStorageSync(historyKey);
};

const clickApplicationAction = (application: IApplication) => {
  isHaveClickItem.value = true;

  updateHistoryList(application);
  selectItemAction(application);
  setTimeout(() => {
    historyApplicationList.value = uni.getStorageSync(historyKey);
  }, 1000);
};

const updateHistoryList = (application: IApplication) => {
  let list = uni.getStorageSync(historyKey);
  if (!list) {
    list = [application];
  } else {
    list = list.filter(item => {
      return item.id != application.id;
    });
    if (list.length > 9) {
      list = list.slice(0, 9);
    }
    list.unshift(application);
  }
  uni.setStorageSync(historyKey, list);
};

const cancelAction = () => {
  isShowSearch.value = false;
  keyword.value = '';
};

const customBack = () => {
  if (isShowSearch.value) {
    isShowSearch.value = false;
    keyword.value = '';
  } else {
    uni.navigateBack({
      fail(result) {
        console.log('fail', result);
      },
    });
  }
};

const clearHistoryAction = () => {
  uni.removeStorage({ key: historyKey });
  historyApplicationList.value = [];
};

const showSearchColor = (text: string) => {
  let reg = RegExp(keyword.value, 'g');
  return text.replace(reg, `<span style="color: ${primaryColor}">${keyword.value}</span>`);
};
</script>

<style scoped lang="scss">
.search-bar {
  position: relative;
  z-index: 1;
  background: white;
  box-shadow: $shadow-dark-down-base;
}
:deep(.u-card) {
  border-radius: 16rpx;
}
:deep(.u-card__head--left) {
  padding: 26rpx 32rpx;
}
:deep(.u-card__head--right) {
  padding-right: 32rpx;
}
.cancel {
  padding-left: 32rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
}
.card-content {
  position: relative;
  width: 100%;
}

.search-content {
  margin: 24rpx 32rpx 0;
  border-radius: 16rpx;
  background: white;
}

.cell {
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;

  .left {
    flex: 1;
    display: flex;
    align-items: center;

    .title {
      padding-left: 32rpx;
      flex: 1;
      font-size: 32rpx;
      font-weight: 400;
      text-align: left;
      color: #000000a6;
    }
  }
}

.history {
  padding-top: 28rpx;

  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 32rpx;

    .title {
      color: #000000a6;
      font-size: 26rpx;
      text-align: left;
      height: 64rpx;
      line-height: 64rpx;
    }

    .delete {
      padding: 16rpx 32rpx 8rpx;
    }
  }

  .list {
    padding-left: 32rpx;
    padding-right: 32rpx;

    .row {
      margin-top: 8rpx;
      margin-bottom: 8rpx;
      border-radius: 8rpx;
      background: #0000000a;
      height: 48rpx;
      display: flex;
      align-items: center;
      padding-left: 16rpx;

      .icon {
        width: 32rpx;
        height: 32rpx;
        line-height: 1;
      }

      .title {
        padding-left: 16rpx;
        height: 48rpx;
        line-height: 48rpx;
        font-size: 26rpx;
        text-align: left;
        color: #000000a6;
        @include ellipsis;
      }
    }

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      text-align: center;
      color: #000000a6;
      height: 100rpx;
    }
  }
}

.line {
  margin-left: 32rpx;
  height: 1rpx;
  background: #0000000f;
}

.empty-out-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--Radius-radius, 8px);
  background: var(--global-backgrounds-color-bg-container, #fff);
  box-shadow: 0 1px 2px 0 #0000000a;
  margin-top: 24rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  height: 384rpx;
}
</style>
