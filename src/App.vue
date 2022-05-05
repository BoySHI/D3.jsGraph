<!--
 * @Author: your name
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2022-02-15 13:55:09
 * @LastEditors: shiby
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vue-d3-graph-main的副本/src/App.vue
-->
<template>
  <div id="app">
    <div id="nav">
      <!-- <b> 导航部分 </b> | -->
      <router-link to="/"> 2D知识图谱</router-link> |
      <router-link to="/3dView"> 3D知识图谱</router-link>
      <router-link to="/pushNode"> 节点动态添加</router-link>
      <router-link to='/cytoscap'>cytoscap图谱</router-link>
      <!-- <router-link to="/about">3D知识图谱</router-link> -->
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  list-style: none;
  text-decoration: none;
  font-size: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  margin: 5px;
  padding: 20px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
