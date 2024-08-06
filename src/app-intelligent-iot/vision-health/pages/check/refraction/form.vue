<template>
  <!-- <mt-page :show-notice-bar="false" bg-type="default" title="屈光采集"> -->
  <view class="zy-margin-top-sm">
    <view class="user-card user-card2 zy-shadow">
      <view class="flex-style">
        <image
          v-if="studentInfo.gender == '男' || studentInfo.gender == 1"
          class="user-avatar"
          src="@/app-intelligent-iot/static/image/avatar_boy.png"
          mode=""
        ></image>
        <image
          v-else
          class="user-avatar"
          src="@/app-intelligent-iot/static/image/avatar_girl.png"
          mode=""
        ></image>
        <view class="">
          <view class="">
            <text>{{ studentInfo.name || studentInfo.studentName }}</text>
            <zy-icons
              v-if="studentInfo.gender == '男' || studentInfo.gender == 1"
              color="#176BFB"
              type="man"
              :size="32"
            ></zy-icons>
            <zy-icons v-else color="#F53F3F" type="women" :size="32"></zy-icons>
          </view>
          <view class="text-size24 text-color5">
            <text>{{ studentInfo.clazzName }}</text>
          </view>
        </view>
      </view>
      <view class="marL">
        <image
          src="@/app-intelligent-iot/static/image/icon_scanQR.svg"
          mode=""
          @click="openScanQR"
        ></image>
      </view>
    </view>
    <block v-if="pageData.isForm">
      <zy-vision-form :data="pageData.tableData" :disabled="isDisabled"></zy-vision-form>
      <view
        style="margin-top: 64rpx; margin-bottom: 30rpx"
        class="write-btn save-btn"
        hover-class="zy-hover"
        @click="saveInfo"
      >
        上报
      </view>
    </block>
    <block v-else-if="pageData.isXinYuanForm">
      <zy-vision-form :data="pageData.tableData" :disabled="true"></zy-vision-form>
      <view style="height: 120rpx">
        <view
          style="margin-top: 64rpx; margin-bottom: 64rpx"
          class="write-btn save-btn"
          hover-class="zy-hover"
          @click="uploadXinYuanByManual"
        >
          上报
        </view>
      </view>
    </block>

    <block v-else>
      <!-- <view>
        {{ pageData.form }}
      </view>
      <view>--------------</view>

      <view>
        {{ deviceServices }}
      </view>
      <view>--------------</view>

      <view>
        {{ pageData.screenDataStr }}
      </view> -->
      <view class="empty_bg">
        <image
          class="zy-width-full imageHeight"
          src="@/app-intelligent-iot/static/image/empty_bg_getdata.png"
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
  <!-- </mt-page> -->
  <c-modal v-model:show="showRecallFailModal" class="recall-fail-modal" :has-cancel="false">
    <view class="modal-content">
      <view class="scanQR-content">
        <image class="scanQR" :src="qrcode" mode="widthFix"></image>
      </view>
      <view class="scanQR-content">
        <view class="scanQR-title">{{ studentInfo.clazzName }}</view>
      </view>
      <view class="scanQR-content">
        <view class="scanQR-title">{{ studentInfo.name || studentInfo.studentName }}</view>
      </view>
    </view>
  </c-modal>
  <!--#ifdef APP-PLUS | H5-->
  <console />
  <imp-messages-cover></imp-messages-cover>
  <!--#endif-->
</template>

<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { saveToast } from '@/app-intelligent-iot/vision-health/utils/check';
import ArkMessageParse from '@/app-intelligent-iot/vision-health/utils/messageParse/arkMessageParse.js';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { isNil } from '@/utils/lodash-es';
import { onLoad, onReady, onUnload } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';
import gbk from './transcoding/GbkTextEncoder.js';
import './transcoding/encoding';

let pageId = '';
const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();
// bt580设备蓝牙通知消息处理后数组
let bluetoothNotifydataArr = [];
const isDisabled = ref(false);
const qrcode = ref('');
const showRecallFailModal = ref(false);
const pageData = reactive({
  isForm: false,
  isXinYuanForm: false, // 新缘设备专用表单，防止影响旧表单逻辑
  writeFlag: '', // 手动输入 0 关闭 1开启
  screenData: {},
  screenDataStr: '',
  sendLength: 0,
  queryForm: {
    userId: '',
    studentId: '',
    screenWorkId: '',
    workType: '',
  },
  tableData: [
    {
      title: '球镜',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftSph', 'rightSph'],
      scale: 2,
    },
    {
      title: '柱镜',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftCyl', 'rightCyl'],
      scale: 2,
    },
    {
      title: '轴位',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftAxis', 'rightAxis'],
    },
  ],
  tableConfig: [
    {
      title: '球镜',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftSph', 'rightSph'],
      scale: 2,
    },
    {
      title: '柱镜',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftCyl', 'rightCyl'],
      scale: 2,
    },
    {
      title: '轴位',
      leftVal: '',
      rightVal: '',
      required: true,
      keys: ['leftAxis', 'rightAxis'],
    },
    {
      // 	title: '等效球镜',
      // 	leftVal: '',
      // 	rightVal: '',
      // 	keys: ['leftSphSe', 'rightSphSe']
      // }, {
      title: '角膜水平曲率',
      leftVal: '',
      rightVal: '',
      keys: ['leftK1', 'rightK1'],
      scale: 2,
    },
    {
      title: '角膜垂直曲率',
      leftVal: '',
      rightVal: '',
      keys: ['leftK2', 'rightK2'],
      scale: 2,
    },
    {
      title: '角膜水平曲率半径',
      leftVal: '',
      rightVal: '',
      keys: ['leftR1', 'rightR1'],
      scale: 2,
    },
    {
      title: '角膜垂直曲率半径',
      leftVal: '',
      rightVal: '',
      keys: ['leftR2', 'rightR2'],
      scale: 2,
    },
    {
      title: '角膜水平曲率半径轴位',
      leftVal: '',
      rightVal: '',
      keys: ['leftA1', 'rightA1'],
    },
    {
      title: '角膜垂直曲率半径轴位',
      leftVal: '',
      rightVal: '',
      keys: ['leftA2', 'rightA2'],
    },
    {
      title: '散光',
      leftVal: '',
      rightVal: '',
      keys: ['leftSg', 'rightSg'],
      scale: 2,
    },
    {
      title: '瞳孔直径',
      leftVal: '',
      rightVal: '',
      keys: ['leftPupilDiameter', 'rightPupilDiameter'],
      scale: 2,
    },
    {
      title: '上下凝视',
      leftVal: '',
      rightVal: '',
      keys: ['leftVerticalGazeAngle', 'rightVerticalGazeAngle'],
    },
    {
      title: '鼻侧/颞侧凝视',
      leftVal: '',
      rightVal: '',
      keys: ['leftHorizontalGateAngle', 'rightHorizontalGateAngle'],
    },
    {
      title: '瞳距',
      leftVal: '',
      rightVal: '',
      keys: ['pupilDistance', 'pupilDistance'],
    },
  ],
  form: {
    // refractionDeviceName: '', // 屈光检测设备名称
    refractionDeviceNo: '', // 屈光检测设备编号
    workType: '',
    screenWorkId: '', // 检测工作id
    refractionUserId: '', // 屈光检测人员
    studentId: '', // 学生id
    leftSph: '', // 左眼球镜
    rightSph: '', // 右眼球镜
    leftCyl: '', // 左眼柱镜
    rightCyl: '', // 右眼柱镜
    leftAxis: '', // 左眼轴位
    rightAxis: '', // 右眼轴位
    //添加顶点距？
  },
});
// 获取学生信息
const studentInfo = computed(() => {
  console.log(
    '🚀 ~ file: form.vue:252 ~ studentInfo ~ store.getters.studentInfo:',
    store.getters.studentInfo,
  );

  return store.getters.studentInfo || {};
});

const openScanQR = () => {
  const params = {
    studentId: studentInfo.value.studentId || studentInfo.value.id,
  };
  console.log('🚀 ~ file: form.vue:144 ~ openScanQR ~ params.studentInfo.value.studentId:', params);
  $http.check.getQrcode(params).then(res => {
    console.log('🚀 ~ file: form.vue:292 ~ $http.check.getQrcode ~ res:', res);
    qrcode.value = 'data:image/png;base64,' + res.qrCodeBase64;
    showRecallFailModal.value = true;
  });
};

// 获取设备服务信息
const deviceServices = computed(() => {
  return store.getters.deviceServices || {};
});

// 当前蓝牙连接信息
const bluetoothInfo = computed(() => {
  return store.getters.bluetoothInfo || {};
});
// 获取检测记录
const getScreenInfo = () => {
  $http.check.getScreenInfo(pageData.queryForm).then(res2 => {
    const res = res2.ldxScreenRecord;
    if (res && res.id) {
      pageData.form.id = res.id;
      pageData.tableConfig.forEach(item => {
        const isValue =
          (res[item.keys[0]] || typeof (res[item.keys[0]] === 'number')) &&
          (res[item.keys[1]] || typeof res[item.keys[1]] === 'number');
        if (isValue) {
          if (typeof item.scale == 'number') {
            item.leftVal = Number(res[item.keys[0]]).toFixed(item.scale);
            item.rightVal = Number(res[item.keys[1]]).toFixed(item.scale);
          } else {
            item.leftVal = res[item.keys[0]].toString();
            item.rightVal = res[item.keys[1]].toString();
          }
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
// 初始化设备信息
const initServices = () => {
  // 如果支持notify
  const is02Module = deviceServices.value.serviceId == '49535343-FE7D-4AE5-8FA9-9FAFD205E455';
  var characteristicId = '';
  if (is02Module) {
    characteristicId = '49535343-1E4D-4BD9-BA61-23C647249616';
  } else {
    characteristicId = deviceServices.value.characteristicId;
  }
  if (deviceServices.value.notify || is02Module) {
    uni.notifyBLECharacteristicValueChange({
      deviceId: deviceServices.value.deviceId,
      serviceId: deviceServices.value.serviceId,
      characteristicId,
      state: true,
      success: function (res) {
        // do something...
        console.log('********************com is start notify !!!');
      },
      fail: function (res) {
        console.log('************************com start notify is fail !!!');
      },
    });
  }
};

const uploadXiongBo = res => {
  proxy.$publicFunc.showLoading('上报中...');
  let params = {
    refractionUserId: pageData.form.refractionUserId,
    screenWorkId: pageData.queryForm.screenWorkId,
    //refractionDeviceNo: pageData.form.refractionDeviceNo,不能用pageData.form.refractionDeviceNo，这个值存储的是蓝牙地址，对于新缘可行（新缘没有设备id所以只能靠蓝牙地址），对于雄博，不可行，因为雄博有专门的设备id
    refractionDeviceNo: res.Id,
    //学生ID
    studentId: pageData.form.studentId,
    /******************************************************** */
    //左眼球镜
    leftSph: res.left_s_avg,
    //左眼柱镜
    leftCyl: res.left_c_avg,
    //左眼轴位
    leftAxis: res.left_a_avg,
    /******************************************************** */
    //左眼R1角膜屈光度
    leftK1: res.left_r1_d,
    //左眼R1曲率半径
    leftR1: res.left_r1_mm,
    //左眼R1曲率轴位
    leftA1: res.left_r1_ax,
    /******************************************************** */
    //左眼R2角膜屈光度
    leftK2: res.left_r2_d,
    //左眼R2曲率半径
    leftR2: res.left_r2_mm,
    //左眼R2曲率轴位
    leftA2: res.left_r2_ax,
    /****************************************************** */
    //右眼球镜
    rightSph: res.right_s_avg,
    //右眼柱镜
    rightCyl: res.right_c_avg,
    //右眼轴位
    rightAxis: res.right_a_avg,
    /******************************************************** */
    //右眼R1角膜屈光度
    rightK1: res.right_r1_d,
    //rightK1: 2,
    //右眼R1曲率半径
    rightR1: res.right_r1_mm,
    //右眼R1曲率轴位
    rightA1: res.right_r1_ax,
    /*************************************************** */
    //右眼R2角膜屈光度
    rightK2: res.right_r2_d,
    //rightK2: 3,
    //右眼R2曲率半径
    rightR2: res.right_r2_mm,
    //右眼R2曲率轴位
    rightA2: res.right_r2_ax,
    /******************************************************** */
    //瞳距
    pupilDistance: res?.pd,
    //顶点距
    //vertexDistance: Number(res?.VD),
    //左眼角膜散光
    leftSg: res?.left_kc,
    //右眼角膜散光
    rightSg: res?.right_kc,
  };
  console.log('解析后雄博上报的参数');
  console.log(params);
  let requests = ['addScreenRecord', 'editScreenRecord'];
  saveToast($http.check[requests[0]](params));
};
const madeDatas = data => {
  return data || data == 0 ? Number(data) : '';
};
const uploadTianLe = res => {
  try {
    console.log('🚀 ~ file: form.vue:396 ~ uploadTianLe ~ res:', res);
    console.log('🚀 ~ file: form.vue:397 ~ uploadTianLe ~ res:', typeof res);
    let res1 = JSON.parse(res);
    console.log('🚀 ~ file: form.vue:398 ~ uploadTianLe ~ res:', res1);
    console.log('🚀 ~ file: form.vue:399 ~ uploadTianLe ~ res?.left_s_avg:', res1?.left_s_avg);

    let params = {
      refractionUserId: pageData.form.refractionUserId,
      screenWorkId: pageData.queryForm.screenWorkId,
      refractionDeviceNo: pageData.form.refractionDeviceNo,
      //学生ID
      studentId: pageData.form.studentId,
      /******************************************************** */
      //左眼球镜
      leftSph: madeDatas(res1?.left_s_avg),
      //左眼柱镜
      leftCyl: madeDatas(res1?.left_c_avg),
      //左眼轴位
      leftAxis: madeDatas(res1?.left_a_avg),
      /******************************************************** */
      //左眼R1角膜屈光度
      leftK1: madeDatas(res1?.left_r1_d),
      //leftK1: 2,
      //左眼R1曲率半径
      leftR1: madeDatas(res1?.left_r1_mm),
      //左眼R1曲率轴位
      leftA1: madeDatas(res1?.left_r1_ax),
      /******************************************************** */
      //左眼R2角膜屈光度
      leftK2: madeDatas(res1?.left_r2_d),
      //leftK2: 3,
      //左眼R2曲率半径
      leftR2: madeDatas(res1?.left_r2_mm),
      //左眼R2曲率轴位
      leftA2: madeDatas(res1?.left_r2_ax),
      /****************************************************** */

      //右眼球镜
      rightSph: madeDatas(res1?.right_s_avg),
      //右眼柱镜
      rightCyl: madeDatas(res1?.right_c_avg),
      //右眼轴位
      rightAxis: madeDatas(res1?.right_a_avg),
      /******************************************************** */
      //右眼R1角膜屈光度
      rightK1: madeDatas(res1?.right_r1_d),
      //rightK1: 2,
      //右眼R1曲率半径
      rightR1: madeDatas(res1?.right_r1_mm),
      //右眼R1曲率轴位
      rightA1: madeDatas(res1?.right_r1_ax),
      /*************************************************** */
      //右眼R2角膜屈光度
      rightK2: madeDatas(res1?.right_r2_d),
      //rightK2: 3,
      //右眼R2曲率半径
      rightR2: madeDatas(res1?.right_r2_mm),
      //右眼R2曲率轴位
      rightA2: madeDatas(res1?.right_r2_ax),
      /******************************************************** */
      //瞳距
      pupilDistance: madeDatas(res1?.PD),
      //顶点距（天乐设备商说没有上传这个数据的）
      vertexDistance: madeDatas(res1?.VD),
      //左眼角膜散光
      leftSg: madeDatas(res1?.left_kc),
      //右眼角膜散光
      rightSg: madeDatas(res1?.right_kc),
    };
    console.log(`[$pageId] **********************天乐上报的参数`, JSON.stringify(params));
    let requests = ['addScreenRecord', 'editScreenRecord'];
    const visionFalg = uni.getStorageSync('VISIONFALG');
    if (visionFalg) {
      uni.setStorageSync('VISIONFALG', false);
      saveToast($http.check[requests[0]](params));
    }
  } catch (error) {
    uni.showToast({
      title: '设备上报出错',
    });
  }
};

const uploadXinYuanByManual = () => {
  // 转换逻辑同saveInfo
  pageData.tableData.forEach(item => {
    pageData.form[item.keys[0]] = madeDatas(item.leftVal);
    pageData.form[item.keys[1]] = madeDatas(item.rightVal);
  });
  // 以下逻辑同自动上传
  const visionFlag = uni.getStorageSync('VISIONFALG');
  if (visionFlag) {
    uni.setStorageSync('VISIONFALG', false);
    const isDaily = store.getters.isDaily;
    if (isDaily) {
      pageData.form.source = 3; // 标志为日常检测
      pageData.form.deviceNumber = pageData.form.refractionDeviceNo; // 设备sn
      console.log('日常检测结果上报', pageData.form);
      saveToast($http.check.addDailyCheckRecord(pageData.form));
      return;
    }
    console.log('检测工作结果上报');
    saveToast($http.check.addScreenRecord(pageData.form));
  }
};

const uploadXinYuan = (res, isUploadByManual = false) => {
  // proxy.$publicFunc.showLoading('上报中...');
  let params = {
    //age: 5,
    refractionUserId: pageData.form.refractionUserId,
    screenWorkId: pageData.queryForm.screenWorkId,
    refractionDeviceNo: pageData.form.refractionDeviceNo,
    //学生ID
    studentId: pageData.form.studentId,
    /******************************************************** */
    //左眼球镜
    leftSph: madeDatas(res.LS?.S),
    //左眼柱镜
    leftCyl: madeDatas(res.LS?.C),
    //左眼轴位
    leftAxis: madeDatas(res.LS?.A),
    /******************************************************** */
    //左眼R1角膜屈光度
    leftK1: madeDatas(res.LD.R1?.D),
    //leftK1: 2,
    //左眼R1曲率半径
    leftR1: madeDatas(res.LD.R1?.MM),
    //左眼R1曲率轴位
    leftA1: madeDatas(res.LD.R1?.A),
    /******************************************************** */
    //左眼R2角膜屈光度
    leftK2: madeDatas(res.LD.R2?.D),
    //leftK2: 3,
    //左眼R2曲率半径
    leftR2: madeDatas(res.LD.R2?.MM),
    //左眼R2曲率轴位
    leftA2: madeDatas(res.LD.R2?.A),
    /****************************************************** */
    //右眼球镜
    rightSph: madeDatas(res.RS?.S),
    //右眼柱镜
    rightCyl: madeDatas(res.RS?.C),
    //右眼轴位
    rightAxis: madeDatas(res.RS?.A),
    /******************************************************** */
    //右眼R1角膜屈光度
    rightK1: madeDatas(res.RD.R1?.D),
    //rightK1: 2,
    //右眼R1曲率半径
    rightR1: madeDatas(res.RD.R1?.MM),
    //右眼R1曲率轴位
    rightA1: madeDatas(res.RD.R1?.A),
    /*************************************************** */
    //右眼R2角膜屈光度
    rightK2: madeDatas(res.RD.R2?.D),
    //rightK2: 3,
    //右眼R2曲率半径
    rightR2: madeDatas(res.RD.R2?.MM),
    //右眼R2曲率轴位
    rightA2: madeDatas(res.RD.R2?.A),
    /******************************************************** */
    //瞳距
    pupilDistance: madeDatas(res?.PD),
    //顶点距
    vertexDistance: madeDatas(res?.VD),
    //左眼角膜散光
    leftSg: madeDatas(res.LD?.CYL),
    //右眼角膜散光
    rightSg: madeDatas(res.RD?.CYL),
  };
  console.log(`[$pageId] **********************新缘上报的参数`, JSON.stringify(params));

  // 手动上传，将数据进行展示，手动点击上报进行数据提交
  if (isUploadByManual) {
    // 将数据渲染到表格
    pageData.tableConfig.forEach(item => {
      item.leftVal = params[item.keys[0]] ?? '';
      item.rightVal = params[item.keys[1]] ?? '';
      if (!isNil(item.leftVal) || !isNil(item.rightVal)) {
        // 查重
        let index = pageData.tableData.findIndex(i => i.title == item.title);
        if (item.leftVal !== '') item.leftVal = Number(item.leftVal)?.toFixed(2);
        if (item.rightVal !== '') item.rightVal = Number(item.rightVal)?.toFixed(2);
        if (index > -1) {
          if (item.leftVal) {
            pageData.tableData[index].leftVal = Number(item.leftVal)?.toFixed(2);
          }
          if (item.rightVal) {
            pageData.tableData[index].rightVal = Number(item.rightVal)?.toFixed(2);
          }
        } else {
          pageData.tableData.push(item);
        }
      }
    });
    pageData.isXinYuanForm = true;
    console.log('🚀 ~ file: form.vue:663 ~ uploadXinYuan ~ pageData:', pageData.tableData);
    return;
  }

  let requests = ['addScreenRecord', 'editScreenRecord'];
  const visionFalg = uni.getStorageSync('VISIONFALG');
  if (visionFalg) {
    uni.setStorageSync('VISIONFALG', false);
    saveToast($http.check[requests[0]](params));
  }
};

onLoad(option => {
  pageData.writeFlag = store.getters.checkWork?.writeFlag;
  pageData.queryForm.studentId = option.studentId;
  pageData.queryForm.screenWorkId = store.getters.checkWork?.id;
  pageData.queryForm.workType = store.getters.checkWork?.screenItem || '0';
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.itemId = store.getters.checkType;
  pageData.form.refractionUserId = userInfo.id;
  pageData.form.screenWorkId = store.getters.checkWork?.id;
  pageData.form.workType = store.getters.checkWork?.screenItem || '0';
  pageData.form.studentId = option.studentId;
  pageData.form.refractionDeviceNo = store.getters.bluetoothInfo?.name;
  // pageData.form.refractionDeviceName = store.getters.bluetoothInfo?.name;

  const isDaily = store.getters.isDaily;
  // 日常检测不获取上次检查数据
  if (!isDaily) getScreenInfo();
  initServices();
});

// 保存上报
const saveInfo = async () => {
  let formRules = [];
  pageData.tableData.forEach(item => {
    // 去空格
    if (typeof item.leftVal == 'string') {
      item.leftVal = item.leftVal.trim();
    }
    if (typeof item.rightVal == 'string') {
      item.rightVal = item.rightVal.trim();
    }
    pageData.form[item.keys[0]] = Number(item.leftVal) || item.leftVal;
    pageData.form[item.keys[1]] = Number(item.rightVal) || item.rightVal;
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
    // 校验数据是否是数据类型
    formRules.push({
      name: item.keys[0],
      type: 'numberTypeof',
      errmsg: `${item.title}(左)数据不是规范值`,
    });
    formRules.push({
      name: item.keys[1],
      type: 'numberTypeof',
      errmsg: `${item.title}(右)数据不是规范值`,
    });
  });
  await proxy.$publicFunc.validateForm(pageData.form, formRules);
  let requests = ['addScreenRecord', 'editScreenRecord'];
  let index = pageData.form.id ? 1 : 0;
  proxy.$publicFunc.showLoading('保存中...');
  saveToast($http.check[requests[index]](pageData.form));
};
// 手动输入
const toWrite = () => {
  pageData.isForm = true;
  if (!pageData.form.id) {
    pageData.tableData = [
      {
        title: '球镜',
        leftVal: '',
        rightVal: '',
        required: true,
        keys: ['leftSph', 'rightSph'],
        scale: 2,
      },
      {
        title: '柱镜',
        leftVal: '',
        rightVal: '',
        required: true,
        keys: ['leftCyl', 'rightCyl'],
        scale: 2,
      },
      {
        title: '轴位',
        leftVal: '',
        rightVal: '',
        required: true,
        keys: ['leftAxis', 'rightAxis'],
      },
    ];
  }
};
const buffer2BitArr = (buffer, offset = 0) => {
  const unit8Array = new Uint8Array(buffer, offset);
  const arr = Array.prototype.map.call(unit8Array, function (bit, idx) {
    // TODO:数据中也3或者4代表结束的字眼，因此该存在风险
    if (bit == '3' && unit8Array.length - 1 === idx) {
      return 'e'; // 正文结束(end)
    }
    return bit.toString(16);
  });
  return arr;
};
const bytesToASCII = (buffer, offset = 0) => {
  const hexArr = Array.prototype.map.call(new Uint8Array(buffer, offset), function (bit) {
    // ASCII码4表示传输结束(end)
    if (bit == 4) {
      return 'e';
    }
    return String.fromCharCode(bit);
  });
  return hexArr;
};
// 向特征值写数据(write)
const writeData = (deviceId, serviceId, characteristicId, sendPackage, index = 0) => {
  let i = index;
  if (sendPackage == null) return;
  let len = sendPackage.length;

  function buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x);
    return arr
      .map((char, i) => {
        return String.fromCharCode(char);
      })
      .join('');
  }

  if (len && len > i) {
    uni.writeBLECharacteristicValue({
      deviceId,
      serviceId,
      characteristicId,
      value: sendPackage[i],
      success: function (res) {
        pageData.sendLength = pageData.sendLength + sendPackage[i].byteLength; // 更新已发送字节数
        i += 1;
        writeData(deviceId, serviceId, characteristicId, sendPackage, i); // 发送成功，发送下一个数据包
      },
      fail: function (res) {
        console.log('发送失败: ' + buf2string(res.value));
        console.log('res.value length is ' + new Uint8Array(res.value).length);
        // writeData(deviceId, serviceId, characteristicId, sendPackage, index); // 发送失败，重新发送
      },
    });
  }
};

// 转码
const gbkToArray = content => {
  const _encoder = new TextEncoder('gb2312', {
    NONSTANDARD_allowLegacyEncoding: true,
  });
  // content 需要打印的字符串
  const val = _encoder.encode(content);
  return val.buffer;
};

const sendMessage = sendText => {
  const deviceId = deviceServices.value.deviceId; // 设备ID
  const serviceId = deviceServices.value.serviceId; // 服务ID
  const characteristicId = deviceServices.value.characteristicId; // 特征值ID
  let buff;
  buff = gbkToArray(sendText);
  const sendPackage = [];
  for (var i = 0; i < buff.byteLength; i += 20) {
    sendPackage.push(buff.slice(i, i + 20));
  }
  if (deviceServices.value.write) {
    // 可写
    writeData(deviceId, serviceId, characteristicId, sendPackage);
  }
};
onReady(() => {
  // const sendLength = studentInfo.value.studentName.length * 2 + studentInfo.value.studentId.length;
  // const sendText = `#!<IDRY${sendLength}${studentInfo.value.studentName}${studentInfo.value.studentId}#!>`;
  // 发送学生信息指令（app上有问题）
  // #ifdef MP-WEIXIN || H5
  // sendMessage(sendText);
  // #endif

  function buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x);
    return arr
      .map((char, i) => {
        return String.fromCharCode(char);
      })
      .join('');
  }
  // CAL\CAR数据文本解析
  const caAnalysis = (screenData, caDataArr, key) => {
    if (caDataArr[1].length === 9) {
      // R1\K1在数组中同一项
      screenData[`${key}R1`] = caDataArr[1].substr(0, 4);
      screenData[`${key}K1`] = caDataArr[1].substr(4, 5);
      if (caDataArr[2].length < 9) {
        screenData[`${key}A1`] = caDataArr[2];
        if (caDataArr[3].length === 9) {
          // R2\K2在数组中同一项
          screenData[`${key}R2`] = caDataArr[3].substr(0, 4);
          screenData[`${key}K2`] = caDataArr[3].substr(4, 5);
          if (caDataArr[4].length < 9) {
            screenData[`${key}A2`] = caDataArr[4];
          }
        }
        if (caDataArr[3].length > 9) {
          // R2\K2\A2在数组中同一项
          screenData[`${key}R2`] = caDataArr[3].substr(0, 4);
          screenData[`${key}K2`] = caDataArr[3].substr(4, 5);
          screenData[`${key}A2`] = caDataArr[3].substr(9);
        }
      }
    }
    if (caDataArr[1].length > 9) {
      // R1\K1\A1在数组中同一项
      screenData[`${key}R1`] = caDataArr[1].substr(0, 4);
      screenData[`${key}K1`] = caDataArr[1].substr(4, 5);
      screenData[`${key}A1`] = caDataArr[1].substr(9);
      if (caDataArr[2].length === 9) {
        // R2\K2在数组中同一项
        screenData[`${key}R2`] = caDataArr[2].substr(0, 4);
        screenData[`${key}K2`] = caDataArr[2].substr(4, 5);
        if (caDataArr[3].length < 9) {
          screenData[`${key}A2`] = caDataArr[3];
        }
      }
      if (caDataArr[2].length > 9) {
        // R2\K2\A2在数组中同一项
        screenData[`${key}R2`] = caDataArr[2].substr(0, 4);
        screenData[`${key}K2`] = caDataArr[2].substr(4, 5);
        screenData[`${key}A2`] = caDataArr[2].substr(9);
      }
    }
  };

  // 解析从串口转蓝牙设备获取的数据（目前仅有拓普康设备std4输出格式）
  const setScreenDataFromSerialDevice = (dataArr = []) => {
    if (!dataArr.length) return;
    const screenData = pageData.screenData;
    dataArr.forEach(item => {
      if (item.includes('OAR')) {
        const trimStr = item.replace(/\s*/g, '');
        // 屈光右眼数据
        // S 表示球镜屈光度，6 个字节
        screenData.rightSph = trimStr.substr(3, 5);
        // C 表示柱镜屈光度，6 个字节
        screenData.rightCyl = trimStr.substr(8, 5);
        // A 表示柱镜轴位角度
        screenData.rightAxis = trimStr.substr(13);
      }
      if (item.includes('EAR')) {
        const trimStr = item.replace(/\s*/g, '');
        // 屈光右眼等效球镜
        // SE：综合球镜度，单位为 D，如-05.25 表示综合球镜度为-5.25D。
        screenData.RightSe = item.substr(3);
      }
      if (item.includes('CAR')) {
        // 因轴位长度不一定，需要先用空格分组
        const trimArr = item.split(' ').filter(item => item);
        caAnalysis(screenData, trimArr, 'right');
      }
      if (item.includes('OAL')) {
        const trimStr = item.replace(/\s*/g, '');
        // 屈光左眼数据
        // S 表示球镜屈光度
        screenData.leftSph = trimStr.substr(3, 5);
        // C 表示柱镜屈光度
        screenData.leftCyl = trimStr.substr(8, 5);
        // A 表示柱镜轴位角度
        screenData.leftAxis = trimStr.substr(13);
      }
      if (item.includes('EAL')) {
        const trimStr = item.replace(/\s*/g, '');
        // 屈光左眼等效球镜
        // SE：综合球镜度，单位为 D，如-05.25 表示综合球镜度为-5.25D。
        screenData.leftSe = trimStr.substr(3);
      }
      if (item.includes('CAL')) {
        // 因轴位长度不一定，需要先用空格分组
        const trimArr = item.split(' ').filter(item => item);
        caAnalysis(screenData, trimArr, 'left');
      }
      if (item.includes('PD')) {
        // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示无该项记录。
        screenData.pupilDistance = item.replace(/\s*/g, '').substr(2);
      }
      if (item.includes('VD')) {
        // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示无该项记录。
        // screenData.pupilDistance = item.substr(2);
      }
    });
    pageData.screenData = screenData;
    if (JSON.stringify(pageData.screenData) === '{}') return;
    pageData.isForm = true;
    // 将数据渲染到表格
    pageData.tableConfig.forEach(item => {
      item.leftVal = pageData.screenData[item.keys[0]] ?? '';
      item.rightVal = pageData.screenData[item.keys[1]] ?? '';
      if (item.leftVal || item.rightVal) {
        // 查重
        let index = pageData.tableData.findIndex(i => i.title == item.title);
        if (index > -1) {
          if (item.leftVal) {
            pageData.tableData[index].leftVal = item.leftVal;
          }
          if (item.rightVal) {
            pageData.tableData[index].rightVal = item.rightVal;
          }
        } else {
          pageData.tableData.push(item);
        }
      }
    });
  };

  // 数据解析后赋值
  const handleScreenData = screenData => {
    pageData.screenData = screenData;
    if (JSON.stringify(pageData.screenData) === '{}') return;
    // pageData.isForm = true;
    // isDisabled.value = true;
    // 将数据渲染到表格
    pageData.tableConfig.forEach(item => {
      item.leftVal = pageData.screenData[item.keys[0]] || '';
      item.rightVal = pageData.screenData[item.keys[1]] || '';
      if (item.leftVal || item.rightVal) {
        // 查重
        let index = pageData.tableData.findIndex(i => i.title == item.title);
        if (index > -1) {
          if (item.leftVal) {
            pageData.tableData[index].leftVal = item.leftVal;
          }
          if (item.rightVal) {
            pageData.tableData[index].rightVal = item.rightVal;
          }
        } else {
          pageData.tableData.push(item);
        }
      }
    });
    saveInfo();
  };

  // 解析巨目验光仪报文数据
  const setScreenDataFromJRKDevice = (dataArr = []) => {
    if (!dataArr.length) return;
    const screenData = pageData.screenData;
    screenData.rightSph = dataArr[0];
    screenData.rightCyl = dataArr[1];
    screenData.rightAxis = dataArr[2];
    screenData.leftSph = dataArr[3];
    screenData.leftCyl = dataArr[4];
    screenData.leftAxis = dataArr[5];
    screenData.rightR1 = dataArr[6];
    screenData.rightR2 = dataArr[7];
    screenData.rightA1 = dataArr[8];
    screenData.leftR1 = dataArr[10];
    screenData.leftR2 = dataArr[11];
    screenData.leftA1 = dataArr[12];
    screenData.pupilDistance = dataArr[14];
    screenData.RightSe = dataArr[15];
    screenData.leftSe = dataArr[16];
    handleScreenData(screenData);
  };

  const setScreenData = message => {
    if (!message) {
      return;
    }
    const screenData = pageData.screenData;
    // 屈光左眼数据
    if (message.indexOf('#!<REFL') == 0) {
      // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示该项无记录
      screenData.pupilDistance = Number(message.substr(9, 4)).toFixed(1);
      // VD：顶点距离值，5 个字节，单位为 mm，如 12.00 表示 12mm。
      screenData.leftVd = Number(message.substr(13, 5)).toFixed(2);
      // SE：综合球镜度，6 个字节，单位为 D，如-05.25 表示综合球镜度为-5.25D。
      screenData.leftSe = Number(message.substr(18, 6)).toFixed(2);
      if (message.length >= 41) {
        // S 表示球镜屈光度，6 个字节
        screenData.leftSph = Number(message.substr(26, 6)).toFixed(2);
        // C 表示柱镜屈光度，6 个字节
        screenData.leftCyl = Number(message.substr(32, 6)).toFixed(2);
        // A 表示柱镜轴位角度，3 个字节
        screenData.leftAxis = Number(message.substr(38, 3)).toFixed(0);
      }
    }
    // 屈光右眼数据
    else if (message.indexOf('#!<REFR') == 0) {
      // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示该项无记录
      screenData.pupilDistance = Number(message.substr(9, 4)).toFixed(1);
      // VD：顶点距离值，5 个字节，单位为 mm，如 12.00 表示 12mm。
      screenData.rightVd = Number(message.substr(13, 5)).toFixed(2);
      // SE：综合球镜度，6 个字节，单位为 D，如-05.25 表示综合球镜度为-5.25D。
      screenData.rightSe = Number(message.substr(18, 6)).toFixed(2);
      if (message.length >= 41) {
        // S 表示球镜屈光度，6 个字节
        screenData.rightSph = Number(message.substr(26, 6)).toFixed(2);
        // C 表示柱镜屈光度，6 个字节
        screenData.rightCyl = Number(message.substr(32, 6)).toFixed(2);
        // A 表示柱镜轴位角度，3 个字节
        screenData.rightAxis = Number(message.substr(38, 3)).toFixed(0);
      }
    }
    // 角膜左眼数据
    if (message.indexOf('#!<KRTL') == 0) {
      // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示无该项记录。
      screenData.pupilDistance = Number(message.substr(9, 4)).toFixed(1);
      // CD：角膜直径值，5 个字节，单位为 mm，如 10.00 表示 10mm，如果为“00.0”表示无该项记录。
      // screenData.leftCd = message.substr(13, 5);
      // CYLVAL：角膜曲率柱镜度数值（R1 和 R2 之间差值，始终为负值，单位为 DP 度），6 个字节
      // screenData.leftCyl = message.substr(18, 6);
      // UNIT：表示记录数据单位，=“MM”（毫米）或“DP”（度）,R1、R2 值单位由它决定。
      screenData.leftUnit = message.substr(24, 2);
      if (message.length >= 41) {
        // R1 曲率半径 1，6 个字节
        screenData.leftR1 = Number(message.substr(26, 6)).toFixed(2);
        // R2 曲率半径 2，6 个字节
        screenData.leftR2 = Number(message.substr(32, 6)).toFixed(2);
        // A1 曲率半径 1 方向角度，3 个字节
        screenData.leftA1 = message.substr(38, 3);
      }
    }
    // 角膜右眼数据
    if (message.indexOf('#!<KRTR') == 0) {
      // PD:全瞳距值，4 个字节，单位为 mm，如 62.0 表示瞳距为 62mm，如果为“00.0”表示无该项记录。
      screenData.pupilDistance = Number(message.substr(9, 4)).toFixed(1);
      // CD：角膜直径值，5 个字节，单位为 mm，如 10.00 表示 10mm，如果为“00.0”表示无该项记录。
      // screenData.rightCd = message.substr(13, 5);
      // CYLVAL：角膜曲率柱镜度数值（R1 和 R2 之间差值，始终为负值，单位为 DP 度），6 个字节
      // screenData.rightCyl = message.substr(18, 6);
      // UNIT：表示记录数据单位，=“MM”（毫米）或“DP”（度）,R1、R2 值单位由它决定。
      screenData.rightUnit = message.substr(24, 2);
      if (message.length >= 41) {
        // R1 曲率半径 1，6 个字节
        screenData.rightR1 = Number(message.substr(26, 6)).toFixed(2);
        // R2 曲率半径 2，6 个字节
        screenData.rightR2 = Number(message.substr(32, 6)).toFixed(2);
        // A1 曲率半径 1 方向角度，3 个字节
        screenData.rightA1 = message.substr(38, 3);
      }
    }
    pageData.screenData = screenData;
    if (JSON.stringify(pageData.screenData) === '{}') return;
    pageData.isForm = true;
    // 将数据渲染到表格
    pageData.tableConfig.forEach(item => {
      item.leftVal = pageData.screenData[item.keys[0]] ?? '';
      item.rightVal = pageData.screenData[item.keys[1]] ?? '';
      if (item.leftVal || item.rightVal) {
        // 查重
        let index = pageData.tableData.findIndex(i => i.title == item.title);
        if (index > -1) {
          if (item.leftVal) {
            pageData.tableData[index].leftVal = item.leftVal;
          }
          if (item.rightVal) {
            pageData.tableData[index].rightVal = item.rightVal;
          }
        } else {
          pageData.tableData.push(item);
        }
      }
    });
  };

  const getScreenData = message => {
    if (message == '#!<DATY00#!>') {
      // 获取屈光左眼数据平均值
      sendMessage('#!<REFL01#!>');
    } else if (message.indexOf('#!<REFL') == 0) {
      // 获取屈光右眼数据平均值
      sendMessage('#!<REFR01#!>');
    } else if (message.indexOf('#!<REFR') == 0) {
      // 获取角膜左眼数据平均值
      sendMessage('#!<KRTL01#!>');
    } else if (message.indexOf('#!<KRTL') == 0) {
      // 获取角膜右眼数据平均值
      sendMessage('#!<KRTR01#!>');
    }
  };

  const ParsingScreenDataStr = async function () {
    console.log(
      "🚀 ~ file: form.vue:1069 ~ ParsingScreenDataStr ~ bluetoothInfo.value.name.indexOf('RM9000'):",
      bluetoothInfo.value.name.indexOf('RM9000'),
    );

    isDisabled.value = false;
    proxy.$publicFunc.showLoading('解析中...');
    uni.hideLoading();
    //如果是雄博，进入雄博的接收处理,否则进入新缘
    if (bluetoothInfo.value.name === 'RMK-800A') {
      let res = JSON.parse(pageData.screenDataStr);
      uploadXiongBo(res);
    } else if (bluetoothInfo.value.name === 'K71182220009') {
      //法里奥
      isDisabled.value = true;
      let screenDataStr = pageData.screenDataStr;
      let flag = true;
      while (flag) {
        let beginIdx = screenDataStr.indexOf('#!<');
        let endIdx = screenDataStr.indexOf('#!>');
        if (beginIdx > -1 && endIdx > -1 && beginIdx < endIdx) {
          let dataText = screenDataStr.substr(beginIdx, endIdx - beginIdx + 3);
          setScreenData(dataText);
          screenDataStr = screenDataStr.substr(endIdx - beginIdx + 3, screenDataStr.length);
          // 接收完整后发送下一个指令
          getScreenData(dataText);
        } else {
          flag = false;
        }
      }
      pageData.screenDataStr = screenDataStr;
    } else if (bluetoothInfo.value.name.indexOf('RM9000') != -1) {
      uploadTianLe(pageData.screenDataStr);
    } else if (bluetoothInfo.value.name.indexOf('FA-100K') != -1) {
      let res = {
        RS: {},
        LS: {},
        RD: {},
        LD: {},
        VD: '',
        PD: '',
      };
      let source = pageData.screenDataStr;
      //将字符串中多个空格合并为一个，不能直接去除否则数字数据粘连
      source = source.replace(/\s+/gi, ' ');
      //虽然只有单个空格，但还需要去除首尾空格
      source = source.trim();
      //将字符串按空格划分以数组形式存储，此时数组中无空格(验光仪蓝牙接收数据有误 导致PD=' '66 中存在一个未去除空格)
      source = source.split(/[ ,=]/);
      console.log('🚀 ~ file: form.vue:1141 ~ ParsingScreenDataStr ~ source:', source);
      let outFlag = true;
      let currentIndex = 0;
      while (outFlag) {
        if (source[currentIndex] === 'R:') {
          //while (rFlag) {
          currentIndex++;
          if (source[currentIndex] === 'S') {
            let RS = {};
            //跳过标志符号，直接到R S数值
            currentIndex += 3;
            RS.S = source[currentIndex];
            RS.C = source[++currentIndex];
            RS.A = source[++currentIndex];
            //跳过'S.E.'标志符号，直接取其数值
            currentIndex += 2;
            RS.SE = source[currentIndex];
            res.RS = RS;
          } else {
            let RD = {
              R1: {},
              R2: {},
              CYL: {},
            };
            //跳过标志符号，直接到R R1 D数值
            currentIndex += 4;
            RD.R1.D = source[currentIndex];
            RD.R1.MM = source[++currentIndex];
            RD.R1.A = source[++currentIndex];
            //跳过R2符号
            currentIndex += 2;
            RD.R2.D = source[currentIndex];
            RD.R2.MM = source[++currentIndex];
            RD.R2.A = source[++currentIndex];
            //跳过'CYL:'标志符号，直接取其数值
            currentIndex += 2;
            RD.CYL = source[currentIndex];
            res.RD = RD;
          }
          //}
        }
        if (source[currentIndex] === 'L:') {
          currentIndex++;
          if (source[currentIndex] === 'S') {
            let LS = {};
            //跳过标志符号，直接到L S数值
            currentIndex += 3;
            LS.S = source[currentIndex];
            LS.C = source[++currentIndex];
            LS.A = source[++currentIndex];
            //跳过'S.E.'标志符号，直接取其数值
            currentIndex += 2;
            LS.SE = source[currentIndex];
            res.LS = LS;
          } else {
            let LD = {
              R1: {},
              R2: {},
              CYL: {},
            };
            //跳过标志符号，直接到L R1 D数值
            currentIndex += 4;
            LD.R1.D = source[currentIndex];
            LD.R1.MM = source[++currentIndex];
            LD.R1.A = source[++currentIndex];
            //跳过R2符号
            currentIndex += 2;
            LD.R2.D = source[currentIndex];
            LD.R2.MM = source[++currentIndex];
            LD.R2.A = source[++currentIndex];
            //跳过'CYL:'标志符号，直接取其数值
            currentIndex += 2;
            LD.CYL = source[currentIndex];
            res.LD = LD;
            //此处已经是报文最后两个数据前的结尾
            /* res.VD = source[currentIndex + 2];
          res.PD = source[currentIndex + 5];
          outFlag = false; */
          }
          //}
        }
        currentIndex++;
        //新判断结尾方式
        if (currentIndex === source.length - 1) {
          res.VD = source[currentIndex - 3];
          res.PD = source[currentIndex];
          outFlag = false;
        }
      }
      // #ifdef APP
      // app，新缘FA-100 需检测设备是否入库，若未入库，则提示取消上传
      const reg = /^["#'](.*)["#']$/g; // 去除前后的#
      const sn = (source[0] || '').replace(reg, '$1');
      const result = await $http.check['getIsPermission']({ snNO: sn });
      console.log('🚀 ~ 设备入库判断接口报文:', result);
      if (!result) {
        uni.showModal({
          content: '非授权设备，请联系运营人员!',
          showCancel: false,
        });
        return;
      }
      pageData.form.refractionDeviceNo = sn;
      uploadXinYuan(res, true);
      // #endif
      return;
    } else {
      let res = {
        RS: {},
        LS: {},
        RD: {},
        LD: {},
        VD: '',
        PD: '',
      };
      let source = pageData.screenDataStr;
      //将字符串中多个空格合并为一个，不能直接去除否则数字数据粘连
      source = source.replace(/\s+/gi, ' ');
      //虽然只有单个空格，但还需要去除首尾空格
      source = source.trim();
      //将字符串按空格划分以数组形式存储，此时数组中无空格(验光仪蓝牙接收数据有误 导致PD=' '66 中存在一个未去除空格)
      source = source.split(/[ ,=]/);
      let outFlag = true;
      let currentIndex = 0;
      while (outFlag) {
        if (source[currentIndex] === 'R:') {
          //while (rFlag) {
          currentIndex++;
          if (source[currentIndex] === 'S') {
            let RS = {};
            //跳过标志符号，直接到R S数值
            currentIndex += 3;
            RS.S = source[currentIndex];
            RS.C = source[++currentIndex];
            RS.A = source[++currentIndex];
            //跳过'S.E.'标志符号，直接取其数值
            currentIndex += 2;
            RS.SE = source[currentIndex];
            res.RS = RS;
          } else {
            let RD = {
              R1: {},
              R2: {},
              CYL: {},
            };
            //跳过标志符号，直接到R R1 D数值
            currentIndex += 4;
            RD.R1.D = source[currentIndex];
            RD.R1.MM = source[++currentIndex];
            RD.R1.A = source[++currentIndex];
            //跳过R2符号
            currentIndex += 2;
            RD.R2.D = source[currentIndex];
            RD.R2.MM = source[++currentIndex];
            RD.R2.A = source[++currentIndex];
            //跳过'CYL:'标志符号，直接取其数值
            currentIndex += 2;
            RD.CYL = source[currentIndex];
            res.RD = RD;
          }
          //}
        }
        if (source[currentIndex] === 'L:') {
          currentIndex++;
          if (source[currentIndex] === 'S') {
            let LS = {};
            //跳过标志符号，直接到L S数值
            currentIndex += 3;
            LS.S = source[currentIndex];
            LS.C = source[++currentIndex];
            LS.A = source[++currentIndex];
            //跳过'S.E.'标志符号，直接取其数值
            currentIndex += 2;
            LS.SE = source[currentIndex];
            res.LS = LS;
          } else {
            let LD = {
              R1: {},
              R2: {},
              CYL: {},
            };
            //跳过标志符号，直接到L R1 D数值
            currentIndex += 4;
            LD.R1.D = source[currentIndex];
            LD.R1.MM = source[++currentIndex];
            LD.R1.A = source[++currentIndex];
            //跳过R2符号
            currentIndex += 2;
            LD.R2.D = source[currentIndex];
            LD.R2.MM = source[++currentIndex];
            LD.R2.A = source[++currentIndex];
            //跳过'CYL:'标志符号，直接取其数值
            currentIndex += 2;
            LD.CYL = source[currentIndex];
            res.LD = LD;
            //此处已经是报文最后两个数据前的结尾
            /* res.VD = source[currentIndex + 2];
          res.PD = source[currentIndex + 5];
          outFlag = false; */
          }
          //}
        }
        currentIndex++;
        //新判断结尾方式
        if (currentIndex === source.length - 1) {
          res.VD = source[currentIndex - 3];
          res.PD = source[currentIndex];
          outFlag = false;
        }
      }
      uploadXinYuan(res);
    }
  };
  const debounce = function (fn, delay) {
    let timer = '';
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(fn, delay);
      proxy.$publicFunc.showLoading('正在接收并解析数据');
    };
  };
  const isToTheEnd = debounce(() => {
    ParsingScreenDataStr();
  }, 1000);

  //checkMessage的作用就是拼接分段的报文，然后每次拼接完都调用一个定时函数（因为不确定哪一次是结尾，所以假设每一次都是结尾，如果是真结尾则在拼接完三秒内不会有第二次定时函数的调用）
  const checkMessage = message => {
    let screenDataStr = pageData.screenDataStr + message;
    pageData.screenDataStr = screenDataStr;
    //调用定时函数
    isToTheEnd();
  };

  pageId = `${new Date().getTime().toString(36)}${Math.random()}`;

  const bleCallback = function (res) {
    // TODO: 其实不应该是bt580，而应该拓普康，如何标志为拓普康
    if (bluetoothInfo.value.name === 'BT580') {
      const buffer = res.value;
      const bytesArr = bytesToASCII(buffer, 0);
      bluetoothNotifydataArr = bluetoothNotifydataArr.concat(bytesArr);
      if (bluetoothNotifydataArr[bluetoothNotifydataArr.length - 1] === 'e') {
        // 根据换行符转数组
        const dataArr = bluetoothNotifydataArr.join('').split(/[(\r\n)\r\n]+/);
        setScreenDataFromSerialDevice(dataArr);
        bluetoothNotifydataArr = [];
      }
    } else if (/JUMU/.test(bluetoothInfo.value.name)) {
      //之前的巨目的正则(/ARK-1/.test(bluetoothInfo.value.name))
      const buffer = res.value;
      const bitArrs = buffer2BitArr(buffer, 0);
      bluetoothNotifydataArr = bluetoothNotifydataArr.concat(bitArrs);
      if (bluetoothNotifydataArr[bluetoothNotifydataArr.length - 1] === 'e') {
        const paraseData = ArkMessageParse(bluetoothNotifydataArr);
        setScreenDataFromJRKDevice(paraseData);
        bluetoothNotifydataArr = [];
      }
    } else {
      // 当前无使用，注释
      // const receiverText = buf2string(res.value);
      //从这里开始进入雄博和新缘验光仪的报文接收
      try {
        let message;

        const buffer = new Uint8Array(res.value);
        message = gbk.decode(buffer);
        /* for (var i = 0; i < message.byteLength; i++) {
      } */
        //报文段 即message，每获取一段报文，就调用一次checkMessage
        console.log('🚀 ~ file: form.vue:1231 ~ bleCallback ~ message:', message);

        checkMessage(message);
      } catch (error) {
        console.log('🚀 ~ file: form.vue:1235 ~ bleCallback ~ error:', error);
      }
    }
  };

  uni.$on(pageId, bleCallback);

  // 监听蓝牙设备的特征值变化
  uni.onBLECharacteristicValueChange(res => {
    console.log('🚀 ~ file: form.vue:1240 ~ res:', res);
    uni.$emit(pageId, res);
  });
});

onUnload(() => {
  uni.$off(pageId);
});

//以下内容是当蓝牙设备为巨目和托康普涉及到的方法
</script>

<style lang="scss" scoped>
.user-card2 {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  line-height: 48rpx;
  justify-content: space-between;
}
.flex-style {
  display: flex;
}
.scanQR-content {
  display: flex;
  justify-content: center;
}
.scanQR {
  width: 400rpx;
  height: 400rpx;
  margin: 0 auto;
}

.marL {
  image {
    width: 50rpx;
    height: 50rpx;
  }
}
.empty_bg {
  width: 200rpx;
  margin: 140rpx auto 70rpx;
  .imageHeight {
    height: 100.88px;
  }
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
