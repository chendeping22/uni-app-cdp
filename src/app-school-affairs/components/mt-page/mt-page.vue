<template>
  <c-page
    :class-name="[className]"
    :title="title"
    :add-top-gap="showTopGap"
    :add-bottom-gap="showBottomGap"
    :top-gap-type="topGapType"
    :bg-type="(themes[theme].bgType as any)"
    :navbar-bg-type="themes[theme].navbarBgType"
    :icon-color="themes[theme].iconColor"
    :icon-size="iconSize"
    :title-color-type="themes[theme].titleColorType"
    :home-path="homePath"
    :home-pages="homePages"
    :show-nav-bar="showNavBar"
    :auto-show-left-icon="autoShowLeftIcon"
    :page-loading-status="pageLoadingStatus"
  >
    <template #navbarLeft><slot name="navbarLeft" /></template>
    <template #navbarRight><slot name="navbarRight" /></template>
    <template #loading>
      <slot name="loading">
        <view>请稍候...</view>
      </slot>
    </template>
    <template #loading_error> <slot name="loading_error" /></template>
    <slot />
    <imp-top v-if="showNoticeBar" :show-nav-bar="showNavBar" bg-type="white" />
    <!--#ifdef APP-PLUS-->
    <console />
    <imp-messages-cover></imp-messages-cover>
    <!--#endif-->
  </c-page>
</template>
<script lang="ts">
import { getHomeConf } from '@/app-school-affairs/utils/env';
import { eColor } from '@/app-school-affairs/utils/ui-enums';
import { PropType, defineComponent, onBeforeMount, provide, ref } from 'vue';
export default defineComponent({
  props: {
    className: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    theme: {
      type: String as PropType<'default' | 'login' | 'white' | 'gray' | 'lightGray' | 'base'>,
      default: 'default',
    },
    pageLoadingStatus: {
      type: Number as PropType<0 | 1 | 2>,
      default: 1,
    },
    iconSize: {
      type: Number,
      default: 48,
    },
    showTopGap: {
      type: Boolean,
      default: true,
    },
    showBottomGap: {
      type: Boolean,
      default: true,
    },
    topGapType: {
      type: String as PropType<IGap>,
      default: 'b',
    },
    showNavBar: {
      type: Boolean,
      default: true,
    },
    autoShowLeftIcon: {
      type: Boolean,
      default: true,
    },
    showNoticeBar: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const homePath = getHomeConf().homeMainPath;
    const homePages = getHomeConf().homeRoutes;

    const topHeightChangeCount = ref(0);

    let currentPageIndex = 0;
    onBeforeMount(() => {
      currentPageIndex = getCurrentPages().length;
    });

    const updateTopHeightChangeCount = () => {
      topHeightChangeCount.value++;
    };

    provide('topHeightChangeCount', {
      topHeightChangeCount,
      updateTopHeightChangeCount,
    });

    // 有其它背景色的在page.scss中定义
    const themes = {
      // 默认nav白色, bg灰色
      default: {
        bgType: eColor['fill-default'],
        navbarBgType: eColor.white,
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      // 登录页, 带渐变
      login: {
        bgType: 'login',
        navbarBgType: eColor.transparent,
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      // 全白
      white: {
        bgType: eColor.white,
        navbarBgType: eColor.white,
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      // 全灰
      gray: {
        bgType: eColor['fill-default'],
        navbarBgType: eColor['fill-default'],
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      // 物联校园主题
      iot: {
        bgType: eColor['fill-default'],
        navbarBgType: 'iot', // 有渐变背景
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      // nav蓝色, bg灰色
      primaryGray: {
        bgType: eColor['fill-default'],
        navbarBgType: eColor.primary,
        iconColor: eColor.white,
        titleColorType: eColor.white,
      },
      lightGray: {
        bgType: eColor['fill-light'],
        navbarBgType: eColor.white,
        iconColor: eColor.base,
        titleColorType: eColor.base,
      },
      base: {
        bgType: eColor.base,
        navbarBgType: eColor.base,
        iconColor: eColor.white,
        titleColorType: eColor.white,
      },
      primary: {
        bgType: eColor.primary,
        navbarBgType: eColor.primary,
        iconColor: eColor.white,
        titleColorType: eColor.white,
      },
    };
    return {
      homePath,
      homePages,
      themes,
    };
  },
});
</script>
<style lang="scss"></style>
