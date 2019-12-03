<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="对象名称">
              <a-input v-model="objName" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="对象类名">
              <a-input v-model="className" />
            </a-form-item>
          </a-col>
          <a-col :md="8 || 24" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="queryProject">查询</a-button>
              <a-button style="margin-left: 8px" @click="reset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="table-operator">
      <a-button style="margin-bottom:20px;" type="primary" icon="plus" @click="add()">新建</a-button>
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
            <a class="edit" @click="() => edit(record)">编辑</a>
            <a-divider type="vertical" />
            <a class="delete" @click="() => del(record)">删除</a>
          </span>
        </div>
      </template>
    </s-table>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { getObjdef, deleteObjdef } from '@/api/manage'
export default {
  components: {
    STable
  },
  data () {
    return {
      // 查询参数
      queryParam: {},
      columns: [{
        title: '对象名称',
        dataIndex: 'name'
      },{
        title: '对象类名',
        dataIndex: 'classname'
      },{
        title: '混合对象',
        dataIndex: 'mixinObjects'
      },{
        title: 'valid',
        dataIndex: 'valid'
      },{
        title: '抽象类',
        dataIndex: 'ab'
      },{
        title: 'proxyclass',
        dataIndex: 'proxyclass'
      },{
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }],
      selectedRowKeys: [],
      selectedRows: [],
      objName: '',
      className: '',
      dataArray:[],
      loadData: parameter => {
        return getObjdef().then(res => {
          let dataArray = [];
          res.content.map((item,index) => {
            if(index >= (parameter.pageNo -1) * parameter.pageSize && index < parameter.pageNo * parameter.pageSize){
              dataArray.push({
                key: index,
                name: item.name,
                classname: item.classname,
                mixinObjects: String(item.mixinObjects),
                valid: String(item.valid),
                ab: String(item.ab),
                proxyclass: String(item.proxyclass)
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
    edit (row) {
      this.$router.push({name: 'AdvanceForm', params: {pathUrl: `edit/${row.classname}`,classname:row.classname}});
    },
    del (row) {
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${row.name} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          deleteObjdef(row.classname).then(() => {
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
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    deleteWhole(){
      this.selectedRows.map(item => {
        deleteObjdef(item.classname)
      })
      this.$refs.table.loadData();
    },
    queryProject(){
      if(this.objName.length == 0 && this.className.length == 0){
        return this.$message.warning('请输入查询内容!');
      }
      let filterData = [];
      this.$refs.table.localDataSource.map(item => {
        if((String(item.name).toLowerCase().indexOf(this.objName.toLowerCase()) != -1) && (String(item.classname).toLowerCase().indexOf(this.className.toLowerCase()) != -1)){
          filterData.push(item);
        }
      })
      if(filterData.length == 0){
        return this.$message.warning('没有查到关联的项目!');
      }
      this.$refs.table.localDataSource = filterData;
    },
    reset(){
      this.objName = '';
      this.className = '';
      this.$refs.table.loadData();
    },
    add(){
      this.$router.push({name: 'AdvanceForm', params: {pathUrl: 'new'}})
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
