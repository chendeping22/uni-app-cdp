<template>
  <view class="page pageBg">
    <!-- <image src="/app-platform/static/contacts/bg_invitation.svg" style="width: 100vh;" mode="withFix"></image> -->
    <view :style="{ height: statusBarHeight + 'px' }" />
    <view class="head-title-content">
      <image class="icon-home-size" :src="icon_home" @click="goHome" />
      <view class="head-title">入班登记</view>
      <view class="icon-home-size" />
    </view>
    <template v-if="!isValidUrl">
      <u-empty-custom text="链接已失效" mode="page" />
    </template>
    <template v-else-if="isApplied">
      <view
        class="mt-b mlr-l"
        style="
          border-radius: 16rpx;
          margin: 15rpx 32rpx;
          box-shadow: 0px 2rpx 4rpx 0px rgba(0, 0, 0, 0.04);
          background-color: white;
          overflow: hidden;
        "
      >
        <view class="flex-column">
          <image class="icon-invite-success-size" :src="icon_invite_success" mode="aspectFit" />
          <template v-if="clzDetail.needApprove"> </template>
          <view class="mt-xl">
            <text class="font-xxxt">
              {{ clzDetail.needApprove ? '申请已提交' : `已加入${clzDetail.clazzName}` }}
            </text>
          </view>
          <view class="mt-b pb-l">
            <text class="font-title color-secondary"
              >{{ clzDetail.needApprove ? '班主任同意即可入驻' : '点击左上角按钮进入班级首页' }}
            </text>
          </view>
        </view>
      </view>
    </template>
    <template v-else>
      <scroll-view class="scroll-content" scroll-y>
        <view class="card-content">
          <view class="card-content-inner-box">
            <view style="display: flex; flex-direction: column; justify-content: center">
              <view class="class-name">{{ clzDetail.clazzName }}</view>
              <view class="invite-content">{{
                `${clzDetail.inviterName}邀请你加入${clzDetail.locationName}`
              }}</view>
            </view>
            <image class="icon-book-size" :src="icon_book" style="border-radius: 10rpx" />
          </view>
        </view>
        <view class="radius-default radius-top">
          <FormHeader title="学生信息" style="margin-top: 0" />
          <FormGroup>
            <FormItem
              v-model:value="defaultStudent.name"
              title="姓名"
              value-type="input"
              :input-max-length="30"
              @update="defaultStudent.name = $event"
            />
            <FormItem
              v-model:value="defaultStudent.sex.label"
              title="性别"
              @update="defaultStudent.sex.label = $event"
              @onClick="updateDefaultGender(true)"
            />

            <FormItem
              v-model:value="defaultStudent.cardInfo.cardNo"
              value-type="input"
              :input-type="defaultStudent.cardInfo.value === 0 ? 'idcard' : 'text'"
              :input-max-length="defaultStudent.cardInfo.value === 1 ? 30 : 18"
              @update="defaultStudent.cardInfo.cardNo = $event"
            >
              <template #left>
                <view
                  class="flex-inline pr-s border-right border-thick border-line-default"
                  @click="defaultStudent.cardInfo.showCardType = true"
                >
                  <text class="font-title color-base">{{ defaultStudent.cardInfo.label }}</text>
                  <text class="font-xt color-error ml-xs">*</text>
                  <u-icon name="arrow-right" color="#00000073" style="margin-left: 32rpx" />
                </view>
              </template>
            </FormItem>
          </FormGroup>

          <view v-for="(student, inx) in students" :key="student.id" class="border-line-default">
            <view style="height: 24rpx"></view>
            <FormGroup>
              <FormItem
                v-model:value="student.name"
                title="姓名"
                :input-max-length="30"
                value-type="input"
                :show-del="true"
                @del="handleRemoveStudent(inx)"
                @update="student.name = $event"
              />
              <FormItem
                v-model:value="student.sex.label"
                title="性别"
                @update="student.sex.label = $event"
                @onClick="chooseGender(inx, student.sex.genders)"
              />

              <FormItem
                v-model:value="student.cardInfo.cardNo"
                value-type="input"
                :input-type="student.cardInfo.value === 0 ? 'idcard' : 'text'"
                :input-max-length="student.cardInfo.value === 1 ? 30 : 18"
                @update="student.cardInfo.cardNo = $event"
              >
                <template #left>
                  <!-- 弹起证件选择 -->
                  <view
                    class="flex-inline pr-s border-right border-thick border-line-default"
                    @click="chooseCardType(inx, student.cardInfo.cardTypes)"
                  >
                    <text class="font-title color-base">{{ student.cardInfo.label }}</text>
                    <text class="font-xt color-error ml-xs">*</text>
                    <u-icon name="arrow-right" color="#00000073" style="margin-left: 32rpx" />
                  </view>
                </template>
              </FormItem>
            </FormGroup>
          </view>

          <view class="height-button-default flex" @click="handleAddStudent">
            <u-icon name="plus-circle-fill" size="48" color="#176bfb" />
            <text class="color-primary font-xt ml-s">添加多个小孩</text>
          </view>

          <FormHeader title="家长信息" />
          <FormGroup>
            <FormItem
              v-model:value="defaultParent.name"
              title="家长姓名"
              value-type="input"
              input-type="text"
              :input-max-length="30"
              @update="defaultParent.name = $event"
            />
            <FormItem
              v-model:value="defaultParent.familyRelation.label"
              title="亲属关系"
              @onClick="updateDefaultRelation(true)"
            />
            <FormItem
              v-model:value="defaultParent.mobilePhone"
              title="手机号"
              value-type="input"
              :input-type="includes(defaultParent.mobilePhone, '*') ? 'text' : 'number'"
              :input-max-length="11"
              @update="defaultParent.mobilePhone = $event"
            />
          </FormGroup>
          <view v-for="(parent, inx) in parents" :key="parent.id" class="border-line-default">
            <view style="height: 24rpx"></view>
            <FormGroup>
              <FormItem
                v-model:value="parent.name"
                title="家长姓名"
                value-type="input"
                :show-del="true"
                input-type="text"
                :input-max-length="30"
                @del="handleRemoveParent(inx)"
                @update="parent.name = $event"
              />
              <FormItem
                v-model:value="parent.familyRelation.label"
                title="亲属关系"
                @onClick="chooseRelation(inx, parent.familyRelation.relations)"
              />
              <FormItem
                v-model:value="parent.mobilePhone"
                title="手机号"
                value-type="input"
                :input-type="includes(parent.mobilePhone, '*') ? 'text' : 'number'"
                :input-max-length="11"
                @update="parent.mobilePhone = $event"
              />
            </FormGroup>
          </view>
          <view class="height-button-default flex" @click="handleAddParent">
            <u-icon name="plus-circle-fill" size="48" color="#176bfb" />
            <text class="color-primary font-xt ml-s">添加多个家长</text>
          </view>
          <view style="height: 24rpx"></view>
        </view>
      </scroll-view>
    </template>
  </view>

  <u-select
    v-model="defaultStudent.cardInfo.showCardType"
    :list="defaultStudent.cardInfo.cardTypes"
    title="证件信息"
    title-type="text"
    @confirm="handleSwitchDefaultStudentCardType"
  />

  <u-select
    v-model="showCardType"
    :list="currentCardTypes"
    title="证件信息"
    title-type="text"
    @confirm="handleSwitchCardType($event, currentCardTypesIndex)"
    @cancel="updateShowCardType(false)"
  />

  <u-select
    v-model="showDefaultGender"
    :list="defaultStudent.sex.genders"
    title="请选择性别"
    @confirm="handleGenderDefault"
    @cancel="updateDefaultGender(false)"
  />

  <u-select
    v-model="showGender"
    :list="currentGenders"
    title="请选择性别"
    @confirm="handleGender($event, currentGenderIndex)"
    @cancel="updateGender(false)"
  />

  <u-select
    v-model="showDefaultRelation"
    :list="defaultParent.familyRelation.relations"
    title="请选择亲属关系"
    @confirm="handleDefaultRelations"
    @cancel="updateDefaultRelation(false)"
  />

  <u-select
    v-model="showRelation"
    :list="currentRelations"
    title="请选择亲属关系"
    @confirm="handleRelations($event, currentRelationIndex)"
    @cancel="updateRelation(false)"
  />

  <template v-if="isValidUrl && !isApplied">
    <view class="invite-bottom">
      <view
        class="flex mb-b"
        style="padding-top: 32rpx; box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08)"
      >
        <u-checkbox
          v-model="isAgreePrivacy"
          style="margin-left: 32rpx"
          @change="checkboxChange"
        ></u-checkbox>
        <view class="font-secondary color-placeholder">
          <text>我已阅读并同意</text>
          <text class="color-primary" @tap.stop="goToPrivate">&nbsp;隐私政策&nbsp;</text>
          <text>和</text>
          <text
            class="color-primary"
            @tap.stop="linkToAgreement('/app-platform/login/user-agreement')"
            >&nbsp;用户协议&nbsp;</text
          >
        </view>
      </view>
      <button
        class="invite-button"
        :disabled="validate === false"
        open-type="getPhoneNumber"
        @click="handleGetWxCode"
        @getphonenumber="loginByWx"
      >
        提交
      </button>
    </view>
  </template>
  <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
</template>
<script lang="ts" setup>
import FormGroup from '@/app-platform/contacts/components/form-group/index.vue';
import FormHeader from '@/app-platform/contacts/components/form-header/index.vue';
import FormItem from '@/app-platform/contacts/components/form-item/index.vue';
import {
IGetClazzInvite,
ISubmitApplyToClazz,
getClazzInvite,
isValidateInvitation,
submitApplyToClazz,
} from '@/app-platform/services/contacts';
import icon_book from '@/app-platform/static/contacts/icon_book.svg';
import icon_home from '@/app-platform/static/contacts/icon_home.svg';
import icon_invite_success from '@/app-platform/static/contacts/icon_invite_success.svg';
import { REGS } from '@/app-platform/utils/regs';
import { goToPrivate } from '@/app-platform/utils/tools';
import { includes } from '@/utils/lodash-es';
import { deepClone, getPageParams, getWxCode, log, showInfo } from '@/utils/tools';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import {
ISelect,
enum_cardTypes,
enum_gender,
enum_parent_relation_ship,
} from '../add-student/enum';

interface IUrlParam {
  id: string;
}

interface CardInfo {
  value: number;
  label: string;
  cardNo: string;
  showCardType: boolean;
  cardTypes: ISelect[];
}

interface SexInfo {
  value: number;
  label: string;
  genders: ISelect[];
}

interface IStudent {
  id: string;
  name: string;
  sex: SexInfo;
  cardInfo: CardInfo;
}
[];

interface IRelation {
  relation: number;
  value: number;
  label: string;
  relations: ISelect[];
}

interface IParent {
  id: string;
  familyRelation: IRelation;
  mobilePhone: string;
  name: string;
}
[];

const statusBarHeight = ref();
const clzDetail = reactive({} as IGetClazzInvite);
const urlParam = ref({} as IUrlParam);
const isAgreePrivacy = ref(false);
const isValidUrl = ref(true);
const isApplied = ref(false);
const loginCode = ref('');

const parents = ref<IParent[]>([]);

const defaultStudent = ref<IStudent>({
  id: Math.random().toString(),
  name: '',
  sex: { value: 0, label: '', genders: deepClone(enum_gender) },
  cardInfo: {
    value: 0,
    label: '身份证',
    cardNo: '',
    showCardType: false,
    cardTypes: deepClone(enum_cardTypes),
  },
} as IStudent);
const students = ref<IStudent[]>([]);

// relations
const currentRelations = ref([] as ISelect[]);
const currentRelationIndex = ref(-1);

const showRelation = ref(false);
const showDefaultRelation = ref(false);
const updateRelation = (shown: boolean) => {
  showRelation.value = shown;
};
const updateDefaultRelation = (shown: boolean) => {
  showDefaultRelation.value = shown;
};
const chooseRelation = (inx: number, relations: ISelect[]) => {
  currentRelationIndex.value = inx;
  currentRelations.value = relations;
  updateRelation(true);
};

// genders
const currentGenders = ref([] as ISelect[]);
const currentGenderIndex = ref(-1);
const showGender = ref(false);
const showDefaultGender = ref(false);
const updateGender = (shown: boolean) => {
  showGender.value = shown;
};
const updateDefaultGender = (shown: boolean) => {
  showDefaultGender.value = shown;
};
const chooseGender = (inx: number, genders: ISelect[]) => {
  currentGenderIndex.value = inx;
  currentGenders.value = genders;
  updateGender(true);
};

// cardInfo
const currentCardTypes = ref([] as ISelect[]);
const currentCardTypesIndex = ref(-1);
const showCardType = ref(false);
const updateShowCardType = (shown: boolean) => {
  showCardType.value = shown;
};
const chooseCardType = (inx: number, cardTypes: ISelect[]) => {
  currentCardTypesIndex.value = inx;
  currentCardTypes.value = cardTypes;
  updateShowCardType(true);
};

const { miniProgram } = uni?.getAccountInfoSync?.() || {};
const { appId = '' } = miniProgram || {};

const defaultParent = ref<IParent>({
  id: Math.random().toString(),
  familyRelation: { relation: 1, relations: deepClone(enum_parent_relation_ship) },
  mobilePhone: '',
  name: '',
} as IParent);

const checkboxChange = (detail: any) => {
  const { value } = detail;
  isAgreePrivacy.value = value;
};

const validate = computed(() => {
  // 小孩默认
  log('validate -> defaultStudent.value.name :', defaultStudent.value.name);
  if (!defaultStudent.value.name || defaultStudent.value.name?.trim().length === 0) return false;
  const filterNoGenderStudents = defaultStudent.value.sex.genders.filter(
    item => item.checked == true,
  );
  log('validate -> filterNoGenderStudents : ', filterNoGenderStudents);
  if (!filterNoGenderStudents || filterNoGenderStudents.length == 0) return false;
  log('validate -> defaultStudent.value.sex', defaultStudent.value.sex);
  if (
    !defaultStudent.value.cardInfo.cardNo ||
    defaultStudent.value.cardInfo.cardNo?.trim().length === 0
  )
    return false;
  log('validate -> defaultStudent.value :', defaultStudent.value);

  // 孩子列表
  if (students.value.length > 0) {
    const noPass = students.value.some(item => {
      if (!item.name || item.name?.trim().length === 0) return true;
      const filterNoGenderStudents = item.sex.genders.filter(item => item.checked == true);
      if (!filterNoGenderStudents || filterNoGenderStudents.length == 0) return true;
      if (!item.cardInfo.cardNo || item.cardInfo.cardNo?.trim().length === 0) return true;
    });
    if (noPass) {
      log('validate -> noPass-child');
      return false;
    } else {
      log('validate -> students', students.value);
    }
  }

  // 家长默认
  const filterNoRelationParent = defaultParent.value.familyRelation.relations.filter(
    item => item.checked == true,
  );
  log('validate -> filterNoRelationParent : ', filterNoRelationParent);
  if (!filterNoRelationParent || filterNoRelationParent.length == 0) return false;
  log('validate -> defaultParent.value.mobilePhone :', defaultParent.value.mobilePhone);
  if (!defaultParent.value.mobilePhone || defaultParent.value.mobilePhone?.trim().length < 11)
    return false;
  log('validate -> defaultParent.value.name :', defaultParent.value.name);
  if (
    !defaultParent.value.name ||
    defaultParent.value.name?.trim().length < 2 ||
    defaultParent.value.name?.trim().length > 30
  )
    return false;
  log('validate -> defaultParent.value', defaultParent.value);

  // 家长列表
  if (parents.value.length > 0) {
    const noPass = parents.value.some(item => {
      const filterNoRelationParent = item.familyRelation.relations.filter(
        item => item.checked == true,
      );
      if (!filterNoRelationParent || filterNoRelationParent.length == 0) return true;
      if (!item.mobilePhone || item.mobilePhone?.trim().length < 11) return true;
      if (!item.name || item.name?.trim().length < 2 || item.name?.trim().length > 30) return true;
    });
    if (noPass) {
      log('validate -> noPass-parent');
      return false;
    } else {
      log('validate -> parents', parents.value);
    }
  }
  return true;
});

const handleAddParent = () => {
  parents.value.push({
    id: Math.random().toString(),
    familyRelation: { relation: 1, relations: deepClone(enum_parent_relation_ship) },
    mobilePhone: '',
  } as any);
};

const handleRemoveParent = (inx: number) => {
  console.log('handleRemoveParent : ', inx);
  parents.value.splice(inx, 1);
};

const handleAddStudent = () => {
  students.value.push({
    id: Math.random().toString(),
    name: '',
    sex: { value: 0, label: '', genders: deepClone(enum_gender) },
    cardInfo: {
      value: 0,
      label: '身份证',
      cardNo: '',
      showCardType: false,
      cardTypes: deepClone(enum_cardTypes),
    },
  } as any);
};

const handleRemoveStudent = (inx: number) => {
  console.log('handleRemoveStudent : ', inx);
  students.value.splice(inx, 1);
};

const handleGetWxCode = async () => {
  loginCode.value = '';
  const code = await getWxCode();
  console.log('code : ', code);
  loginCode.value = code;
};

const handleSwitchNo = () => {};
const linkToAgreement = (url: string) => {
  uni.navigateTo({
    url,
  });
};

const checkValidateUrl = async () => {
  try {
    console.log('urlParam.value.id : ', urlParam.value.id);
    // 查看链接是否失效
    const isValid = await isValidateInvitation(urlParam.value.id);
    console.log('isValid', isValid);
    isValidUrl.value = isValid;
    // 未失效
    if (isValid) {
      const res = await getClazzInvite(urlParam.value.id);
      Object.assign(clzDetail, res);
    }
  } catch (e) {}
};

const valify = () => {
  if (defaultStudent.value.name.length <= 1 || defaultStudent.value.name.length > 30) {
    showInfo('学生姓名只允许输入2-30位字符');
    return false;
  }
  if (students.value.some(item => item.name.length <= 1 || item.name.length > 30)) {
    showInfo('学生姓名只允许输入2-30位字符');
    return false;
  }

  if (
    defaultStudent.value.cardInfo.value === 1 &&
    !REGS.numberAndChar.test(defaultStudent.value.cardInfo.cardNo)
  ) {
    showInfo('证件号只能输入英文和数字');
    return false;
  }
  if (
    defaultStudent.value.cardInfo.value !== 1 &&
    !REGS.numberAndCharV1.test(defaultStudent.value.cardInfo.cardNo)
  ) {
    showInfo('证件号只能输入中文、英文和数字');
    return false;
  }

  let errorText = '';
  const errorStudentCardNo = students.value.some(item => {
    if (item.cardInfo.value === 1 && !REGS.numberAndChar.test(item.cardInfo.cardNo)) {
      errorText = '证件号只能输入英文和数字';
      return true;
    }
    if (item.cardInfo.value !== 1 && !REGS.numberAndChar.test(item.cardInfo.cardNo)) {
      errorText = '证件号只能输入中文、英文和数字';
      return true;
    }
  });
  if (errorStudentCardNo && errorText) {
    showInfo(errorText);
    return false;
  }
  return true;
};

/** 微信登录 */
const loginByWx = async (e: { detail: { errMsg: string; encryptedData: string; iv: string } }) => {
  const { detail } = e || {};
  const { errMsg, encryptedData, iv } = detail || {};
  if (errMsg !== 'getPhoneNumber:ok') return;

  if (!loginCode.value) return;

  if (!isAgreePrivacy.value)
    return uni.showToast({
      title: '请阅读并勾选底部协议',
      icon: 'none',
      mask: true,
      duration: 1000,
    });

  if (!valify()) return;

  const { clazzId, id: inviteId, inviter, inviterName, locationId } = clzDetail;

  const applyParentVoList = [];
  applyParentVoList.push({
    // name: defaultParent.value.familyRelation.relations.find(tmp => tmp.checked)?.label,
    name: defaultParent.value.name,
    relationType: defaultParent.value.familyRelation.relations.find(tmp => tmp.checked)?.value,
    phone: defaultParent.value.mobilePhone,
    code: loginCode.value,
    encryptedData,
    iv,
    appId,
  });
  parents.value.forEach(item => {
    applyParentVoList.push({
      // name: item.familyRelation.relations.find(tmp => tmp.checked)?.label,
      name: item.name,
      relationType: item.familyRelation.relations.find(tmp => tmp.checked)?.value,
      phone: item.mobilePhone,
      code: loginCode.value,
      encryptedData,
      iv,
      appId,
    });
  });

  const applyStudentVoList = [];
  applyStudentVoList.push(
    Object.assign(
      {
        name: defaultStudent.value.name,
        gender: defaultStudent.value.sex.genders.find(tmp => tmp.checked)?.value,
      },
      defaultStudent.value.cardInfo.value === 1
        ? {
            studentCode: defaultStudent.value.cardInfo.cardNo,
          }
        : {
            certificateNo: defaultStudent.value.cardInfo.cardNo,
            certificateType: defaultStudent.value.cardInfo.value,
          },
    ),
  );
  students.value.forEach(item => {
    applyStudentVoList.push(
      Object.assign(
        {
          name: item.name,
          gender: item.sex.genders.find(tmp => tmp.checked)?.value,
        },
        item.cardInfo.value === 1
          ? {
              studentCode: item.cardInfo.cardNo,
            }
          : {
              certificateNo: item.cardInfo.cardNo,
              certificateType: item.cardInfo.value,
            },
      ),
    );
  });

  const applyData: ISubmitApplyToClazz = {
    clazzId,
    inviteId,
    inviter,
    locationId,
    inviterName,
    applyParentVoList: applyParentVoList,
    applyStudentVoList: applyStudentVoList,
  };
  await submitApplyToClazz(applyData);
  isApplied.value = true;
};

const handleGenderDefault = (res: any) => {
  log('handleGenderDefault -> res : ', res);
  const tmpDefaultStudent: any = {};
  Object.assign(tmpDefaultStudent, defaultStudent.value);
  tmpDefaultStudent.sex.genders.map((item: any) => {
    if (item.value === res[0].value) {
      tmpDefaultStudent.sex.value = res[0].value;
      tmpDefaultStudent.sex.label = res[0].label;
    }
    item.checked = item.value == res[0].value;
    return item;
  });
  defaultStudent.value = tmpDefaultStudent;
};

const handleGender = (res: any, inx: number) => {
  log('handleGender -> res : ', res);
  log('handleGender -> inx : ', inx);
  const tmpStudents: any = [];
  Object.assign(tmpStudents, students.value);
  tmpStudents.some((item: any, index: number) => {
    if (inx == index) {
      item.sex.genders.map((item: any) => {
        if (item.value == res[0].value) {
          tmpStudents[inx].sex.value = res[0].value;
          tmpStudents[inx].sex.label = res[0].label;
        }
        item.checked = item.value == res[0].value;
        return item;
      });
      return true;
    } else {
      return false;
    }
  });
  students.value = tmpStudents;
};

const handleDefaultRelations = (res: any) => {
  log('handleDefaultRelations -> res : ', res);
  const tmpDefaultParent: any = {};
  Object.assign(tmpDefaultParent, defaultParent.value);
  tmpDefaultParent.familyRelation.relations.map((item: any) => {
    if (item.value === res[0].value) {
      tmpDefaultParent.familyRelation.label = res[0].label;
    }
    item.checked = item.value == res[0].value;
    return item;
  });
  defaultParent.value = tmpDefaultParent;
};

const handleRelations = (res: any, inx: number) => {
  log('handleRelations -> res : ', res);
  log('handleRelations -> inx : ', inx);
  const tmpParents: any = [];
  Object.assign(tmpParents, parents.value);
  tmpParents.some((item: any, index: number) => {
    if (inx == index) {
      item.familyRelation.relations.map((item: any) => {
        if (item.value === res[0].value) {
          tmpParents[inx].familyRelation.label = res[0].label;
          tmpParents[inx].familyRelation.value = res[0].value;
        }
        item.checked = item.value == res[0].value;
        return item;
      });
      return true;
    } else {
      return false;
    }
  });
  parents.value = tmpParents;
};

const handleSwitchDefaultStudentCardType = (res: any) => {
  log('handleSwitchDefaultStudentCardType -> res : ', res);
  const { label, value } = res[0];
  defaultStudent.value = {
    ...defaultStudent.value,
    cardInfo: { ...defaultStudent.value.cardInfo, value: value, label: label },
  };
};

const handleSwitchCardType = (res: any, inx: number) => {
  log('handleSwitchCardType -> res : ', res);
  log('handleSwitchCardType -> inx : ', inx);
  const { label, value } = res[0];
  students.value[inx] = {
    ...students.value[inx],
    cardInfo: { ...students.value[inx].cardInfo, value: value, label: label },
  };
};

const goHome = () => {
  uni.reLaunch({
    url: '/pages/workbench/index',
    success: () => {},
  });
};

onBeforeMount(() => {
  //获取手机系统信息
  const info = uni.getSystemInfoSync();
  //设置状态栏高度
  statusBarHeight.value = info.statusBarHeight;
  urlParam.value = getPageParams();
  checkValidateUrl();
});
</script>
<style lang="scss" scoped>
.invite-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: white;
}
.invite-button {
  margin-left: 32rpx;
  margin-right: 32rpx;
  margin-bottom: 32rpx;
  justify-content: center;
  border-radius: 16rpx;
  border: 0;
  font-size: 30rpx;
  background-color: $ui-color-primary;
  color: white !important;
  height: 80rpx;
}

button::after {
  border: none;
}

button[disabled] {
  background-color: #91caff !important;
}
/**
  calc(100vh - var(--window-top) - 356rpx - 300rpx - env(safe-area-inset-bottom));
 */
.scroll-content {
  width: 100%;
  height: calc(100vh - var(--window-top) - 356rpx - env(safe-area-inset-bottom));
}
.pageBg {
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('@/app-platform/static/contacts/bg_invitation.png');
}
.head-title-content {
  display: flex;
  align-items: center;
}
.icon-home-size {
  margin: 0 32rpx;
  width: 48rpx;
  height: 48rpx;
}
.icon-invite-success-size {
  margin-top: 24rpx;
  width: 144rpx;
  height: 144rpx;
}
.icon-book-size {
  width: 262rpx;
  height: 244rpx;
}

.head-title {
  flex: 1;
  text-align: center;
  font-family: PingFang SC;
  color: #ffffff;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 48rpx;
  margin-top: 24rpx;
  margin-bottom: 24rpx;
}

.card-content-inner-box {
  display: flex;
  justify-content: space-between;
  padding: 0 0 0 48rpx;
  flex-direction: row;
  border-radius: 16rpx;
  /* border: 6rpx solid rgba(255, 255, 255, 0.24); */
  background: linear-gradient(180deg, #bae0ff 0%, #fff 100%);
  backdrop-filter: blur(5.400000095367432px);
}
.card-content {
  margin-top: 48rpx;
  margin-left: 32rpx;
  margin-right: 32rpx;
  display: flex;
  justify-content: space-between;
  padding: 6rpx;
  flex-direction: row;
  border-radius: 16rpx;
  // border: 6rpx solid rgba(255, 255, 255, 0.24);
  background: linear-gradient(180deg, #9bc9ff 0%, #fff 100%);
  backdrop-filter: blur(5.400000095367432px);

  .class-name {
    color: var(--global-text-icons-color-text-heading, rgba(0, 0, 0, 0.88));
    /* IOS/Title2/Medium */
    font-family: PingFang SC;
    font-size: 44rpx;
    font-style: normal;
    font-weight: 500;
    line-height: 56rpx; /* 127.273% */
  }
  .invite-content {
    color: var(--global-text-icons-color-text-description, rgba(0, 0, 0, 0.45));
    /* IOS/Footnote/Regular */
    font-family: PingFang SC;
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 36rpx; /* 138.462% */
  }
}
.mt-b {
  margin-top: 24rpx;
}
.mlr-l {
  margin-left: 32rpx;
  margin-right: 32rpx;
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.border-bottom {
  border-bottom-width: 1rpx;
  border-bottom-style: solid;
}
.mt-l {
  margin-top: 32rpx;
}
.mt-xl {
  margin-top: 48rpx;
}
.font-xxxt {
  font-size: 44rpx;
}
.pb-l {
  padding-bottom: 32rpx;
}
.font-title {
  font-size: 30rpx;
}
.color-secondary {
  color: #4e5969;
}
/**背景类 */
.bg-primary {
  background: #176bfb;
}
.plr-xl {
  padding-left: 48rpx;
  padding-right: 48rpx;
}

.pt-xl {
  padding-top: 48rpx;
}
.radius-default {
  border-radius: 12rpx;
}
/** radius方向类, 需要配合原子类使用 */
.radius-top {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.flex-inline {
  display: inline-flex;
  align-items: center;
}
.pr-s {
  padding-right: 16rpx;
}
.border-right {
  border-right-width: 1px;
  border-right-style: solid;
}
.border-thick {
  border-width: 2rpx;
}
.border-line-default {
  border-color: #e5e6eb;
}
.font-title {
  font-size: 30rpx;
}
.color-base {
  color: #1d2129;
}
.font-xt {
  font-size: 34rpx;
}
.color-error {
  color: #f53f3f;
}
.ml-xs {
  margin-left: 12rpx;
}
.ml-s {
  margin-left: 16rpx;
}
.box-border {
  box-sizing: border-box;
}
.flex {
  display: flex;
  align-items: center;
}
.height-button-default {
  margin-top: 23rpx;
  padding: 0 32rpx;
  margin-left: 32rpx;
  margin-right: 32rpx;
  border-radius: 16rpx;
  height: 96rpx;
  background-color: white;
}
.font-secondary {
  font-size: 24rpx;
}
.mb-b {
  margin-bottom: 24rpx;
}
.color-placeholder {
  color: #86909c;
}
.color-primary {
  color: $ui-color-primary;
}
.icon-100 {
  width: 100rpx;
  height: 100rpx;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-start {
  align-items: flex-start;
}
.plr-l {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.pt-l {
  padding-top: 32rpx;
}
/** 非规范的特殊样式 */
.bg-white-light-spec {
  background: rgba(255, 255, 255, 0.1);
}
.mt-xs {
  margin-top: 12rpx;
}
.mr-xxs {
  margin-right: 24rpx;
}
.color-white-light-spec {
  color: rgba(255, 255, 255, 0.7);
}
.color-white {
  color: #ffffff;
}
.no-shrink {
  /** 不能压缩 */
  flex-shrink: 0;
}
.mlr-xs {
  margin-left: 12rpx;
  margin-right: 12rpx;
}
.text-ellipse {
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
  white-space: nowrap;
}
.flex-end {
  align-items: flex-end;
}

// .form-item-title-block{
//   background-color: #f5f5f5;
//   margin-left: 32rpx;
//   margin-right: 32rpx;
//   padding-left: 0rpx;
// }
</style>
