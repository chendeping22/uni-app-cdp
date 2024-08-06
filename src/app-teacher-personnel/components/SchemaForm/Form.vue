<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, onMounted, reactive, ref, unref, watch } from 'vue';
import { convert, createTreeData, isTree } from './helper/utils';
import type { Field, FieldsGroup, InputTextField, SelectField } from './types/schema';
// import type { FormInstance } from 'ant-design-vue';
import { loginStore } from '@/store/modules/login';
import { castArray, debounce, filter, find, forEach, isFunction, map, merge } from 'lodash-es';
import DatePicker from '../DatePicker.vue';
import DictSelect from '../DictSelect.vue';
import DictSelectMulti from '../DictSelectMulti.vue';
import DictTree from '../DictTree.vue';
import UploadFile from '../UploadFile.vue';
import UploadImg from '../UploadImg.vue';
import ValuePreview from './ValuePreview.vue';

const props = defineProps({
  schema: {
    type: Object as PropType<FieldsGroup>,
    required: true,
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
  preview: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['submitHandlePure', 'mounted']);

const formData = reactive<any>({});
const formRef = ref();

const extData = computed(() => {
  // console.log('🚀ccc ~ extData ~ extData:', loginStore().userInfo.locationName);
  return {
    locationName: loginStore().userInfo?.locationName,
  };
});

const optionsMap = computed(() => {
  const result: Record<string, { list: any[]; isTree: boolean }> = {};
  forEach(props.schema?.fields, f => {
    if (f.type !== 'Select') {
      return;
    }
    const list = props.dictionaries[f.dictionary] || [];
    if (!isTree(list)) {
      result[f.name] = { list, isTree: false };
    } else {
      result[f.name] = {
        isTree: true,
        list: createTreeData(list, f.allowSelectParent),
      };
    }
  });
  return result;
});

// const formRef = ref<FormInstance>();
// 假定一个表单只有一个文件上传
const fileList = ref<any[]>([]);
const createFileList = () => {
  const field = find(
    props.schema?.fields,
    (f: Field) => f.type === 'ImageUpload' || f.type === 'Upload',
  );
  if (!field) {
    return;
  }
  if (field.type === 'ImageUpload') {
    const fieldIds: string[] = formData[field.name] || [];
    const fieldUrls: string[] = (formData[`${field.name}Url`] || '').split(',');
    const list = map(fieldIds, (id, i) => ({
      fieldId: id,
      url: fieldUrls[i] || '',
    }));

    fileList.value = list;
  } else {
    const list = map(formData[`${field.name}List`], f => ({
      fileId: f.fileId,
      name: f.fileName,
      url: f.fileUrl,
    }));
    fileList.value = list;
  }
};

// const onUploadChange = (field: Field, files: any[]) => {
//   console.log('🚀ccc ~ onUploadChange ~ field:', field);
//   console.log('ccc ...... > onUploadChange > files:', files);
//   formData[field.name] = map(files, f => f.fileId);
// };

// const afterUpload = (field: Field, file: any) => {
//   console.log('...... > afterUpload > files:', file);
// };

const defaultFormData = computed(() => {
  const result: any = {};
  forEach(
    props.schema?.fields,
    f => (result[f.name] = convert(f.default, formData, extData.value)),
  );
  forEach(props.initialData, (v, k) => (result[k] = v));
  return result;
});

const reset = () => {
  formRef.value?.resetFields();
  merge(formData, defaultFormData.value);
};

const exposeObj = {
  setValue: (data: any) => {
    formRef.value?.resetFields();
    setTimeout(() => {
      merge(formData, data);
      createFileList();
    }, 200);
  },
  submit: async (rejectIfInvalid = false) => {
    // const values = await formRef.value?.validate();
    // return values;
    return new Promise((resolve, reject) => {
      formRef.value.validate(valid => {
        console.log('🚀ccc ~  valid:', valid, formData);
        if (valid) {
          // uni.showToast({
          //   icon: 'none',
          //   title: '表单验证通过',
          // });
          resolve(formData);
        } else if (rejectIfInvalid) {
          reject(formData);
        }
      });
    });
  },
  goEditPage(_data) {
    // merge(formData, _data);
    uni.navigateTo({
      url: `/app-school-affairs/teacher-archive/edit/index`,
      events: {
        dataToParent: function (data) {
          console.log('🚀ccc ~ dataToParent :', data);
          emit('submitHandlePure', data);
        },
      },
      success: function (res) {
        // console.log('🚀ccc ~ dataToChild', props.modelValue);
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('dataToChild', {
          props: { ...props },
          formData: { ...defaultFormData.value, ..._data },
        });
      },
    });
  },
  getFormData() {
    return unref(formData);
  },
};

defineExpose(exposeObj);

// 上传后回调
const imgAfterUpload = imgs => {
  console.log('🚀ccc ~ imgAfterUpload ~ imgs:', imgs);
  // formData.value.imgList.value = imgs;
};

function setRules() {
  const _rulesObj = {};
  forEach(
    props.schema?.fields,
    // filter(props.schema?.fields, one => convert(one.required, formData)),
    // filter(props.schema?.fields, one => one.required === true),
    // filter(props.schema?.fields, one => !!one.required),
    t => {
      let m = ['DatePicker', 'Select'].includes(t?.type) ? '请选择' : '请输入';
      m += t.title;
      const _rules = !convert(t.required, formData)
        ? []
        : [
            {
              required: !!convert(t.required, formData),
              message: m,
              trigger: ['change', 'blur'],
              // 正则检验前先将值转为字符串
              transform(value) {
                if (t?.multiple && Array.isArray(value)) {
                  return value?.join(',');
                }
                // if (t?.type === 'DatePicker') {
                //   return String(value);
                // }
                return value;
              },
            },
          ];
      forEach(t.rules, r => {
        if (isFunction(r)) {
          _rules.push(
            r({
              formData,
              field: t,
              fields: props.schema?.fields,
              options: props.dictionaries[(t as SelectField).dictionary],
            }),
          );
        } else {
          _rules.push(r);
        }
      });
      _rulesObj[t.name] = _rules;
    },
  );
  // console.log('🚀ccc ~ setRules ~ _rulesObj:', _rulesObj);

  formRef.value?.setRules(_rulesObj);
  // formRef.value.setRules({
  //   name: [{ required: true, message: '请输入姓名', trigger: ['change', 'blur'] }],
  //   // birthday: [{ required: true, message: '请输入shengri ', trigger: ['change', 'blur'] }],
  //   birthday: [{ required: true, message: '请选择日历', trigger: ['change', 'blur'] }],
  //   checkbox: [{ type: 'array', required: true, message: '请选择水果', trigger: ['blur'] }],
  // });
}

function fileAfterUpload(field: Field, files: any[]) {
  console.log('🚀ccc ~ fileAfterUpload', field, files);
  formData[field.name] = map(files, f => f.fileId);
}

const getIsTree = (field: SelectField) => optionsMap.value[field.name]?.isTree;

const getSelectOptions = (field: SelectField) => {
  const list = optionsMap.value[field.name].list;
  if (field.dictionaryFilter) {
    return field.dictionaryFilter(list, formData);
  }
  return list;
};

const getSelectKey = (field: SelectField) => {
  const list = getSelectOptions(field);
  return map(list, i => i.value).join(',') || '';
};

const changeHandle = ({
  value,
  field,
  fields,
  formData,
}: {
  value: any;
  field: Field;
  fields: Field[];
  formData: any;
}) => {
  forEach(field.reactions, r => {
    console.log('ccc ...... > forEach > r:', r);
    const when = !r.when || r.when(value, formData);
    if (!when) {
      return;
    }
    switch (r.type) {
      case 'clear':
        forEach(castArray(r.target), t => {
          let targetValue: any = null;
          const targetField = find(fields, (f: Field) => f.name === t);
          switch (targetField?.type) {
            case 'Input':
              targetValue = '';
              break;
            case 'Select':
              targetValue = targetField.multiple ? [] : null;
              break;
          }
          formData[t] = targetValue;
        });
        break;
      case 'set':
        forEach(castArray(r.target), t => (formData[t] = r.targetValue));
        break;
      case 'callback':
        r.callback(value, formData);
        break;
      default:
        break;
    }
  });
};

const imageSchema = computed(() => {
  return find(props.schema?.fields, one => one.type === 'ImageUpload');
});
const fileSchema = computed(() => {
  return find(props.schema?.fields, one => one.type === 'Upload');
});

function refreshRule() {
  setRules();
  // !props.preview && formRef.value.validate();
}
const wrapRefreshRule = debounce(refreshRule, 500);

watch(formData, () => {
  wrapRefreshRule();
});

onMounted(() => {
  setRules();
  reset();
  emit('mounted', exposeObj);
});
</script>
<template>
  <view :class="['form-wrap', { preview }]">
    <view class="form-wrap-body">
      <view class="form-block form-block--common">
        <u-form ref="formRef" :model="formData" :error-type="['message']">
          <template
            v-for="field in filter(
              schema?.fields,
              one => one.type !== 'ImageUpload' && one.type !== 'Upload',
            )"
            :key="field.name"
          >
            <u-form-item
              v-show="!convert(field.hidden, formData)"
              :label="field.title"
              :prop="field.name"
              :required="!preview && !!convert(field.required, formData)"
              :class="{ 'textarea-form-item': field.type === 'Textarea' }"
            >
              <ValuePreview
                v-if="preview && field.type !== 'Upload' && field.type !== 'ImageUpload'"
                :value="formData[field.name]"
                :dictionaries="dictionaries"
                :field="field"
              ></ValuePreview>

              <template v-else-if="field.type === 'Select'">
                <template v-if="getIsTree(field)">
                  <DictTree
                    v-model="formData[field.name]"
                    :disabled="convert(field.disabled, formData)"
                    :tree-data="getSelectOptions(field)"
                    :field="field"
                    :multiple="field.multiple"
                    :clearable="!convert(field.disabled, formData)"
                    @change="
                      changeHandle({
                        value: $event,
                        field,
                        fields: schema?.fields,
                        formData,
                      })
                    "
                  ></DictTree>
                </template>

                <template v-else>
                  <DictSelect
                    v-if="!field.multiple"
                    v-model="formData[field.name]"
                    :disabled="convert(field.disabled, formData)"
                    :options="getSelectOptions(field)"
                    :field="field"
                    :clearable="!convert(field.disabled, formData)"
                    @change="
                      changeHandle({
                        value: $event,
                        field,
                        fields: schema?.fields,
                        formData,
                      })
                    "
                  ></DictSelect>
                  <DictSelectMulti
                    v-else
                    v-model="formData[field.name]"
                    :disabled="convert(field.disabled, formData)"
                    :options="getSelectOptions(field)"
                    :field="field"
                    :clearable="!convert(field.disabled, formData)"
                    :dictionaries="dictionaries"
                    @change="
                      changeHandle({
                        value: $event,
                        field,
                        fields: schema?.fields,
                        formData,
                      })
                    "
                  ></DictSelectMulti>
                </template>
              </template>

              <DatePicker
                v-else-if="field.type === 'DatePicker'"
                v-model="formData[field.name]"
                :format="field.format"
                :disabled="convert(field.disabled, formData)"
                :field="field"
                :clearable="!convert(field.disabled, formData)"
                @change="
                  changeHandle({
                    value: $event,
                    field,
                    fields: schema?.fields,
                    formData,
                  })
                "
              />

              <u-input
                v-else-if="field.type === 'InputNumber'"
                v-model="formData[field.name]"
                input-align="right"
                type="number"
                :clearable="!convert(field.disabled, formData)"
                :disabled="convert(field.disabled, formData)"
                :class="{ dictDisabled: convert(field.disabled, formData) }"
                :max="field.max"
                :min="field.min"
                :precision="field.precision"
                @input="
                  changeHandle({
                    value: $event,
                    field,
                    fields: schema?.fields,
                    formData,
                  })
                "
              />

              <textarea
                v-else-if="field.type === 'Textarea'"
                v-model="formData[field.name]"
                auto-height
                :disabled="convert(field.disabled, formData)"
                class="textarea-input"
                :class="{ dictDisabled: convert(field.disabled, formData) }"
                placeholder="请输入"
                :maxlength="(field as InputTextField).maxlength ?? 500"
                :placeholder-style="{
                  color: convert(field.disabled, formData)
                    ? 'rgba(0, 0, 0, 0.25)'
                    : 'rgba(0, 0, 0, 0.45)',
                }"
                @input="
                  changeHandle({
                    value: $event?.detail?.value,
                    field,
                    fields: schema?.fields,
                    formData,
                  })
                "
              ></textarea>

              <u-input
                v-else
                v-model="formData[field.name]"
                input-align="right"
                :clearable="!convert(field.disabled, formData)"
                :disabled="convert(field.disabled, formData)"
                :class="{ dictDisabled: convert(field.disabled, formData) }"
                :maxlength="(field as InputTextField).maxlength ?? 30"
                @input="
                  changeHandle({
                    value: $event,
                    field,
                    fields: schema?.fields,
                    formData,
                  })
                "
              />
            </u-form-item>
          </template>
        </u-form>
      </view>
      <UploadImg
        v-if="imageSchema"
        :max-count="1"
        :default-file-list="fileList"
        title="个人照片"
        :preview="preview"
        @afterUpload="fileAfterUpload(imageSchema, $event)"
      ></UploadImg>

      <UploadFile
        v-if="fileSchema"
        :max-count="100"
        :max-size="100"
        :default-file-list="fileList"
        :preview="preview"
        accept=".CSV,.CSS,.JAR,.7-ZIP,.TIF,.TIFF,.MPEG,.WAV,.WMA,.WEBP,.GIF,.JPEG,.JPGBMP,.PNG,.RAR,.SVG,.TXT,.ZIP,.MOV,.HEVF,.HEIF,.HEIC,.MP4,.MP3,.MPEG,.AVI,.WMV,.PDF,.DOC,.DOCX,.PPT,.PPTX,.XLS,.XLSX,.FLV,.WPS,.CVS,.XMIND"
        @afterUpload="fileAfterUpload(fileSchema, $event)"
      ></UploadFile>
    </view>
  </view>
</template>
<style scoped lang="scss">
.form-wrap {
  $bodyPaddingBottom: 24rpx;
  /* $bodyPaddingBottom: 80rpx + 48rpx + 24rpx; */
  .form-wrap-body {
    /* padding: 24rpx 32rpx; */
    overflow: hidden;
    padding-bottom: $bodyPaddingBottom;
    padding-bottom: calc(constant(safe-area-inset-bottom) + $bodyPaddingBottom);
    padding-bottom: calc(env(safe-area-inset-bottom) + $bodyPaddingBottom);
    .form-block {
      border-radius: 16rpx;
      background-color: #fff;
    }

    .form-block--common {
      :deep(.u-form) {
        .u-form-item {
          padding: 13rpx 0;
        }
        .u-form-item--left {
          flex: none !important;
          width: auto !important;
          max-width: 50%;
          padding-right: 32rpx;
          line-height: 44rpx;
        }
        .u-form-item__body {
          padding: 0 32rpx;
          min-height: 56rpx;
        }
        .u-form-item--right__content__slot {
          flex-direction: row-reverse;
        }
        .u-form-item__message {
          padding-right: 32rpx !important;
          text-align: right !important;
        }
        .pure-text {
          line-height: 44rpx;
          color: rgba(0, 0, 0, 0.25);
        }
        .u-input__textarea {
          /* min-height: 70rpx !important; */
          padding: 0;
        }
        .textarea-form-item {
          .u-form-item--left__content {
            align-self: flex-start;
          }
        }

        .dictDisabled {
          .uni-input-placeholder {
            color: rgba(0, 0, 0, 0.25) !important;
          }
        }

        .uni-input-placeholder {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        .textarea-input {
          width: 100%;
          text-align: right;
          font-size: 28rpx;
          color: #303133;
        }
      }
    }
  }
  .parse-bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    .button-area {
      padding: 24rpx 32rpx;
    }
  }
}
</style>
