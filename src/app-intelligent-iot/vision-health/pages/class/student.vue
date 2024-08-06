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
            :key="item.studentId"
            :class="[
              'student-item',
              {
                'student-item--active': pageData.studentIndex == item.studentId,
              },
            ]"
            hover-class="hover-bg--gray"
            @click="selectStudent(item)"
          >
            <view class="zy-flex zy-flex-col-center">
              <image
                v-if="item.gender == '男'"
                class="student-avatar"
                src="@/app-intelligent-iot/static/image/avatar_boy.png"
                mode=""
              >
              </image>
              <image
                v-else
                class="student-avatar"
                src="@/app-intelligent-iot/static/image/avatar_girl.png"
                mode=""
              >
              </image>
              <view class="">
                <view class="">
                  <text class="zy-margin-right-xs">{{ item.studentName }}</text>
                  <zy-icons v-if="item.gender == '男'" type="man" color="#176BFB"></zy-icons>
                  <zy-icons v-else type="women" color="#F53F3F"></zy-icons>
                </view>
                <view v-if="item.certNo" class="text-color5 text-size24">
                  身份证后四位: {{ item.certNo }}
                </view>
              </view>
            </view>
            <view v-if="item.studentId == pageData.studentIndex" class="">
              <zy-icons type="succeed" color="#176BFB" :size="48"></zy-icons>
            </view>
          </view>
        </view>
        <zy-empty v-else></zy-empty>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
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
    userId: '',
    locationId: '',
    classId: '',
    status: '',
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
    let pingyin = makePy(item.studentName[0]);
    item.letter = pingyin.length ? pingyin[0] : 'none';
    item.certNo = item.certificateNumber?.substring(
      item.certificateNumber.length - 4,
      item.certificateNumber.length,
    );
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

  const isDaily = store.getters.isDaily;

  const requestArr = ['getStudents', 'getReScreenStudents'];
  let data = pageData.queryForm;

  if (isDaily) {
    console.log('日常检测请求学生数据，接口参数：', data);
    $http.check
      .getStudents(data)
      .then(res => {
        console.log('🚀 ~ file: student.vue:160 ~ getPageList ~ res:', res);
        makeData(res);
      })
      .catch(err => {
        console.log(err, 'err11');
        uni.stopPullDownRefresh();
        proxy.$publicFunc.hideLoading();
      });
    return;
  }

  let index = store.getters.checkWork?.screenItem || '0';
  let screenType = store.getters.screenType;

  if (index == '1') {
    //复测
    data = {
      userId: userInfo.id,
      workId: store.getters.checkWork?.id,
      status: pageData.queryForm.status,
    };
    $http.check[requestArr[index]](data)
      .then(res => {
        makeData(res);
      })
      .catch(err => {
        console.log(err, 'err11');
        uni.stopPullDownRefresh();
        proxy.$publicFunc.hideLoading();
      });
  } else {
    //正常检测
    if (screenType == 2) {
      //按学生
      let prams = {
        workId: store.getters.checkWork?.id,
      };
      $http.check
        .getScreenObjStudentList(prams)
        .then(res => {
          makeData(res);
        })
        .catch(err => {
          uni.stopPullDownRefresh();
          proxy.$publicFunc.hideLoading();
        });
    } else if (screenType == 1) {
      //按组织
      $http.check[requestArr[index]](data)
        .then(res => {
          makeData(res);
        })
        .catch(err => {
          console.log(err, 'err11');
          uni.stopPullDownRefresh();
          proxy.$publicFunc.hideLoading();
        });
    }
  }

  // if (screenType == 2) {
  //   let prams = {
  //     workId: store.getters.checkWork.id,

  //   }
  //   $http.check.getScreenObjStudentList(prams)
  //     .then((res) => {
  //       makeData(res)
  //     })
  //     .catch((err) => {
  //       uni.stopPullDownRefresh();
  //       proxy.$publicFunc.hideLoading();
  //     });
  // } else {
  //   if (index == "1") {
  //     data = {
  //       userId: userInfo.id,
  //       workId: store.getters.checkWork.id,
  //       status: pageData.queryForm.status,
  //     };
  //   }
  //   $http.check[requestArr[index]](data)
  //     .then((res) => {
  //       makeData(res)
  //     })
  //     .catch((err) => {
  //       console.log(err, "err11");
  //       uni.stopPullDownRefresh();
  //       proxy.$publicFunc.hideLoading();
  //     });
  // }
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
  pageData.queryForm.locationId = option.locationId || '';
  pageData.queryForm.classId = option.classId || '';
  pageData.workId = store.getters.checkWork?.id;
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.status = option.status || '';
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
    let title = item.studentName;
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
  store.commit('UPDATE_STUINFO', data);
  pageData.studentIndex = data.studentId;
  let type = store.getters.checkType;
  let url;

  const isDaily = store.getters.isDaily;
  if (isDaily) {
    // 同屈光
    uni.navigateTo({
      url: `/app-intelligent-iot/vision-health/pages/check/refraction/form?studentId=${data.studentId}`,
    });
    return;
  }

  switch (Number(type)) {
    case 0: //视力
      url = `/app-intelligent-iot/vision-health/pages/check/visual-acuity-test/form?studentId=${data.studentId}`;

      // url = `/vision-health/pages/check/vision/form?studentId=${data.studentId}`;
      break;
    case 1: //屈光
      url = `/app-intelligent-iot/vision-health/pages/check/refraction/form?studentId=${data.studentId}`;
      break;
    default:
      url = `/app-intelligent-iot/vision-health/pages/check/other/form?studentId=${data.studentId}`;
  }

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
