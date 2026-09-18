<script setup>
import { ref, watch, onMounted } from 'vue';
import { queryPageApi } from '../../api/emp';


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

//职位映射:1 班主任 2 讲师 3 学工主管 4 教研主管 5 咨询师
const jobMap = {
    1: "班主任",
    2: "讲师",
    3: "学工主管",
    4: "教研主管",
    5: "咨询师",
}

//分页
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页展示条数
const background = ref(true); // 页码按钮是否显示背景色
const total = ref(0);

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
    if (newVal.length == 2) {
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
        search();
    }
)
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
                    <el-option label="男" value="1" />
                    <el-option label="女" value="2" />
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
        <el-button type="primary" @click="">+ 新增员工</el-button>
        <el-button type="danger" @click="">- 批量删除</el-button>
    </div>

    <!-- 员工列表数据表格 -->
    <div class="container">
        <el-table :data="empList" border style="width: 100%">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="username" label="用户名" width="120" align="center" />
            <el-table-column prop="name" label="姓名" width="120" align="center" />
            <el-table-column prop="gender" label="性别" width="80" align="center">
                <template #default="scope">
                    {{ scope.row.gender === 1 ? "男" : "女" }}
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
                    <el-button type="danger" size="small" @click="delById(scope.row.id)"><el-icon>
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
</template>

<style scoped>
.container {
    margin: 10px 0;
}
</style>
