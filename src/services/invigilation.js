import { stringify } from 'qs';
import request from '@/utils/request';

/**
 * UEXAM-704：查看校区-考点考场场次
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 */
export async function getCampusPlaceInfos(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/place-date-batch-room?${urlParams}`);
}

/**
 * UEXAM-704-1：查看日期考点是否安排教师
 * @param {string} taskId - 任务ID
 * @param {string} examPlaceId - 考点ID
 */
export async function getExamDateList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/exam-date-place?${urlParams}`);
}

/**
 * UEXAM-705：根据考点时间查询考场场次统计
 * @param {string} taskId - 任务ID
 * @param {string} campusId - 校区ID
 * @param {string} examPlaceId - 考点ID
 * @param {Date} examData - 考点ID
 */
export async function getRoomBatchStatis(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/statistics-by-place-date?${urlParams}`);
}

/**
 * UEXAM-304：安排学校监考老师
 * @param {Array} params - subTaskId、teacherId 关联数组
 */
export async function submitInvigilations(params) {
  return request(`/api/uexam/invigilate/teacher-strategy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * UEXAM-305：取消监考老师-批量
 * @param {Array} params - subTaskId
 */
export async function cancelInvigilations(params) {
  return request(`/api/uexam/invigilate/teacher-cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * UEXAM-306：设置主监考老师
 * @param {Array} params - {"subTaskId": "string","teacherId": "string","teacherName": "string"}
 */
export async function submitMasters(params) {
  return request(`/api/uexam/invigilate/teacher-master`, {
    method: 'POST',
    body: params,
  });
}

/**
 * UEXAM-301：查看某学校考场监考情况
 * @param {string} taskId - 任务ID
 * @param {Date} campusId - 校区ID
 */
export async function getCampusInvigilations(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/invigilate/campus-invigilation?${urlParams}`);
}

/**
 * UEXAM-303：完成监考编排
 * @param {string} taskId - 任务ID
 * @param {Date} examData - 考点ID
 */
export async function finishCampusInvigilation(params) {
  return request(`/api/uexam/invigilate/strategy-finish`, {
    method: 'PUT',
    body: params,
  });
}
