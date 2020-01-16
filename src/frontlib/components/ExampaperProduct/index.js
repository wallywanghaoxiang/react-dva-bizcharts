/* eslint-disable no-lonely-if */
/* eslint-disable no-undef */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout, message, Modal } from 'antd';
import LeftMenu from './LeftMenu';
import LeftMenuExam from './LeftMenuExam';
import RightContent from './RightContent';
import PaperTop from './Components/PaperTop';
import {
  calculatScore,
  scoringMachine,
  returnSubIndex,
  toChinesNum,
  completionStatistics,
  completionInstanceList,
  assemblyResultData,
  calculatTotalScore,
  GenerateAudioList,
  showWaiting,
  hideLoading,
  isKeyLocked,
  GenerateAnsweredNum,
  ANSWESHEET_VERSION,
  deleteAnswer,
  isNowRecording
} from '@/frontlib/utils/utils';
import { saveQueueInfo } from '@/services/api';
import styles from './index.less';
import VB from '@/frontlib/utils/jssdk/src/VB';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import emitter from '@/utils/ev';
import loading from '@/frontlib/assets/loading.gif';
import DownCount from './Components/DownCount';
import uploading from '@/frontlib/assets/upload.gif';
import {
  showDeviceStatusModal,
  hideDeviceStatusModal,
} from '@/frontlib/components/ExampaperAttempt/Components/PreExamCheck/DeviceStatusModal/api';
import { countDown } from '@/utils/timeHandle';

const messages = defineMessages({
  introLabel: {
    id: 'app.open.book.intro.label',
    defaultMessage: '开卷介绍',
  },
});

@connect(({ examProduct }) => {
  const { exerciseList } = examProduct;
  return { exerciseList };
})
/**
 * 制卷组件
 * paperData 试卷详情
 * ExampaperStatus 当前状态
 *
 *  * @author tina.zhang
 */
class ExampaperProduct extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      mainType: false,
      guideIndex: '',
      answersData: {}, // 答题json数据
      isPlay: true, //练习计时器
      resultPaperList: [],
      paperList: [], //练习结果页面数据
      isConnect: true, // 是否连接学生机
      startExamTime: '',
    };
  }

  componentDidMount() {
    const { paperData, ExampaperStatus, isExamine, invalidate, paperList } = this.props;
    const now = new Date().getTime();
    this.state.startExamTime = now;
    console.log('启动录音插件~~');
    window.ExampaperStatus = this.props.ExampaperStatus;
    if (window.ExampaperStatus === 'EXAM') {
      // 监听教师端指令
      this.receiveInfo();
      this.setState(
        {
          masterData: this.assemblyData(paperData, invalidate),
          answersData: assemblyResultData(paperData),
          paperList: JSON.parse(JSON.stringify(paperList)),
        },
        () => {
          // 保存当前答题的进度
          const { answers, answeringNo } = this.props;
          this.answersRecords = answers || [];
          if (answeringNo && answeringNo && answeringNo.type) {
            const { subIndex, mainIndex, questionIndex, type } = answeringNo;
            this.changeFocusIndex(subIndex, mainIndex, questionIndex, type);
          }
        }
      );
    } else {
      window.vb = new VB();
      this.setState(
        {
          masterData: this.assemblyData(paperData, invalidate),
          answersData: assemblyResultData(paperData),
        },
        () => {
          // 保存当前答题的进度
          const { answers, answeringNo } = this.props;
          this.answersRecords = answers || [];
          if (answeringNo && answeringNo && answeringNo.type) {
            const { subIndex, mainIndex, questionIndex, type } = answeringNo;
            this.changeFocusIndex(subIndex, mainIndex, questionIndex, type);
          }
        }
      );
    }

    localStorage.setItem('isExamine', isExamine);
    localStorage.setItem('ExampaperStatus', ExampaperStatus);
    emitter.removeAllListeners('recycle');
    let self = this;
    emitter.addListener('recycle', x => {
      // 练习其他试卷||结束练习
      console.log('recycle 打包上传试卷', paperData);

      if (x === 'continue') {
        let paperListFalg = false;
        for (let i in paperList) {
          if (paperList[i].packageResult) {
          } else {
            if (paperList[i].paperId != paperData.id) {
              paperListFalg = true;
            }
          }
        }

        if (!paperListFalg) {
          self.sendProgress(self.state.masterData, 'complete');
          x = '';
        }
      }

      // 如果是客户练习模式
      if (ExampaperStatus === 'AFTERCLASS') {
        // 触发 练习完成的回调
        const { onComplete } = this.props;
        if (typeof onComplete === 'function') {
          const { answersData } = this.state;
          // 当前练习完成
          onComplete(answersData);
        }
      } else {
        showWaiting({
          img: loading,
          text:
            formatMessage({ id: 'app.text.zzdbqsd', defaultMessage: '正在打包，请稍等' }) + '..',
        });
        self.archiveFuc(x);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { paperData: nextPaper, invalidate: nextInval } = nextProps;
    const { paperData: currPaper, invalidate: currInval } = this.props;

    if (
      JSON.stringify(nextPaper) !== JSON.stringify(currPaper) ||
      JSON.stringify(nextInval) !== JSON.stringify(currInval)
    ) {
      console.log(nextInval);
      const { masterData } = this.state;
      const newMasterData = this.assemblyData(nextPaper, nextInval);
      newMasterData.staticIndex = masterData.staticIndex;
      this.setState({
        masterData: newMasterData,
      });
    }
  }

  /**
   * 监听教师端指令
   * @Author   tina.zhang
   * @DateTime 2018-12-18T10:23:57+0800
   * @return   {[type]}                 [description]
   */
  receiveInfo = () => {
    const { instructions } = this.props;
    const { sendMS, onReceive, setc, storeData, deviceManager } = instructions;
    const self = this;

    onReceive(e => {
      const { masterData = {}, paperList } = this.state;
      const { paperData } = this.props;
      if (e) {
        const receiveData = e.data;
        switch (e.command) {
          /** 考试中，重写连接 */
          case 'connect':
            console.log('=================connect==================');
            {
              this.state.isConnect = true;
              // 教师端指令状态  连接成功后问教师机现在是在哪一步

              const data = {
                ipAddr: localStorage.getItem('studentIpAddress'),
              };
              sendMS('commandstatus', data, '');

              let newPaperList = [];
              for (let i in paperList) {
                if (
                  Number(paperList[i].paperId) != Number(paperData.id) &&
                  paperList[i].packageResult
                ) {
                  newPaperList.push(paperList[i].packageResult);
                }
              }
              //将当期的信息状态返回给教师机
              sendMS('student:status', {
                ipAddr: localStorage.getItem('studentIpAddress'),
                monitorStatus: 'MS_8',
                answerNum: completionStatistics(masterData),
                instanceList: completionInstanceList(paperData),
                answerCount: masterData.mains.length - 1,
                respondentsObject: newPaperList,
              });
            }
            break;
          case 'commandstatus:return':
            {
              // // 接收到教师端发来的数据指令
              // const resJson = JSON.parse(receiveData);
              // const commandCode = resJson.commandOperationFlag;
              // // "05" //练习/考试结束
              // if (commandCode === '05' && currentStatus !== "end") {
              //   // 如果当前还没有结束考试则，直接关闭考试，并且考试失败
              //   self.setExamFail();
              // } else {
              //   // 其它的状态的时候发送自己的状态给教师机
              //   // 老师发指令 允许考试
              //   const newData = JSON.parse(JSON.stringify(masterData)) || {};
              //   newData.staticIndex = newData.staticIndex || {};
              //   newData.mains = newData.mains || [];
              //   const monitorStatus = currentStatus === "end" ? statusTrans[completeStatus] : statusTrans[currentStatus];
              //   const answerProcess = currentStatus === "end" ? "complete" : toChinesNum(newData.staticIndex.mainIndex) + "_" + (newData.staticIndex.questionIndex + 1);
              //   // 将当期的信息状态返回给教师机
              //   sendMS("student:status", {
              //     ipAddr: localStorage.getItem('studentIpAddress'),
              //     monitorStatus,
              //     answerProcess,
              //     answerNum: newData.staticIndex.mainIndex,
              //     answerCount: newData.mains.length - 1,
              //     duration: new Date().getTime() - startExamTime
              //   });
              // }
            }
            break;
          case 'student:getstatus':
            // 接收到教师端发来的数据指令
            console.log('教师机发送到哦');
            let newPaperList = [];
            for (let i in paperList) {
              if (
                Number(paperList[i].paperId) != Number(paperData.id) &&
                paperList[i].packageResult
              ) {
                newPaperList.push(paperList[i].packageResult);
              }
            }
            //将当期的信息状态返回给教师机
            sendMS('student:status', {
              ipAddr: localStorage.getItem('studentIpAddress'),
              monitorStatus: 'MS_8',
              answerNum: completionStatistics(masterData),
              instanceList: completionInstanceList(paperData),
              answerCount: masterData.mains.length - 1,
              respondentsObject: newPaperList,
            });

            break;
          // 开始考试
          case 'start:manual':
            // if (!this.props.isLoad && currentStatus !== "failed" && currentStatus !== "preExamCheckError") {
            //   const now = new Date().getTime();
            //   self.setState({ currentStatus: 'Examination', startExamTime: now }, () => {
            //     const { currentStatus, masterData = {} } = this.state;
            //     // 老师发指令 允许考试
            //     const newData = JSON.parse(JSON.stringify(masterData)) || {};
            //     newData.staticIndex = newData.staticIndex || {};
            //     newData.mains = newData.mains || [];
            //     // 将当期的信息状态返回给教师机
            //     sendMS("student:status", {
            //       ipAddr: localStorage.getItem('studentIpAddress'),
            //       monitorStatus: statusTrans[currentStatus],
            //       answerProcess: toChinesNum(newData.staticIndex.mainIndex) + "_" + (newData.staticIndex.questionIndex + 1),
            //       answerNum: newData.staticIndex.mainIndex,
            //       answerCount: newData.mains.length - 1,
            //     });
            //   });
            // } else {
            //   // 老师发指令 允许考试
            //   const newData = JSON.parse(JSON.stringify(masterData)) || {};
            //   newData.staticIndex = newData.staticIndex || {};
            //   newData.mains = newData.mains || [];
            //   // 将当期的信息状态返回给教师机
            //   sendMS("student:status", {
            //     ipAddr: localStorage.getItem('studentIpAddress'),
            //     monitorStatus: statusTrans[currentStatus],
            //     answerProcess: toChinesNum(newData.staticIndex.mainIndex) + "_" + (newData.staticIndex.questionIndex + 1),
            //     answerNum: newData.staticIndex.mainIndex,
            //     answerCount: newData.mains.length - 1,
            //   });
            // }
            break;

          /* 回收试卷 */
          case 'recycle':
            console.log('==========回收试卷===========');
            this.recyclePaper();
            break;

          /* 结束考试 */
          case 'stop:manual':
            vb.isKeyLocked = 'special';
            emitter.emit('recycle', ''); //回收试卷包
            //当学生机结束练习后，发送
            storeData({ binessStatus: 'MS_16' });
            // setTimeout(()=>{
            //   router.push('/student/download/paper/result');
            // },1000)
            break;
          case 'close':
            // vb.close();
            break;
          case 'exit':
            vb.close();
            break;
          case 'clean':
            console.log('==========考前检测过程中接受到清屏操作===========');
            // 获取的清屏操作的时候，默认直接刷新页面到教师机，防止上次考试的影响带入此次考试中
            window.location.href = '/student';
            // router.push('/student');
            // 并且关闭弹框
            // hideDeviceStatusModal();
            break;
          case 'modify:number':
            {
              // 老师端修改座位号回掉
              const resJson = JSON.parse(e.data);
              const { number } = resJson;
              localStorage.setItem('number', number);
              // 修改页面上的座位号
              this.setState({ number });
              const teacherIpAddress = localStorage.getItem('teacherIpAddress');

              const params = { number, teacherIpAddress };

              //  更新学生机的AGENT配置信息
              setc({
                params,
                sucessCallback: () => {},
                failCallback: () => {
                  message.warning(
                    formatMessage({ id: 'app.text.connectfail', defaultMessage: '连接失败' })
                  );
                },
              });
            }
            break;

          case 'disconnect':
            console.log('==============disconnect=================');
            this.state.isConnect = false;
            break;

          case 'taskStop': {
            const resJson = JSON.parse(e.data);
            console.log('================taskStop=================');
            // 弹框提示“任务被XX教师终止”，5S后自动转到考试训练等待页
            Modal.info({
              title: formatMessage({ id: 'app.message.tip', defaultMessage: '提示' }),
              icon: null,
              centered: true,
              width: 500,
              content: <DownCount teacherName={resJson.msgInfo} />,
              okButtonProps: { style: { display: 'none' } },
            });
          }
          case 'beforeProcess':
            vb.isKeyLocked = 'special';
            this.archiveFucpackage();
            break;

          default:
            break;
        }
      }
    });

    // 监听耳机掉落，判断

    // console.log(script);
    // script.stepPhase RECORD_PHASE   SUB_RECORD_PHASE
    // emitter  toggleExamStatus

    // 掉耳机(MIC)的回调
    // window.vb.getRecorderManager().onDeviceStateChanged((tag) => {
    //   self.watchEarEvent(tag);
    // });
    deviceManager.addListener('deviceStateChanged', ({ state, data }) => {
      const { player, recorder } = data;
      this.player = player;
      this.recorder = recorder;
      self.watchEarEvent(state);
    });
  };

  // 耳机的监听事件

  watchEarEvent = state => {
    const { instructions } = this.props;

    // 如果是耳机连上的事件则，做如下事件
    // 1、设备检测阶段中  耳机掉落出现弹窗，耳机连上重新进入设备检测页面
    // 2、其它阶段，判断是否有弹框如果有关闭
    if (state === 'online') {
      hideDeviceStatusModal();
      return;
    }

    // 耳机掉落的监听事件，做如下操作
    if (state === 'offline') {
      this.earStatus = false;
      const doModal = () => {
        this.func = showDeviceStatusModal({
          dataSource: {
            instructions,
            recorder: this.recorder,
            player: this.player,
          },
          callback: () => {
            doModal();
          },
        });
      };
      // 只有考中才有该弹窗口
      doModal();
    }
  };

  reLoadPaperData() {
    this.props.index.reLoadPaperData();
  }

  reLoadVerifiesData() {
    const { masterData } = this.state;
    this.props.index.reLoadVerifiesData(masterData.staticIndex);
  }

  /**
   * 特殊题型插件评分
   * @author tina.zhang
   * @date 2019-03-14
   * @memberof ExampaperProduct
   */
  SpecialPluginScoring() {
    const { paperData, invalidate } = this.props;
    const { masterData, answersData } = this.state;
    let staticIndex = masterData.staticIndex;
    if (answersData.answerInfo[staticIndex.mainIndex - 1] == undefined) {
      answersData.answerInfo[staticIndex.mainIndex - 1] = {};
    }
    answersData.answerInfo[staticIndex.mainIndex - 1].dataVersion = ANSWESHEET_VERSION;
    if (answersData.answerInfo[staticIndex.mainIndex - 1].answers == undefined) {
      answersData.answerInfo[staticIndex.mainIndex - 1].answers = [];
    }

    let frontEndModuleName = '';
    if (
      masterData.staticIndex.mainIndex > 0 &&
      paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.patternPlugin
    ) {
      frontEndModuleName =
        paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.patternPlugin
          .frontEndModuleName;
    }
    const { PluginScroing } = require('@/frontlib/' + frontEndModuleName + 'Plugin/utils');
    answersData.answerInfo[staticIndex.mainIndex - 1].answers[
      staticIndex.questionIndex
    ] = PluginScroing(paperData, masterData);
    console.log(answersData);
    let newMasterData = this.assemblyData(paperData, invalidate);
    newMasterData.staticIndex = masterData.staticIndex;
    this.setState({
      masterData: newMasterData,
    });
  }

  /**
   * 题型正常评分
   * @author tina.zhang
   * @date 2019-03-14
   * @param {*} data
   * @param {*} questionData
   * @param {*} preStaticIndex
   * @memberof ExampaperProduct
   */
  scoringMachine(data, questionData, preStaticIndex) {
    const { paperData, invalidate } = this.props;
    const { masterData, answersData } = this.state;
    let staticIndex = masterData.staticIndex;
    if (preStaticIndex) {
      staticIndex = preStaticIndex;
    }
    let scroe = calculatScore(staticIndex, paperData);
    // console.log('计算分数:', scroe, preStaticIndex);
    let res = scoringMachine(masterData, data, scroe, questionData, preStaticIndex);

    let patternType =
      paperData.paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType;
    if (answersData.answerInfo[staticIndex.mainIndex - 1] == undefined) {
      answersData.answerInfo[staticIndex.mainIndex - 1] = {};
    }
    if (patternType == 'COMPLEX') {
      if (
        answersData.answerInfo[staticIndex.mainIndex - 1].answers == undefined ||
        answersData.answerInfo[staticIndex.mainIndex - 1].answers[0] == undefined
      ) {
        answersData.answerInfo[staticIndex.mainIndex - 1].answers = [res.answers];
      }

      answersData.answerInfo[staticIndex.mainIndex - 1].answers[0].answer.groups[
        staticIndex.questionIndex
      ] = res.answers.answer.groups[staticIndex.questionIndex];
    } else {
      if (answersData.answerInfo[staticIndex.mainIndex - 1].answers == undefined) {
        answersData.answerInfo[staticIndex.mainIndex - 1].answers = [];
      }
      answersData.answerInfo[staticIndex.mainIndex - 1].answers[staticIndex.questionIndex] =
        res.answers;
    }
    // if(window.ExampaperStatus === "EXAM"){
    answersData.startTime = this.state.startExamTime;
    answersData.deliverTime = new Date().getTime();
    answersData.duration = new Date().getTime() - this.state.startExamTime;
    // }
    console.log(answersData);
    console.log('总分：' + calculatTotalScore(answersData.answerInfo));
    answersData.totalScore = calculatTotalScore(answersData.answerInfo) || 0;

    // console.log(res)
    let newMasterData = this.assemblyData(paperData, invalidate);
    newMasterData.staticIndex = masterData.staticIndex;

    this.onAnswerQuestion(res.answers, staticIndex);

    if (patternType === 'NORMAL') {
      if (
        paperData.paperInstance[newMasterData.staticIndex.mainIndex - 1].questions[0] &&
        paperData.paperInstance[newMasterData.staticIndex.mainIndex - 1].questions[0].data
          .mainQuestion.answerType == 'GAP_FILLING'
      ) {
        // 普通填空不需要刷新 修复VB-5617 bug
        return;
      }
    }

    this.setState({
      masterData: newMasterData,
    });
  }

  /**
   * 对每一题进行评分校验以后，通过回调保存当前答题的数组
   * @param {*} data
   * @param {*} invalidate
   */
  onAnswerQuestion = (res, staticIndex = {}) => {
    const getAnswerList = obj => {
      const { answer = {}, questionPatternType, id } = obj || {};
      this.answersRecords = this.answersRecords || [];
      // 根据不同的体型，保存不同的数据
      const result = [];
      const { groups = [], mainQuestionAnswer = {}, subQuestionAnswers = [] } = answer;
      if (questionPatternType === 'NORMAL') {
        // 普通题型
        const param = this.handleAnswerQuestionParams({ ...mainQuestionAnswer, id });
        if (param) {
          result.push(result);
        }
        return param ? [param] : [];
      }

      if (questionPatternType === 'TWO_LEVEL') {
        // 二层题型
        subQuestionAnswers.forEach(item => {
          const param = this.handleAnswerQuestionParams(item);
          if (param) {
            result.push(param);
          }
          return result;
        });
      }

      if (questionPatternType === 'COMPLEX') {
        // 复合题型
        const { questionIndex = 0 } = staticIndex;
        if (groups[questionIndex]) {
          const list = getAnswerList(groups[questionIndex]);
          result.push(...list);
          return result;
        }
      }

      return result;
    };

    const result = getAnswerList(res);

    // 判断是否在 this.anserRecord 中存在，如果存在则判断值是否变动，
    // 如果有变动，则变动的数组，抛给 父组件
    const changeList = result.filter(item => {
      const index = this.answersRecords.findIndex(tag => tag.subquestionNo === item.subquestionNo);
      if (index >= 0) {
        // 判断值是否改变
        if (JSON.stringify(this.answersRecords[index]) === JSON.stringify(item)) {
          return false;
        }
        this.answersRecords.splice(index, 1, item);
        return true;
      }
      this.answersRecords.push(item);
      return true;
    });

    const { onAnswerChange } = this.props;
    if (typeof onAnswerChange === 'function') {
      onAnswerChange(changeList, this.answersRecords);
    }
  };

  // 根据题目的类别，获取临时存储数据
  handleAnswerQuestionParams = data => {
    const { answerType, id, engineResult, answerText, answerOptionId, answerOptionIndex } =
      data || {};
    const defaultParams = {
      subquestionNo: null,
      answerType: null,
      studentAnswers: null,
      engineResult: null,
    };
    // 选择题
    if (answerType === 'CHOICE') {
      if (typeof answerOptionId === 'undefined') return false;
      return {
        ...defaultParams,
        subquestionNo: id,
        answerType,
        studentAnswers: answerOptionIndex,
      };
    }
    // 填空题
    if (answerType === 'GAP_FILLING') {
      if (typeof answerText === 'undefined') return false;
      return {
        ...defaultParams,
        subquestionNo: id,
        answerType,
        studentAnswers: answerText,
      };
    }
    // 其它的口语题
    if (typeof engineResult === 'undefined') return false;
    return {
      ...defaultParams,
      subquestionNo: id,
      answerType,
      engineResult,
    };
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-17
   * @copyright 生成主控数据
   * @param     {[type]}    data 试卷详情
   * @return    {[type]}         [description]
   */
  assemblyData(data, invalidate) {
    // console.log('生成主控数据', invalidate);
    const master = {
      controlStatus: 'STATIC', //PLAY动态播放/PAUSE动态暂停/STATIC静态待命
      isRedording: 'N', //启动录音时，大部分事件失效，通过这个信号量控制
      scene: 'EDIT', //SHOW展示/EDIT编辑试卷/CORRECT修正/VERIFY校对//EXERCISE练习
      coverRate: data.coverRate, //任务完成度百分比
      paperTime: (data.paperTime && countDown(data.paperTime)) || 0, //试卷时间
      allowChooseQuestion: data.allowChooseQuestion,
      staticIndex: {
        mainIndex: 0, //大题序号，注意0为开卷介绍，从1开始是标准题型，初始0
        questionIndex: 0, //题目序号，复合题型为子题型序号，初始0
        // "subIndex":0    //小题序号（二层才有，含复合下的二层），初始0
      },
      mains: [],
    };
    let paperInstance = data.paperInstance;
    let questions = new Array(paperInstance.length + 1);

    let paperHeadStatus = 0;

    if (data.paperHead.paperHeadName != undefined && data.paperHead.paperHeadName != '') {
      paperHeadStatus = 100;
      //判断校对
      const { ExampaperStatus } = this.props;
      if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
        if (invalidate && invalidate.paperHead) {
          let paperHeadVo = invalidate.paperHead;
          console.log(paperHeadVo.verifyStatus);
          if (paperHeadVo.verifyStatus == 300) {
            paperHeadStatus = 100;
          }
          if (paperHeadVo.verifyStatus == 0) {
            paperHeadStatus = 300;
          }
          if (
            paperHeadVo.verifyStatus == '200' ||
            paperHeadVo.verifyStatus == '100' ||
            paperHeadVo.verifyStatus == '250'
          ) {
            paperHeadStatus = 200;
          }
          // if ((paperHeadVo.verifyStatus == '200' || paperHeadVo.verifyStatus == '250') && ExampaperStatus == 'VALIDATE') {
          //   paperHeadStatus = 0;
          // }
        } else {
          paperHeadStatus = 0;
        }
      }
    }
    questions[0] = {
      //单个大题（含开卷）
      index: 0,
      type: 'INTRODUCTION', //开卷介绍
      label: formatMessage(messages.introLabel),
      multipleQuestionPerPage: 'N', //一页多题
      questions: [
        {
          //单个题目
          index: 0,
          subs: ['i'], //subs里面是小题题序的数组，主要用于生成导航
          type: 'INTRODUCTION',
          status: paperHeadStatus, //状态，不同视图下对应不同的内容，但颜色和数字统一
          pageSplit: 'N',
          answerStatus: window.ExampaperStatus === 'EXAM' ? 'Y' : 'N',
        },
      ],
    };
    for (let i in paperInstance) {
      let m = Number(i) + 1;
      if (paperInstance[i].type == null || paperInstance[i].type == 'PATTERN') {
        let pattern = paperInstance[i].pattern;
        questions[m] = {};
        questions[m].index = m;
        questions[m].type = pattern.questionPatternType;
        if (pattern.mainPatterns.questionPatternInstanceName != undefined) {
          questions[m].newLabel =
            (pattern.mainPatterns.questionPatternInstanceSequence || '') +
            pattern.mainPatterns.questionPatternInstanceName;
        }
        questions[m].label =
          pattern.mainPatterns.questionPatternInstanceName || pattern.questionPatternName;
        questions[m].multipleQuestionPerPage = 'N';
        if (pattern.questionPatternType == 'COMPLEX') {
          //复合题型拼装数据
          let patternGroups = pattern.groups;
          questions[m].questions = new Array(Number(patternGroups.length));
          for (let j = 0; j < Number(patternGroups.length); j++) {
            //复合题型下面的题型是种类数
            questions[m].questions[j] = {};

            if (
              this.props.showData &&
              this.props.showData[pattern.questionPatternId] &&
              this.props.showData[pattern.questionPatternId].structure.groups[j].structure.flowInfo
            ) {
              //允许合并答题
              questions[m].questions[j].allowMultiAnswerMode = this.props.showData[
                pattern.questionPatternId
              ].structure.groups[j].structure.flowInfo.allowMultiAnswerMode;
            } else {
              questions[m].questions[j].allowMultiAnswerMode = 'N';
            }

            if (patternGroups[j].pattern.hints) {
              questions[m].questions[j].hints = patternGroups[j].pattern.hints[0];
            }

            questions[m].questions[j].type = patternGroups[j].pattern.questionPatternType;
            questions[m].questions[j].markRatio =
              patternGroups[j].pattern.mainPatterns.markRatio || '1';
            questions[m].questions[j].index = Number(j);

            if (
              paperInstance[i].questions[0] != null &&
              paperInstance[i].questions[0].id != undefined
            ) {
              questions[m].questions[j].status = 100;
              //制卷完成判断校对
              const questionID = paperInstance[i].questions[0].id;

              questions[m].questions[j].answerStatus = 'N';
              const { ExampaperStatus } = this.props;
              if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
                questions[m].questions[j].status = 0;
                if (invalidate && invalidate.mains) {
                  console.log(questionID + '++++++');
                  invalidate.mains.map(item => {
                    if (item && item.verifies) {
                      item.verifies.map(vo => {
                        if (vo.questionId == questionID) {
                          console.log(vo.verifyStatus + '++++');
                          if (vo.verifyStatus == 300) {
                            questions[m].questions[j].status = 100;
                          }
                          if (vo.verifyStatus == 0) {
                            questions[m].questions[j].status = 300;
                          }
                          if (
                            vo.replierName != null ||
                            vo.verifyStatus == '200' ||
                            vo.verifyStatus == '100'
                          ) {
                            questions[m].questions[j].status = 200;
                          }
                          if (
                            (vo.verifyStatus == '200' || vo.verifyStatus == '250') &&
                            ExampaperStatus == 'VALIDATE'
                          ) {
                            questions[m].questions[j].status = 0;
                          }
                          if (vo.verifyStatus == '250' && ExampaperStatus == 'CORRECT') {
                            questions[m].questions[j].status = 200;
                          }
                        }
                      });
                    }
                  });
                }
              }
            } else {
              questions[m].questions[j].status = 0;
            }
            questions[m].questions[j].answerStatus = 'N';

            if (window.ExampaperStatus == 'EXAM') {
              try {
                if (
                  paperInstance[i].questions[0].data.groups[j].data.totalPoints ||
                  paperInstance[i].questions[0].data.groups[j].data.totalPoints == 0
                ) {
                  questions[m].questions[j].answerStatus = 'Y';
                }
              } catch (e) {}
            }

            questions[m].questions[j].pageSplit = 'N';

            questions[m].questions[j].subs = [];
            let patternComplex = patternGroups[j].pattern;
            if (patternComplex.sequenceNumber) {
              questions[m].questions[j].subs = patternComplex.sequenceNumber[0];
            } else {
              for (let l = 0; l < Number(patternComplex.mainPatterns.questionCount); l++) {
                //每道题型的大题个数

                if (patternComplex.questionPatternType == 'NORMAL') {
                  questions[m].multipleQuestionPerPage = 'Y';
                  if (j != 0) {
                    //获取上个题型最大题号
                    let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                    let beforeNum = Number(
                      questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                    );

                    questions[m].questions[j].subs.push(beforeNum + (Number(l) + 1));
                  } else {
                    questions[m].questions[j].subs = [Number(l) + 1];
                  }
                } else if (patternComplex.questionPatternType == 'TWO_LEVEL') {
                  let subQuestionCount = patternComplex.mainPatterns.subQuestionCount; //二层题型小题个数

                  for (let k = 0; k < Number(subQuestionCount); k++) {
                    if (j != 0) {
                      let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                      let beforeNum = Number(
                        questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                      );
                      questions[m].questions[j].subs.push(beforeNum + (Number(k) + 1));
                    } else {
                      questions[m].questions[j].subs.push(Number(k) + 1);
                    }
                  }
                }
              }
            }
          }
        } else {
          //普通，二层题型拼装数据
          questions[m].questions = new Array(Number(pattern.mainPatterns.questionCount));

          for (let j = 0; j < Number(pattern.mainPatterns.questionCount); j++) {
            questions[m].questions[j] = {};
            questions[m].questions[j].type = pattern.questionPatternType;
            questions[m].questions[j].markRatio = pattern.mainPatterns.markRatio || '1';
            questions[m].questions[j].index = Number(j);

            if (pattern.hints) {
              questions[m].questions[j].hints = pattern.hints[j];
            }
            if (this.props.showData && this.props.showData[pattern.questionPatternId]) {
              //允许合并答题
              questions[m].questions[j].allowMultiAnswerMode = this.props.showData[
                pattern.questionPatternId
              ].structure.flowInfo.allowMultiAnswerMode;
            } else {
              questions[m].questions[j].allowMultiAnswerMode = 'N';
            }

            if (
              paperInstance[i].questions[j] != null &&
              paperInstance[i].questions[j].id != undefined
            ) {
              questions[m].questions[j].status = 100;
              //制卷完成判断校对
              const questionID = paperInstance[i].questions[j].id;
              const { ExampaperStatus } = this.props;
              if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
                questions[m].questions[j].status = 0;
                if (invalidate && invalidate.mains) {
                  invalidate.mains.map(item => {
                    if (item && item.verifies) {
                      item.verifies.map(vo => {
                        if (vo.questionId == questionID) {
                          if (vo.verifyStatus == 300) {
                            questions[m].questions[j].status = 100;
                          }
                          if (vo.verifyStatus == 0) {
                            questions[m].questions[j].status = 300;
                          }
                          if (
                            vo.replierName != null ||
                            vo.verifyStatus == '200' ||
                            vo.verifyStatus == '100'
                          ) {
                            questions[m].questions[j].status = 200;
                          }
                          if (
                            (vo.verifyStatus == '200' || vo.verifyStatus == '250') &&
                            ExampaperStatus == 'VALIDATE'
                          ) {
                            questions[m].questions[j].status = 0;
                          }
                          if (vo.verifyStatus == '250' && ExampaperStatus == 'CORRECT') {
                            questions[m].questions[j].status = 200;
                          }
                        }
                      });
                    }
                  });
                }
              }
            } else {
              questions[m].questions[j].status = 0;
            }
            if (pattern.questionPatternType == 'NORMAL') {
              //普题型分页
              if (pattern.pageSplit) {
                for (let pageIndex in pattern.pageSplit) {
                  if (pattern.pageSplit[pageIndex] == j) {
                    questions[m].questions[j].pageSplit = 'Y';
                    break;
                  } else {
                    questions[m].questions[j].pageSplit = 'N';
                  }
                }
              } else {
                questions[m].questions[j].pageSplit = 'N';
              }
            } else {
              questions[m].questions[j].pageSplit = 'N';
            }
            questions[m].questions[j].answerStatus = 'N';
            if (window.ExampaperStatus == 'EXAM') {
              try {
                if (
                  paperInstance[i].questions[j].data.totalPoints ||
                  paperInstance[i].questions[j].data.totalPoints == 0
                ) {
                  questions[m].questions[j].answerStatus = 'Y';
                }
              } catch (e) {}
            }

            if (pattern.sequenceNumber) {
              questions[m].questions[j].subs = pattern.sequenceNumber[j];
            } else {
              if (pattern.questionPatternType == 'NORMAL') {
                questions[m].multipleQuestionPerPage = 'Y';
                questions[m].questions[j].subs = [Number(j) + 1 + ''];
              } else if (pattern.questionPatternType == 'TWO_LEVEL') {
                let subQuestionCount = pattern.subQuestionPatterns[j].subQuestionCount;
                if (subQuestionCount == 0) {
                  subQuestionCount = pattern.mainPatterns.subQuestionCount;
                }
                questions[m].questions[j].subs = [];

                for (let k = 0; k < Number(subQuestionCount); k++) {
                  if (j != 0) {
                    let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                    let beforeNum = Number(
                      questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                    );
                    questions[m].questions[j].subs.push(beforeNum + (Number(k) + 1) + '');
                  } else {
                    questions[m].questions[j].subs.push(Number(k) + 1 + '');
                  }
                }
              }
            }
          }
        }
      } else if (paperInstance[i].type == 'SPLITTER') {
        //分隔页
        let splitter = paperInstance[i].splitter;
        questions[m] = {};
        questions[m].index = m;
        questions[m].type = paperInstance[i].type;
        questions[m].label = splitter.content;
        questions[m].multipleQuestionPerPage = 'N';
        questions[m].questions = [];
        questions[m].questions[0] = {};
        questions[m].questions[0].index = 0;
        questions[m].questions[0].type = paperInstance[i].type;
        questions[m].questions[0].status = 0;
        questions[m].questions[0].pageSplit = 'N';
        questions[m].questions[0].answerStatus = 'N';
      } else if (paperInstance[i].type == 'RECALL') {
        //回溯
        let recall = paperInstance[i].recall;
        questions[m] = {};
        questions[m].index = m;
        questions[m].type = paperInstance[i].type;
        questions[m].label = 'recall';
        questions[m].questions = [];
        questions[m].questions[0] = {};
        questions[m].questions[0].index = 0;
        questions[m].questions[0].type = paperInstance[i].type;
        questions[m].questions[0].status = 0;
        questions[m].questions[0].pageSplit = 'N';
        questions[m].questions[0].answerStatus = 'N';
      }
    }
    master.mains = questions;

    console.log(master);
    return master;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 左侧点击导航切换
   * @param     {[type]}    item          二层题型序号
   * @param     {[type]}    mainIndex     大题序号
   * @param     {[type]}    questionIndex 小题序号
   * @param     {[type]}    type          题型类型
   * @return    {[type]}                  [description]
   */
  changeFocusIndex(item, mainIndex, questionIndex, type) {
    // eslint-disable-next-line prefer-destructuring
    // const vb = window.vb;
    // console.log("===========changeFocusIndex=========",vb.getRecorderManager().recording);

    if(isNowRecording()) return;
    this.state.mainType = false;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    newData.staticIndex.mainIndex = mainIndex;
    newData.staticIndex.questionIndex = questionIndex;
    if (type == 'TWO_LEVEL') {
      newData.staticIndex.subIndex = item;
    } else {
      delete newData.staticIndex.subIndex;
    }

    // console.log("newData", newData);
    this.sendProgress(newData);
    const { paperData } = this.props;
    isKeyLocked(paperData, newData);
    this.setState({ masterData: newData }, e => {
      this.scrollTop();
    });

    // 切题以后的回调
    const { onProgress } = this.props;
    if (typeof onProgress === 'function') {
      onProgress({
        subIndex: item,
        mainIndex,
        questionIndex,
        type,
      });
    }
    emitter.emit('closedModal', '');
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 右侧点击导航切换
   * @param     {[type]}    mainIndex     大题序号
   * @param     {[type]}    questionIndex 小题序号
   * @param     {[type]}    subIndex      二层题型序号
   * @return    {[type]}                  [description]
   */
  changeleftMeus(mainIndex, questionIndex, subIndex, type) {
    // eslint-disable-next-line prefer-destructuring
    // const vb = window.vb;
    // console.log("===========changeleftMeus=========",vb.getRecorderManager().recording);
    if(isNowRecording()) return;
    this.state.mainType = false;
    const newData = JSON.parse(JSON.stringify(this.state.masterData));

    newData.staticIndex.mainIndex = mainIndex;

    if (type === 'NORMAL') {
      newData.staticIndex.questionIndex = questionIndex - 1;
    } else {
      newData.staticIndex.questionIndex = questionIndex;
    }
    if (subIndex != undefined) {
      newData.staticIndex.subIndex = subIndex;
    }
    this.sendProgress(newData);
    const { paperData } = this.props;
    isKeyLocked(paperData, newData);
    this.setState({ masterData: newData });
  }

  /**
   * 练习过程中发送完成指令
   * @Author   tina.zhang
   * @DateTime 2019-02-26T10:01:12+0800
   * @param    {[type]}                 newData [description]
   * @return   {[type]}                         [description]
   */
  sendProgress(newData, type = '') {
    if (['EXAM', 'AFTERCLASS'].includes(window.ExampaperStatus)) {
      const studentIpAddress = localStorage.getItem('studentIpAddress');
      const { paperData } = this.props;
      if (newData.staticIndex.mainIndex > 0) {
        //  正在进行的步骤，答卷中当前所进行题目的标号，如：一_4(第一大题，第4小题)
        let instanceList = completionInstanceList(paperData);
        let myIndex = 0;
        for (let i = 0; i < Number(newData.staticIndex.mainIndex); i++) {
          if (instanceList[i] === 'RECALL' || instanceList[i] === 'SPLITTER') {
            myIndex = myIndex + 1;
          }
        }
        let description = `${toChinesNum(Number(newData.staticIndex.mainIndex) - myIndex)}_${newData
          .staticIndex.questionIndex + 1}`;
        if (newData.mains && newData.mains[newData.staticIndex.mainIndex].type === 'RECALL') {
          description = '校对';
        } else if (
          newData.mains &&
          newData.mains[newData.staticIndex.mainIndex].type === 'SPLITTER'
        ) {
          description = '分隔';
        }
        const body = {
          paperId: paperData.id,
          paperName: paperData.name,
          description,
          answerNum: completionStatistics(newData, type),
          instanceList,
          answerCount: newData.mains.length - 1,
          ipAddr: studentIpAddress, // 学生机IP，可选
        };
        console.log(body);
        const { sendMS, storeData } = this.props.instructions;
        sendMS('progress', body);
        if (type === 'complete') {
          // 当学生机结束练习后，发送
          storeData({ binessStatus: 'MS_16' });
        } else {
          // 当在做题的过程，发送progress指令后，调用Shell
          storeData({ binessStatus: 'MS_8' });
        }
      }
    }
  }

  /**
   * 打包试卷
   * @Author   tina.zhang
   * @DateTime 2018-12-19T10:24:35+0800
   * @return   {[type]}                 [description]
   */
  archiveFuc = (type = undefined) => {
    const { sendMS, archive, storeData } = this.props.instructions;
    const { answersData } = this.state;
    const { paperData } = this.props;
    deleteAnswer(answersData, paperData);

    const tokenIds = GenerateAudioList(answersData.answerInfo);
    console.log('tokenIds', tokenIds);
    let studentInfo = localStorage.getItem('studentInfo');
    const snapshotId = localStorage.getItem('snapshotId');
    localStorage.setItem('paperId', answersData.id);
    studentInfo = JSON.parse(studentInfo);
    console.log('archive打包试卷', deleteAnswer);
    const self = this;
    // 打包试卷
    archive({
      tokenIds,
      answer: JSON.stringify(answersData),
      fileName: `${studentInfo.taskId}_${studentInfo.id}_${snapshotId}`,
      success: e => {
        console.log('archive打包试卷成功');
        const { details } = e;
        self.state.paperArchive = e;
        const falg = true;
        let zeroCount = 0;
        for (let i in details) {
          if (details[i].size == 0 || details[i].size == '0') {
            // falg = false;
            zeroCount = zeroCount + 1;
          }
        }
        this.state.falg = falg;

        // 回收试卷反馈json
        const respondentsObject = {
          paperid: snapshotId,
          respondentsObject: {
            paperid: snapshotId,
            paperName: e.fileName,
            respondentsMd5: e.md5,
            zeroCount,
            fileCount: e.count,
            needFileCount: tokenIds.length,
            duration: answersData.duration,
            fullMark: this.props.paperData.fullMark,
            paperTime: this.props.paperData.paperTime,
            questionPointCount: this.props.paperData.questionPointCount,
            responseQuestionCount: GenerateAnsweredNum(answersData.answerInfo),
            score: answersData.totalScore || 0,
          },
        };
        localStorage.setItem('md5', e.md5); // 答卷MD5
        localStorage.setItem('fileName', e.fileName); // 答卷名称
        this.state.respondentsObject = respondentsObject;
        hideLoading();
        showWaiting({
          img: uploading,
          text:
            formatMessage({ id: 'app.text.zzscdjbqsh', defaultMessage: '正在上传答卷包，请稍等' }) +
            '..',
        });
        this.uploadPaper(type);
      },
      fail: e => {
        console.log('archive打包试卷失败');
        // 学生机在考试阶段：当答卷打包自动重试3次无效后，考试失败--走重考流程
        this.newArchive = this.newArchive + 1;
        if (this.newArchive < 4) {
          self.archiveFuc();
        } else {
          hideLoading();
          this.state.falg = false;
          const studentIpAddress = localStorage.getItem('studentIpAddress');
          let body = {
            ipAddr: studentIpAddress,
            paperid: snapshotId,
            result: 2,
          };
          self.updatePaperList(body);
          sendMS('recycle:reply', body);
          // 当上传试卷包失败，发送recycle:reply指令后，调用Shell
          storeData({ binessStatus: 'MS_13' });
          if (type === 'continue') {
            // 继续练习
            // 结束考试打包一次
            router.push('/student/download/paper');
          } else {
            // 结束练习
            router.push('/student/download/paper/result');
          }
        }
      },
    });
  };

  /**
   * 上传试卷包
   * @Author   tina.zhang
   * @DateTime 2018-12-20T09:15:04+0800
   * @return   {[type]}                 [description]
   */
  uploadPaper(type = undefined, newPaperList = undefined, uploadPaperIndex = 0) {
    let self = this;
    const { sendMS, setc, archive, upload, storeData } = this.props.instructions;
    let { respondentsObject, isConnect, answersData } = this.state;
    const { paperData } = this.props;
    let studentInfo = localStorage.getItem('studentInfo');
    studentInfo = JSON.parse(studentInfo);

    let snapshotId = localStorage.getItem('snapshotId');
    let paperMd5 = localStorage.getItem('paperMd5');
    let studentIpAddress = localStorage.getItem('studentIpAddress');

    if (newPaperList != undefined) {
      respondentsObject = newPaperList[uploadPaperIndex].packageResult.respondentsObject;
      paperMd5 = respondentsObject.respondentsObject.respondentsMd5;
      snapshotId = respondentsObject.respondentsObject.paperid;
    }

    console.log(studentInfo);
    console.log(respondentsObject.respondentsObject.respondentsMd5);
    console.log('上传试卷包', isConnect);

    if (respondentsObject.respondentsObject) {
      if (
        respondentsObject.respondentsObject.needFileCount >=
        respondentsObject.respondentsObject.fileCount
      ) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_5';
      }

      if (respondentsObject.respondentsObject.zeroCount > 0) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_6';
      }
    }
    // // 判断socket是否还在连接中，如果在则走上传试卷包流程，否则走上传失败的流程，等待重连后，提示
    // if (!isConnect) {
    //   console.log('socket断开连接。');
    //   respondentsObject.respondentsObject.upLoadStatus = 0;
    //   sendMS('recycle:reply', {
    //     ipAddr: studentIpAddress,
    //     paperid: snapshotId,
    //     result: 3,
    //     respondentsObject,
    //   });

    //   //当上传试卷包失败，发送recycle:reply指令后，调用Shell
    //   storeData({binessStatus:"MS_13"})

    //   setTimeout(function() {
    //     hideLoading();
    //   }, 500)

    //   return false;
    // }
    let body = {};
    upload({
      url: `proxyapi/proxy/file?taskId=${studentInfo.taskId}&snapshotId=${snapshotId}&studentId=${
        studentInfo.stuid
      }&classId=${studentInfo.classId}`,
      paperMd5: respondentsObject.respondentsObject.respondentsMd5,
      fileName: respondentsObject.respondentsObject.paperName,
      success: e => {
        respondentsObject.respondentsObject.upLoadStatus = 1;

        let params = {
          queueInfo: {
            answerInfo: JSON.stringify(answersData),
            elapsedTime: answersData.duration,
            examNo: studentInfo.stuid,
            name: studentInfo.studentName,
            paperId: paperData.id,
            paperName: paperData.name,
            responseQuestionScore: answersData.totalScore || 0,
            snapshotId: snapshotId,
            taskId: studentInfo.taskId,
            studentId: studentInfo.stuid,
            timeStamp: new Date().getTime(),
          },
          taskId: studentInfo.taskId,
        };
        saveQueueInfo(params)
          .then(res => {})
          .catch(err => {
            console.log(err);
          });
        body = {
          ipAddr: studentIpAddress,
          paperid: snapshotId,
          result: 1,
          respondentsObject,
        };
        self.updatePaperList(body);
        sendMS('recycle:reply', body);

        //当上传试卷包成功，发送recycle:reply指令后，调用Shell
        storeData({ binessStatus: 'MS_14' });

        console.log('上传试卷包成功');
        hideLoading();

        if (type == 'recycleErrorPaper') {
          uploadPaperIndex = uploadPaperIndex + 1;
          if (uploadPaperIndex < newPaperList.length) {
            this.uploadPaper('', newPaperList, uploadPaperIndex);
          }
        } else if (type == 'continue') {
          //继续练习
          router.push('/student/download/paper');
        } else {
          router.push('/student/download/paper/result');
        }
      },
      fail: () => {
        // 学生机在考试阶段：当答卷上传自动重试3次无效后，走上传答卷包异常流程
        this.newTabIndex = this.newTabIndex + 1;
        if (this.newTabIndex < 4) {
          self.uploadPaper();
        } else {
          hideLoading();
          console.log('上传试卷包失败');
          respondentsObject.respondentsObject.upLoadStatus = 0;
          body = {
            ipAddr: studentIpAddress,
            paperid: snapshotId,
            result: 3,
            respondentsObject,
          };
          self.updatePaperList(body);
          sendMS('recycle:reply', body);

          //当上传试卷包失败，发送recycle:reply指令后，调用Shell
          storeData({ binessStatus: 'MS_13' });

          if (type == 'recycleErrorPaper') {
            uploadPaperIndex = uploadPaperIndex + 1;
            if (uploadPaperIndex < newPaperList.length) {
              this.uploadPaper('', newPaperList, uploadPaperIndex);
            }
          } else if (type == 'continue') {
            //继续练习
            router.push('/student/download/paper');
          } else {
            router.push('/student/download/paper/result');
          }
        }
      },
    });
    return true;
  }

  /**
   * 打包试卷 18.5	教师机进行新的任务时初始化学生机之前，判断学生机状态以及学生机的后续处理
   * @Author   tina.zhang
   * @DateTime 2018-12-19T10:24:35+0800
   * @return   {[type]}                 [description]
   */
  archiveFucpackage = (type = undefined) => {
    const { sendMS, archive, storeData } = this.props.instructions;
    const { answersData } = this.state;
    const { paperData } = this.props;
    deleteAnswer(answersData, paperData);
    let tokenIds = GenerateAudioList(answersData.answerInfo);
    let studentInfo = localStorage.getItem('studentInfo');
    const snapshotId = localStorage.getItem('snapshotId');
    localStorage.setItem('paperId', answersData.id);
    studentInfo = JSON.parse(studentInfo);
    const self = this;
    // 打包试卷
    archive({
      tokenIds,
      answer: JSON.stringify(answersData),
      fileName: `${studentInfo.taskId}_${studentInfo.id}_${snapshotId}`,
      success: e => {
        const { details } = e;
        self.state.paperArchive = e;
        const falg = true;
        let zeroCount = 0;
        for (let i in details) {
          if (details[i].size == 0 || details[i].size == '0') {
            // falg = false;
            zeroCount = zeroCount + 1;
          }
        }
        this.state.falg = falg;
        // 回收试卷反馈json
        const respondentsObject = {
          paperid: snapshotId,
          respondentsObject: {
            paperid: snapshotId,
            paperName: e.fileName,
            respondentsMd5: e.md5,
            zeroCount,
            fileCount: e.count,
            needFileCount: tokenIds.length,
            duration: answersData.duration,
            fullMark: this.props.paperData.fullMark,
            paperTime: this.props.paperData.paperTime,
            questionPointCount: this.props.paperData.questionPointCount,
            responseQuestionCount: GenerateAnsweredNum(answersData.answerInfo),
            score: answersData.totalScore || 0,
          },
        };
        localStorage.setItem('md5', e.md5); // 答卷MD5
        localStorage.setItem('fileName', e.fileName); // 答卷名称
        this.state.respondentsObject = respondentsObject;
        this.uploadPaper(type);
      },
      fail: e => {
        // 学生机在考试阶段：当答卷打包自动重试3次无效后，考试失败--走重考流程
        this.newArchive = this.newArchive + 1;
        if (this.newArchive < 4) {
          self.archiveFucpackage();
        } else {
          window.location.href = '/student';
        }
      },
    });
  };

  /**
   * 上传试卷包 18.5	教师机进行新的任务时初始化学生机之前，判断学生机状态以及学生机的后续处理
   * @Author   tina.zhang
   * @DateTime 2018-12-20T09:15:04+0800
   * @return   {[type]}                 [description]
   */
  uploadPaperPackage(type = undefined, newPaperList = undefined, uploadPaperIndex = 0) {
    let self = this;
    const { sendMS, setc, archive, upload, storeData } = this.props.instructions;
    let { respondentsObject, isConnect } = this.state;
    let studentInfo = localStorage.getItem('studentInfo');
    studentInfo = JSON.parse(studentInfo);

    let snapshotId = localStorage.getItem('snapshotId');
    let paperMd5 = localStorage.getItem('paperMd5');
    let studentIpAddress = localStorage.getItem('studentIpAddress');

    if (newPaperList != undefined) {
      respondentsObject = newPaperList[uploadPaperIndex].packageResult.respondentsObject;
      paperMd5 = respondentsObject.respondentsObject.respondentsMd5;
      snapshotId = respondentsObject.respondentsObject.paperid;
    }

    // 判断socket是否还在连接中，如果在则走上传试卷包流程，否则走上传失败的流程，等待重连后，提示
    // if (!isConnect) {
    //   window.location.href="/student";
    //   return false;
    // }
    let body = {};
    upload({
      url: `proxyapi/proxy/file?taskId=${studentInfo.taskId}&snapshotId=${snapshotId}&studentId=${
        studentInfo.stuid
      }&classId=${studentInfo.classId}`,
      paperMd5: respondentsObject.respondentsObject.respondentsMd5,
      fileName: respondentsObject.respondentsObject.paperName,
      success: e => {
        window.location.href = '/student';
      },
      fail: () => {
        // 学生机在考试阶段：当答卷上传自动重试3次无效后，走上传答卷包异常流程
        this.newTabIndex = this.newTabIndex + 1;
        if (this.newTabIndex < 4) {
          self.uploadPaperPackage();
        } else {
          window.location.href = '/student';
        }
      },
    });
    return true;
  }

  /**
   *回收上传失败的练习试卷
   *
   * @author tina.zhang
   * @date 2019-03-05
   * @memberof ExampaperProduct
   */
  recyclePaper() {
    const { paperList } = this.state;
    let newPaperList = [];
    for (let i in paperList) {
      if (paperList[i].packageResult && paperList[i].packageResult.result == 3) {
        newPaperList.push(paperList[i]);
      }
    }

    if (newPaperList.length > 0) {
      this.uploadPaper('recycleErrorPaper', newPaperList, 0);
    }
  }

  /**
   *回收上传失败的练习试卷
   *
   * @author tina.zhang
   * @date 2019-03-05
   * @memberof ExampaperProduct
   */
  recyclePaper() {
    const { paperList } = this.state;
    let newPaperList = [];
    for (let i in paperList) {
      if (paperList[i].packageResult && paperList[i].packageResult.result == 3) {
        newPaperList.push(paperList[i]);
      }
    }

    if (newPaperList.length > 0) {
      this.uploadPaper('recycleErrorPaper', newPaperList, 0);
    }
  }

  updatePaperList(e) {
    const { paperList, masterData, answersData } = this.state;
    const { paperData, showData, dispatch } = this.props;
    let newPaperList = JSON.parse(JSON.stringify(paperList));

    for (let i in newPaperList) {
      if (newPaperList[i].paperId == paperData.id) {
        if (e.result) {
          newPaperList[i].packageResult = e;
        }
        newPaperList[i].paperData = paperData;
        newPaperList[i].showData = showData;
        newPaperList[i].masterData = masterData;
        newPaperList[i].allTime = new Date().getTime();
        newPaperList[i].answersData = answersData;
        newPaperList[i].answeredNum = GenerateAnsweredNum(answersData.answerInfo);
      }
    }
    dispatch({
      type: 'examProduct/setpaperData',
      payload: newPaperList,
    }).then(e => {
      // console.log(exerciseList)
    });
    this.setState({ paperList: newPaperList }, () => {
      this.reLoadPaperList();
    });
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 右侧上一步下一步按钮
   * @param     {[type]}    type 上一步，下一步
   * @return    {[type]}         [description]
   */
  changeRightIcon(type) {
    this.state.mainType = false;
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;
    let paperInstance = paperData.paperInstance;
    let questions = [];
    questions = mains[mainIndex];
    if (type == 'up') {
      //上滑
      if (questions.type == 'INTRODUCTION') {
        return;
      } else if (questions.type == 'NORMAL') {
        if (newData.staticIndex.questionIndex != 0) {
          newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
          if (newData.staticIndex.questionIndex == -1) {
            newData.staticIndex.questionIndex = 0;
            newData.staticIndex.mainIndex = 0;
          }
        } else {
          newData = this.turnUp();
        }
      } else if (questions.type == 'TWO_LEVEL') {
        if (newData.staticIndex.questionIndex != 0) {
          newData.staticIndex.subIndex =
            mains[mainIndex].questions[newData.staticIndex.questionIndex - 1].subs[0];
          newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
        } else {
          newData = this.turnUp();
        }
      } else if (questions.type == 'COMPLEX') {
        if (newData.staticIndex.subIndex != 0 && newData.staticIndex.questionIndex != 0) {
          if (newData.staticIndex.subIndex != undefined) {
            if (
              mains[mainIndex].questions[newData.staticIndex.questionIndex - 1].type == 'TWO_LEVEL'
            ) {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
              newData.staticIndex.subIndex =
                mains[mainIndex].questions[newData.staticIndex.questionIndex].subs[0];
            } else {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
              delete newData.staticIndex.subIndex;
            }
          } else {
            if (
              mains[mainIndex].questions[newData.staticIndex.questionIndex - 1].type == 'TWO_LEVEL'
            ) {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
              newData.staticIndex.subIndex =
                mains[mainIndex].questions[newData.staticIndex.questionIndex].subs[0];
            } else {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
              delete newData.staticIndex.subIndex;
            }
          }
        } else {
          newData = this.turnUp();
        }
      } else if (questions.type == 'SPLITTER') {
        newData = this.turnUp();
      }
    } else {
      //下滑

      if (questions.type == 'INTRODUCTION') {
        newData.staticIndex.mainIndex = mainIndex + 1;
        if (mains[mainIndex + 1].questions[0].type == 'TWO_LEVEL') {
          newData.staticIndex.questionIndex = 0;
          newData.staticIndex.subIndex = 1;
        } else if (mains[mainIndex + 1].questions[0].type == 'NORMAL') {
          newData.staticIndex.questionIndex = 0;
          delete newData.staticIndex.subIndex;
        }
      } else if (questions.type == 'NORMAL') {
        if (newData.staticIndex.questionIndex < mains[mainIndex].questions.length - 1) {
          newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
        } else {
          newData = this.turnDown();
        }
      } else if (questions.type == 'TWO_LEVEL') {
        if (newData.staticIndex.questionIndex < mains[mainIndex].questions.length - 1) {
          newData.staticIndex.subIndex =
            mains[mainIndex].questions[newData.staticIndex.questionIndex + 1].subs[0];
          newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
        } else {
          newData = this.turnDown();
        }
      } else if (questions.type == 'COMPLEX') {
        if (newData.staticIndex.questionIndex < mains[mainIndex].questions.length - 1) {
          if (newData.staticIndex.subIndex != undefined) {
            if (
              mains[mainIndex].questions[newData.staticIndex.questionIndex + 1].type == 'TWO_LEVEL'
            ) {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
              newData.staticIndex.subIndex =
                mains[mainIndex].questions[newData.staticIndex.questionIndex].subs[0];
            } else {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
              delete newData.staticIndex.subIndex;
            }
          } else {
            if (
              mains[mainIndex].questions[newData.staticIndex.questionIndex + 1].type == 'TWO_LEVEL'
            ) {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
              newData.staticIndex.subIndex =
                mains[mainIndex].questions[newData.staticIndex.questionIndex].subs[0];
            } else {
              newData.staticIndex.questionIndex = newData.staticIndex.questionIndex + 1;
              delete newData.staticIndex.subIndex;
            }
          }
        } else {
          newData = this.turnDown();
        }
      } else if (questions.type == 'SPLITTER') {
        newData = this.turnDown();
      }
    }
    isKeyLocked(paperData, newData);
    // console.log(newData.staticIndex)
    this.setState({ masterData: newData }, e => {
      this.scrollTop();
    });
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 上滑
   * @return    {[type]}    [description]
   */
  turnUp() {
    //console.log("====什么鬼数据===")
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;
    newData.staticIndex.mainIndex = mainIndex - 1;
    if (mains[mainIndex - 1].type == 'RECALL') {
      this.upHandle(newData, 2);
    } else {
      this.upHandle(newData);
    }

    return newData;
  }

  upHandle(newData, changeIndex = 1) {
    const { masterData } = this.state;
    const { paperData } = this.props;
    let mainIndex = masterData.staticIndex.mainIndex;
    let mains = masterData.mains;
    newData.staticIndex.mainIndex = mainIndex - changeIndex;
    if (mains[mainIndex - changeIndex].type == 'INTRODUCTION') {
      newData.staticIndex.questionIndex = 0;
      delete newData.staticIndex.subIndex;
    } else if (
      mains[mainIndex - changeIndex].type == 'NORMAL' ||
      mains[mainIndex - changeIndex].type == 'SPLITTER'
    ) {
      newData.staticIndex.questionIndex = mains[mainIndex - changeIndex].questions.length - 1;
      delete newData.staticIndex.subIndex;
    } else if (mains[mainIndex - changeIndex].type == 'TWO_LEVEL') {
      newData.staticIndex.subIndex =
        mains[mainIndex - changeIndex].questions[
          mains[mainIndex - changeIndex].questions.length - 1
        ].subs[0];
      newData.staticIndex.questionIndex = mains[mainIndex - changeIndex].questions.length - 1;
    } else if (mains[mainIndex - changeIndex].type == 'COMPLEX') {
      if (
        mains[mainIndex - changeIndex].questions[
          mains[mainIndex - changeIndex].questions.length - 1
        ].type == 'TWO_LEVEL'
      ) {
        newData.staticIndex.subIndex = 1;
        newData.staticIndex.questionIndex = mains[mainIndex - changeIndex].questions.length - 1;
      } else {
        newData.staticIndex.questionIndex = mains[mainIndex - changeIndex].questions.length - 1;
        delete newData.staticIndex.subIndex;
      }
    } else if (mains[mainIndex - changeIndex].type == 'RECALL') {
      this.upHandle(newData, changeIndex + 1);
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 下滑
   * @return    {[type]}    [description]
   */
  turnDown() {
    //console.log("====挑剔====")
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;

    if (mainIndex + 1 > mains.length - 1) {
      return newData;
    }
    newData.staticIndex.mainIndex = mainIndex + 1;

    if (mains[mainIndex + 1].type == 'RECALL') {
      //跳过回溯阶段处理
      this.downHandle(newData, 2);
    } else {
      this.downHandle(newData);
    }

    return newData;
  }

  downHandle(newData, changeIndex = 1) {
    const { masterData } = this.state;
    const { paperData } = this.props;
    let mainIndex = masterData.staticIndex.mainIndex;
    let mains = masterData.mains;
    newData.staticIndex.mainIndex = mainIndex + changeIndex;
    if (
      mains[mainIndex + changeIndex].type == 'NORMAL' ||
      mains[mainIndex + changeIndex].type == 'SPLITTER'
    ) {
      newData.staticIndex.questionIndex = 0;
      delete newData.staticIndex.subIndex;
    } else if (mains[mainIndex + changeIndex].type == 'TWO_LEVEL') {
      newData.staticIndex.questionIndex = 0;
      newData.staticIndex.subIndex = returnSubIndex(newData, 0, 0);
    } else if (mains[mainIndex + changeIndex].type == 'COMPLEX') {
      if (mains[mainIndex + changeIndex].questions[0].type == 'TWO_LEVEL') {
        newData.staticIndex.questionIndex = 0;
        newData.staticIndex.subIndex = returnSubIndex(newData, 0, 0);
      } else {
        newData.staticIndex.questionIndex = 0;
        delete newData.staticIndex.subIndex;
      }
    } else if (mains[mainIndex + changeIndex].type == 'RECALL') {
      this.downHandle(newData, changeIndex + 1);
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-24
   * @copyright 停止录音
   * @param     {[type]}    type [description]
   * @return    {[type]}         [description]
   */
  endRecord = () => {
    var vb = window.vb;
    var recordManager = vb.getRecorderManager();
    if (recordManager && vb.deviceState.value === 'recording') {
      try {
        recordManager.stop();
      } catch (e) {}
    }
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-23
   * @copyright 滚动到指定位置
   * @return    {[type]}    [description]
   */
  scrollTop = () => {
    setTimeout(() => {
      if (document.querySelectorAll("div[class='addquestion_Item']")[0]) {
        let addquestion_Item = document.querySelectorAll("div[class='addquestion_Item']")[0]
          .childNodes;
        let height = 0;
        for (let n in addquestion_Item) {
          if (addquestion_Item[n].className) {
            if (n != 0) {
              height = height + Number(addquestion_Item[n - 1].offsetHeight);
            }
            if (addquestion_Item[n].className.indexOf('addquestion-focus') > -1) {
              if (n == 0) {
                height = 0;
              }
              break;
            }
          }
        }
        document.getElementById('paper_rightContent').scrollTop = height;
      }
    }, 100);
  };

  paperHeadChange(data, coverRate) {
    this.props.index.paperHeadChange(data);
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    newData.coverRate = coverRate;
    this.setState({ masterData: newData });
  }

  reLoadPaperList() {
    // 如果是考中模式，执行如下
    this.props.callback(this.state.paperList);
  }

  render() {
    const { masterData, mainType, guideIndex, isPlay, paperList, answersData } = this.state;
    const {
      paperData,
      showData,
      editData,
      invalidate,
      ExampaperStatus,
      isExamine,
      instructions,
    } = this.props;

    if (masterData.controlStatus == undefined) {
      return null;
    }

    let ExampaperStyle = {};
    if (ExampaperStatus != 'EXAM' && ExampaperStatus !== 'AFTERCLASS') {
      ExampaperStyle = { marginTop: '80px' };
    }
    return (
      <div className="ExampaperProduct" style={ExampaperStyle} id="examRoot">
        {/* 制作试卷top部分 */}
        {ExampaperStatus !== 'AFTERCLASS' && (
          <PaperTop
            coverRate={masterData.coverRate}
            paperTime={masterData.paperTime}
            paperList={paperList}
            isPlay={isPlay}
            callback={e => {
              let newPaperList = JSON.parse(JSON.stringify(paperList));
              for (let i in newPaperList) {
                if (newPaperList[i].paperId == paperData.id) {
                  newPaperList[i].finishTime = e; // 记录秒数
                  answersData.duration = e * 1000;
                }
              }
              this.setState({ paperList: newPaperList });
            }}
          />
        )}

        <div style={{ width: '1024px', height: '659px', position: 'relative', overflow: 'hidden' }}>
          <Layout className="leftMenus">
            {/*左侧试卷目录*/}
            {ExampaperStatus !== 'EXAM' && ExampaperStatus !== 'AFTERCLASS' ? (
              <LeftMenu
                masterData={masterData}
                ExampaperStatus={ExampaperStatus}
                index={this}
                isExamine={isExamine}
                invalidate={invalidate}
                paperData={paperData}
              />
            ) : (
              <LeftMenuExam
                masterData={masterData}
                ExampaperStatus={ExampaperStatus}
                index={this}
                isExamine={isExamine}
                invalidate={invalidate}
                paperData={paperData}
                instructions={instructions}
                paperList={paperList}
                answersData={answersData}
              />
            )}
            {/* 右侧试卷内容 */}
            <RightContent
              masterData={masterData}
              index={this}
              isExamine={isExamine}
              paperData={paperData}
              invalidate={invalidate}
              showData={showData}
              editData={editData}
              mainType={mainType}
              guideIndex={guideIndex}
              ExampaperStatus={ExampaperStatus}
            />
          </Layout>
          <div className={styles.rightIcon}>
            <div className={styles.rightIconTop}>
              <div onClick={this.changeRightIcon.bind(this, 'up')}>
                <i className={'iconfont icon-qus-up ' + styles.color} />
              </div>
              <div className={styles.rightLine} />
              <div onClick={this.changeRightIcon.bind(this, 'down')}>
                <i className={'iconfont icon-qus-down ' + styles.color} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExampaperProduct;
