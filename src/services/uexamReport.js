import { stringify } from 'qs';
import request from '@/utils/request';

/* * 统考报告 api * */
/**
 * REPORT-109：查看群体统计
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 */
export async function getExamNum(params) {
  const urlParams = stringify(params, { arrayFormat: 'repeat' });
  return request(`/api/report/student-score/group-statis?${urlParams}`);
}

// UEXAM-015：单次任务详情
export async function getUexamTaskInfo(params) {
  const urlParams = stringify(params);
  return request(`/api/uexam/task/task-detail?${urlParams}`);
}

/**
 * REPORT-201：统考报告-考务情况总览
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} classIds - 班级ID集合 （CLASS report 必填）
 */
export async function getTaskInfo(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/summary?${urlParams}`);
}

/**
 * REPORT-202：统考报告-考务明细
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 */
export async function getExamDetail(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/details?${urlParams}`);
}

/**
 * REPORT-203：统考报告-缺考补考作弊等名单-分页
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} classId - 班级ID(必填) FULL代表全校名单
 * @param {string} type - 缺考、补考、补报名、作弊类型
 */
export async function getStudentList(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/students?${urlParams}`);
}

/**
 * 7.6.6	REPORT-206：统考报告-学生成绩单—分页
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} paperId  试卷ID
 * @param {string} classIds - 班级ID集合 （CLASS report 必填）
 */
export async function getExamStudentScore(params) {
  const urlParams = stringify(params);
  return request(`/api/report/uexam-student-scores?${urlParams}`);
}

/**
 * REPORT-204：统考报告-考试情况总览
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} paperId - 试卷ID （FULL代表不限）
 * @param {string} classIds - 班级ID集合 （CLASS report 必填）
 */
export async function getExamOverview(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/exam/summary?${urlParams}`);
}

/**
 * REPORT-204-1：统考报告-考试情况总览-班级得分分布
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} paperId - 试卷ID （FULL代表不限）
 * @param {string} classId - 班级ID （FULL代表不限）
 */
export async function getClassScoreStatis(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/exam/clazz-summary?${urlParams}`);
}

/**
 * REPORT-205：统考报告-学情分析
 * @param {string} taskId - 任务ID(必填)
 * @param {string} campusId - 校区ID(必填) FULL代表统考报告
 * @param {string} paperId - 试卷ID （FULL代表不限）
 * @param {string} classIds - 班级ID集合 （CLASS report 必填）
 */
export async function getExamAnalysis(params) {
  const urlParams = stringify(params);
  return request(`/api/report/ue/task/exam/details?${urlParams}`);
}

/**
 * 获取教师报告试卷快照 report-013
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getPaperSapshot(params) {
  return request(`/api/report/report/paper-snapshot/${params.taskId}/${params.paperId}`);
  // return request(`/api/report/report/paper-snapshot`);
}

/**
 * REPORT-207：统考报告-答案详情
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 */
export async function getTeacherSubquestion(params) {
  return request(
    `/api/report/uexam-paper-subquestion?taskId=${params.taskId}&campusId=${params.campusId}&paperId=${params.paperId}&classId=${params.classId}`
  );
  // return request(`/api/report/uexam-paper-subquestion`)
}

/**
 * /question-pattern/question-edit-render-meta
 *  获取试卷展示渲染元数据 content 010 任务报告
 */
export async function fetchPaperShowData(params) {
  return request(`/api/tsmk/report/question-edit-render-meta?idList=${params.idList}`);
  // return request('/api/tsmk/report/question-edit-render-meta');
}
