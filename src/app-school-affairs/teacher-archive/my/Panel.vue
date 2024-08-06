<template>
  <view
    v-if="loading"
    style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center"
  >
    <u-loading></u-loading>
  </view>
  <view v-else class="my-archive-panel">
    <view class="info">
      <view class="bg-area-wrap">
        <view class="bg-area">
          <image class="bg-area-bg" :src="myBg" mode="scaleToFill" />
          <image class="info-header-img" :src="pageData.baseInfo?.imageUrl || default1" />
          <view class="info-main">
            <view class="name ell">
              <view class="ell">{{ pageData.baseInfo?.name }}</view>
              <image v-if="pageData.baseInfo?.gender === 1" class="gender" :src="man" />
              <image v-if="pageData.baseInfo?.gender === 2" class="gender" :src="woman" />
            </view>
            <view class="department ell">
              <view class="pre">部门</view>
              <view class="ell">{{ pageData.baseInfo?.department }}</view>
            </view>
            <view class="department ell">
              <view class="pre">岗位</view>
              <view class="ell">{{ pageData.baseInfo?.position }}</view>
            </view>
          </view>
          <view class="info-circle">
            <u-circle-progress
              inactive-color="#91CAFF"
              active-color="#1677FF"
              :percent="pageData.completeness?.completeness"
              :width="170"
              :border-width="8"
              bg-color="transparent"
            >
              <view class="u-progress-content">
                <view class="u-progress-dot"></view>
                <view class="u-progress-info circle-center">
                  <view class="percent"
                    >{{ pageData.completeness?.completeness }}<text class="unit">%</text></view
                  >
                  <view class="tip">档案完整度</view>
                </view>
              </view>
            </u-circle-progress>
          </view>
        </view>
      </view>

      <view class="info-view" @click="goUserDetail">查看档案</view>
    </view>
    <view class="block">
      <view class="block-header">
        <view class="left">档案完整度分布</view>
      </view>
      <view class="block-body1">
        <view class="pyramid-wrap">
          <image
            v-if="activeLevel === 'top'"
            class="pyramid-svg"
            :width="560"
            :height="356"
            :src="PyramidTop"
          ></image>
          <image
            v-if="activeLevel === 'middle'"
            class="pyramid-svg"
            :width="560"
            :height="356"
            :src="PyramidMiddle"
          ></image>
          <image
            v-if="activeLevel === 'bottom'"
            class="pyramid-svg"
            :width="560"
            :height="356"
            :src="PyramidBottom"
          ></image>
          <text class="top">{{ pageData.completeness?.excellentNum }}人</text>
          <text class="middle">{{ pageData.completeness?.ordinaryNum }}人</text>
          <text class="bottom">{{ pageData.completeness?.poorNum }}人</text>
        </view>
        <view class="rank"
          >{{ useIsBureau() ? '我的区域排名' : '我的学校排名'
          }}<text class="num">{{ pageData.completeness?.ranking }}</text
          ><text class="ming">名</text></view
        >
      </view>
    </view>
    <view class="block">
      <view class="block-header">
        <view class="left">教师成长历程</view>
        <view class="action2" @click="goUserDetail">
          <view class="plus-area"><text>+</text></view
          >新增历程
        </view>
      </view>
      <view class="block-body2">
        <view v-if="!(pageData.growthProcessList?.length > 0)" class="empty-wrap">
          <u-empty text="快去添加你的成长历程吧" mode="data"></u-empty>
        </view>
        <view v-else>
          <view class="list2">
            <view
              v-for="(item, index) in pageData.growthProcessList"
              :key="item.date"
              class="list2-one"
              :class="{
                last: index === pageData.growthProcessList?.length - 1,
              }"
            >
              <view class="line"></view>
              <view class="box">
                <view class="prize-area">
                  <view class="prize-time">{{ item.date }}</view>
                  <view v-for="one in item.content" :key="one" class="prize-content">
                    {{ one }}
                  </view>
                </view>
                <view class="extend">
                  <view class="ddot"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="block">
      <view class="block-header">
        <view class="left">教师成长记录</view>
        <view class="action3"> </view>
      </view>
      <view class="block-body3">
        <view v-if="!(pageData.growthRecordList?.length > 0)" class="empty-wrap">
          <u-empty text="暂无数据" mode="data"></u-empty>
        </view>
        <view v-else>
          <view class="list2">
            <view
              v-for="(item, index) in pageData.growthRecordList?.slice(0, 10)"
              :key="item.date"
              class="list2-one"
              :class="{
                last1: index === pageData.growthRecordList?.length - 1,
                first: index === 0,
              }"
            >
              <view class="line"></view>
              <view class="box">
                <view class="prize-area">
                  <view class="prize-time">{{ dayjs(item.date).format('YYYY-MM-DD HH:mm') }}</view>
                  <view class="prize-operator">{{ item.operator }}</view>
                  <view class="prize-content">
                    {{ item.content }}
                  </view>
                </view>
                <view class="extend">
                  <view class="ddot1">
                    <image :src="time" class="time1"></image>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getMyArchive } from '@/app-school-affairs/teacher-archive/helper/api.ts';
import { loginStore } from '@/store/modules/login';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import infoBg from "@/app-school-affairs/static/teacher-archive/infoBg.svg";
import man from '@/app-school-affairs/static/teacher-archive/man.svg';
import woman from '@/app-school-affairs/static/teacher-archive/woman.svg';
// import new1 from "@/app-school-affairs/static/teacher-archive/new1.svg";
// import old from "@/app-school-affairs/static/teacher-archive/old.svg";
// import flag from "@/app-school-affairs/static/teacher-archive/flag.svg";
// import FlagSvg from "@/app-school-affairs/static/teacher-archive/FlagSvg.vue";
// import New1Svg from "@/app-school-affairs/static/teacher-archive/New1Svg.vue";
import PyramidBottom from '@/app-school-affairs/static/teacher-archive/PyramidBottom.svg';
import PyramidMiddle from '@/app-school-affairs/static/teacher-archive/PyramidMiddle.svg';
import PyramidTop from '@/app-school-affairs/static/teacher-archive/PyramidTop.svg';
import default1 from '@/app-school-affairs/static/teacher-archive/default1.svg';
import myBg from '@/app-school-affairs/static/teacher-archive/myBg.png';
import time from '@/app-school-affairs/static/teacher-archive/time.svg';
import useIsBureau from '@/utils/use-is-bureau';
import dayjs from 'dayjs';

const router = useRouter();
const route = useRoute();

const detailRef = ref<any>(null);
// const userStore = useUserStore();
// const userInfo = userStore.getUserInfo;
const store = loginStore();
const { userInfo } = store || {};
// const userInfo = ref({});

const basePrimaryColor = ref('#1677FF');

const loading = ref(false);

const pageData = ref({
  baseInfo: {},
  completeness: {},
  growthRecordList: [],
  growthProcessList: [],
});

const activeLevel = computed(() => {
  if (pageData.value.completeness?.completeness <= 50) {
    return 'bottom';
  }
  if (pageData.value.completeness?.completeness > 80) {
    return 'top';
  }
  return 'middle';
});

async function init() {
  // userInfo.value = uni.getStorageSync('userInfo') || {};
  // console.log('🚀ccc ~ ~ userInfo:', userInfo.value);

  loading.value = true;
  const res = await getMyArchive();
  // console.log("🚀ccc ~ init ~ res:", res, route.query.themeColor);
  // if (route.query.themeColor) {
  //   basePrimaryColor.value = route.query.themeColor;
  // }
  pageData.value = res || {};
  loading.value = false;
}

function goUserDetail() {
  uni.navigateTo({
    url: `/app-school-affairs/teacher-archive/detail/index?id=${pageData.value.baseInfo.id}`,
    // url: `/app-school-affairs/teacher-archive/detail/index?id=${userInfo?.id}`,
  });
}
async function updateInfo() {
  const res = await getMyArchive();
  pageData.value = res || {};
}

onBeforeMount(() => {
  uni.$on('updateTeacherMyPanel', updateInfo);
  uni.$on('updateTeacherMyPanelWithLoading', init);
});

onBeforeUnmount(() => {
  uni.$off('updateTeacherMyPanel', updateInfo);
  uni.$off('updateTeacherMyPanelWithLoading', init);
});

onMounted(() => {
  init();
});
</script>

<style scoped lang="scss">
.my-archive-panel {
  background-color: #f5f5f5;
  height: 100%;
  width: 100%;
  padding: 24rpx 32rpx;
  overflow: auto;
  .ell {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .info {
    border-radius: 16rpx;
    background-color: #fff;
    margin-bottom: 24rpx;
    .bg-area-wrap {
      padding: 4rpx 4rpx 0;
    }
    .bg-area {
      position: relative;
      border-radius: 16rpx;
      width: 100%;
      height: 248rpx;
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      padding: 0 32rpx;
      align-items: center;
      overflow: hidden;
      .info-header-img {
        z-index: 1;
        width: 112rpx;
        height: 160rpx;
        flex: none;
      }
      .info-main {
        z-index: 1;
        flex: 1;
        margin: 0 32rpx;
        overflow: hidden;
        .name {
          font-size: 32rpx;
          display: flex;
          align-items: center;
          .gender {
            margin-left: 20rpx;
            width: 36rpx;
            height: 36rpx;
            flex: none;
          }
        }
        .department {
          font-size: 26rpx;
          display: flex;
          align-items: center;
          margin-top: 16rpx;
          /* text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap; */
          .pre {
            color: rgba(0, 0, 0, 0.65);
            margin-right: 24rpx;
          }
        }
      }
      .info-circle {
        z-index: 1;
        flex: none;
        .circle-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .percent {
          font-weight: 600;
          font-size: 32rpx;
          .unit {
            font-size: 24rpx;
            color: rgba(0, 0, 0, 0.45);
          }
        }
        .tip {
          font-size: 22rpx;
          color: rgba(0, 0, 0, 0.45);
        }
      }
      .bg-area-bg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
      }
    }
    .info-view {
      height: 64rpx;
      color: #1677ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .block {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    .block-header {
      height: 96rpx;
      display: flex;
      justify-content: space-between;
      padding: 0 32rpx;
      align-items: center;
      .left {
        font-size: 32rpx;
        font-weight: 600;
      }
    }
    .block-body1 {
      padding: 24rpx 0 52rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      .pyramid-wrap {
        position: relative;
        margin-left: 66rpx;
        font-size: 22rpx;
        color: rgba(0, 0, 0, 0.65);
        .top {
          position: absolute;
          top: 45rpx;
          right: 175rpx;
        }

        .middle {
          position: absolute;
          top: 140rpx;
          right: 107rpx;
        }

        .bottom {
          position: absolute;
          bottom: 86rpx;
          right: 24rpx;
        }
        .pyramid-svg {
          width: 560rpx;
          height: 356rpx;
        }
      }
      .rank {
        margin-top: 24rpx;
        font-size: 32rpx;
        color: rgba(0, 0, 0, 0.45);
        .num {
          font-size: 40rpx;
          font-weight: 600;
          margin: 0 8rpx 0 24rpx;
          color: rgba(0, 0, 0, 0.88);
        }
        .ming {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.88);
        }
      }
    }
    .action2 {
      color: #1677ff;

      .plus-area {
        display: inline-flex;
        background-color: #1677ff;
        width: 32rpx;
        height: 32rpx;
        margin-right: 8rpx;
        color: #fff;
        border-radius: 50%;
        align-items: center;
        justify-content: center;

        text {
          transform: translateY(-3rpx);
        }
      }
    }
    .empty-wrap {
      margin: 24rpx 0;
    }
    .block-body2,
    .block-body3 {
      padding: 0 32rpx 48rpx 40rpx;
      .list2-one {
        display: flex;
        padding-bottom: 24rpx;
        // height: 68px;
        position: relative;

        &.last {
          padding-bottom: 4rpx;

          .line {
            &::after {
              position: absolute;
              bottom: -28rpx;
              left: 50%;
              transform: translateX(-50%);
              content: ' ';
              border: 12rpx solid transparent;
              border-top: 16rpx solid rgba(0, 0, 0, 0.15);
            }
          }
        }
      }

      .line {
        position: absolute;
        width: 4rpx;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 12rpx;
        flex: none;
      }

      .box {
        background-color: rgba(0, 0, 0, 0.02);
        /* border: 1px solid #e8f3ff; */
        padding: 16rpx 32rpx;
        margin-left: 40rpx;
        border-radius: 8rpx;
        position: relative;
        display: flex;
        font-size: 24rpx;
        flex: 1;

        .flag {
          flex: none;
          margin-right: 16rpx;
          width: 36rpx;
          height: 36rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prize-time {
          font-weight: 600;
          font-size: 26rpx;
          margin-bottom: 16rpx;
        }
        .prize-operator {
          font-size: 26rpx;
          margin-bottom: 8rpx;
          color: rgba(0, 0, 0, 0.45);
        }

        .prize-content {
          display: flex;
          align-items: center;
          font-size: 30rpx;
          color: rgba(0, 0, 0, 0.65);

          /* span {
            width: 4px;
            height: 4px;
            background-color: #c3d6e5;
            margin-right: 6px;
          } */
        }

        .extend {
          display: flex;
          align-items: center;
          top: 50%;
          left: -48rpx;
          transform: translateY(-50%);
          position: absolute;

          .ddot {
            box-sizing: border-box;
            width: 20rpx;
            height: 20rpx;
            background-color: #e6f4ff;
            border-radius: 50%;
            border: 4rpx solid #1677ff;
          }

          /* .row-line {
            height: 2px;
            width: 21px;
            background-color: #e6f4ff;
          } */
        }
      }
    }
    .block-body3 {
      .list2-one {
        .line {
          width: 0;
          border-inline-start: 4rpx dotted rgba(0, 0, 0, 0.15);
          background-color: transparent;
        }
        &.first {
          .line {
            height: 50%;
            transform: translateY(100%);
          }
        }
        &.last1 {
          .line {
            height: 50%;
          }
        }
        .extend {
          left: -56rpx;
        }
        .ddot1 {
          box-sizing: border-box;
          width: 36rpx;
          height: 36rpx;
          background-color: #e6f4ff;
          border-radius: 50%;
          .time1 {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
