<template>
  <view v-if="isShow" class="refraction-card zy-shadow">
    <view
      class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding"
      hover-class="hover-bg--gray"
      @click="openPopup"
    >
      <text class="text-size34">{{ pageData.titleValue }}</text>
      <zy-icons type="arrow_right" :size="48"></zy-icons>
    </view>
  </view>
  <view class="class-main">
    <block v-if="pageData.treeList && pageData.treeList.length">
      <CollectZyTree
        :list="pageData.treeList"
        :detect-option="pageData.detectOption"
      ></CollectZyTree>
    </block>
    <zy-empty v-else></zy-empty>
  </view>
  <!-- 弹窗 -->
  <zy-select-popup
    ref="popupRef"
    :is-active="true"
    title="选择学校"
    :list="pageData.selectList"
    @change="checkChange"
  />
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-collect/api';
import { loginEvent } from '@/app-intelligent-iot/vision-collect/utils/loginEvent';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
import CollectZyTree from '../../components/collect-zy-tree';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();
const popupRef = ref(null);
const isShow = ref(false);
const pageData = reactive({
  titleValue: '选择班级',
  titleId: '',
  queryForm: {
    threadId: '',
    pageNum: 1,
    pageSize: 9999999,
  },
  detectOption: {
    status: '',
    type: '',
  },
  selectList: [],
  treeList: [],
  pageList: [], // 列表
});

const checkChange = e => {
  pageData.titleValue = e.name;
  pageData.titleId = e.value;
  getPageList(e.value);
};
// 打开弹窗
const openPopup = data => {
  popupRef.value.openPopup();
};

const madeData = list => {
  let arr = [];
  list.forEach(element => {
    arr.push({
      name: element.thisName,
      id: element.id,
      pid: element.pid,
      level: element.type == 1 ? 4 : element.type == 2 ? 5 : 6,
      children: element.children.length > 0 ? madeData(element.children) : null,
    });
  });
  return arr;
};
// 获取列表
const getPageList = id => {
  proxy.$publicFunc.showLoading();
  let prams = {
    threadId: store.getters.checkWork_vc.id,
    schoolId: id,
  };
  $http.kangRui
    .findWorkStudentTree(prams)
    .then(res => {
      console.log('findWorkStudentTree================', res);
      madeData(res.lIST);
      pageData.treeList = madeData(res.lIST);
      pageData.pageList = madeData(res.lIST);
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
      loginEvent(userInfo.tel);
    });
};

const getData = () => {
  pageData.queryForm.threadId = store.getters.checkWork_vc.id;
  $http.kangRui
    .findWorkSchools(pageData.queryForm)
    .then(res => {
      console.log('findWorkSchools================', res);
      let list = res.pAGE.list;
      if (list.length) {
        isShow.value = true;
        let dataList = [];
        list.map(item => {
          dataList.push({
            name: item.schName,
            value: item.id,
          });
        });

        pageData.selectList = dataList;
        pageData.titleValue = dataList[0].name;
        pageData.titleId = dataList[0].value;
        getPageList(dataList[0].value);
      } else {
        isShow.value = false;
      }
    })
    .catch(err => {
      loginEvent(userInfo.tel);
    });
};

onLoad(option => {
  getData();
});
onPullDownRefresh(() => {
  pageData.treeList = [];
  pageData.pageList = [];
  getData();
});
</script>

<style lang="scss" scoped>
.class-main {
  // margin: 130rpx 0 30rpx;
  background: $zy-middle-color2;
  padding: 20rpx 0;
}
.refraction-card {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  margin: 24rpx 0;

  .refraction-scan {
    padding: 80rpx 30rpx 0;
    width: 320rpx;
    height: 340rpx;
    margin: 0 auto;
  }

  .refraction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $zy-main-color;
    border-radius: 12rpx;
    color: $zy-middle-color2;
    width: 568rpx;
    height: 96rpx;
    margin: 60rpx auto;
    font-size: $zy-font-size34;
  }
}
</style>
