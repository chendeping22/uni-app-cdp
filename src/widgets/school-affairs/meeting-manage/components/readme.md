# 如何使用
```html
<template>
	<tmt-calendar defaultDate="2021-11-03"  :point-list="['2022-03-20','2022-04-01','2022-04-02','2022-04-05']" :show="true" @changeDate="changeDate"></tmt-calendar>
</template>
```
# 参数说明
参数	|说明|	类型	|可选值|	默认值
-------- | -----| -----| -----| -----
pointList| 日期数组，控制日期底下的点 | Array|-|[]
pointColor|点的颜色|String|-|linear-gradient(180deg, #FF855E 0%, #ED6337 100%)
defaultDate| 默认选中的日期 | String |-|当天
showBtn  | 是否显示 展开/折叠 按钮|Boolean|true / false|true
show | 是否显示完整的日历|Boolean|true / false|true
bckground| 日历背景颜色|String|-|linear-gradient(45deg, #5A24A6 0%, #7E3CB5 100%)
weekColor| 星期的颜色|String|-|#fff
dayColor|天数的颜色|String|-|#fff
selectBg|选中的背景颜色|String|-|linear-gradient(180deg, #FF855E 0%, #ED6337 100%)
backColor|返回按钮的字体颜色|String|-|#fff
backBg|返回按钮的背景颜色|String|-|rgba(255, 255, 255, 0.19)
actionColor|左上角操作区域的颜色|String|-|#fff
unfoldBtnColor|底部 展开/折叠 按钮的颜色|String|-|#fff
# 事件
事件名成|说明|回调
-------- | -----| -----|
changeDate| 点击选择某一天时触发 | {year: 2022 , month: 4 , day: 7}
