<template>
  <div>
    <!-- 头部 -->
    <div class="head"> 
      <flexbox :gutter='9.5'>
        <flexbox-item :span="16/125" >
          <div class="head-left">
            <!-- <x-icon type="ios-arrow-up" size="10"></x-icon>  -->
            <span>东莞</span>
            <x-icon type="ios-arrow-down" size="10"></x-icon>
          </div>
        </flexbox-item>
        <flexbox-item :span="52/75">
          <div class="search">
            <i class="weui-icon-search"></i>
            <input type="text" placeholder="搜索幼儿园/培训机构/俱乐部等"></div> 
        </flexbox-item>
        <flexbox-item :span="16/125"> 
            <!-- @on-item-click="consoleIndex()" -->
            <button-tab-item >
              登陆
            </button-tab-item>  
      </flexbox-item>
      </flexbox>  
    </div>  
  </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
    }
  },
  watch:{},
  computed:{},
  methods:{},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
</style>