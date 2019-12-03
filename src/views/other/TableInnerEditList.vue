<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="项目id">
              <a-input v-model="projectId" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="项目编码">
              <a-input v-model="projectCode" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="项目名称">
                <a-input v-model="projectName" />
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
import { getProjectList, updateProject, deleteProject } from '@/api/manage'
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
          name:"项目名称",
          key:"name",
          value:"",
          type:"text"
        },
        {
          name:"项目编码",
          key:"_projectcode",
          value:"",
          type:"text"
        },
        {
          name:"项目id",
          key:"id",
          value:"",
          type:"text"
        }
      ],
      columns: [
        {
          title: '项目id',
          dataIndex: 'id'
        },
        {
          title: '项目名称',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '项目编码',
          dataIndex: '_projectcode'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      selectedRowKeys: [],
      selectedRows: [],
      projectName: '',
      projectId: '',
      projectCode: '',
      loadData: parameter => {
        return getProjectList().then(res => {
          let dataArray = [];
          res.content.map((item,index) => {
            if(index >= (parameter.pageNo -1) * parameter.pageSize && index < parameter.pageNo * parameter.pageSize){
              dataArray.push({
                key: index,
                id: item.obj.id,
                _projectcode: item.obj._projectcode,
                name: item.obj.name
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
      // this.loadData.push(data);
      updateProject(data._projectcode,data).then(() => {
        this.$refs.table.loadData();
      }).catch(() => {
        return this.$message.warning('保存异常!');
      });
    },
    edit (row) {
      // this.loadData.map(item => {
      //   if(item.key == row.key){
      //     this.$set(item,"editable",true);
      //   }
      // })
      this.$refs.table.$set(row,"editable",true);
    },
    del (row) {
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${row.name} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          // this.loadData.map((item,index) => {
          //   if(item.key == row.key){
          //     this.loadData.splice(index,1);
          //   }
          // })
          deleteProject(row._projectcode).then(() => {
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
      // row.editable = false
      delete row.editable
      updateProject(row._projectcode,row).then(() => {
        this.$message.success('修改成功!');
      }).catch(() => {
        this.$message.warning('修改失败!');
      })
    },
    cancel (row) {
      this.$refs.table.$set(row,"editable",false);
      // row.editable = false
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    deleteWhole(){
      this.selectedRows.map(item => {
        // this.loadData.map((value,index) => {
        //   if(item.key == value.key){
        //     this.loadData.splice(index,1);
        //   }
        // })
        deleteProject(item._projectcode)
      })
      this.$refs.table.loadData();
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    queryProject(){
      if(this.projectName.length == 0 && this.projectId.length == 0 && this.projectCode.length == 0){
        return this.$message.warning('请输入查询内容!');
      }
      let filterData = [];
      this.$refs.table.localDataSource.map(item => {
        if((String(item.name).toLowerCase().indexOf(this.projectName.toLowerCase()) != -1) && (String(item.id).toLowerCase().indexOf(this.projectId.toLowerCase()) != -1) && (String(item._projectcode).toLowerCase().indexOf(this.projectCode.toLowerCase()) != -1)){
          this.filterData.push(item);
        }
      })
      if(filterData.length == 0){
        return this.$message.warning('没有查到关联的项目!');
      }
      this.$refs.table.localDataSource = filterData;
    },
    reset(){
      this.projectName = '';
      this.projectId = '';
      this.projectCode = '';
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
