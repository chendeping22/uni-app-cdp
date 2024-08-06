import { ConfigType } from '@/utils/global-config';

interface EnvConfigType {
  [key: string]: ConfigType;
}

export const envConfig: EnvConfigType = {
  dev: {
    server_host: 'https://devimp.lexikos.com',
    imp2_h5_host: 'https://devimp.lexikos.com/imp2/h5',
    imp2_edu_h5_host: 'https://devimpedu.lexikos.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://devmetastu.lexikos.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://devimp.lexikos.com/voc-h5',
    lowcode_h5_host: 'https://dev-lowcode-h5.lexikos.com',
  },
  test: {
    server_host: 'https://testimp.leedarson.com:12001',
    imp2_h5_host: 'https://testimp.leedarson.com:12001/imp2/h5',
    imp2_edu_h5_host: 'https://testimpedu.lexikos.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://testmetastu.lexikos.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://testimp.leedarson.com:12001/voc-h5',
    lowcode_h5_host: 'https://test-lowcode-h5.lexikos.com',
  },
  test2: {
    server_host: 'https://test2-imp.lexikos.com',
    imp2_h5_host: 'https://test2-imp.lexikos.com/imp2/h5',
    imp2_edu_h5_host: 'https://test2-imp.lexikos.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://test2-imp.lexikos.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://test2-imp.lexikos.com/voc-h5',
    lowcode_h5_host: 'https://test2-lowcode.lexikos.com/h5',
  },
  test3: {
    server_host: 'https://test3-imp.lexikos.com',
    imp2_h5_host: 'https://test3-imp.lexikos.com/imp2/h5',
    imp2_edu_h5_host: 'https://test3-imp.lexikos.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://test3-imp.lexikos.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://test3-imp.lexikos.com/voc-h5',
    lowcode_h5_host: 'https://test3-lowcode.lexikos.com/h5',
  },
  pre: {
    server_host: 'https://preimp.leedarson.com',
    imp2_h5_host: 'https://preimp.leedarson.com/imp2/h5',
    imp2_edu_h5_host: 'https://preimp.leedarson.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://preimp.leedarson.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://preimp.leedarson.com/voc-h5',
    lowcode_h5_host: 'https://prelowcode.leedarson.com/h5',
  },
  prod: {
    server_host: 'https://imp.leedarson.com',
    imp2_h5_host: 'https://imp2.leedarson.com/imp2/h5',
    imp2_edu_h5_host: 'https://imp2.leedarson.com/imp2-edu/h5',
    imp2_stu_h5_host: 'https://imp2.leedarson.com/imp2-stu/h5',
    imp2_training_h5_host: 'https://imp.leedarson.com/voc-h5',
    lowcode_h5_host: 'https://lowcode.leedarson.com/h5',
  },
};
