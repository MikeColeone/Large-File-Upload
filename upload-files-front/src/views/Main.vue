<script setup lang="ts">
import Aside from '@/components/aside.vue'
import Header from '@/components/navHeader.vue'
</script>
<template>
  <div class="common-layout">
    <el-container>
      <el-aside width:auto height="100%"><Aside /></el-aside>
      <el-container>
        <el-header><Header></Header></el-header>
        <el-main><RouterView /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
.common-layout {
  height: 100vh;
}

.el-aside {
  width: auto !important;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
