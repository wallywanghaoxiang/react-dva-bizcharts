import {
  MatchDictionary,
  MatchTpye,
} from '@/frontlib/utils/utils';
import { formatMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  toGuidance: { id: 'app.listen.to.guidance', defaultMessage: '听指导' },
  toTips: { id: 'app.listen.to.tips', defaultMessage: '听提示' },
  introLabel: { id: 'app.open.book.intro.label', defaultMessage: '开卷介绍' },
  waiting: { id: 'app.waiting', defaultMessage: '请等待' },
  answerQuestion: { id: 'app.please.answer', defaultMessage: '请答题' },
  SpeechTimes: { id: 'app.speech.times', defaultMessage: '第&0&遍' },
  Countdown: { id: 'app.countdown', defaultMessage: '倒计时&0&秒' },
  AudioRecording: { id: 'app.audio.recording', defaultMessage: '录音中' },
});



/**
 *跟读模仿插件动态脚本
 *
 * @author tina.zhang
 * @date 2019-03-14
 * @export
 * @param {*} paperData
 * @param {*} i
 * @param {*} mains
 * @param {*} paperInstance
 * @param {*} dataType
 * @param {*} pattern
 * @param {*} questions
 */
export function PluginScript(paperData,i,mains,paperInstance,dataType,pattern,questions) {
  let hintsObject = {};
  for (let m in mains[i].questions) {
      pattern = paperInstance[i - 1].pattern;
      console.log("pattern",pattern)
      questions = paperInstance[i - 1].questions[m];
      mains[i].questions[m].scripts = [];

      let questionId_flag = false;
      if (questions == null) {
        questionId_flag = true;
      }
      if (m == 0) {
        if (pattern.mainPatterns.questionPatternInstanceAudio) {
          mains[i].questions[m].scripts.push({
            stepPhase: 'TITLE',
            stepType: 'PLAY_AUDIO',
            stepLabel: MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
            resourceUrl: pattern.mainPatterns.questionPatternInstanceAudio || '',
            time: pattern.mainPatterns.questionPatternInstanceAudioTime || 5,
            subMappingIndex: ["-1"],
            showSubFocus: "N"
          });
        }
        if (pattern.mainPatterns.answerGuideAudio && pattern.mainPatterns.answerGuideText != "NO_GUIDE") {
          mains[i].questions[m].scripts.push({
            stepPhase: 'MAIN_GUIDE',
            stepType: 'WAITING',
            stepLabel: MatchDictionary(dataType, 'MAIN_GUIDE') || formatMessage(messages.toGuidance),
            resourceUrl: pattern.mainPatterns.answerGuideAudio || '',
            time: pattern.mainPatterns.answerGuideAudioTime || 5,
            subMappingIndex: ["-1"],
            showSubFocus: "N"
          });
        }


        if (paperData.config && paperData.config.mainGuideSinglePage == "Y") {
          if (pattern.mainPatterns.answerGuideDelay && pattern.mainPatterns.answerGuideDelay != 0) {
            mains[i].questions[m].scripts.push({
              stepPhase: 'MAIN_GUIDE',
              stepType: 'WAITING',
              stepLabel: formatMessage(messages.waiting),
              resourceUrl: '',
              time: pattern.mainPatterns.answerGuideDelay || 5,
              subMappingIndex: ["-1"],
              showSubFocus: "N"
            });
          }
        }
      }

      if (pattern.subQuestionPatterns[m].hintAudio) {
        mains[i].questions[m].scripts.push({
          stepPhase: 'QUESTION_INFO',
          stepType: 'WAITING',
          stepLabel: MatchDictionary(dataType, 'QUESTION_INFO') || formatMessage(messages.toGuidance),
          resourceUrl: pattern.subQuestionPatterns[m].hintAudio || '',
          time: pattern.subQuestionPatterns[m].hintAudioTime || 5,
          subMappingIndex: ["-1"],
          showSubFocus: "N"
        });
      }
      let questionsData = questions && questions.data && questions.data.subQuestion || null;
      let tones = [];
      if (pattern.tones) {
        tones = pattern.tones;
      }
      
      for(let p = 0 ;p < pattern.mainPatterns.subQuestionStemListening; p++){
        let str = formatMessage(messages.SpeechTimes,{0:0});
        if(questions && questions.data.mainQuestion['stemAudio']){
          str = str.split("&0&")[0] + (Number(p) + 1) + str.split("&0&")[1];
          if (paperData.config && paperData.config.showOrdinal == "N") {
            str = "";
          }
        }else{
          str = "";
        }

        if (p != 0 && pattern.audioGapHints && pattern.audioGapHints.stemListeningHintTime) {
          mains[i].questions[m].scripts.push({
            stepPhase: "TITLE",
            stepType: "PLAY_AUDIO", //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
            stepLabel: MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
            resourceUrl: pattern.audioGapHints.stemListeningHint || '',
            time: pattern.audioGapHints.stemListeningHintTime,
            subMappingIndex: ["-1"],
            tone: "TYPE_00",
            showSubFocus: "N"
          });
        }
        if ((Number(p) + 1) % 2 == 0 && questions && questions.data.mainQuestion['stemAudio2'] != "" && questions.data.mainQuestion['stemAudio2'] != null && questions.data.mainQuestion['stemAudio2'] != undefined) {
          mains[i].questions[m].scripts.push({
            stepPhase: 'LISTENING_PHASE',
            stepType: 'PLAY_AUDIO',
            stepLabel: (MatchDictionary(dataType, 'LISTENING_PHASE') || "听原音") + '|' + str,
            resourceUrl: questions && questions.data.mainQuestion['stemAudio2'] || '',
            time: questions && questions.data.mainQuestion['stemAudioTime2'] || 5,
            subMappingIndex: ["-1"],
            tone: MatchTpye(tones, "stemListening") || "TYPE_00",
          });
        } else {
          if ((questions && questions.data.mainQuestion['stemAudio'] != "" && questions.data.mainQuestion['stemAudio']!= null && questions.data.mainQuestion['stemAudio'] != undefined) || questionId_flag) {
            mains[i].questions[m].scripts.push({
              stepPhase: 'LISTENING_PHASE',
              stepType: 'PLAY_AUDIO',
              stepLabel: (MatchDictionary(dataType, 'LISTENING_PHASE') || "听原音") + '|' + str,
              resourceUrl: questions && questions.data.mainQuestion['stemAudio'] || '',
              time: questions && questions.data.mainQuestion['stemAudioTime'] || 5,
              subMappingIndex: ["-1"],
              tone: MatchTpye(tones, "stemListening") || "TYPE_00",
            });
          }
        }
      }
      if(questionsData){
        for(let n in questionsData){
          if (pattern.hints && pattern.hints[m]) {
            hintsObject = getPatternInfoText("subQuestionStemAudioSection", pattern.hints[m], m);

            if (hintsObject && (hintsObject.text != "" || hintsObject.audioTime || hintsObject.audio)) {
              mains[i].questions[m].scripts.push({
                stepPhase: "QUESTION_INFO",
                stepType: "PLAY_AUDIO",
                stepLabel: MatchDictionary(dataType, 'QUESTION_INFO') || formatMessage(messages.toGuidance),
                resourceUrl: hintsObject.audio || '',
                time: hintsObject.audioTime || 0,
                subMappingIndex: [n],
                info: hintsObject.text,
                showSubFocus: "Y"
              });
            }
          }

          for(let k = 0 ;k < pattern.mainPatterns.subQuestionReadTime; k++){
            let substr = formatMessage(messages.SpeechTimes,{0:0});
            substr = substr.split("&0&")[0] + (Number(k) + 1) + substr.split("&0&")[1];
            if (paperData.config && paperData.config.showOrdinal == "N") {
              substr = "";
            }
            
            if (n != 0 && pattern.audioGapHints && pattern.audioGapHints.subQuestionStemListeningHintTime) {//听音频之间的音频生成脚本
              mains[i].questions[m].scripts.push({
                stepPhase: "TITLE",
                stepType: "PLAY_AUDIO", //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel: MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                resourceUrl: pattern.audioGapHints.subQuestionStemListeningHint || '',
                time: pattern.audioGapHints.subQuestionStemListeningHintTime,
                subMappingIndex: [n],
                tone: "TYPE_00",
                showSubFocus: "Y"
              });
            }
            if ((Number(m) + 1) % 2 == 0 && questionsData[n]['subQuestionStemAudio2'] != "" && questionsData[n]['subQuestionStemAudio2'] != null && questionsData[n]['subQuestionStemAudio2'] != undefined) {
              mains[i].questions[m].scripts.push({
                stepPhase: "SUB_LISTENING_PHASE",
                stepType: "PLAY_AUDIO", //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel: MatchDictionary(dataType, 'SUB_LISTENING_PHASE') + '|' + substr,
                resourceUrl: questionsData[n]['subQuestionStemAudio2'],
                time: (questionsData[n]['subQuestionStemAudioTime2']) || 0,
                aheadDelivery: arr2.aheadDelivery,
                subMappingIndex: [n],
                tone: MatchTpye(tones, "readTime") || "TYPE_00",
              });
            } else {
              if ((questionsData[n]['subQuestionStemAudio'] != "" && questionsData[n]['subQuestionStemAudio'] != null && questionsData[n]['subQuestionStemAudio'] != undefined) || questionId_flag) {
                mains[i].questions[m].scripts.push({
                  stepPhase: "SUB_LISTENING_PHASE",
                  stepType: "PLAY_AUDIO", //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                  stepLabel: MatchDictionary(dataType, 'SUB_LISTENING_PHASE') + '|' + substr,
                  resourceUrl: questionsData[n]['subQuestionStemAudio'],
                  time: (questionsData[n]['subQuestionStemAudioTime']) || 5,
                  subMappingIndex: [n],
                  tone: MatchTpye(tones, "readTime") || "TYPE_00",
                });
              }
            }
          }

          if (pattern.hints && pattern.hints[m]) {
            hintsObject = getPatternInfoText("subQuestionAnswerSection", pattern.hints[m], m);
            if (hintsObject && (hintsObject.text != "" || hintsObject.audioTime || hintsObject.audio)) {
              mains[i].questions[m].scripts.push({
                stepPhase: "QUESTION_INFO",
                stepType: "PLAY_AUDIO",
                stepLabel: MatchDictionary(dataType, 'QUESTION_INFO') || formatMessage(messages.toGuidance),
                resourceUrl: hintsObject.audio || '',
                time: hintsObject.audioTime || 0,
                subMappingIndex: [n],
                info: hintsObject.text,
                showSubFocus: "Y"
              });
            }
          }
          mains[i].questions[m].scripts.push({
            stepPhase: 'SUB_RECORD_PHASE',
            stepType: 'RECORD',
            stepLabel: (MatchDictionary(dataType, 'SUB_RECORD_PHASE') || "开始录音|" + formatMessage(messages.AudioRecording) + "|录音结束") + '|' + formatMessage(messages.Countdown),
            time: pattern && pattern.mainPatterns['answerTime'],
            aheadDelivery: pattern && pattern.mainPatterns['aheadDelivery'],
            tone: MatchTpye(tones, "answerTime") || "TYPE_00",
            subMappingIndex: [n],
            recordHints: (paperData.config && paperData.config.recordHints) || { start: "Y", end: "Y" }
          });
        }
      }

      if (pattern.interval) {
        if (pattern.interval[m][0]) {
          mains[i].questions[m].scripts.push({
            stepPhase: 'INTERVAL',
            stepType: 'WAITING',
            stepLabel: MatchDictionary(dataType, 'INTERVAL') || '空闲中',
            resourceUrl: pattern.interval[m][0].audioType,
            time: pattern.interval[m][0].delay,
            subMappingIndex: ["-1"],
            showSubFocus: "Y"
          });
        }
      }

      for (let n in mains[i].questions[m].scripts) {
        mains[i].questions[m].scripts[n].index = n;
        mains[i].questions[m].scripts[n].isPlugin = true;
      }
  }
}


/**
 *跟读模仿评分处理
 *
 * @author tina.zhang
 * @date 2019-03-14
 * @export
 * @param {*} paperData
 * @param {*} masterData
 */
export function PluginScroing(paperData,masterData) {
    let staticIndex = masterData.staticIndex;
    let ItemData = paperData.paperInstance[staticIndex.mainIndex - 1];
    let scroe = ItemData.pattern.mainPatterns.fullMark;
    let answers = null;

    let markRatios = masterData.mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].markRatio;
    let sequenceNumber = masterData.mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;
    answers = {
        "questionId":ItemData.questions[staticIndex.questionIndex].id,
        "questionCode":ItemData.pattern.questionPatternCode,
        "questionPatternType":ItemData.pattern.questionPatternType,
        "questionPatternId":ItemData.pattern.questionPatternId,
        "mainOrderIndex":staticIndex.mainIndex - 1,
        "rawOrderIndex":staticIndex.questionIndex,
        "isPlugin":true, // 是否插件评分
        "markRatio":markRatios,
        "precision":0.5/Number(markRatios),
        "answer":{
            "mainQuestionAnswer":{
              "answerType":"CLOSED_ORAL",
              "mark":scroe,
              "score":ItemData.questions[staticIndex.questionIndex].data.receivePoints,
              "manualScore":"",
            },
            "subQuestionAnswers":null,
            "groups":[
                {
                    "answers":{
    
                    }
                },
                {
                    "answers":{
    
                    }
                }
            ]
        }
        
    }

    let ItemSubQuestions = ItemData.questions[staticIndex.questionIndex].data.subQuestion;
    let subQuestionAnswers = [];
    for(let i in ItemSubQuestions){
      subQuestionAnswers.push({
        id:ItemSubQuestions[i].id,
        answerType:"CLOSED_ORAL",
        answerAudioId:ItemSubQuestions[i].answerValue && ItemSubQuestions[i].answerValue.tokenId,
        evaluationEngine:ItemSubQuestions[i].evaluationEngineInfo,
        engineResult:ItemSubQuestions[i].answerValue,
        engineRequest:ItemSubQuestions[i].answerValue,
      })
    }
    answers.subQuestionAnswers = subQuestionAnswers;

    return answers
}


/**
 * 筛选提示语逻辑
 * @Author   tina.zhang
 * @DateTime 2019-01-18T14:32:01+0800
 * @param    {[type]}                 hintData [description]
 * @param    {[type]}                 type     [description]
 */
export function pluginFilterPrompt(hintData, type, subIndex = 0) {

  let returnData = null;
  if(hintData){
    if (type == "Y") { //合并答题
      returnData = hintData.mainHints;
    } else {
      if (hintData.subHints) {
        let newArr = JSON.parse(JSON.stringify(hintData.mainHints));
        for (let i in newArr) {
          for (let j in hintData.subHints[subIndex]) {
            if (newArr[i].name == hintData.subHints[subIndex][j].name) {
              newArr[i] = hintData.subHints[subIndex][j]
            }
          }
        }

        returnData = newArr;
      } else {
        returnData = hintData.mainHints;
      }
    }
  }

  let filterData = [];
  for (let m in returnData) {
    if (returnData[m].audio == "" && returnData[m].text == "") {

    } else {
      filterData.push(returnData[m]);
    }
  }

  return filterData;
}


/**
 *跟读模仿评语生成
 *
 * @author tina.zhang
 * @date 2019-03-14
 * @export
 * @param {*} paperData
 * @param {*} masterData
 */
export function PluginEvaluateStr(resultJson) {
  let str = "";
  if(resultJson.result.rank>=95 && resultJson.result.rank<=100){
    str = "你的整体表现太出色啦！";
  }else if(resultJson.result.rank>=85 && resultJson.result.rank<95){
    str = "你的整体表现很棒！";
  }else if(resultJson.result.rank>=70 && resultJson.result.rank<85){
    str = "你的整体表现很棒！";
  }else if(resultJson.result.rank>=55 && resultJson.result.rank<70){
    str = "请继续努力！";
  }else if(resultJson.result.rank<55){
    str = "你的整体表现有点差强人意哦！";
  }

  const returnStr = (type,score) => {
    let evaluateStr = "";
    switch(score){
      case 1 :
        if(type == "pronunciation"){
          evaluateStr = "发音有很多不准确，再多多练习";
        }
        if(type == "integrity"){
          evaluateStr = "只读了个别句子或某些单词或短语";
        }
        if(type == "fluency"){
          evaluateStr = "朗读不流利";
        }
        break;
      case 2 :
        if(type == "pronunciation"){
          evaluateStr = "发音不够准确，需要继续努力";
        }
        if(type == "integrity"){
          evaluateStr = "仅读了少数内容";
        }
        if(type == "fluency"){
          evaluateStr = "朗读不够流利";
        }
        break;
      case 3 :
        if(type == "pronunciation"){
          evaluateStr = "发音不够准确，需要继续努力";
        }
        if(type == "integrity"){
          evaluateStr = "读出了多数内容";
        }
        if(type == "fluency"){
          evaluateStr = "朗读基本顺畅";
        }
        break;
      case 4 :
        if(type == "pronunciation"){
          evaluateStr = "发音清晰准确";
        }
        if(type == "integrity"){
          evaluateStr = "完整地读出了全部内容";
        }
        if(type == "fluency"){
          evaluateStr = "朗读流利顺畅";
        }
        break;
    }

    return evaluateStr;
  }

  str = str + returnStr("pronunciation",resultJson.result.pronunciation.score) + ",";
  if(resultJson.result.pronunciation.score>=3 && resultJson.result.fluency.score<3){
    str =str + "但"+ returnStr("fluency",resultJson.result.fluency.score) +"，";
    if(resultJson.result.integrity.score<3){
      str =str +"也"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }else{
      str =str +"不过"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }
  }else if(resultJson.result.pronunciation.score>=3 && resultJson.result.fluency.score>=3){
    str =str + returnStr("fluency",resultJson.result.fluency.score) +"，";
    if(resultJson.result.integrity.score<3){
      str =str +"但"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }else{
      str =str +"也"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }
  }else if(resultJson.result.pronunciation.score<3 && resultJson.result.fluency.score>=3){
    str =str + "但"+ returnStr("fluency",resultJson.result.fluency.score) +"，";
    if(resultJson.result.integrity.score<3){
      str =str +"不过"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }else{
      str =str + returnStr("integrity",resultJson.result.integrity.score) +"。"
    }
  }else if(resultJson.result.pronunciation.score<3 && resultJson.result.fluency.score<=3){
    str =str + returnStr("fluency",resultJson.result.fluency.score) +"，";
    if(resultJson.result.integrity.score<3){
      str =str +"也"+ returnStr("integrity",resultJson.result.integrity.score) +"。"
    }else{
      str =str + "但" + returnStr("integrity",resultJson.result.integrity.score) +"。"
    }
  }

  return str

}

/**
 * 返回提示语信息
 * @Author   tina.zhang
 * @DateTime 2019-01-17T17:37:07+0800
 * @param    {[type]}                 data [description]
 * @param    {[type]}                 type [description]
 * @return   {[type]}                      [description]
 */
function matchHint(data, type){
  for (let i in data) {
    if (data[i].name == type) {
      return data[i]
    }
  }
  return null
}
/**
 * 提示语优化
 * @Author   tina.zhang
 * @DateTime 2019-01-17T14:13:25+0800
 * @param    {[type]}                 hintData [description]
 * @param    {[type]}                 script   [description]
 * @return   {[type]}                          [description]
 */
function  getPatternInfoText(value, hintData, subIndex, allowMultiAnswerMode = "N") {
  let data = null;
  switch (value) {
    case "stemAudioSection":
      data = matchHint(hintData && hintData.mainHints || [], "stemListening");
      break;
    case "stemReadSection":
      data = matchHint(hintData && hintData.mainHints || [], "readTime");
      break;
    case "prepareSection":
      data = matchHint(hintData && hintData.mainHints || [], "prepareTime");
      break;
    case "answerSection":
      data = matchHint(hintData && hintData.mainHints || [], "answerTime");
      break;
    case "subQuestionStemAudioSection":
      // if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
      //   data = matchHint(hintData && hintData.subHints[subIndex] || [], "subQuestionStemListening");
      // }
      // if (data == null) {
        data = matchHint(hintData && hintData.mainHints || [], "subQuestionStemListening");
      // }
      break;
    case "subQuestionStemReadSection":
      if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
        data = matchHint(hintData && hintData.subHints[subIndex] || [], "subQuestionReadTime");
      }
      if (data == null) {
        data = matchHint(hintData && hintData.mainHints || [], "subQuestionReadTime");
      }
      break;
    case "subQuestionPrepareSection":
      if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
        data = matchHint(hintData && hintData.subHints[subIndex] || [], "subQuestionPrepareTime");
      }
      if (data == null) {
        data = matchHint(hintData && hintData.mainHints || [], "subQuestionPrepareTime");
      }
      break;
    case "subQuestionAnswerSection":
      // if (allowMultiAnswerMode == "Y") {
      //   data = matchHint(hintData && hintData.mainHints || [], "answerTime");
      // } else {
      //   if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
      //     data = matchHint(hintData && hintData.subHints[subIndex] || [], "answerTime");
      //   }
      //   if (data == null) {
          data = matchHint(hintData && hintData.mainHints || [], "answerTime");
      // }
      // }
      break;
    default:
      break;
  }
  return data;
}