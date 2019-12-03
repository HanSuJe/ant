<template>
  <a-card :bordered="false">
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
import { getViewer, getViewerData, updateViewer, deleteViewer } from '@/api/manage'
import CreateForm from '../list/modules/CreateForm'
import Vue from 'vue'
let componentArr = new Vue().componentArr;
export default {
  components: {
    CreateForm,
    STable
  },
  data () {
    return {
      // 查询参数
      queryParam: {},
      PopupData:[
        {
          name:"视图编码",
          key:"code",
          value:"",
          type:"text"
        },
        {
          name:"视图名称",
          key:"viewername",
          value:"",
          type:"text"
        },
        {
          name:"显示组件",
          key:"component",
          value:"",
          type:"select",
          mode:"default",
          data:componentArr
        },
      ],
      columns: [
        {
          title: '视图编码',
          dataIndex: 'code'
        },
        {
          title: '视图名称',
          dataIndex: 'viewername',
          scopedSlots: { customRender: 'viewername' }
        },
        {
          title: '显示组件',
          dataIndex: 'component',
          scopedSlots: { customRender: 'component' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      selectedRowKeys: [],
      selectedRows: [],
      loadData: parameter => {
        return getViewer().then(res => {
          let dataArray = [];
          res.content.map((item,index) => {
            if(index >= (parameter.pageNo -1) * parameter.pageSize && index < parameter.pageNo * parameter.pageSize){
              dataArray.push({
                key: index,
                code: item.code,
                viewername: item.viewername,
                component: item.component
              })
            }
          })
          return {
              data: dataArray,
              pageNo: parameter.pageNo,
              pageSize: parameter.pageSize,
              totalCount: res.content.length,
              totalPage: parseInt(res.content.length / 10) + 1
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
      updateViewer(data.code,data).then(() => {
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
        content: `真的要删除 ${row.viewername} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteViewer(row.code).then(() => {
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
      updateViewer(row.code,row).then(() => {
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
        deleteViewer(item.code)
      })
      this.$refs.table.loadData();
    }
  }
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
