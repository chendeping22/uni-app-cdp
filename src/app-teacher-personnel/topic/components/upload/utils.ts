import iconZip from '@/static/fileTypes/Icon-zip.svg';
import iconExcel from '@/static/fileTypes/icon-excel.svg';
import iconFile from '@/static/fileTypes/icon-file.svg';
import iconImage from '@/static/fileTypes/icon-image.svg';
import iconPdf from '@/static/fileTypes/icon-pdf.svg';
import iconPpt from '@/static/fileTypes/icon-ppt.svg';
import iconWord from '@/static/fileTypes/icon-word.svg';
import { lowerCase } from 'lodash-es';

/** 附件图表处理 */
export function getFileIcon(file: any, name?: string) {
  console.log('...... > getFileIcon > iconPpt:', iconPpt);
  const fileName = name || 'fileName';
  const extName = lowerCase(file[fileName] ? file[fileName].split('.').pop() : '');
  if (['pdf'].includes(extName)) {
    return iconPdf;
  } else if (['png', 'jpg', 'jpeg'].includes(extName)) {
    return iconImage;
  } else if (['xls', 'xlt', 'xlsx', 'xlsb', 'xltx'].includes(extName)) {
    return iconExcel;
  } else if (['ppt', 'pot', 'potx', 'pptx', 'ppsx', 'xml'].includes(extName)) {
    return iconPpt;
  } else if (['doc', 'docx'].includes(extName)) {
    return iconWord;
  } else if (['zip', 'rar', '7z'].includes(extName)) {
    return iconZip;
  }
  return iconFile;
}

export const defaultFileTypes =
  '.csv,.css,.jar,.7-zip,.tif,.tiff,.mpeg,.wav,.wma,.webp,.gif,.jpeg,.jpg,.bmp,.png,.rar,.svg,.txt,.zip,.mov,.hevf,.heif,.heic,.mp4,.mp3,.mpeg,.avi,.wmv,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.flv,.wps,.cvs,.xmind';
