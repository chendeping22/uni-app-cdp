<template>
  <page class="h100">
    <view class="bg-white border-bottom border-line-default bold">
      <u-tabs-swiper
        class="curriculum-tabs-wrapper"
        :current="current"
        :font-size="32"
        active-color="#176bfb"
        inactive-color="#4e5969"
        :list="[{ name: '本班级老师' }, { name: '本年级其他班级老师' }]"
        :is-scroll="false"
        @change="handleTabChange"
      />
    </view>
    <view class="bg-white shadow-search flex-center ptb-s plr-l">
      <u-search
        v-model="keyword"
        bg-type="fill-default"
        border-color-type="fill-default"
        class="flex-stretch"
        shape="square"
        :focus="false"
        :show-action="false"
        placeholder="请输入姓名/手机号"
        @change="handleNameChange"
        @clear="keyword = ''"
      />
    </view>
    <view class="scroll-wrapper">
      <scroll-view scroll-y style="height: 100%; width: 100%" @scrolltolower="handleScrollToLower">
        <view class="plr-l">
          <view v-if="current === 0" class="tip-text">
            下方为当前节次空闲的老师，调课调换老师及课程
          </view>
          <view v-if="current === 1" class="tip-text">
            下方为当前节次空闲的老师，调课仅调换老师不调换课程
          </view>
          <view v-if="list.length > 0" class="list-wrapper">
            <template v-for="(item, index) in list" :key="item.userId">
              <view v-if="index > 0" class="list-divider" />
              <view class="list-item flex-center">
                <view class="flex-stretch scroll-hidden">
                  <view class="name-text mb-s">
                    {{ item.username }}
                  </view>
                  <view class="flex-center flex-left mb-xxs scroll-hidden">
                    <image class="icon-24 no-shrink mr-s" :src="iconBook" />
                    <view class="book-text flex-stretch text-ellipse">
                      {{ (item.subjects || []).map((i: any) => i.name).join('、') }}
                    </view>
                  </view>
                  <view class="flex-center flex-left scroll-hidden">
                    <image class="icon-24 no-shrink mr-s" :src="iconPhone" />
                    <view class="phone-text flex-stretch text-ellipse" @click="handlePhone(item)">
                      {{ item.mobile }}
                    </view>
                  </view>
                </view>
                <view class="select-button flex-center no-shrink ml-s" @click="handleSelect(item)">
                  和TA调课
                </view>
              </view>
            </template>
          </view>
        </view>
        <view v-if="total && total === list.length" class="no-more-tip">没有更多了~</view>
        <view
          v-if="!loading && !searching && list.length === 0"
          class="empty-wrapper flex-center scroll-hidden"
        >
          <u-empty-custom mode="search" class="color-base no-shrink" text="暂无数据" />
        </view>
        <view class="safe-area-inset-bottom"></view>
      </scroll-view>
    </view>
    <u-modal
      v-model="showCallPhone"
      :show-title="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <view>
        <view class="model-text">
          {{ phoneNumber }}
        </view>
        <view class="flex-between p-all-xl">
          <view class="model-cancel flex-center" @click="showCallPhone = false">取消</view>
          <view class="model-confirm flex-center" @click="handleCall">拨打</view>
        </view>
      </view>
    </u-modal>
  </page>
</template>

<script lang="ts" setup>
import { requestPhoneCallPer } from '@/services/permissionRequest';
import { log, showInfo } from '@/utils/tools';
import { getCurrentInstance, onMounted, ref, unref } from 'vue';
import { getCourseFreeTeachers } from '../services/curriculum-adjust';
import iconBook from '../static/course-info/book.svg';
import iconPhone from '../static/course-info/phone.svg';

const prevData = ref<any>();
const total = ref(0);
const pageNum = ref(0);
const current = ref(0);
const searching = ref<any>(-1);
const loading = ref(false);
const list = ref<any[]>([]);
const keyword = ref('');
const showCallPhone = ref(false);
const phoneNumber = ref('');

function fetchData(loadMore?: boolean) {
  if (!prevData.value) {
    return;
  }
  if (loadMore && total.value > 0 && total.value <= list.value.length) {
    return;
  }
  if (searching.value) {
    if (loadMore) {
      return;
    }
    clearTimeout(searching.value);
    searching.value = null;
  }

  searching.value = setTimeout(async () => {
    searching.value = null;
    const params: any = {
      cellId: prevData.value.sourceCourse.id,
      clazzDate: prevData.value.sourceCourse.clazzDate,
      pageSize: 10,
      type: current.value === 0 ? 1 : 2,
      keyword: (keyword.value || '').trim(),
    };
    if (loadMore) {
      params.pageNum = pageNum.value + 1;
    } else {
      params.pageNum = 1;
    }
    try {
      loading.value = true;
      const res: any = await getCourseFreeTeachers(params);
      loading.value = false;
      total.value = res?.total || 0;
      pageNum.value = params.pageNum;
      if (loadMore) {
        list.value = [...list.value, ...(res?.result || [])];
      } else {
        list.value = res?.result || [];
      }
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }, 200);
}

onMounted(() => {
  const instance: any = getCurrentInstance()?.proxy;
  if (instance) {
    const eventChannel = instance.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data: any) {
      prevData.value = data;
      console.log('acceptDataFromOpenerPage', data);
      fetchData();
    });
  }
});

async function handleScrollToLower() {
  fetchData(true);
}

function handleTabChange(index: any) {
  current.value = index;
  fetchData();
}

function handleNameChange(v: any) {
  keyword.value = v;
  fetchData();
}

function handleSelect(item: any) {
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-adjust/apply-3',
    success: function (res: any) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit(
        'acceptDataFromOpenerPage',
        unref({
          ...prevData.value,
          newTeacher: item,
        }),
      );
    },
  });
}
function handlePhone(item: any) {
  phoneNumber.value = item.mobile;
  showCallPhone.value = true;
}
function handleCall() {
  log('handlePhoneCall -> phone : ', phoneNumber.value);
  if (phoneNumber.value.includes('*')) {
    showInfo('您未开通查看用户隐私权限，不支持拨号!');
    return;
  }

  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    requestPhoneCallPer(
      res => {
        // 已有权限
        log('permissionRequestResult : ', res);
        uni.makePhoneCall({
          phoneNumber: phoneNumber.value,
          complete: () => {
            showCallPhone.value = false;
          },
        });
      },
      err => {
        // 无权限
        log('permissionRequestFail : ', err);
      },
    );
    return;
  }
  // #endif
  uni.makePhoneCall({
    phoneNumber: phoneNumber.value,
    complete: () => {
      showCallPhone.value = false;
    },
  });
}
</script>

<style lang="scss">
.curriculum-tabs-wrapper {
  :deep(.u-scroll-bar) {
    bottom: 0 !important;
  }
  :deep(.u-tabs-item) {
    font-weight: 500 !important;
  }
}
</style>

<style lang="scss" scoped>
.shadow-search {
  box-shadow: 0 4px 5px 0 rgb(24 25 68 / 5%);
  position: relative;
  z-index: 2;
}
.search-input {
  background-color: #f0f0f0;
}
.scroll-wrapper {
  height: calc(100% - 182rpx);
}
.list-wrapper {
  background: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  padding-left: 32rpx;
  border-radius: 16rpx;
}
.list-item {
  padding: 24rpx 32rpx 24rpx 0rpx;
}
.list-divider {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.select-button {
  border-radius: 16rpx;
  height: 64rpx;
  line-height: 40rpx;
  text-align: center;
  width: 144rpx;
  color: rgba(22, 119, 255, 1);
  font-size: 26rpx;
  font-weight: 500;
  border: 1px solid rgba(22, 119, 255, 1);
}
.tip-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(0, 0, 0, 0.65);
  padding: 36rpx 0 16rpx 0;
}
.empty-wrapper {
  height: calc(100% - 84rpx);
}
.no-more-tip {
  text-align: center;
  font-size: $ui-font-size-content;
  color: $ui-color-secondary;
  padding: $ui-gap-default 0;
}
.name-text {
  font-size: 32rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.book-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(0, 0, 0, 0.45);
}
.phone-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(22, 119, 255, 1);
}
.model-text {
  padding: 64rpx 48rpx 0;
  text-align: center;
  font-weight: 500;
  font-size: 32rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.model-cancel {
  border: 1px solid rgba(0, 0, 0, 0.15);
  height: 80rpx;
  width: 250rpx;
  border-radius: 16rpx;
  color: rgba(0, 0, 0, 0.88);
}
.model-confirm {
  border: 1px solid rgba(22, 119, 255, 1);
  background-color: rgba(22, 119, 255, 1);
  height: 80rpx;
  width: 250rpx;
  color: #ffffff;
  border-radius: 16rpx;
  margin-left: 24rpx;
}
</style>
