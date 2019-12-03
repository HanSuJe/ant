<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="节点名称">
              <a-input v-model="typeName" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="id字段">
              <a-input v-model="idName" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="标题字段">
                <a-input v-model="nameField" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryProject">查询</a-button>
              <a-button style="margin-left: 8px" @click="reset">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="table-operator">
      <a-button style="margin-bottom:20px;" type="primary" icon="plus" @click="$refs.createModal.add()">新建</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="deleteWhole"><a-icon type="delete" />删除</a-menu-item>
          <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
      ref="table"
      size="default"
      :columns="columns"
      :data="loadData"
      :alert="{ show: true, clear: true }"
      :rowSelection="{ selectedRowKeys: this.selectedRowKeys, onChange: this.onSelectChange }"
    >
      <template v-for="(col, index) in columns" v-show="col.scopedSlots" :slot="col.dataIndex" slot-scope="text, record">
        <div :key="index">
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="e => handleChange(e.target.value, record.key, col, record)"
          />
          <template v-else>{{ text }}</template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record)">保存</a>
            <a-divider type="vertical" />
            <a-popconfirm title="真的放弃编辑吗?" @confirm="() => cancel(record)">
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a class="edit" @click="() => edit(record)">修改</a>
            <a-divider type="vertical" />
            <a class="delete" @click="() => del(record)">删除</a>
          </span>
        </div>
      </template>
    </s-table>
    <create-form ref="createModal" :PopupData="PopupData" @addProject="addProject" />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { getNodeType, addNodeType, updateNodeType, deleteNodeType } from '@/api/manage'
import CreateForm from '../list/modules/CreateForm'
export default {
  components: {
    CreateForm,
    STable
  },
  data () {
    return {
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      PopupData:[
        {
          name:"节点名称",
          key:"typename",
          value:"",
          type:"text"
        },
        {
          name:"id字段",
          key:"idname",
          value:"",
          type:"text"
        },
        {
          name:"标题字段",
          key:"namefield",
          value:"",
          type:"text"
        },
        {
          name:"对应实体",
          key:"classname",
          value:"",
          type:"text"
        },
        {
          name:"默认展开节点",
          key:"defaultchild",
          value:"",
          type:"text"
        },
        {
          name:"是否根节点",
          key:"root",
          value:"",
          type:"select",
          mode:"default",
          data:["true","false"]
        },
        {
          name:"图标",
          key:"icon",
          value:"",
          type:"select",
          mode:"default",
          data:["folder","file","project","gold","profile","table","wallet","database"]
        },
        {
          name:"视图",
          key:"viewers",
          value:"", 
          type:"select",
          mode:"multiple",
          data:["3D","json","download","dxf"]
        },
        {
          name:"默认视图",
          key:"defaultviewer",
          value:"",
          type:"select",
          mode:"default",
          data:["3D","json","download","dxf"]
        }
      ],
      columns: [{
        title:'节点名称',
        dataIndex:'typename',
        key: 'typename',
        scopedSlots: {
          customRender: 'typename',
        }
      },{
        title:'id字段',
        dataIndex:'idname',
        key:'idname',
        scopedSlots: {
          customRender: 'idname'
        }
      },{
        title:'标题字段',
        dataIndex:'namefield',
        key:'namefield',
        scopedSlots: {
          customRender: 'namefield'
        }
      },{
        title:'对应实体',
        dataIndex:'classname',
        key:'classname',
        scopedSlots: {
          customRender: 'classname'
        }
      },{
        title:'默认展开节点',
        dataIndex:'defaultchild',
        key:'defaultchild',
        scopedSlots: {
          customRender: 'defaultchild'
        }
      },{
        title:'是否根节点',
        dataIndex:'root',
        key:'root',
        scopedSlots: {
          customRender: 'root'
        }
      },{
        title:'图标',
        dataIndex:'icon',
        key:'icon',
        scopedSlots: {
          customRender: 'icon'
        }
      },{
        title: '视图',
        dataIndex:'viewers',
        key:'viewers',
        scopedSlots: {
          customRender: 'viewers'
        }
      },{
        title: '默认视图',
        dataIndex: 'defaultviewer',
        key:'defaultviewer',
        scopedSlots: {
          customRender: 'defaultviewer'
        }
      },{
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }],
      selectedRowKeys: [],
      selectedRows: [],
      typeName: '',
      idName: '',
      nameField: '',
      dataArray:[],
      loadData: parameter => {
        return getNodeType().then(res => {
          let dataArray = [];
          res.content.map((item,index) => {
            if(index >= (parameter.pageNo -1) * parameter.pageSize && index < parameter.pageNo * parameter.pageSize){
              dataArray.push({
                key: index,
                typename: item.typename,
                idname: item.idname,
                namefield: item.namefield,
                classname: item.classname,
                defaultchild: item.defaultchild,
                root: String(item.root),
                icon: String(item.icon),
                viewers: String(item.viewers),
                defaultviewer: String(item.defaultviewer)
              })
            }
          })
          return {
              data: dataArray,
              pageNo: parameter.pageNo,
              pageSize: parameter.pageSize,
              totalCount: res.content.length,
              totalPage:  parseInt(res.content.length / 10) + 1
          };
        })
      }
    }
  },
  methods: {
    handleChange (value, key, column, record) {
      record[column.dataIndex] = value
    },
    addProject(data){
      updateNodeType(data.classname,data).then(() => {
        // this.$refs.table.localDataSource.unshift(data);
        this.$refs.table.loadData();
      }).catch(() => {
        return this.$message.warning('保存异常!');
      });
    },
    edit (row) {
      this.$refs.table.$set(row,"editable",true);
    },
    del (row) {
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${row.typename} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          // this.$refs.table.localDataSource.map((item,index) => {
          //   if(item.key == row.key){
          //     this.$refs.table.localDataSource.splice(index,1);
          //   }
          // })
          deleteNodeType(row.classname).then(() => {
            this.$refs.table.loadData();
          }).catch(() => {
            return this.$message.warning('删除异常!');
          });
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    save (row) {
      this.$refs.table.$set(row,"editable",false);
      delete row.editable
      updateNodeType(row.classname,row).then(() => {
        this.$message.success('修改成功!');
      }).catch(() => {
        this.$message.warning('修改失败!');
      })
    },
    cancel (row) {
      this.$refs.table.$set(row,"editable",false);
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    deleteWhole(){
      this.selectedRows.map(item => {
        // this.$refs.table.localDataSource.map((value,index) => {
        //   if(item.key == value.key){
        //     this.$refs.table.localDataSource.splice(index,1);
        //   }
        // })
        deleteNodeType(item.classname)
        // this.$refs.table.localDataSource = this.dataArray;
      })
      this.$refs.table.loadData();
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    queryProject(){
      if(this.typeName.length == 0 && this.idName.length == 0 && this.nameField.length == 0){
        return this.$message.warning('请输入查询内容!');
      }
      let filterData = [];
      this.$refs.table.localDataSource.map(item => {
        if((String(item.typename).toLowerCase().indexOf(this.typeName.toLowerCase()) != -1) && (String(item.idname).toLowerCase().indexOf(this.idName.toLowerCase()) != -1) && (String(item.namefield).toLowerCase().indexOf(this.nameField.toLowerCase()) != -1)){
          filterData.push(item);
        }
      })
      if(filterData.length == 0){
        return this.$message.warning('没有查到关联的项目!');
      }
      this.$refs.table.localDataSource = filterData;
    },
    reset(){
      this.typeName = '';
      this.idName = '';
      this.nameField = '';
      this.$refs.table.loadData();
    }
  },
}
</script>

<style lang="less" scoped>
  .search {
    margin-bottom: 54px;
  }

  .fold {
    width: calc(100% - 216px);
    display: inline-block
  }

  .operator {
    margin-bottom: 18px;
  }

  @media screen and (max-width: 900px) {
    .fold {
      width: 100%;
    }
  }
</style>
