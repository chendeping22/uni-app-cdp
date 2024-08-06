<template>
  <view class="steps">
    <view class="steps__row-container">
      <view v-for="(item, index) in options" :key="index" class="steps__row-line-item">
        <view
          class="steps__row-line steps__row-line--before"
          :style="{
            backgroundColor:
              index <= active && index !== 0
                ? activeColor
                : index === 0
                ? 'transparent'
                : deactiveColor,
          }"
        >
        </view>
        <view v-if="index < active" class="steps__row-circle steps__row-check">
          <image :src="activeIconSrc"></image>
        </view>
        <view
          v-else
          class="steps__font steps__row-circle"
          :style="{
            backgroundColor: index === active ? activeColor : deactiveColor,
            color: index === active ? activeFontColor : deactiveFontColor,
          }"
          >{{ index + 1 }}</view
        >
        <view
          class="steps__row-line steps__row-line--after"
          :style="{
            backgroundColor:
              index < active && index !== options.length - 1
                ? activeColor
                : index === options.length - 1
                ? 'transparent'
                : deactiveColor,
          }"
        >
        </view>
      </view>
    </view>
    <view class="steps__row">
      <view class="steps__row-text-container">
        <view v-for="(item, index) in options" :key="index" class="steps__row-text">
          <text
            :style="{ color: titleColors[index < active ? 0 : index === active ? 1 : 2] }"
            class="steps__row-title"
            >{{ item.title }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Steps',
  props: {
    activeColor: {
      // 激活状态颜色
      type: String,
      default: '#1677FF',
    },
    deactiveColor: {
      // 未激活状态颜色
      type: String,
      default: '#0000000f',
    },
    activeFontColor: {
      // 激活文字颜色
      type: String,
      default: '#ffffff',
    },
    deactiveFontColor: {
      // 未激活文字颜色
      type: String,
      default: '#00000073',
    },
    active: {
      // 当前步骤
      type: Number,
      default: 0,
    },
    activeIconSrc: {
      // 当前步骤
      type: String,
      default: '/app-platform/static/login/icon_step_active.svg',
    },
    titleColors: {
      type: Array,
      default: () => ['#000000e0', '#1677FF', '#00000073'],
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    }, // 数据
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
$uni-border-color: #ededed;
.steps {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.steps__row {
  display: block;
  margin-top: 10rpx;
}

.steps__row-text-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin-bottom: 8rpx;
}

.steps__row-text {
  /* #ifndef APP-NVUE */
  display: inline-flex;
  /* #endif */
  flex: 1;
  flex-direction: column;
}

.steps__row-title {
  font-size: 30rpx;
  line-height: 40rpx;
  text-align: center;
}

.steps__row-container {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
}

.steps__row-line-item {
  /* #ifndef APP-NVUE */
  display: inline-flex;
  /* #endif */
  flex-direction: row;
  flex: 1;
  height: 14px;
  line-height: 14px;
  align-items: center;
  justify-content: center;
}

.steps__row-line {
  flex: 1;
  height: 1px;
  background-color: #b7bdc6;
}

.steps__row-line--after {
  transform: translateX(1px);
}

.steps__row-line--before {
  transform: translateX(-1px);
}

.steps__row-circle {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  border-radius: 50%;
  background-color: #e6f4ff;
  margin: 0px 3px;
}

.steps__font {
  font-size: 24rpx;
  text-align: center;
  color: white;
}

.steps__row-check {
  display: flex;
  align-items: center;
  justify-content: center;
  image {
    width: 18rpx;
  }
}
</style>
