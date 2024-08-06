<template>
  <view class="zy-margin-top-sm">
    <view class="user-card zy-shadow">
      <image
        v-if="studentInfo.gender == '男'"
        class="user-avatar"
        src="../../../assets/image/avatar_boy.png"
        mode=""
      ></image>
      <image v-else class="user-avatar" src="../../../assets/image/avatar_girl.png" mode=""></image>
      <view class="">
        <view class="">
          {{ studentInfo.studentName }}
          <zy-icons
            v-if="studentInfo.gender == '男'"
            color="#176BFB"
            type="man"
            :size="32"
          ></zy-icons>
          <zy-icons v-else color="#F53F3F" type="women" :size="32"></zy-icons>
        </view>
        <view class="text-size24 text-color5">
          {{ studentInfo.clazzName }}
        </view>
      </view>
    </view>
    <block v-if="pageData.isForm">
      <view class="form-card zy-shadow">
        <view class="zy-padding-top zy-padding-bottom"> 戴镜类型 </view>
        <view class="zy-flex zy-flex-row-between zy-flex-wrap zy-padding-bottom-sm">
          <view
            v-for="(item, index) in pageData.glassesType"
            :key="index"
            :class="['glasses-type', { 'glasses-type--active': pageData.typeIndex == item.value }]"
            @click="typeChange(item)"
          >
            <text>{{ item.title }}</text>
            <image
              v-if="pageData.typeIndex == item.value"
              class="glasses-type--iocn"
              src="../../../assets/image/Select_Succeed.svg"
              mode=""
            ></image>
          </view>
        </view>
      </view>
      <zy-vision-form :data="pageData.tableData"></zy-vision-form>
      <view
        style="margin-top: 64rpx; margin-bottom: 30rpx"
        class="write-btn save-btn"
        hover-class="zy-hover"
        @click="saveInfo"
      >
        上报
      </view>
    </block>
    <block v-else>
      <view class="empty_bg">
        <image
          class="zy-width-full"
          src="../../../assets/image/empty_bg_getdata.png"
          mode="widthFix"
        ></image>
      </view>
      <view
        v-if="pageData.writeFlag == '1'"
        class="write-btn"
        hover-class="zy-hover"
        @click="toWrite"
      >
        手动输入
      </view>
    </block>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { saveToast } from '@/app-intelligent-iot/vision-health/utils/check';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad } from '@dcloudio/uni-app';
import { computed, reactive } from 'vue';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();
const pageData = reactive({
  isForm: false,
  writeFlag: '', // 手动输入 0 关闭 1开启
  queryForm: {
    userId: '',
    studentId: '',
    screenWorkId: '',
    workType: '',
  },
  tableConfig: [
    {
      title: '裸眼视力',
      leftVal: '',
      rightVal: '',
      required: true,
      autoDot: true,
      type: 'digit',
      keys: ['leftNaked', 'rightNaked'],
    },
    {
      title: '戴镜视力',
      leftVal: '',
      rightVal: '',
      autoDot: true,
      type: 'digit',
      keys: ['leftWearGlass', 'rightWearGlass'],
    },
  ],
  tableData: [
    {
      title: '裸眼视力',
      leftVal: '',
      rightVal: '',
      required: true,
      autoDot: true,
      type: 'digit',
      keys: ['leftNaked', 'rightNaked'],
    },
  ],
  form: {
    // visionDeviceName: '', // 视力检测设备名称
    workType: '',
    screenWorkId: '', // 检测工作id
    visionUserId: '', // 视力检测人员
    studentId: '', // 学生id
    leftNaked: '', // 裸眼视力(左)
    leftWearGlass: '', // 戴镜视力(左)
    rightNaked: '', // 裸眼视力(右)
    rightWearGlass: '', // 戴镜视力(右)
    type: '', // 戴镜类型
  },
  typeIndex: '0',
  glassesType: [], // 戴镜类型
});

// 获取学生信息
const studentInfo = computed(() => {
  return store.state.studentInfo || {};
});

// 获取设备服务信息
const deviceServices = computed(() => {
  return store.state.deviceServices || {};
});

onLoad(option => {
  pageData.writeFlag = store.getters.checkWork.writeFlag;
  pageData.queryForm.studentId = option.studentId;
  pageData.queryForm.screenWorkId = store.getters.checkWork.id;
  pageData.queryForm.workType = store.getters.checkWork.screenItem || '0';
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.itemId = store.getters.checkType;
  pageData.form.visionUserId = userInfo.id;
  pageData.form.screenWorkId = store.getters.checkWork.id;
  pageData.form.workType = store.getters.checkWork.screenItem || '0';
  pageData.form.studentId = option.studentId;
  // pageData.form.visionDeviceNo = store.getters.bluetoothInfo?.name;
  // pageData.form.visionDeviceName = store.getters.bluetoothInfo?.name;
  getScreenInfo();
  getGlassType();
});

// 获取戴镜类型
const getGlassType = () => {
  $http.public
    .getDictItems({
      dictCode: 'screen_glass_type',
    })
    .then(res => {
      pageData.glassesType = res;
    });
};
// 获取检测记录
const getScreenInfo = () => {
  $http.check.getScreenInfo(pageData.queryForm).then(res2 => {
    const res = res2.ldxScreenRecord;
    console.log('🚀 ~ file: form.vue:192 ~ $http.check.getScreenInfo ~ res:', res);
    if (res && res.id) {
      pageData.form.id = res.id;
      pageData.typeIndex = res.type || '0';
      pageData.form.type = res.type || '0';
      pageData.tableConfig.forEach(item => {
        const isValue =
          (res[item.keys[0]] || typeof (res[item.keys[0]] === 'number')) &&
          (res[item.keys[1]] || typeof res[item.keys[1]] === 'number');
        if (isValue) {
          item.leftVal = res[item.keys[0]].toString();
          item.rightVal = res[item.keys[1]].toString();
          let index = pageData.tableData.findIndex(i => i.title == item.title);
          if (index > -1) {
            pageData.tableData[index].leftVal = item.leftVal;
            pageData.tableData[index].rightVal = item.rightVal;
          } else {
            pageData.tableData.push(item);
          }
        }
      });
    }
  });
};
// 保存上报
const saveInfo = async () => {
  pageData.form.type = pageData.typeIndex;
  let formRules = [];
  pageData.tableData.forEach(item => {
    // 去空格
    if (typeof item.leftVal == 'string') {
      item.leftVal = item.leftVal.trim();
    }
    if (typeof item.rightVal == 'string') {
      item.rightVal = item.rightVal.trim();
    }
    pageData.form[item.keys[0]] = item.leftVal;
    pageData.form[item.keys[1]] = item.rightVal;
    // 左右眼必填
    if (item.leftVal || item.rightVal) {
      item.required = true;
    }
    // 添加必填校验规则
    if (item.required) {
      formRules.push({
        name: item.keys[0],
        type: 'required',
        errmsg: `${item.title}(左)不能为空`,
      });
      formRules.push({
        name: item.keys[1],
        type: 'required',
        errmsg: `${item.title}(右)不能为空`,
      });
    }
  });
  if (pageData.typeIndex == '0') {
    pageData.form.leftWearGlass = '';
    pageData.form.rightWearGlass = '';
  }
  console.log(pageData.form, 'pageData.form');
  await proxy.$publicFunc.validateForm(pageData.form, formRules);
  // 检验视力数据是否符合视力表区间
  const arr = [];
  for (let i = 30; i <= 55; i++) {
    arr.push(i);
  }
  const visionArr = arr.map(n => (n / 10).toFixed(1));
  if (visionArr.indexOf(pageData.form.leftNaked) == -1) {
    proxy.$publicFunc.showToast('none', '裸眼视力(左)数据不符合规范值');
    return;
  }
  if (visionArr.indexOf(pageData.form.rightNaked) == -1) {
    proxy.$publicFunc.showToast('none', '裸眼视力(右)数据不符合规范值');
    return;
  }
  if (pageData.form.leftWearGlass && visionArr.indexOf(pageData.form.leftWearGlass) == -1) {
    proxy.$publicFunc.showToast('none', '戴镜视力(左)数据不符合规范值');
    return;
  }
  if (pageData.form.rightWearGlass && visionArr.indexOf(pageData.form.rightWearGlass) == -1) {
    proxy.$publicFunc.showToast('none', '戴镜视力(右)数据不符合规范值');
    return;
  }
  let requests = ['addScreenRecord', 'editScreenRecord'];
  let index = pageData.form.id ? 1 : 0;
  proxy.$publicFunc.showLoading('保存中...');
  saveToast($http.check[requests[index]](pageData.form));
};
// 戴镜类型切换
const typeChange = data => {
  pageData.typeIndex = data.value;
  if (pageData.typeIndex != '0') {
    pageData.tableData = pageData.tableConfig;
  } else {
    pageData.tableData = [pageData.tableConfig[0]];
  }
};
// 手动输入
const toWrite = () => {
  pageData.isForm = true;
  if (!pageData.form.id) {
    if (pageData.typeIndex != '0') {
      pageData.tableData = pageData.tableConfig;
    } else {
      pageData.tableData = [pageData.tableConfig[0]];
    }
  }
};
</script>

<style lang="scss" scoped>
.glasses-type {
  position: relative;
  width: 300rpx;
  height: 68rpx;
  line-height: 68rpx;
  text-align: center;
  background: $zy-middle-color7;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  &--active {
    background: $zy-spare-color3;
    color: $zy-main-color;
  }

  &--iocn {
    position: absolute;
    width: 42rpx;
    height: 32rpx;
    right: 0;
    bottom: 0;
  }
}

.empty_bg {
  width: 200rpx;
  margin: 140rpx auto 70rpx;
}

.write-btn {
  width: 208rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  margin: 0 auto;
  background: $zy-main-color;
  color: $zy-middle-color2;
  border-radius: 12rpx;
}

.save-btn {
  width: 690rpx;
  height: 96rpx;
  line-height: 96rpx;
}
</style>
