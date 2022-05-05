<!--
 * @Author: your name
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2021-12-08 11:14:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /图谱最新预演代码/vue-d3-graph-main/src/views/2dView.vue
-->
<template>
  <div class="gContainer">
    <!-- <d3graph /> -->
    <gSearch @getData="update"
             v-show="false" />
    <d3graph :data="data"
             :names="names"
             :labels="labels"
             :linkTypes="linkTypes" />
  </div>
</template>

<script>
import gSearch from '@/components/gSearch.vue'
import d3graph from '@/components/d3graph.vue'
export default {
  components: {
    gSearch,
    d3graph
  },
  data () {
    return {
      // d3jsonParser()处理 json 后返回的结果
      data: {
        nodes: [],
        links: []
      },
      // data: {},
      names: ['企业', '贸易类型', '地区', '国家'],
      labels: ['Enterprise', 'Type', 'Region', 'Country'],
      linkTypes: ['', 'type', 'locate', 'export'],
      s: {
        id: 'root',
        type: 'root',
        name: 'root',
        children: [
          {
            id: 'competition01',
            type: 'competition',
            name: '菜菜大赛',
            children: [
              {
                id: 'group301',
                type: 'area',
                name: '华南赛区'
              }
            ]
          }
        ]
      },
      parentsKeyList: []
    }
  },

  methods: {
    // 视图更新
    update (json) {
      // console.log('update')
      // console.log(json)
      this.d3jsonParser(json)
    },
    /*eslint-disable*/
    // 解析json数据，主要负责数据的去重、标准化
    d3jsonParser (json) {
      // console.log(json)
      const nodes = []
      const links = [] // 存放节点和关系
      /** */
      const nodeSet = [] // 存放去重后nodes的id
      // for (let item of json) {
      //   for (let segment of item.p.segments) {
      //     // 重新更改data格式
      //     if (nodeSet.indexOf(segment.start.identity) == -1) {
      //       // nodeSet.push(segment.start.identity)
      //       nodes.push({
      //         id: segment.start.identity,
      //         label: segment.start.labels[0],
      //         data: segment.start.properties
      //       })
      //     }
      //     if (nodeSet.indexOf(segment.end.identity) == -1) {
      //       // nodeSet.push(segment.end.identity)
      //       nodes.push({
      //         id: segment.end.identity,
      //         label: segment.end.labels[0],
      //         data: segment.end.properties
      //       })
      //     }
      //     links.push({
      //       source: segment.relationship.start,
      //       target: segment.relationship.end,
      //       type: segment.relationship.type,
      //       data: segment.relationship.properties
      //     })
      //   }
      // }
      // 自己做的新的数据结构操作部分
      json.nodes.map(item => {
        nodes.push({
          id: item.identity,
          label: item.labels[0],
          data: item.data
        })
      })
      json.links.map(item => {
        // console.log(item)
        links.push({
          source: item.start,
          target: item.end,
          type: item.type,
          data: item.data
        })
      })
      this.links = links
      this.nodes = nodes
      this.data = { nodes, links }


      // //关系分组
      // var linkGroup = {};
      // //对连接线进行统计和分组，不区分连接线的方向，只要属于同两个实体，即认为是同一组
      // var linkmap = {};
      // for (var i = 0; i < links.length; i++) {
      //   var key = links[i].source < links[i].target ? links[i].source + ':' + links[i].target : links[i].target + ':' + links[i].source;
      //   if (!linkmap.hasOwnProperty(key)) {
      //     linkmap[key] = 0;
      //   }
      //   linkmap[key] += 1;
      //   if (!linkGroup.hasOwnProperty(key)) {
      //     linkGroup[key] = [];
      //   }
      //   linkGroup[key].push(links[i]);
      // }
      // //为每一条连接线分配size属性，同时对每一组连接线进行编号
      // for (var i = 0; i < links.length; i++) {
      //   var key = links[i].source < links[i].target ? links[i].source + ':' + links[i].target : links[i].target + ':' + links[i].source;
      //   links[i].size = linkmap[key];
      //   //同一组的关系进行编号
      //   var group = linkGroup[key];
      //   var keyPair = key.split(':');
      //   var type = 'noself';//标示该组关系是指向两个不同实体还是同一个实体
      //   if (keyPair[0] == keyPair[1]) {
      //     type = 'self';
      //   }
      //   //给节点分配编号
      //   // setLinkNumber(group, type);
      // }

      // for (var i = 0; i < links.length; i++) {
      //   links[i].source = nodes[links[i].source] || (nodes[links[i].source] = { name: links[i].source, color: links[i].sourceColor, image: links[i].sourceImg, radius: links[i].sourceRadius });
      //   links[i].target = nodes[links[i].target] || (nodes[links[i].target] = { name: links[i].target, color: links[i].targetColor, image: links[i].targetImg, radius: links[i].targetRadius });
      // }
      // //绑定相连节点
      // for (var i = 0; i < nodes.length; i++) {
      //   for (var j = 0; j < links.length; j++) {
      //     if (nodes[i].name == links[j].source.name) {
      //       nodes[i][links[j].target.name] = { name: links[j].target.name };
      //     }
      //     if (nodes[i].name == links[j].target.name) {
      //       nodes[i][links[j].source.name] = { name: links[j].source.name };
      //     }
      //   }
      // }
      // console.log('节点', this.nodes)
      // console.log('关系', this.links)
      // return { nodes, links }
    },
    setLinkNumber (group) {
      if (group.length == 0) return;
      if (group.length == 1) {
        group[0].linknum = 0;
        return;
      }
      var maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length - 1) / 2;
      if (group.length % 2 == 0) {
        var startLinkNum = -maxLinkNumber + 0.5;
        for (var i = 0; i < group.length; i++) {
          group[i].linknum = startLinkNum++;
        }
      } else {
        var startLinkNum = -maxLinkNumber;
        for (var i = 0; i < group.length; i++) {
          group[i].linknum = startLinkNum++;
        }
      }

    },
    //查找父级kye集合
    bindFindKeys (data, val) {
      // console.log(777777);
      let [arr, newArr] = [[], []];
      let list = data.children;
      if (!list || !val) {
        return ''
      }
      let findParent = (item, nodeKey, parentVal) => {
        // console.log(item, nodeKey, parentVal)
        for (let i = 0; i < item.length; i++) {
          let node = item[i];
          if (node.id === nodeKey) {
            arr.unshift(nodeKey);
            if (nodeKey === list[0].id) {
              break
            }
            findParent(list, parentVal);
            break
          } else {
            if (node.children) {
              findParent(node.children, nodeKey, node.id);
            }
            continue
          }
        }
        return arr;
      }
      newArr = findParent(list, val);
      this.parentsKeyList = Array.from(new Set([...this.parentsKeyList, ...newArr]));
      // console.log(this.parentsKeyList);
      return this.parentsKeyList;  //存储去重一下
    },
    do () {
      const treeData = {
        title: 'as',
        children: [
          {
            title: 'etc',
            children: [
              {
                title: 'tomcat',
                children: [
                  { title: 'server.xml' },
                  { title: 'network.html' },
                ]
              },
              { title: 'wab.dll' },
              { title: 'aboot.txt' },
            ]
          },
          {
            title: 'System',
            children: [
              { title: 'license.txt' },
              { title: 'tortoise.dll' },
              { title: 'ConflictIcon.ico' },
            ],
          },
        ],
      };
      let a = [treeData]
      function foundFar (data, val) {
        for (var i = 0; i < data.length; i++) {
          if (data[i] && data[i].title == val) {
            return [];
          }
          if (data[i] && data[i].children) {
            var far = foundFar(data[i].children, val);
            if (far) {
              // console.log(far.concat(data[i].title));
              return far.concat(data[i].title);
            }
          }
        }
      }

      foundFar(a, "server.xml");

    }
  },
  created () {
    this.bindFindKeys(this.s, 'group301')
    this.do()
  }
}






</script>

<style lang="scss" scoped>
.gContainer {
  position: relative;
  border: 2px #000 solid;
  background-color: #9dadc1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>
