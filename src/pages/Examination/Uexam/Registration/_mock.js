// import { delay } from 'roadhog-api-doc';

// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}
// UEXAM-003：启动报名
function startRegistration(req, res) {
  const data = {
  };
  res.send(new IResp(data));
}

// UEXAM-004：报名结果-按学校分组
function getRegistrationInfo(req, res) {
  const campusInfo = {
    "campusId": "c1",
    "campusName": "广州实验中学",
    "studentNum": "650", // 学生总数
    "classList": [
      {
        "classId": "cs1",
        "className": "1班",
        "studentNum": "88" // 班级学生总数
      }, {
        "classId": "cs2",
        "className": "2班",
        "studentNum": "0" // 班级学生总数
      }, {
        "classId": "cs3",
        "className": "3班",
        "studentNum": "990" // 班级学生总数
      }
    ]
  };
  const data = [...Array(20)].map((v, index) => {
    const idx = index + 1;
    return {
      ...campusInfo,
      "campusId": `c${idx}`,
      "campusName": `广州实验(${idx})中`,
      "studentNum": idx > 10 ? 0 : (99 + idx), // 学生总数
    }
  });
  res.send(new IResp(data));
}

// UEXAM-005：按学校查询报名结果
function getRegistrationResult(req, res) {
  const stuInfo =
  {
    "campusId": "c",
    "campusName": "校区",
    "studentId": "s",
    "studentName": "学生",
    "classId": "cs",
    "className": "班级",
    "examNo": 75677564991123756,
    "gender": "",
    "isTransient": "",
    "studentClassCode": "",
    "status": ""
  };
  const data = [...Array(20)].map((v, index) => ({
    ...stuInfo,
    "campusId": 'c1',// `c${(index + 1) % 3 + 1}`,
    "campusName": `校区${(index + 1)}`,
    "studentId": `s${(index + 1)}`,
    "studentName": `学生${(index + 1)}`,
    "classId": 'cs1',// `cs${(index + 1) % 3 + 1}`,
    "className": `班级${(index + 1)}`,
    "examNo": 10000000000 + (index + 1),
  }));
  res.send(new IResp(data));
}

// UEXAM-006：完成报名
function finishRegistration(req, res) {
  const data = {};
  res.send(new IResp(data));
}

// UEXAM-007：【结果】报名结果-按学生分组—分页搜索
function searchRegistrationResult(req, res) {
  const stuInfo =
  {
    "campusId": "c",
    "campusName": "校区",
    "studentId": "s",
    "studentName": "学生",
    "classId": "cs",
    "className": "班级",
    "examNo": 75677564991123756,
    "gender": "",
    "isTransient": "",
    "studentClassCode": "",
    "status": ""
  };
  const records = [...Array(17)].map((v, index) => ({
    ...stuInfo,
    "campusId": 'c1',// `c${(index + 1) % 3 + 1}`,
    "campusName": `校区${(index + 1)}`,
    "studentId": `s${(index + 1)}`,
    "studentName": `学生${(index + 1)}`,
    "classId": 'cs1',// `cs${(index + 1) % 3 + 1}`,
    "className": `班级${(index + 1)}`,
    "examNo": 10000000000 + (index + 1),
  }));
  const data = {
    current: 1,
    pages: 1,
    records,
    size: 10,
    total: 30
  };
  res.send(new IResp(data));
}


// UEXAM-008：导入名单-校区名单-跨服务
function getCampusInfoList(req, res) {

  const campusInfo = {
    "campusId": "c1",
    "campusName": "广州实验中学",
    'existNum': 66,
    "studentNum": "650", // 学生总数
    "classList": [
      {
        "classId": "cs1",
        "className": "1班",
        "studentNum": "88" // 班级学生总数
      }, {
        "classId": "cs2",
        "className": "2班",
        "studentNum": "0" // 班级学生总数
      }, {
        "classId": "cs3",
        "className": "3班",
        "studentNum": "990" // 班级学生总数
      }
    ]
  };
  const data = [...Array(20)].map((v, index) => {
    const idx = index + 1;
    return {
      ...campusInfo,
      "campusId": `c${idx}`,
      "campusName": `广州实验(${idx})中`,
      "studentNum": idx > 10 ? 0 : (99 + idx), // 学生总数
    }
  });
  res.send(new IResp(data))
}

// UEXAM-009：导入名单-学生名单-跨服务
function getStudentInfoList(req, res) {
  const stuInfo =
  {
    "campusId": "c1",
    "campusName": "校区",
    "studentId": "s1",
    "studentName": "学生1",
    "classId": "",
    "className": "",
    "examNo": "",
    "gender": "",
    "isTransient": false,
    "studentClassCode": "",
    "status": "",
    "isExist": "", // 是否已经导入 多个属性
  };
  const data = [...Array(110)].map((v, index) => {
    const isExist = index % 8 === 0;
    if (index % 2 === 0) {
      return {
        ...stuInfo,
        "campusId": 'c2',
        "campusName": `校区c2`,
        "studentId": `s2-${(index + 1)}`,
        "studentName": `②学生${(index + 1)}`,
        "classId": 'cs2',
        "className": `班级2-1`,

        "isTransient": 'Y',
        "status": "",
        "isExist": isExist, // 是否已经导入 多个属性
      }
    }
    return {
      ...stuInfo,
      "campusId": 'c1',
      "campusName": `校区c1`,
      "studentId": `s1-${(index + 1)}`,
      "studentName": `①学生${(index + 1)}`,
      "classId": 'cs1',
      "className": `班级1-1`,

      "isTransient": 'N',
      "status": "",
      "isExist": isExist, // 是否已经导入 多个属性
    }
  });
  res.send(new IResp(data));
}

// UEXAM-010：导入名单
function submitStudentList(req, res) {
  const data = {
    "schoolCount": "99", // 导入多少学校
    "studentCount": "999",// 导入多少学生
  }
  setTimeout(() => {
    res.send(new IResp(data));
  }, 5000);
}

// UEXAM-011：清空名单
function clearStudentList(req, res) {
  const data = {
  }
  res.send(new IResp(data));
}

// UEXAM-012：一键生成考号
function generateExamNo(req, res) {
  const data = {
  }
  setTimeout(() => {
    res.send(new IResp(data));
  }, 5000);
}

// UEXAM-013：删除学生
function removeStudent(req, res) {
  const data = {};
  res.send(new IResp(data));
}

// UEXAM-014：报名统计-详情
function getRegistrationCount(req, res) {
  const data = {
    "campusNum": "11",  // 学校总数
    "classNum": "5",    // 班级总数
    "studentNum": 9999, // 学生总数
  };
  res.send(new IResp(data));
}

export default {
  'PUT /api/uexam/task/start-sign-up': startRegistration,
  'GET /api/uexam/task/sign-up-result': getRegistrationInfo,
  'GET /api/uexam/task/sign-up-result-detail': getRegistrationResult,
  'PUT /api/uexam/task/complete-sign-up': finishRegistration,
  'GET /api/uexam/task/sign-up-result/page': searchRegistrationResult,
  'GET /api/uexam/task/campus-service-student-num': getCampusInfoList,
  'GET /api/uexam/task/campus-service-student-List': getStudentInfoList,
  'POST /api/uexam/task/import-campus-student': submitStudentList,
  'DELETE /api/uexam/task/class-student': clearStudentList,
  'GET /api/uexam/task/generate-exam-num': generateExamNo,
  'GET /api/uexam/task-student': removeStudent,
  'GET /api/uexam/task/campus-student-num': getRegistrationCount,
}
