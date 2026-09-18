<script setup>
import { ref, onMounted } from "vue";
import { queryAllApi, addApi, querybyIdApi, updateApi, deleteByIdApi } from "../../api/dept";
import { ElMessage, ElMessageBox } from "element-plus";

const deptList = ref([]);
// dialog对话框
const dialogFormVisible = ref(false);
const formTitle = ref("");
const dept = ref({
  name: "",
});
const deptFormRef = ref();

const search = async () => {
  // const result = await axios.get('https://apifoxmock.com/m1/3128855-1224313-default/depts');
  // if (result.data.code == 1) {
  //   deptList.value = result.data.data;
  // }

  const result = await queryAllApi();
  if (result.code == 1) {
    deptList.value = result.data;
  }
};

const save = async () => {
  //表单校验
  if (!deptFormRef.value) return;
  deptFormRef.value.validate(async (valia) => {
    if (valia) {//通过
      let result;
      if (dept.value.id) {//修改
        result = await updateApi(dept.value);
      } else {//新增
        result = await addApi(dept.value)
      }
      if (result.code == 1) {
        //成功
        //提示信息，弹窗
        ElMessage.success("操作成功");
        // 关闭对话框
        dialogFormVisible.value = false;
        //重新查询刷新
        search();
      } else {
        //失败
        ElMessage.error(result.msg);
      }
    } else {
      ElMessage.error("表单校验不通过");
    }
  });
};

//新增部门
const addDept = () => {
  dialogFormVisible.value = true;
  formTitle.value = "新增部门";
  dept.value = { name: "" };
  if (deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
};

//编辑
const edit = async (id) => {
  formTitle.value = "编辑部门";
  if (deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
  const result = await querybyIdApi(id);
  if (result.code == 1) {
    dialogFormVisible.value = true;
    dept.value = result.data;
  }
}

onMounted(() => {
  search();
});

//表单校验
const rules = ref({
  name: [
    { required: true, message: "部门名称是必填项", trigger: "blur" },
    { min: 2, max: 10, message: "部门名称长度应在2~10位之间", trigger: "blur" },
  ],
});

//删除
const delById = async (id) => {
  ElMessageBox.confirm(
    '确认删除吗？',
    '提示',
    { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
  )
    .then(async () => {//确认时点击触发
      const result = await deleteByIdApi(id);
      if (result.code == 1) {
        ElMessage.success("删除成功");
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {//取消时点击触发
      ElMessage.info("您已取消删除")
    })
}

</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type="primary" @click="addDept">+ 新增部门</el-button>
  </div>

  //表格
  <div class="container">
    <el-table :data="deptList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100" align="center" />
      <el-table-column prop="name" label="部门名称" width="260" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)"><el-icon>
              <EditPen />
            </el-icon>编辑</el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)"><el-icon>
              <Delete />
            </el-icon>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" label-width="80px" prop="name">
        <el-input v-model="dept.name" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  margin: 10px 0px;
}
</style>
