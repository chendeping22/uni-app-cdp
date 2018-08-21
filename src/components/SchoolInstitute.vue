<template>
  <div> 
      <panel :list="list" type="1" @on-img-error="onImgError">  
      </panel>
   </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
       list: [{
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'100m'
      }, {
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'200m'
      }, {
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'200m'
      }, {
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'200m'
      }, {
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'200m'
      }, {
        src: '/static/img_institutions05.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/school/in',
        distance:'200m'
      }, {
        src: '/static/img_institutions05.png',
        title: '成光幼儿园1校',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: {
          path: '/component/radio',
          replace: false
        },
        distance:'200m',
        meta: {
          source: '来源信息',
          date: '时间',
          other: '其他信息'
        }
      }]
    }
  },
  watch:{},
  computed:{},
  methods:{
    onImgError (item, $event) {
      console.log(item, $event)
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
</style>