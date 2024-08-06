<template>
  <mt-page
    :title="isHistoryTitle ? '历史记录' : '一日三检'"
    :show-top-gap="false"
    :show-bottom-gap="false"
    :show-notice-bar="false"
  >
    <c-dropdown class-name="bg-white" show-arrow @onChange="pickEvent">
      <c-dropdown-item :type="0" :title="clazzName" />
      <c-dropdown-item
        v-model:value="inspectionMode"
        :type="1"
        title="全部任务"
        :list="inspectionModes"
      />
      <c-dropdown-item
        v-model:value="deviceTypeId"
        :type="1"
        title="健康状态"
        :list="healthStates"
        @onSelect="handleSelectDeviceType"
      />
    </c-dropdown>
    <view class="timeStyle">
      <FormItem title="检查时间" :required="false">
        <template #right>
          <view class="flex-inline" @click="handleShow">
            <text v-if="!single" class="color-placeholder">请选择</text>
            <text v-else class="color-secondary text-ellipse"> {{ finalSingleDate }} </text>
            <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
          </view>
          <c-calendar
            v-model:open="calendarShow"
            v-model="finalSingleDate"
            mode="date"
            z-index="10000000"
            :max-date="dayjs().add(0, 'day').format('YYYY-MM-DD')"
            @change="handleSwitchDate"
          />
        </template>
      </FormItem>
    </view>
    <c-refresh-scroll
      ref="refreshScrollRef"
      :show-success-tip="false"
      :fetch-data-func="fetchDataFunc"
    >
      <view class="mt-l mlr-l">
        <view
          v-for="item in records.array"
          :key="item.id"
          class="list"
          @click.stop="handleJump(item)"
        >
          <imp-space>
            <c-image
              :src="item.imageUrl ? item.imageUrl : defaultAvatar[item.gender]"
              :width="88"
              :height="88"
              mode="aspectFit"
              icon-loading=""
              class="mr-b"
              :has-border="item.imageUrl?.startsWith('http')"
            />
            <view>
              <view class="flexStyle">
                <text class="titleStyle">{{ item.studentName }}</text>
              </view>
              <view class="flex-inline mt-xs">
                <view class="flex-inline radius-default plr-xs bg-fill-default">
                  <text class="color-secondary font-desc">
                    {{ HealthDayCheckType[item.inspectionMode] }}
                  </text>
                </view>
                <view class="flex-inline ml-xs font-secondary color-placeholder lh-0">
                  {{ item.clazzName }}
                </view>
              </view>
            </view>
            <view class="rightStyle">
              <view v-if="item?.healthStatus == 1" class="normal">正常</view>
              <view v-else class="abnormal">异常</view>
            </view>
          </imp-space>
        </view>
        <c-empty v-if="records.array.length === 0" class-name="bg-fill-default" />
      </view>
    </c-refresh-scroll>
  </mt-page>
  <c-picker
    v-model:show="show3"
    v-model:value="classValue.array"
    type="multi-auto"
    title="年级/班级选择"
    title-type="text"
    :list="list3.array"
  />
</template>
<script lang="ts">
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import FormItem from '@/app-preprimary-education/everyday-task/components/form-item/index.vue';
import {
  getTree,
  IInspectionRecordsRtn,
  inspectionRecords,
} from '@/app-preprimary-education/services/health-day';
import { getPositionInfoByUserId } from '@/app-preprimary-education/services/home-school-communication';
import boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import {
  HealthDayCheckType,
  isHigherMastorOrTeacher,
} from '@/app-preprimary-education/utils/constant';
import { getCurDate } from '@/app-preprimary-education/utils/tools';
import { loginStore } from '@/store/modules/login';
import { isNil } from '@/utils/lodash-es';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, defineComponent, onBeforeMount, reactive, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  components: { FormItem, mtPage, ImpSpace },
  setup() {
    const userInfo = loginStore().userInfo;
    const refreshScrollRef = ref(null as any);
    const inspectionMode = ref('');
    const clazzId = ref('');
    const gradeId = ref('');
    const single = ref(getCurDate(new Date()));
    const healthStatus = ref('');
    const leaveStaTime = ref('');
    const deviceTypeId = ref('');
    const calendarShow = ref(false);
    const isHistoryTitle = ref(1);
    const clazzName = ref('全部');
    const showClazzAll = ref(false);
    let handleUpdateMenu: (...args: any) => void;
    const list3 = reactive({
      array: [] as any[],
    });
    const inspectionModes = [
      {
        label: '全部',
        value: '',
      },
      {
        label: '晨检',
        value: '1',
      },
      {
        label: '午检',
        value: '2',
      },
      {
        label: '晚检',
        value: '3',
      },
    ];

    const healthStates = [
      {
        label: '全部',
        value: '',
      },
      {
        label: '正常',
        value: '1',
      },
      {
        label: '异常',
        value: '2',
      },
    ];
    const finalSingleDate = computed(
      () => single.value && dayjs(single.value).format('YYYY-MM-DD'),
    );

    function handleShow() {
      calendarShow.value = true;
    }

    const madeData = (dataList: any[]) => {
      const data: { label: any; value: any; children: any[] }[] = [
        {
          label: '全部',
          value: '',
          children: [
            {
              label: '全部',
              value: '',
              children: [],
            },
          ],
        },
      ];
      for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].children.length === 0) {
          data.push({
            label: dataList[i].name,
            value: dataList[i].id,
            children: [
              {
                label: '全部',
                value: '',
                children: [],
              },
            ],
          });
        } else {
          let data2 = [
            {
              label: '全部',
              value: '',
              children: [],
            },
          ];
          for (var j = 0; j < dataList[i].children.length; j++) {
            data2.push({
              label: dataList[i].children[j].name,
              value: dataList[i].children[j].id,
              children: [],
            });
          }
          data.push({
            label: dataList[i].name,
            value: dataList[i].id,
            children: data2,
          });
        }
      }
      return data;
    };
    const getTreeEvent = async () => {
      const res = await getTree();
      const newdata = madeData(res);
      list3.array = newdata;
    };

    const defaultAvatar = {
      1: boy,
      2: girl,
    } as any;
    const activeTabIndex = ref(0);
    const show3 = ref(false);
    const classValue = reactive({
      array: [{ value: 'a' }] as any[],
    });

    const records = reactive({
      array: [] as IInspectionRecordsRtn[],
    });
    const pickEvent = ({ updateMenu }: { updateMenu: (...args: any) => void }) => {
      show3.value = true;
      if (!handleUpdateMenu) {
        handleUpdateMenu = updateMenu;
      }
    };
    const handleJump = (item: any) => {
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/inspection-record/detail?id=${item.id}`,
      });
    };
    const handleSelectDeviceType = (id: string) => {
      healthStatus.value = id;
    };

    watch(single, () => {
      refreshScrollRef.value.initPager();
      refreshScrollRef.value.fetchData('new');
    });

    watch(classValue, val => {
      const { array } = val;
      if (array[0].value) {
        gradeId.value = array[0].value;
        clazzId.value = array[1].value;
      } else {
        clazzId.value = '';
        gradeId.value = '';
      }
      fetchDataFunc({ pageSize: 10, pageNum: 1 }, 'new');
    });

    watch(
      () => inspectionMode.value,
      () => {
        refreshScrollRef.value.initPager();
        refreshScrollRef.value.fetchData('new');
      },
    );
    watch(
      () => deviceTypeId.value,
      () => {
        refreshScrollRef.value.initPager();
        refreshScrollRef.value.fetchData('new');
      },
    );

    // 修复取消图标不变的情况
    watchEffect(() => {
      if (!show3.value && handleUpdateMenu) {
        const arrValue = classValue.array;
        if (arrValue.length < 1) {
          handleUpdateMenu(
            0,
            {
              title: '全部',
              valueLabel: '全部',
              type: 0,
            },
            { repeatStatus: 2 },
          );
          return;
        }

        handleUpdateMenu(
          0,
          {
            title: arrValue[0]?.label || '',
            valueLabel:
              arrValue[1].value === ''
                ? arrValue[0].value === ''
                  ? classValue.array[0].label
                  : arrValue[0].label
                : arrValue[1].label,
            type: 0,
          },
          { repeatStatus: 2 },
        );
      }
    });

    const fetchDataFunc = async (pager: any, loadType: any) => {
      const { pageSize, pageNum } = pager;
      const datas = {
        healthStatus: healthStatus.value,
        inspectionMode: inspectionMode.value,
        clazzId: clazzId.value,
        gradeId: gradeId.value,
        inspectionDate: single.value,
      };
      const res = await inspectionRecords({
        pageSize,
        pageNum,
        ...datas,
      });
      if (loadType === 'new') records.array = [];
      records.array.push(...res.result);
      return res;
    };
    const handleSwitchDate = (date: { result: string }) => {
      single.value = date.result;
    };
    /** 获取用户职位信息 */
    const fetchPosition = async () => {
      const res = await getPositionInfoByUserId();
      const roles = res.map(t => t.code);
      showClazzAll.value = isHigherMastorOrTeacher(roles);
    };
    onBeforeMount(async () => {
      getTreeEvent();
      const { data, isHistory, clazzList } = getPageParams();
      single.value = data;
      isHistoryTitle.value = Number(isHistory);
      await fetchPosition();
      if (!isNil(clazzList)) {
        const list = JSON.parse(clazzList);
        if (!isNil(list) && list[1].value !== '') {
          classValue.array = [list[1], list[2]];
          if (list[2].value === '') {
            clazzName.value = classValue.array[0]?.label || '全部';
          } else {
            clazzName.value = `${classValue.array[1]?.label}`;
          }
        }
      } else if (userInfo?.clazzIds && userInfo.clazzIds.length && !showClazzAll.value) {
        let clazz = {};
        const grade = list3.array.find(t => {
          clazz = t.children.find((k: any) => {
            return k.value === userInfo.clazzIds[0];
          });
          return clazz;
        });
        if (!isNil(clazz) && !isNil(grade) && grade.value !== '') {
          classValue.array = [grade, clazz];
          clazzName.value = classValue.array[0]?.label || '全部';
        }
      }
    });
    return {
      fetchDataFunc,
      pickEvent,
      handleSelectDeviceType,
      handleJump,
      getTreeEvent,
      madeData,
      handleSwitchDate,
      dayjs,
      clazzId,
      gradeId,
      records,
      defaultAvatar,
      activeTabIndex,
      boy,
      girl,
      show3,
      classValue,
      list3,
      inspectionMode,
      deviceTypeId,
      inspectionModes,
      healthStates,
      leaveStaTime,
      healthStatus,
      refreshScrollRef,
      single,
      finalSingleDate,
      calendarShow,
      HealthDayCheckType,
      handleShow,
      isHistoryTitle,
      clazzName,
    };
  },
});
</script>
<style lang="scss" scoped>
.list {
  height: 120rpx;
  background: $ui-color-white;
  margin-bottom: $ui-gap-default;
  border-radius: $ui-radius-default;
  padding: $ui-gap-default $ui-gap-large 0 $ui-gap-large;
  .flexStyle {
    display: flex;
    .titleStyle {
      font-weight: bold;
      font-size: $ui-font-size-title;
    }
  }
  .rightStyle {
    position: absolute;
    right: 70rpx;
    .abnormal {
      background: $ui-color-error;
      border-radius: $ui-radius-default;
      color: $ui-color-white;
      padding: $ui-gap-xxs $ui-gap-default;
    }
    .normal {
      background: $ui-color-success;
      border-radius: $ui-radius-default;
      color: $ui-color-white;
      padding: $ui-gap-xxs $ui-gap-default;
    }
  }
  .avatar {
    display: inline-block;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
  }
}
.timeStyle {
  padding: $ui-gap-xs $ui-gap-large;
  margin: $ui-gap-default $ui-gap-large;
  margin-bottom: 0;

  background: $ui-color-white;
  border-radius: $ui-radius-default;
}
</style>
