<template>
  <u-popup
    v-model="showPopup"
    @close="handleClose"
    mode="bottom"
    height="80%"
    closeable
    @open="handleOpenPopup"
  >
    <view class="page">
      <view class="title">扫码结果</view>
      <view class="result_list">
        <view v-for="item in list" :key="item" class="result_li">
          {{ item }}
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
import { ref } from 'vue';

let webView = null; // webview容器
let barcode = null; // 扫码框
let timer = null;

const list = ref([]); // 扫码结果 - 列表
const showPopup = ref(false);

// 扫码成功回调
function onmarked(type, result) {
  // 【步骤4】将扫码结果添加到 list 里
  list.value.push(result);

  // 【步骤5】1秒后再重新开启扫码
  timer = null;
  timer = setTimeout(() => {
    barcode.start();
  }, 1000);
}

// 创建窗口和扫码控件
function createBarcode() {
  console.log('🚀 ~ createBarcode ~ {:', webView);
  // 【步骤1】判断有没有创建过 webview 容器，如果没有就执行创建操作
  if (!webView) {
    webView = plus.webview.open('', 'barCodeBox', {
      top: '35%',
      left: '32rpx',
      right: '32rpx',
      width: '100%',
      height: '200px',
      border: '1px solid red',
    });
  } else {
    plus.webview.show('barCodeBox');
  }

  // 【步骤2】判断有没有创建过 扫码框，如果没有就执行创建操作
  if (!barcode) {
    barcode = plus.barcode.create(
      'barcode',
      [plus.barcode.QR], // 只扫二维码
      {
        // top: '0px',
        // left: '0px',
        width: 'calc(100% - 64rpx)',
        height: '200px',
        // position: 'static',
        position: 'relative',
        padding: '32rpx',
        scanbarColor: '#f1c01f',
        frameColor: '#c0ff01',
      },
    );

    barcode.onmarked = onmarked; // 扫码结果回调函数

    // 【步骤3】将扫码框添加到 webview 里
    plus.webview.getWebviewById('barCodeBox').append(barcode);
  }

  barcode.start(); // 开始扫码
}

// 在页面加载时，延迟300毫秒执行创建扫码框函数
// onReady(() => {
//   setTimeout(() => {
//     createBarcode();
//   }, 300);
// });

const handleClose = () => {
  console.log('🚀 ~ handleClose ~ {:');
  // plus.webview.getWebviewById('barCodeBox').close();
  plus.webview.hide('barCodeBox');
  timer = null;
  timer = setTimeout(() => {
    showPopup.value = false;
  }, 1200);
};

const handleOpenPopup = () => {
  console.log('🚀 ~ handleOpenPopup ~ {:');
  showPopup.value = true;
  timer = null;
  timer = setTimeout(() => {
    createBarcode();
  }, 100);
};

// onUnload(() => {
//   handleClose();
// });

defineExpose({
  handleOpenPopup,
});
</script>

<style>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 260px 20rpx 0;
}

.title {
  font-size: 50rpx;
  color: #333;
}

.result_list {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
  padding-top: 20rpx;
}

.result_li {
  box-sizing: border-box;
  margin-bottom: 20rpx;
  padding: 10rpx 20rpx;
  border: 1px solid #7298c8;
  border-radius: 10rpx;
  font-size: 40rpx;
}
</style>
