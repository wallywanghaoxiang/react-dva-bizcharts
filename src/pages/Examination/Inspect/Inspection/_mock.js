// eslint-disable-next-line import/no-extraneous-dependencies
import { delay } from 'roadhog-api-doc';

// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

// 检查信息
function getTsmkInspection(req, res) {
  const data = {
    "taskId": "49781035340136497",
    "paperId": "49704972543067269", // TODO ..........................
    "name": "MOCK-课后训练-检查详情",
    "type": "",// TASK_TYPE
    "typeValue": "",
    "examNum": "20",    // 实考人数,status=Y, exam_status=ES_3和ES_4
    "studentNum": "18", // 应考人数,status=Y
    "exerciseBeginTime": "",// 2019-6-13 直接用数据，跟字典无关了。
    "exerciseEndTime": "1561437918000",// 2019-6-13 直接用数据，跟字典无关了。
    "exerciseType": "",// 2019-6-13练习模式字典，字典
    "exerciseTypeValue": "",
    "statis": [
      {
        "classId": "c1",
        "className": "一年级(1)班",
        "studentList": [
          {
            "studentId": "48774821139447912",
            "studentName": "学生s1",
            "studentClassCode": "01",
            "score": "25",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": true, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s2",
            "studentName": "学生s2",
            "studentClassCode": "02",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s3",
            "studentName": "学生s3",
            "studentClassCode": "03",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s4",
            "studentName": "学生s4",
            "studentClassCode": "04",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s5",
            "studentName": "学生s5",
            "studentClassCode": "05",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s6",
            "studentName": "学生s6",
            "studentClassCode": "06",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s7",
            "studentName": "学生s7",
            "studentClassCode": "07",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_4", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s8",
            "studentName": "学生s8",
            "studentClassCode": "08",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_3", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s9",
            "studentName": "学生s9",
            "studentClassCode": "09",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_3", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }, {
            "studentId": "s10",
            "studentName": "学生s10",
            "studentClassCode": "010",
            "score": "15",
            "mark": "50",  // 满分
            "finishTime": "1561437918000", // 完成时间--t_stu_respondents.创建时间
            "examStatus": "ES_3", // 是否完成
            "isFirst": false, // 是否最快完成--时间最小的
            "respondentId": "41699528239218688"  // t_stu_respondents.id 查看学生成绩时候用
          }
        ]
      }
    ]

  };
  res.send(new IResp(data));
}

// 整卷试做报告
function tsmkExamReport(req, res) {
  const data = {
    // "score": 27.5,
    // "mark": 38,
    // "spokeScore": 27.5,
    // "spokeMark": 38,
    "duration": 3000,
    "subquestionList": [
      {
        "subquestionNo": "49777849548144689",
        // "score": "1.500",
        "studentAnswers": "A",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310181937",
        "engineResult": null,
        // "order": "1,3,2,4,0",
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "49778037452963889",
        // "score": "0.000",
        "studentAnswers": "A",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310182961",
        "engineResult": null,
        // "order": "1,3,2,4,0",
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "49778137310953521",
        // "score": "0.000",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310183985",
        "engineResult": null,
        // "order": "1,3,2,4,0",
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "49777744321445937",
        // "score": "0.000",
        "studentAnswers": "B",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310185009",
        "engineResult": null,
        // "order": "1,3,2,4,0",
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "49777933300006961",
        // "score": "1.500",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310186033",
        "engineResult": null,
        // "order": "1,3,2,4,0",
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "6e31e639b5724776bb81f0b6fa2eebee",
        // "score": "1.500",
        "studentAnswers": "A",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310187057",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "6c7e316c5fc845dd8c3f25450d2ffe43",
        "score": "1.500",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310188081",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "b862eba0bf5a4e5da26df07cd863111a",
        // "score": "0.000",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310189105",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "4c385aae2e8e41a7b7f5afe0800eea41",
        // "score": "0.000",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310190129",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "26fb9b0ced184995948ddf3efbf0b572",
        // "score": "1.500",
        "studentAnswers": "B",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310191153",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "6c0a3e2f28884bd8b7922e55a5d4dba4",
        // "score": "1.500",
        "studentAnswers": "A",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310192177",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "5f9e217c963d41bd941923ab6c3a8f67",
        // "score": "0.000",
        "studentAnswers": "B",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310193201",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "b4f252860d2e49219db2b2f8cd442656",
        // "score": "1.500",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310194225",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "026ae03be1ac4763b1945d35bae3104c",
        // "score": "1.500",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310195249",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "31fd5256aea848ac8a785378eddf5710",
        // "score": "0.000",
        "studentAnswers": "server.wzd",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310196273",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "69ea2cbe28b7476e987bf9dc1bbd60a3",
        // "score": "1.500",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310197297",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "e6e11fd97792427884d4428fbc015eb2",
        // "score": "1.500",
        "studentAnswers": "B",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310198321",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "02310bd3170c474a9d95f4705294806c",
        // "score": "1.500",
        "studentAnswers": "A",
        // "fullScore": "1.500",
        // "markNum": "1",
        // "classMarkNum": "1",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"1\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"0\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310199345",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "fff11b18a9344d829b2b3b6f9300bc3c",
        // "score": "0.000",
        "studentAnswers": "C",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310200369",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      },
      {
        "subquestionNo": "4b2328e112064103a2ed9b9e4ca89067",
        // "score": "0.000",
        "studentAnswers": "server.wzd",
        // "fullScore": "1.500",
        // "markNum": "0",
        // "classMarkNum": "0",
        "answerType": "CHOICE",
        // "subjectiveAndObjective": "OBJECTIVE",
        // "pronunciationScore": "0.00",
        // "fluencyScore": "0.00",
        // "integrityScore": "0.00",
        // "rhythmScore": "0.00",
        // "scoreStatis": "[{\"V\":\"0\",\"K\":\"[1.500,1.500]\"},{\"V\":\"0\",\"K\":\"[1.400,1.500)\"},{\"V\":\"0\",\"K\":\"[0.900,1.400)\"},{\"V\":\"0\",\"K\":\"(0.000,0.900)\"},{\"V\":\"1\",\"K\":\"[0.000,0.000]\"}]",
        // "pronunciationStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "fluencyStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "integrityStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "rhythmStatis": "[{\"V\":\"1\",\"K\":\"0.00\"}]",
        // "stuAnswerId": "49781850310201393",
        "engineResult": null,
        // "order": null,
        // "answerOptionOrder": "",
        // "evaluationEngine": null
      }
    ]
  };
  res.send(new IResp(data));
}

const apiMap = {
  'GET /api/tsmk/tsmk/studentReport': getTsmkInspection,
  'GET /api/tsmk/student-port-info/:taskId/:paperId/:studentId': tsmkExamReport
}
export default apiMap;
// export default delay(apiMap, 1000);

