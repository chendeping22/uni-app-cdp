<template>
  <div class='location-search'>
        <c-head>
            <div slot='left'> 
                <div  class="return" @click='turnUp'>
                    <img src="/static/btn_return.png" alt="">
                </div>
            </div>
             <c-search slot='center' placeholder="搜索幼儿园/培训机构/俱乐部等"></c-search>   
            <div slot='right'>  
                <router-link to=''><p class='search'>搜索</p> </router-link>  
            </div>
         </c-head>  
         <div>
            <group title="热门搜索">   
                <div class="hot-box"> 
                    <div class="hot">
                        <p v-for="item in hotList">{{item}}</p> 
                    </div>
                </div>  
            </group>
            <div class="history"> 
                <div class="delete">
                    <img src="/static/btn_trash.png" alt="">
                </div>
                 <group title="历史记录">   
                    <div class="hot-box"> 
                        <div class="hot">
                            <p v-for="item in history">{{item}}</p> 
                        </div>
                    </div>  
                </group>
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
        hotList:['东莞深圳门','广州芳村芳村村','松山湖','松山湖','望牛墩','上海北京厦门门','中山'],
        history:['东莞大岭山','广州芳村芳村村','望牛墩','望牛墩','望牛墩','上海北京厦门门','中山中山山'],
    }
  },
  watch:{},
  computed:{},
  methods:{
    turnUp:function(){ 
      this.$router.go(-1);
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.location-search{
    background: #fff;
    height:100vh;
}
.search{ 
  color: #fff;
  font-size: 12px; 
  line-height:29px;
}
.hot-box{
    padding:0 15px;
}
.hot{
    font-size:12px;
    color:#989898; 
}
.hot p{ 
    line-height: 25px; 
    padding:0 10px; 
    float: left;  
    background: #eee;
    margin:5px 0;
    border-radius: 3px;
}
.hot p:not(:last-child) { 
    margin-right:10px;
        } 
.delete{
    width:20px;
    height:20px;
    position:absolute;
    right:15px;
    top:5px;
    z-index:1000;
} 
.delete img{
    width:100%;
    height:100%;
}
 .history{
     position: relative;
 }
</style>