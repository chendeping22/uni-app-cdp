<template>
  <view class="">
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
    <view class="student-main">
      <view class="letter-list">
        <view
          v-for="item in pageData.letterList"
          :key="item"
          :class="[
            'letter-list--item',
            {
              'letter-active': pageData.letterIndex == (item == '#' ? 'none' : item),
            },
          ]"
          @click.stop="scrollTo(item)"
        >
          {{ item }}
        </view>
      </view>
      <!-- 学生列表 -->
      <scroll-view
        :scroll-into-view="pageData.letterIndex"
        :scroll-y="true"
        :scroll-with-animation="true"
        style="height: calc(100vh - 160rpx)"
      >
        <view v-if="pageData.pageList && pageData.pageList.length" class="student-list">
          <view
            v-for="(item, index) in pageData.pageList"
            :id="item.letter"
            :key="item.id"
            :class="[
              'student-item',
              {
                'student-item--active': pageData.studentIndex == item.id,
              },
            ]"
            hover-class="hover-bg--gray"
            @click="selectStudent(item)"
          >
            <view class="zy-flex zy-flex-col-center">
              <image
                v-if="item.stuGender == '男'"
                class="student-avatar"
                src="../../assets/image/avatar_boy.png"
                mode=""
              >
              </image>
              <image v-else class="student-avatar" src="../../assets/image/avatar_girl.png" mode="">
              </image>
              <view class="">
                <view class="">
                  <text class="zy-margin-right-xs">{{ item.stuName }}</text>
                  <zy-icons v-if="item.stuGender == '男'" type="man" color="#176BFB"></zy-icons>
                  <zy-icons v-else type="women" color="#F53F3F"></zy-icons>
                </view>
                <view v-if="item.stuIdNo" class="text-color5 text-size24">
                  身份证后四位: {{ item.stuIdNo }}
                </view>
              </view>
            </view>
            <view v-if="item.id == pageData.studentIndex" class="">
              <zy-icons type="succeed" color="#176BFB" :size="48"></zy-icons>
            </view>
          </view>
        </view>
        <zy-empty v-else></zy-empty>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-collect/api';
import { loginEvent } from '@/app-intelligent-iot/vision-collect/utils/loginEvent';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import makePy from '@/app-intelligent-iot/vision-health/utils/strChineseFirstPY.js';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();
const pageData = reactive({
  searchTitle: '',
  queryForm: {
    gradId: '',
    classId: '',
  },
  letterList: [], // 字母索引列表
  letterIndex: '', // 字母索引
  studentIndex: '', // 学生选中
  studentList: [],
  pageList: [], // 列表
  workId: '',
  loadingStatus: 'more', // loading的状态 more/loading/noMore
});

const makeData = res => {
  res.forEach(item => {
    let pingyin = makePy(item.stuName[0]);
    item.letter = pingyin.length ? pingyin[0] : 'none';
    item.stuIdNo2 = item.stuIdNo;
    item.stuIdNo = item.stuIdNo?.substring(item.stuIdNo.length - 4, item.stuIdNo.length);
  });
  // 按中文首字母排序
  let objectArraySort = function (keyName) {
    return function (objectN, objectM) {
      let valueN = objectN[keyName].toUpperCase();
      let valueM = objectM[keyName].toUpperCase();
      if (valueN < valueM) return -1;
      else if (valueN > valueM) return 1;
      else return 0;
    };
  };
  pageData.pageList = res.sort(objectArraySort('letter'));
  pageData.studentList = pageData.pageList;
  proxy.$publicFunc.hideLoading();
  uni.stopPullDownRefresh();
};
// 获取列表
const getPageList = () => {
  proxy.$publicFunc.showLoading();
  let prams = {
    threadId: store.getters.checkWork_vc.id,
    gradId: pageData.queryForm.gradId,
    classId: pageData.queryForm.classId,
    keywork: '',
    pageNum: 1,
    pageSize: 9999999,
  };
  $http.kangRui
    .findStudents(prams)
    .then(res => {
      console.log('findStudents==============', res);
      makeData(res.pAGE.list);
    })
    .catch(err => {
      uni.stopPullDownRefresh();
      proxy.$publicFunc.hideLoading();
      loginEvent(userInfo.tel);
    });
};
onShow(() => {
  uni.setStorageSync('VISIONFALG', true);
});
onLoad(option => {
  // 生成26个小写字母集合
  const CHARCODE_A_LC = 65;
  pageData.letterList = new Array(26)
    .fill(null)
    .map((v, i) => String.fromCharCode(CHARCODE_A_LC + i));
  pageData.letterList.unshift('#');
  pageData.queryForm.gradId = option.gradId || '';
  pageData.queryForm.classId = option.classId || '';
  getPageList();
});
onPullDownRefresh(() => {
  pageData.searchTitle = '';
  pageData.studentList = [];
  pageData.pageList = [];
  getPageList();
});

// 搜索
const onSearch = e => {
  let newarr = [];
  pageData.studentList.forEach(item => {
    let title = item.stuName;
    title = title.toLowerCase();
    // 模糊查询，不区分大小写匹配查询
    if (title.indexOf(e.value) > -1) {
      newarr.push(item);
    }
  });
  if (newarr && newarr.length) {
    pageData.pageList = JSON.parse(JSON.stringify(newarr));
  } else {
    proxy.$publicFunc.showToast('none', '暂无匹配结果，建议您修改关键词重新搜索');
  }
};
// 清除搜索值
const searchClear = () => {
  pageData.searchTitle = '';
  pageData.pageList = JSON.parse(JSON.stringify(pageData.studentList));
};
// 选中字母索引，滚动到指定位置
const scrollTo = index => {
  pageData.letterIndex = index == '#' ? 'none' : index;
};
// 选中学生
const selectStudent = data => {
  store.commit('UPDATE_STUINFO_VC', data);
  pageData.studentIndex = data.id;
  let url = `/app-intelligent-iot/vision-collect/pages/check/visual-acuity-test/form?studentId=${data.studentId}`;
  uni.navigateTo({
    url: url,
  });
};
</script>

<style lang="scss" scoped>
.student-main {
  position: relative;
  margin: 130rpx 0 30rpx;

  .letter-list {
    position: absolute;
    right: 6rpx;
    top: 100rpx;
    z-index: 999;
    color: $zy-middle-color5;
    font-size: $zy-font-size24;

    &--item {
      width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      text-align: center;
    }

    .letter-active {
      background: $zy-main-color;
      color: $zy-middle-color2;
      border-radius: 50%;
    }
  }

  .student-list {
    .student-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: $zy-middle-color2;
      padding: 20rpx 30rpx;
      line-height: 48rpx;

      &--active {
        background: $zy-bg-color;
      }

      .student-avatar {
        width: 88rpx;
        height: 88rpx;
        border-radius: 50%;
        margin-right: 30rpx;
      }
    }
  }
}
</style>
