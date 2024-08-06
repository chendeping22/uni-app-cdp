<template>
  <view class="page pageBg">
    <view :style="{ height: statusBarHeight + 'px' }" />
    <view class="head-title-content">
      <image class="icon-home-size" :src="icon_white_back" @click="goBack" />
    </view>

    <view class="content">
      <view class="header">
        <view class="header-left">
          <u-image
            width="108"
            height="108"
            :src="staffUserInfo.headImgUrl || icon_avatar"
            :error-icon="icon_avatar"
            mode="aspectFill"
            shape="square"
            border-radius="16"
            bg-color="#ffffff"
          />
          <view class="header-details">
            <view class="header-name" @click="handleShowName">
              <view class="name-text">{{ staffUserInfo.name }} </view>
              <u-image
                v-if="staffUserInfo.gender !== null"
                width="40"
                height="40"
                :src="staffUserInfo.gender === 1 ? man_icon : female_icon"
                mode="aspectFill"
                border-radius="16"
              />
              <view v-if="nameTipShow" class="name-tips-box">
                <view class="name-tips">
                  {{ staffUserInfo.name }}
                </view>
              </view>
            </view>
            <view class="header-status">
              <view class="status-btn">{{ DUTYSTATUS[staffUserInfo.onDutyStatus] }}</view>
            </view>
          </view>
        </view>
        <view class="header-right" @click="handleUserFrequentContacts">
          <view class="contacts-text">{{ `${existing ? '取消' : ''}常用联系人` }}</view>
        </view>
      </view>
      <view class="header-btn-con">
        <view
          :style="`${staffUserInfo.locationLevel === 0 ? 'width: 100%' : ''}`"
          class="header-btn"
          @click="handleToWeekly"
        >
          <u-image width="40" height="40" :src="icon_schedule" mode="aspectFill" />
          <text class="btn-text">{{
            `${
              staffUserInfo.gender === null ? 'TA' : staffUserInfo.gender === 1 ? '他' : '她'
            }的日程`
          }}</text>
        </view>
        <view
          v-if="staffUserInfo.locationLevel === 1"
          class="header-btn"
          @click="handleToCurriculum"
        >
          <u-image width="40" height="40" :src="icon_curriculum" mode="aspectFill" />
          <text class="btn-text">{{
            `${
              staffUserInfo.gender === null ? 'TA' : staffUserInfo.gender === 1 ? '他' : '她'
            }的课表`
          }}</text>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="item-con">
        <view class="item-name">单位</view>
        <view class="item-info">{{ staffUserInfo.locationName || '/' }}</view>
      </view>
      <view class="item-con">
        <view class="item-name">主职部门</view>
        <view class="item-info">{{ staffUserInfo.deptStr || '/' }}</view>
      </view>
      <view class="item-con">
        <view class="item-name">兼职部门</view>
        <view class="item-info">{{ staffUserInfo.pluralismDeptStr || '/' }}</view>
      </view>
      <view class="item-con">
        <view class="item-name">职位</view>
        <view class="item-info">{{ departmentName }}</view>
      </view>
      <view class="item-con">
        <view class="item-name">手机号</view>
        <view class="item-info tel">
          <view class="tel-num">{{ getPhoneText(staffUserInfo.tel) }}</view>
          <view
            v-if="privacyPermissions && staffUserInfo.tel"
            class="icon-sex-size"
            @click="showTel = !showTel"
          >
            <u-icon size="30" :name="`${showTel ? 'eye-fill' : 'eye-off'}`" />
          </view>
        </view>
      </view>
    </view>
    <view class="bottom-btn">
      <!-- #ifdef APP-PLUS || H5 -->
      <view class="btn mr-12" @click="handleShowMore">
        <u-icon size="40" name="more-dot-fill" />
      </view>
      <view class="btn large mr-12" @click="handleSendMessage">
        <u-icon size="40" name="chat" />
        <text>发短信</text>
      </view>
      <!-- #endif -->
      <view class="btn large" @click="handleCall">
        <u-icon size="40" name="phone-fill" />
        <text>拨打电话</text>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <view
        class="btn large ml-12"
        @click="
          () => {
            handleShareByMini();
          }
        "
      >
        <u-icon size="40" name="share-fill" />
        <text>分享</text>
      </view>
      <!-- #endif -->
      <view v-if="guideShow" class="btn-tips" @click="onGuideShowFinished">
        <text>更多功能点击这里</text>
      </view>
    </view>
    <u-action-sheet
      v-model="actionSheetShow"
      :list="actionSheetList"
      @click="handleActionSheet"
      @close="actionSheetShow = false"
    ></u-action-sheet>
    <!-- <shareCard
      :icon-avatar="staffUserInfo.headImgUrl"
      :tel="getPhoneText(staffUserInfo.tel, 1)"
      :is-show="showShare"
      :user-info="staffUserInfo"
      :gender-icon="staffUserInfo.gender === 1 ? man_icon : female_icon"
      @close="showShare = false"
    /> -->
    <!-- #ifdef APP-PLUS || H5-->
    <u-popup
      v-model="showShare"
      mode="bottom"
      :border-radius="16"
      :mask-close-able="true"
      @close="onClose"
    >
      <view class="title">分享联系人</view>
      <view class="share-content">
        <view class="share-item">
          <view>
            <view class="arrow-down" @click="handleDownload">
              <u-image width="48" height="48" :src="icon_arrow_down" />
            </view>
            <view class="share-text">下载到手机</view>
          </view>
        </view>
        <view class="share-item" @click="handleShareWX">
          <view>
            <u-image width="80" height="80" :src="icon_wechat" />
            <view class="share-text">微信</view>
          </view>
        </view>
        <!-- <view class="share-item">
        <view>
          <u-image width="80" height="80" :src="icon_qq" />
          <view class="share-text">QQ</view>
        </view>
      </view>
      <view class="share-item">
        <view>
          <u-image width="80" height="80" :src="icon_dd" />
          <view class="share-text">钉钉</view>
        </view>
      </view> -->
      </view>
    </u-popup>
    <!-- #endif -->
    <!-- #ifdef  MP-WEIXIN-->
    <u-mask :show="showShare" @click="onClose">
      <view :show="showShare" class="share-image-tips">长按图片保存到手机或分享给朋友</view>
    </u-mask>
    <!-- #endif -->
    <view
      :class="`share-canvas-wrapper ${showShare ? 'show' : ''}`"
      :style="`margin-top: ${topVal}`"
    >
      <canvas
        id="shareCanvas"
        canvas-id="shareCanvas"
        class="share-canvas"
        @error="(val: any) => {console.log('===canvas', val)}"
      />
      <!-- #ifdef  MP-WEIXIN-->
      <u-image
        class="share-canvas-image"
        width="355px"
        height="457px"
        :show-menu-by-longpress="true"
        :src="shareImageUrl"
        :fade="false"
        :show-error="false"
        :show-loading="false"
      />
      <!-- #endif -->
    </view>
  </view>
</template>
<script lang="ts" setup>
import pic_code from '@/app-platform/static/contacts/code.png';
import icon_arrow_down from '@/app-platform/static/contacts/icon_arrow_down.png';
import icon_curriculum from '@/app-platform/static/contacts/icon_curriculum.svg';
import icon_schedule from '@/app-platform/static/contacts/icon_schedule.svg';
import female_icon from '@/app-platform/static/contacts/icon_sex_female.png';
import man_icon from '@/app-platform/static/contacts/icon_sex_man.png';
import icon_wechat from '@/app-platform/static/contacts/icon_wechat.png';
import icon_white_back from '@/app-platform/static/contacts/icon_white_back.svg';
import share_card_bg from '@/app-platform/static/contacts/share_card_bg.png';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import {
  StaffUserInfoState,
  addStaffFrequentContacts,
  delStaffFrequentContacts,
  existStaffFrequentContacts,
  getStaffUserInfo,
} from '@/services/contact';
import { getFileInfo, getUploadUrl, updateUploadResult, uploadFile } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { Server_Asset_Prefix } from '@/utils/constant';
import { getPageParams, log, showInfo } from '@/utils/tools';
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
import { DUTYSTATUS } from './enum';
import icon_avatar from '/static/avatar.png';

interface IPageParam {
  id: string;
}
// 新人引导
const guideShow = ref(false);
const guideTagVal = ref('');
const guideKeyName = 'schoolAffairsGuide';
const guideTagKey = 'contacts';

const nameTipShow = ref(false);
const statusBarHeight = ref();
const screenHeight = ref(0);
const uniPlatform = ref('');

const actionSheetShow = ref(false);
const actionSheetList = ref([
  {
    text: '增加新联系人至手机通讯录',
    fontSize: 32,
  },
  {
    text: '添加现有联系人至手机通讯录',
    fontSize: 32,
  },
  {
    text: '分享',
    fontSize: 32,
  },
]);
const userInfo = loginStore().userInfo;
const privacyPermissions = ref(false);
const showTel = ref(false);
const pageParam = ref<IPageParam>({
  id: '',
});
const staffUserInfo = ref<StaffUserInfoState>({
  name: '',
  locationName: '',
  tel: '',
  deptStr: '',
  pluralismDeptStr: '',
  gender: null,
  position: '',
  headImgUrl: '',
  locationId: '',
  id: '',
  onDutyStatus: -1,
  locationLevel: 0,
  userDepartmentRes: [],
});
const existing = ref(false);
const showShare = ref(false);
const drawStatus = ref(false);

// 新人引导
const handleShowGuide = async () => {
  guideTagVal.value = await uni.getStorageSync(guideKeyName);
  if (!guideTagVal.value) {
    guideShow.value = true;
  } else {
    const val = JSON.parse(guideTagVal.value)[guideTagKey];
    if (!val) {
      guideShow.value = true;
    }
  }
};

const onGuideShowFinished = async () => {
  guideShow.value = false;
  guideTagVal.value = await uni.getStorageSync(guideKeyName);
  if (!guideTagVal.value) {
    uni.setStorageSync(guideKeyName, JSON.stringify({ contacts: '1' }));
  } else {
    const val = JSON.parse(guideTagVal.value);
    if (!val[guideTagKey]) {
      val[guideTagKey] = 1;
      uni.setStorageSync(guideKeyName, JSON.stringify(val));
    }
  }
};
const goBack = () => {
  uni.navigateBack();
};
const handleShowMore = () => {
  actionSheetShow.value = true;
  if (guideShow.value) {
    onGuideShowFinished();
  }
};
let timer: any = null;
const handleShowName = () => {
  if (!nameTipShow.value) {
    nameTipShow.value = true;
    timer = setTimeout(() => {
      clearTimeout(timer);
      nameTipShow.value = false;
    }, 3000);
  } else {
    nameTipShow.value = false;
    clearTimeout(timer);
  }
};
const handleActionSheet = (index: number) => {
  console.log('===index', index);
  switch (index) {
    case 0:
      //新增联系人
      handleAddContacts();
      break;
    case 1:
      //更新现有联系人
      handleUpdateContact();
      break;
    case 2:
      // 分享
      handleShowSharePop();
      break;
    default:
      actionSheetShow.value = false;
  }
};
//获取教职工详情
const fetchStaffUserInfo = async () => {
  staffUserInfo.value = await getStaffUserInfo(pageParam.value.id);
  console.log('===userInfo', staffUserInfo.value);
  // 初始化canvas
  initShareCanvas();
};
// 判断是否是常用联系人
const fecthExistStaffFrequentContacts = async () => {
  const result = await existStaffFrequentContacts(pageParam.value.id);
  existing.value = result.existing;
};
//操作常用联系人
const handleUserFrequentContacts = () => {
  if (existing.value) {
    //取消常用联系人
    delStaffFrequentContacts(pageParam.value.id)
      .then(() => {
        showInfo(`已取消${staffUserInfo.value.name}常用联系人`);
        existing.value = false;
      })
      .catch(() => {
        showInfo(`取消失败，请稍后再试！`);
      });
  } else {
    //添加常用联系人
    addStaffFrequentContacts(pageParam.value.id)
      .then(() => {
        showInfo(`已添加${staffUserInfo.value.name}为常用联系人`);
        existing.value = true;
      })
      .catch(() => {
        showInfo(`添加失败，请稍后再试！`);
      });
  }
};
//跳转到周行事历的个人日程
const handleToWeekly = () => {
  uni.navigateTo({
    url: `/app-school-affairs/weekly-calendar/home/index?userId=${staffUserInfo.value.id}&locationId=${staffUserInfo.value.locationId}&gender=${staffUserInfo.value.gender}&queryType=[1,2,3,4]`,
  });
};

//跳转到课表
const handleToCurriculum = () => {
  const { locationId, id } = staffUserInfo.value;
  uni.navigateTo({
    url: `/app-school-affairs/curriculum-schedule/index?locationId=${locationId}&userId=${id}`,
  });
};
// 判断是否有隐私权限
const hasPrivacyPermissions = () => {
  privacyPermissions.value = userInfo.containsQuery;
  console.log('===privacyPermissions', privacyPermissions.value);
};

// 部门名称
const departmentName = computed(() => {
  const { userDepartmentRes } = staffUserInfo.value;
  if (userDepartmentRes.length > 0) {
    const departmentNameArr = userDepartmentRes.map(item => item.positionName);
    if (departmentNameArr.length > 0) {
      return departmentNameArr.join('/') || '/';
    } else {
      return '/';
    }
  } else {
    return '/';
  }
});
// 显示带*手机号码
const getPhoneText = (tel: string, index?: number) => {
  if (!!tel) {
    return privacyPermissions.value && !index && !showTel.value
      ? tel.substring(0, 3) + '****' + tel.substring(7)
      : tel;
  }
  return '/';
};
const isPhoneNull = () => {
  const tel = staffUserInfo.value.tel;
  if (!tel) {
    showInfo(`该用户暂未绑定手机号`);
    return true;
  }
  return false;
};
// 拨打电话
const handleCall = () => {
  if (isPhoneNull()) return;
  if (privacyPermissions.value) {
    uni.makePhoneCall({
      phoneNumber: staffUserInfo.value.tel,
    });
  } else {
    showInfo(`您未开通查看用户隐私权限，不支持拨号!`);
  }
};

// 发短信
const handleSendMessage = async () => {
  if (isPhoneNull()) return;
  if (privacyPermissions.value) {
    await callBridge({
      service: Service.system,
      action: Action.sendMessage,
      data: {
        phoneNumbers: [staffUserInfo.value.tel],
        content: '发送短信',
      },
    }).catch((err: any) => {
      let msg = '不支持该功能';
      console.log('====err', err);
      if (err.code === 401) {
        msg = '发送短信失败，请开启权限后再试';
      }
      showInfo(msg);
    });
  } else {
    showInfo(`您未开通查看用户隐私权限，不支持发送短信!`);
  }
};
// 添加联系人
const handleAddContacts = () => {
  if (isPhoneNull()) return;
  if (privacyPermissions.value) {
    callBridge({
      service: Service.system,
      action: Action.addContact,
      data: {
        givenName: staffUserInfo.value.name,
        phoneNumber: staffUserInfo.value.tel,
        organizationName: staffUserInfo.value.locationName,
      },
    }).catch((err: any) => {
      let msg = '不支持该功能';
      if (err.code === 401) {
        if (plus.os.name === 'iOS') {
          handleToSystemSetPage();
        } else {
          msg = '未开启通讯录权限，请开启权限后再试';
          showInfo(msg);
        }
      }
    });
  } else {
    showInfo(`您未开通查看用户隐私权限，不支持保存通讯录!`);
  }
};
//修改现有联系人
const handleUpdateContact = () => {
  if (isPhoneNull()) return;
  if (privacyPermissions.value) {
    callBridge({
      service: Service.system,
      action: Action.updateContact,
      data: {
        // givenName: staffUserInfo.value.name,
        phoneNumber: staffUserInfo.value.tel,
        // organizationName: staffUserInfo.value.locationName,
      },
    }).catch((err: any) => {
      let msg = '不支持该功能';
      if (err.code === 401) {
        if (plus.os.name === 'iOS') {
          handleToSystemSetPage();
        } else {
          msg = '未开启通讯录权限，请开启权限后再试';
          showInfo(msg);
        }
      }
    });
  } else {
    showInfo(`您未开通查看用户隐私权限，不支持保存通讯录!`);
  }
};
//跳转设置页
const handleToSystemSetPage = () => {
  const appName = import.meta.env.VITE_APP_NAME;
  uni.showModal({
    title: '',
    content: `请在iPhone的”设置-隐私-通讯录”选项中，允许${appName}访问你的通讯录`,
    confirmText: '前往设置',
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {
        callBridge({
          service: Service.system,
          action: Action.openSetting,
          data: {},
        });
      }
    },
  });
};
// 显示分享面板
const handleShowSharePop = () => {
  showShare.value = true;
};
onBeforeMount(() => {
  //获取手机系统信息
  const info = uni.getSystemInfoSync();
  //设置状态栏高度
  statusBarHeight.value = info.statusBarHeight;
  screenHeight.value = info.screenHeight ?? 0;
  uniPlatform.value = info.uniPlatform;
  pageParam.value = getPageParams();

  log('detail-pageParam : ', pageParam.value);
  fetchStaffUserInfo();
  fecthExistStaffFrequentContacts();
  hasPrivacyPermissions();
  // #ifdef APP-PLUS || H5
  handleShowGuide();
  // #endif
});
const topVal = computed(() => {
  if (screenHeight.value <= 750 && uniPlatform.value !== 'mp-weixin') {
    return '-310px';
  } else {
    return '-258px';
  }
});

const shareInfo = reactive({
  canvasContext: null as any,
  canvasWidth: 0,
  canvasBgHeight: 0,
  textAreaHeight: 0,
  shareImageUrl: '',
  moreTop: 0,
});
const shareImageUrl = ref('');
const defaultAvatar = ref(icon_avatar);
const store = loginStore();

const onClose = () => {
  showShare.value = false;
};
// 上传图片
const handleUploadFile = async () => {
  if (shareInfo.shareImageUrl) {
    const currentFilePath = shareInfo.shareImageUrl;
    const fileName = currentFilePath.split('/').pop() || '';
    console.log('===fileName', fileName);
    const requestParams: any = {
      locationId: store.userInfo?.locationId,
      fileType: currentFilePath.split('.').pop() || '',
      bucketType: 'public',
    };
    const getUploadUrlData = await getUploadUrl(requestParams);
    console.log('====uploadUrlData', getUploadUrlData);
    const uploadResponse: any = await callBridge({
      service: Service.file,
      action: Action.fileUpload,
      data: {
        uploadUrl: getUploadUrlData.uploadUrl,
        header: getUploadUrlData.header,
        filePath: currentFilePath,
        fileType: getUploadUrlData.fileType,
      },
    });
    console.log('===uploadResponse', uploadResponse);
    if (uploadResponse.status == 1) {
      const updateResult = await updateUploadResult(
        getUploadUrlData.fileId,
        uploadResponse.status,
        fileName,
      );
      if (updateResult) {
        const fileInfo = await getFileInfo(getUploadUrlData.fileId);
        return fileInfo;
      }
    }
  }
  return null;
};
//下载到手机
const handleDownload = async () => {
  console.log('===保存图片');
  const fileInfo = await handleUploadFile();
  if (fileInfo !== null) {
    uni.saveImageToPhotosAlbum({
      filePath: fileInfo.fullUrl,
      success: function () {
        showInfo(`保存成功`);
      },
    });
    // callBridge({
    //   service: Service.file,
    //   action: Action.fileDownloadAndOpen,
    //   data: {
    //     filePath: fileInfo.fullUrl,
    //     fileType: fileInfo.fileType,
    //   },
    // }).catch(() => {
    //   showInfo(`不支持该功能！`);
    // });
  }
};

onMounted(async () => {});
const initShareCanvas = async () => {
  const context = uni.createCanvasContext('shareCanvas');
  const query = uni.createSelectorQuery();
  query
    .select('#shareCanvas')
    .boundingClientRect((res: any) => {
      console.log('===res', res);
      shareInfo.canvasWidth = 355; // 将upx单位转换为px，假设设计稿宽度为750rpx
      shareInfo.canvasBgHeight = 457;
      context.setFillStyle('white'); // 设置背景颜色为白色，可以替换为其他颜色
      roundRect(context, 0, 0, 355, 457, 10);
      context.fill();
      roundRect(context, 0, 0, 355, 457, 10);
      context.clip();
      context.restore();
      // context.fillRect(0, 0, 355, 457);
      context.drawImage(share_card_bg, 0, 0, 355, 309); // 绘制SVG图片
      context.shadowColor = 'rgba(0, 0, 0, 0.2)';
      context.shadowBlur = 20;
      roundRect(context, 16, 55, 323, 229, 10);
      context.fill();
      // context.fillRect(16, 55, 323, 229);
      context.drawImage(pic_code, 133, 330, 88, 88);
      context.save();
      shareInfo.canvasContext = context;
    })
    .exec();
  setTimeout(() => {
    _setShareImg();
  }, 500);
};
// 圆角矩形实现
function roundRect(context, x, y, w, h, r) {
  let min_size = Math.min(w, h);
  if (r > min_size / 2) r = min_size / 2;
  // 开始绘制
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}
// 绘制分享的canvas
function transformContentToMultiLineText(
  ctx: any,
  text: string,
  contentWidth: number,
  lineNumber: number,
) {
  let textArray = text.split(''); // 分割成字符串数组
  let temp = '';
  let row = [];

  for (let i = 0; i < textArray.length; i++) {
    if (ctx.measureText(temp).width < contentWidth) {
      temp += textArray[i];
    } else {
      i--; // 这里添加i--是为了防止字符丢失
      row.push(temp);
      temp = '';
    }
  }
  row.push(temp);

  // 如果数组长度大于2，则截取前两个
  if (row.length > lineNumber) {
    let rowCut = row.slice(0, lineNumber);
    let rowPart = rowCut[lineNumber - 1];
    let test = '';
    for (let a = 0; a < rowPart.length; a++) {
      if (ctx.measureText(test + '...').width < contentWidth) {
        test += rowPart[a];
      } else {
        break;
      }
    }
    let group = test + '...';
    rowCut.splice(lineNumber - 1, 1, group);
    row = rowCut;
  }
  return row;
}
async function _setShareImg() {
  if (!shareInfo.canvasContext) {
    setTimeout(() => {
      _setShareImg();
    }, 200);
    return;
  }
  console.log('APP-PLUS 图片绘制 start');
  const { locationName, pluralismDeptStr, position, deptStr, gender, tel, name, headImgUrl } =
    staffUserInfo.value;
  const context = shareInfo.canvasContext;
  context.shadowColor = 'transparent';
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(0, 0, 0, 0.65)'; // 设置文案颜色
  context.font = '15px PingFang SC'; // 设置文案字体和大小
  context.textAlign = 'left';
  context.fillText('单位', 32, 140, 60);
  context.fillText('主职部门', 32, 165, 60);
  context.fillText('兼职部门', 32, 190, 60);
  context.fillText('职位', 32, 215, 60);
  context.fillText('手机号', 32, 240, 60);
  context.fillText('来自麦塔校园', 133, 435);
  context.save();
  context.restore();
  context.fillStyle = 'rgba(0, 0, 0, 0.88)'; // 设置文案颜色
  context.font = '15px PingFang SC'; // 设置文案字体和大小
  context.textAlign = 'left';
  const lines = transformContentToMultiLineText(context, locationName || '/', 221, 1);
  lines.forEach((txt: any) => {
    context.fillText(txt, 104, 140, 221);
  });
  const deptStrLines = transformContentToMultiLineText(context, deptStr || '/', 221, 1);
  deptStrLines.forEach((txt: any) => {
    context.fillText(txt, 104, 165, 221);
  });
  const pluralismLines = transformContentToMultiLineText(context, pluralismDeptStr || '/', 221, 1);
  pluralismLines.forEach((txt: any) => {
    context.fillText(txt, 104, 190, 221);
  });
  const positionLines = transformContentToMultiLineText(context, departmentName.value, 221, 1);
  positionLines.forEach((txt: any) => {
    context.fillText(txt, 104, 215, 221);
  });
  context.fillText(getPhoneText(tel, 1), 104, 240, 251);
  context.save();
  context.restore();
  context.fillStyle = 'rgba(0, 0, 0, 0.88)'; // 设置文案颜色
  context.font = '500 17px PingFang SC';
  context.textAlign = 'center';
  context.fillText(name, 175, 110, 200);
  context.save();
  console.log('APP-PLUS 图片绘制 start 2');
  context.beginPath();
  context.shadowColor = 'rgba(0, 0, 0, 0.4)';
  context.shadowBlur = 20;
  context.shadowOffsetY = 4;
  context.arc(177, 52, 31, 0, 2 * Math.PI);
  context.fillStyle = '#fff'; //设置填充颜色
  context.fill(); //开始填充
  context.save();
  context.beginPath();
  context.arc(177, 52, 29, 0, 2 * Math.PI);
  context.clip();
  console.log('APP-PLUS 图片绘制 start 3');
  if (headImgUrl) {
    await new Promise(resolve => {
      try {
        console.log('APP-PLUS 图片绘制 start 4', headImgUrl);
        // 在微信小程序上 downloadFile 合法域名 添加了 https://test2impfile.lexikos.com
        uni.getImageInfo({
          src: headImgUrl,
          success: res => {
            // 绘制圆形头像
            context.drawImage(res.path, 146, 20, 62, 62);
            console.log('APP-PLUS 图片绘制 start 5', res.path);
            resolve(res.path);
          },
          fail: (error: any) => {
            console.log('APP-PLUS 图片绘制 5 error', error);
            resolve(true);
            context.drawImage(defaultAvatar.value, 146, 20, 62, 62);
          },
        });
      } catch (error) {
        console.log('APP-PLUS 图片绘制 start 4 error', error);
        resolve(true);
        context.drawImage(defaultAvatar.value, 146, 20, 62, 62);
      }
    });
  } else {
    console.log('APP-PLUS 图片绘制默认头像', defaultAvatar.value);
    context.drawImage(defaultAvatar.value, 146, 20, 62, 62);
  }
  context.restore();
  if (gender) {
    context.beginPath();
    context.setFillStyle('white');
    context.arc(195, 72, 10, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.drawImage(gender === 1 ? man_icon : female_icon, 187, 64, 16, 16);
    context.save();
  }

  console.log('APP-PLUS 图片绘制 end---');
  context.draw(false, () => {
    uni.canvasToTempFilePath({
      fileType: 'jpg',
      canvasId: 'shareCanvas', // canvas 的 id
      success: (res2: any) => {
        console.log('APP-PLUS 读取图片 tempFilePath', res2);
        uni.getImageInfo({
          src: res2.tempFilePath,
          success: res3 => {
            console.log('APP-PLUS 图片地址转换', res3);
            if (res3.path) {
              shareInfo.shareImageUrl = res3.path;
              console.log('APP-PLUS 图片地址', shareInfo.shareImageUrl);
              drawStatus.value = true;
            } else {
              console.log('APP-PLUS 图片地址转换 error', res3);
              drawStatus.value = true;
            }
          },
          fail: (error: any) => {
            console.log('APP-PLUS 图片地址转换 error 2', error);
            drawStatus.value = true;
          },
          complete: (res: any) => {
            console.log('APP-PLUS 图片地址转换 completed', res);
            drawStatus.value = true;
          },
        });
      },
    });
  });
}
// #ifdef MP-WEIXIN
let drawTimer: any = null;
const handleShareByMini = async () => {
  // let imageUrl = `${Server_Asset_Prefix}img_invite.png`;
  if (drawStatus.value === true) {
    uni.hideLoading();
    clearTimeout(drawTimer);
  } else {
    uni.showLoading();
    clearTimeout(drawTimer);
    drawTimer = setTimeout(() => {
      handleShareByMini();
    }, 300);
    return;
  }
  handleShowSharePop();
  let fileId = '';
  if (shareInfo.shareImageUrl) {
    await new Promise((resolve, reject) => {
      uploadFile(
        {
          path: shareInfo.shareImageUrl,
          extname: 'jpg',
        },
        shareInfo.shareImageUrl,
        {
          showLoading: true,
          useCompressUrl: false,
          isPublic: true,
          anon: false,
          isThumbnailUrl: false,
          isFollowCloudEdge: false,
          isFormDataReq: false,
        },
      )
        .then((res: any) => {
          fileId = res.fileId;
          resolve(true);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  if (fileId) {
    const updateResult = await updateUploadResult(fileId, 1, Date.now().toString() + '.jpg');
    if (updateResult) {
      const fileInfo = await getFileInfo(fileId);
      console.log('===shareImageUrl', fileInfo);
      shareImageUrl.value = fileInfo.fullUrl;
    }
  }
};
// #endif

// #ifdef APP-PLUS || H5
async function handleShareWX() {
  // 检查是否安装了微信
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    showInfo('您的手机尚未安装微信');
    return;
  }
  const appid = plus.runtime.appid;
  if (!appid) {
    showInfo('找不到appid');
    return;
  }

  let shareImageUrl = `${Server_Asset_Prefix}img_invite.png`;
  console.log('APP-PLUS 分享图片默认地址', shareImageUrl);
  console.log('APP-PLUS 分享图片地址', shareInfo.shareImageUrl);
  const fileInfo = await handleUploadFile();
  if (fileInfo !== null) {
    shareImageUrl = fileInfo.fullUrl;
  }
  const opt: UniApp.ShareOptions = {
    provider: 'weixin',
    type: 2,
    imageUrl: shareImageUrl,
    scene: 'WXSceneSession',
    success(result) {
      console.log(
        '🚀 ~ file: class-files.vue ~ line 215 ~ success ~ result' + JSON.stringify(result),
      );
    },
    fail(e) {
      console.log('🚀 ~ file: class-files.vue ~ line 218 ~ fail ~ e' + JSON.stringify(e));
    },
  };

  uni.share(opt);
}
// #endif
</script>
<style lang="scss" scoped>
.bottom-btn {
  z-index: 2;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx 92rpx;
  background-color: #fff;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
  .btn {
    display: flex;
    height: 80rpx;
    justify-content: center;
    align-items: center;
    border-radius: 16rpx;
    color: #1677ff;
    padding: 0 20rpx;
    border: 2rpx solid #1677ff;
    &.large {
      flex: 1;
      min-width: 280rpx;
    }
    &.ml-12 {
      margin-left: 24rpx;
    }
    &.mr-12 {
      margin-right: 24rpx;
    }
    text {
      margin-left: 20rpx;
      font-weight: 500;
      font-size: 30rpx;
    }
  }
  .btn-tips {
    position: absolute;
    top: -86rpx;
    left: 32rpx;
    background: #fff;
    padding: 16rpx 24rpx;
    border-radius: 8rpx;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
    &::after {
      position: absolute;
      top: 66rpx;
      left: 28rpx;
      border: 18rpx solid transparent;
      border-top-color: #fff;
      content: '\200B';
    }
    text {
      color: #000000e0;
      font-size: 30rpx;
    }
  }
}
.content {
  margin: 24rpx 32rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 2rpx 4rpx 0 #0000000a;
  border-radius: 16rpx;
  .item-con {
    display: flex;
    margin-bottom: 16rpx;
    align-items: center;
  }
  .item-name {
    width: 160rpx;
    height: 40rpx;
    color: #000000a6;
    font-size: 30rpx;
  }
  .item-info {
    width: 400rpx;
    height: 40rpx;
    font-size: 30rpx;
    color: #000000e0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.tel {
      display: flex;
      align-items: center;
    }
    .tel-num {
      width: 180rpx;
      margin-right: 20rpx;
    }
  }
}
.icon-sex-size {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40rpx;
  height: 40rpx;
}
.header {
  display: flex;
  justify-content: space-between;
}
.header-left {
  display: flex;
}
.header-details {
  margin-left: 32rpx;
  margin-top: 8rpx;
}
.header-name {
  position: relative;
  display: flex;
  margin-bottom: 8rpx;
  .name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 230rpx;
    height: 48rpx;
    color: #000000e0;
    font-size: 34rpx;
    font-weight: 500;
    margin-right: 16rpx;
  }
  .name-tips-box {
    position: absolute;
    bottom: 60rpx;
    left: -150rpx;
    width: 640rpx;
    display: flex;
    justify-content: center;
    .name-tips {
      background: #fff;
      border-radius: 8rpx;
      padding: 16rpx 24rpx;
      box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.08);
    }
    &::after {
      position: absolute;
      bottom: -70rpx;
      left: 50%;
      margin-left: -16rpx;
      border: 18rpx solid transparent;
      border-top-color: #fff;
      content: '\200B';
      z-index: 20;
    }
  }
}
.header-status {
  display: flex;
  .status-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48rpx;
    padding: 0 16rpx;
    background: #f6ffed;
    border-radius: 8rpx;
    color: #52c41a;
    font-size: 26rpx;
  }
}
.header-right {
  display: flex;
  .contacts-text {
    margin-top: 6rpx;
    height: 48rpx;
    line-height: 48rpx;
    color: #1677ff;
    font-size: 26rpx;
    font-weight: 500;
  }
}
.header-btn-con {
  display: flex;
  margin-top: 24rpx;
  justify-content: space-between;
  .header-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300rpx;
    height: 80rpx;
    color: #000000e0;
    border: 2rpx solid #00000026;
    border-radius: 16rpx;
    .btn-text {
      margin-left: 16rpx;
      font-weight: 500;
      font-size: 30rpx;
    }
  }
}
.pageBg {
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('@/app-platform/static/contacts/bg_info.png');
}
.head-title-content {
  display: flex;
  align-items: center;
  height: 88rpx;
}
.icon-home-size {
  margin: 0 32rpx;
  width: 48rpx;
  height: 48rpx;
}
// 分享样式
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  color: #000000e0;
  font-size: 34rpx;
  font-weight: 500;
}
.share-content {
  display: flex;
  // justify-content: space-around;
  align-items: center;
  padding-bottom: 68rpx;
}
.share-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 184rpx;
  height: 184rpx;
}
.share-text {
  margin-top: 16rpx;
  text-align: center;
  color: #000000e0;
  font-size: 24rpx;
}
.share-canvas-wrapper {
  position: absolute;
  top: -100000rpx;
  // top: 200rpx;
  left: 50%;
  margin-left: -178px;
  width: 355px;
  height: 457px;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 99999;
  &.show {
    top: 50%;
    margin-top: -258px;
  }
}
.share-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.share-canvas-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}
.arrow-down {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto;
}
.share-image-tips {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400rpx;
  margin-top: 220px;
  margin-left: -200rpx;
  color: #fff;
  font-size: 26rpx;
}
</style>
