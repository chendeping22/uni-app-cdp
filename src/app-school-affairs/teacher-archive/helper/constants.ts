import type { FilterInfo } from '../types';
import { YesOrNo } from '../types';

export const DEFAULT_FILTER: FilterInfo = {
  id: '-1',
  name: '默认筛选器',
  withSearchVal: YesOrNo.No,
  conditions: '',
  conditionsParsed: [
    {
      name: '基础信息',
      schema: 'base',
      conditions: [
        {
          code: 'name',
          name: '姓名',
          type: 'text',
          format: '',
          value: '',
        },
      ],
    },
  ],
};

export const TEACHER_LEARNING_EXP_ARCHIVEORG_TYPE = [
  {
    label: '全日制学校',
    code: '1',
    children: [
      {
        label: '全日制小学',
        code: '11',
      },
      {
        label: '全日制中学',
        code: '12',
      },
      {
        label: '全日制中专',
        code: '13',
      },
      {
        label: '全日制高等学校',
        code: '14',
      },
    ],
  },
  {
    label: '成人教育培训机构',
    code: '2',
    children: [
      {
        label: '职工大学',
        code: '21',
      },
      {
        label: '职工夜大学',
        code: '22',
      },
      {
        label: '业余大学',
        code: '24',
      },
      {
        label: '函授学校',
        code: '25',
      },
      {
        label: '刊授学校',
        code: '26',
      },
      {
        label: '广播电视教学',
        code: '27',
      },
      {
        label: '自学考试',
        code: '28',
      },
      {
        label: '管理干部学院',
        code: '2B',
      },
      {
        label: '干校',
        code: '2C',
      },
      {
        label: '干训班',
        code: '2D',
      },
      {
        label: '工训班',
        code: '2E',
      },
      {
        label: '培训中心',
        code: '2F',
      },
    ],
  },
  {
    label: '事业单位',
    code: '3',
    children: [
      {
        label: '研究所(院)',
        code: '31',
      },
      {
        label: '研究中心',
        code: '32',
      },
      {
        label: '医院',
        code: '34',
      },
      {
        label: '其他事业单位',
        code: '39',
      },
    ],
  },
  {
    label: '行政学院',
    code: '4',
    children: [
      {
        label: '国家行政学院',
        code: '41',
      },
      {
        label: '省行政学院',
        code: '42',
      },
      {
        label: '其他行政学院',
        code: '49',
      },
    ],
  },
  {
    label: '企业',
    code: '5',
  },
  {
    label: '机关',
    code: '6',
    children: [
      {
        label: '中央国家机关',
        code: '61',
      },
      {
        label: '省级机关',
        code: '62',
      },
      {
        label: '地、市级机关',
        code: '63',
      },
      {
        label: '县级机关',
        code: '64',
      },
      {
        label: '乡、镇机关',
        code: '65',
      },
    ],
  },
  {
    label: '党校',
    code: '7',
    children: [
      {
        label: '中央党校',
        code: '71',
      },
      {
        label: '省委党校',
        code: '72',
      },
      {
        label: '地、市委党校',
        code: '73',
      },
      {
        label: '县委党校',
        code: '74',
      },
      {
        label: '乡、镇党校',
        code: '75',
      },
      {
        label: '企业党校',
        code: '76',
      },
      {
        label: '高等院校党校',
        code: '77',
      },
      {
        label: '其他基层党校',
        code: '79',
      },
    ],
  },
  {
    label: '军队(武警)院校',
    code: '8',
    children: [
      {
        label: '军队(武警)高等学校',
        code: '81',
      },
      {
        label: '军队(武警)中等专科学校',
        code: '82',
      },
      {
        label: '军队(武警)党校',
        code: '83',
      },
      {
        label: '军队(武警)科研机构',
        code: '84',
      },
      {
        label: '军队(武警)医院',
        code: '85',
      },
    ],
  },
  {
    label: '其他',
    code: '9',
    children: [
      {
        label: '中央社会主义学院',
        code: '91',
      },
      {
        label: '省级社会主义学院',
        code: '92',
      },
      {
        label: '地、市级社会主义学院',
        code: '93',
      },
      {
        label: '学会(协会)',
        code: '95',
      },
    ],
  },
  {
    label: '其他',
    code: '99',
  },
];

export const ACADEMIC_AREA_TYPE = [
  {
    label: '哲学',
    code: '01',
    children: [
      {
        label: '哲学',
        code: '0101',
      },
    ],
  },
  {
    label: '经济学',
    code: '02',
    children: [
      {
        label: '理论经济学',
        code: '0201',
      },
      {
        label: '应用经济学',
        code: '0202',
      },
    ],
  },
  {
    label: '法学',
    code: '03',
    children: [
      {
        label: '法学',
        code: '0301',
      },
      {
        label: '政治学',
        code: '0302',
      },
      {
        label: '社会学',
        code: '0303',
      },
      {
        label: '民族学',
        code: '0304',
      },
      {
        label: '马克思主义理论',
        code: '0305',
      },
      {
        label: '公安学',
        code: '0306',
      },
    ],
  },
  {
    label: '教育学',
    code: '04',
    children: [
      {
        label: '教育学',
        code: '0401',
      },
      {
        label: '心理学',
        code: '0402',
      },
      {
        label: '体育学',
        code: '0403',
      },
    ],
  },
  {
    label: '文学',
    code: '05',
    children: [
      {
        label: '中国语言文学',
        code: '0501',
      },
      {
        label: '外国语言文学',
        code: '0502',
      },
      {
        label: '新闻传播学',
        code: '0503',
      },
    ],
  },
  {
    label: '历史学',
    code: '06',
    children: [
      {
        label: '考古学',
        code: '0601',
      },
      {
        label: '中国史',
        code: '0602',
      },
      {
        label: '世界史',
        code: '0603',
      },
    ],
  },
  {
    label: '理学',
    code: '07',
    children: [
      {
        label: '数学',
        code: '0701',
      },
      {
        label: '物理学',
        code: '0702',
      },
      {
        label: '化学',
        code: '0703',
      },
      {
        label: '天文学',
        code: '0704',
      },
      {
        label: '地理学',
        code: '0705',
      },
      {
        label: '大气科学',
        code: '0706',
      },
      {
        label: '海洋科学',
        code: '0707',
      },
      {
        label: '地球物理学',
        code: '0708',
      },
      {
        label: '地质学',
        code: '0709',
      },
      {
        label: '生物学',
        code: '0710',
      },
      {
        label: '系统科学',
        code: '0711',
      },
      {
        label: '科学技术史',
        code: '0712',
      },
      {
        label: '生态学',
        code: '0713',
      },
      {
        label: '统计学',
        code: '0714',
      },
    ],
  },
  {
    label: '工学',
    code: '08',
    children: [
      {
        label: '力学',
        code: '0801',
      },
      {
        label: '机械工程',
        code: '0802',
      },
      {
        label: '光学工程',
        code: '0803',
      },
      {
        label: '仪器科学与技术',
        code: '0804',
      },
      {
        label: '材料科学与工程',
        code: '0805',
      },
      {
        label: '冶金工程',
        code: '0806',
      },
      {
        label: '动力工程及工程热物理',
        code: '0807',
      },
      {
        label: '电气工程',
        code: '0808',
      },
      {
        label: '电子科学与技术',
        code: '0809',
      },
      {
        label: '信息与通信工程',
        code: '0810',
      },
      {
        label: '控制科学与工程',
        code: '0811',
      },
      {
        label: '计算机科学与技术',
        code: '0812',
      },
      {
        label: '建筑学',
        code: '0813',
      },
      {
        label: '土木工程',
        code: '0814',
      },
      {
        label: '水利工程',
        code: '0815',
      },
      {
        label: '测绘科学与技术',
        code: '0816',
      },
      {
        label: '化学工程与技术',
        code: '0817',
      },
      {
        label: '地质资源与地质工程',
        code: '0818',
      },
      {
        label: '矿业工程',
        code: '0819',
      },
      {
        label: '石油与天然气工程',
        code: '0820',
      },
      {
        label: '纺织科学与工程',
        code: '0821',
      },
      {
        label: '轻工技术与工程',
        code: '0822',
      },
      {
        label: '交通运输工程',
        code: '0823',
      },
      {
        label: '船舶与海洋工程',
        code: '0824',
      },
      {
        label: '航空宇航科学与技术',
        code: '0825',
      },
      {
        label: '兵器科学与技术',
        code: '0826',
      },
      {
        label: '核科学与技术',
        code: '0827',
      },
      {
        label: '农业工程',
        code: '0828',
      },
      {
        label: '林业工程',
        code: '0829',
      },
      {
        label: '环境科学与工程',
        code: '0830',
      },
      {
        label: '生物医学工程',
        code: '0831',
      },
      {
        label: '食品科学与工程',
        code: '0832',
      },
      {
        label: '城乡规划学',
        code: '0833',
      },
      {
        label: '风景园林学',
        code: '0834',
      },
      {
        label: '软件工程',
        code: '0835',
      },
      {
        label: '生物工程',
        code: '0836',
      },
      {
        label: '安全科学与工程',
        code: '0837',
      },
      {
        label: '公安技术',
        code: '0838',
      },
    ],
  },
  {
    label: '农学',
    code: '09',
    children: [
      {
        label: '作物学',
        code: '0901',
      },
      {
        label: '园艺学',
        code: '0902',
      },
      {
        label: '农业资源与环境',
        code: '0903',
      },
      {
        label: '植物保护',
        code: '0904',
      },
      {
        label: '畜牧学',
        code: '0905',
      },
      {
        label: '兽医学',
        code: '0906',
      },
      {
        label: '林学',
        code: '0907',
      },
      {
        label: '水产',
        code: '0908',
      },
      {
        label: '草学',
        code: '0909',
      },
    ],
  },
  {
    label: '医学',
    code: '10',
    children: [
      {
        label: '基础医学',
        code: '1001',
      },
      {
        label: '临床医学',
        code: '1002',
      },
      {
        label: '口腔医学',
        code: '1003',
      },
      {
        label: '公共卫生与预防医学',
        code: '1004',
      },
      {
        label: '中医学',
        code: '1005',
      },
      {
        label: '中西医结合',
        code: '1006',
      },
      {
        label: '药学',
        code: '1007',
      },
      {
        label: '中药学',
        code: '1008',
      },
      {
        label: '特种医学',
        code: '1009',
      },
      {
        label: '医学技术',
        code: '1010',
      },
      {
        label: '护理学',
        code: '1011',
      },
    ],
  },
  {
    label: '军事学',
    code: '11',
    children: [
      {
        label: '军事思想及军事历史',
        code: '1101',
      },
      {
        label: '战略学',
        code: '1102',
      },
      {
        label: '战役学',
        code: '1103',
      },
      {
        label: '战术学',
        code: '1104',
      },
      {
        label: '军队指挥学',
        code: '1105',
      },
      {
        label: '军制学',
        code: '1106',
      },
      {
        label: '军队政治工作学',
        code: '1107',
      },
      {
        label: '军事后勤学',
        code: '1108',
      },
      {
        label: '军事装备学',
        code: '1109',
      },
      {
        label: '军事训练学',
        code: '1110',
      },
    ],
  },
  {
    label: '管理学',
    code: '12',
    children: [
      {
        label: '管理科学与工程',
        code: '1201',
      },
      {
        label: '工商管理',
        code: '1202',
      },
      {
        label: '农林经济管理',
        code: '1203',
      },
      {
        label: '公共管理',
        code: '1204',
      },
      {
        label: '图书情报与档案管理',
        code: '1205',
      },
    ],
  },
  {
    label: '艺术学',
    code: '13',
    children: [
      {
        label: '艺术学理论',
        code: '1301',
      },
      {
        label: '音乐与舞蹈学',
        code: '1302',
      },
      {
        label: '戏剧与影视学',
        code: '1303',
      },
      {
        label: '美术学',
        code: '1304',
      },
      {
        label: '设计学',
        code: '1305',
      },
    ],
  },
  {
    label: '农林牧渔大类',
    code: '51',
    children: [
      {
        label: '农业技术类',
        code: '5101',
      },
      {
        label: '林业技术类',
        code: '5102',
      },
      {
        label: '畜牧兽医类',
        code: '5103',
      },
      {
        label: '水产养殖类',
        code: '5104',
      },
      {
        label: '农林管理类',
        code: '5105',
      },
    ],
  },
  {
    label: '交通运输大类',
    code: '52',
    children: [
      {
        label: '公路运输类',
        code: '5201',
      },
      {
        label: '铁道运输类',
        code: '5202',
      },
      {
        label: '城市轨道运输类',
        code: '5203',
      },
      {
        label: '水上运输类',
        code: '5204',
      },
      {
        label: '民航运输类',
        code: '5205',
      },
      {
        label: '港口运输类',
        code: '5206',
      },
      {
        label: '管道运输类',
        code: '5207',
      },
    ],
  },
  {
    label: '生化与药品大类',
    code: '53',
    children: [
      {
        label: '生物技术类',
        code: '5301',
      },
      {
        label: '化工技术类',
        code: '5302',
      },
      {
        label: '制药技术类',
        code: '5303',
      },
      {
        label: '食品药品管理类',
        code: '5304',
      },
    ],
  },
  {
    label: '资源开发与测绘大类',
    code: '54',
    children: [
      {
        label: '资源勘查类',
        code: '5401',
      },
      {
        label: '地质工程与技术类',
        code: '5402',
      },
      {
        label: '矿业工程类',
        code: '5403',
      },
      {
        label: '石油与天然气类',
        code: '5404',
      },
      {
        label: '矿物加工类',
        code: '5405',
      },
      {
        label: '测绘类',
        code: '5406',
      },
    ],
  },
  {
    label: '材料与能源大类',
    code: '55',
    children: [
      {
        label: '材料类',
        code: '5501',
      },
      {
        label: '能源类',
        code: '5502',
      },
      {
        label: '电力技术类',
        code: '5503',
      },
    ],
  },
  {
    label: '土建大类',
    code: '56',
    children: [
      {
        label: '建筑设计类',
        code: '5601',
      },
      {
        label: '城镇规划与管理类',
        code: '5602',
      },
      {
        label: '土建施工类',
        code: '5603',
      },
      {
        label: '建筑设备类',
        code: '5604',
      },
      {
        label: '工程管理类',
        code: '5605',
      },
      {
        label: '市政工程类',
        code: '5606',
      },
      {
        label: '房地产类',
        code: '5607',
      },
    ],
  },
  {
    label: '水利大类',
    code: '57',
    children: [
      {
        label: '水文与水资源类',
        code: '5701',
      },
      {
        label: '水利工程与管理类',
        code: '5702',
      },
      {
        label: '水利水电设备类',
        code: '5703',
      },
      {
        label: '水土保持与水环境类',
        code: '5704',
      },
    ],
  },
  {
    label: '制造大类',
    code: '58',
    children: [
      {
        label: '机械设计制造类',
        code: '5801',
      },
      {
        label: '自动化类',
        code: '5802',
      },
      {
        label: '机电设备类',
        code: '5803',
      },
      {
        label: '汽车类',
        code: '5804',
      },
    ],
  },
  {
    label: '电子信息大类',
    code: '59',
    children: [
      {
        label: '计算机类',
        code: '5901',
      },
      {
        label: '电子信息类',
        code: '5902',
      },
      {
        label: '通信类',
        code: '5903',
      },
    ],
  },
  {
    label: '环保、气象与安全大类',
    code: '60',
    children: [
      {
        label: '环保类',
        code: '6001',
      },
      {
        label: '气象类',
        code: '6002',
      },
      {
        label: '安全类',
        code: '6003',
      },
    ],
  },
  {
    label: '轻纺食品大类',
    code: '61',
    children: [
      {
        label: '轻化工类',
        code: '6101',
      },
      {
        label: '纺织服装类',
        code: '6102',
      },
      {
        label: '食品类',
        code: '6103',
      },
      {
        label: '包装印刷类',
        code: '6104',
      },
    ],
  },
  {
    label: '财经大类',
    code: '62',
    children: [
      {
        label: '财政金融类',
        code: '6201',
      },
      {
        label: '财务会计类',
        code: '6202',
      },
      {
        label: '经济贸易类',
        code: '6203',
      },
      {
        label: '市场营销类',
        code: '6204',
      },
      {
        label: '工商管理类',
        code: '6205',
      },
    ],
  },
  {
    label: '医药卫生大类',
    code: '63',
    children: [
      {
        label: '临床医学类',
        code: '6301',
      },
      {
        label: '护理类',
        code: '6302',
      },
      {
        label: '药学类',
        code: '6303',
      },
      {
        label: '医学技术类',
        code: '6304',
      },
      {
        label: '卫生管理类',
        code: '6305',
      },
    ],
  },
  {
    label: '旅游大类',
    code: '64',
    children: [
      {
        label: '旅游管理类',
        code: '6401',
      },
      {
        label: '餐饮管理与服务类',
        code: '6402',
      },
    ],
  },
  {
    label: '公共事业大类',
    code: '65',
    children: [
      {
        label: '公共事业类',
        code: '6501',
      },
      {
        label: '公共管理类',
        code: '6502',
      },
      {
        label: '公共服务类',
        code: '6503',
      },
    ],
  },
  {
    label: '文化教育大类',
    code: '66',
    children: [
      {
        label: '语言文化类',
        code: '6601',
      },
      {
        label: '教育类',
        code: '6602',
      },
      {
        label: '体育类',
        code: '6603',
      },
    ],
  },
  {
    label: '艺术设计传媒大类',
    code: '67',
    children: [
      {
        label: '艺术设计类',
        code: '6701',
      },
      {
        label: '表演艺术类',
        code: '6702',
      },
      {
        label: '广播影视类',
        code: '6703',
      },
    ],
  },
  {
    label: '公安大类',
    code: '68',
    children: [
      {
        label: '公安管理类',
        code: '6801',
      },
      {
        label: '公安指挥类',
        code: '6802',
      },
      {
        label: '公安技术类',
        code: '6803',
      },
      {
        label: '部队基础工作类',
        code: '6804',
      },
    ],
  },
  {
    label: '法律大类',
    code: '69',
    children: [
      {
        label: '法律实务类',
        code: '6901',
      },
      {
        label: '法律执行类',
        code: '6902',
      },
      {
        label: '司法技术类',
        code: '6903',
      },
    ],
  },
];

export const SUBJECT_ID_TYPE = [
  {
    label: '小学课程',
    code: '1',
    children: [
      {
        label: '品德与生活',
        code: '101',
      },
      {
        label: '品德与社会',
        code: '102',
      },
      {
        label: '科学',
        code: '103',
      },
      {
        label: '语文',
        code: '104',
      },
      {
        label: '数学',
        code: '105',
      },
      {
        label: '英语',
        code: '106',
      },
      {
        label: '日语',
        code: '107',
      },
      {
        label: '俄语',
        code: '108',
      },
      {
        label: '德语',
        code: '109',
      },
      {
        label: '法语',
        code: '110',
      },
      {
        label: '西班牙语',
        code: '111',
      },
      {
        label: '其他语种',
        code: '112',
      },
      {
        label: '体育',
        code: '113',
      },
      {
        label: '艺术',
        code: '114',
      },
      {
        label: '音乐',
        code: '115',
      },
      {
        label: '美术',
        code: '116',
      },
      {
        label: '信息技术(综合实践活动)',
        code: '117',
      },
      {
        label: '研究性学习(综合实践活动)',
        code: '118',
      },
      {
        label: '劳动与技术(综合实践活动)',
        code: '119',
      },
      {
        label: '社区服务与社会实践(综合实践活动)',
        code: '120',
      },
      {
        label: '地方课程',
        code: '121',
      },
      {
        label: '学校课程',
        code: '122',
      },
    ],
  },
  {
    label: '初中课程',
    code: '2',
    children: [
      {
        label: '思想品德',
        code: '201',
      },
      {
        label: '历史与社会',
        code: '202',
      },
      {
        label: '历史',
        code: '203',
      },
      {
        label: '地理',
        code: '204',
      },
      {
        label: '科学',
        code: '205',
      },
      {
        label: '生物',
        code: '206',
      },
      {
        label: '物理',
        code: '207',
      },
      {
        label: '化学',
        code: '208',
      },
      {
        label: '语文',
        code: '209',
      },
      {
        label: '数学',
        code: '210',
      },
      {
        label: '英语',
        code: '211',
      },
      {
        label: '日语',
        code: '212',
      },
      {
        label: '俄语',
        code: '213',
      },
      {
        label: '德语',
        code: '214',
      },
      {
        label: '法语',
        code: '215',
      },
      {
        label: '西班牙语',
        code: '216',
      },
      {
        label: '其他语种',
        code: '217',
      },

      {
        label: '体育与健康',
        code: '218',
      },
      {
        label: '艺术',
        code: '219',
      },
      {
        label: '音乐',
        code: '220',
      },
      {
        label: '美术',
        code: '221',
      },
      {
        label: '信息技术(综合实践活动)',
        code: '222',
      },
      {
        label: '研究性学习(综合实践活动)',
        code: '223',
      },
      {
        label: '社区服务与社会实践(综合实践活动)',
        code: '224',
      },
      {
        label: '劳动与技术(综合实践活动)',
        code: '225',
      },
      {
        label: '地方课程',
        code: '226',
      },
      {
        label: '学校课程',
        code: '227',
      },
    ],
  },
  {
    label: '高中课程',
    code: '3',
    children: [
      {
        label: '语文',
        code: '301',
      },
      {
        label: '英语',
        code: '302',
      },
      {
        label: '日语',
        code: '303',
      },
      {
        label: '俄语',
        code: '304',
      },
      {
        label: '德语',
        code: '305',
      },
      {
        label: '法语',
        code: '306',
      },
      {
        label: '西班牙语',
        code: '307',
      },
      {
        label: '其他语种',
        code: '308',
      },
      {
        label: '数学',
        code: '309',
      },
      {
        label: '思想政治',
        code: '310',
      },

      {
        label: '历史',
        code: '311',
      },
      {
        label: '地理',
        code: '312',
      },
      {
        label: '物理',
        code: '313',
      },
      {
        label: '化学',
        code: '314',
      },
      {
        label: '生物',
        code: '315',
      },
      {
        label: '信息技术',
        code: '316',
      },
      {
        label: '通用技术',
        code: '317',
      },
      {
        label: '艺术',
        code: '318',
      },
      {
        label: '音乐',
        code: '319',
      },
      {
        label: '美术',
        code: '320',
      },
      {
        label: '体育与健康',
        code: '321',
      },
      {
        label: '研究性学习活动(综合实践活动)',
        code: '322',
      },
      {
        label: '社区服务(综合实践活动)',
        code: '323',
      },
      {
        label: '社会实践(综合实践活动)',
        code: '324',
      },
      {
        label: '地方课程',
        code: '325',
      },
      {
        label: '学校课程',
        code: '326',
      },
    ],
  },
];

export const NEW_ID = '-1';
