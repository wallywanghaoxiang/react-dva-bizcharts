// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

// UEXAM-015：单次任务详情
function getTaskInfo(req, res) {
  const data = {
    task: {
      arrangeEndTime: 1565279999000,
      arrangeType: "UAT_1",
      arrangeTypeValue: "各校自行编排",
      campusGroupId: "efcba7a8ed9041d1b178245f1213b236",
      campusGroupName: "分组1",
      createdBy: "419769144070635528",
      createdDatetime: 1565060016511,
      distributeType: "",
      enrollAnytime: "",
      enrollEndTime: 1565279999000,
      enrollStatus: "Y",
      enrollStatusValue: "允许",
      enrollType: "UET_1",
      enrollTypeValue: "各校自行报名",
      examBeginTime: 1565193600000,
      examEndTime: 1565884799000,
      examNoFormat: "SCHOOL#GRADE#CLASS#RAND_4",
      examTime: 1565060016508,
      examType: "",
      grade: "006",
      gradeValue: "六年级",
      id: "1",
      invigilateEndTime: 1565279999000,
      invigilateType: "UIT_1",
      invigilateTypeValue: "各校自行安排",
      isDeleted: 0,
      linkStatus: null,
      name: "leo测试",
      orgId: "645b6fab739145629278466db0f744ee",
      paperType: "UPT_1",
      paperTypeValue: "试卷库选卷",
      reEnrollType: null,
      reEnrollTypeValue: null,
      rectifyType: "",
      status: "ES_2",
      statusValue: "",
      ueType: "UT_2",
      ueTypeValue: "期末",
      updatedBy: "4197691440706355281",
      updatedDatetime: 1565331045844,
      version: 9
    }
  }
  res.send(new IResp(data));
}

// UEXAM-701：统考首页-任务列表—分页
function getTaskList(req, res) {
  const taskInfo = {
    'id': "",
    "orgId": "", // 用户登录以后返回的
    "name": "",
    "grade": "",
    "type": "",  //
    "typeValue": "",  //
    "distributeType": "",  // 考生分配规则
    "examType": "",   // 题目显示规则
    "rectifyType": "",  // 人工纠偏
    "status": "",
    "enrollType": "",   // 报名方式
    "enrollStatus": "",  // 是否开启
    "enrollEnd_time": "",  // 报名结束时间
    "enrollAnytime": "",   // 允许补报
    "examNoFormat": "",    // 考号规则
    "arrangeType": "",   // 考编方式
    "arrangeEndTime": "",  // 编排结束时间
    "invigilateType": "",  // 监考安排
    "invigilateEndTime": "",   // 监考安排截止时间
    "paperType": "", // 试卷安排
    "examBeginTime": "",
    "examEndTime": "",
    "campusGroupId": "", // 学校分组
    "examTime": "1565060016511"
  };

  const taskList = [...Array(5)].map((v, idx) => {
    const index = idx + 1;
    return {
      ...taskInfo,
      name: `MOCK-统考任务-${index}`,
    }
  });

  const data = {
    records: taskList,
    current: 1,
    pages: 0,
    size: 5,
    total: 50
  };

  setTimeout(() => {
    res.send(new IResp(data));
  }, 5000);
}

// UEXAM-704：查看校区-考点考场批次
function getCampusPlaceInfos(req, res) {
  const info = {
    // 考点
    "examPlaceList": [
      {
        "campusId": "string",
        "examPlaceId": "p1",
        "examPlaceName": "考点1",
        "examStrategyId": "p1",
        "id": "p1",
        "taskId": "1"
      }, {
        "campusId": "string",
        "examPlaceId": "p2",
        "examPlaceName": "考点2",
        "examStrategyId": "p2",
        "id": "p2",
        "taskId": "1"
      }, {
        "campusId": "string",
        "examPlaceId": "p3",
        "examPlaceName": "考点3",
        "examStrategyId": "p3",
        "id": "p3",
        "taskId": "1"
      }, {
        "campusId": "string",
        "examPlaceId": "p4",
        "examPlaceName": "考点4",
        "examStrategyId": "p4",
        "id": "p4",
        "taskId": "1"
      }
    ],
    // 日期列表
    "examDateList": [
      {
        "examDate": "2019-08-12T03:43:40.003Z",
        "id": "1",
        "taskId": "11"
      }, {
        "examDate": "2019-08-13T03:43:40.003Z",
        "id": "2",
        "taskId": "22"
      }, {
        "examDate": "2019-08-14T03:43:40.003Z",
        "id": "3",
        "taskId": "33"
      }, {
        "examDate": "2019-08-15T03:43:40.003Z",
        "id": "4",
        "taskId": "44"
      }
    ],
    // 考场
    "examRoomList": [
      {
        "examPlaceId": "string",
        "id": "string",
        "name": "string",
        "studentMachineNum": 0,
        "taskId": "string"
      }
    ],
    // 批次
    "examBatchList": [
      {
        "examBatchTime": "string",
        "examPlaceId": "string",
        "id": "string",
        "name": "string",
        "taskId": "string"
      }
    ],
  }
  res.send(new IResp(info));
}

// UEXAM-705：根据考点时间查询考场批次统计
function getRoomBatchStatis(req, res) {

  const batches = [...Array(10)].map((v, idx) => {
    const index = idx + 1;
    return {
      "subTaskId": `sub${index}`,  // 子任务表主键
      "examBatchId": `b${index}`,
      "examBatchName": `批次${index}`,
      "teacherNames": `王小明(主)${index}/网二${index}/张三${index}`,
      "teacherList": [   //  从t_tash_teacher表拉数据，设置主监考老师作用--根据subTaskId和teacherId
        {
          "subTaskId": `sub${index}`,
          "teacherId": "t1",
          "teacherName": "教师1",
          "type": "MASTER"
        }, {
          "subTaskId": `sub${index}`,
          "teacherId": "t2",
          "teacherName": "教师2",
          "type": "TEACHER"
        }, {
          "subTaskId": `sub${index}`,
          "teacherId": "t3",
          "teacherName": "教师3",
          "type": "TEACHER"
        }
      ]
    }
  })

  const data = [...Array(5)].map((v, idx) => {
    const index = idx + 1;
    return {
      "examRoomId": `r${index}`,
      "examRoomName": `考场${index}`,
      "batchNum": index * 10,       // 批次数量
      "batchFinishNum": index * 5, // 批次完成数量
      "examBatchList": batches
    }
  });
  res.send(new IResp(data));
}

// UEXAM-304：安排学校监考老师
function submitInvigilations(req, res) {
  const data = {};
  res.send(new IResp(data));
}

// UEXAM-305：取消监考老师-批量
function cancelInvigilations(req, res) {
  const data = {};
  res.send(new IResp(data));
}

// UEXAM-306：设置主监考老师
function submitMasters(req, res) {
  const data = {};
  res.send(new IResp(data));
}

// UEXAM-301：查看某学校考场监考情况
function getCampusInvigilations(req, res) {
  const data = [...Array(20)].map((v, idx) => {
    const index = idx + 1;
    return {
      "subTaskId": `sub${index}`,
      "campusId": `c_${index}`,
      "campusName": `校区—${index}`,
      "examPlaceName": `考点(${index})`,
      "examRoomName": `考场(${index})`,
      "examBatchName": `批次(${index})`,
      "teacherName": `王二(${index})/李四(${index})/周凯凯(${index})`,
      "examDate": "2019-08-21",
      'examBatchTime': '08月21日 9:00-10:00'
    }
  })
  res.send(new IResp(data));
}

// UEXAM-303：完成监考编排
function finishCampusInvigilation(req, res) {
  const data = {};
  res.send(new IResp(data));
}

export default {
  // 'GET /api/uexam/task/task-detail': getTaskInfo,
  'GET /api/uexam/task/task-list-campusId/page': getTaskList,
  'GET /api/uexam/task/place-date-batch-room': getCampusPlaceInfos,
  'GET /api/uexam/task//task/statistics-by-place-date': getRoomBatchStatis,
  'POST /api/uexam/invigilate/teacher-strategy': submitInvigilations,
  'POST /api/uexam/invigilate/teacher-cancel': cancelInvigilations,
  'POST /api/uexam/invigilate/teacher-master': submitMasters,
  'GET /api/uexam/invigilate/campus-invigilation': getCampusInvigilations,
  'PUT /api/uexam/invigilate/strategy-finish': finishCampusInvigilation,
}
