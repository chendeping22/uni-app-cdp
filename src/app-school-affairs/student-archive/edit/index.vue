<template>
  <mt-page :title="urlParam.type === 'add' ? '新增学生' : '编辑学生'" class-name="plr-l" :show-top-gap="false">
    <FormHeader :title="`学生信息（${urlParam.name}）`" />
    <FormGroup>
      <FormItem v-model:value="formData.name" title="姓名" value-type="input" :input-max-length="10" />
      <FormSelect v-model:list="genders" title="性别" select-title="请选择性别" />
      <FormItem title="出生日期" :required="false">
        <template #right>
          <view class="flex-inline font-title" @click="handleShow">
            <text v-if="!formData.birthday" class="color-placeholder">请选择</text>
            <text v-else class="color-secondary text-ellipse">
              {{ birthday }}
            </text>
            <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
            <c-calendar v-model:open="show" v-model="birthday" mode="date" z-index="10000000" max-date="9999-12-31"
              @change="handleSwitchDate" />
          </view>
        </template>
      </FormItem>
      <FormItem v-if="false" title="过敏信息" :required="false">
        <template #right>
          <view class="flex-inline font-title text-ellipse" @click="onClickAllergyType">
            <text v-if="!formData.allergyTypeList?.length" class="color-placeholder">请选择</text>
            <text v-else class="color-secondary text-ellipse">
              {{ allergyInfo }}
            </text>
            <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
          </view>
        </template>
      </FormItem>
      <FormSelect v-model:list="cardTypes" title="证件类型" select-title="证件类型" title-type="text"
        :auto-close-after-select="false" @change="handleSwitchCardType" />
      <FormItem v-model:value="cardInf.cardNo" title="证件号码" value-type="input"
        :input-type="cardInf.value === 0 ? 'idcard' : 'text'" :input-max-length="cardInf.value === 1 ? 30 : 18"
        :need-line="!isPreSchool" />
      <template v-if="!isPreSchool">
        <FormSelect v-model:list="accommodationTypes" title="住校信息" select-title="请选择住校信息" title-type="text"
          :auto-close-after-select="false" />
        <FormSelect v-if="accommodationTypes[1].checked" v-model:list="accommodationRooms"
          :auto-close-after-select="false" :required="false" title-type="text" title="宿舍号" select-title="请选择宿舍号"
          @onClear="accommodationRooms.forEach(tmp => (tmp.checked = false))" />
      </template>
    </FormGroup>
    <FormGroup class-name="mt-b">
      <FormItem title="照片" :required="false">
        <template #right>
          <c-image v-if="stuDetail.showPrivacyPic !== false || stuDetail.baseInfoResp?.faceStatus === 0" :src="icon_punch"
            width="48" height="48" @click="handleSelectPhoto" />
        </template>
      </FormItem>
      <c-images v-model:list="medias.array" type="mini" max-count="1" :extension="['jpg']"
        :class-name="{ 'pb-b': medias.array.length }" />
    </FormGroup>

    <c-empty-line size="button-default" need-safe-bottom class-name="mtb-l" />
  </mt-page>

  <c-bottom>
    <c-button :disabled="validate === false" @click="handleSubmit">
      <text>提交</text>
    </c-button>
  </c-bottom>

  <c-select v-model:show="showCardType" v-model:list="cardTypes" show-check-icon title="证件信息" title-type="text"
    @onConfirm="handleSwitchCardType" />
</template>
<script lang="ts">
import { REGS } from '@/app-platform/utils/regs';
import FormGroup from '@/app-school-affairs/components/form-group/index.vue';
import FormHeader from '@/app-school-affairs/components/form-header/index.vue';
import FormItem from '@/app-school-affairs/components/form-item/index.vue';
import FormSelect from '@/app-school-affairs/components/form-select/index.vue';
import mtPage from '@/app-school-affairs/components/mt-page/mt-page.vue';
import {
  CertificateInfo,
  IStudentAdd,
  IStudentDetailRtn,
  IStudentDetailRtnWrap,
  fileStreamBase64,
  getAccommodation,
  imgDetect,
  studentAdd,
  studentDetail,
  studentEdit,
} from '@/app-school-affairs/services/home-school-communication';
import icon_punch from '@/app-school-affairs/static/profile/icon_punch.svg';
import {
  ISelect,
  certificateTypeAllCodes,
  certificateTypeCodes,
  enum_accommodationType,
  enum_cardTypes,
  enum_gender,
} from '@/app-school-affairs/student-archive/enum';
import { loginStore } from '@/store/modules/login';
import { toLower } from '@/utils/lodash-es';
import { deepClone, getPageParams, log, showConfirm, showInfo } from '@/utils/tools';
import { chooseAndUploadImage } from '@/utils/upload-medias';
import dayjs from 'dayjs';
import { computed, defineComponent, onBeforeMount, reactive, ref } from 'vue';

interface IUrlParam {
  id: string;
  name: string;
  type: 'add' | 'edit';
}

export default defineComponent({
  components: { FormGroup, FormItem, FormSelect, FormHeader, mtPage },
  setup() {
    const store = loginStore();
    const urlParam = ref({} as IUrlParam);
    const stuDetail = reactive({} as IStudentDetailRtnWrap);
    const formData = reactive({} as IStudentAdd);
    const cardInf = ref({ value: 0, text: '身份证', cardNo: '' });
    const show = ref(false);

    const birthday = computed(
      () => formData.birthday && dayjs(formData.birthday).format('YYYY-MM-DD'),
    );

    const showCardType = ref(false);
    const isPreSchool = computed(() => toLower(store.userInfo?.locationType) === 'pre:school');

    const medias = reactive({
      array: [] as any[],
    });
    const genders = ref<ISelect[]>(deepClone(enum_gender));
    const cardTypes = ref<ISelect[]>(deepClone(enum_cardTypes));
    const accommodationTypes = ref<ISelect[]>(deepClone(enum_accommodationType)); //  住校信息
    const accommodationRooms = ref([] as any[]); // 宿舍号, 非枚举

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

    const fetchAccommodation = async () => {
      const res = (await getAccommodation()) || [];
      accommodationRooms.value = res.map(tmp => {
        const { name, id } = tmp;
        return {
          value: id,
          text: name,
          checked: false,
        };
      });
    };

    const validate = computed(() => {
      if (formData.name?.trim().length === 0) return false;
      if (!genders.value.some(tmp => tmp.checked)) return false;
      if (cardInf.value.cardNo?.trim().length === 0) return false;
      if (!certificateTypeAllCodes.includes(cardInf.value.value)) return false;
      if (!isPreSchool.value) {
        if (!accommodationTypes.value.some(tmp => tmp.checked)) return false;
      }
      return true;
    });

    const handleSwitchCardType = (inx: number) => {
      const { value, text = '' } = cardTypes.value[inx] || {};
      cardInf.value = { value, text, cardNo: '' };
      showCardType.value = false;
    };

    const handleSelectPhoto = async () => {
      const sussRes: any[] = await chooseAndUploadImage(medias.array, 1, false, true);
      if (!sussRes.length) return;
      // 只有一张图片直接取
      const { fileId: imgId, url: imgUrl } = sussRes[0];
      // 检测图片质量
      const res: any = await imgDetect({
        imgId,
        imgUrl,
        locationId: store.userInfo?.locationId,
      });
      if (res.pass === 0) {
        showInfo('人脸照片质量过低, 请重新上传');
        return;
      }
      medias.array.push(...sussRes);
    };

    const valify = () => {
      if (!REGS.userName.test(formData.name)) {
        showInfo('学生姓名只允许输入2-10位中英文字符');
        return false;
      }
      log('cardInf.value.text : ', cardInf.value.cardNo);
      if (cardInf.value.value === 1) {
        if (!REGS.numberAndChar.test(cardInf.value.cardNo)) {
          showInfo('证件号只能输入英文和数字');
          return false;
        }
      } else {
        if (!REGS.numberAndCharV1.test(cardInf.value.cardNo)) {
          showInfo('证件号只能输入中文、英文和数字');
          return false;
        }
      }

      return true;
    };

    const handleSwitchDate = (date: { result: string }) => {
      formData.birthday = date.result;
    };

    const getFormData = () => {
      // 计算卡号类型
      let tmpCardInf = {};
      if (cardInf.value.value === 1) {
        tmpCardInf = {
          studentCode: cardInf.value.cardNo,
        };
      } else {
        tmpCardInf = {
          certificateType: cardInf.value.value,
          certificateNumber: cardInf.value.cardNo,
        };
      }

      Object.assign(formData, tmpCardInf, {
        clazzId: urlParam.value.type === 'add' ? urlParam.value.id : stuDetail.baseInfoResp.clazzId,
        gender: genders.value.find(tmp => tmp.checked)?.value,
        accommodation: accommodationTypes.value.find(tmp => tmp.checked)?.value,
        spaceId: accommodationRooms.value.find(tmp => tmp.checked)?.value,
        locationId: stuDetail.baseInfoResp.locationId,
        parentReqs: stuDetail.baseInfoResp.studentParentResps,
      });

      const paramObj = {
        baseInfoReq: {
          ...stuDetail.baseInfoResp,
          ...{
            studentCode: undefined,
            certificateType: undefined,
            certificateNumber: undefined,
          },
          ...formData,
        },
        voucherReq: {
          ...stuDetail.voucherResp,
          name: formData.name,
          personType: 1,
          studentCode: formData.studentCode,
          locationId: stuDetail.voucherResp.locationId,
          id: stuDetail.voucherResp?.id || '',
          cardCode: stuDetail.voucherResp?.cardCode || '',
          faces: [],
        } as CertificateInfo,
      };

      if (medias.array.length) {
        medias.array.forEach(tmp => {
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
        uni.navigateBack({
          success: () => {
            showInfo('新增成功');
          },
        });
      } else {
        await studentEdit(urlParam.value.id, paramObj);
        uni.$emit('DetailUpdateStudent');
        uni.navigateBack({
          success: () => {
            showInfo('更新成功');
          },
        });
      }
    };

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
        allergyTypeList,
        allergyDetail,
      } = obj;
      Object.assign(formData, {
        name,
        birthday,
        allergyTypeList,
        allergyDetail,
      });
      const generInx = genders.value.findIndex(tmp => tmp.value === gender);
      if (generInx > -1) genders.value[generInx].checked = true;

      const accommodationInx = accommodationTypes.value.findIndex(
        tmp => tmp.value === accommodation,
      );
      if (accommodationInx > -1) accommodationTypes.value[accommodationInx].checked = true;

      if (accommodation === 1) {
        const roomInx = accommodationRooms.value.findIndex(tmp => tmp.value === spaceId);
        if (roomInx > -1) accommodationRooms.value[roomInx].checked = true;
      }
      if (certificateTypeCodes.includes(certificateType)) {
        cardInf.value = {
          value: certificateType,
          cardNo: certificateNumber,
          text: enum_cardTypes.find(tmp => tmp.value === certificateType)?.text || '',
        };

        const cardTypeInx = cardTypes.value.findIndex(tmp => tmp.value === certificateType);
        if (cardTypeInx > -1) cardTypes.value[cardTypeInx].checked = true;
      } else {
        cardInf.value = {
          value: 1,
          text: '学籍号',
          cardNo: studentCode,
        };
        cardTypes.value[1].checked = true;
      }
    };

    const fetchStuDetail = async () => {
      const res = await studentDetail(urlParam.value.id);
      Object.assign(stuDetail, res);

      setDetail(res.baseInfoResp);
      if (res.voucherResp.faces?.length) {
        // 最多一张图片
        const { imgUrl, imgId: fileId } = res.voucherResp.faces[0];
        const url = await fileStreamBase64(fileId);
        medias.array.push({ fileId, url, url_back: imgUrl, type: 1 });
      }
    };

    const init = async () => {
      await fetchAccommodation();
      if (urlParam.value.type === 'add') {
        cardTypes.value[0].checked = true;
      } else if (urlParam.value.type === 'edit') {
        fetchStuDetail();
      }
    };

    // 跳转至过敏信息页，传递初始值＋列表字典数据
    const onClickAllergyType = () => {
      const initData = JSON.stringify({
        types: formData?.allergyTypeList,
        otherDesc: formData?.allergyDetail,
      });
      uni.navigateTo({
        url: `/app-platform/contacts/allergyType-select/index?initData=${initData}`,
      });
    };

    // 过敏信息选择、填写回调
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

    onBeforeMount(() => {
      uni.$on('onAllergySelected', handleAllergySelected);
      urlParam.value = getPageParams();

      init();
    });

    function handleShow() {
      show.value = true;
    }

    return {
      show,
      urlParam,
      validate,
      formData,
      genders,
      cardTypes,
      accommodationRooms,
      allergyInfo,
      showCardType,
      stuDetail,
      dayjs,
      birthday,
      cardInf,
      accommodationTypes,
      icon_punch,
      medias,
      handleSwitchCardType,
      handleSelectPhoto,
      handleSubmit,
      handleSwitchDate,
      onClickAllergyType,
      handleShow,
      isPreSchool,
    };
  },
});
</script>
