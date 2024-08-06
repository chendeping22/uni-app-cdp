<template>
  <!-- 搜索框 -->
  <view class="search-box">
    <uni-search-bar
      v-model="pageData.searchTitle"
      cancel-button="none"
      placeholder="搜索"
      maxlength="20"
      @confirm="onSearch"
      @clear="searchClear"
    >
    </uni-search-bar>
  </view>
  <view class="class-main">
    <block v-if="pageData.treeList && pageData.treeList.length">
      <zy-tree :list="pageData.treeList" :detect-option="pageData.detectOption"></zy-tree>
    </block>
    <zy-empty v-else></zy-empty>
  </view>
</template>

<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();

const pageData = reactive({
  searchTitle: '',
  queryForm: {
    userId: '',
    workId: '',
    status: '',
  },
  detectOption: {
    status: '',
    type: '',
  },
  treeList: [],
  pageList: [], // 列表
});

// 获取列表
const getPageList = () => {
  proxy.$publicFunc.showLoading();
  const isDaily = store.getters.isDaily;
  const requestApi = isDaily ? $http.check.getDailyWorkObjTree : $http.check.getWorkObjTree;
  requestApi(pageData.queryForm)
    .then(res => {
      console.log('&&&&&&&&&&&&&&&&&&&&', res);
      pageData.treeList = res;
      pageData.pageList = res;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    });
};
// 递归查询列表
const mapTree = (value, arr) => {
  let newarr = [];
  arr.forEach(element => {
    let title = element.name;
    title = title.toLowerCase();
    // 模糊查询，不区分大小写匹配查询
    if (title.indexOf(value) > -1) {
      newarr.push(element);
    } else {
      if (element.children && element.children.length) {
        let redata = mapTree(value, element.children);
        if (redata && redata.length) {
          let obj = {
            ...element,
            children: redata,
          };
          newarr.push(obj);
        }
      }
    }
  });
  return newarr;
};
// 搜索
const onSearch = e => {
  let title = e.value.trim();
  title = title.toLowerCase();
  const list = mapTree(title, pageData.pageList);
  if (list && list.length) {
    pageData.treeList = JSON.parse(JSON.stringify(list));
  } else {
    proxy.$publicFunc.showToast('none', '暂无匹配结果，建议您修改关键词重新搜索');
  }
};

// 清除搜索值
const searchClear = () => {
  pageData.searchTitle = '';
  pageData.treeList = JSON.parse(JSON.stringify(pageData.pageList));
};

onLoad(option => {
  if (option.type && option.status) {
    pageData.detectOption.type = option.type;
    pageData.detectOption.status = option.status;
  }
  pageData.queryForm.workId = store.getters.checkWork?.id;
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.status = option.status || '';
  getPageList();
});
onPullDownRefresh(() => {
  pageData.searchTitle = '';
  pageData.treeList = [];
  pageData.pageList = [];
  getPageList();
});
</script>

<style lang="scss" scoped>
.class-main {
  margin: 130rpx 0 30rpx;
  background: $zy-middle-color2;
  padding: 20rpx 0;
}
</style>
