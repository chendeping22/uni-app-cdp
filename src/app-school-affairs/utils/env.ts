type IProject = 'default';
type IHomeRouteConf = {
  [k in IProject]: {
    homePage: string;
    homeRoutePath: string; // 与homePage的区别: 无前缀, 仅用于getCurrentPages()对比路由
    homeMainPath: any;
    homeRoutes: string[];
  };
};

/** 获取home相关的路由配置 */
export const getHomeConf = () => {
  const conf = homeRouteConf['default'];
  const { homePage, homeRoutePath, homeMainPath, homeRoutes } = conf;
  return {
    homePage,
    homeRoutePath,
    homeRoutes,
    homeMainPath,
  };
};

/** 主页路由配置, 注意首字符带'/'的用于跳转, 无'/'的用于仅用于getCurrentPages() */
export const homeRouteConf: IHomeRouteConf = {
  // 校园与家校
  default: {
    homePage: '/app-platform/login/index',
    homeRoutePath: 'app-platform/login/index',
    homeMainPath: {
      guardian: '/pages/workbench/index',
      teacher: '/pages/workbench/index',
    },
    homeRoutes: [
      'app-platform/login/index',
      'pages/workbench/index',
      'pages/contacts/index',
      'pages/message/index',
      'pages/mine/index',
    ],
  },
};
