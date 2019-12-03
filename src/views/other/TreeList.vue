<template>
<div @click="hiddenMenu">
  <a-card :bordered="false">
    <a-row :gutter="8">
      <a-col :span="5">
        <a-input-search style="margin-bottom: 8px" placeholder="Search" @search="onSearch"/>
        <a-tree
          :selectedKeys="selectedKeys"
          :loadData="onLoadData"
          :treeData="gData"
          @rightClick="myFn"
          @select="selectNode"
          @expand="onExpand"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          showIcon
        >
          <template slot="title" slot-scope="{title}">
            <span v-if="title.indexOf(searchValue) > -1">
              {{title.substr(0, title.indexOf(searchValue))}}
              <span style="color: #f50">{{searchValue}}</span>
              {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
            </span>
            <span v-else>{{title}}</span>
          </template>
          <a-icon slot="folder" type="folder-open" />
          <a-icon slot="file" type="file" />
          <a-icon slot="link" type="link" />
          <a-icon slot="project" type="project" />
          <a-icon slot="gold" type="gold" />
          <a-icon slot="profile" type="profile" />
          <a-icon slot="table" type="table" />
          <a-icon slot="wallet" type="wallet" />
          <a-icon slot="database" type="database" />
        </a-tree>
      </a-col>
      <a-col id="box" :span="19">
        <div style="position:relative;height:30px;">
            <a-icon type="rollback" @click="goBack" style="fontSize:20px;position:absolute;right:0;" />
        </div>
        <component
          :is="isComponent" 
          :rel_href="rel_href" 
          :columns="columns"
          :data="loadData"
          :customRow="customRow"
          :uid="uid"
          @showMenu="showMenu"
          :downUrl="downUrl"
        ></component>
      </a-col>
    </a-row>
  </a-card>
  <ul class="ulNode">
      <li v-show="delShow" @click="del">删除</li>
      <li v-for="(item, key) in viewers" :key="key" @click="seeView(item.code)">{{item.viewer}}&nbsp;查看</li>
      <li v-for="(item, key) in relShortnames" :key="'&' + key" @click="Relation(item.value)">关联&nbsp;{{item.name}}</li>
    </ul>
</div>
</template>
<script>
import { STable } from '@/components'
import { getServiceList, getDataTree } from '@/api/manage'
import { setTimeout } from 'timers';
import { BranchesOutline, CloudFill } from '@ant-design/icons/lib/dist';
import { async } from 'q';
import { getViewer } from '@/api/manage'
document.oncontextmenu = function(){
  return false;
}
export default {
  name: 'TreeList',
  components: {
    STable
  },
  data () {
    return {
      selectedKeys: [],
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      gData: [],
      viewersArr: [],
      //global-node-data
      nodeData: {},
      viewers: [],
      delShow: false,
      //rel
      relShortnames: [],
      //ToJson
      json_href: '',
      rel_href: '',
      isComponent: '',
      //s-table
      columns: [],
      loadData: new Promise(() => {}),
      customRow: (record) => {
        return {
          on: {
            contextmenu: (e) => {
              if(this.specialField.indexOf(e.target.textContent) > -1){
                let clickObj = record[this.columns[e.srcElement.cellIndex].dataIndex + 'Obj'];
                this.nodeData = clickObj;
                this.downUrl = clickObj._file;
                this.json_href = clickObj._self;
                let viewers = clickObj.viewers.indexOf(",") > -1 ? clickObj.viewers.split(",") : [clickObj.viewers];
                let newArr = [];
                viewers.map(async item => {
                  await this.viewersArr.map(val => {
                    if(item == val.code){
                      newArr.push({code: item, viewer: val.viewername})
                    }
                  })
                })
                this.viewers = newArr;
                this.uid = clickObj.uuid;
                let objdef_href = clickObj._objectdefine;
                let rel_shortname = [];
                this.axios.get(objdef_href).then(res => {
                  res.refobjects.map(item => {
                    rel_shortname.push({name:item.name,value:item.shortname})
                  })
                  this.relShortnames = rel_shortname;
                })
              }else{
                let checkTable = this.tableDatas.filter( (item, index) => {
                  return index == record.key;
                })
                let obj = {};
                checkTable[0].links.map(item => {
                  obj[item.rel] = item.href;
                })
                this.nodeData = obj;
                let viewers = checkTable[0].nodeType.viewers.indexOf(",") > -1 ? checkTable[0].nodeType.viewers.split(",") : [checkTable[0].nodeType.viewers];
                let newArr = [];
                viewers.map(async item => {
                  await this.viewersArr.map(val => {
                    if(item == val.code){
                      newArr.push({code: item, viewer: val.viewername})
                    }
                  })
                })
                this.viewers = newArr;
                checkTable[0].links.map(item => {
                  if(item.rel == "_self"){
                    //viewers
                    this.json_href = item.href;
                  }else if(item.rel == "_objectdefine"){
                    //relShortnames
                    this.axios.get(item.href).then(res => {
                      let rel_shortname = [];
                      res.refobjects.map(item => {
                        rel_shortname.push({name:item.name,value:item.shortname})
                      })
                      this.relShortnames = rel_shortname;
                      var cdNode = document.querySelector('.ulNode');
                      var cakLeft = (e.clientX >= document.documentElement.clientWidth - cdNode.offsetWidth)?(document.documentElement.clientWidth - (document.documentElement.clientWidth - e.clientX) - cdNode.offsetWidth):e.clientX;
                      var cakTop = (e.clientY >= (document.documentElement.clientHeight - ((newArr.length + this.relShortnames.length) * 28))) ? document.documentElement.clientHeight - (document.documentElement.clientHeight - e.clientY) - (newArr.length + this.relShortnames.length) * 28 : e.clientY;
                      cdNode.style.left = cakLeft + 'px';
                      cdNode.style.top = cakTop + 'px';
                      cdNode.style.display = "block";
                    })
                  }
                })
              }
            }
          }
        }
      },
      specialField: [],
      //threeD
      uid: '',
      threedId: '',
      threeDatas: '',
      //downloadFile
      downUrl: '',
    }
  },
  created :async function(){
    await this.getData("/dt/test");
    getViewer().then(res => {
      this.viewersArr = res.content;
    })
  },
  methods: {
    onLoadData(treeNode){
      return new Promise(resolve => {
        let newChildren = [];
        setTimeout(async () => {
          if(treeNode.dataRef.href){
            let objdef_href = treeNode.dataRef.href;
            await this.axios.get(objdef_href).then(res => {
              if(res.content){
                res.content.map((item, index) => {
                  let obj = {
                    title: item.obj[item.nodeType.namefield].length > 15 ? item.obj[item.nodeType.namefield].substring(0, 15)+'...' : item.obj[item.nodeType.namefield],
                    id: item.uid,
                    key: `${treeNode.dataRef.key}-${index}`,
                    children: [],
                    viewers: item.nodeType.viewers.indexOf(",") > -1 ? item.nodeType.viewers.split(",") : [item.nodeType.viewers],
                    defaultviewer: item.nodeType.defaultviewer,
                    slots: {
                      icon: item.nodeType.icon,
                    }
                  };
                  if(item.links.length){
                    item.links.map(value => {
                      obj[value.rel] = value.href;
                    })
                  }
                  newChildren.push(obj);
                })
              }
            }).then(()=>{
              treeNode.dataRef.children = newChildren;
            })
          }else{
            let objdef_href = treeNode.dataRef._objectdefine;
            this.axios.get(objdef_href).then(res => {
              res.refobjects.map((item, index) => {
                let obj = {
                  title: item.name,
                  href: treeNode.dataRef[`_r_${item.shortname}`],
                  key: `${treeNode.dataRef.key}^${index}`,
                  children: [],
                  slots: {
                    icon: "link",
                  }
                };
                newChildren.push(obj);
              })
            })
            await this.axios.get(treeNode.dataRef._child).then(res => {
              if(res.content){
                res.content.map((item, index) => {
                  let obj = {
                    title: item.obj[item.nodeType.namefield].length > 15 ? item.obj[item.nodeType.namefield].substring(0, 15)+'...' : item.obj[item.nodeType.namefield],
                    id: item.uid,
                    key: `${treeNode.dataRef.key}-${index}`,
                    children: [],
                    viewers: item.nodeType.viewers.indexOf(",") > -1 ? item.nodeType.viewers.split(",") : [item.nodeType.viewers],
                    defaultviewer: item.nodeType.defaultviewer,
                    slots: {
                      icon: item.nodeType.icon,
                    }
                  };
                  if(item.links.length){
                    item.links.map(value => {
                      obj[value.rel] = value.href;
                    })
                  }
                  newChildren.push(obj);
                })
              }
            }).then(()=>{
              treeNode.dataRef.children = newChildren;
            })
          }
          resolve(treeNode);
        }, 200);
      })
    },
    selectNode(key, e){
      document.getElementById("app").scrollTo(0,0);
      switch (e.node.dataRef.defaultviewer){
        case "json":
          this.$store.dispatch("addFun",{
            historyComponent: "JsonViewer",
            historyId: e.node.dataRef._self,
            historyNodedata: this.nodeData
          })
          this.rel_href = e.node.dataRef._self;
          this.isComponent = "JsonViewer";
          break;
        case "3D":
          this.$store.dispatch("addFun",{
            historyComponent: "ThreeViewer",
            historyId: e.node.dataRef.id,
            historyNodedata: this.nodeData
          })
          this.uid = e.node.dataRef.id;
          let newChildren = [];
          setTimeout(async ()=>{
            await this.axios.get(e.node.dataRef._child).then(res => {
              if(res.content){
                res.content.map((item, index) => {
                  let obj = {
                    title: item.obj[item.nodeType.namefield],
                    id: item.uid,
                    key: new Date().getTime() + index,
                    children: [],
                    viewers: item.nodeType.viewers.indexOf(",") > -1 ? item.nodeType.viewers.split(",") : [item.nodeType.viewers],
                    defaultviewer: item.nodeType.defaultviewer,
                    slots: {
                      icon: item.nodeType.icon,
                    }
                  };
                  if(item.links.length){
                    item.links.map(value => {
                      obj[value.rel] = value.href;
                    })
                  }
                  newChildren.push(obj);
                })
                this.threeDatas = newChildren;
              }else{
                return false;
              }
            })
          }, 0);
          this.isComponent = "ThreeViewer";
          break;
      }
    },
    searchTree(item, key, newChildren){
      let isSearch = false;
      item.map(val => {
        if(val.key == key){
          isSearch = true;
          val.children = newChildren;
        }
        if(isSearch == false){
          this.searchTree(val.children, key, newChildren);
        }
      })
    },
    getData(url){
      this.axios.get(url).then(res => {
        res.content.map((item, index) => {
          let obj = {
            title: item.obj[item.nodeType.namefield].length > 15 ? item.obj[item.nodeType.namefield].substring(0, 15)+'...' : item.obj[item.nodeType.namefield],
            id: item.uid,
            key: index,
            children: [],
            viewers: item.nodeType.viewers.indexOf(",") > -1 ? item.nodeType.viewers.split(",") : [item.nodeType.viewers],
            defaultviewer: item.nodeType.defaultviewer,
            slots: {
              icon: item.nodeType.icon,
            }
          };
          if(item.links.length){
            item.links.map(value => {
              obj[value.rel] = value.href;
            })
          }
          this.gData.push(obj);
        });
      })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    seeView(item){
      document.getElementById("app").scrollTo(0,0);
      document.querySelector('.ulNode').style.display = "none";
      switch (item){
        case "json":
          this.$store.dispatch("addFun",{
            historyComponent: "JsonViewer",
            historyId: this.json_href,
            historyNodedata: this.nodeData
          })
          this.rel_href = this.json_href;
          this.isComponent = "JsonViewer";
          break;
        case "3D":
          this.$store.dispatch("addFun",{
            historyComponent: "ThreeViewer",
            historyId: this.threedId,
            historyNodedata: this.nodeData
          })
          this.uid = this.threedId;
          let newChildren = [];
          setTimeout(async ()=>{
            await this.axios.get(this.nodeData._child).then(res => {
              if(res.content){
                res.content.map((item, index) => {
                  let obj = {
                    title: item.obj[item.nodeType.namefield],
                    id: item.uid,
                    key:  new Date().getTime() + index,
                    children: [],
                    viewers: item.nodeType.viewers.indexOf(",") > -1 ? item.nodeType.viewers.split(",") : [item.nodeType.viewers],
                    defaultviewer: item.nodeType.defaultviewer,
                    slots: {
                      icon: item.nodeType.icon,
                    }
                  };
                  if(item.links.length){
                    item.links.map(value => {
                      obj[value.rel] = value.href;
                    })
                  }
                  newChildren.push(obj);
                })
                this.threeDatas = newChildren;
              }else{
                return false;
              }
            })
          }, 0);
          this.isComponent = "ThreeViewer";
          break;
        case "download":
          this.isComponent = "DownloadView";
          break;
        case "dxf":
          this.isComponent = "DxfView";
          break;
      }
    },
    Relation(val, add = true){
      document.getElementById("app").scrollTo(0,0);
      if(add == true){
        this.$store.dispatch("addFun", {
          historyComponent: "s-table",
          historyId: val,
          historyNodedata: this.nodeData 
        });
      }
      document.querySelector('.ulNode').style.display = "none";
      let columns = [];
      //获取列
      this.axios.get(this.nodeData[`_r_${val}_od`]).then(res => {
        res.properties.map(item => {
          columns.push({
            title: item.name,
            dataIndex: item.shortname,
            sorter: true,
            scopedSlots: {
              customRender: item.shortname
            },
            fieldType: item.objdefine.classname,
            customCell: (record, rowIndex) => {
              if(item.objdefine.classname.indexOf("boolean") < 0 && item.objdefine.classname.indexOf("char") < 0 && item.objdefine.classname.indexOf("short") < 0 && item.objdefine.classname.indexOf("int") < 0 && item.objdefine.classname.indexOf("float") < 0 && item.objdefine.classname.indexOf("double") < 0 && item.objdefine.classname.indexOf("byte") < 0 && item.objdefine.classname.indexOf("String") < 0){
                return {
                  style: {
                    background: "#E0FFFF",
                    cursor: "pointer"
                  }
                }
              }
            }
          });
        })
        this.columns = columns;
      })
      //列表对应信息
      this.loadData = parameter => {
        return this.axios.get(this.nodeData[`_r_${val}`]).then(res => {
          this.tableDatas = res.content;
          let dataArray = [];
          res.content.map((item, index) => {
            let obj = {key: index};
            columns.map(val => {
              if(val.fieldType.indexOf("boolean") < 0 && val.fieldType.indexOf("char") < 0 && val.fieldType.indexOf("short") < 0 && val.fieldType.indexOf("int") < 0 && val.fieldType.indexOf("float") < 0 && val.fieldType.indexOf("double") < 0 && val.fieldType.indexOf("byte") < 0 && val.fieldType.indexOf("String") < 0 && val.fieldType.indexOf("Date") < 0){
                item.links.map(item => {
                  if(item.rel == `_p_${val.dataIndex}`){
                    this.axios.get(item.href).then(res => {
                      this.specialField.push(res.obj[res.nodeType.namefield]);
                      obj[val.dataIndex] = res.obj[res.nodeType.namefield];
                      obj[val.dataIndex + 'Obj'] = {};
                      obj[val.dataIndex + 'Obj'].viewers = res.nodeType.viewers;
                      obj[val.dataIndex + 'Obj'].defaultviewer = res.nodeType.defaultviewer;
                      obj[val.dataIndex + 'Obj'].uuid = res.uid;
                      res.links.map(item => {
                        obj[val.dataIndex + 'Obj'][item.rel] = item.href;
                      })
                    }).catch(err =>{
                      console.log("sorry!! you are failed");
                    })
                  }
                })
              }else if(val.fieldType.indexOf("[]") > -1){
                obj[val.dataIndex] = item.obj[val.dataIndex] != null && item.obj[val.dataIndex].length > 5 ? item.obj[val.dataIndex].slice(0,3) + "..." : item.obj[val.dataIndex]
              }else{
                obj[val.dataIndex] = item.obj[val.dataIndex]
              }
            })
            setTimeout(()=>{
              dataArray.push(obj);
            },500)
          })
          return {
            data: dataArray,
            pageNo: parseInt(res.page.number) + 1,
            pageSize: res.page.size,
            totalCount: parseInt(res.page.totalElements) + 1,
            totalPage: parseInt(res.page.totalPages) + 1
          }
        })
      }
      this.isComponent = "s-table";
    },
    onExpand(expandedKeys){
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    myFn(event){
      this.delShow = true;
      this.nodeData = event.node.dataRef;
      this.json_href = event.node.dataRef._self;
      let viewers = event.node.dataRef.viewers;
      let newArr = [];
      viewers.map(item => {
        this.viewersArr.map(val => {
          if(item == val.code){
            newArr.push({code: item, viewer: val.viewername})
          }
        })
      })
      this.viewers = newArr;
      this.threedId = event.node.dataRef.id;
      let objdef_href = event.node.dataRef._objectdefine;
      let rel_shortname = [];
      let getShortname = async () => {
        var res = await this.axios.get(objdef_href);
        res.refobjects.map(item => {
          rel_shortname.push({name:item.name,value:item.shortname});
        })
        this.relShortnames = rel_shortname;
        var cdNode = document.querySelector('.ulNode');
        var cakLeft = (event.event.clientX >= document.documentElement.clientWidth - cdNode.offsetWidth)?(document.documentElement.clientWidth - (document.documentElement.clientWidth - event.event.clientX) - cdNode.offsetWidth):event.event.clientX;
        var cakTop = (event.event.clientY >= (document.documentElement.clientHeight - ((newArr.length + this.relShortnames.length + 1) * 28))) ? document.documentElement.clientHeight - (document.documentElement.clientHeight - event.event.clientY) - (newArr.length + this.relShortnames.length + 1) * 28 : event.event.clientY;
        cdNode.style.left = cakLeft + 'px';
        cdNode.style.top = cakTop + 'px';
        cdNode.style.display = "block";
      }
      getShortname();
    },
    showMenu(data){
      var e = window.event;
      function fn(treeArray, _this,e){
        treeArray.map(item => {
          if(item.id == data){
            _this.nodeData = item;
            _this.json_href = item._self;
            let viewers = item.viewers;
            let newArr = [];
            viewers.map(async item => {
              await _this.viewersArr.map(val => {
                if(item == val.code){
                  newArr.push({code: item, viewer: val.viewername})
                }
              })
            })
            _this.viewers = newArr;
            _this.threedId = item.id;
            let objdef_href = item._objectdefine;
            let rel_shortname = [];
            _this.axios.get(objdef_href).then(res => {
              res.refobjects.map(async item => {
                await rel_shortname.push({name:item.name,value:item.shortname})
              })
              _this.relShortnames = rel_shortname;
              var cdNode = document.querySelector('.ulNode');
              var cakLeft = (e.clientX >= document.documentElement.clientWidth - cdNode.offsetWidth)?(document.documentElement.clientWidth - (document.documentElement.clientWidth - e.clientX) - cdNode.offsetWidth):e.clientX;
              var cakTop = (e.clientY >= (document.documentElement.clientHeight - ((newArr.length + _this.relShortnames.length) * 28))) ? document.documentElement.clientHeight - (document.documentElement.clientHeight - e.clientY) - (newArr.length + _this.relShortnames.length) * 28 : e.clientY;
              cdNode.style.left = cakLeft + 'px';
              cdNode.style.top = cakTop + 'px';
              cdNode.style.display = "block";
            });
            return;
          }
        })
      }
      fn(this.threeDatas, this, e);
    },
    hiddenMenu(){
      var cdNode = document.querySelector('.ulNode');
      if(cdNode.style.display == "block"){
        cdNode.style.display = "none";
      }
    },
    onSearch(e){
      if(e.length == 0){
        return false;
      }
      const dataList = [];
      function getParentKey(key, tree){
        return new Promise((reslove, reject) => {
          let parentKey;
          for (let i = 0; i < tree.length; i++) {
            let node = tree[i];
            if (node.children.length > 0) {
              if (node.children.some(item => item.key == key)) {
                parentKey = node.key;
              }else{
                getParentKey(key, node.children);
              }
            }
          }
          reslove(parentKey)
        })
      }
      function getTitle(data){
        return new Promise((resolve, reject) => {
          for (let i = 0; i < data.length; i++) {
            const node = data[i]
            const key = node.key
            dataList.push({ key, title: data[i].title })
            if (node.children) {
              getTitle(node.children)
            }
          }
          resolve(dataList);
        })
      }
      let f1 = async ()=>{
        var dataArr = await getTitle(this.gData);
        let filterDatas = dataArr.filter(item => item.title.indexOf(e) > -1);
        let set = new Set();
        filterDatas.map(async item => {
          let expandedKeys = await getParentKey(item.key, this.gData);
          set.add(expandedKeys);
          this.onExpand(Array.from(set));
        })
      }
      f1();
    },
    goBack(){
      if(this.$store.state.historyData.length > 1){
        let historyData = this.$store.state.historyData[this.$store.state.historyData.length - 2];
        if(historyData.component == "s-table"){
          this.isComponent = historyData.component;
          this.nodeData = historyData.nodedata;
          this.Relation(historyData.id, false);
        }else if(historyData.component == "JsonViewer"){
          this.rel_href = historyData.id;
          this.isComponent = historyData.component;
        }else if(historyData.component == "ThreeViewer"){
          this.nodeData = historyData.nodedata;
          this.uid = historyData.id;
          this.isComponent = historyData.component;
        }
        this.$store.dispatch("delFun");
      }else{
        return false;
      }
    },
    del(){
      this.delShow = false;
      class DelId{
        static del(datas, _this){
          if(datas.some(item => item.id == _this.nodeData.id)){
            const key = datas.findIndex(val => val.id == _this.nodeData.id);
            return datas.splice(key, 1);
          }
          datas.map(async item => await this.del(item.children, _this));
        }
      }
      this.$confirm({
        title: '警告',
        content: `真的要删除节点 ${this.nodeData.title} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.axios.delete(this.json_href).then(res => {
            DelId.del(this.gData, this);
          }).catch(() => {
            return this.$message.warning('删除异常!');
          });
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    }
  }
}
</script>
<style lang="less">
  #box{
    overflow: auto;
  }
  .ulNode{
    z-index: 999;
    list-style: none;
    border: 1px solid #cccccc;
    border-radius: 5px;
    width: 150px;
    padding: 0;
    margin: 0;
    display: none;
    position:fixed;
  }
  .ulNode li{
    text-align: center;
    line-height: 28px;
    background-color: #cccccc;
  }
  .ulNode li:hover{
    background: #1890ff;
    color: #ffffff;
    cursor: pointer;
  }
  .custom-tree {

    /deep/ .ant-menu-item-group-title {
      position: relative;
      &:hover {
        .btn {
          display: block;
        }
      }
    }

    /deep/ .ant-menu-item {
      &:hover {
        .btn {
          display: block;
        }
      }
    }

    /deep/ .btn {
      display: none;
      position: absolute;
      top: 0;
      right: 10px;
      width: 20px;
      height: 40px;
      line-height: 40px;
      z-index: 1050;

      &:hover {
        transform: scale(1.2);
        transition: 0.5s all;
      }
    }
  }
</style>
