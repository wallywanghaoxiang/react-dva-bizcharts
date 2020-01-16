import paperData from "./paperData.json";
import showData from "./showData.json";
import taskDetail from "./taskDetail.json";
import studentPaperInfo from "./answerData.json";


// 答题列表
const answerList = [{"subquestionNo":"42912493575602176","answerType":"HALF_OPEN_ORAL","studentAnswers":null,"engineResult":{"tokenId":"575931e37172414db45091256dad6608","version":67332,"protocol":16973824,"timestamp":1562924076,"result":{"overall":0,"rank":1,"precision":0.5,"audioInfo":{"duration":2020,"snr":-10,"clipping":0,"volume":49,"code":0},"kernelInfo":{"kernelType":"eval.semi.en","duration":2735}},"request":{"tokenId":"575931e37172414db45091256dad6608","kernelType":"eval.semi.en","attachAudio":true,"rank":1,"precision":0.5,"reference":{"answers":[{"text":"in August"},{"text":"it is in August"},{"text":"it's in August"},{"text":"his birthday is in August"},{"text":"the boy's birthday is in August"}],"questionId":"42912493575602176"}}}},{"subquestionNo":"69e25cf3813d4b99a2f8a21df60dbe35","answerType":"CHOICE","studentAnswers":"A","engineResult":null},{"subquestionNo":"aa7db321c6464a6885c0d793654de8ec","answerType":"CHOICE","studentAnswers":"A","engineResult":null},{"subquestionNo":"56d9712707ae4e7dad97bae93647aa5a","answerType":"GAP_FILLING","studentAnswers":"2","engineResult":null},{"subquestionNo":"85c3e96a62fa4967920d08b181ae66ff","answerType":"GAP_FILLING","studentAnswers":"1","engineResult":null},{"subquestionNo":"6bdcd1068ea241429d63a42cce75695b","answerType":"GAP_FILLING","studentAnswers":"2","engineResult":null},{"subquestionNo":"65e395c026da41c785c2ab9e2c51a45e","answerType":"OPEN_ORAL","studentAnswers":null,"engineResult":{"tokenId":"e7fbc05586ab4980b38bdecc1b7da5c9","version":67332,"protocol":16973824,"timestamp":1562924099,"result":{"overall":0,"rank":3,"precision":0.5,"fluency":{"pause":0,"speed":0,"repeat":0,"score":1},"keywords":[{"text":"exercise","exclude":false,"hits":0},{"text":"no","exclude":true,"hits":0},{"text":"Usually","exclude":false,"hits":0},{"text":"computer","exclude":false,"hits":0},{"text":"Sometimes","exclude":false,"hits":0},{"text":"Never","exclude":false,"hits":0}],"audioInfo":{"duration":4060,"snr":-10,"clipping":0,"volume":69,"code":0},"kernelInfo":{"kernelType":"eval.open.en","duration":4009}},"request":{"tokenId":"e7fbc05586ab4980b38bdecc1b7da5c9","kernelType":"eval.open.en","attachAudio":true,"rank":3,"precision":0.5,"reference":{"answers":[{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always does some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks that it is good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks doing exercise is good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library close to his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. Sometimes he watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer when he is at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. Mike thinks it's good for his health. He usually reads books in the library near his house at weekends. He often uses the computer at home. Mike sometimes watches TV with his father. He never goes out for shopping. Mike lives a healthy life"},{"text":"What does Mike do at weekends He always do some sport with his friends. He thinks it's good for his health. Mike usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. Mike never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He likes playing basketball best. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. At weekends He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. He uses it for homework and not for fun. He sometimes watches TV with his father. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He usually reads books in the library near his house. He often uses the computer at home. He sometimes watches TV with his father. It's interesting to watch TV. He likes watching sports games. He never goes out for shopping. He lives a healthy life"},{"text":"What does Mike do at weekends He always gets some exercise with his friends. He thinks it's good for his health. He likes playing basketball best. At weekends he usually reads books in a library near his house. He often uses the computer at home. He uses it for homework and not for fun. He sometimes watches TV with his father. It's interesting to watch TV. He likes watching sports games. He never goes out for shopping. He buys things on the Internet because things on the Internet are cheap. He lives a healthy life."}],"questionId":""},"keywords":[{"weight":20,"exclude":false,"text":"exercise"},{"weight":50,"exclude":true,"text":"no"},{"weight":20,"exclude":false,"text":"Usually"},{"weight":20,"exclude":false,"text":"computer"},{"weight":20,"exclude":false,"text":"Sometimes"},{"weight":20,"exclude":false,"text":"Never "}]}}}];
let answeringNo = "{}";

// 保存临时答案包
const saveAnswer = (req,res)=>{
  const { taskId, studentId, snapshotId, answers } = req.body;
  // 根据条件，将相关数据添加到缓存中
  answers.forEach((item)=>{
    const index = answerList.findIndex(tag=>tag.taskId===taskId&&tag.studentId===studentId&&tag.snapshotId===snapshotId&&tag.subquestionNo===item.subquestionNo);
    if( index >= 0 ){
      answerList.splice(index,1,{
        taskId,
        studentId,
        snapshotId,
        ...item
      });
    }else{
      answerList.push({
        taskId,
        studentId,
        snapshotId,
        ...item
      });
    }
  });
  res.json({responseCode:"200",data:null});
}


// 获取答卷包
const uploadAnswer = (req, res) => {
  studentPaperInfo.data.examStatus = "ES_4";
  setTimeout(() => {
    res.json({
      data : null,
      responseCode: '200',
    });
  }, 500);
};


// 提交学生当前做的题
const saveAnsweringno = (req, res) => {
  const { answeringNo : data } = req.query;
  answeringNo = data;
  setTimeout(() => {
    res.json({
      data : null,
      responseCode: '200',
    });
  }, 500);
};


// 获取学生做任务的情况
const studentPaperInfoFn=(req,res)=>{
  const { data, responseCode } = studentPaperInfo;
  res.json({
    data : {
      ...data,
      answers : [...answerList],
      answeringNo
    },
    responseCode,
  });
}

const pre = "api11";


export default {

  // 获取任务详情
  [`GET /${pre}/tsmk/exam-task/task-detail`] : taskDetail,

  // 获取学生任务的详情
  [`GET /${pre}/tsmk/student-paper-info/:taskId/:paperId/:studentID`] : studentPaperInfoFn,

  // TSMK-804-1：提交学生单题答题
  [`POST /${pre}/tsmk/submit-subanswer`] : saveAnswer,

  // TSMK-806：提交学生当前做的题
  [`GET /${pre}/tsmk/save-answeringno`] : saveAnsweringno,

   // TSMK-804：提交学生答题
   [`POST /${pre}/tsmk/submit-answer`] : uploadAnswer,


   [`GET /${pre}/report/report/paper-snapshot/:taskId/:paperId`] : paperData,
   [`GET /${pre}/tsmk/report/question-edit-render-meta`] : showData,

};
