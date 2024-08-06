/**
 * 根据布控库类型识别用户身份
 * if(libraryType === 0 || libraryType === 1) return  '布控人员';
 * else if(libraryType === 2) return '实名人员';
 * else if(libraryType === 3) return '陌生人';
 * else return '未建档人员';
 */
import icon_people_check from '../../static/image/icon_people_check.png';
import icon_people_control from '../../static/image/icon_people_control.png';
import icon_people_stranger from '../../static/image/icon_people_stranger.png';
import icon_people_uncheck from '../../static/image/icon_people_uncheck.png';
import PersonTypeEnum from '../constants/PersonTypeEnum';

export default (libraryType: number, personType?: number) => {
  if (libraryType === 0 || libraryType === 1)
    return {
      icon: icon_people_control,
      libraryTypeName: '布控人员',
      archiveTypeName: PersonTypeEnum.find(item => item.value === personType)?.label,
    };
  else if (libraryType === 2)
    return {
      icon: icon_people_check,
      libraryTypeName: '实名人员',
      archiveTypeName: PersonTypeEnum.find(item => item.value === personType)?.label,
    };
  else if (libraryType === 3)
    return {
      icon: icon_people_stranger,
      libraryTypeName: '陌生人',
    };
  else
    return {
      icon: icon_people_uncheck,
      libraryTypeName: '未建档人员',
    };
};
