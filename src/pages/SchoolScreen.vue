<template>
  <div class='schoolScreen'>
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
    <div class='screen-main'>
        <div class='screen-nav'>
            <router-link to=''>全部</router-link>
            <router-link to=''>学校</router-link>
            <router-link to='' class='nav-active'>机构</router-link>
            <router-link to=''>俱乐部</router-link>
        </div>
        <div class='screen-box'>  
            <router-link  class='screen-con' :to='item.link' v-for='item in list'>
                <flexbox >
                    <flexbox-item><p class='sub-name'>{{item.name}}</p> </flexbox-item>
                    <flexbox-item><p class='sub-num'>{{item.num}}</p> </flexbox-item>
                </flexbox>
            </router-link>
        </div> 
          
    </div>
  </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
        list:[
            {name:'英语兴趣班',num:'80',link:'/school/screenAfter'},
            {name:'英语兴趣班',num:'20',link:'/school/screenAfter'},
            {name:'数学兴趣班',num:'30',link:'/school/screenAfter'},
            {name:'语文兴趣班',num:'10',link:'/school/screenAfter'},
            {name:'口才培训班',num:'50',link:'/school/screenAfter'},
            {name:'体能培训班',num:'40',link:'/school/screenAfter'},
            {name:'智力开发',num:'60',link:'/school/screenAfter'} 
            ]
    }
  },
  watch:{},
  computed:{},
  methods:{
    switchTabItem (index) {
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
.screen-nav a.nav-active{
    color:#5EE2C6;
    background:#eee; 
}
.schoolScreen{
    height:100%;
    display:flex;
    flex-direction: column; 
}
.screen-main{
    display:flex;
    flex:1;
}
.screen-nav{
    background: #fff;
    width:33.33%; 
    display:flex;
    flex-direction: column;
}
.screen-nav a{
    text-align: left;
    padding-left:15px;
    height:44px;
    display:block;
    font-size:16px;
    color:#666;
    border-bottom: 1px solid #eee;
    line-height: 44px;
}
.screen-box{ 
    flex:1;
}
.screen-con{  
    padding-left:10px;
    padding-right:15px;
    border-bottom:1px solid #e5e5e5;
    height:44px;
    line-height: 44px;
    display:block;
}
.sub-name{
    color:#666;
    font-size: 16px;
}
.sub-num{
    text-align: right;
    font-size:12px;
    color:#989898;
}
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