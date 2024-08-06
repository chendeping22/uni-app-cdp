<template>
  <mt-page title="学生详情" theme="default" class-name="plr-l" :show-top-gap="false">
    <template v-if="!pageParam.id">
      <FormGroup>
        <FormItem title="姓名" value="" value-type="text" :required="false" />
        <FormItem title="性别" value="" value-type="text" :required="false" />
      </FormGroup>
    </template>
    <template v-else>
      <!--学生信息-->
      <FormHeader :title="`学生信息(${stuDetail.clazzName ? stuDetail.clazzName : ''})`" />
      <UserProfile :user="profileDetail" />
      <c-card class-name="mt-b">
        <view class="flex">
          <view class="col-6 color-placeholder"> 出生日期 </view>
          <view>{{ formatDate(stuDetail.birthday) || '/' }}</view>
        </view>
        <view v-if="false" class="flex flex-start">
          <view class="col-6 color-placeholder"> 过敏信息 </view>
          <view class="col-18 flex-column-plain">
            <template v-if="allergyInfo?.length">
              <view v-for="item of allergyInfo" :key="item" class="flex flex-start">
                <text class="prefix-circle">·</text><text>{{ item }}</text>
              </view>
            </template>
            <text v-else>/</text>
          </view>
        </view>
        <template v-if="!isPreSchool">
          <view class="flex">
            <view class="col-6 color-placeholder"> 住校信息 </view>
            <view>{{ accommodationInfo }}</view>
          </view>
          <view v-if="stuDetail.accommodation === 1" class="flex mt-xxs">
            <view class="col-6 color-placeholder"> 宿舍号 </view>
            <view>{{ stuDetail.spaceName || '/' }}</view>
          </view>
        </template>
        <view class="bold mt-b">人脸凭证</view>
        <view class="mt-b">
          <c-images v-model:list="medias.array" type="mini" :editable="false" />
          <view v-if="!medias.array.length" class="font-secondary color-placeholder">无</view>
        </view>
      </c-card>
    </template>
    <c-empty-line size="button-default" need-safe-bottom class-name="mtb-l" />
  </mt-page>

  <c-bottom v-if="!stuDetail.clazzOperator && !isStudent">
    <c-button @click="handleEditStu">编辑</c-button>
  </c-bottom>
</template>
<script lang="ts">
import FormGroup from '@/app-school-affairs/components/form-group/index.vue';
import FormHeader from '@/app-school-affairs/components/form-header/index.vue';
import FormItem from '@/app-school-affairs/components/form-item/index.vue';
import mtPage from '@/app-school-affairs/components/mt-page/mt-page.vue';
import UserProfile, { IUserProfile } from '@/app-school-affairs/components/user-profile/index.vue';
import {
  IStudentDetailRtn,
  // fileStreamBase64,
  studentDetail,
} from '@/app-school-affairs/services/home-school-communication';
import {
  certificateTypeCodes,
  enum_accommodationType,
  enum_cardTypes,
} from '@/app-school-affairs/student-archive/enum';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { toLower } from '@/utils/lodash-es';
import { formatDate, getPageParams } from '@/utils/tools';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';

interface IPageParam {
  id: string;
}
export default defineComponent({
  components: { FormGroup, FormItem, UserProfile, FormHeader, mtPage },
  setup() {
    const store = loginStore();
    const pageParam = ref({} as IPageParam);
    const stuDetail = reactive({} as IStudentDetailRtn);
    const profileDetail = reactive({} as IUserProfile);
    const showPrivacyPic = ref(true);
    const medias = reactive({
      array: [] as any[],
    });
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
        arr.push(allergyTypes[+item]);
        return arr;
      }, []);
      return infos;
    });
    const isPreSchool = computed(() => toLower(store.userInfo?.locationType) === 'pre:school');

    const accommodationInfo = computed(() => {
      return enum_accommodationType.find(tmp => tmp.value === stuDetail.accommodation)?.text || '/';
    });
    const setDetail = () => {
      const { name, gender, certificateNumber, certificateType, studentCode, imageResps } =
        stuDetail;
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
          ? `${enum_cardTypes.find(tmp => tmp.value === certificateType)?.text}: ${certificateNumber ?? '/'
          }`
          : `学籍号: ${studentCode ?? '/'}`,
      });
    };
    const fetchStuDetail = async () => {
      medias.array = [];
      console.log('fetchStuDetail : ' + JSON.stringify(pageParam.value.id));
      if (!pageParam.value.id) {
        console.log('currentOrganization_childId : ' + store.currentOrganization?.childId);
        if (store.currentUserType === EUserType.student) {
          pageParam.value.id = store.userInfo?.personId ?? '';
        } else {
          pageParam.value.id = store.currentOrganization?.childId + '' ?? '';
        }
      }
      const res = await studentDetail(pageParam.value.id);
      showPrivacyPic.value = res.showPrivacyPic;
      Object.assign(stuDetail, res.baseInfoResp);
      setDetail();
      if (res.voucherResp.faces?.length) {
        // 最多一张图片
        const { imgUrl } = res.voucherResp.faces[0];
        // const url = await fileStreamBase64(fileId);
        medias.array.push({ url: imgUrl });
      }
    };
    const handleEditStu = () => {
      const { id } = pageParam.value;
      uni.navigateTo({
        url: `/app-school-affairs/student-archive/edit/index?id=${id}&name=${stuDetail.clazzName}&type=edit`,
      });
    };

    const handleUpdateStudent = () => {
      fetchStuDetail();
    };

    onBeforeMount(() => {
      pageParam.value = getPageParams();
      fetchStuDetail();
      uni.$on('DetailUpdateStudent', handleUpdateStudent);
    });

    onBeforeUnmount(() => {
      uni.$off('DetailUpdateStudent', handleUpdateStudent);
    });

    return {
      pageParam,
      accommodationInfo,
      stuDetail,
      allergyInfo,
      profileDetail,
      showPrivacyPic,
      medias,
      formatDate,
      handleEditStu,
      isStudent,
      isPreSchool,
    };
  },
});
</script>
<style lang="scss" scoped>
.prefix-circle {
  margin-right: 4px;
  font-weight: 600;
}
</style>
