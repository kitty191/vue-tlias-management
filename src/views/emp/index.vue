<script setup>
import { ref, watch, onMounted } from 'vue';
import { queryPageApi, addApi, queryInfoApi, updateApi, deleteApi } from '../../api/emp';
import { queryAllApi as queryAllDeptApi } from '../../api/dept';
import { ElMessage, ElMessageBox } from 'element-plus';

//员工列表数据
const empList = ref([
    {
        id: 1,
        username: "jinyong",
        name: "金庸",
        gender: 1,
        image: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
        job: 2,
        salary: 8000,
        entryDate: "2015-01-01",
        deptId: 2,
        deptName: "教研部",
        createTime: "2022-09-01T23:06:30",
        updateTime: "2022-09-02T00:29:04"
    }
])

let searchEmp = ref({
    name: '',
    gender: '',
    date: [],
    begin: '',
    end: ''
})

//职位映射:1 班主任 2 讲师 3 学工主管 4 教研主管 5 咨询师 6 其他
const jobMap = {
    1: "班主任",
    2: "讲师",
    3: "学工主管",
    4: "教研主管",
    5: "咨询师",
    6: "其他",
}

//性别映射:1 男 2 女
const gender = {
    1: "男",
    2: "女",
}

//部门列表数据
const depts = ref([]);

//分页
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页展示条数
const background = ref(true); // 页码按钮是否显示背景色
const total = ref(0);
const dialogVisible = ref(false)// 控制弹窗
const dialogTitle = ref('新增员工')

// 新增员工
const addEmp = () => {
    dialogVisible.value = true;
    dialogTitle.value = '新增员工';
    if (empFormRef.value) {
        empFormRef.value.resetFields();
    }
    //用空模板兜底,确保新增时是一张干净的表单
    employee.value = initEmployee();
}

//每页条数改变时触发(参数 val 是新的每页条数)
const handleSizeChange = (val) => {
    search();
}
//当前页码改变时触发(参数 val 是新的页码)
const handleCurrentChange = (val) => {
    search();
}

//侦听searchEmp的date属性
watch(() => { return searchEmp.value.date }, (newVal) => {
    if (newVal && newVal.length == 2) {
        searchEmp.value.begin = newVal[0];
        searchEmp.value.end = newVal[1];
    } else {
        searchEmp.value.begin = '';
        searchEmp.value.end = '';
    }
})

//查询员工列表
const search = async () => {
    const result = await queryPageApi(
        searchEmp.value.name,
        searchEmp.value.gender,
        searchEmp.value.begin,
        searchEmp.value.end,
        currentPage.value,
        pageSize.value
    );
    if (result.code == 1) {
        empList.value = result.data.rows;
        total.value = result.data.total;
    }
}
//清空
const clear = () => {
    searchEmp.value = {
        name: '',
        gender: '',
        date: [],
        begin: '',
        end: ''
    };
    currentPage.value = 1;
    search();
}

//钩子函数
onMounted(
    () => {
        search();//查询员工列表数据
        queryAllDepts();//查询部门列表数据
    }
)

//查询所有部门数据
const queryAllDepts = async () => {
    const result = await queryAllDeptApi();
    if (result.code == 1) {
        depts.value = result.data;
    }
}

//新建/修改表单的初始值
const initEmployee = () => ({
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: []
});

//新增/修改表单
const employee = ref(initEmployee());

//关闭弹窗时清空表单数据
const resetEmployee = () => {
    employee.value = initEmployee();
}

//表单引用(提交前校验用)
const empFormRef = ref();


//文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
    employee.value.image = response.data;
}
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('只支持上传图片')
        return false
    } else if (rawFile.size / 1024 / 1024 > 10) {
        ElMessage.error('只能上传10M以内图片')
        return false
    }
    return true
}

//添加工作经历
const addExprItem = () => {
    employee.value.exprList.push({
        company: '',
        job: '',
        begin: '',
        end: '',
        exprList: [] //日期范围,选择后由 watch 拆到 begin 和 end
    });
}

//删除工作经历
const delExprItem = (index) => {
    employee.value.exprList.splice(index, 1);
}

//侦听工作经历中的时间变化,把日期范围拆到 begin 和 end
watch(() => { return employee.value.exprList }, () => {
    //exprList 不存在时直接返回(如接口回显的数据没有该字段)
    if (!employee.value.exprList) return;
    employee.value.exprList.forEach((expr) => {
        if (expr.exprList && expr.exprList.length == 2) {
            expr.begin = expr.exprList[0];
            expr.end = expr.exprList[1];
        } else {
            expr.begin = '';
            expr.end = '';
        }
    });
}, { deep: true })


//保存员工信息
const save = async () => {
    //表单校验,通过后再提交
    empFormRef.value.validate(async (valid) => {
        if (valid) {

            let result;
            if (employee.value.id) {//修改操作
                result = await updateApi(employee.value);
            } else {//新增操作
                result = await addApi(employee.value);
            }
            if (result.code == 1) {
                ElMessage.success("操作成功");
                dialogVisible.value = false;
                search();
            } else {
                ElMessage.error(result.msg);
            }
        } else {
            ElMessage.error("表单校验不通过");
        }
    });
}

//表单校验规则
const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' },
        { pattern: /^[a-zA-Z]+$/, message: '用户名只能为字母', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]+$/, message: '姓名只能为汉字', trigger: 'blur' }
    ],
    gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
    ],
    salary: [
        { pattern: /^\d+(\.\d+)?$/, message: '薪资必须为数字', trigger: 'blur' }
    ]
});

//编辑员工信息
const edit = async (id) => {
    const result = await queryInfoApi(id);
    if (result.code == 1) {
        dialogVisible.value = true;
        dialogTitle.value = '编辑员工';
        //先重置表单(清掉上一次的残留数据与校验红字),再回显接口数据
        if (empFormRef.value) {
            empFormRef.value.resetFields();
        }
        employee.value = result.data;
        //工作经历:把 begin/end 还原成日期组件使用的数组,否则会被 watch 当成"空日期"清掉
        if (employee.value.exprList) {
            employee.value.exprList.forEach((expr) => {
                if (expr.begin && expr.end) {
                    expr.exprList = [expr.begin, expr.end];
                }
            });
        }
    }
}

//删除员工
const deleteById = async (id) => {
    ElMessageBox.confirm('确认删除该员工吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        //确认:调用删除接口
        const result = await deleteApi(id);
        if (result.code == 1) {
            ElMessage.success("删除成功");
            search();
        } else {
            ElMessage.error(result.msg);
        }
    }).catch(() => {
        //取消删除
        ElMessage.info("您已取消删除");
    });
}

//记录勾选员工的ID
const selectedIds = ref([]);
</script>

<template>
    <h1>员工管理</h1>

    <!-- 搜索栏 -->
    <div class="container">
        <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
            <el-form-item label="姓名">
                <el-input v-model="searchEmp.name" placeholder="请输入员工姓名" clearable />
            </el-form-item>

            <el-form-item label="性别">
                <el-select v-model="searchEmp.gender" placeholder="请选择">
                    <el-option v-for="(name, value) in gender" :key="value" :label="name" :value="Number(value)" />
                </el-select>
            </el-form-item>

            <el-form-item label="入职时间">
                <el-date-picker v-model="searchEmp.date" type="daterange" range-separator="到" start-placeholder="开始日期"
                    end-placeholder="结束日期" value-format="YYYY-MM-DD" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="search">查询</el-button>
                <el-button type="info" @click="clear">清空</el-button>
            </el-form-item>
        </el-form>
    </div>

    <!-- 功能按钮 -->
    <div class="container">
        <el-button type="primary" @click="addEmp">+ 新增员工</el-button>
        <el-button type="danger" @click="">- 批量删除</el-button>
    </div>

    <!-- 员工列表数据表格 -->
    <div class="container">
        <el-table :data="empList" border style="width: 100%"
            @selection-change="(selection) => { selectedIds = selection.map(item => item.id) }">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="username" label="用户名" width="120" align="center" />
            <el-table-column prop="name" label="姓名" width="120" align="center" />
            <el-table-column prop="gender" label="性别" width="80" align="center">
                <template #default="scope">
                    {{ gender[scope.row.gender] }}
                </template>
            </el-table-column>
            <el-table-column prop="image" label="头像" width="120" align="center">
                <template #default="scope">
                    <el-image style="width: 40px; height: 40px" :src="scope.row.image" fit="cover" />
                </template>
            </el-table-column>
            <el-table-column prop="deptName" label="部门名称" width="140" align="center" />
            <el-table-column prop="job" label="职位" width="120" align="center">
                <template #default="scope">
                    {{ jobMap[scope.row.job] || "其他" }}
                </template>
            </el-table-column>
            <el-table-column prop="entryDate" label="入职日期" width="140" align="center" />
            <el-table-column prop="updateTime" label="最后操作时间" width="180" align="center" />
            <el-table-column label="操作" ,width="140">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="edit(scope.row.id)"><el-icon>
                            <EditPen />
                        </el-icon>编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteById(scope.row.id)"><el-icon>
                            <Delete />
                        </el-icon>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>

    <!-- 表格下方分页条 -->
    <div class="container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 30, 40, 50, 75, 100]" :background="background"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
    </div>

    <!-- 新增/修改员工对话框 -->
    <!-- ...... 省略 ...... -->

    <!-- 新增/修改员工的对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" @close="resetEmployee">
        <el-form :model="employee" label-width="80px" :rules="rules" ref="empFormRef">
            <!-- 基本信息 -->
            <!-- 第一行 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第二行 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="性别" prop="gender">
                        <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
                            <el-option v-for="(name, value) in gender" :key="value" :label="name"
                                :value="Number(value)" />
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第三行 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="职位">
                        <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
                            <el-option v-for="(name, value) in jobMap" :key="value" :label="name"
                                :value="Number(value)" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="薪资" prop="salary">
                        <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第四行 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="所属部门">
                        <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
                            <el-option v-for="d in depts" :key="d.id" :label="d.name" :value="d.id"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="入职日期">
                        <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第五行 -->
            <el-row :gutter="20">
                <el-col :span="24">
                    <el-form-item label="头像">
                        <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false"
                            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                            <img v-if="employee.image" :src="employee.image" class="avatar" />
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </el-form-item>
                </el-col>
            </el-row>


            <!-- 工作经历 -->
            <!-- 第六行 -->
            <el-row :gutter="10">
                <el-col :span="24">
                    <el-form-item label="工作经历">
                        <el-button type="success" size="small" @click="addExprItem">+ 添加工作经历</el-button>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第七行 ...  工作经历 -->
            <el-row :gutter="3" v-for="(expr, index) in employee.exprList">
                <el-col :span="10">
                    <el-form-item size="small" label="时间" label-width="80px">
                        <el-date-picker v-model="expr.exprList" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"></el-date-picker>
                    </el-form-item>
                </el-col>

                <el-col :span="6">
                    <el-form-item size="small" label="公司" label-width="60px">
                        <el-input v-model="expr.company" placeholder="请输入公司名称"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="6">
                    <el-form-item size="small" label="职位" label-width="60px">
                        <el-input v-model="expr.job" placeholder="请输入职位"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="2">
                    <el-form-item size="small" label-width="0px">
                        <el-button type="danger" @click="delExprItem(index)">- 删除</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 底部按钮 -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="save">保存</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.container {
    margin: 10px 0;
}

.avatar {
    height: 40px;
}

.avatar-uploader .avatar {
    width: 78px;
    height: 78px;
    display: block;
}

.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 78px;
    height: 78px;
    text-align: center;
    border-radius: 10px;
    /* 添加灰色的虚线边框 */
    border: 1px dashed var(--el-border-color);
}
</style>
