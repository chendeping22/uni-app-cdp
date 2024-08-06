import iconZip from '@/static/fileTypes/Icon-zip.svg';
import iconExcel from '@/static/fileTypes/icon-excel.svg';
import iconFile from '@/static/fileTypes/icon-file.svg';
import iconImage from '@/static/fileTypes/icon-image.svg';
import iconPdf from '@/static/fileTypes/icon-pdf.svg';
import iconPpt from '@/static/fileTypes/icon-ppt.svg';
import iconWord from '@/static/fileTypes/icon-word.svg';

/** 附件图表处理 */
export function getFileIcon(file: any, name?: string) {
  const fileName = name || 'fileName';
  const extName = file[fileName] ? file[fileName].split('.').pop() : '';
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
