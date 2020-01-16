// import { delay } from 'roadhog-api-doc';

// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

// UEXAM-015：单次任务详情
function getTaskInfo(req, res) { // 添加统计
  const data = {
    task:{
      "createdBy": "87677473841664229377",
      "createdDatetime": 1567395179113,
      "updatedBy": "87677473841664229377",
      "updatedDatetime": 1567395227519,
      "version": 1,
      "isDeleted": 0,
      "id": "493506946334640308226",
      "orgId": "org4",
      "name": "验证两个学校公用一个考点",
      "grade": "007",
      "gradeValue": "七年级",
      "ueType": "UT_1",
      "ueTypeValue": "期中",
      "type": null,
      "distributeType": "",
      "distributeTypeValue": "",
      "examType": "",
      "examTypeValue": "",
      "rectifyType": "",
      "status": "TS_2",
      "statusValue": "考编中",
      "linkStatus": null,
      "campusGroupId": "493506679758905147394",
      "campusGroupName": null,
      "enrollType": "UET_2",
      "enrollTypeValue": "区统一报名",
      "enrollStatus": "",
      "enrollStatusValue": "",
      "enrollEndTime": 0,
      "enrollAnytime": "Y",
      "enrollAnytimeValue": "允许",
      "examNoFormat": "SCHOOL#GRADE#CLASS#RAND_2",
      "arrangeType": "UAT_2",
      "arrangeTypeValue": "区统一编排",
      "arrangeEndTime": 0,
      "invigilateType": "UIT_1",
      "invigilateTypeValue": "各校自行安排",
      "invigilateEndTime": 1567439999000,
      "paperType": "UPT_1",
      "paperTypeValue": "试卷库选卷",
      "examBeginTime": 1567440000000,
      "examEndTime": 1567526399000,
      "examTime": 1567395179106,
      "reEnrollType": null,
      "reEnrollTypeValue": null,
      "campus": null,
      "markType": null,
      "markShowId": null,
      "studentStatus": null
    }
   
  };
  setTimeout(() => {
    res.send(new IResp(data));
  }, 2000);
}

//101
function getExamStrategy(req, res) {
  const data =[
        {
            "campusId": "c1",
            "campusName": "Mock-学校3",
            "strategyId": "644bcddeed1d4d738805b731b36384ec",
            "strategyName": "策略2",
            "orgId": "645b6fab739145629278466db0f744ee",
            "amBeginTime": "8:00",
            "pmBeginTime": "13:00",
            "examTime": "60",
            "standardNum": 0,
            "backupNum": 0,
            "isLimited": "N",
            "isMakeUp": "N",
            "backupMachineNum":8,
        },
        {
            "campusId": "a3b6f43b-0c3a-449d-8ee2-3915ac2e0dad",
            "campusName": "Mock-学校1",
            "strategyId": null,
            "strategyName": "123123",
            "orgId": null,
            "amBeginTime": null,
            "pmBeginTime": null,
            "examTime": null,
            "standardNum": 31,
            "backupNum": 13,
            "isLimited": null,
            "backupMachineNum":8,
            "isMakeUp": null
        },
        {
            "campusId": "ca5a18b7-ef86-4b93-b0dc-fcd2a3403c74",
            "campusName": "Mock-学校2",
            "strategyId": null,
            "strategyName": null,
            "orgId": null,
            "amBeginTime": null,
            "pmBeginTime": null,
            "examTime": null,
            "standardNum": 12,
            "backupNum": 22,
            "isLimited": null,
            "backupMachineNum":8,
            "isMakeUp": null
        }
    ]
  setTimeout(() => {
    res.send(new IResp(data));
  }, 2000);
}


//102
function getAllStrategy(req, res) {
  const data =[
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略1",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略2",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略3",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略4",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略5",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略6",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略7",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略8",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略9",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略10",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略11",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略12",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略13",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略14",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略15",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略16",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        },
        {
          "amBeginTime": "8:00",
          "backupNum": 2,
          "examTime": "60",
          "id": "string",
          "isDefault": "N",
          "isLimited": "Y",
          "isMakeUp": "N",
          "name": "Mock-策略17",
          "orgId": "string",
          "pmBeginTime": "13:00",
          "standardNum": 3
        }
    ]
  setTimeout(() => {
    res.send(new IResp(data));
  }, 2000);
}


export default {
  'GET /api/uexam/task/task-detail': getTaskInfo,
  'GET /api/uexam/examStrategy/campus-strategy/:taskId':getExamStrategy,
  'GET /api/uexam/examStrategy/all-strategy/:orgId':getAllStrategy,
}
