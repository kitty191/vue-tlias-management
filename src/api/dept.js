import request from "../utils/request";

//查询全部部门信息
export const queryAllApi = () => {
  return request.get("/depts");
};

//新增部门
export const addApi = (dept) => {
  return request.post("/depts", dept);
};
