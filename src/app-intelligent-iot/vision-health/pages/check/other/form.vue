<template>
  <view class="zy-margin-top-sm">
    <view class="user-card zy-shadow">
      <image
        v-if="studentInfo.gender == '男' || studentInfo.gender == 1"
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_boy.png"
        mode=""
      ></image>
      <image
        v-else
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_girl.png"
        mode=""
      ></image>
      <view class="">
        <view class="">
          {{ studentInfo.studentName || studentInfo.name }}
          <zy-icons
            v-if="studentInfo.gender == '男' || studentInfo.gender == 1"
            color="#176BFB"
            type="man"
            :size="32"
          ></zy-icons>
          <zy-icons v-else color="#F53F3F" type="women" :size="32"></zy-icons>
        </view>
        <view class="text-size24 text-color5">
          {{ studentInfo.clazzName }}
        </view>
      </view>
    </view>
    <block v-if="pageData.isForm">
      <view class="centerBox">
        <view class="headerBox">
          <image
            class="bg-img"
            src="@/app-intelligent-iot/static/image/text.png"
            mode="widthFix"
          ></image>
          <image
            class="Tit_Text_Left"
            src="@/app-intelligent-iot/static/image/Tit_Text_Left.png"
          ></image>
          <view class="bg-title">{{ tips }}</view>
          <image
            class="Tit_Text_Right"
            src="@/app-intelligent-iot/static/image/Tit_Text_Right.png"
            mode="widthFix"
          >
          </image>
        </view>
        <!-- 数值型 -->
        <view v-if="mode == 2">
          <view v-for="(item, index) in indicatorList" :key="index" class="mainBox">
            <view class="leftTitle">{{ item.indicatorName }}</view>
            <view class="rightBox">
              <input
                v-model="item.indicatorVal"
                class="uni-input inputStyle"
                type="number"
                maxlength="10"
                placeholder="请输入"
                @blur="replaceInput($event, index)"
              />
              <view class="unit">{{ item.unit }}</view>
            </view>
          </view>
        </view>

        <!-- 枚举型 -->
        <view v-else>
          <view
            v-for="(item, index) in indicatorList"
            :key="index"
            class="mainBox"
            @click="openPopup(item.enumsList, index)"
          >
            <view class="leftTitle">{{ item.indicatorName }}</view>
            <view class="rightBox">
              <view class="rightTitle">{{ item.indicatorVal }}</view>
              <image
                class="arrow"
                src="@/app-intelligent-iot/static/image/icon_arrow_right.png"
                mode="widthFix"
              ></image>
            </view>
          </view>
        </view>
      </view>

      <view
        style="margin-top: 64rpx; margin-bottom: 30rpx"
        class="write-btn save-btn"
        hover-class="zy-hover"
        @click="saveInfo"
      >
        上报
      </view>
      <!-- 弹窗 -->
      <zy-select-popup
        ref="popupRef"
        :is-active="true"
        title="选择检测项目结果"
        :list="current"
        @change="checkChange"
      />
    </block>
    <block v-else>
      <view class="empty_bg">
        <image
          class="zy-width-full"
          src="@/app-intelligent-iot/static/image/empty_bg_getdata.png"
          mode="widthFix"
        ></image>
      </view>
    </block>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { onShow, onLoad, onReady } from '@dcloudio/uni-app';
import { reactive, ref, computed } from 'vue';
import { saveToast } from '@/app-intelligent-iot/vision-health/utils/check';
import { useStore } from '@/store/old';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
const tips = ref('');
const mode = ref();
const itemName = ref();
const currentIndex = ref();
const indicatorList = ref([]);
const current = ref([]);
const popupRef = ref(null);
const { proxy } = getPublicFuncProxy();
const store = useStore();

const pageData = reactive({
  isForm: true,
});

// 获取学生信息
const studentInfo = computed(() => {
  return store.getters.studentInfo || {};
});

// 整理下拉数据
const madeData = val => {
  const newList = val?.map(item => {
    return {
      name: item.name,
      value: item.name,
    };
  });
  return newList;
};

onShow(() => {
  setTimeout(() => {
    proxy.$publicFunc.hideLoading();
  }, 500);
});
onReady(() => {
  uni.setNavigationBarTitle({
    title: `${store.getters.checkName}检测`,
  });
});
// 获取检测记录
const getScreenInfo = () => {
  let data = {
    studentId: studentInfo.value.studentId || studentInfo.value.id,
    workId: store.getters.checkWork.id,
    itemCode: store.getters.checkType,
  };
  $http.check.getItemIndicator(data).then(res => {
    if (res) {
      tips.value = res.tips || '请填写检测结果';
      mode.value = res.mode;
      indicatorList.value = res.indicatorList || [];
      itemName.value = res.itemName;
    }
  });
};
onLoad(option => {
  proxy.$publicFunc.showLoading();
  getScreenInfo();
});

const checkChange = e => {
  indicatorList.value[currentIndex.value].indicatorVal = e.name;
};
const openPopup = (val, index) => {
  current.value = madeData(val);
  currentIndex.value = index;
  popupRef.value.openPopup();
};
// 保存上报
const saveInfo = async () => {
  setTimeout(() => {
    let flag = false;
    indicatorList.value?.map(item => {
      if (!item?.indicatorVal) {
        uni.showToast({
          title: '数据填写不完整',
          icon: 'error',
          duration: 2000,
        });
        flag = true;
      }
    });
    if (flag) {
      return;
    }

    proxy.$publicFunc.showLoading('上报中...');
    let data = {
      itemId: store.getters.checkType,
      studentId: studentInfo.value.studentId || studentInfo.value.id,
      screenWorkId: store.getters.checkWork.id,
      indicatorVos: indicatorList.value,
      itemName: itemName.value,
    };
    saveToast($http.check.saveOtherScreenInfo(data));
  }, 50);
};
const replaceInput = (e, index) => {
  indicatorList.value[index].indicatorVal = e.target.value.replace(/\b(0+)/gi, '');
};
</script>

<style lang="scss" scoped>
.centerBox {
  margin: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 0 40rpx rgb(196, 193, 193);
  padding-bottom: 20rpx;
}

.mainBox {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 20rpx auto;
  height: 90rpx;
  line-height: 90rpx;
  padding: 0 25rpx;

  .arrow {
    width: 45rpx;
  }

  .leftTitle {
    font-size: 30rpx;
    color: #1d2129;
    float: left;
  }

  .rightBox {
    float: right;
    display: flex;
    align-items: center;

    .rightTitle {
      margin-right: 20rpx;
      color: #4e5969;
    }

    .unit {
      color: #4e5969;
      font-size: 30rpx;
      min-width: 50rpx;
      overflow: hidden;
    }

    .inputStyle {
      background: #f2f3f4;
      height: 70rpx;
      line-height: 70rpx;
      border-radius: 10rpx;
      padding: 0 20rpx;
      width: 300rpx;
      margin-right: 50rpx;
    }
  }
}

.headerBox {
  width: 100%;
  height: 130rpx;
  margin: 0 auto;
  position: relative;

  .bg-img {
    width: 100%;
  }

  .Tit_Text_Left {
    width: 40rpx;
    height: 20rpx;
    position: absolute;
    top: 50rpx;
    left: 50rpx;
    z-index: 99;
  }

  .Tit_Text_Right {
    width: 40rpx;
    height: 40rpx;
    position: absolute;
    top: 50rpx;
    right: 50rpx;
    z-index: 99;
  }

  .bg-title {
    width: 100%;
    text-align: center;
    font-size: 35rpx;
    color: #1d2129;
    position: absolute;
    top: 35rpx;
  }
}

.empty_bg {
  width: 200rpx;
  margin: 140rpx auto 70rpx;
}

.write-btn {
  width: 208rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  margin: 0 auto;
  background: $zy-main-color;
  color: $zy-middle-color2;
  border-radius: 12rpx;
}

.save-btn {
  width: 690rpx;
  height: 96rpx;
  line-height: 96rpx;
}
</style>
