<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <mt-page title="服药登记" :show-top-gap="false" :show-notice-bar="false">
    <view class="apply-setting-container">
      <uni-list>
        <uni-list-item
          :show-arrow="childrens.length > 1"
          :clickable="childrens.length > 1"
          @click="selectStudent"
        >
          <template #header>
            <view class="label-require">学生姓名</view>
          </template>
          <template #footer>
            <view v-if="!itemInfo.studentName?.length" class="item-value-placeholder item-require"
              >请选择</view
            >
            <view v-else class="item-value">{{ itemInfo.studentName }}</view>
          </template>
        </uni-list-item>
      </uni-list>
      <view class="sub-title-wrap">
        <text class="f-placeholder">服药详情 </text>
        <view v-if="showImport" class="right" @click="importLast">导入上次</view>
      </view>
      <uni-list>
        <uni-list-item :border="false" show-arrow clickable @click="showTimePicker = true">
          <template #header>
            <view class="label-require">服药日期</view>
          </template>
          <template #footer>
            <view v-if="!selectDate" class="item-value-placeholder item-require">请选择</view>
            <view v-else class="item-value">{{ selectDate }}</view>
          </template>
        </uni-list-item>
      </uni-list>
      <c-empty-line :height="32" />
      <uni-list>
        <template v-for="(item, i) in itemInfo.medicationItemList" :key="item.id">
          <uni-list-item :border="false">
            <template #header>
              <view class="label-require big-wrap">
                <view
                  v-if="itemInfo.medicationItemList && itemInfo.medicationItemList?.length > 1"
                  @click="removeMedicineRecord(i)"
                >
                  <c-icon
                    name="icon_forbid"
                    size="48"
                    color-type="error"
                    :style-obj="{
                      paddingRight: '20rpx',
                    }"
                  />
                </view>
                <view>药品名称</view>
              </view>
            </template>
            <template #footer>
              <view class="input-wrap">
                <c-input
                  v-model:value="item.name"
                  :padding-clz="'plr-none'"
                  height="64rpx"
                  :show-clear="false"
                  placeholder="请输入"
                  align="right"
                  :maxlength="20"
                  @blur="e => (item.name = item.name?.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ''))"
                ></c-input>
              </view>
            </template>
          </uni-list-item>

          <uni-list-item
            :border="false"
            direction="column"
            class="reason-textarea-warp"
            :class="{ pl: itemInfo.medicationItemList && itemInfo.medicationItemList?.length > 1 }"
          >
            <template #header>
              <view class="label-require">服药说明</view>
            </template>
            <template #footer>
              <view class="reason-textarea-small">
                <c-input
                  v-model:value="item.introductions"
                  type="textarea"
                  :show-clear="false"
                  :disable-default-padding="true"
                  placeholder="请输入药品的用法用量，如：饭后，服用2粒"
                  :placeholder-style="item.introductions ? 'color: #f53f3f;' : ''"
                  :maxlength="100"
                />
              </view>
            </template>
          </uni-list-item>
        </template>
        <uni-list-item
          v-if="itemInfo.medicationItemList && itemInfo.medicationItemList?.length < 3"
          :border="false"
        >
          <template #header>
            <view class="flex font-xt color-primary" @click="addMedicineRecord">
              <c-icon name="icon_add" size="48" />
              <view class="ml-s">添加药品</view>
            </view>
          </template>
        </uni-list-item>
      </uni-list>
      <c-empty-line :height="32" />
      <uni-list>
        <uni-list-item direction="column">
          <template #header>
            <view class="select-imgs-wrap"
              ><select-attachment
                ref="selectAttachment"
                :data-list="initArray"
                :required="true"
                :sub-title="'(药品图片、服药说明等)'"
                @changeData="data => updateAttachments(data)"
            /></view>
          </template>
        </uni-list-item>
      </uni-list>
      <c-empty-line :height="32" />
      <uni-list>
        <uni-list-item direction="column">
          <template #header>
            <view>备注</view>
          </template>
          <template #footer>
            <view class="reason-textarea">
              <c-input
                v-model:value="itemInfo.comment"
                :trim="false"
                type="textarea"
                :show-clear="false"
                :disable-default-padding="true"
                placeholder="请输入给老师的留言"
                :maxlength="100"
              />
            </view>

            <view class="reason-length-placeholder">{{ itemInfo.comment?.length || 0 }}/100</view>
          </template>
        </uni-list-item>
      </uni-list>
      <view class="tip-wrap">
        <c-icon
          name="icon_state_info"
          size="40"
          style="display: flex; align-items: start; padding-top: 4rpx; padding-right: 20rpx"
        />
        <view> 请只带当天的药量，预防或保健类药品请尽量在家服用。 </view>
      </view>
      <c-empty-line need-safe-bottom class-name="mtb-b" />
      <c-bottom v-show="!showChildrenPopup">
        <u-button type="primary" @click="submit">提交</u-button>
      </c-bottom>
    </view>
    <popup-list
      :show-popup="showChildrenPopup"
      title="学生"
      :list-data="
        childrens.map(item => {
          return {
            label: item.name,
            value: item.id,
          };
        })
      "
      :default-value="itemInfo?.studentId"
      @onClose="showChildrenPopup = false"
      @onSelect="changeChild"
    />
    <c-calendar
      v-model:open="showTimePicker"
      v-model="selectDate"
      mode="date"
      z-index="10000000"
      :min-date="dayjs().format('YYYY-MM-DD')"
      :max-date="dayjs().add(6, 'day').format('YYYY-MM-DD')"
      @change="handleSwitchDate"
    />
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import popupList from '@/app-preprimary-education/components/popup-list/popup-list.vue';
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import {
  AddMedicineRecordsType,
  fetchChildren,
  getLastPageDetailApi,
  getPageDetailApi,
  responsePageDetailType,
  TStudentInfo,
} from '@/app-preprimary-education/services/feedMedicine';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  Ref,
  ref,
  watch,
} from 'vue';
import SelectAttachment from '../../components/select-attachment/index.vue';
import usePageEvent from '../../hooks/usePageEvent';
type attachmentType = { fileId: string; url: string };
export default defineComponent({
  components: { SelectAttachment, mtPage, popupList, uniListItem, uniList },
  props: {
    title: { type: String, default: '' },
  },
  onLoad(option: { infoId: string; from: string; backfrom: string }) {
    const { proxy } = getCurrentInstance();
    proxy.PageId = option.infoId || '';
    proxy.PageFrom = option.from || '';
    proxy.BackFrom = option.backfrom || '';
  },
  emits: [],

  setup() {
    const selectAttachment = ref();
    const showImport = ref<boolean>(false);
    showImport.value = uni.getStorageSync('hasMedicineRecord');
    const PageId = ref<string>();
    const PageFrom = ref<string>();
    const BackFrom = ref<string>();
    const itemInfo = ref<AddMedicineRecordsType>({
      medicationDate: null,
      medicationItemList: [
        {
          name: '',
          introductions: '',
        },
      ],
      medicationFileList: [],
    } as AddMedicineRecordsType);
    const showChildrenPopup = ref<boolean>(false);
    const childrens = ref<TStudentInfo[]>([]);
    const showTimePicker = ref<boolean>(false);
    const selectDate = ref<string>();
    const initArray = ref<attachmentType[]>([]);
    const clearStorageFlag = ref<boolean>(true); //是否清理缓存

    onBeforeUnmount(() => {
      if (clearStorageFlag.value) {
        uni.removeStorageSync('editPageInfo');
      }
    });

    const resetPageInfo = (res: responsePageDetailType, type = 1) => {
      let initData: any = Object.assign(
        {},
        {
          id: res.id,
          studentId: res.studentId,
          studentName: res.studentName,
          medicationDate: type === 2 ? '' : res.medicationDate,
          medicationItemList: res.medicationItems || [],
          medicationFileList: res.medicationFiles
            ? res.medicationFiles.filter(item => item.uploadType !== 2)
            : [],
          comment: res.comment,
        },
      );
      Object.assign(itemInfo.value, initData);
      selectDate.value = type === 2 ? '' : dayjs(res.medicationDate).format('YYYY-MM-DD');
      initArray.value = [];
      initArray.value = res.medicationFiles
        ? res.medicationFiles
            .filter(item => item.uploadType === 1)
            .map(item => {
              return {
                fileId: item.fileId || '',
                url: item.fileURL || '',
              };
            })
        : [];
      selectAttachment.value?.resetDatas(initArray.value);
    };
    const getPageDetail = async (id: string) => {
      if (!id) return;
      const res = await getPageDetailApi(id);
      resetPageInfo(res);
    };

    //编辑状态请求数据
    watch(PageId, async () => {
      if (PageId.value && PageId.value.length && !BackFrom.value) {
        getPageDetail(PageId.value);
      }
    });
    //从签名页返回
    watch(BackFrom, async () => {
      if (BackFrom.value && BackFrom.value.length) {
        uni.getStorage({
          key: 'editPageInfo',
          success: function (res) {
            itemInfo.value = Object.assign({}, JSON.parse(res.data.pageData));
            selectDate.value = dayjs(itemInfo.value.medicationDate).format('YYYY-MM-DD');
            initArray.value = [];
            initArray.value = itemInfo.value.medicationFileList
              ? itemInfo.value.medicationFileList
                  .filter(item => item.uploadType === 1)
                  .map(item => {
                    return {
                      fileId: item.fileId || '',
                      url: item.fileURL || '',
                    };
                  })
              : [];
            nextTick(() => {
              selectAttachment.value?.resetDatas(initArray.value);
            });
          },
        });
      }
    });
    const changeChild = function (e: { value: any; label: any }) {
      Object.assign(itemInfo.value, {
        studentId: e.value,
        studentName: e.label,
      });
      showChildrenPopup.value = false;
    };
    const getChildrens = async function (childrens: Ref<TStudentInfo[]>) {
      try {
        const res = await fetchChildren();
        if (Array.isArray(res) && res.length > 0) {
          childrens.value = res;
          if (childrens.value.length === 1 && !PageId.value) {
            const { id, name } = childrens.value[0];
            changeChild({
              value: id,
              label: name,
            });
          }
        } else {
          childrens.value = [];
        }
      } catch (error) {
        childrens.value = [];
      }
    };
    getChildrens(childrens);
    const handleSwitchDate = (date: { result: string }) => {
      itemInfo.value.medicationDate = +new Date(date.result);
    };
    const importLast = async () => {
      if (!itemInfo.value.studentId) {
        showInfo('请先选择学生');
        return;
      }
      const res = await getLastPageDetailApi(itemInfo.value.studentId);
      if (!res) {
        showInfo('暂无数据');
        return;
      }
      delete res.id;
      resetPageInfo(res, 2);
    };
    const addMedicineRecord = () => {
      itemInfo.value.medicationItemList &&
        itemInfo.value.medicationItemList.push({
          name: '',
          introductions: '',
        });
    };
    const removeMedicineRecord = (index: number) => {
      itemInfo.value.medicationItemList && itemInfo.value.medicationItemList.splice(index, 1);
    };
    const updateAttachments = (data: { fileId: string; url: string }[]) => {
      //用filter 而不是直接删除是因为这个数组还包含其他图片类型
      itemInfo.value.medicationFileList =
        itemInfo.value.medicationFileList.filter(item => item.uploadType !== 1) || [];
      itemInfo.value.medicationFileList = itemInfo.value.medicationFileList.concat(
        data.map(item => ({
          fileId: item.fileId,
          fileURL: item.url,
          uploadType: 1,
        })),
      );
    };
    const submit = () => {
      const { studentId, medicationDate, medicationItemList, medicationFileList, comment } =
        itemInfo.value;
      if (
        !studentId ||
        !medicationDate ||
        !medicationItemList ||
        medicationItemList.some(item => !item.name || !item.introductions) ||
        !medicationFileList.length ||
        medicationFileList.some(item => !item.fileId)
      ) {
        showInfo('请填写必填项');
        return;
      }
      if (comment && comment.length && !comment.trim()) {
        showInfo('备注不能全空格');
        itemInfo.value.comment = '';
        return false;
      }
      clearStorageFlag.value = false;
      let url =
        PageFrom.value === 'edit'
          ? `/app-preprimary-education/feed-medicine/guardian/sin-signature/index?from=edit`
          : `/app-preprimary-education/feed-medicine/guardian/sin-signature/index`;
      itemInfo.value.id = PageId.value ? PageId.value : '';
      itemInfo.value.comment = itemInfo.value.comment ? itemInfo.value.comment.trim() : '';
      let pageUrl = getCurrentPages().pop()?.$page?.fullPath;
      uni.setStorage({
        key: 'editPageInfo',
        data: {
          pageUrl,
          pageData: JSON.stringify(itemInfo.value),
        },
        success: function () {
          uni.redirectTo({
            url,
          });
        },
      });
    };

    return {
      childrens,
      itemInfo,
      showChildrenPopup,
      changeChild,
      dayjs,
      showTimePicker,
      selectDate,
      handleSwitchDate,
      importLast,
      addMedicineRecord,
      removeMedicineRecord,
      updateAttachments,
      initArray,
      submit,
      usePageEvent,
      PageId,
      PageFrom,
      BackFrom,
      showImport,
      selectAttachment,
    };
  },
  methods: {
    selectStudent: function () {
      if (this.childrens?.length === 0) {
        showInfo('暂无关联的学生');
      } else if (this.childrens.length === 1) {
        return;
      } else {
        this.showChildrenPopup = true;
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.plr-none {
  padding-left: 0;
  padding-right: 0;
}
.apply-setting-container {
  padding: $ui-gap-large;
  ::v-deep {
    .uni-list {
      border-radius: $ui-radius-default;
    }
    .uni-list-item .uni-list-item__container {
      font-size: $ui-font-size-title;
    }
  }
  .label-require.big-wrap {
    display: flex;
    min-width: 220rpx;
    align-items: center;
  }
  .label-require.pl {
    padding-left: 68rpx;
  }
  .label-require::after {
    content: '*';
    display: inline;
    color: red;
    margin-left: $ui-gap-xxs;
    font-size: $ui-font-size-title;
  }

  .input-wrap {
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    ::v-deep {
      .input {
        position: relative;
        top: -8rpx;
      }
    }
  }
  .reason-textarea-warp {
    ::v-deep {
      .uni-list-item__container {
        padding-top: 0 !important;
      }
    }
  }
  .reason-textarea {
    margin: $ui-gap-default $ui-gap-default $ui-gap-default 0;
    ::v-deep {
      .c-input,
      .c-input-wrap {
        padding: 0rpx;
      }
    }
  }
  .reason-length-placeholder {
    text-align: right;
    width: 100%;
    font-size: $ui-font-size-title;
    color: $ui-color-placeholder;
    margin-right: $ui-gap-large;
  }
  .reason-textarea-small {
    margin: $ui-gap-default $ui-gap-default $ui-gap-default 0;
    height: 280rpx;
    ::v-deep {
      .c-input,
      .c-input-wrap {
        padding: 0rpx;
      }
      .uni-textarea-textarea {
        min-height: 84rpx;
        overflow: visible !important;
        max-height: 250rpx;
        // border: 1px solid #e5e5e5;
      }
    }
  }
  .reason-textarea-warp.pl {
    ::v-deep {
      .uni-list-item__container {
        padding-left: 68rpx;
      }
    }
  }
  .select-imgs-wrap {
    ::v-deep {
      .u-cell {
        padding: 0 !important;
      }
      .u-border-bottom {
        position: static !important;
      }
      .c-space-item {
        padding-right: 30rpx !important;
        padding-bottom: 20rpx !important;
      }
    }
  }
  .tip-wrap {
    padding: $ui-gap-xs $ui-gap-large $ui-gap-xs 0;
    display: flex;
    .tip {
      font-size: $ui-font-size-content;
      color: #4e5969;
    }
  }
  .sub-title-wrap {
    display: flex;
    justify-content: space-between;
    padding: $ui-gap-small 0 $ui-gap-small 0;
    .right {
      color: $ui-color-primary;
      cursor: pointer;
    }
  }
  .f-placeholder {
    color: $ui-color-placeholder;
  }
}
</style>
