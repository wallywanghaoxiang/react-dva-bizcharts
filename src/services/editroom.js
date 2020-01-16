import request from '@/utils/request';
import { stringify } from 'qs';

function urlEncode(param, key, encode) {
  if (param == null) return '';
  let paramStr = '';
  const t = typeof param;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += `&${key}=${encode == null || encode ? encodeURIComponent(param) : param}`;
  } else {
    Object.keys(param).forEach(i => {
      const k = key == null ? i : key + (param instanceof Array ? `[${i}]` : `.${i}`);
      paramStr += urlEncode(param[i], k, encode);
    });
  }
  return paramStr;
}
/**
 * UEXAM-101：查询任务学校策略
 * @param {string} taskId - 任务ID
 */
export async function getExamStrategy(params) {
  return request(`/api/uexam/examStrategy/campus-strategy/${params.taskId}`);
}

/**
 * UEXAM-102：查询所有策略
 * @param {string} orgId - 组织者Id
 */
export async function getAllStrategy(params) {
  return request(`/api/uexam/examStrategy/all-strategy/${params.orgId}`);
}

/**
 * UEXAM-103：新增策略
 * @param {string} params -新增内容
 *
 */
export async function addStrategy(params) {
  return request('/api/uexam/examStrategy/add-strategy', {
    method: 'POST',
    body: params.data,
  });
}

/**
 * UEXAM-104：设为默认
 *
 */
export async function updateStrategy(params) {
  return request(`/api/uexam/examStrategy/update-strategy`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * UEXAM-105：绑定策略
 * {taskId}/{campusId/FULL}/{strategyId}
 *
 */
export async function bindStrategy(params) {
  return request(
    `/api/uexam/examStrategy/bind-strategy/${params.taskId}/${params.campusId}/${params.strategyId}`,
    {
      method: 'PUT',
    }
  );
}

/**
 * UEXAM-107：编排结果-详情
 * @param {string} taskId
 */
export async function getExamStatistics(params) {
  const url = urlEncode(params);
  return request(`/api/uexam/exam-place/exam-arrange-statistics?${url.slice(1)}`);
}

/**
 * UEXAM-108：学生编排-学校列表
 * @param {string} taskId
 */
export async function getExamCampus(params) {
  const url = urlEncode(params);
  return request(`/api/uexam/exam-place/exam-arrange-campus?${url.slice(1)}`);
}

/**
 * UEXAM-109：学生编排-学生列表
 *
 */
export async function getStudentList(params) {
  return request(
    `/api/uexam/exam-place/exam-arrange-student-list/${params.taskId}/${params.campusId}?pageSize=9999&pageIndex=1`
  );
}

/**
 * UEXAM-112：取消编排
 *
 * studentIdList[]
 * taskId
 *
 */
export async function examArrangeDeleted(params) {
  return request('/api/uexam/exam-place/exam-arrange-deleted', {
    method: 'POST',
    body: params,
  });
}

/**
 * UEXAM-113：学生编排-搜索学生结果，分页
 *
 */
export async function getSearchStudentList(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/exam-place/exam-arrange-student-list?${urlParams}`);
}

/**
 * UEXAM-114：完成编排
 * campusId  FULL表示所有学校
 */
export async function examArrangeCompleted(params) {
  return request(
    `/api/uexam/exam-place/exam-arrange-completed/${params.taskId}/${params.campusId}`,
    {
      method: 'PUT',
    }
  );
}

/**
 * UEXAM-116：重新编排
 * campusId  FULL表示所有学校
 */
export async function examArrangeRedo(params) {
  return request(`/api/uexam/exam-place/exam-arrange-deleted/${params.taskId}/${params.campusId}`, {
    method: 'PUT',
  });
}

/**
 * GET /task/place-date-batch-room   UEXAM-704：查看校区-考点考场场次
 */
export async function getBatchRoom(params) {
  return request(
    `/api/uexam/task/place-date-batch-room?taskId=${params.taskId}&campusId=${params.campusId}`
  );
}

/**
 * /task/batch-by-place-date UEXAM-706：根据考点时间查询批次考场统计
 */
export async function getBatchByPlace(params) {
  return request(
    `/api/uexam/task/batch-by-place-date?taskId=${params.taskId}&campusId=${params.campusId}&examPlaceId=${params.examPlaceId}&examDate=${params.examDate}`
  );
}

/**
 * /exam-place/exam-arrange-once  UEXAM-110：一键编排
 * @param {string} id -
 */
export async function examArrangeOnce(params) {
  return request('/api/uexam/exam-place/exam-arrange-once', {
    method: 'POST',
    body: params,
  });
}

/**
 * //exam-place/exam-arrange-by-hand  UEXAM-111：手动编排
 * @param {string} id -
 */
export async function examArrangeHand(params) {
  return request('/api/uexam/exam-place/exam-arrange-by-hand', {
    method: 'POST',
    body: params,
  });
}

/**
 * /task/leftNum-by-examDate  UEXAM-707：根据考点查询时间及数量
 */
export async function getBatchExamDate(params) {
  return request(
    `/api/uexam/task/leftNum-by-examDate?campusId=${params.campusId}&taskId=${params.taskId}&examPlaceId=${params.examPlaceId}`
  );
}
