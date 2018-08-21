<template>
    <div class="search"> 
        <x-icon type="ios-search" size="10"></x-icon>
        <input type="text" :placeholder="placeholder ">
    </div> 
</template>

<script>
export default {
  name: "c-search",
  components: {},
  props: { 
    placeholder: String
  },
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>
<style lang="less" scoped>
    .search {
    position: relative;
    }
    .search .vux-x-icon-ios-search {
    position: absolute;
    left: 10px;
    top: 9px;
    line-height: 29px; 
    fill:#ccc;
    }
    input[type="text"] {
    padding-left: 25px;
    width: 100%;
    height: 29px;
    border: none;
    border-radius: 5px;
    background: #f6f5f5;
    color: #666666;
    }
    input::placeholder {
    color: #ccc;
    }
</style>