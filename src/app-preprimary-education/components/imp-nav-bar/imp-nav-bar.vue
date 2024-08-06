<template>
  <view class="uni-navbar">
    <view
      :class="[
        'uni-navbar__content',
        `nav-bg-${bgType}`,
        {
          'uni-navbar--fixed': fixed,
          'uni-navbar--shadow': shadow,
          'uni-navbar--border': border,
        },
      ]"
      :style="backgroundColor ? { background: backgroundColor } : {}"
    >
      <imp-status-bar v-if="statusBar" />
      <view :style="{ color: color }" class="uni-navbar__header uni-navbar__content_view">
        <view
          class="uni-navbar__header-btns uni-navbar__header-btns-left uni-navbar__content_view"
          @tap="onClickLeft"
        >
          <view v-if="showHome" class="uni-navbar__content_view" @click.stop="handleClickHome">
            <uni-icons :color="color" type="home" size="24" />
          </view>
          <view
            v-if="(showGoback || backIcon) && !leftIcon.length"
            class="uni-navbar__content_view"
          >
            <uni-icons :color="color" type="arrowleft" size="24" />
          </view>
          <view v-if="leftIcon.length" class="uni-navbar__content_view">
            <uni-icons :color="color" :type="leftIcon" size="24" />
          </view>
          <view
            v-if="leftText.length"
            :class="{ 'uni-navbar-btn-icon-left': !leftIcon.length }"
            class="uni-navbar-btn-text uni-navbar__content_view"
          >
            <text :style="{ color: color, fontSize: '28rpx' }" class="uni-nav-bar-left-text">
              {{ leftText }}
            </text>
          </view>
          <slot name="left" />
        </view>
        <view
          class="uni-navbar__header-container uni-navbar__content_view text-ellipse"
          @tap="onClickTitle"
        >
          <view
            v-if="title.length"
            class="uni-navbar__header-container-inner uni-navbar__content_view text-ellipse"
          >
            <text class="uni-nav-bar-text text-ellipse" :style="{ color: color }">{{ title }}</text>
          </view>
          <!-- 标题插槽 -->
          <slot />
        </view>
        <view
          :class="title.length ? 'uni-navbar__header-btns-right' : ''"
          class="uni-navbar__header-btns uni-navbar__content_view"
          @tap="onClickRight"
        >
          <view v-if="rightIcon.length" class="uni-navbar__content_view">
            <uni-icons :color="color" :type="rightIcon" size="24" />
          </view>
          <!-- 优先显示图标 -->
          <view
            v-if="rightText.length && !rightIcon.length"
            class="uni-navbar-btn-text uni-navbar__content_view"
          >
            <text class="uni-nav-bar-right-text">{{ rightText }}</text>
          </view>
          <slot name="right" />
        </view>
      </view>
    </view>
    <view v-if="fixed" class="uni-navbar__placeholder">
      <imp-status-bar v-if="statusBar" />
      <view class="uni-navbar__placeholder-view" />
    </view>
  </view>
</template>

<script>
import ImpStatusBar from './imp-status-bar.vue';

/**
 * NavBar 自定义导航栏
 * @description 导航栏组件，主要用于头部导航
 * @tutorial https://ext.dcloud.net.cn/plugin?id=52
 * @property {String} title 标题文字
 * @property {String} leftText 左侧按钮文本
 * @property {String} rightText 右侧按钮文本
 * @property {String} leftIcon 左侧按钮图标（图标类型参考 [Icon 图标](http://ext.dcloud.net.cn/plugin?id=28) type 属性）
 * @property {String} rightIcon 右侧按钮图标（图标类型参考 [Icon 图标](http://ext.dcloud.net.cn/plugin?id=28) type 属性）
 * @property {String} color 图标和文字颜色
 * @property {String} bgType 导航栏背景类型, 由page默认传入, 不需要自定义
 * @property {String} backgroundColor 导航栏背景颜色
 * @property {Boolean} fixed = [true|false] 是否固定顶部
 * @property {Boolean} statusBar = [true|false] 是否包含状态栏
 * @property {Boolean} shadow = [true|false] 导航栏下是否有阴影
 * @property {Boolean} showGoback = [true|false] 返回上级的图标及事件展示
 * @property {Boolean} backIcon = [true|false] 只展示返回上一级的图标
 * @event {Function} clickLeft 左侧按钮点击时触发
 * @event {Function} clickRight 右侧按钮点击时触发
 * @event {Function} clickTitle 中间标题点击时触发
 */
export default {
  name: 'UniNavBar',
  components: {
    ImpStatusBar,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    leftText: {
      type: String,
      default: '',
    },
    rightText: {
      type: String,
      default: '',
    },
    leftIcon: {
      type: String,
      default: '',
    },
    rightIcon: {
      type: String,
      default: '',
    },
    fixed: {
      type: [Boolean, String],
      default: false,
    },
    color: {
      type: String,
      default: '#1d2129',
    },
    bgType: {
      type: String,
      default: 'gradient',
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    statusBar: {
      type: [Boolean, String],
      default: true,
    },
    shadow: {
      type: [Boolean, String],
      default: false,
    },
    border: {
      type: [Boolean, String],
      default: false,
    },
    // 只展示返回的图标
    backIcon: {
      type: Boolean,
      default: false,
    },
    // 不展示返回图标
    autoBack: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['clickLeft', 'clickRight', 'clickTitle'],
  data() {
    return {
      showGoback: false,
      showHome: false,
    };
  },
  mounted() {
    const pages = getCurrentPages();
    const curPage = pages[pages.length - 1];

    if (this.autoBack) {
      // #ifdef MP-WEIXIN || H5
      if (
        pages.length > 2 ||
        (pages.length === 2 && pages[pages.length - 2].route !== 'pages/welcome/welcome-wx')
      ) {
        this.showGoback = true;
      } else {
        // 路由数为1且非四大首页, 则显示home按钮
        if (
          ![
            'pages/welcome/welcome-wx',
            'app-platform/login/index',
            'pages/workbench/index',
            'pages/contacts/index',
            'pages/message/index',
            'pages/mine/index',
          ].includes(curPage.route)
        ) {
          this.showHome = true;
        }
      }
      // #endif

      // #ifdef APP-PLUS
      // 当页面数>1, 且当前页面不为四大首页或强制更新页面时, 显示返回箭头
      if (
        pages.length > 1 &&
        ![
          'app-platform/login/index',
          'pages/workbench/index',
          'pages/contacts/index',
          'pages/message/index',
          'pages/mine/index',
        ].includes(curPage.route)
      ) {
        this.showGoback = true;
      }
      // #endif
    }

    if (uni.report && this.title !== '') {
      uni.report('title', this.title);
    }
  },
  methods: {
    onClickLeft() {
      if (this.autoBack) {
        uni.navigateBack();
      }
      this.$emit('clickLeft');
    },
    handleClickHome() {
      uni.reLaunch({
        url: `/pages/workbench/index`,
      });
    },
    onClickRight() {
      this.$emit('clickRight');
    },
    onClickTitle() {
      this.$emit('clickTitle');
    },
  },
};
</script>

<style lang="scss" scoped>
$nav-height: 88rpx;
.uni-nav-bar-text {
  font-size: $ui-font-size-xt;
  font-weight: 600;
  /* #ifndef APP-PLUS || H5 */
  font-size: $uni-font-size-lg;
  /* #endif */
}

.uni-nav-bar-left-text {
  margin-left: $ui-gap-default;
}

.uni-nav-bar-right-text {
  font-size: $uni-font-size-base;
}

.uni-navbar__content {
  position: relative;
  overflow: hidden;
}
.nav-bg {
  &-white {
    background: $ui-color-white;
  }
  &-primary {
    background: $ui-color-primary;
  }
  &-gray {
    background: $ui-color-fill-default;
  }
  &-gradient {
    // background: url(/static/image/icon_bg.jpg);
    background: #fff;
  }
  &-blue {
    background: $ui-color-primary;
  }
  &-welcome {
    background: $ui-color-blue;
  }
  &-clock-in {
    background: $ui-color-white;
  }
  &-normal {
    background: $ui-color-white;
  }
}

.uni-navbar__content_view {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  align-items: center;
  flex-direction: row;
  // background-color: $ui-color-white;
}

.uni-navbar__header {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  height: $nav-height;
  line-height: $nav-height;
  font-size: $ui-font-size-xt;
}

.uni-navbar__header-btns {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-wrap: nowrap;
  width: 120rpx;
  padding: 0 $ui-gap-xxs;
  justify-content: center;
  align-items: center;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

.uni-navbar__header-btns-left {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  width: 180rpx;
  justify-content: flex-start;
}

.uni-navbar__header-btns-right {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  width: 150rpx;
  padding-right: $ui-gap-large;
  justify-content: flex-end;
}

.uni-navbar__header-container {
  flex: 1;
}

.uni-navbar__header-container-inner {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex: 1;
  align-items: center;
  justify-content: center;
  font-size: $uni-font-size-base;
}

.uni-navbar__placeholder-view {
  height: $nav-height;
}

.uni-navbar--fixed {
  position: fixed;
  z-index: 998;
  /* #ifdef H5 */
  left: var(--window-left);
  right: var(--window-right);
  /* #endif */
  /* #ifndef H5 */
  left: 0;
  right: 0;
  /* #endif */
}

.uni-navbar--shadow {
  /* #ifndef APP-NVUE */
  box-shadow: 0 1rpx $ui-gap-xxs #ccc;
  /* #endif */
}

.uni-navbar--border {
  border-bottom-width: 1rpx;
  border-bottom-style: solid;
  border-bottom-color: $uni-border-color;
}
</style>
