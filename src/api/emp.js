import request from "../utils/request";

//查询员工列表数据
export const queryPageApi = (name, gender, begin, end, page, pageSize) => {
    return request.get(`/emps?name=${name}&gender=${gender}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`);
};

//新增部门
export const addApi = (dept) => {
    return request.post("/depts", dept);
};

//根据ID查询
export const querybyIdApi = (id) => {
    return request.get(`/depts/${id}`);
};

//修改
export const updateApi = (dept) => request.put("/depts", dept);

//删除
export const deleteByIdApi = (id) => {
    return request.delete(`/depts?id=${id}`);
};