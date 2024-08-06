<template>
  <page custom-overflow="scroll">
    <view class="notice-warp">
      <view class="select-people">
        <text class="head-title">通知人员</text>
        <!-- <view v-if="!(formData.applyUserName?.length > 0)" class="sent-users">
          <view class="empty-item1">请选择</view>
          <view @click="handleSelectPersons">
            <u-icon
              name="arrow-right"
              :size="40"
              style="margin-left: 40rpx"
              color="rgb(0, 0, 0,0.65)"
            ></u-icon>
          </view>
        </view> -->
        <view class="sent-users" :class="{ vcenter: !(formData.applyUserName?.length > 0) }">
          <view
            class="empty-item1"
            v-if="!(formData.applyUserName?.length > 0)"
            @click="handleSelectPersons"
            >请选择</view
          >
          <view class="sentlist" v-else>
            <view class="sent-item" v-for="item in formData.applyUserName">
              <text style="margin-right: 16rpx">{{ item.name }}</text>
              <u-icon
                name="close"
                :size="32"
                style="margin-left: 10rpx"
                color="#000000a6"
                @click="handleRemove(item.id)"
              ></u-icon>
            </view>
          </view>
          <view @click="handleSelectPersons">
            <u-icon
              name="arrow-right"
              :size="32"
              :style="{ marginLeft: !(formData.applyUserName?.length > 0) ? '8rpx' : '40rpx' }"
              color="rgb(0, 0, 0,0.65)"
            ></u-icon>
          </view>

          <!-- <u-field
            v-model="formData.applyUserName"
            label=""
            placeholder="请选择"
            :right-icon="'arrow-right'"
            :clearable="false"
            disabled
            input-align="right"
            :border-bottom="false"
            @click="handleSelectPersons"
          >
          </u-field
        > -->
        </view>
      </view>
      <view class="desc-block">
        <view class="head-title1">通知说明</view>
        <view>
          <textarea
            v-model="formData.content"
            class="textarea-input"
            placeholder="请相关老师仔细阅读批次要求，根据情况选择申报。"
            :maxlength="100"
            :placeholder-style="{ fontSize: '16px', color: '#00000073' }"
          ></textarea>
        </view>
      </view>
    </view>

    <view class="notice-bottom safe-area-inset-bottom">
      <view style="width: 50%"
        ><u-button type="primary" plain @click="handleCancel">取消</u-button></view
      >
      <view style="width: 24rpx"></view>
      <view style="width: 50%"
        ><u-button type="primary" @click="handleConfirm">确定</u-button></view
      >
    </view>
  </page>
</template>

<script setup lang="ts">
import { forward } from '@/app-teacher-personnel/topic/api/topicBatch';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const id = ref('');
const formData = ref({
  applyUserName: [],
});

const handleSelectPersons = () => {
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: true,
    value: formData.value.userIds,
    callback: (value, data) => {
      formData.value.userIds = value || '';
      formData.value.applyUserName = data?.map(i => ({ name: i.name, id: i.id }));
    },
  });
};

function handleRemove(_id) {
  formData.value.userIds = formData.value?.userIds?.filter?.(i => i != _id);
  formData.value.applyUserName = formData.value?.applyUserName?.filter?.(i => i.id != _id);
}
function handleCancel() {
  uni.navigateBack();
}
//提交
const handleConfirm = () => {
  if (!(formData.value.userIds?.length > 0)) {
    uni.showToast({
      title: '请选择通知人员',
      icon: 'none',
    });
    return;
  }
  //通知
  forward(id.value, formData.value)
    .then(() => {
      uni.showToast({
        title: '通知成功',
        icon: 'success',
      });
      uni.navigateBack();
    })
    .catch((res: any) => {
      uni.showToast({
        title: res?.desc || '通知失败',
        icon: 'none',
        mask: false,
        duration: 3000,
      });
    });
};

onLoad(options => {
  if (options.id) {
    id.value = options.id;
  }
});
</script>

<style scoped lang="scss">
.notice-warp {
  padding: px2rpx(12px) px2rpx(16px);

  .select-people {
    background-color: #fff;
    border-radius: px2rpx(8px);
    box-shadow: 0 1px 2px 0 #0000000a;
    padding: px2rpx(16px);
    .head-title {
      @include subheadline-regular;
    }
    .sent-users {
      display: flex;
      padding: 0 px2rpx(2);
      margin-top: px2rpx(8);
      &.vcenter {
        align-items: center;
      }
      .empty-item1 {
        flex: 1;
        text-align: right;
        @include body-regular;
        color: rgba($color-text-base, 0.45);
      }
      .sentlist {
        flex: 1;
        max-height: px2rpx(102);
        overflow: auto;
        &::-webkit-scrollbar {
          display: none;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        .sent-item {
          display: inline-flex;
          align-items: center;
          @include footnote-regular;
          color: rgba($color-text-base, 0.65);
          margin-right: px2rpx(10);
          margin-bottom: px2rpx(10);
          background: #0000000a;
          border-radius: px2rpx(4);
          padding: px2rpx(3) px2rpx(8);
        }
      }
    }
  }

  .desc-block {
    margin-top: 24rpx;
    margin-bottom: px2rpx(80);
    background-color: #fff;
    border-radius: px2rpx(8px);
    box-shadow: 0 1px 2px 0 #0000000a;
    padding: px2rpx(12px) px2rpx(16px);
    .head-title1 {
      @include subheadline-regular;
      margin-bottom: px2rpx(8px);
    }
    .textarea-input {
      height: px2rpx(110);
    }
  }
}
.notice-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: px2rpx(64px);
  padding: 0 px2rpx(16px);
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
}
</style>
