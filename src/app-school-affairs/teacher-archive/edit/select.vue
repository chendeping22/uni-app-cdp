<template>
  <view class="teacher-archive-select">
    <view class="select-body">
      <view class="select-block">
        <view class="select-list">
          <view v-for="item in list" :key="item.name" class="select-list-one">
            <view class="left">
              <u-checkbox
                v-model="item.checked"
                shape="circle"
                :name="item.name"
                :size="48"
                :icon-size="24"
              ></u-checkbox>
            </view>
            <view class="right"> {{ item.label }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="select-bottom">
      <view class="button-area">
        <u-button type="primary" style="height: 80rpx" @click="confirm">保存</u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { filter, map } from 'lodash-es';
import { getCurrentInstance, onMounted, ref } from 'vue';

const instance = getCurrentInstance().proxy;
const eventChannel = instance.getOpenerEventChannel();

// import { PropType, getCurrentInstance, onMounted, ref, watch } from 'vue';

// onLoad(options => {
//   console.log('🚀ccc ~ options:', options);
//   eventChannel.on('acceptDataFromOpenerPage', function(data) {
//     console.log(data)
//   })
// });

const options = ref([]);
const list = ref([]);

const selectedList = ref<string[]>([]);

function confirm() {
  console.log('🚀ccc ~ list.value', list.value);

  eventChannel.emit('dataToParent', {
    data: map(
      filter(list.value, one => one.checked),
      t => t.name,
    ),
  });
  uni.navigateBack();
}

function checkboxGroupChange() {}
function checkboxChange(e) {
  // console.log('🚀ccc ~ e:', e);
  // if (e.value) {
  //   selectedList.value.push(e.name);
  // } else {
  //   selectedList.value = selectedList.value.filter(one => one !== e.name);
  // }
}

onMounted(() => {
  // eventChannel.emit('acceptDataFromOpenedPage', {
  //   data: 'data from test page'
  // });

  // eventChannel.emit('someEvent', {
  //   data: 'data from test page for someEvent'
  // });

  eventChannel.on('dataToChild', function (_data) {
    console.log('ccc dataToChild ', _data);

    const { data, title, options: _options } = _data;
    list.value = _options?.map(one => {
      return {
        name: one.value,
        checked: !!data?.includes(one.value),
        label: one.label,
      };
    });
    // options.value = _options;
    uni.setNavigationBarTitle({
      title,
    });
  });
});
</script>

<style scoped lang="scss">
.teacher-archive-select {
  $bodyPaddingBottom: 80rpx + 48rpx + 24rpx;
  .select-body {
    padding: 24rpx 32rpx;
    overflow: hidden;
    padding-bottom: $bodyPaddingBottom;
    padding-bottom: calc(constant(safe-area-inset-bottom) + $bodyPaddingBottom);
    padding-bottom: calc(env(safe-area-inset-bottom) + $bodyPaddingBottom);
    .select-block {
      border-radius: 16rpx;
      background-color: #fff;
    }
    .select-list {
      padding: 0 32rpx;
      .select-list-one {
        padding: 24rpx 0;
        min-height: 96rpx;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
        .left {
          float: none;
          margin-right: 32rpx;
        }
        .right {
          flex: 1;
        }
        :deep(.u-checkbox__label) {
          display: none;
        }
      }
    }
  }
  .select-bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    .button-area {
      padding: 24rpx 32rpx;
    }
  }
}
</style>
