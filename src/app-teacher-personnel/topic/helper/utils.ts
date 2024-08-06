import dayjs from 'dayjs';
import {
  authenticateStatusEnum,
  declareStatusEnum,
  levelEnum,
  stageEnum,
  termCheckStatusEnum,
} from './enum';

export const getStageName = (stage: number) => stageEnum.find(s => s.value === stage)?.label;

export const getStatusItem = (status: number, stage: number) => {
  const enums = {
    1: declareStatusEnum,
    3: termCheckStatusEnum,
    4: authenticateStatusEnum,
  }[stage];
  return enums?.find(e => e.value === status);
};

export const getLevelName = (level: number) => levelEnum.find(l => l.value === level)?.label;

export const formatDate = (date: number, format: string) =>
  date ? dayjs(date).format(format) : date;

export const getFileNameWithoutExt = (fileName: string) => fileName.split('.')[0];

export const defaultFileTypes =
  '.csv,.css,.jar,.7-zip,.tif,.tiff,.mpeg,.wav,.wma,.webp,.gif,.jpeg,.jpg,.bmp,.png,.rar,.svg,.txt,.zip,.mov,.hevf,.heif,.heic,.mp4,.mp3,.mpeg,.avi,.wmv,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.flv,.wps,.cvs,.xmind';

export const getDropdownTitle = (list: any[], value: any, placeholder: string) => {
  return list.find(item => item.value === value)?.label || placeholder;
};
