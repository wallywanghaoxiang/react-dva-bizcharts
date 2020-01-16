import request from '@/utils/request';
import { stringify } from 'qs';

/* * 报名 api * */

/**
 * UEXAM-004：报名结果-按学校分组
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getRegistrationInfo(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/sign-up-result?${urlParams}`);
}

/**
 * UEXAM-005：按学校查询报名结果
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getRegistrationResult(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/sign-up-result-detail?${urlParams}`);
}

/**
 * UEXAM-006：完成报名
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function finishRegistration(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/complete-sign-up?${urlParams}`, {
    method: 'PUT'
  });
}

/**
 * UEXAM-007：【结果】报名结果-按学生分组—分页搜索
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 * @param {string} filterWord - 搜索关键字
 * @param {number} pageIndex
 * @param {number} pageSize
 */
export async function searchRegistrationResult(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/sign-up-result/page?${urlParams}`);
}

/**
 * UEXAM-008：导入名单-校区名单-跨服务
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getCampusInfoList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/campus-service-student-num?${urlParams}`);
}

/**
 * UEXAM-009：导入名单-学生名单-跨服务
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getStudentInfoList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/campus-service-student-List?${urlParams}`);
}

/**
 * UEXAM-010：导入名单
 * @param {Array} studentList - 学生列表
 * @param {string} campusId - 校区ID
 */
export async function submitStudentList(params) {
  return request(`/api/uexam/task/import-campus-student?campusId=${params.campusId}`, {
    method: 'POST',
    body: params.studentList
  });
}

/**
 * UEXAM-011：清空名单
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 * @param {string} classId - 班级ID(选填),不填代表清空所有学生名单
 */
export async function clearStudentList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/class-student?${urlParams}`, {
    method: 'DELETE'
  });
}

/**
 * UEXAM-012：一键生成考号
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function generateExamNo(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/generate-exam-num?${urlParams}`);
}

/**
 * UEXAM-013：删除学生
 * @param {string} taskId - 任务ID
 * @param {string} studentId - 学生ID
 */
export async function removeStudent(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task-student?${urlParams}`, {
    method: 'DELETE'
  });
}

/**
 * UEXAM-014：报名统计-详情
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getRegistrationCount(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/campus-student-num?${urlParams}`);
}

// /**
//  * UEXAM-015：单次任务详情
//  * @param {string} taskId - 任务ID
//  */
// export async function getTaskInfo(params) {
//   const urlParams = stringify(params);
//   return request(`/api/uexam/task/task-detail?${urlParams}`);
// }
