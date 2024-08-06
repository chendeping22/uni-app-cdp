<template>
  <c-refresh-scroll
    ref="refreshScrollRef"
    :fetch-data-func="fetchDataFunc"
    :empty-line="100"
    :page-size="20"
    :auto-mount="true"
  >
    <!-- 头部搜索 -->
    <template #top_area>
      <view class="bg-white">
        <view style="padding: 0rpx 20rpx 20rpx 20rpx">
          <u-search
            v-model="name"
            placeholder="搜索：姓名/姓名首拼/手机"
            height="72"
            :show-action="false"
            bg-color="#f0f2f6"
            shape="square"
            @change="search"
          >
          </u-search>
        </view>
      </view>
    </template>
    <view class="contact-list-content">
      <view v-if="tasks && tasks.length">
        <view
          v-for="(item, index) in tasks"
          :key="index"
          class="contact-list-item"
          style="height: 128rpx"
          @click="toDetail(item.id)"
        >
          <image
            class="icon-head"
            :src="item.headImageUrl ? item.headImageUrl : icon_avatar"
            mode="aspectFill"
          />
          <view class="contact-list-item-title-head-content">
            <view class="contact-list-item-title-center-content">
              <text class="contact-list-item-title-head">{{
                item.name && item.name.length > userNameMaxLength
                  ? item.name.substring(0, userNameMaxLength) + '...'
                  : item.name
              }}</text>
              <image
                v-if="item.gender"
                class="icon-sex-size"
                :src="item.gender == 1 ? icon_sex_man : icon_sex_female"
              />
            </view>
            <view v-if="!isNil(item.position)">
              <text class="contact-list-item-title-content">{{
                item.position && item.position.length > 18
                  ? item.position.substring(0, 18) + '...'
                  : item.position
              }}</text>
            </view>
          </view>
          <view @click.stop="handlePhoneCall(item.tel)">
            <u-icon
              v-if="item.tel && !isNil(item.tel)"
              class="phone-wrap"
              name="phone-fill"
              color="#176bfb"
              size="32"
            />
          </view>
        </view>
      </view>
      <view v-else style="padding: 32rpx">
        <u-empty text="暂无数据" mode="list"></u-empty>
      </view>
    </view>
  </c-refresh-scroll>
</template>

<script lang="ts" setup>
import { commonUser } from '@/services/contact';
import { requestPhoneCallPer } from '@/services/permissionRequest';
import icon_avatar from '@/static/avatar.png';
import { isNil } from '@/utils/lodash-es';
import { log, showInfo } from '@/utils/tools';
import { onShow } from '@dcloudio/uni-app';
import { nextTick, ref } from 'vue';
import icon_sex_female from '/static/icon_sex_female.svg';
import icon_sex_man from '/static/icon_sex_man.svg';
const name = ref('');
const tasks = ref<any>([]);
const refreshScrollRef = ref();
const userNameMaxLength = 11;

const search = () => {
  refreshScrollRef.value.initData();
};
const fetchDataFunc = async (pager: any, type: string) => {
  type === 'new' && (tasks.value = null);
  uni.showLoading({
    title: '加载中',
  });
  let res: any;
  const { pageSize, pageNum } = pager;
  const data = {
    pageNum,
    pageSize,
    ...{
      keyword: name.value,
    },
  };
  res = await commonUser(data);

  uni.hideLoading();
  nextTick(() => {
    if (!tasks.value) {
      tasks.value = [];
    }
    tasks.value.push(...res.result);
  });
  return res;
};
const toDetail = (id: string) => {
  uni.navigateTo({
    url: `/app-platform/contacts/staff-detail/index?id=${id}`,
  });
};
onShow(() => {
  if (refreshScrollRef.value) {
    refreshScrollRef.value.initData();
  }
});

const handlePhoneCall = (phone: string) => {
  if (phone.includes('*')) {
    showInfo('您未开通查看用户隐私权限，不支持拨号!');
    return;
  }

  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestPhoneCallPer(
      res => {
        // 已有权限
        log('permissionRequestResult : ', res);
        uni.makePhoneCall({
          phoneNumber: phone,
        });
      },
      err => {
        // 无权限
        log('permissionRequestFail : ', err);
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    uni.makePhoneCall({
      phoneNumber: phone,
    });
  }
};
</script>

<style scoped lang="scss">
.input-content {
  // height: 100%;
  position: relative;
  .search-content {
    position: fixed;
    top: 84rpx;
    z-index: 2;
    width: 100%;
    padding: 0rpx 32rpx 16rpx 32rpx;
    background-color: white;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  }
}
.scroller-content {
  // flex: 1;
  overflow: scroll;
}

.icon-sex-size {
  width: 40rpx;
  height: 40rpx;
  margin-left: 16rpx;
}

.contact-list-content {
  border-radius: 16rpx;
  margin: 20rpx 32rpx;
  background-color: white;
  padding: 0 32rpx;
  .contact-list-item {
    padding: 24rpx 0;
    height: 96rpx;
    display: flex;
    align-items: center;

    .icon-organization {
      width: 48rpx;
      height: 48rpx;
    }

    .icon-head {
      width: 80rpx;
      height: 80rpx;
      will-change: transform;
      border-radius: 50%;
    }

    .contact-list-item-title {
      flex: 1;
      color: #000000e0;
      /* IOS/Body/Regular */
      font-family: PingFang SC;
      font-size: 32rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx; /* 141.176% */
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .contact-list-item-title-head-content {
      display: flex;
      flex-direction: column;
      margin-left: 32rpx;
      margin-right: 32rpx;
      flex: 1;

      .contact-list-item-title-center-content {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .contact-list-item-title-head {
        color: #000000e0;
        /* IOS/Body/Regular */
        font-family: PingFang SC;
        font-size: 32rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 48rpx; /* 141.176% */
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 350rpx;
      }

      .contact-list-item-title-content {
        display: inline-block;
        color: #1677ff;
        /* IOS/Caption2/Regular */
        font-family: PingFang SC;
        font-size: 22rpx;
        font-style: normal;
        font-weight: 400;
        margin-top: 10rpx;
        padding: 4rpx 8rpx;
        border-radius: 8rpx;
        background-color: #e6f4ff;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: calc(25vw);
      }

      .contact-list-item-title-content-dept {
        padding-right: 8rpx;
        color: #00000073;
        font-family: PingFang SC;
        font-size: 26rpx;
        font-style: normal;
        font-weight: 400;
        margin-top: 5rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: calc(25vw);
      }
    }

    .contact-list-item-right {
      color: #00000073;
      /* IOS/Body/Regular */
      font-family: PingFang SC;
      font-size: 34rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx; /* 141.176% */
      margin-right: 16rpx;
    }
    .phone-wrap {
      padding: 16rpx;
      border-radius: 16rpx;
      border: 1px solid var(--global-basic-color-border, #1677ff);
    }
  }
}

.bg-white {
  background: #fff;
}
</style>
