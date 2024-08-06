<template>
  <view style="
      /* 设置阴影 */
      box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.03);
      position: relative;
      z-index: 2;
    "></view>
  <page custom-overflow="visible">
    <view class="scroll-content">
      <!--学生信息-->
      <text class="stu-info-text">学生信息</text>
      <FormGroup>
        <FormItem v-model:value="formData.name" title="姓名" value-type="input" :input-max-length="30" :need-line="true"
          @update="formData.name = $event" />
        <FormSelect v-model:list="genders" title="性别" select-title="性别" :need-line="true" />
        <FormItem title="出生日期" :required="false" :need-line="true">
          <template #right>
            <view class="flex-inline font-title" @click="handleShow">
              <text v-if="!formData.birthday" class="font-title color-placeholder">请选择</text>
              <text v-else class="color-secondary text-ellipse">
                {{ dayjs(formData.birthday).format('YYYY-MM-DD') }}
              </text>
              <u-icon name="arrow-right" color="#00000073" size="28" style="margin-top: 6rpx; margin-left: 8rpx" />
              <u-calendar v-model="show" mode="date" @change="handleSwitchDate" />
            </view>
          </template>
        </FormItem>
        <FormItem v-if="false" title="过敏信息" :required="false" :need-line="true">
          <template #right>
            <view class="flex-inline font-title text-ellipse" @click="onClickAllergyType">
              <text v-if="!formData.allergyTypeList?.length" class="color-placeholder">请选择</text>
              <text v-else class="color-secondary text-ellipse">
                {{ allergyInfo }}
              </text>
              <u-icon name="arrow-right" color="#00000073" size="28" style="margin-top: 6rpx; margin-left: 8rpx" />
            </view>
          </template>
        </FormItem>

        <!-- <FormItem
          v-model:value="cardInf.cardNo"
          value-type="input"
          :input-type="cardInf.value === 0 ? 'idcard' : 'text'"
          :input-max-length="cardInf.value === 1 ? 30 : 18"
          :need-line="true"
          @update="updateCard"
        >
          <template #left>
            <view
              class="flex-inline pr-s border-right border-thick border-line-default"
              style="height: 96rpx"
              @click="showCardType = true"
            >
              <text class="font-title color-base">{{ cardInf.label }}</text>
              <text class="font-xt color-error ml-xs">*</text>
              <u-icon name="arrow-right" color="#00000073" style="margin-left: 32rpx" />
            </view>
          </template>
        </FormItem> -->
        <FormSelect v-model:list="cardTypes" title="证件类型" select-title="证件类型" title-type="text"
          :auto-close-after-select="false" :need-line="true" @change="handleSwitchCardTypeNew" />
        <FormItem v-model:value="cardInf.cardNo" title="证件号码" value-type="input"
          :input-type="cardInf.value === 0 ? 'idcard' : 'text'" :input-max-length="cardInf.value === 1 ? 30 : 18"
          :need-line="!isPreSchool" @update="updateCard" />
        <template v-if="!isPreSchool">
          <FormSelect v-model:list="accommodationTypes" title="住校信息" select-title="住校信息" title-type="text"
            :auto-close-after-select="false" :need-line="accommodationTypes[1].checked" />
          <FormSelect v-if="accommodationTypes[1].checked" v-model:list="accommodationRooms"
            :auto-close-after-select="false" :required="false" title-type="text" title="宿舍号" select-title="宿舍号"
            @onClear="accommodationRooms.forEach(tmp => (tmp.checked = false))" />
        </template>
      </FormGroup>
      <view style="height: 24rpx"></view>
      <FormGroup>
        <view :style="photoMaginViewStyles"></view>
        <FormItem title="照片" :required="false">
          <template #right>
            <image v-if="!medias || !medias.array || medias.array.length == 0" class="file-plus-size"
              :style="photoFormViewStyles" :src="icon_file_plus" mode="aspectFill" @click="handleSelectPhoto" />
            <image v-else-if="medias.array[0]?.url != captchaImg" class="file-plus-size" :style="photoFormViewStyles"
              :src="medias.array[0]?.url ? medias.array[0]?.url : medias.array[0]" mode="aspectFill"
              @click="handleSelectPhoto" />
            <view v-else class="captcha-img-wrap" :style="photoFormViewStyles">
              <image class="captcha-img" :src="captchaImg" />
            </view>
            <!-- <u-image :src="icon_punch_photo" width="48" height="48" @click="handleSelectPhoto" /> -->
          </template>
        </FormItem>
        <view :style="photoMaginViewStyles"></view>
        <!-- <u-images
        v-model="medias.array"
        type="mini"
        :max-count="1"
        :extension="['jpg']"
        :class-name="[{ 'pb-b': medias.array.length }]"
      /> -->
      </FormGroup>
      <FormHeader title="出入规则" />
      <FormGroup>
        <view v-for="(tag, inx) in refTags" :key="tag.id" class="border-bottom border-line-default">
          <view class="flex h-88">
            <view @click.stop="handleReduceTag(inx)">
              <u-icon name="minus-circle-fill" size="48" color="#FF4D4F" />
            </view>
            <view @click.stop="handlePickTag(tag, inx)">
              <text v-if="tag.typeCode" class="font-xt ml-s">
                {{ SchoolRules[tag.typeCode] }}/{{ tag.name }}
              </text>
              <text v-else class="color-placeholder font-xt ml-s">请选择</text>
            </view>
          </view>
        </view>
        <view class="height-button-default flex">
          <view class="flex" @click.stop="handleAddTag">
            <u-icon name="plus-circle-fill" size="48" color="#176bfb" />
            <text class="color-primary font-xt ml-s">添加规则</text>
          </view>
        </view>
      </FormGroup>

      <FormHeader title="家长信息" />
      <FormGroup>
        <view v-for="(parent, inx) in parents" :key="parent.id || parent.localId"
          class="border-bottom border-line-default">
          <FormItem v-model:value="parent.name" value-type="input" :input-max-length="30" :need-line="true"
            @update="parent.name = $event">
            <template #left>
              <view class="flex-inline pr-s border-right border-thick border-line-default" style="height: 96rpx"
                @click="handleSwitchRelation(inx)">
                <view @click.stop="handleReduceParent(inx)">
                  <u-icon name="minus-circle-fill" style="margin-right: 32rpx" size="48" color="#FF4D4F" />
                </view>
                <text class="font-title color-base">{{ parent.relationName }}</text>
                <text class="font-xt color-error ml-xs mr-xxs">*</text>
                <u-icon name="arrow-right" color="#00000073" />
              </view>
            </template>
          </FormItem>
          <FormItem v-model:value="parent.mobilePhone" title="手机号" value-type="input"
            :input-type="phonePrivacyFlag ? 'text' : 'number'" :input-max-length="11"
            @update="updatePhone($event, inx)" />
        </view>
        <view class="height-button-default flex">
          <view class="flex" @click.stop="handleAddParent">
            <u-icon name="plus-circle-fill" size="48" color="#176bfb" />
            <text class="color-primary font-xt ml-s">新增家长</text>
          </view>
        </view>
      </FormGroup>
      <!-- <c-empty-line size="button-default" need-safe-bottom class-name="mtb-l" /> -->
    </view>
    <view>
      <view style="height: 162rpx"></view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
    <view class="bottom-btn">
      <u-button :plain="true" shape="square" :hair-line="false" :custom-style="{
        marginTop: '24rpx',
        marginLeft: '32rpx',
        marginRight: '32rpx',
        marginBottom: '24rpx',
        color: validate === false ? '#FFFFFF' : '#ffffff',
        height: '80rpx',
        borderRadius: '16rpx',
        backgroundColor: validate === false ? '#91CAFF' : '#176bfb',
        fontSize: '30rpx',
        fontWeight: '500',
        borderWidth: '0rpx',
      }" :disabled="validate === false" @click="handleSubmit">提交</u-button>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
  </page>
  <!-- <c-bottom>
    <c-button :disabled="validate === false" @click="handleSubmit">
      <text>提交</text>
    </c-button>
  </c-bottom> -->

  <u-select v-model="showCardType" :list="cardTypes" title="证件信息" title-type="text" @confirm="handleSwitchCardTypeNew" />

  <u-select v-model="showRelationShipType" :list="relationShips" title="亲属关系" title-type="text"
    @confirm="handleSwitchRelationTypeNew" />

  <u-select v-model="showTagPicker" mode="mutil-column-auto" :list="tagTree" title="提示" title-type="text"
    @confirm="handleSelectTag" />
</template>
<script lang="ts" setup>
import useCaptchaAuth, { getCaptcha } from '@/app-platform/contacts/add-student/use-captcha-auth';
import FormGroup from '@/app-platform/contacts/components/form-group/index.vue';
import FormHeader from '@/app-platform/contacts/components/form-header/index.vue';
import FormItem from '@/app-platform/contacts/components/form-item/index.vue';
import FormSelect from '@/app-platform/contacts/components/form-select/index.vue';
import {
  CertificateInfo,
  IGetTagTreeRtn,
  IStudentAdd,
  IStudentDetailRtn,
  IStudentDetailRtnWrap,
  ITagDTOList,
  SchoolRules,
  fileStreamBase64,
  getAccommodation,
  getTagTree,
  studentAdd,
  studentDetail,
  studentEdit,
} from '@/app-platform/services/contacts';
import { imgDetect } from '@/app-platform/services/mine';
import captchaImg from '@/app-platform/static/contacts/face-placeholder.svg';
import icon_file_plus from '@/app-platform/static/mine/icon_file_plus.svg';
import { REGS } from '@/app-platform/utils/regs';
import { LocationType, loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { assign, cloneDeep, map, template, uniqBy } from '@/utils/lodash-es';
import {
  deepClone,
  getPageParams,
  hideLoading,
  log,
  showConfirm,
  showInfo,
  showLoading,
} from '@/utils/tools';
import { chooseAndUploadImage } from '@/utils/upload-medias';
import dayjs from 'dayjs';
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
  toRaw,
  unref,
  watch,
  watchEffect,
} from 'vue';
import {
  ISelect,
  certificateTypeCodes,
  enum_accommodationType,
  enum_cardTypes,
  enum_gender,
  enum_parent_relation_ship,
} from './enum';

export interface IRefItem {
  el: typeof FormItem;
  id: IParent;
}

interface IUrlParam {
  id: string;
  clazzId: string;
  name: string;
  type: 'add' | 'edit';
}

interface IParent {
  id: string;
  localId?: string;
  name: string;
  relation: number;
  relationName: string;
  mobilePhone: string;
  holdMobilePhone: string;
}
[];

const urlParam = ref({} as IUrlParam);
let stuDetail = reactive({} as IStudentDetailRtnWrap);
const formData = reactive({} as IStudentAdd);
const parents = ref<IParent[]>([]);
const refTags = ref<ITagDTOList[]>([]);
const tagTree = ref([] as any[]);
const cardInf = ref({ value: 0, label: '身份证', cardNo: '', realCardNo: '', holdCardNo: '' });
const privacyUse = ref(false);
let tmpCardNo = Array(18).fill('');
const relationInf = ref({ value: 1, label: '母亲', relationValue: '' });
const curPicker = ref([
  { value: '', label: '' },
  { value: '', label: '' },
] as { value: any; label: string }[]);
const curPickerInx = ref(-1);
const show = ref(false);

const showCardType = ref(false);
const showRelationShipType = ref(false);
const showTagPicker = ref(false);
const curRelationShipInx = ref(0);

// store
const store = loginStore();
const { userInfo } = store;
let validTags = [] as IGetTagTreeRtn[];

const medias = reactive({
  array: [] as any,
  cloneArray: [] as any,
});
const genders = ref<ISelect[]>(deepClone(enum_gender));
const cardTypes = ref<ISelect[]>(deepClone(enum_cardTypes));
const accommodationTypes = ref<ISelect[]>(deepClone(enum_accommodationType)); //  住校信息
const accommodationRooms = ref([] as any[]); // 宿舍号, 非枚举
const relationShips = ref<ISelect[]>(deepClone(enum_parent_relation_ship));

const isPreSchool = computed(() => userInfo?.locationType === LocationType.PreSchool);

const allergyTypes = [
  '',
  '高蛋白过敏（鸡蛋、牛奶、牛肉等）',
  '水产品过敏（鱼、虾、蟹、贝等）',
  '坚果和种子过敏（花生、黄豆、腰果、杏仁等）',
  '水果过敏（芒果、草莓、菠萝等）',
  '药物过敏',
  '其他过敏',
];

const isEdit = computed(() => urlParam.value.type === 'edit');
const [initPrivacyFlag, refPrivacyFlag] = useCaptchaAuth(false);
// 是否隐私（true: 无隐私, false: 有隐私）
const phonePrivacyFlag = computed(() => refPrivacyFlag.value || !initPrivacyFlag.value);
// 是否隐私（true: 无隐私, false: 有隐私）
const privacyFlag = computed(
  () => (refPrivacyFlag.value || !initPrivacyFlag.value) && !privacyUse.value,
);
const allergyInfo = computed(() => {
  if (!formData) return '';
  const text = formData?.allergyTypeList?.reduce((text, item) => {
    let t = text;
    let str = allergyTypes[+item];
    if (item == 6 && formData?.allergyDetail) {
      str = str + `(${formData?.allergyDetail})`;
    }
    t = t + str + '、';
    return t;
  }, '');
  return text.substr(0, text.length - 1);
});

const birthday = computed(() => formData.birthday && dayjs(formData.birthday).format('YYYY-MM-DD'));

const itemValue = computed(() => {
  return (index: number) => parents.value[index].name;
});
const fetchAccommodation = async () => {
  const res = (await getAccommodation()) || [];
  accommodationRooms.value = res.map(tmp => {
    const { name, id } = tmp;
    return {
      value: id,
      label: name,
      checked: false,
    };
  });
};

const validate = computed(() => {
  if (formData.name?.trim().length === 0) return false;
  if (!genders.value.some(tmp => tmp.checked)) return false;
  if (cardInf.value.cardNo?.trim().length === 0) return false;
  if (!isPreSchool.value) {
    if (!accommodationTypes.value.some(tmp => tmp.checked)) return false;
  }
  if (parents.value.some(tmp => tmp.name?.trim().length === 0)) return false;
  if (parents.value.some(tmp => tmp.mobilePhone?.trim().length === 0)) return false;
  return true;
});
//用于标识证件号码是否被更新
const flagUpdateCardNum = ref(false);
const flagUpdateStudentCode = ref(false);
const updateCard = (realCardNo: string) => {
  log('updateCard : ', realCardNo);
  flagUpdateCardNum.value = realCardNo !== oldcertificateNumber.value;
  flagUpdateStudentCode.value = realCardNo !== oldStudentCode.value;
  //console.log("证件号码是否有更新：flagUpdateCardNum ", flagUpdateCardNum)
  if (realCardNo) {
    let cardNoArr = Array.from(realCardNo);
    tmpCardNo = tmpCardNo.map((item, index) => {
      if (index < cardNoArr.length) {
        const tmpCardIn = cardNoArr[index];
        if (tmpCardIn != '*') {
          item = tmpCardIn;
        }
      } else {
        item = '';
      }
      return item;
    });
  } else {
    tmpCardNo.length == 0;
  }
  cardInf.value.cardNo = realCardNo;
  // const { certificateType } = stuDetail.baseInfoResp || {};
  // const finalType = certificateType ?? cardInf.value.value;
  log('updateCard ---> privacyFlag : ', privacyFlag.value);
  const finalType = cardInf.value.value;
  if (certificateTypeCodes.includes(finalType)) {
    cardInf.value = {
      value: finalType,
      label: enum_cardTypes.find(tmp => tmp.value === finalType)?.label || '',
      cardNo: getCaptcha(realCardNo || '', unref(privacyFlag), {
        start: 3,
        end: realCardNo?.length - 3,
      }),
      realCardNo: realCardNo,
      holdCardNo: cardInf.value.holdCardNo,
    };
  } else {
    cardInf.value = {
      value: 1,
      label: '学籍号',
      cardNo: getCaptcha(realCardNo || '', unref(privacyFlag), {
        start: 0,
        end: realCardNo?.length - 4,
      }),
      realCardNo: realCardNo,
      holdCardNo: cardInf.value.holdCardNo,
    };
  }
};

const updatePhone = (realPhone: string, inx: number) => {
  log('updatePhone ---> realPhone : ', realPhone);
  if (realPhone) {
    const newMobilePhone = getCaptcha(realPhone || '', unref(privacyFlag), {
      start: 4,
      end: 7,
    });
    Object.assign(parents.value[inx], {
      mobilePhone: newMobilePhone,
    });
  }
};

const handleSwitchCardType = (inx: number) => {
  const { value, label } = cardTypes.value[inx];
  showCardType.value = false;
  cardInf.value = { value, label, cardNo: '', realCardNo: '', holdCardNo: '' };
};

const handleSwitchCardTypeNew = (res: any) => {
  const tmpItem = cardTypes.value.find(tmp => tmp.value == res[0].value);
  console.log('变更后的证件类型：', tmpItem);
  showCardType.value = false;
  cardInf.value = {
    value: tmpItem?.value ?? '',
    label: tmpItem?.label ?? '',
    cardNo: '',
    realCardNo: '',
    holdCardNo: '',
  };
};

const handleSwitchRelationType = (inx: number) => {
  const { value, label } = relationShips.value[inx];
  relationInf.value = { value, label, relationValue: '' };
  Object.assign(parents.value[curRelationShipInx.value], {
    relationName: label,
    relation: value,
  });
};

const handleSwitchRelationTypeNew = (res: any) => {
  const tmpItem = relationShips.value.find(tmp => tmp.value == res[0].value);
  relationInf.value = {
    value: tmpItem?.value || '',
    label: tmpItem?.label || '',
    relationValue: '',
  };
  Object.assign(parents.value[curRelationShipInx.value], {
    relationName: tmpItem?.label,
    relation: tmpItem?.value,
  });
};

const handleSwitchRelation = (inx: number) => {
  curRelationShipInx.value = inx;
  showRelationShipType.value = true;

  relationShips.value.forEach(item => {
    item.checked = item.value === parents.value[inx].relation;
  });
};

const handleAddTag = () => {
  if (!validTags || validTags.length == 0) {
    showInfo('暂无关联标签');
    return;
  }
  refTags.value.push({
    id: Math.random().toString(),
    typeCode: '' as any,
    name: '',
  });
};

const handleSelectTag = (res: any) => {
  log('handleSelectTag : ', res);
  curPicker.value = [
    { value: res[0].value, label: res[0].label },
    { value: res[1].value, label: res[1].label },
  ];

  refTags.value[curPickerInx.value] = {
    id: curPicker.value[1].value,
    name: curPicker.value[1].label,
    typeCode: curPicker.value[0].value,
  };
};

const handleAddParent = () => {
  parents.value.push({
    localId: Math.random().toString(),
    relation: 1,
    relationName: '母亲',
    name: '',
    mobilePhone: '',
    holdMobilePhone: '',
  } as any);
};

const handleReduceParent = (inx: number) => {
  parents.value.splice(inx, 1);
};

const handleReduceTag = (inx: number) => {
  refTags.value.splice(inx, 1);
};

/**
 * 检测是否隐私字段变化
 * @param oldStr 云端数据
 * @param newStr 输入框数据
 */
const checkPrivacyContent = (oldStr: string, newStr: string) => {
  log('checkPrivacyContent ---> initPrivacyFlag : ', initPrivacyFlag.value);
  log('checkPrivacyContent ---> oldStr : ', oldStr);
  log('checkPrivacyContent ---> newStr : ', newStr);
  return !initPrivacyFlag.value && (oldStr === newStr || newStr.indexOf('*') === -1);
};

const valify = () => {
  // if (!initPrivacyFlag.value) {
  //   showInfo('敏感数据请开通查看权限后上传图片');
  //   return false;
  // }

  if (formData.name.length <= 1 || formData.name.length > 30) {
    showInfo('学生姓名只允许输入2-30位字符');
    return false;
  }
  const tipOfCardValid = '证件号只能输入英文和数字';
  const tipOfCardValidV1 = '证件号只能输入中文、英文和数字';
  if (initPrivacyFlag.value) {
    log('cardNo : ', cardInf.value.cardNo);
    if (cardInf.value.value === 1) {
      if (
        !REGS.numberAndChar.test(cardInf.value.cardNo) ||
        cardInf.value.cardNo.indexOf('*') !== -1
      ) {
        showInfo(tipOfCardValid);
        return false;
      }
    } else {
      if (
        !REGS.numberAndCharV1.test(cardInf.value.cardNo) ||
        cardInf.value.cardNo.indexOf('*') !== -1
      ) {
        showInfo(tipOfCardValidV1);
        return false;
      }
    }
  } else {
    let canCardNoSubmit = checkPrivacyContent(cardInf.value.holdCardNo, cardInf.value.cardNo);
    log('canCardNoSubmit : ', canCardNoSubmit);
    if (
      cardInf.value.value === 1 &&
      !REGS.numberAndChar.test(cardInf.value.cardNo) &&
      !canCardNoSubmit
    ) {
      showInfo(tipOfCardValid);
      return false;
    }
    if (
      cardInf.value.value !== 1 &&
      !REGS.numberAndCharV1.test(cardInf.value.cardNo) &&
      !canCardNoSubmit
    ) {
      showInfo(tipOfCardValidV1);
      return false;
    }

    if (canCardNoSubmit) {
      if (
        cardInf.value.value === 1 &&
        !REGS.numberAndChar.test(cardInf.value.cardNo) &&
        cardInf.value.cardNo.indexOf('*') === -1
      ) {
        showInfo(tipOfCardValid);
        return false;
      }
      if (
        cardInf.value.value !== 1 &&
        !REGS.numberAndCharV1.test(cardInf.value.cardNo) &&
        cardInf.value.cardNo.indexOf('*') === -1
      ) {
        showInfo(tipOfCardValidV1);
        return false;
      }
    }
  }

  if (parents.value.some(tmp => tmp.name.length <= 1 || tmp.name.length > 30)) {
    showInfo('家长姓名只允许输入2-30位字符');
    return false;
  }

  if (initPrivacyFlag.value) {
    if (
      parents.value.some(tmp => {
        const phoneValidPass =
          tmp.mobilePhone.length === 11 && REGS.allNumber.test(tmp.mobilePhone);
        log('phoneValidPass : ', phoneValidPass);
        return !phoneValidPass;
      })
    ) {
      showInfo('手机号不合法');
      return false;
    }
  } else {
    if (
      parents.value.some(tmp => {
        const phoneValidPass =
          tmp.mobilePhone.length === 11 && REGS.allNumber.test(tmp.mobilePhone);
        log('phoneValidPass : ', phoneValidPass);
        const checkPrivacyContentResult = checkPrivacyContent(tmp.holdMobilePhone, tmp.mobilePhone);
        log('checkPrivacyContentResult : ', checkPrivacyContentResult);
        const checkResult =
          phoneValidPass || (tmp.mobilePhone.length === 11 && checkPrivacyContentResult);
        log('checkResult : ', checkResult);
        return !checkResult;
      })
    ) {
      showInfo('手机号不合法');
      return false;
    }
  }

  const phones = parents.value.map(tmp => tmp.mobilePhone) || [];
  const phonesDuliply = new Set([...phones]);
  if (phones.length !== phonesDuliply.size) {
    showInfo('手机号不能重复');
    return false;
  }
  // 关联标签校验: 可为空, 但不能重复
  const tags = refTags.value.filter(t => t.typeCode);
  if (tags.length && tags.length > uniqBy(tags, 'typeCode').length) {
    showInfo('同个类型下只能选择一个标签');
    return;
  }

  return true;
};

const handleSwitchDate = (date: { result: string }) => {
  // 暂时单独判断，后期组件内修改（樊留）
  if (date.result !== '0-NaN-NaN') {
    formData.birthday = date.result;
  }
};

const getFormData = () => {
  // 计算卡号类型
  let tmpCardInf = {};
  const baseInfoResp: any = { ...stuDetail.baseInfoResp };
  if (cardInf.value.value === 1) {
    tmpCardInf = {
      studentCode: flagUpdateStudentCode.value ? cardInf.value.realCardNo : oldStudentCode.value,
    };
    if (!baseInfoResp.certificateNumber) {
      delete baseInfoResp.certificateType;
      delete baseInfoResp.certificateNumber;
    }
  } else {
    tmpCardInf = {
      certificateType: cardInf.value.value,
      certificateNumber: flagUpdateCardNum.value ? tmpCardNo.join('') : oldcertificateNumber.value,
    };
  }
  Object.assign(formData, tmpCardInf, {
    clazzId: urlParam.value.type === 'add' ? urlParam.value.id : baseInfoResp.clazzId,
    gender: genders.value.find(tmp => tmp.checked)?.value,
    accommodation: accommodationTypes.value.find(tmp => tmp.checked)?.value,
    spaceId: accommodationRooms.value.find(tmp => tmp.checked)?.value,
    parentReqs: parents.value.map(tmp => {
      tmp.localId && (delete tmp.localId);
      const { mobilePhone } = tmp;
      if ((stuDetail?.baseInfoResp?.studentParentResps || []).find(item => item.mobilePhone === mobilePhone)) {
        return tmp;
      } else {
        const { name, relation, mobilePhone } = tmp;
        return { name, relation, mobilePhone };
      }
    }),
    tagDTOList: toRaw(refTags.value.filter(t => t.typeCode)) || [],
  });

  const paramObj = {
    baseInfoReq: Object.assign({}, baseInfoResp, formData),
    voucherReq: {
      ...stuDetail.voucherResp,
      name: formData.name,
      personType: 1,
      studentCode: formData.studentCode,
      locationId: '',
      id: urlParam.value.type === 'add' ? '' : stuDetail.voucherResp?.id || '',
      cardCode: urlParam.value.type === 'add' ? '' : stuDetail.voucherResp.cardCode,
      faces: [],
    } as CertificateInfo,
  };

  if (medias.array.length) {
    medias.array.forEach((tmp: any) => {
      const { fileId: imgId, url, url_back } = tmp;
      paramObj.voucherReq.faces?.push({ imgId, imgUrl: url_back || url });
    });
  }

  return paramObj;
};

const handleSubmit = async () => {
  if (!valify()) return;

  const res = await showConfirm({ content: '确认提交?' });
  if (!res) return;

  const paramObj = getFormData();
  if (isPreSchool.value) {
    paramObj.baseInfoReq.accommodation = 0;
  }

  if (urlParam.value.type === 'add') {
    await studentAdd(paramObj);
    uni.$emit('addStuCallback', { id: urlParam.value.id });
    uni.navigateBack({
      success: () => {
        showInfo('新增成功');
      },
    });
  } else {
    // console.log("提交用户数据：原来身份证信息", oldcertificateNumber);
    // console.log("提交用户数据:", paramObj)
    await studentEdit(urlParam.value.id, paramObj);
    // 编辑学生信息的时候有传clazzId
    uni.$emit('DetailUpdateStudent', { id: urlParam.value.clazzId });
    uni.navigateBack({
      success: () => {
        showInfo('更新成功');
      },
    });
  }
};

const oldcertificateNumber = ref('');
const oldStudentCode = ref('');
const setDetail = (obj: IStudentDetailRtn) => {
  const {
    name,
    birthday,
    gender,
    accommodation,
    spaceId,
    certificateType,
    certificateNumber,
    studentCode,
    studentParentResps,
    allergyTypeList,
    allergyDetail,
    tagDTOList,
  } = obj || {};

  log('setDetail -> certificateType : ', certificateType);
  log('setDetail -> certificateNumber : ', certificateNumber);
  if (certificateNumber) {
    oldcertificateNumber.value = certificateNumber;
  }
  if (studentCode) {
    oldStudentCode.value = studentCode;
  }

  Object.assign(formData, {
    name,
    birthday,
    allergyTypeList,
    allergyDetail,
  });

  const generInx = genders.value.findIndex(tmp => tmp.value === gender);
  if (generInx > -1) genders.value[generInx].checked = true;

  const accommodationInx = accommodationTypes.value.findIndex(tmp => tmp.value === accommodation);
  if (accommodationInx > -1) accommodationTypes.value[accommodationInx].checked = true;

  if (accommodation === 1) {
    const roomInx = accommodationRooms.value.findIndex(tmp => tmp.value === spaceId);
    if (roomInx > -1) accommodationRooms.value[roomInx].checked = true;
  }

  const cardTypeInx = cardTypes.value.findIndex(
    tmp => tmp.value === (certificateType == null ? 1 : certificateType),
  );
  if (cardTypeInx > -1) cardTypes.value[cardTypeInx].checked = true;
  if (certificateTypeCodes.includes(certificateType) && certificateNumber) {
    cardInf.value = {
      value: certificateType,
      label: enum_cardTypes.find(tmp => tmp.value === certificateType)?.label || '',
      cardNo: getCaptcha(certificateNumber || '', unref(privacyFlag), {
        start: 3,
        end: certificateNumber?.length - 3,
      }),
      realCardNo: certificateNumber,
      holdCardNo: certificateNumber,
    };
  } else {
    cardInf.value = {
      value: 1,
      label: '学籍号',
      cardNo: getCaptcha(studentCode || '', unref(privacyFlag), {
        start: 0,
        end: studentCode?.length - 4,
      }),
      realCardNo: studentCode,
      holdCardNo: studentCode,
    };
  }

  parents.value = (studentParentResps || []).map(tmp => {
    const { id, name, relation, mobilePhone } = tmp;
    const newMobilePhone = getCaptcha(mobilePhone || '', unref(privacyFlag), {
      start: 3,
      end: 7,
    });
    return {
      ...tmp,
      id,
      name,
      relation,
      mobilePhone: newMobilePhone,
      relationName: enum_parent_relation_ship.find(tmp2 => tmp2.value === relation)?.label || '',
      holdMobilePhone: mobilePhone,
    };
  });
  // 关联标签
  if (tagDTOList.length) {
    refTags.value = tagDTOList.map(({ id, typeCode, name }) => ({
      id,
      typeCode,
      name,
    }));
  }
};

const setImageCaptcha = () => {
  log('setImageCaptcha');
  if (!isEdit.value) return;
  if (unref(privacyFlag)) {
    medias.array = map(medias.array, media => assign(media, { url: captchaImg }));
  } else {
    medias.array = cloneDeep(medias.array.length ? medias.cloneArray : []);
  }
  log('setImageCaptcha -> medias.array: ', medias.array);
};

const handleSelectPhoto = async () => {
  const sussRes: any[] = await chooseAndUploadImage(medias.array, 1, false, true);
  log('handleSelectPhoto -> sussRes : ', sussRes);
  if (!sussRes.length) return;
  // 只有一张图片直接取
  const { fileId: imgId, url: imgUrl } = sussRes[0];
  showLoading('校验中');
  // 检测图片质量
  try {
    const res: any = await imgDetect({
      imgId,
      imgUrl,
      locationId: userInfo?.locationId,
    });
    hideLoading();
    if (res.pass === 0) {
      showInfo('人脸照片质量过低, 请重新上传');
      return;
    }
    medias.array = sussRes;
    log('handleSelectPhoto -> medias.array[0] : ', medias.array[0]);
    medias.cloneArray = cloneDeep(medias.array);
    setImageCaptcha();
  } catch (err: any) {
    showInfo(err);
  }
};

const setCaptchaDetail = () => {
  const { certificateType, certificateNumber, studentCode } = stuDetail.baseInfoResp || {};
  log('certificateType : ', certificateType);
  log('certificateNumber : ', certificateNumber);
  log('studentCode : ', studentCode);
  if (certificateTypeCodes.includes(certificateType) && certificateNumber) {
    cardInf.value = {
      value: certificateType,
      label: enum_cardTypes.find(tmp => tmp.value === certificateType)?.label || '',
      cardNo: getCaptcha(certificateNumber || '', unref(privacyFlag), {
        start: 3,
        end: certificateNumber?.length - 3,
      }),
      realCardNo: certificateNumber,
      holdCardNo: certificateNumber,
    };
  } else {
    if (certificateType) {
      const targetItem = enum_cardTypes.filter(item => item.value === certificateType)[0];
      cardInf.value = {
        value: targetItem.value,
        label: targetItem.label,
        cardNo: getCaptcha(studentCode || '', unref(privacyFlag), {
          start: 0,
          end: studentCode?.length - 4,
        }),
        realCardNo: studentCode,
        holdCardNo: studentCode,
      };
    } else {
      cardInf.value = {
        value: 0,
        label: '身份证',
        cardNo: getCaptcha(studentCode || '', unref(privacyFlag), {
          start: 0,
          end: studentCode?.length - 4,
        }),
        realCardNo: studentCode,
        holdCardNo: studentCode,
      };
    }
  }
  parents.value = map(parents.value, tmp => {
    const { id, name, relation, mobilePhone } = tmp;
    const newMobilePhone = getCaptcha(mobilePhone || '', unref(privacyFlag), {
      start: 4,
      end: 7,
    });
    return {
      ...tmp,
      id,
      name,
      relation,
      mobilePhone: newMobilePhone,
      relationName: enum_parent_relation_ship.find(tmp2 => tmp2.value === relation)?.label || '',
      holdMobilePhone: mobilePhone,
    };
  });
};

const handlePickTag = (tag: ITagDTOList, inx: number) => {
  showTagPicker.value = true;
  curPicker.value = tag.typeCode
    ? [
      { value: tag.typeCode, label: '' },
      { value: tag.id, label: tag.name },
    ]
    : [
      {
        value: tagTree.value[0]?.value || '',
        label: '',
      },
      {
        value: tagTree.value[0]?.children[0].id || '',
        label: '',
      },
    ];
  curPickerInx.value = inx;
};

const fetchStuDetail = async () => {
  log('fetchStuDetail, userType : ', store.currentUserType);
  const res = await studentDetail(urlParam.value.id);
  console.log('fetchStuDetail 学生详细信息', res);
  stuDetail = Object.assign(stuDetail, res);
  setCaptchaDetail();

  setDetail(res.baseInfoResp);

  privacyUse.value = true;
  log('init ---> privacyFlag : ', privacyFlag.value);

  if (store.currentUserType == EUserType.student) {
    // 图片
    if (res.baseInfoResp.imageResps?.length) {
      const fileId: any = (res.baseInfoResp.imageResps || [])
        .filter(item => item.type == 0)
        .map(image => image.imgId);
      if (!!fileId.length) {
        const url = await fileStreamBase64(fileId);
        medias.array.push({ url });
        medias.cloneArray = cloneDeep(medias.array);
        setImageCaptcha();
      }
    }
  } else {
    // 图片
    if (res.voucherResp.faces?.length) {
      // 最多一张图片
      const { imgUrl, imgId: fileId } = res.voucherResp.faces[0];
      const url = await fileStreamBase64(fileId);
      medias.array = [{ fileId, url, url_back: imgUrl, type: 1 }];
      medias.cloneArray = cloneDeep(medias.array);
      setImageCaptcha();
    }
  }
};

const fetchStudentTags = async () => {
  const res = await getTagTree();
  log('getTagTree : ', res);
  // 必须是2维数组, 即tagVOList必须有值
  validTags = res.filter(t => t.tagVOList.length);
  log('fetchStudentTags -> validTags : ', validTags);
  tagTree.value = validTags.map(t => {
    return {
      label: t.tagTypeName,
      value: t.tagTypeCode,
      children: t.tagVOList.map(c => {
        return {
          label: c.name,
          value: `${c.id}`, // 强转string
        };
      }),
    };
  });
  log('tagTree : ', tagTree);
};

const init = () => {
  if (urlParam.value.type === 'add') {
    cardTypes.value[0].checked = true;
    privacyUse.value = true;
    log('init ---> privacyFlag : ', privacyFlag.value);
  } else if (urlParam.value.type === 'edit') {
    fetchStuDetail();
  }
  fetchStudentTags();
};

// 跳转至过敏信息页，传递初始值＋列表字典数据
const onClickAllergyType = () => {
  const initData = JSON.stringify({
    types: formData?.allergyTypeList,
    otherDesc: formData?.allergyDetail,
  });
  log('onClickAllergyType -> initData : ', initData);
  uni.navigateTo({
    url: `/app-platform/contacts/allergyType-select/index?initData=${initData}`,
  });
};

// 过敏信息选择、填写回调 allergyTypeList：序号 allergyDetail：其他过敏信息
const handleAllergySelected = ({
  allergyTypeList,
  allergyDetail,
}: {
  allergyTypeList: number[];
  allergyDetail: string;
}) => {
  Object.assign(formData, {
    allergyTypeList,
    allergyDetail,
  });
};

function handleShow() {
  show.value = true;
}

watch(
  () => cardInf.value.value,
  (newValue, oldValue) => {
    console.debug('cardInf.value', newValue, oldValue);
    if (newValue !== oldValue) {
      tmpCardNo = Array(newValue === 1 ? 30 : 18).fill('');
    }
  },
);

/** 监听打码逻辑, 编辑时上传图片 */
watchEffect(setCaptchaDetail, { flush: 'sync' });

/** 兼容微信显示问题 */
let photoFormViewStyles = computed(() => ({}));
let photoMaginViewStyles = computed(() => ({ height: '24rpx' }));
// #ifndef MP-WEIXIN
photoFormViewStyles = computed(() => ({
  position: 'absolute',
  right: 0,
  marginRight: '64rpx',
}));
photoMaginViewStyles = computed(() => ({ height: '48rpx' }));
// #endif

onBeforeMount(async () => {
  uni.$on('onAllergySelected', handleAllergySelected);
  urlParam.value = getPageParams();
  if (urlParam.value.type === 'add') {
    uni.setNavigationBarTitle({ title: '新增学生' });
  } else if (urlParam.value.type === 'edit') {
    uni.setNavigationBarTitle({ title: '编辑学生' });
  }
  await fetchAccommodation();
  init();
});

onBeforeUnmount(() => {
  uni.$off('onAllergySelected', handleAllergySelected);
});
</script>
<style lang="scss" scoped>
.bottom-btn {
  z-index: 2;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
}

.scroll-content {
  overflow: scroll;
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

.stu-info-text {
  display: flex;
  margin: 36rpx 64rpx 16rpx;
  color: #000000a6;
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 36rpx;
  /* 138.462% */
}

.color-primary {
  color: $ui-color-primary;
}

.flex {
  display: flex;
  align-items: center;
}

.pr-s {
  padding-right: 16rpx;
}

.ml-xs {
  margin-left: 12rpx;
}

.mr-xxs {
  margin-right: 24rpx;
}

.ml-s {
  margin-left: 16rpx;
}

.h-88 {
  height: 88rpx;
}

.flex-inline {
  display: inline-flex;
  align-items: center;
}

.font-title {
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
}

.font-xt {
  font-size: 34rpx;
}

.color-base {
  color: #1d2129;
}

.color-placeholder {
  color: #00000073;
}

.color-secondary {
  color: #4e5969;
}

.color-error {
  color: #f53f3f;
}

.text-ellipse {
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
  white-space: nowrap;
}

.border-right {
  border-right-width: 0rpx;
  border-right-style: solid;
}

.border-thick {
  border-width: 0rpx;
}

.border-line-default {
  border-color: #e5e6eb;
}

.border-bottom {
  border-bottom-width: 1rpx;
  border-bottom-style: solid;
}

.height-button-default {
  padding: 24rpx 0;
}

.file-plus-size {
  width: 144rpx;
  height: 144rpx;
  border-radius: 16rpx 16rpx;
}

.u-fixed-placeholder {
  /* #ifndef APP-NVUE */
  box-sizing: content-box;
  /* #endif */
}
</style>
