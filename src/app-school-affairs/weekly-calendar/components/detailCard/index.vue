<template>
  <u-mask class="detail-mask" :show="props.showDetail" :mask-click-able="false">
    <view class="warp">
      <view
        :class="['rect', itemList?.contentType && getBg(itemList?.contentType).linearBg]"
        @tap.stop
      >
        <view class="header">
          <scroll-view style="max-height: 300px" scroll-y="true">
            <view>
              <view class="title-name">{{ itemList?.content }}</view>
              <view v-show="itemList?.tagTypes && itemList?.tagTypes.length" class="title-tags">
                <view
                  v-for="(val, inx) in itemList.tagTypes"
                  :key="inx + Math.random()"
                  class="tag-style"
                >
                  {{ getTag(val)?.name }}
                </view>
              </view>
            </view>
            <view> <image class="card-header-bg" :src="cardHeaderBg" /></view>
          </scroll-view>
        </view>
        <!-- <view style="max-height: 300rpx; border-radius: 16rpx; overflow: hidden"> -->
        <view class="content">
          <scroll-view style="max-height: 400px" scroll-y="true">
            <view class="content2">
              <!-- 事项时间： -->
              <view class="detail-contentbox mt30">
                <u-icon class="icon-style" name="clock" size="26" color="#8c8c8c"></u-icon>
                <view class="detail-name">事项时间</view>
                <view class="detail-content">
                  {{ itemList?.calendarDate }}
                  {{ itemList?.startTime }}{{ itemList?.startTime && itemList?.endTime ? '~' : ''
                  }}{{ itemList?.endTime }}
                </view>
              </view>
              <!-- 事项地点： -->
              <view v-if="itemList?.place" class="detail-contentbox">
                <u-icon class="icon-style" name="map" size="26" color="#8c8c8c"></u-icon>
                <view class="detail-name">事项地点</view>
                <view class="detail-content">
                  {{ itemList?.place }}
                </view>
              </view>
              <!-- 除了课表没有(参加对象:4) -->
              <view
                v-if="(itemList?.joinObjs || itemList?.joinUsers) && itemList?.contentType != 4"
                class="detail-contentbox"
              >
                <image class="image-style" :src="svgSrc" />
                <view class="detail-name">参加对象</view>
                <view class="detail-content">
                  <view v-show="itemList?.joinObjs">
                    <view>{{ itemList?.joinObjs }}</view>
                  </view>
                  <view v-show="itemList?.joinUsers">
                    <view>{{ itemList?.joinUsers }}</view>
                  </view>
                </view>
              </view>
              <!-- 只有周行事历(1,2,3都是)才显示负责部门 -->
              <view
                v-if="
                  itemList?.responsibleDepts &&
                  (itemList?.contentType == 1 ||
                    itemList?.contentType == 2 ||
                    itemList?.contentType == 3)
                "
                class="detail-contentbox"
              >
                <image class="image-style2" :src="depSvgSrc" />
                <view class="detail-name">负责部门</view>
                <view class="detail-content">
                  {{ itemList?.responsibleDepts }}
                </view>
              </view>
              <!-- 负责人 -->
              <view v-if="itemList?.responsibleUsers" class="detail-contentbox">
                <u-icon class="icon-style" name="account" size="26" color="#8c8c8c"></u-icon>
                <view class="detail-name">负责人</view>
                <view class="detail-content">{{ itemList?.responsibleUsers }}</view>
              </view>
              <view class="empty-box"></view>
            </view>
          </scroll-view>
        </view>

        <u-icon
          class="close-btn"
          name="close-circle-fill"
          size="70"
          color="#fff"
          @click="closeEvent"
        ></u-icon>
      </view>
    </view>
  </u-mask>
</template>
<script setup lang="ts">
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, ref, watch } from 'vue';
import svgSrc from '../../../static/Shape.svg';
import cardHeaderBg from '../../../static/card_header_bg.png';
import depSvgSrc from '../../../static/dep.svg';

const emit = defineEmits(['update:showDetail']);
const userInfo = loginStore().userInfo;
const itemList = ref();
const pageParams = ref();
const props = defineProps({
  showDetail: {
    type: Boolean,
    default: false,
  },
  detailData: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => props.detailData,
  val => {
    itemList.value = val;
  },
  { immediate: true, deep: true },
);
const closeEvent = () => {
  emit('update:showDetail', false);
};
const getBg = computed(() => (val: number) => {
  switch (val) {
    case 1:
      return {
        bgName: 'blue-line',
        linearBg: 'detail-blue',
        name: '单位日程',
      };
    case 2:
      return {
        bgName: 'green-line',
        linearBg: 'detail-green',
        name: '部门日程',
      };
    case 3:
      return {
        bgName: 'orange-line',
        linearBg: 'detail-orange',
        name: '个人日程',
      };
    case 4:
      return {
        bgName: 'red-line',
        linearBg: 'detail-red',
        name: '课程表',
      };
    case 5:
      return {
        bgName: 'purple-line',
        linearBg: 'detail-purple',
        name: '会议',
      };
  }
});
const getTag = computed(() => (val: number) => {
  const { userId, gender } = pageParams.value;
  const isSelf = (userId && userId === userInfo?.userId) || !userId ? true : false;

  switch (val) {
    case 1:
      return {
        colorName: 'orange-style',
        name: `${isSelf ? '个人' : gender === '1' ? '他的' : '她的'}日程`,
      };
    case 2:
      return {
        colorName: 'blue-style',
        name: `${isSelf ? '本' : gender === '1' ? '他' : '她'}部门负责${isSelf ? '' : '的'}`,
      };
    case 3:
      return {
        colorName: 'pink-style',
        name: `${isSelf ? '本人' : gender === '1' ? '他' : '她'}负责${isSelf ? '' : '的'}`,
      };
    case 4:
      return {
        colorName: 'green-style',
        name: `${isSelf ? '本人' : gender === '1' ? '他' : '她'}参与${isSelf ? '' : '的'}`,
      };
    case 5:
      return {
        colorName: 'red-style',
        name: '课程表',
      };
    case 6:
      return {
        colorName: 'purple-style',
        name: '会议',
      };
  }
});
onBeforeMount(() => {
  pageParams.value = getPageParams();
});
</script>

<style lang="scss" scoped>
.warp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
}

.rect {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 80%;
  min-height: 270rpx;
  max-height: 60%;
  border-radius: 16rpx;
  background-color: #fff;
}
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-height: 300rpx;
}
.content {
  border-radius: 16rpx;
  background-color: #fff;
  width: 100%;
  max-height: 400rpx;
  // overflow: hidden;
}
.content2 {
  border-radius: 16rpx;
  background-color: #fff;
  width: 100%;
  max-height: 400rpx;
  min-height: 200rpx;
  padding: 32rpx 48rpx 0;
}
.detail-blue {
  background: linear-gradient(90deg, #4a8ff0 0%, #1677ff 100%);
}
.detail-green {
  background: linear-gradient(90deg, #5fc62c 0%, #52c41a 100%);
}
.detail-orange {
  background: linear-gradient(90deg, #faad14 0%, #dd9300 100%);
}
.detail-red {
  background: linear-gradient(90deg, #e85f60 0%, #ff4d4f 100%);
}
.detail-purple {
  background: linear-gradient(90deg, #a76cef 0%, #9254de 100%);
}
.card-header-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120rpx;
  height: 150rpx;
}
.close-btn {
  position: absolute;
  bottom: -130rpx;
  right: calc(50% - 35rpx);
}
.title-name {
  font-size: 34rpx;
  font-weight: 500;
  color: #fff;
  white-space: wrap;
  padding: 32rpx 48rpx 16rpx 48rpx;
  word-break: break-all;
}
.title-tags {
  display: flex;
  margin-left: 48rpx;
  flex-wrap: wrap;

  .tag-style {
    font-size: 26rpx;
    font-weight: 400;
    color: #fff;
    border-radius: 10rpx;
    padding: 4rpx 16rpx;
    margin-right: 10rpx;
    margin-bottom: 24rpx;
    background: rgba(255, 255, 255, 0.3);
    white-space: nowrap;
  }
}
.detail-contentbox {
  width: 100%;
  display: flex;
  align-items: flex-start;
  font-size: 26rpx;
  margin: 20rpx 0;
  .detail-content {
    width: 438rpx;
    white-space: wrap;
    color: #1f1f1f;
    word-break: break-all;
  }
  .detail-name {
    width: 170rpx;
    text-align: left;
    color: #9c9c9c;
  }
}
.icon-style {
  margin: 5rpx 10rpx 0 0;
}
.image-style {
  width: 34rpx;
  height: 34rpx;
  margin-right: 8rpx;
}
.image-style2 {
  width: 30rpx;
  height: 30rpx;
  margin-right: 6rpx;
  margin-top: 2rpx;
}
.share-style {
  margin: 6rpx 10rpx 0 0;
  transform: rotate(90deg);
}
.detail-mask {
  margin-top: -15%;
}
.empty-box {
  height: 30rpx;
}
</style>
