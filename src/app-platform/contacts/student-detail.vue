<template>
  <view class="scroll-content page">
    <view style="/* 设置阴影 */ box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.03)"></view>
    <view v-show="pageShow" class="scroll-content">
      <!--学生信息-->
      <text class="stu-info-text">{{
        `学生信息 (${stuDetail.clazzName ? stuDetail.clazzName : ''})`
      }}</text>
      <view class="content-head">
        <image class="avatar-size" :src="`${profileDetail.img ? profileDetail.img : icon_avatar}`" mode="aspectFit" />
        <view class="user-rect">
          <view>
            <text class="username-text">{{ profileDetail.name }}</text>
          </view>
          <view>
            <text class="useriden-text">{{ profileDetail.desc }}</text>
          </view>
        </view>
        <view v-if="initPrivacyFlag" @click="handleEye">
          <u-icon class="eye-wrap" :name="eyeToggle ? 'eye' : 'eye-off'" color="#000000E0" size="32"></u-icon>
        </view>
      </view>
      <view class="allergy-info-content-head">
        <view class="content-flex">
          <view class="allergy-info-left"> 出生日期 </view>
          <view>{{ formatDate(stuDetail.birthday) || '/' }}</view>
        </view>
        <view v-if="false" class="content-flex-start" style="margin-top: 16rpx">
          <view class="allergy-info-left"> 过敏信息 </view>
          <view class="allergy-info-right">
            <template v-if="allergyInfo?.length">
              <view v-for="(item, index) in allergyInfo" :key="item" class="content-flex-start">
                <text v-if="index !== 0" class="prefix-circle">·</text><text>{{ item }}</text>
              </view>
            </template>
            <text v-else>/</text>
          </view>
        </view>
        <template v-if="!isPreSchool">
          <view class="content-flex" style="margin-top: 16rpx">
            <view class="allergy-info-left"> 住校信息 </view>
            <view>{{ accommodationInfo }}</view>
          </view>
          <view v-if="stuDetail.accommodation === 1" class="content-flex mt-xxs" style="margin-top: 16rpx">
            <view class="allergy-info-left"> 宿舍号 </view>
            <view>{{ stuDetail.spaceName || '/' }}</view>
          </view>
        </template>
        <view class="content-flex-start mt-xxs" style="margin-top: 16rpx">
          <view class="allergy-info-left"> 出入规则 </view>
          <view v-if="stuDetail.tagDTOList?.length === 0">/</view>
          <view v-else class="">
            <view v-for="item in stuDetail.tagDTOList" :key="item.typeCode">
              <view class="content-flex">
                <text>{{ SchoolRules[item.typeCode] }}</text>
                <text v-if="item.typeCode && SchoolRules[item.typeCode]" class="mr-xs">:</text>
                <text>{{ item.name }}</text>
              </view>
            </view>
          </view>
        </view>
        <view style="margin-top: 16rpx; font-size: 34rpx; color: #000000e0">人脸凭证</view>
        <view style="margin-top: 16rpx">
          <view v-for="(item, inx) in medias.array" :key="item.url" class="group-top-face-item-between">
            <u-image v-if="item.url != captchaImg" width="144" height="144" :src="item.url" mode="aspectFill"
              shape="square" border-radius="16" @click="handleImagePreview(inx)" />
            <view v-else class="captcha-img-wrap">
              <image class="captcha-img" :src="item.url" />
            </view>
            <view class="between-size" />
          </view>
          <view v-if="!medias?.array?.length" class="font-secondary color-placeholder">无</view>
        </view>
      </view>

      <!--家长信息-->
      <text class="stu-info-text">家长信息</text>
      <view v-if="!stuDetail?.studentParentResps?.length" class="font-secondary color-placeholder"
        style="margin-left: 64rpx; margin-top: 16rpx">
        无
      </view>
      <view v-for="parent in parentsPhone.array" :key="parent.id" class="parents-content">
        <view class="flex-between">
          <view class="flex-column-plain">
            <view class="flex-inline">
              <text class="font-title mr-xs">{{ parent.name }}</text>
              <view class="radius-default bg-fill-default plr-xs">
                <text class="font-desc color-parent-flag">{{ relationShip(parent.relation) }}</text>
              </view>
            </view>
            <text class="mt-xs font-secondary color-phone" style="color: #00000073">手机号:{{ parent.mobilePhone || ''
            }}</text>
          </view>
          <view v-if="parent.mobilePhone && initPrivacyFlag" @click.stop="handlePhoneCall(parent)">
            <u-icon class="phone-wrap" name="phone-fill" color="#176bfb" size="32" />
          </view>
        </view>
      </view>
    </view>
    <view>
      <view style="height: 128rpx"></view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
    <!--底部操作区编辑或删除-->
    <view v-if="hasAuthOp(pageParam.clazzId) && !isStudent" class="bottom-btn">
      <view style="/* 设置阴影 */ box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08)"></view>
      <u-button :plain="true" shape="square" :custom-style="{
        ...btnStyle,
        color: '#ffffff',
        borderColor: '#176bfb',
        backgroundColor: '#176bfb',
      }" @click="handleEditStu">编辑</u-button>
      <u-button :plain="true" shape="square" :custom-style="btnStyle" @click="handleDelStu">删除</u-button>
      <u-button v-if="userInfo?.locationType !== LocationType.PreSchool" :plain="true" shape="square"
        :custom-style="btnStyle" @click="handleResetPwd">重置密码</u-button>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import useCaptchaAuth, { getCaptcha } from '@/app-platform/contacts/add-student/use-captcha-auth';
import {
  IStudentDetailRtn,
  // fileStreamBase64,
  reSetPassword,
  studentDel,
  studentDetail,
} from '@/app-platform/services/contacts';
import captchaImg from '@/app-platform/static/contacts/face-placeholder.svg';
import { contactStore } from '@/store/modules/contacts';
import { LocationType, loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { assign, cloneDeep, map } from '@/utils/lodash-es';
import { formatDate, getPageParams, hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { computed, onBeforeMount, onBeforeUnmount, onUnmounted, reactive, ref, toRefs } from 'vue';
import {
  SchoolRules,
  certificateTypeCodes,
  enum_accommodationType,
  enum_cardTypes,
  enum_parent_relation_ship,
} from './add-student/enum';
import icon_avatar from '/static/avatar.png';

interface IPageParam {
  id: string;
  clazzId: string;
}

interface IImage {
  url: string;
  status?: 0 | 1; // 上传状态, 重新上传使用
  [k: string]: any;
}

export interface IUserProfile {
  name: string;
  img: string;
  gender: number;
  desc: string[];
}

export interface IPhoneCall {
  id: string;
  show: boolean;
  name: string;
  mobilePhone: string;
  phone: string;
  relation: number;
}

const [initPrivacyFlag] = useCaptchaAuth(true);
const pageParam = ref({} as IPageParam);
const stuDetail = reactive({} as IStudentDetailRtn);
const profileDetail = reactive({} as IUserProfile);
const showPrivacyPic = ref(true);
const pageShow = ref(false);
const medias = reactive({
  array: [] as IImage[],
  cloneArray: [] as IImage[],
});
const parentsPhone = reactive({
  array: [] as IPhoneCall[],
});
const phoneCall = ref<IPhoneCall>({
  id: '',
  show: false,
  name: '',
  mobilePhone: '',
  phone: '',
  relation: 0,
});
// store
const contactSt = contactStore();
const store = loginStore();
const { userInfo } = toRefs(store);
const btnStyle = {
  marginTop: '24rpx',
  marginLeft: '12rpx',
  marginRight: '12rpx',
  marginBottom: '24rpx',
  color: '#1677FF',
  width: '100%',
  height: '80rpx',
  borderRadius: '16rpx',
  borderColor: '#176bfb',
  backgroundColor: '#ffffff',
  fontSize: '30rpx',
  fontWeight: '500',
};
let updateStudent = false;

// 是否学生账号
const isStudent = EUserType.student === store.currentUserType;

const allergyTypes = [
  '',
  '高蛋白过敏（鸡蛋、牛奶、牛肉等）',
  '水产品过敏（鱼、虾、蟹、贝等）',
  '坚果和种子过敏（花生、黄豆、腰果、杏仁等）',
  '水果过敏（芒果、草莓、菠萝等）',
  '药物过敏',
  '其他过敏',
];
const allergyInfo = computed(() => {
  if (!stuDetail) return '';
  const infos = stuDetail?.allergyTypeList?.reduce((arr, item) => {
    if (item == 6 && stuDetail?.allergyDetail) {
      arr.push(`${allergyTypes[+item]}（${stuDetail.allergyDetail}）`);
    } else {
      arr.push(allergyTypes[+item]);
    }
    return arr;
  }, []);
  return infos;
});
const isPreSchool = computed(() => userInfo?.value?.locationType === LocationType.PreSchool);

const accommodationInfo = computed(() => {
  return enum_accommodationType.find(tmp => tmp.value === stuDetail.accommodation)?.label || '/';
});

const relationShip = (type: number) => {
  return enum_parent_relation_ship.find(tmp => tmp.value === type)?.label || '/';
};

const setDetail = () => {
  const { name, gender, certificateNumber, certificateType, studentCode, imageResps } = stuDetail;
  // 获取日常照片
  let avatar = '';
  if (Array.isArray(imageResps) && !!imageResps.length) {
    avatar = imageResps.find(item => item.type == 0)?.imgUrl || ''
  }
  Object.assign(profileDetail, {
    name,
    gender,
    img: avatar,
    desc: certificateTypeCodes.includes(certificateType)
      ? `${enum_cardTypes.find(tmp => tmp.value === certificateType)?.label}: ${getCaptcha(certificateNumber, !eyeToggle.value, {
        start: 3,
        end: certificateNumber?.length - 3,
      }) || '/'
      }`
      : `学籍号: ${getCaptcha(studentCode, !eyeToggle.value, {
        start: 0,
        end: studentCode?.length - 4,
      }) || '/'
      }`,
  });
};

const setImageCaptcha = () => {
  if (!eyeToggle.value) {
    medias.array = map(medias.array, media => assign(media, { url: captchaImg }));
  } else {
    medias.array = cloneDeep(medias.cloneArray);
  }
};

const setParentsPhoneShown = () => {
  parentsPhone.array = parentsPhone.array.map(item => ({
    ...item,
    mobilePhone:
      !eyeToggle.value && item.phone?.length >= 11
        ? item.phone.substring(0, 3) + '****' + item.phone.substring(7)
        : item.phone,
  }));
};

// 判断当前人员是否有权限操作班级学生
const hasAuthOp = (clazzId: string) => {
  log('hasAuthOp_clazzId : ', clazzId);
  if (!clazzId) return false;
  // 在任课老师列表中
  // 在学段负责人列表中
  const sectionIdList = contactSt.userAuthInfo.sectionIdList;
  const inSectionIdList = sectionIdList.some(id => id === clazzId);
  // 在年段长列表中
  const gradeIdList = contactSt.userAuthInfo.gradeIdList;
  const inGradeIdList = gradeIdList.some(id => id === clazzId);
  // 在班主任列表中
  const masterList = contactSt.userAuthInfo.masterClazzIdList;
  const inMasterClazzIdList = masterList.some(id => id === clazzId);
  return (
    contactSt.userAuthInfo.isAdmin ||
    contactSt.userAuthInfo.isNormalAdmin ||
    contactSt.userAuthInfo.isSchoolMaster ||
    inSectionIdList ||
    inGradeIdList ||
    inMasterClazzIdList
  );
};

const fetchStuDetail = async () => {
  await contactSt.getUserAuthInfo();

  medias.array = [];
  parentsPhone.array = [];
  if (!pageParam.value.id) {
    log('currentOrganization_childId : ', store.currentOrganization?.childId);
    pageParam.value.id = store.currentOrganization?.childId + '' ?? '';
  }
  const res = await studentDetail(pageParam.value.id);
  log('res : ', res);
  showPrivacyPic.value = res.showPrivacyPic;
  Object.assign(stuDetail, res.baseInfoResp);
  setDetail();

  if (res.voucherResp.faces?.length) {
    log('teacher -> voucherResp : ', res.voucherResp.faces);
    const { imgUrl } = res.voucherResp.faces[0];
    // const url = await fileStreamBase64(fileId);
    medias.array.push({ url: imgUrl });
    console.log("🚀 ~ fetchStuDetail ~ medias:", JSON.stringify(medias))
    medias.cloneArray = cloneDeep(medias.array);
    setImageCaptcha();
  }

  // 电话
  if (res.baseInfoResp.studentParentResps?.length) {
    res.baseInfoResp.studentParentResps?.forEach(item => {
      parentsPhone.array.push({
        id: item.id,
        name: item.name,
        phone: item.mobilePhone,
        mobilePhone: item.mobilePhone,
        show: false,
        relation: item.relation,
      });
    });
    log('parentsPhone : ', parentsPhone);
    setParentsPhoneShown();
  }
  hideLoading();
  pageShow.value = true;
};

const handleEditStu = () => {
  const { id, clazzId } = pageParam.value;
  uni.navigateTo({
    url: `/app-platform/contacts/add-student/index?id=${id}&clazzId=${clazzId}&name=${stuDetail.clazzName}&type=edit`,
  });
};

const handleDelStu = async () => {
  uni.showModal({
    title: '',
    content: '您确定删除该学生吗?',
    success: async res => {
      if (res.confirm) {
        const { id, clazzId } = pageParam.value;
        const del = await studentDel([id]);
        if (del) {
          uni.$emit('delStuCallback', { id: clazzId });
          uni.navigateBack({
            success: () => {
              showInfo('删除成功');
            },
          });
        }
      }
    },
  });
};

const handleResetPwd = async () => {
  const initPwd = stuDetail.initPwd || '';
  console.log("🚀 ~ handleResetPwd ~ stuDetail:", stuDetail)
  if (!initPwd) {
    uni.showToast({
      title: '暂时无法重置密码',
      icon: 'none',
    });
    return;
  }
  uni.showModal({
    title: '',
    content: `确定将此用户的密码重置为abcd@${initPwd}吗？`,
    success: async res => {
      if (res.confirm) {
        try {
          await reSetPassword({
            personId: stuDetail.id,
            studentCode: initPwd,
            certificateNumber: initPwd,
          });
          uni.showToast({
            title: '密码重置成功',
            icon: 'none',
          });
        } catch (e) {
          uni.showToast({
            title: '密码重置失败',
            icon: 'none',
          });
        }
      }
    },
  });
};

const handlePhoneCall = (parent: any) => {
  log('parent : ', parent);
  if (parent.phone.includes('*')) {
    showInfo('您未开通查看用户隐私权限，不支持拨号!');
    return;
  }
  const { name, mobilePhone: phone } = parent;
  phoneCall.value = {
    id: '',
    show: true,
    name,
    phone: phone,
    mobilePhone: phone,
    relation: 0,
  };
  uni.makePhoneCall({
    phoneNumber: parent.phone,
  });
};

// eyeclick
const eyeToggle = ref(false);
const handleEye = () => {
  eyeToggle.value = !eyeToggle.value;
  setDetail();
  setImageCaptcha();
  setParentsPhoneShown();
};

const handleImagePreview = (inx: number) => {
  uni.previewImage({
    urls: medias.array.map(item => item.url),
    current: inx,
  });
};

const handleUpdateStudent = () => {
  console.log('handleUpdateStudent');
  updateStudent = true;
  fetchStuDetail();
};

onBeforeMount(() => {
  pageParam.value = getPageParams();
  log('student-detail-pageParam : ', pageParam.value);
  showLoading();
  fetchStuDetail();
  uni.$on('DetailUpdateStudent', handleUpdateStudent);
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
  uni.$off('DetailUpdateStudent', handleUpdateStudent);
});

onUnmounted(() => {
  console.log('onUnmounted');
  if (updateStudent) {
    console.log('onUnmounted -> updateStudent');
    uni.$emit('updateStuCallback', { id: pageParam.value.clazzId });
  }
});
</script>
<style lang="scss" scoped>
page {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: absolute;
  overflow: scroll;
  box-sizing: border-box;
  background-color: $ui-color-page-primary;
}

.page {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: absolute;
  overflow: scroll;
  box-sizing: border-box;
  background-color: $ui-color-page-primary;

  .scroll-content {
    overflow: scroll;
  }

  .stu-info-text {
    display: flex;
    margin: 36rpx 64rpx 0;
    color: #000000a6;
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 36rpx;
    /* 138.462% */
  }

  .content-head {
    margin-left: 32rpx;
    margin-right: 32rpx;
    margin-top: 16rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 32rpx;
    align-items: center;
    border-radius: 16rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    background-color: white;
    @extend .content-flex;
    @extend .content-row;

    .avatar-size {
      width: 80rpx;
      height: 80rpx;
      border: 4rpx solid white;
      border-radius: 50%;
    }

    .user-rect {
      margin-left: 16rpx;
      flex: 1 1 0%;
      @extend .content-column;
    }

    .username-text {
      color: #000000e0;
      text-align: center;
      font-family: 'PingFang SC';
      font-size: 34rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx;
    }

    .useriden-text {
      color: #00000073;
      text-align: center;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }

    .eye-wrap {
      padding: 16rpx;
      border-radius: 16rpx;
      border: 1px solid var(--global-basic-color-border, rgba(0, 0, 0, 0.15));
    }
  }

  .allergy-info-content-head {
    margin-left: 32rpx;
    margin-right: 32rpx;
    margin-top: 16rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    background-color: white;

    .allergy-info-left {
      width: 25%;
      font-size: 30rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 40rpx;
      /* 133.333% */
      color: #000000a6;
    }

    .allergy-info-right {
      width: 75%;
      display: flex;
      flex-direction: column;
    }

    .font-secondary {
      font-size: 24rpx;
    }

    .color-placeholder {
      color: #86909c;
    }

    .color-phone {
      color: #00000073;
    }

    .color-parent-flag {
      color: #000000a6;
    }

    .group-top-face-item-between {
      @extend .content-flex;
      @extend .content-column;
    }

    .captcha-img-wrap {
      display: flex;
      justify-content: space-between;
      /* 水平居中 */
      align-items: center;
      /* 垂直居中 */
      width: 144rpx;
      height: 144rpx;
      border-radius: var(--Radius-radius-base, 16rpx);
      background: var(--global-basic-color-fill-secondary, rgba(0, 0, 0, 0.06));
    }

    .captcha-img {
      flex: 1;
      width: 64rpx;
      height: 64rpx;
    }
  }

  .parents-content {
    margin-left: 32rpx;
    margin-right: 32rpx;
    margin-top: 16rpx;
    margin-bottom: 24rpx;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    background-color: white;

    .phone-wrap {
      padding: 16rpx;
      border-radius: 16rpx;
      border: 1px solid var(--global-basic-color-border, #1677ff);
    }
  }

  .bottom-btn {
    position: fixed;
    justify-content: space-between;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    left: 0;
    right: 0;
    bottom: env(safe-area-inset-bottom);
    display: flex;
    padding: 0 20rpx;
    background-color: white;
  }
}

.prefix-circle {
  margin-right: 4px;
  font-weight: 600;
}

.content-column {
  flex-direction: column;
}

.content-row {
  flex-direction: row;
}

.content-flex-start {
  @extend .content-flex;
  align-items: flex-start;
}

.content-flex {
  display: flex;
}

.mr-xs {
  margin-right: 12rpx;
}

.mt-xs {
  margin-top: 12rpx;
}

.mt-xxs {
  margin-top: 8rpx;
}

.mt-b {
  margin-top: 24rpx;
}

.bold {
  font-weight: 600;
}

.between-size {
  width: 10rpx;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column-plain {
  display: flex;
  flex-direction: column;
}

.flex-inline {
  display: inline-flex;
  align-items: center;
}

.font-title {
  font-size: 34rpx;
  color: #000000e0;
}

.radius-default {
  border-radius: 12rpx;
}

.bg-fill-default {
  background: rgba(0, 0, 0, 0.04);
}

.plr-xs {
  padding-left: 16rpx;
  padding-right: 16rpx;
}

/* 字体尺寸变量 */
.font-desc {
  font-size: 20rpx;
}

.u-fixed-placeholder {
  /* #ifndef APP-NVUE */
  box-sizing: content-box;
  /* #endif */
}
</style>
