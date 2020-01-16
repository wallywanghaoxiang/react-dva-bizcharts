import request from '@/utils/request';
import { stringify } from 'qs';

/* * 统考 api * */

/**
 * UEXAM-701：统考首页-任务列表—分页
 * @param {string} teacherId - 教师ID
 * @param {string} CampusId - 校区ID
 * @param {string} filterWord - 关键字过滤-不填为全部返回
 * @param {number} pageIndex - 页码
 * @param {number} pageSize - 每页显示数
 */
export async function getTaskList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/task-list-campusId/page?${urlParams}`);
}

/**
 * UEXAM-015：单次任务详情
 * @param {string} taskId - 任务ID
 */
export async function getTaskDetail(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/task-detail?${urlParams}`);
}

/* *  考务明细 * */
//! 接口变更 UEXAM-109 => UEXAM-113
// /**
//  * UEXAM-109：学生编排-学生列表-分页
//  * @param {string} taskId - 任务ID
//  * @param {string} campusId - 校区ID
//  */
// export async function getStudentList(params) {
//   const { taskId, campusId, pageIndex, pageSize } = params;
//   return request(
//     `/api/uexam/exam-place/exam-arrange-student-list/${taskId}/${campusId}?pageIndex=${pageIndex}&pageSize=${pageSize}`
//   );
// }

/**
 * UEXAM-113：学生编排-学生列表-分页
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区IDclassIds
 * @param {string} classIds - 任课班级ID集合（非学科管理员必填）
 */
export async function getStudentList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/exam-place/exam-arrange-student-list?${urlParams}`);
}

/**
 * UEXAM-109-1：准考证信息
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 * @param {string} classId - 班级ID（可选）
 * @param {string} stuNameKey - 筛选关键字（姓名/考号）
 */
export async function getAdmissionTickets(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/exam-place/admission-ticket?${urlParams}`);
}

/* *  批次信息 * */
/**
 * TSMK-903：学校场次监控
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 * @param {string} teacherId - 教师ID（非学科管理员提供）
 */
export async function getBatchInfos(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/tasks/campus-monitor?${urlParams}`);
}

/**
 * TSMK-906：结束未开始场次
 * @param {string} ueTaskId - 任务ID
 */
export async function finishUnstartBatches(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/tasks/finish-subTask?${urlParams}`, {
    method: 'PUT',
  });
}
