<template>
  <div> 
      <div class='head'>
        <flexbox :gutter='9.5'>
            <flexbox-item :span="16/125" >  
            <div  class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div> 
            </flexbox-item>
            <flexbox-item :span="4/5">  
                <c-search placeholder="搜索幼儿园/培训机构/俱乐部等" ></c-search>
            </flexbox-item> 
        </flexbox> 
      </div> 
      <div> 
        <tab :line-width="1" custom-bar-width="100px"  @on-before-index-change="switchTabItem">
            <tab-item selected > 
            <router-link class="tab-act" to=''>教学<i class='choose-icon active'></i>
            </router-link>
            </tab-item>
            <tab-item  class="vux-1px-l"> 
            <router-link class="tab-act" to=''>附近<i class='choose-icon'></i>
            </router-link>
            </tab-item>
            <tab-item class="vux-1px-l">
            <router-link class="tab-act" to=''>智能排序<i class='choose-icon'></i>
            </router-link>
            </tab-item>
        </tab> 
       </div> 
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
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'100m'
        }, {
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'200m'
        }, {
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'200m'
        }, {
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'200m'
        }, {
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'200m'
        }, {
          src: '/static/img_institutions03.png',
          fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: '/school/in',
          distance:'200m'
        }, {
          src: '/static/img_institutions03.png',
          title: '西瓜幼儿园',
          desc: '简介：建筑面积100百万平方米，有独立游泳池',
          url: {
            path: '/school/in',
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
  methods:{ switchTabItem (index) {
      console.log('on-before-index-change', index)
      this.$vux.loading.show({
        text: 'loading'
      })
      setTimeout(() => {
        this.$vux.loading.hide()
        this.index01 = index
      }, 1000)
    },
    turnUp:function(){ 
      this.$router.go(-1);
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.choose-icon{
    display:inline-block;
    width:0px;
    height:0px;
    border:4px solid transparent;
    border-top:4px solid #989898; 
    vertical-align: text-bottom;
}
.active{
  border-top-color:#5EE2C6;  
}
</style>