//  响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

//  REPORT-201：统考报告-考务情况总览
function getTaskInfo(req, res) {
  const data = {
    "taskId": "1",
    "taskName": "MOCK-任务报告",
    "type": "",
    "avgScore": 50, // 平均分---------StudentScoreStatis表
    "mark": 100,  // 满分---------StudentScoreStatis表
    "classNum": "5", // 班级数量
    "paperList": [{        // 根据task_id+campusId关联StudentScoreStatis表获取
      "paperId": "p1",
      "paperName": "试卷1",
      "mark": 50,
      "examNum": 5,
      "score": 0, // ---看看以前的
      "objectiveNum": 20,
      "subjectiveNum": 30
    }, {        // 根据task_id+campusId关联StudentScoreStatis表获取
      "paperId": "p2",
      "paperName": "试卷2",
      "mark": 50,
      "examNum": 5,
      "score": 0, // ---看看以前的
      "objectiveNum": 20,
      "subjectiveNum": 30
    }],
    "classList": {        // 根据task_id+campusId获取--CampusId不为FULL
      "classId": "c1",
      "className": "一年级(1)班",
      "classType": ""
    },
    "campusList": {        //
      "campusId": "cp1",
      "campusName": "广州一中",
      "campusNumer": ""
    },
    "examNum": "500",   // 实考人数---------StudentScoreStatis表
    "studentNum": "1000", // 应考人数--报名人数---------StudentScoreStatis表
    "examTime": "2019-8-21", // 考试时间
    "classType": "",  // 班级类型
    "campusNum": "20", // 参考学校数量
    "subTaskNum": "18", // 完成场次---------StudentScoreStatis表
    "absentNum": "10", // 缺考人数 ---------StudentScoreStatis表
    "makeUpNum": "10", // 补考人数----------StudentScoreStatis表
    "reRnrollNum": "10", // 补报名人数------StudentScoreStatis表
    "cheatNum": "10", // 作弊人数-----------StudentScoreStatis表
    "failNum": "10"
  };
  res.send(new IResp(data));
}

//  REPORT-202：统考报告-考务明细
function getExamDetail(req, res) {
  const data = [                  //只显示学校或者班级，不显示总的了
    {
      "campusId": "1001",
      "campusName": "广州第一中学",   //统考报告显示校区
      "classId": "",
      "className": "",    //学校报告显示班级
      "examNum": "800",   //实考人数---------StudentScoreStatis表
      "studentNum": "800", //应考人数--报名人数---------StudentScoreStatis表
      "subTaskNum": "8", //完成场次---------StudentScoreStatis表
      "absentNum": "0", //缺考人数 ---------StudentScoreStatis表
      "makeUpNum": "0", //补考人数----------StudentScoreStatis表
      "reRnrollNum": "0", //补报名人数------StudentScoreStatis表
      "cheatNum": "0", //作弊人数-----------StudentScoreStatis表
      "failNum": "0",  //失败人数-----------StudentScoreStatis表
      "absentRate": "0",//缺考率-1位小数
      "reRnrollRate": "0",//补考率
      "cheatRate": "0",//作弊率
    },
    {
      "campusId": "1001",
      "campusName": "广州第一中学",   //统考报告显示校区
      "classId": "",
      "className": "",    //学校报告显示班级
      "examNum": "800",   //实考人数---------StudentScoreStatis表
      "studentNum": "800", //应考人数--报名人数---------StudentScoreStatis表
      "subTaskNum": "8", //完成场次---------StudentScoreStatis表
      "absentNum": "14", //缺考人数 ---------StudentScoreStatis表
      "makeUpNum": "2", //补考人数----------StudentScoreStatis表
      "reRnrollNum": "32", //补报名人数------StudentScoreStatis表
      "cheatNum": "4", //作弊人数-----------StudentScoreStatis表
      "failNum": "4",  //失败人数-----------StudentScoreStatis表
      "absentRate": "0.32%",//缺考率-1位小数
      "reRnrollRate": "0.32%",//补考率
      "cheatRate": "0",//作弊率
    },
    {
      "campusId": "1001",
      "campusName": "广州第一中学",   //统考报告显示校区
      "classId": "",
      "className": "",    //学校报告显示班级
      "examNum": "800",   //实考人数---------StudentScoreStatis表
      "studentNum": "800", //应考人数--报名人数---------StudentScoreStatis表
      "subTaskNum": "8", //完成场次---------StudentScoreStatis表
      "absentNum": "0", //缺考人数 ---------StudentScoreStatis表
      "makeUpNum": "0", //补考人数----------StudentScoreStatis表
      "reRnrollNum": "0", //补报名人数------StudentScoreStatis表
      "cheatNum": "0", //作弊人数-----------StudentScoreStatis表
      "failNum": "0",  //失败人数-----------StudentScoreStatis表
      "absentRate": "0",//缺考率-1位小数
      "reRnrollRate": "0",//补考率
      "cheatRate": "0",//作弊率
    },
    {
      "campusId": "1001",
      "campusName": "广州第一中学",   //统考报告显示校区
      "classId": "",
      "className": "",    //学校报告显示班级
      "examNum": "800",   //实考人数---------StudentScoreStatis表
      "studentNum": "800", //应考人数--报名人数---------StudentScoreStatis表
      "subTaskNum": "8", //完成场次---------StudentScoreStatis表
      "absentNum": "0", //缺考人数 ---------StudentScoreStatis表
      "makeUpNum": "0", //补考人数----------StudentScoreStatis表
      "reRnrollNum": "0", //补报名人数------StudentScoreStatis表
      "cheatNum": "0", //作弊人数-----------StudentScoreStatis表
      "failNum": "0",  //失败人数-----------StudentScoreStatis表
      "absentRate": "0",//缺考率-1位小数
      "reRnrollRate": "0",//补考率
      "cheatRate": "0",//作弊率
    },
    {
      "campusId": "1001",
      "campusName": "广州第一中学",   //统考报告显示校区
      "classId": "",
      "className": "",    //学校报告显示班级
      "examNum": "800",   //实考人数---------StudentScoreStatis表
      "studentNum": "800", //应考人数--报名人数---------StudentScoreStatis表
      "subTaskNum": "8", //完成场次---------StudentScoreStatis表
      "absentNum": "14", //缺考人数 ---------StudentScoreStatis表
      "makeUpNum": "2", //补考人数----------StudentScoreStatis表
      "reRnrollNum": "32", //补报名人数------StudentScoreStatis表
      "cheatNum": "4", //作弊人数-----------StudentScoreStatis表
      "failNum": "4",  //失败人数-----------StudentScoreStatis表
      "absentRate": "0.32%",//缺考率-1位小数
      "reRnrollRate": "0.32%",//补考率
      "cheatRate": "0",//作弊率
    }
  ]


  res.send(new IResp(data));
}
//  REPORT-203：统考报告-缺考补考作弊等名单-分页
function getStudentList(req, res) {
  const data = [                  //考试状态类型筛选
    {
      "campusId": "",
      "campusName": "广州第一中学",
      "classId": "",
      "className": "七年级1班",
      "studentId": "",
      "studentName": "赖华",
      "reEnrollType": "",//是否现场报名
      "reEnrollValue": "现场报名",//是否现场报名
      "makeUpNum": "2",//补考次数
      "cmonitoringDesc": "", //考试失败原因
      "cmonitoringDescValue": "设备问题", //考试失败原因
      "examNo": "23456787674565432210",
      "examDate": "2019-08-10",
      "examPlaceName": "新区一中考点",
      "examBatchName": "场次1",
      "examBatchTime": "8:00-9:00",
      "examRoomName": "考场001",
      "teacherName": "张阳阳"  //只取主监考老师
    }
  ];
  res.send(new IResp(data));
}

// REPORT-204：统考报告-考试情况总览
function getExamOverview(req, res) {
  const data = {
    "examStatis": [               // 本次考试+本校 共2条记录
      {
        "id": "FULL",        //
        "name": "本次考试",      // 本次考试或者本校
        "avgScore": "10",
        "maxScore": "90",
        "examNum": "50", // 考试人数
        "markNum": "10", // 满分人数
        "excellentNum": "10", // 优秀人数
        "passNum": "10", // 及格人数
        "lowNum": "10", // 低分人数
        rank: 1,
      }, {
        "id": "CAMPUS",        //
        "name": "本校",   // 本次考试或者本校
        "avgScore": "10",
        "maxScore": "90",
        "examNum": "50", // 考试人数
        "markNum": "10", // 满分人数
        "excellentNum": "10", // 优秀人数
        "passNum": "10", // 及格人数
        "lowNum": "10", // 低分人数
        rank: 2,
      }
    ],
    "classStatis": [               // 所有学校或者所有班级
      {
        "id": "",        // 所有班级，默认班级升序排列
        "name": "",
        "campusId": "",
        "campusName": "",
        "campusNumer": "",
        "avgScore": "",
        "maxScore": "",
        "examNum": "", // 考试人数
        "markNum": "", // 满分人数
        "excellentNum": "", // 优秀人数
        "passNum": "", // 及格人数
        "lowNum": "", // 低分人数
        "classRank": "", // 班级排名
        "rank": "" // 区排名
      }
    ],
    "scoreStatis": {
      // 本次考试--t_student_score表根据PAPER_ID过滤是FULL还是某次试卷
      "totalScore": [ // 分解score_statis ,从小到大排序
        {
          "level": "0-10",  // K
          "num": "",    // v
          "rate": ""    // 百分比 20%  V/examNum
        }
      ],
      "questionScore": [  // 大题的分数统计
        {
          "questionId": "",
          "questionName": "",
          "totalScore": [  // 分解score_statis ,从小到大排序
            {
              "level": "",  // K
              "num": "",    // v
              "rate": ""    // 百分比 20%  V/examNum
            }
          ]
        }
      ]
    },
    "questionList": [                // 分数构成。大题。
      {
        "classId": "",            // 本次+本校+所有班级
        "className": "",
        "avgScore": "",
        "mark": "", // 试卷满分
        "statis": [
          {
            "questionNo": "",
            "questionName": "",
            "mark": "",  // 满分
            "avgScore": ""
          }
        ]
      }
    ]
  };
  const classStatis = [...Array(50)].map((v, index) => {
    const idx = index + 1;
    return {
      "classId": `c${idx}`,        // 所有班级，默认班级升序排列
      "className": `一年级(${idx})班`,
      "campusId": `cp${idx}`,
      "campusName": `广州市第${idx}中学`,
      "campusNumer": `0000${idx}`,
      "avgScore": 50 + idx,
      "maxScore": 80 + idx,
      "examNum": 100, // 考试人数
      "markNum": 10 + index, // 满分人数
      "excellentNum": 10 + index, // 优秀人数
      "passNum": 10 + index, // 及格人数
      "lowNum": 10 + index, // 低分人数
      "classRank": idx, // 班级排名
      "rank": idx, // 区排名
    }
  });
  data.classStatis = classStatis;

  const totalScore = [{
    "level": `0-0`,
    "num": 50,
    "rate": 20
  },
  ...[...Array(10)].map((v, index) => {
    const idx = index + 1;
    return {
      "level": `${index * 10}-${idx * 10}`,
      "num": 10 * (idx % 2 === 0 ? idx : idx / 2),
      "rate": 10 * (idx % 2 === 0 ? idx : idx / 2)
    }
  }), {
    "level": `100-100`,
    "num": 50,
    "rate": 20
  }];
  data.scoreStatis.totalScore = totalScore;

  const questionScore = [...Array(5)].map((v, index) => {
    const idx = index + 1;

    const scores = [{
      "level": `0-0`,
      "num": 50,
      "rate": 20
    },
    ...[...Array(10)].map((v, index1) => {
      const idx1 = index1 + 1;
      return {
        "level": `${index1 * 10}-${idx1 * 10}`,
        "num": 10 * (idx1 % idx === 0 ? idx1 : idx1 / 2),
        "rate": 10 * (idx1 % idx === 0 ? idx1 : idx1 / 2)
      }
    }), {
      "level": `100-100`,
      "num": 50,
      "rate": 20
    }];
    return {
      questionId: `q${idx}`,
      questionName: `题目${idx}`,
      totalScore: scores
    }
  })
  data.scoreStatis.questionScore = questionScore;

  const statis = [...Array(10)].map((v, index) => {
    const idx = index + 1;
    return {
      "questionNo": `q${idx}`,
      "questionName": `题目(${idx})`,
      "mark": 20,  // 满分
      "avgScore": 60
    }
  });

  const examQuestionList = [{
    "classId": `FULL`,            // 本次考试+本校+所有班级
    "className": `本次考试`,          // CAMPUS_ID=FULL 显示所有学校
    "campusId": `FULL`,           // CAMPUS_ID=XX   显示所有班级
    "campusName": `本次考试`,
    "avgScore": 60,
    "mark": 100, // 试卷满分
    statis,
  }, {
    "classId": `FULL1`,            // 本次考试+本校+所有班级
    "className": `本校`,          // CAMPUS_ID=FULL 显示所有学校
    "campusId": `FULL1`,           // CAMPUS_ID=XX   显示所有班级
    "campusName": `本校`,
    "avgScore": 60,
    "mark": 100, // 试卷满分
    statis,
  }]
  data.examQuestionList = examQuestionList;

  const questionList = [...Array(20)].map((v, index) => {
    const idx = index + 1;
    return {
      "classId": `c${idx}`,            // 本次考试+本校+所有班级
      "className": `一年级(${idx})班`,          // CAMPUS_ID=FULL 显示所有学校
      "campusId": `cp${idx}`,           // CAMPUS_ID=XX   显示所有班级
      "campusName": `广中市第(${idx})中学`,
      "avgScore": 60,
      "mark": 100, // 试卷满分
      statis,
    }
  });

  data.questionList = questionList;

  res.send(new IResp(data));
}

// REPORT-205：统考报告-学情分析
function getExamAnalysis(req, res) {
  const ability = [{
    "classId": "FULL",
    "className": "本次考试",
    type: 'EXAM',
    "statis": [{
      "abilityCode": "听力理解策略",
      "abilityAvgScore": 0.7
    }, {
      "abilityCode": "语用表达能力",
      "abilityAvgScore": 0.6
    },
    {
      "abilityCode": "听力理解能力",
      "abilityAvgScore": 0.8
    },
    {
      "abilityCode": "口头表达能力",
      "abilityAvgScore": 1
    }, {
      "abilityCode": "语用理解能力",
      "abilityAvgScore": 0.5
    }, {
      "abilityCode": "组织知识运用能力",
      "abilityAvgScore": 0.6
    }]
  }, {
    "classId": "CAMPUS",
    "className": "本校",
    type: 'CAMPUS',
    "statis": [{
      "abilityCode": "听力理解策略",
      "abilityAvgScore": 0.5
    }, {
      "abilityCode": "语用表达能力",
      "abilityAvgScore": 0.2
    },
    {
      "abilityCode": "听力理解能力",
      "abilityAvgScore": 0.7
    },
    {
      "abilityCode": "口头表达能力",
      "abilityAvgScore": 0.4
    }, {
      "abilityCode": "语用理解能力",
      "abilityAvgScore": 0.5
    }, {
      "abilityCode": "组织知识运用能力",
      "abilityAvgScore": 0.9
    }]
  }, {
    "classId": "CLASS",
    "className": "本班",
    type: '',
    "statis": [{
      "abilityCode": "听力理解策略",
      "abilityAvgScore": 0.9
    }, {
      "abilityCode": "语用表达能力",
      "abilityAvgScore": 0.2
    },
    {
      "abilityCode": "听力理解能力",
      "abilityAvgScore": 0.3
    },
    {
      "abilityCode": "口头表达能力",
      "abilityAvgScore": 0.6
    }, {
      "abilityCode": "语用理解能力",
      "abilityAvgScore": 0.8
    }, {
      "abilityCode": "组织知识运用能力",
      "abilityAvgScore": 1
    }]
  }];
  const subquestionList = [...Array(10)].map((v, idx) => {
    const index = idx + 1;
    return {
      "subquestionNo": `sub${index}`,
      "subquestionName": `题目${index}`,
      "discrimination": parseFloat(Math.random().toFixed(2)),
      "difficulty": parseFloat(Math.random().toFixed(2)),
      "scoreRate": parseFloat(Math.random().toFixed(2)),   // 得分率avgScore/fullScore
    }
  });
  const data = {
    abilityStatis: ability,
    subquestionList
  };
  res.send(new IResp(data));
}

//  7.6.6	REPORT-206：统考报告-学生成绩单—分页
function getExamStudentScore(req, res) {
  const data = [
    {
      "studentId": "",
      "studentName": "李梓梁",
      "examNo": "33456756745345678345",
      "className": "七年级1班",
      "paperId": "",   //新增
      "paperName": "2018-2019广州越秀区英…",
      "score": "24",
      "subjectScore": "24", //主观题得分
      "objectScore": "24",  //客观题得分
      "rank": "24", //任务排名 --不限，
      "paperRank": "24", //试卷排名
      "classRank": "24", //班级排名--不限
      "paperClassRank": "24", //试卷班级排名
      "lastClassRank": "24", //上一次排名--确认一下。
      "comments": "作弊|现场报名|补考次数",
      "recentRank": [
        {
          "taskId": "",
          "rank": ""
        }
      ]
    }
  ]



  res.send(new IResp(data));
}


export default {
  'GET /api/report/ue/task/summary': getTaskInfo,
  'GET /api/report/ue/task/exam/summary': getExamOverview,
  'GET /api/report/ue/task/exam/details': getExamAnalysis,
  'GET /api/report/ue/task/details': getExamDetail,
  'GET /api/report/ue/task/students': getStudentList,
  'GET /api/report/uexam-student-scores': getExamStudentScore,
}
