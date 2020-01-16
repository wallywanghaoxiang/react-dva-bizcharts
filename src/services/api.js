/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { stringify } from 'qs';
import request from '@/utils/request';

function urlEncode(param, key, encode) {
  if (param == null) return '';
  let paramStr = '';
  const t = typeof param;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += `&${key}=${encode == null || encode ? encodeURIComponent(param) : param}`;
  } else {
    for (const i in param) {
      const k = key == null ? i : key + (param instanceof Array ? `[${i}]` : `.${i}`);
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
}
export async function queryProjectNotice() {
  return request('/api/project/notice');
}
export async function queryNotices() {
  return request('/api/notices');
}
export async function queryActivities() {
  return request('/api/activities');
}

/* ============首页  start=========== */

// CAMPUS-110：查询校区统计信息
export async function getStatistics(params) {
  const url = urlEncode(params);
  return request(`/api/campus/campus/statistics?${url.slice(1)}`);
}

// CAMPUS-111：查询所有退学申请
export async function getQuitStudent() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/campus/student-quit-record/${campusId}`);
}

// CAMPUS-003：获取已绑定教师信息
export async function getTeacherInfoList(params) {
  return request(`/api/campus/teacher/apply/list/${params.accountId}`);
}

// CAMPUS-113：处理退学申请
export async function handleQuitApply(params) {
  return request(`/api/campus/student-quit-record`, {
    method: 'PUT',
    body: params,
  });
}

// 查询教师任教班级异动提醒
export async function getTeacherClassSwap(params) {
  const { teacherId } = params;
  return request(`/api/campus/natural-class/config/select-teacher-swap/${teacherId}`);
}

/* ============首页  end=========== */

// 根据手机号获取受邀请而未绑定的校区
export async function getUnBindCampus(params) {
  return request(`/api/campus/teacher/apply/${params.mobile}`);
}

// 同意邀请加入校区
export async function addCamplus(params) {
  return request(`/api/campus/teacher/apply`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 	CLASS-312根据账号ID获取对应的校区列表
 */
export async function queryCampusList(params) {
  return request(`/api/campus/teacher/apply/list/${params.accountId}`);
}

/**
 * CLASS-313: 老师切换当前校区
 */
export async function switchCampus(params) {
  return request(`/api/campus/teacher/apply/default/${params}`, {
    method: 'PUT',
    body: params,
  });
}

// 退出登录
export async function userLogout() {
  return request('/api/uaa/logout');
}

// 用户登录
export async function fakeAccountLogin(params) {
  return request('/api/uaa/authentication', {
    method: 'POST',
    body: process.env.NODE_ENV === 'production' ? params : { ...params, client: 'proxy' },
  });
}
// 根据用户身份，获取角色信息
export async function getUserDetail(params) {
  if (params && params.campusId) {
    return request(`/api/classes/user-details?campusId=${params.campusId}`);
  }
  return request('/api/classes/user-details');
}

// 用户注册
export async function fakeRegister(params) {
  return request('/api/uaa/security/account', {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取手机验证码
 *
 * @author tina.zhang
 * @date 2019-03-08
 * @export
 */
export async function getValidateCode(params) {
  return request('/api/uaa/security/sms/validate-code', {
    method: 'POST',
    body: params.telephone,
  });
}

// 绑定加入校区
export async function userJoinCampus(params) {
  return request(`/api/campus/teacher/apply`, {
    method: 'PUT',
    body: params,
  });
}
// 检测手机号是否重复
export async function checkMobileExist(params) {
  return request(`/api/campus/teacher/checkMobileExist`, {
    method: 'POST',
    body: params,
  });
}
// 重置密码
export async function userVerifyPassword(params) {
  return request('/api/uaa/security/account/password/verify', {
    method: 'PUT',
    body: params,
  });
}

// 批量导入老师
export async function batchImportTeachers(params) {
  return request('/api/campus/teacher/import', {
    method: 'POST',
    body: params,
  });
}
// 编辑老师
export async function editTeacher(params) {
  return request('/api/campus/teacher/edit', {
    method: 'PUT',
    body: params,
  });
}
// 删除老师
export async function deleteTeacher(params) {
  const url = urlEncode(params);
  return request(`/api/campus/teacher/delete?${url.slice(1)}`, {
    method: 'PUT',
  });
}
// 停用、开启教师
export async function changeStatus(params) {
  return request('/api/campus/teacher/changeStatus', {
    method: 'PUT',
    body: params,
  });
}

/**
 * @Author    tina
 * @DateTime  2019-03-14
 * @copyright GET /resources/account/{id}AUTH-003：根据用户信息获得资源
 * @param     {[type]}    params [description]
 */
export async function getMyMenus() {
  const uid = localStorage.getItem('uid');
  const tenantId = localStorage.getItem('tenantId');
  // console.log(tenantId)
  if (tenantId !== '' && tenantId !== 'undefined' && tenantId !== null) {
    return request(`/api/uaa/resources/menu/${uid}/${tenantId}`);
  }
  return request(`/api/uaa/resources/menu/${uid}`);
}

export async function fetchTeacherList(params) {
  const campusId = localStorage.getItem('campusId');
  return request(
    `/api/campus/teacher/teachersAndCount?campusId=${campusId}&filterWord=${params.filterWord}`
  );
}
// 试卷包列表
export async function fetchPaperPackageList(params) {
  const campusId = localStorage.getItem('campusId');
  return request(
    `/api/paper/campus-package/page?campusId=${campusId}&filterWord=${params.filterWord}&pageSize=${params.pageSize}&pageIndex=${params.pageIndex}`
  );
}

// 添加试卷包
export async function addPaperPackageInfo(params) {
  return request('/api/paper/campus-package', {
    method: 'POST',
    body: params,
  });
}

// 统计试卷包信息
export async function CountPaperPackageList() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/paper/campus-package/count?campusId=${campusId}`);
}

// 查询试卷包详情
export async function PaperPackageDetailList(params) {
  return request(
    `/api/paper/campus-paper/page?campusPackageId=${params.campusPackageId}&grade=${params.grade}&pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`
  );
}

// 查询试卷包包含的年级
export async function PaperPackageGrade(params) {
  return request(`/api/paper/campus-paper/grade?campusPaperPackageId=${params.campusPackageId}`);
}
// 切换试卷是否保密开放
export async function ChangeStatusPaper(params) {
  return request(
    `/api/paper/campus-paper/change-status?campusPaperId=${params.campusPaperId}&status=${params.status}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 查看校区信息
 *
 * @author tina.zhang
 * @date 2019-03-27
 * @export
 * @returns
 */
export async function getCampusConfigInfo() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/campus/campus/config/info/${campusId}`);
}

/**
 * 修改校区信息
 *
 * @author tina.zhang
 * @date 2019-03-27
 * @export
 * @returns
 */
export async function updateCampusInfo(params) {
  return request('/api/campus/campus/config/info/update', {
    method: 'PUT',
    body: params,
  });
}

/**
 * 修改班级名称格式
 *
 * @author tina.zhang
 * @date 2019-03-27
 * @export
 * @returns
 */
export async function updateEduPhase(params) {
  return request('/api/campus/campus/config/eduPhase/update', {
    method: 'PUT',
    body: params,
  });
}

/**
 * 文件上传获取权限
 *
 * @author tina.zhang
 * @date 2019-02-19
 * @export
 * @returns
 */
export async function getOSSAuth(params) {
  const url = urlEncode(params);
  return request(`/api/file/file/oss/authorization?${url.slice(1)}`);
}

/**
 * 获取头像oss授权
 *
 * @author tina.zhang
 * @date 2019-06-13
 * @export
 * @param {*} params
 */
export async function userHeaderImgOSSAuth(params) {
  const url = urlEncode(params);
  return request(`/api/file/file/oss/head-img/authorization?${url.slice(1)}`);
}

/*
  GET /file/{fileId}
  获取源文件下载地址
 */
export async function fetchPaperFileUrl(params) {
  return request(`/api/file/file/${params.fileId}`);
}

/*
  GET /file/audio/{tokenId}
  获取源音频地址
 */
export async function fetchAudioFileUrl(params) {
  return request(`/api/file/file/audio/${params.tokenId}`);
}

// 获取头像api
export async function getUserAvatar(params) {
  return request(`/api/file/file/head-img/${params.fileId}`);
  // return request(`/api/file/file/${params.fileId}`);
}

// 查询所有校区管理员
export async function getAllCampusManager() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/campus/campus/config/admin/${campusId}`);
}

// 校区学科
export async function getAllSubject() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/campus/natural-class/config/allSubject/${campusId}`);
}

// CAMPUS-204 输入教师姓名分页搜索
export async function getTeacherList(params) {
  const url = urlEncode(params);
  return request(`/api/campus/natural-class/config/teacher-list?${url.slice(1)}`);
}

// CAMPUS-204-1 输入教师姓名分页搜索（排除自己）
export async function getOtherTeacherList(params) {
  const url = urlEncode(params);
  return request(`/api/campus/natural-class/config/teacher-bind-list?${url.slice(1)}`);
}

// CAMPUS-204-2 输入教师姓名分页搜索-过滤学科管理员
export async function getSubjectTeacherList(params) {
  const url = urlEncode(params);
  return request(`/api/campus/natural-class/config/teacher-admin-list?${url.slice(1)}`);
}

// CAMPUS-204-3 输入教师姓名分页搜索--统计教学班
export async function getTeachingTeacherList(params) {
  const url = urlEncode(params);
  return request(`/api/campus/natural-class/config/teaching-list?${url.slice(1)}`);
}

// 添加校区管理员
export async function addCampusManager(params) {
  return request(`/api/campus/campus/config/admin/add`, {
    method: 'PUT',
    body: params,
  });
}

// 删除校区管理员
export async function deleteCampusManager(params) {
  const { adminId } = params;
  return request(`/api/campus/campus/config/admin/delete/${adminId}`, {
    method: 'DELETE',
    body: params,
  });
}

// 调用CAMPUS-207 查询所有年级
export async function getAllGrade() {
  const campusId = localStorage.getItem('campusId');
  return request(`/api/campus/natural-class/config/allGrade/${campusId}`);
}

// 调用CAMPUS-207 查询所有年级
export async function getAllGradeByTeacher(params) {
  const campusId = localStorage.getItem('campusId');
  const { teacherId } = params;
  return request(`/api/campus/natural-class/config/allGrade/${campusId}/${teacherId}`);
}

// 调用CAMPUS-203 查询本年级行政班和教师信息
export async function getClassByGrade(params) {
  const campusId = localStorage.getItem('campusId');
  const { gradeId } = params;
  return request(`/api/campus/natural-class/config/info/${campusId}/${gradeId}`);
}

// CAMPUS-205 指定行政班管理员
export async function bingClassManager(params) {
  return request(`/api/campus/natural-class/config/natural-classes-owner`, {
    method: 'POST',
    body: params,
  });
}

/* 班级字典 */
export async function queryClass() {
  return request(`/api/dict/data-codes?dataType=CLASS`);
}

// CAMPUS-212: 查看班级异动
export async function classSwap(params) {
  const campusId = localStorage.getItem('campusId');
  const { classType } = params;
  return request(`/api/campus/natural-class/config/select-class-swap/${campusId}/${classType}`);
}

// CAMPUS-206：解散行政班级
export async function dissolutionNaturalClass(params) {
  const { naturalClassId } = params;
  return request(`/api/campus/natural-class/config/delete/${naturalClassId}`, {
    method: 'DELETE',
    body: params,
  });
}

// CAMPUS-217 开启学生异动
export async function startClassSwap(params) {
  return request(`/api/campus/natural-class/config/classes-swap`, {
    method: 'POST',
    body: params,
  });
}

// CAMPUS-209 查询本年级教学班和教师信息
export async function getTeacheClassList(params) {
  const { campusId, gradeId, subjectId } = params;
  return request(`/api/campus/teaching-class/config/info/${campusId}/${gradeId}/${subjectId}`);
}

// CAMPUS-210 指定教学班老师
export async function bingTeachingClassManager(params) {
  return request(`/api/campus/teaching-class/config/teaching-classes-owner`, {
    method: 'POST',
    body: params,
  });
}

// CAMPUS-211：解散教学班
export async function dissolutionTeachClass(params) {
  const { teachingClassId } = params;
  return request(`/api/campus/teaching-class/config/delete/${teachingClassId}`, {
    method: 'DELETE',
    body: params,
  });
}

//  PUT /security/accountAUTH-009：更新个人信息 - 除了密码
export async function editTeacherBasic(params) {
  return request(`/api/uaa/security/account`, {
    method: 'PUT',
    body: params,
  });
}

// /teacher/changeAvatarCAMPUS-107：修改教师头像或手机号
export async function editTeacherInfo(params) {
  return request(`/api/campus/teacher/changeAvatar`, {
    method: 'PUT',
    body: params,
  });
}

//  security/account/passwordAUTH-008：修改密码
export async function editTeacherBasicPwd(params) {
  return request(`/api/uaa/security/account/password`, {
    method: 'PUT',
    body: params,
  });
}

// /security/account/check-identityAUTH-306：检查手机注册了几个身份
export async function queryMobileTeacherIdentity(params) {
  return request(`/api/uaa/security/account/check-identity?mobile=${params.mobile}`);
}

// /security/account/{id}根据主键获得用户信息
export async function getAccountId(params) {
  return request(`/api/uaa/security/account/${params.id}`);
}

//  /security/account/mobileAUTH-307：修改用户手机号
export async function getEditMobile(params) {
  return request(`/api/uaa/security/account/mobile`, {
    method: 'PUT',
    body: params,
  });
}

// /security/sms/check-validate-codeAUTH-308:验证短信验证码
export async function checkSN(params) {
  return request('/api/uaa/security/sms/check-validate-code', {
    method: 'POST',
    body: params,
  });
}

// /learning-groups/teacherCAMPUS-501：查询我的学习小组
export async function queryLearnGroup(params) {
  return request(
    `/api/campus/learning-groups/teacher?campusId=${params.campusId}&teacherId=${params.teacherId}`
  );
}

// /learning-groupsCAMPUS-303：查看我的分组
export async function queryMyLearnGroup(params) {
  return request(
    `/api/campus/learning-groups?campusId=${params.campusId}&teacherId=${params.teacherId}&naturalClassId=${params.naturalClassId}`
  );
}

// /learning-group/{id}/studentsCAMPUS-502：查询某个小组学生
export async function querySomeLearnGroupStudent(params) {
  return request(`/api/campus/learning-group/${params.id}/students`);
}

//  /learning-groupCAMPUS-504：编辑学习小组
export async function getEditLearnGroup(params) {
  return request(`/api/campus/learning-group`, {
    method: 'PUT',
    body: params,
  });
}

//  /learning-group/moveCAMPUS-506：批量重新分组
export async function getReLearnGroup(params) {
  return request(`/api/campus/learning-group/move`, {
    method: 'PUT',
    body: params,
  });
}

//  /learning-group/removeCAMPUS-507：批量取消分组
export async function getCancelLearnGroup(params) {
  return request(`/api/campus/learning-group/remove`, {
    method: 'DELETE',
    body: params,
  });
}

// /learning-groupCAMPUS-503：创建学习小组
export async function createLearnGroup(params) {
  return request('/api/campus/learning-group', {
    method: 'POST',
    body: params,
  });
}

// /learning-group/{id}CAMPUS-505：删除学习小组
export async function deleteLearnGroup(params) {
  return request(`/api/campus/learning-group/${params.id}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-28
 * Time: AM 11:13
 * Explain: 【CAMPUS-301】 查询我的班级返回我的班级
 *
 * */
export async function fetchClassList(params) {
  return request(`/api/campus/classes/${params.campusId}/${params.teacherId}`);
}
/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-01
 * Time: AM 11:13
 * Explain: 【CAMPUS-302】根据行政班ID,查询行政班信息
 *
 * */
export async function fetchNaturalClass(params) {
  return request(`/api/campus/natural-class/${params.id}/details`);
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:13
 * Explain: 【CAMPUS-303】查看我的分组
 *
 * */
export async function fetchMyGroups(params) {
  const url = urlEncode(params);
  return request(`/api/campus/learning-groups?${url.slice(1)}`);
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:32
 * Explain: 【CAMPUS-304】修改行政班信息-别名
 *
 * */
export async function updateClassAlias(params) {
  return request(`/api/campus/natural-class/alias`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:34
 * Explain: 【CAMPUS-305】批量修改学生信息
 *
 * */
export async function updateStudents(params) {
  return request(`/api/campus/students`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:37
 * Explain: 【CAMPUS-306】批量更新学生学号-行政班
 *
 * */
export async function updateClassCode(params) {
  return request(`/api/campus/students/class-code`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:39
 * Explain: 【CAMPUS-307】增加学科老师-行政班
 *
 * */
export async function addClassTeachers(params) {
  return request(`/api/campus/natural-class/teacher`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:42
 * Explain: 【CAMPUS-309】批量删除学科老师-行政班
 *
 * */
export async function delClassTeachers(params) {
  return request(`/api/campus/natural-class/teacher`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:42
 * Explain: 【CAMPUS-310】批量增加行政班学生-添加-导入
 *
 * */
export async function addClassStudents(params) {
  return request(`/api/campus/students`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:42
 * Explain: 【CAMPUS-310】批量增加行政班学生-添加-调入
 *
 * */
export async function addClassMoveStudents(params) {
  return request(`/api/campus/students/move`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:52
 * Explain: 【CAMPUS-312】批量编辑学生-标记调出
 *
 * */
export async function updateStudentsMark(params) {
  return request(`/api/campus/students/mark`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:56
 * Explain: 【CAMPUS-313】 编辑学生-申请退学
 *
 * */
export async function updateStudentsQuit(params) {
  return request(`/api/campus/student-quit-record`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:57
 * Explain: 【CAMPUS-314】 删除学生
 *
 * */
export async function delClassStudent(params) {
  return request(`/api/campus/student/${params.id}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:43
 * Explain: 【CAMPUS-315】检查学生是否重名，近期被删除
 *
 * */
export async function postDuplicateStudents(params) {
  return request(`/api/campus/duplicate-students`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 11:54
 * Explain: 【CAMPUS-316】 取消标记调出
 *
 * */
export async function updateStudentsUnmark(params) {
  return request(`/api/campus/students/unmark`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:32
 * Explain: 【CAMPUS-401】 查询我的教学班
 *
 * */
export async function getTeachingStudents(id) {
  return request(`/api/campus/teaching-class/students/${id}`);
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:44
 * Explain: 【CAMPUS-402】 修改教学班信息-别名
 *
 * */
export async function updateTeachingAlias(params) {
  return request(`/api/campus/teaching-class/alias`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:49
 * Explain: 【CAMPUS-403】 批量调入行政班学生到教学班
 *
 * */
export async function addTeachingStudent(params) {
  return request(`/api/campus/teaching-class/student`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:52
 * Explain: 【CAMPUS-404】 修改学生学号-教学班
 *
 * */
export async function updateTeachingStudentCode(params) {
  return request(`/api/campus/teaching-class/student/code`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:53
 * Explain: 【CAMPUS-405】 批量更新学生学号-教学班
 *
 * */
export async function updateTeachingStudentsCode(params) {
  return request(`/api/campus/teaching-class/students/code`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-08
 * Time: AM 12:55
 * Explain: 【CAMPUS-406】 删除学生关系-教学班
 *
 * */
export async function delTeachingStudentsCode(params) {
  return request(`/api/campus/teaching-class/student/${params.id}`, {
    method: 'DELETE',
    body: params,
  });
}

// /learning-group/studentsCAMPUS-508：批量新增学生
export async function moreGroupStudent(params) {
  return request(`/api/campus/learning-group/students`, {
    method: 'POST',
    body: params,
  });
}

// /natural-class/{id}/{teacherId}/detailsCAMPUS-302-1：查询我的行政班-根据某老师
export async function naturalStudent(params) {
  return request(
    `/api/campus/natural-class/${params.id}/${params.subjectId}/details?teachingClassId=${params.teachId}`
  );
}

/* =========================================听说模考--检查================================================ */
// 类型字典 TASK_TYPE
export async function getTaskType() {
  return request(`/api/dict/data-codes?dataType=TASK_TYPE`);
}

// 进度字典 TASK_STATUS
export async function getTaskStatus() {
  return request(`/api/dict/data-codes?dataType=TASK_STATUS`);
}

// 学生端任务状态 TASK_STATUS
export async function getStuTaskStatus() {
  return request(`/api/dict/data-codes?dataType=TASK_STUDENT_QUERY_STATUS`);
}

// 字典TASK_QUERY_DATE
export async function getTaskDate() {
  return request(`/api/dict/data-codes?dataType=TASK_QUERY_DATE`);
}

// 班级类型字典 CLASS_TYPE
export async function getClassType() {
  return request(`/api/dict/data-codes?dataType=CLASS_TYPE`);
}

// TSMK-707: 查询任务详情
export async function tsmkTaskDetail(params) {
  return request(`/api/tsmk/exam-task/task-detail?taskId=${params.taskId}`);
}

/**
 * 课后训练
 * TSMK-801：训练检查页面
 * @param {string} taskId 课后训练任务ID
 */
export async function tsmkInspection(params) {
  return request(`/api/tsmk/tsmk/studentReport?taskId=${params.taskId}`);
}
/**
 * tsmk 服务中的 report-013 获取教师报告试卷快照json
 * @param {string} snapshotId 试卷快照ID
 */
export async function getTsmkPaperSapshot(params) {
  return request(`/api/tsmk/report/paper-snapshot/${params.snapshotId}`);
}
/**
 * 课后训练（整卷试做报告）
 * TSMK-805：查询学生答题报告
 * @param {string} taskId 课后训练任务ID
 * @param {string} paperId 课后训练试卷ID
 * @param {string} studentId 学生ID
 */
export async function tsmkExamReport(params) {
  return request(
    `/api/tsmk/student-port-info/${params.taskId}/${params.paperId}/${params.studentId}`
  );
}

/* =========================================学生端--完善个人资料 （start）================================================ */

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-22
 * Time: PM 13:35
 * Explain: 【CAMPUS-108】 验证学生绑定信息-（接口暂时未提供-临时）
 *
 * */
export async function verifyStudentInfo(params) {
  return request(`/api/campus/students/check-binding-msg`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-22
 * Time: PM 13:44
 * Explain: 【CAMPUS-109】 查询所有已经绑定的学生信息-（接口暂时未提供-临时）
 *
 * */
export async function queryAllBoundStudentInfo(params) {
  return request(`/api/campus/students/binding-student-detail?accountId=${params.accountId}`);
}
/* =========================================学生端--完善个人资料 （end）================================================ */
// 检测任务列表
export async function getInpectTaskList(params) {
  const url = urlEncode(params);
  return request(`/api/tsmk/exam-task/filter-teacher-exam?${url.slice(1)}`);
}

// TSMK-704: 删除考试
export async function deleteTask(params) {
  const { taskId } = params;
  return request(`/api/tsmk/exam-task/del-task?taskId=${taskId}`, {
    method: 'DELETE',
    body: params,
  });
}

// TSMK-705: 编辑考试
export async function editTaskName(params) {
  const url = urlEncode(params);
  return request(`/api/tsmk/exam-task/task-name?${url.slice(1)}`, {
    method: 'PUT',
    body: params,
  });
}

// TSMK-706: 查看未发布任务数量
export async function getUnPublicTask(params) {
  const url = urlEncode(params);
  return request(`/api/tsmk/exam-task/unPublish-task?${url.slice(1)}`);
}

// TSMK-703: 查看考试学生名单
export async function getExamStudents(params) {
  const url = urlEncode(params);
  return request(`/api/tsmk/exam-task/exam-student?${url.slice(1)}`);
}

// 获取用户accountId
export async function getUserAccountId(params) {
  const { userId, identityId } = params;
  return request(`/api/campus/campus/getaccountid/${userId}/${identityId}`);
}

// 获取字典 公共方法
export async function getDictionaries(params) {
  return request(`/api/dict/data-codes?dataType=${params.type}`);
}

/**
 *获取试卷详情信息
 *
 * @author tina.zhang
 * @date 2018-12-14
 * @export
 * @param {*} paperId
 * @returns
 */
export async function queryPaperDetails(params) {
  const url = urlEncode(params);
  return request(`/api/paper/paper-task/paper-detail?${url.slice(1)}`);
}

/**
 * /question-pattern/question-edit-render-meta
 *  获取试卷展示渲染元数据 content 010 任务报告
 */
export async function fetchPaperShowData(params) {
  return request(`/api/tsmk/report/question-edit-render-meta?idList=${params.idList}`);
}

/** 根据条件查询试卷 * */
export async function queryPaper(params) {
  const url = urlEncode(params);
  return request(`/api/paper/papers?${url.slice(1)}`);
}

/** 根据条件查询试卷 607* */
export async function queryPaperResource(params) {
  const url = urlEncode(params);
  return request(`/api/paper/campus-paper/campus-resource?${url.slice(1)}`);
  // return request(`/api/paper/campus-paper/campus-resource`,{
  //   method: 'POST',
  //   body: params
  // });
}

/** CAMPUS-317：查看教师班级详细信息 * */
export async function queryClassDetail(params) {
  return request(
    `/api/campus/natural-class/teacher/all-class/${params.teacherId}/${params.status}`
  );
}

/** 年级列表 * */
export async function queryGrade() {
  return request(`/api/dict/data-codes?dataType=GRADE`);
}

/** 年度 * */
export async function queryYears() {
  return request(`/api/dict/data-codes?dataType=ANNUAL`);
}
/** 难度 * */
export async function queryDifficult() {
  return request(`/api/dict/data-codes?dataType=DIFFICULT_LVL`);
}

/**
 *CONTENT-608：查询校区试卷结构
 *
 * @author tina.zhang
 * @date 2018-12-14
 * @export
 * @param {*} paperId
 * @returns
 */
export async function queryPaperTemplates(params) {
  const url = urlEncode(params);
  return request(`/api/paper/campus-paper/paper-template?${url.slice(1)}`);
}

/** POST /exam-task/publish TSMK-701: 发布考试任务* */
export async function publishTask(params) {
  return request(`/api/tsmk/exam-task/publish`, {
    method: 'POST',
    body: params,
  });
}

// AUTH-305：判断手机号是否已经注册
export async function isRegister(params) {
  const url = urlEncode(params);
  return request(`/api/uaa/security/account/isRegistered?${url.slice(1)}`);
}

/* 考后报告API  leo.guo  2019-5-6 11:14:52 */
/**
 * REPORT-101：查看考试情况总览
 * @param {string} taskId
 */
export async function getTaskOverview(params) {
  return request(`/api/report/task-summary/${params.taskId}`);
}

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

/**
 * TSMK-708：发布成绩
 * @param {string} taskId
 */
export async function publishGrade(params) {
  return request(`/api/tsmk/tasks/status/task-link-status?taskId=${params.taskId}`, {
    method: 'PUT',
  });
}

/**
 * REPORT-102：本次考试详情总览
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getReportOverview(params) {
  return request(`/api/report/task-details/${params.campusId}/${params.taskId}/${params.paperId}`);
}

/**
 * REPORT-107：本次考试详情总览—班级排名
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getRankingList(params) {
  return request(`/api/report/student-score/rank-range/${params.taskId}/${params.paperId}`);
}

/**
 * REPORT-103：学生成绩单-分页
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 * @param {number} pageIndex
 * @param {number} pageSize
 */
export async function getTranscript(params) {
  const urlParams = stringify(params, { arrayFormat: 'repeat' });
  return request(`/api/report/student-scores?${urlParams}`);
}

/**
 * REPORT-104：考后报告教师端—答案详情
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 */
export async function getTeacherSubquestion(params) {
  return request(
    `/api/report/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${params.classId}`
  );
}

/**
 * REPORT-105：答案详情-学生列表-选择填空
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 * @param {string} classId
 */
export async function getStudentSubquestion(params) {
  return request(
    `/api/report/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${params.classId}/${params.subQuestionId}`
  );
}

/**
 * REPORT-105：答案详情-学生列表-口语题
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 * @param {string} type 1得分，2发音，3完整度，4流利度
 */
export async function getStudentSubquestionSpeech(params) {
  return request(
    `/api/report/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${params.classId}/${params.subQuestionId}/${params.type}`
  );
}

/**
 * REPORT-108：学生成绩单—建议关注
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 * @param {number} pageIndex
 * @param {number} pageSize
 */
export async function getTranscriptSuggest(params) {
  const urlParams = stringify(params, { arrayFormat: 'repeat' });
  return request(`/api/report/student-score/suggestion?${urlParams}`);
  // return request(`/api/report/student-score/suggestion`,{
  //   method:'POST',
  //   body: params,
  // });
}

/**
 * REPORT-301：学生考试详情统计 {taskId,paperId,studentId}
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} studentId
 */
export async function getStudentReportOverview(params) {
  return request(
    `/api/report/student-exam/detail/${params.taskId}/${params.paperId}/${params.studentId}`
  );
}

/**
 * REPORT-302：学生答案详情 {taskId,paperId,studentId}
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} studentId
 */
export async function getStudentAnswerReport(params) {
  return request(
    `/api/report/student-answer/detail/${params.taskId}/${params.paperId}/${params.studentId}`
  );
}

/**
 * REPORT-304：设置或者修改得分率
 * @param {string} campusId
 * @param {string} studentId
 * @param {string} studentName
 * @param {string} scoreRate
 */
export async function setStudentScoreRate(params) {
  return request(`/api/report/student-config`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取教师报告试卷快照 report-013
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getPaperSapshot(params) {
  return request(`/api/report/report/paper-snapshot/${params.taskId}/${params.paperId}`);
}
// 重置密码信息
export async function resetPWInfo(params) {
  return request(`/api/uaa/security/account/password/reset`, {
    method: 'PUT',
    body: params,
  });
}

// PUT /teacher/changeMobileCAMPUS-107-1：修改学生和教师手机号
export async function changeTeacherMobile(params) {
  return request(`/api/campus/teacher/changeMobile`, {
    method: 'PUT',
    body: params,
  });
}

/* ==============学生端api================= */

// REPORT-303：学生报告页面-分页概述
export async function getStudentReportList(params) {
  const url = urlEncode(params);
  return request(`/api/report/student-report/page?${url.slice(1)}`);
}

// TSMK-802：查询未做的练习—学生学情中心
export async function getStudentReportList1(params) {
  const url = urlEncode(params);
  return request(`/api/tsmk/unfinish-info?${url.slice(1)}`);
}

// TSMK-802：查询未做的练习—学生首页
export async function getHomeList(params) {
  const { campusId, studentId } = params;
  return request(`/api/tsmk/unfinish-info/index/${campusId}/${studentId}`);
}

// CAMPUS-115：学生切换校区
export async function studentSwitchCampus(params) {
  const url = urlEncode(params);
  return request(`/api/campus/students/change-campus?${url.slice(1)}`, {
    method: 'PUT',
    body: params,
  });
}

// CAMPUS-005：重发邀请
export async function resendInvitate(params) {
  return request(`/api/campus/teacher/re-invite`, {
    method: 'PUT',
    body: params,
  });
}

export const queryAbility = '';
export const updateQuestionDifficult = '';

/**
 * 人工纠偏学生查询 report-401
 * @param {string} taskId
 * @param {string} paperId
 */
export async function geCorrectStudents(params) {
  return request(`/api/report/score-rectify/${params.taskId}/${params.type}`);
}

/**
 * 人工纠偏 GET /score-rectify/summary/{taskId} REPORT-410 检查是否需要汇总
 * @param {string} taskId
 */
export async function getSummary(params) {
  return request(`/api/report/score-rectify/summary/${params.taskId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 人工纠偏 GET /score-rectify/update REPORT-402：修改人工评分和评价结果
 * @param {string}
 */
export async function rectifyUpdate(params) {
  return request(`/api/report/score-rectify/update`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 人工纠偏 /score-rectify/delete/{taskId}/{studentId}REPORT-403：删除纠偏结果
 * @param {string}
 */
export async function rectifyDeletes(params) {
  return request(`/api/report/score-rectify/delete/${params.taskId}/${params.studentId}`, {
    method: 'PUT',
    body: params,
  });
}

// 获取学生的答题情况 tsmk-803
export const getStudentAnswerDetail = async params =>
  request(`/api/tsmk/student-paper-info/${params.taskId}/${params.paperId}/${params.studentId}`);

// POST /submit-subanswer
// TSMK-804-1：提交学生单题答题
export const saveQuestionAnswer = params =>
  request(`/api/tsmk/submit-subanswer`, {
    method: 'POST',
    body: params,
  });

// POST /save-answeringno
// TSMK-806：提交学生当前做的题
export const saveAnsweringNo = params => request(`/api/tsmk/save-answeringno?${stringify(params)}`);

// POST /submit-answer
// TSMK-804：提交学生答题
export const submitAnswer = params => {
  console.log(params);
  return request(`/api/tsmk/submit-answer`, {
    method: 'POST',
    body: params,
  });
};

/**
 * 人工纠偏 PUT /score-rectify/default/{taskId}/{studentId} REPORT-404：保存学生其余成绩为默认成绩
 * @param {string}
 */
export async function rectifyDefault(params) {
  return request(`/api/report/score-rectify/default/${params.taskId}/${params.studentId}`, {
    method: 'PUT',
    body: params,
  });
}

/* ************ 站内信 2019-07-08 08:59:39 ************ */
/**
 * NOTICE-102：接收站内信查询
 * @param {string} accountId 账号ID
 * @param {string} readStatus 阅读状态
 * @param {string} pageIndex 当前页码
 * @param {string} pageSize 每页条数
 * @param {string} pageSize 每页条数
 */
export async function getNoticeList(params) {
  const urlParams = stringify(params);
  return request(`/api/notification/message?${urlParams}`);
}

/**
 * NOTICE-103：查询站内信未读数量
 * @param {string} accountId 账号ID
 */
export async function getNoticeUnreadInfo(params) {
  return request(`/api/notification/message/unread-count/${params.accountId}`);
}

/**
 * NOTICE-104：获取站内信详情
 * @param {string} messageSendId 消息收件箱ID
 */
export async function getNoticeInfo(params) {
  return request(`/api/notification/message/info/${params.messageSendId}`);
}

/**
 * NOTICE-105：消息收件箱状态更新
 * @param {object}  messageSendIds 消息收件箱ID列表
 * @param {object}  readStatus 阅读状态
 * @param {object}  recommendStatus 推荐弹出状态
 */
export async function updateNoticeState(params) {
  return request(`/api/notification/message`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * NOTICE-106：消息收件箱删除
 * @param {Array[string]} messageSendIds 消息收件箱ID列表
 */
export async function deleteNoticeByIds(params) {
  const urlParams = stringify(params, { arrayFormat: 'repeat' });
  return request(`/api/notification/message?${urlParams}`, {
    method: 'DELETE',
  });
}

/**
 * NOTICE-107：消息收件箱清空
 * @param {string} accountId 账号ID
 */
export async function deleteNoticeByAccountId(params) {
  return request(`/api/notification/message/${params.accountId}`, {
    method: 'DELETE',
  });
}

// UEXAM-015：单次任务详情
export async function getTaskDetail(params) {
  const url = urlEncode(params);
  return request(`/api/uexam/task/task-detail?${url.slice(1)}`);
}

/**
 *GET /question-patterns/getDefaultPattern
   CONTENT-013：获取题型默认结构值
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function getDefaultPatternDetail(params) {
  const urlParams = stringify(params);
  return request(`/api/paper/question-patterns/getDefaultPattern?${urlParams}`);
}

/**
 *POST /tasks/free-paper
  TSMK-602：提交自由组卷内容
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function publishPaper(params) {
  return request(`/api/tsmk/tasks/free-paper`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *GET /generate/getGradesByTeacherId
TSMK-605：获取我的自由卷的适用范围过滤项
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function getGradesByTeacherId(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/generate/getGradesByTeacherId?${urlParams}`);
}

/**
 *GET /generate/getCustomPaperByConditions
TSMK-601：查询我的组卷
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function getCustomPaperByConditions(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/generate/getCustomPaperByConditions?${urlParams}`);
}

/**
 *GET /generate/deleteCustomPaperById
TSMK-604：删除自由卷
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function deleteCustomPaperById(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/generate/deleteCustomPaperById?${urlParams}`);
}

/**
 *GET /generate/getCustomPaperById
TSMK-603：获取自由组卷的内容
 * @author tina.zhang
 * @date 2019-07-16
 * @export
 * @param {*} params
 */
export async function getCustomPaperById(params) {
  const urlParams = stringify(params);
  return request(`/api/tsmk/generate/getCustomPaperById?${urlParams}`);
}
