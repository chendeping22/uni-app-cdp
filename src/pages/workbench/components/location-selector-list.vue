<template>
  <view class="tree-branch" :style="{ paddingLeft: !isRoot ? '32rpx' : '' }">
    <template v-for="(subItem, subIndex) in locations || []" :key="subItem.id">
      <view @click="$emit('selectIdentityAction', userType, subItem)">
        <view class="content">
          <view class="info">
            <view v-if="userType === 2" class="student">
              <u-image
                width="80"
                height="80"
                shape="circle"
                :src="subItem.childImage"
                error-icon="/static/avatar.png"
              ></u-image>
              <view class="student_info">
                <view class="student_info_title">
                  <text>{{ subItem.childName }}</text>
                  <u-icon
                    v-if="subItem.showRedDot"
                    :name="redDot"
                    size="32"
                    class="redDotIcon"
                  ></u-icon>
                </view>
                <view class="student_info_subTitle">
                  <!--#ifdef MP-WEIXIN || H5 -->
                  <rich-text
                    v-if="keyword && keyword.length > 0"
                    :nodes="subItem.clazzDesc + '/' + showSearchColor(subItem.name)"
                  ></rich-text>
                  <text v-else>{{ subItem.clazzDesc + '/' + subItem.name }}</text>
                  <!--#endif-->
                  <!--#ifdef APP-PLUS -->
                  <u-parse
                    v-if="keyword && keyword.length > 0"
                    :html="subItem.clazzDesc + '/' + showSearchColor(subItem.name)"
                  ></u-parse>
                  <text v-else>{{ subItem.clazzDesc + '/' + subItem.name }}</text>
                  <!--#endif-->
                </view>
              </view>
            </view>
            <view v-else class="school">
              <!--#ifdef MP-WEIXIN || H5 -->
              <rich-text
                v-if="keyword && keyword.length > 0"
                :nodes="showSearchColor(subItem.name)"
              ></rich-text>
              <text v-else>{{ subItem.name }}</text>
              <!--#endif-->
              <!--#ifdef APP-PLUS  -->
              <u-parse
                v-if="keyword && keyword.length > 0"
                :html="showSearchColor(subItem.name)"
              ></u-parse>
              <text v-else>{{ subItem.name }}</text>
              <!--#endif-->
              <u-icon
                v-if="subItem.showRedDot"
                :name="redDot"
                size="32"
                class="redDotIcon"
              ></u-icon>
            </view>
          </view>
          <u-icon
            v-if="subItem.isRecentlyLogin"
            label=""
            size="30"
            :color="primaryColor"
            :name="isShowPreLogin ? '' : 'checkmark'"
            :custom-style="{ width: isShowPreLogin ? '125rpx' : '30rpx' }"
          ></u-icon>
        </view>
        <view
          v-if="isShowLastLine || !isLastGroup || locations.length - 1 !== subIndex"
          class="u-m-l-32 line"
        ></view>
      </view>
      <location-selector-list
        v-if="subItem.children.length > 0"
        :locations="subItem.children"
        :user-type="userType"
        :is-root="false"
        :is-show-last-line="isShowLastLine"
        :is-last-group="isLastGroup"
        :is-show-pre-login="isShowPreLogin"
        :keyword="keyword"
        @selectIdentityAction="(type, item) => $emit('selectIdentityAction', type, item)"
      ></location-selector-list>
    </template>
  </view>
</template>

<script lang="ts" setup>
import redDot from '@/static/workbench/workbench_red_dot.svg';
import type { IOrganizationInfo } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
// #ifdef MP-WEIXIN
import locationSelectorList from './location-selector-list.vue';
// #endif

/** 1. props定义 */
interface IProps {
  locations: IOrganizationInfo[];
  userType: number;
  isRoot: boolean;
  isShowLastLine: boolean;
  isLastGroup: boolean;
  isShowPreLogin: boolean;
  keyword: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['selectIdentityAction']);

const primaryColor = getPrimaryColor();

const showSearchColor = (text: string) => {
  try {
    const reg = RegExp(props.keyword, 'ig');
    const modifiedText = text.replace(
      reg,
      match => `<span style="color: ${primaryColor}">${match}</span>`,
    );
    return modifiedText;
  } catch (e) {
    return text;
  }
};
</script>

<style scoped lang="scss">
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 32rpx;
  font-size: 28rpx;
  line-height: 54rpx;
  color: $u-content-color;
  .info {
    flex: 1;

    .student {
      display: flex;
      align-items: center;
      .student_info {
        flex: 1;
        margin-left: 32rpx;
        overflow: hidden;
        .student_info_title {
          color: #000000e0;
          font-size: 34rpx;
        }

        .student_info_subTitle {
          color: #00000073;
          font-size: 26rpx;
        }
      }
    }

    .school {
      color: #000000e0;
      font-size: 34rpx;
      display: flex;
      align-items: center;
    }
  }
}

.redDotIcon {
  position: relative;
  left: -15rpx;
  top: -10rpx;
  width: 32rpx;
  height: 32rpx;
}

.line {
  background-color: $u-border-color;
  height: 1rpx;
}
</style>
