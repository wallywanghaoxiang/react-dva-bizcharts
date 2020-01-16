import React, { PureComponent } from 'react';
import { Layout, message, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import {
  calculatScore,
  scoringMachine,
  calculatTotalScore,
  returnSubIndex,
  toChinesNum,
  GenerateAudioList,
  MatchDictionary,
  MatchTpye,
  ANSWESHEET_VERSION,
  isUsePlugin,
  sequenceDisrupted,
  OptionDisturb,
  assemblyResultData,
  deleteAnswer,
  completionInstanceList,
} from '@/frontlib/utils/utils';
import emitter from '@/utils/ev';
import VB from '@/frontlib/utils/jssdk/src/VB';
import PaperLoading from './Components/PaperLoading';
import PaperComplete from './Components/PaperComplete';
import PreExamCheck from './Components/PreExamCheck';
import { playResource } from '@/utils/utils';
import showExamReport from '../ExampaperReport/api';
import {
  showDeviceStatusModal,
  hideDeviceStatusModal,
} from './Components/PreExamCheck/DeviceStatusModal/api';
import LeftMenu from './LeftMenu';
import LeftMenuExam from './LeftMenuExam';
import RecallLeftMenu from './RecallLeftMenu';
import RightContent from './RightContent';
import PaperTop from './Components/PaperTop';
import DownCount from './Components/DownCount';
import './index.less';

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

const statusTrans = {
  preExamCheck: 'MS_3', // 硬件检测
  loading: 'MS_4', // 试卷下载中
  preExamCheckError: 'MS_5', // 检测失败
  loaded: 'MS_6', // 试卷下载完成
  failed: 'MS_7', // 试卷下载失败
  Examination: 'MS_8', // 考试中
  end: 'MS_9', // 答题完成
  error: 'MS_12', // 考试失败
  archiveFailed: 'MS_15', // 打包错误-考试异常(上传异常)
  examFail: 'MS_12', // 考试失败
  upLoad: 'MS_11', // 上传中
  upLoadFailed: 'MS_13', // 打包错误-上传异常
  upLoadSucess: 'MS_14', // 考试完成
  normalCompete: 'MS_14', // 考试完成
};

/**
 * 整卷试做组件
  paperData //试卷数据
  showData//展示数据
  isLoad//数据加载是否完毕
  ExampaperStatus//组件类型
  instructions//考中指令集合
 * @author tina.zhang
 */
export default class ExampaperAttempt extends PureComponent {
  constructor(props) {
    super(props);
    this.startTime = []; // 时间戳用于计时
    this.newTabIndex = 0; // 用于计算答卷上传次数
    this.newArchive = 0; // 用于计算答卷打包次数
    this.offlineTime = 10; // 耳机掉落最长的事件点仅有10秒的时间让其接入耳机，10S时间到后（累计10S）
    this.stopTime = []; // 时间戳用于计时
    this.startTime = [];

    this.state = {
      masterData: {}, // 主控数据
      answersData: {}, // 答题json数据
      isExam: true, // 整卷试做完成
      examStatus: false,
      currentStatus: 'preExamCheck', // preExamCheck preExamCheckError loading,loaded,Examination,end
      completeStatus: 'normal', // archiveFailed:MS_13 examFail:MS_12 upLoad:MS_11 upLoadFailed:MS_13 upLoadSucess:MS_14 normalCompete:MS_14
      startExamTime: '',
      recordIds: [], // 考前检测过程中录音id
      number: '', // 座位号
      isConnect: true, // 是否连接学生机
      paperArchive: {},
      changePreTime: '', // 改变预览测试时间
      falg: false,
    };
  }

  componentDidMount() {
    const { ExampaperStatus } = this.props;
    this.startTime.push(Date.parse(new Date()));
    this.changePlay = emitter.addListener('changePlay', x => {
      // 点击整卷试做的开始和暂停按钮，都会记录对应的时间戳
      // console.log("make ");
      // console.log(x);
      if (x) {
        this.startTime.push(Date.parse(new Date()));
      } else {
        this.stopTime.push(Date.parse(new Date()));
      }
    });
    localStorage.setItem('ExampaperStatus', ExampaperStatus);
    window.ExampaperStatus = ExampaperStatus;
    if (window.ExampaperStatus === 'EXAM') {
      // 监听教师端指令
      this.receiveInfo();
    } else {
      console.log('启动录音插件~~');
      window.vb = new VB();

      const now = new Date().getTime();
      this.state.startExamTime = now;

      const { paperData, isExamine, showData } = this.props;

      console.log('paperData', paperData);
      this.state.answersData = assemblyResultData(paperData);
      this.setState(
        {
          Examination: 'Examination',
          masterData: this.assemblyData(paperData, showData),
        },
        () => {
          // 保存当前答题的进度
          const { answers, answeringNo } = this.props;
          this.answersRecords = answers || [];
          if (answeringNo && typeof answeringNo.mainIndex !== 'undefined') {
            const { subIndex, mainIndex, questionIndex, type } = answeringNo;
            this.changeFocusIndex(subIndex, mainIndex, questionIndex, type);
          }
        }
      );
      localStorage.setItem('isExamine', isExamine);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { paperData: currPaperData, isLoad: currIsLoad, showData: currShowData } = this.props;
    let { paperData, isLoad, showData } = nextProps;
    if (
      JSON.stringify(currPaperData) === JSON.stringify(paperData) &&
      JSON.stringify(currShowData) === JSON.stringify(showData) &&
      currIsLoad === isLoad
    ) {
      return;
    }

    if (window.ExampaperStatus === 'EXAM') {
      let paperpolicy = localStorage.getItem('paperpolicy');
      if (paperpolicy.indexOf('ET_1') > -1) {
        paperData = sequenceDisrupted(paperData); //题序打乱
      }
      if (paperpolicy.indexOf('ET_2') > -1) {
        paperData = OptionDisturb(paperData); //选项打乱
      }
      // paperData = sequenceDisrupted(paperData);//题序打乱
      // paperData = OptionDisturb(paperData);//选项打乱
      if (paperData.id && !isLoad) {
        const { masterData } = this.state;
        const newMasterData = this.assemblyData(paperData, showData);
        if (this.state.answersData.id == undefined) {
          this.state.answersData = assemblyResultData(paperData);
        }
        this.setState({
          masterData: newMasterData,
          currentStatus: 'loaded',
        });
      } else if (!isLoad) {
        this.setState({
          currentStatus: 'failed',
        });
      }
    } else {
      const { masterData } = this.state;
      const newMasterData = this.assemblyData(paperData, showData);
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
    let answerNumArr = [];
    onReceive(e => {
      console.log('===================', e);
      const { currentStatus, completeStatus, masterData = {}, startExamTime } = this.state;
      if (e) {
        const receiveData = e.data;
        switch (e.command) {
          /** 考试中，重写连接 */
          case 'connect':
            console.log('=================connect==================');
            {
              this.state.isConnect = true;
              // 教师端指令状态  连接成功后问教师机现在是在哪一步
              // 只有在考中才进行如下处理
              // if (currentStatus === "Examination" || currentStatus === "end") {
              const data = {
                ipAddr: localStorage.getItem('studentIpAddress'),
              };
              sendMS('commandstatus', data, '');
              // }
            }
            break;
          case 'commandstatus:return':
            {
              // 接收到教师端发来的数据指令
              const resJson = JSON.parse(receiveData);
              const commandCode = resJson.commandOperationFlag;
              // "05" //练习/考试结束
              if (commandCode === '05' && currentStatus !== 'end') {
                // 如果当前还没有结束考试则，直接关闭考试，并且考试失败
                self.setExamFail();
              } else {
                // 其它的状态的时候发送自己的状态给教师机
                // 老师发指令 允许考试
                const newData = JSON.parse(JSON.stringify(masterData)) || {};
                newData.staticIndex = newData.staticIndex || {};
                newData.mains = newData.mains || [];
                const monitorStatus =
                  currentStatus === 'end'
                    ? statusTrans[completeStatus]
                    : statusTrans[currentStatus];
                const answerProcess =
                  currentStatus === 'end'
                    ? 'complete'
                    : toChinesNum(newData.staticIndex.mainIndex) +
                      '_' +
                      (newData.staticIndex.questionIndex + 1);

                answerNumArr = [];
                for (let i = 0; i < newData.mains.length; i++) {
                  if (i != 0) {
                    if (Number(i) == Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('S');
                    } else if (Number(i) < Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('F');
                    } else if (Number(i) > Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('N');
                    }
                  }
                }
                // 将当期的信息状态返回给教师机
                sendMS('student:status', {
                  ipAddr: localStorage.getItem('studentIpAddress'),
                  monitorStatus,
                  answerProcess,
                  answerNum: answerNumArr,
                  instanceList: completionInstanceList(this.props.paperData),
                  answerCount: newData.mains.length - 1,
                  duration: new Date().getTime() - startExamTime,
                });
              }
            }
            break;
          case 'student:getstatus':
            // 接收到教师端发来的数据指令
            console.log('教师机发送到哦');
            // 其它的状态的时候发送自己的状态给教师机
            // 老师发指令 允许考试
            const newData = JSON.parse(JSON.stringify(masterData)) || {};
            newData.staticIndex = newData.staticIndex || {};
            newData.mains = newData.mains || [];
            const monitorStatus =
              currentStatus === 'end' ? statusTrans[completeStatus] : statusTrans[currentStatus];
            const answerProcess =
              currentStatus === 'end'
                ? 'complete'
                : toChinesNum(newData.staticIndex.mainIndex) +
                  '_' +
                  (newData.staticIndex.questionIndex + 1);

            if (currentStatus === 'end' && completeStatus === 'normalCompete') {
              sendMS('recycle:reply', {
                ipAddr: localStorage.getItem('studentIpAddress'),
                paperid: localStorage.getItem('snapshotId'),
                result: 1,
                respondentsObject: this.state.respondentsObject,
              });
            }

            answerNumArr = [];
            for (let i = 0; i < newData.mains.length; i++) {
              if (i != 0) {
                if (Number(i) == Number(newData.staticIndex.mainIndex)) {
                  answerNumArr.push('S');
                } else if (Number(i) < Number(newData.staticIndex.mainIndex)) {
                  answerNumArr.push('F');
                } else if (Number(i) > Number(newData.staticIndex.mainIndex)) {
                  answerNumArr.push('N');
                }
              }
            }
            // 将当期的信息状态返回给教师机
            sendMS('student:status', {
              ipAddr: localStorage.getItem('studentIpAddress'),
              monitorStatus,
              answerProcess,
              answerNum: answerNumArr,
              instanceList: completionInstanceList(this.props.paperData),
              answerCount: newData.mains.length - 1,
              duration: new Date().getTime() - startExamTime,
            });

            break;
          // 开始考试
          case 'start:manual':
            if (
              !this.props.isLoad &&
              currentStatus !== 'failed' &&
              currentStatus !== 'preExamCheckError' &&
              this.earStatus !== false
            ) {
              vb.imeMode = false;
              vb.isKeyLocked = 'all'; //键盘全锁

              const now = new Date().getTime();

              self.setState({ currentStatus: 'Examination', startExamTime: now }, () => {
                const { currentStatus, masterData = {} } = this.state;
                // 老师发指令 允许考试
                const newData = JSON.parse(JSON.stringify(masterData)) || {};
                newData.staticIndex = newData.staticIndex || {};
                newData.mains = newData.mains || [];
                answerNumArr = [];
                for (let i = 0; i < newData.mains.length; i++) {
                  if (i != 0) {
                    if (Number(i) == Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('S');
                    } else if (Number(i) < Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('F');
                    } else if (Number(i) > Number(newData.staticIndex.mainIndex)) {
                      answerNumArr.push('N');
                    }
                  }
                }
                // 将当期的信息状态返回给教师机
                sendMS('student:status', {
                  ipAddr: localStorage.getItem('studentIpAddress'),
                  monitorStatus: statusTrans[currentStatus],
                  answerProcess:
                    toChinesNum(newData.staticIndex.mainIndex) +
                    '_' +
                    (newData.staticIndex.questionIndex + 1),
                  instanceList: completionInstanceList(this.props.paperData),
                  answerNum: answerNumArr,
                  answerCount: newData.mains.length - 1,
                });
              });
            } else {
              // 老师发指令 允许考试
              const newData = JSON.parse(JSON.stringify(masterData)) || {};
              newData.staticIndex = newData.staticIndex || {};
              newData.mains = newData.mains || [];
              answerNumArr = [];
              for (let i = 0; i < newData.mains.length; i++) {
                if (i != 0) {
                  if (Number(i) == Number(newData.staticIndex.mainIndex)) {
                    answerNumArr.push('S');
                  } else if (Number(i) < Number(newData.staticIndex.mainIndex)) {
                    answerNumArr.push('F');
                  } else if (Number(i) > Number(newData.staticIndex.mainIndex)) {
                    answerNumArr.push('N');
                  }
                }
              }
              // 将当期的信息状态返回给教师机
              sendMS('student:status', {
                ipAddr: localStorage.getItem('studentIpAddress'),
                monitorStatus: statusTrans[currentStatus],
                answerProcess:
                  toChinesNum(newData.staticIndex.mainIndex) +
                  '_' +
                  (newData.staticIndex.questionIndex + 1),
                instanceList: completionInstanceList(this.props.paperData),
                answerNum: answerNumArr,
                answerCount: newData.mains.length - 1,
              });
            }
            break;

          /* 回收试卷 */
          case 'recycle':
            if (currentStatus === 'Examination' || currentStatus === 'end') {
              console.log('==========回收试卷===========');
              this.recyclePaper();
            }
            // else{
            //   console.log('==========回收试卷失败===========');
            //   sendMS('recycle:reply', {
            //     ipAddr  : localStorage.getItem('studentIpAddress'),
            //     paperid : localStorage.getItem('snapshotId'),
            //     result: 3,
            //   });
            // }
            break;
          /* 结束考试 */
          case 'stop:manual':
            if (!this.props.isLoad) {
              //收到结束考试指令后，部分锁
              vb.isKeyLocked = 'special';
              vb.imeMode = true;
              if (this.state.currentStatus !== 'end') {
                console.log('end 考试失败');
                this.abnormalEndExam();

                //未答完题并接收到stop:manual指令后，调用Shell
                storeData({ binessStatus: 'MS_12' });

                // this.setState({ completeStatus: 'examFail', currentStatus: 'end' })
              } else if (this.state.examStatus) {
                this.setState({ completeStatus: 'normalCompete' });
              } else if (completeStatus !== 'upLoadFailed') {
                console.log('考试失败');
                this.setState({ completeStatus: 'examFail' });
              }
            }
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
          case 'manualFaile':
            // 教师机置该学生机失败
            // 设置考试失败
            vb.isKeyLocked = 'special';
            this.abnormalEndExam();
            // this.setExamFail();
            break;
          case 'disconnect':
            console.log('==============disconnect=================');
            this.state.isConnect = false;
            break;

          case 'taskStop':
            {
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

            break;

          case 'beforeProcess':
            if (!this.props.isLoad) {
              //收到结束考试指令后，部分锁
              vb.isKeyLocked = 'special';
              vb.imeMode = true;
              if (this.state.currentStatus !== 'end') {
                this.archiveFucPackage();
              } else {
                window.location.href = '/student';
              }
            }

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
    const { masterData = {}, currentStatus } = this.state;
    const { staticIndex = {}, mains = [] } = masterData;
    const {
      instructions,
      instructions: { sendMS, storeData },
    } = this.props;
    const ipAddr = localStorage.getItem('studentIpAddress');

    // 如果是耳机连上的事件则，做如下事件
    // 1、设备检测阶段中  耳机掉落出现弹窗，耳机连上重新进入设备检测页面
    // 2、其它阶段，判断是否有弹框如果有关闭
    if (state === 'online') {
      this.earStatus = true;
      if (currentStatus === 'Examination' || currentStatus === 'end') {
        // 考中的处理
        // 将当前的考试暂停设置为继续考试
        if (currentStatus === 'Examination') {
          emitter.emit('toggleExamStatus', true);
        }
        // 并且关闭弹框
        hideDeviceStatusModal();
      }
      return;
    }

    // 耳机掉落的监听事件，做如下操作
    if (state === 'offline') {
      this.earStatus = false;
      // 考试结束的化，不做任何处理
      if (currentStatus === 'end') return;

      if (currentStatus === 'Examination') {
        // 考中的话
        // 1、是否正在录音中，如果录音则设置考试失败
        // 2、判断当前是否还有掉落的事件超过了10s则考试失败
        const script =
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex
          ];
        if (
          script.stepPhase === 'RECORD_PHASE' ||
          script.stepPhase === 'SUB_RECORD_PHASE' ||
          this.offlineTime < 0
        ) {
          // 暂停考试
          emitter.emit('toggleExamStatus', false);
          // 设置考试失败
          this.setTaskError();

          // 掉耳机，调用Shell
          storeData({ binessStatus: 'MS_12' });
        } else {
          // 3、其它的话，暂停考试并且倒计时，如果0s还未上，直接考试失败
          emitter.emit('toggleExamStatus', false);
          // this.offlineTimeDownCount();
        }
      } else {
        // 考前处理，通知教师机设备异常
        // 放音检测失败
        sendMS('check:waveout', { result: 2, ipAddr });
        // 录音检测失败
        sendMS('check:wavein', { result: 2, ipAddr });
        // 当放录音检测失败，发送check:waveout/check:wavein指令后，调用Shell
        storeData({ binessStatus: 'MS_5' });
        // sthis.setState({ currentStatus: 'preExamCheckError' });
      }

      const doModal = () => {
        this.func = showDeviceStatusModal({
          dataSource: {
            instructions,
            recorder: this.recorder,
            player: this.player,
            status: currentStatus === 'Examination' ? 'tasking' : 'taskPre', // 显示的类型 默认 taskPre : 考前； tasking：考中； taskError ： 考试失败
            downTime: this.offlineTime, // 倒计时
            downTimeChange: time => {
              // 监听倒计时
              this.offlineTime = time;
              // 监听时间，0秒的时候，抛出考试失败
              if (time === 0) {
                hideDeviceStatusModal();
                this.setTaskError();
              }
            },
          },
          callback: async () => {
            if (currentStatus === 'Examination') {
              // 如果是考中不做任何处理
              // doModal();
            } else {
              // 再次进行设备检测，如果不通过再次弹框
              const { checkEarAndMicphoneStatus } = instructions;
              const { recorder, player } = await checkEarAndMicphoneStatus();
              this.recorder = recorder;
              this.player = player;
              if (!recorder || !recorder) {
                doModal();
              } else {
                this.setState({ changePreTime: Date.now(), currentStatus: 'preExamCheck' });
              }
            }
          },
        });
      };

      // 只有考中才有该弹窗口
      doModal();
    }
  };

  // 设置考试失败
  setTaskError = () => {
    const {
      instructions: { sendMS },
    } = this.props;

    this.setState({ isExam: false });
    vb.isKeyLocked = 'special';

    sendMS('student:examstatus', {
      examstatus: 'MS_12',
      ipAddr: localStorage.getItem('studentIpAddress'),
    });

    this.abnormalEndExam();
    // // 弹出错误提示框
    // showDeviceStatusModal({dataSource:{status:"taskError"}});
    // // 发送考试失败消息
    // sendMS('student:examstatus', {
    //   examstatus: "MS_12",
    //   ipAddr: localStorage.getItem('studentIpAddress')
    // });
    // // 设置考试失败
    // this.setExamFail();
  };

  /**
   * 打包试卷
   * @Author   tina.zhang
   * @DateTime 2018-12-19T10:24:35+0800
   * @return   {[type]}                 [description]
   */
  archiveFuc = (type = undefined, isAbnormal = undefined) => {
    const { sendMS, archive, storeData } = this.props.instructions;
    const { answersData } = this.state;
    const { paperData } = this.props;
    deleteAnswer(answersData, paperData);

    let tokenIds = GenerateAudioList(answersData.answerInfo);
    tokenIds = tokenIds.concat(this.state.recordIds);
    console.log('tokenIds', tokenIds);
    let studentInfo = localStorage.getItem('studentInfo');
    const snapshotId = localStorage.getItem('snapshotId');
    studentInfo = JSON.parse(studentInfo);

    console.log('archive打包试卷', answersData);
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
          paperid: answersData.id,
          respondentsObject: {
            paperid: answersData.id,
            paperName: e.fileName,
            respondentsMd5: e.md5,
            zeroCount,
            fileCount: e.count,
            needFileCount: isAbnormal === 'abnormal' ? 10000 : tokenIds.length,
          },
        };
        localStorage.setItem('md5', e.md5); // 答卷MD5
        localStorage.setItem('fileName', e.fileName); // 答卷名称
        this.state.respondentsObject = respondentsObject;
        // console.log(falg);
        this.uploadPaper(type, isAbnormal);
        // if (type == 'upload') {
        //   this.uploadPaper();
        // } else
        // if (type == 'stop:manual') {
        //   //结束考试
        //   self.recyclePaper();
        // }
      },
      fail: e => {
        console.log('archive打包试卷失败');
        // 学生机在考试阶段：当答卷打包自动重试3次无效后，考试失败--走重考流程
        this.newArchive = this.newArchive + 1;
        if (this.newArchive < 4) {
          self.archiveFuc();
        } else {
          self.setState({ completeStatus: 'examFail' });
          this.state.falg = false;
          if (type == 'stop:manual') {
            // 结束考试打包一次
            const studentIpAddress = localStorage.getItem('studentIpAddress');
            sendMS('recycle:reply', {
              ipAddr: studentIpAddress,
              paperid: snapshotId,
              result: 2,
            });

            //当上传答卷包失败，发送recycle:reply指令后，调用Shell
            storeData({ binessStatus: 'MS_13' });

            self.setState({ completeStatus: 'archiveFailed' });
          }
        }
      },
    });
  };

  /**
   * 结束考试
   * @Author   tina.zhang
   * @DateTime 2018-12-19T15:15:36+0800
   * @return   {[type]}                 [description]
   */
  endExam = (type = undefined) => {
    const { sendMS, storeData } = this.props.instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    const self = this;
    self.archiveFuc(type);
    const { paperData } = this.props;
    // this.state.answersData.deliverTime = new Date().getTime();
    // this.state.answersData.testTime = new Date().getTime() - this.state.startExamTime;

    const body = {
      paperId: paperData.id,
      paperName: paperData.name,
      duration: new Date().getTime() - this.state.startExamTime,
      ipAddr: studentIpAddress,
    };
    console.log(body);
    if (this.state.currentStatus != 'end') {
      playResource({
        type: 'TYPE_D4',
        success: () => {},
      });
    }
    sendMS('complete', body);

    //当答题完成，发送complete指令后，调用Shell
    storeData({ binessStatus: 'MS_9' });

    this.setState({ currentStatus: 'end' });
    emitter.emit('endExam', true);
  };

  /**
   * 异常结束考试处理
   * @Author   tina.zhang
   * @DateTime 2018-12-19T15:15:36+0800
   * @return   {[type]}                 [description]
   */
  abnormalEndExam = (type = undefined) => {
    const { sendMS } = this.props.instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    const self = this;
    self.archiveFuc(type, 'abnormal');
    if (this.state.currentStatus != 'end') {
      playResource({
        type: 'TYPE_D4',
        success: () => {},
      });
    }
    this.setState({ currentStatus: 'end' });
    emitter.emit('endExam', true);
  };

  /**
   * 设置考试结束，并且考试失败的状态
   */
  setExamFail = () => {
    this.setState({ currentStatus: 'end', completeStatus: 'examFail' });
    emitter.emit('endExam', true);
  };

  /**
   * 回收试卷
   * @Author   tina.zhang
   * @DateTime 2018-12-19T15:18:04+0800
   * @return   {[type]}                 [description]
   */
  recyclePaper = () => {
    const { isConnect, falg } = this.state;
    if (isConnect) {
      // this.setState({ completeStatus: 'upLoad' });
      if (falg) {
        // 上传试卷包
        this.uploadPaper();
      } else {
        // 重新打包并上传
        this.archiveFuc('upload');
      }
    }
  };

  /**
   * 上传试卷包
   * @Author   tina.zhang
   * @DateTime 2018-12-20T09:15:04+0800
   * @return   {[type]}                 [description]
   */
  uploadPaper = (type = undefined, isAbnormal = undefined) => {
    let self = this;
    const { sendMS, setc, archive, upload, storeData } = this.props.instructions;
    const { respondentsObject, isConnect } = this.state;
    let studentInfo = localStorage.getItem('studentInfo');
    studentInfo = JSON.parse(studentInfo);
    let snapshotId = localStorage.getItem('snapshotId');
    let paperMd5 = localStorage.getItem('paperMd5');
    let studentIpAddress = localStorage.getItem('studentIpAddress');
    console.log(studentInfo);
    console.log(respondentsObject.respondentsObject.respondentsMd5);
    console.log('上传试卷包');

    // 判断socket是否还在连接中，如果在则走上传试卷包流程，否则走上传失败的流程，等待重连后，提示

    let fetchUrl = `proxyapi/proxy/file?taskId=${
      studentInfo.taskId
    }&snapshotId=${snapshotId}&studentId=${studentInfo.stuid}&classId=${studentInfo.classId}`;
    if (respondentsObject.respondentsObject) {
      if (
        respondentsObject.respondentsObject.needFileCount >=
        respondentsObject.respondentsObject.fileCount
      ) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_5';
        fetchUrl = fetchUrl + '&respondentsStatus=RS_5';
      }

      if (respondentsObject.respondentsObject.zeroCount > 0) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_6';
        fetchUrl = fetchUrl + '&respondentsStatus=RS_6';
      }
    }

    // 断网可以上传大卷包

    // if (!isConnect) {
    //   sendMS('recycle:reply', {
    //     ipAddr: studentIpAddress,
    //     paperid: snapshotId,
    //     result: 3,
    //     respondentsObject,
    //   });

    //   //当上传答卷包失败，发送recycle:reply指令后，调用Shell
    //   storeData({binessStatus:"MS_13"})

    //   self.setState({ completeStatus: 'upLoadFailed' });
    //   return false;
    // }

    upload({
      url: fetchUrl,
      paperMd5: respondentsObject.respondentsObject.respondentsMd5,
      fileName: respondentsObject.respondentsObject.paperName,
      success: e => {
        sendMS('recycle:reply', {
          ipAddr: studentIpAddress,
          paperid: snapshotId,
          result: 1,
          respondentsObject,
        });
        // 当上传答卷包成功，发送recycle:reply指令后，调用Shell
        storeData({ binessStatus: 'MS_14' });
        self.setState({
          examStatus: true,
          completeStatus: 'upLoadSucess',
        });

        if (isAbnormal === 'abnormal') {
          self.setState({ completeStatus: 'examFail' });
        } else {
          if (type === 'stop:manual') {
            // 结束考试
            self.setState({ completeStatus: 'normalCompete' });
          } else {
            this.setState({ completeStatus: 'upLoadSucess' }, e => {
              setTimeout(() => {
                // 5秒后跳转。。。
                self.setState({ completeStatus: 'normalCompete' });
              }, 5000);
            });
          }
        }
      },
      fail: () => {
        // 学生机在考试阶段：当答卷上传自动重试3次无效后，走上传答卷包异常流程
        this.newTabIndex = this.newTabIndex + 1;
        if (this.newTabIndex < 4) {
          self.uploadPaper();
        } else {
          sendMS('recycle:reply', {
            ipAddr: studentIpAddress,
            paperid: snapshotId,
            result: 3,
            respondentsObject,
          });
          // 当上传答卷包失败，发送recycle:reply指令后，调用Shell
          storeData({ binessStatus: 'MS_13' });
          self.setState({ completeStatus: 'upLoadFailed' });
        }
      },
    });
    return true;
  };

  /**
   * 打包试卷 18.5	教师机进行新的任务时初始化学生机之前，判断学生机状态以及学生机的后续处理
   * @Author   tina.zhang
   * @DateTime 2018-12-19T10:24:35+0800
   * @return   {[type]}                 [description]
   */
  archiveFucPackage = (type = undefined, isAbnormal = undefined) => {
    const { sendMS, archive, storeData } = this.props.instructions;
    const { answersData } = this.state;
    const { paperData } = this.props;
    deleteAnswer(answersData, paperData);

    let tokenIds = GenerateAudioList(answersData.answerInfo);
    tokenIds = tokenIds.concat(this.state.recordIds);
    let studentInfo = localStorage.getItem('studentInfo');
    const snapshotId = localStorage.getItem('snapshotId');
    studentInfo = JSON.parse(studentInfo);
    const self = this;
    // 打包试卷
    console.log('打包试卷');
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
          paperid: answersData.id,
          respondentsObject: {
            paperid: answersData.id,
            paperName: e.fileName,
            respondentsMd5: e.md5,
            zeroCount,
            fileCount: e.count,
            needFileCount: isAbnormal === 'abnormal' ? 10000 : tokenIds.length,
          },
        };
        localStorage.setItem('md5', e.md5); // 答卷MD5
        localStorage.setItem('fileName', e.fileName); // 答卷名称
        this.state.respondentsObject = respondentsObject;
        this.uploadPaperFucPackage(type);
      },
      fail: e => {
        console.log('archive打包试卷失败');
        // 学生机在考试阶段：当答卷打包自动重试3次无效后，考试失败--走重考流程
        this.newArchive = this.newArchive + 1;
        if (this.newArchive < 4) {
          self.archiveFucPackage();
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
  uploadPaperFucPackage(type = undefined) {
    let self = this;
    const { sendMS, setc, archive, upload, storeData } = this.props.instructions;
    const { respondentsObject, isConnect } = this.state;
    let studentInfo = localStorage.getItem('studentInfo');
    studentInfo = JSON.parse(studentInfo);
    let snapshotId = localStorage.getItem('snapshotId');
    let paperMd5 = localStorage.getItem('paperMd5');
    let studentIpAddress = localStorage.getItem('studentIpAddress');
    // 判断socket是否还在连接中，如果在则走上传试卷包流程，否则走上传失败的流程，等待重连后，提示
    let fetchUrl = `proxyapi/proxy/file?taskId=${
      studentInfo.taskId
    }&snapshotId=${snapshotId}&studentId=${studentInfo.stuid}&classId=${studentInfo.classId}`;
    if (respondentsObject.respondentsObject) {
      if (
        respondentsObject.respondentsObject.needFileCount >=
        respondentsObject.respondentsObject.fileCount
      ) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_5';
        fetchUrl = fetchUrl + '&respondentsStatus=RS_5';
      }

      if (respondentsObject.respondentsObject.zeroCount > 0) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_6';
        fetchUrl = fetchUrl + '&respondentsStatus=RS_6';
      }
    }
    // 断网不跳转
    // if (!isConnect) {
    //   //当上传答卷包失败，发送recycle:reply指令后，调用Shell
    //   window.location.href="/student";
    //   return false;
    // }
    console.log('上传答卷包');
    upload({
      url: fetchUrl,
      paperMd5: respondentsObject.respondentsObject.respondentsMd5,
      fileName: respondentsObject.respondentsObject.paperName,
      success: e => {
        //当上传答卷包成功，发送recycle:reply指令后，调用Shell
        window.location.href = '/student';
      },
      fail: () => {
        // 学生机在考试阶段：当答卷上传自动重试3次无效后，走上传答卷包异常流程
        this.newTabIndex = this.newTabIndex + 1;
        if (this.newTabIndex < 4) {
          self.uploadPaperFucPackage();
        } else {
          //当上传答卷包失败，发送recycle:reply指令后，调用Shell
          window.location.href = '/student';
        }
      },
    });
    return true;
  }

  reLoadPaperData() {
    this.props.index.reLoadPaperData();
  }

  reLoadVerifiesData() {
    this.props.index.reLoadVerifiesData();
  }

  /**
   * 特殊题型插件评分
   * @author tina.zhang
   * @date 2019-03-14
   * @memberof ExampaperProduct
   */
  SpecialPluginScoring() {
    const { paperData } = this.props;
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
  scoringMachine(data, questionData, preStaticIndex = undefined) {
    const { paperData, showData } = this.props;
    const { masterData, answersData } = this.state;
    let { staticIndex } = masterData;

    if (preStaticIndex) {
      staticIndex = preStaticIndex;
    }
    let scroe = calculatScore(staticIndex, paperData);
    let res = scoringMachine(masterData, data, scroe, questionData, staticIndex);
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
      answersData.answerInfo[staticIndex.mainIndex - 1].order =
        masterData.mains[staticIndex.mainIndex].order;
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
    answersData.totalScore = calculatTotalScore(answersData.answerInfo);

    if (masterData.recallIndex) {
    } else {
      let newMasterData = this.assemblyData(paperData, showData);
      newMasterData.staticIndex = masterData.staticIndex;
      this.state.masterData = newMasterData;
    }

    this.onAnswerQuestion(res.answers, staticIndex);

    // this.setState({
    //   masterData: newMasterData,
    // });
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

  // /**
  //  * @author tina.zhang
  //  * @DateTime 2018-12-03T16:28:15+0800
  //  * @param    生成答案json
  //  * @return   {[type]}
  //  */
  // assemblyResultData(paperData) {

  //   let studentInfo = localStorage.getItem('studentInfo') || {};
  //   let answersData = {
  //     id: paperData.id,
  //     studentId: studentInfo.stuid || "",
  //     studentName: studentInfo.name || "",
  //     studentNumber: studentInfo.number || "",
  //     classId: '', //快照
  //     className: '',
  //     taskId: studentInfo.taskId || "",
  //     taskName: '',
  //     taskPaperId: '',
  //     testTime: '',
  //     deliverTime: '',
  //     fullMark: '',
  //     totalScore: '',
  //     answerInfo: [],
  //   };
  //   return answersData;
  // }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-17
   * @copyright 生成主控数据
   * @param     {[type]}    data 试卷详情
   * @return    {[type]}         [description]
   */
  assemblyData = (data, showData) => {
    const { masterData } = this.state;
    let master = {
      controlStatus: 'PLAY', // PLAY动态播放/PAUSE动态暂停/STATIC静态待命
      isRedording: 'N', // 启动录音时，大部分事件失效，通过这个信号量控制
      scene: 'TEST', // SHOW展示/EDIT编辑试卷/CORRECT修正/VERIFY校验//EXERCISE练习
      coverRate: data.coverRate, // 任务完成度百分比
      // allowChooseQuestion: data.allowChooseQuestion,//是否允许题库选题
      staticIndex: {
        mainIndex: 0, // 大题序号，注意0为开卷介绍，从1开始是标准题型，初始0
        questionIndex: 0, // 题目序号，复合题型为子题型序号，初始0
        // "subIndex":0    //小题序号（二层才有，含复合下的二层），初始0
      },
      mains: [],
    };
    if (masterData.dynamicIndex) {
      master.dynamicIndex = masterData.dynamicIndex;
    } else {
      master.dynamicIndex = {
        // 动态环节焦点
        scriptIndex: 0, // 当前步骤，初始0,
        timeStart: 0, // 时间索引，当前播放到的音频位置或计时位置，暂停时记录，初始0
      };
    }
    const { paperInstance } = data;
    const questions = new Array(paperInstance.length + 1);

    let paperHeadStatus = 0;

    // if (data.paperHead.paperHeadName != undefined && data.paperHead.paperHeadName != '') {
    //   paperHeadStatus = 100;
    // }
    questions[0] = {
      // 单个大题（含开卷）
      index: 0,
      type: 'INTRODUCTION', // 开卷介绍
      label: formatMessage(messages.introLabel),
      multipleQuestionPerPage: 'N', // 一页多题
      questions: [
        {
          // 单个题目
          index: 0,
          subs: ['i'], // subs里面是小题题序的数组，主要用于生成导航
          type: 'INTRODUCTION',
          status: paperHeadStatus, // 状态，不同视图下对应不同的内容，但颜色和数字统一
          pageSplit: 'N',
          answerStatus: 'N',
        },
      ],
    };
    let j;
    for (let i in paperInstance) {
      let m = Number(i) + 1;
      if (paperInstance[i].type == null || paperInstance[i].type == 'PATTERN') {
        let pattern = paperInstance[i].pattern;
        questions[m] = {};
        questions[m].index = m;
        questions[m].type = pattern.questionPatternType;
        questions[m].subjectiveAndObjective = pattern.subjectiveAndObjective;
        if (pattern.mainPatterns.questionPatternInstanceName != undefined) {
          questions[m].newLabel =
            (pattern.mainPatterns.questionPatternInstanceSequence || '') +
            pattern.mainPatterns.questionPatternInstanceName;
        }

        questions[m].label =
          pattern.mainPatterns.questionPatternInstanceName || pattern.questionPatternName;

        questions[m].multipleQuestionPerPage = 'N';
        questions[m].questionPatternId = pattern.questionPatternId;
        questions[m].order = paperInstance[i].order;
        if (pattern.questionPatternType == 'COMPLEX') {
          //复合题型拼装数据
          let patternGroups = pattern.groups;
          questions[m].questions = new Array(Number(patternGroups.length));
          for (j = 0; j < Number(patternGroups.length); j++) {
            //复合题型下面的题型是种类数
            questions[m].questions[j] = {};

            if (
              showData &&
              showData[pattern.questionPatternId] &&
              showData[pattern.questionPatternId].structure.groups[j].structure.flowInfo
            ) {
              //允许合并答题
              questions[m].questions[j].allowMultiAnswerMode =
                showData[pattern.questionPatternId].structure.groups[
                  j
                ].structure.flowInfo.allowMultiAnswerMode;
            } else {
              questions[m].questions[j].allowMultiAnswerMode = 'N';
            }

            if (patternGroups[j].pattern.hints) {
              questions[m].questions[j].hints = patternGroups[j].pattern.hints[0];
            }

            questions[m].questions[j].allowCompressReadSection =
              showData[pattern.questionPatternId].structure.groups[
                j
              ].structure.flowInfo.allowCompressReadSection;

            questions[m].questions[j].type = patternGroups[j].pattern.questionPatternType;
            questions[m].questions[j].subjectiveAndObjective =
              patternGroups[j].pattern.subjectiveAndObjective;
            questions[m].questions[j].markRatio =
              patternGroups[j].pattern.mainPatterns.markRatio || '1';
            questions[m].questions[j].index = Number(j);
            questions[m].questions[j].status = 0;

            questions[m].questions[j].pageSplit = 'N';
            questions[m].questions[j].answerStatus = 'N';
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

          for (j = 0; j < Number(pattern.mainPatterns.questionCount); j++) {
            questions[m].questions[j] = {};
            questions[m].questions[j].type = pattern.questionPatternType;
            questions[m].questions[j].markRatio = pattern.mainPatterns.markRatio || '1';
            questions[m].questions[j].index = Number(j);

            if (pattern.hints) {
              questions[m].questions[j].hints = pattern.hints[j];
            }

            if (showData && showData[pattern.questionPatternId]) {
              //允许合并答题
              questions[m].questions[j].allowMultiAnswerMode =
                showData[pattern.questionPatternId].structure.flowInfo &&
                showData[pattern.questionPatternId].structure.flowInfo.allowMultiAnswerMode;
            } else {
              questions[m].questions[j].allowMultiAnswerMode = 'N';
            }
            questions[m].questions[j].allowCompressReadSection =
              showData[pattern.questionPatternId].structure.flowInfo &&
              showData[pattern.questionPatternId].structure.flowInfo.allowCompressReadSection;

            if (
              paperInstance[i].questions[j] != null &&
              paperInstance[i].questions[j].id != undefined
            ) {
              questions[m].questions[j].status = 0;
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
    master = this.assemblyScript(master, data, showData);
    console.log(master);
    return master;
  };

  assemblyScript(masterData, paperData, showData) {
    // const { showData, paperData } = this.props;
    let paperInstance = paperData.paperInstance;
    let pattern, questions;
    let mains = masterData.mains;
    // console.log(mains)
    // console.log(showData)
    const { dataType } = this.props;
    let sortData = [];

    for (let i in mains) {
      let isPlugin = false;
      let frontEndModuleName = '';
      if (
        Number(i) > 0 &&
        paperData.paperInstance[Number(i) - 1].pattern &&
        paperData.paperInstance[Number(i) - 1].pattern.patternPlugin
      ) {
        isPlugin = isUsePlugin(
          paperData.paperInstance[Number(i) - 1].pattern.patternPlugin.pluginPhase,
          'P6_GENERATE_SCRIPT'
        );
        frontEndModuleName =
          paperData.paperInstance[Number(i) - 1].pattern.patternPlugin.frontEndModuleName;
      }
      if (isPlugin) {
        console.log('====================插件脚本生成======================');
        const { PluginScript } = require('@/frontlib/' + frontEndModuleName + 'Plugin/utils');
        PluginScript(paperData, i, mains, paperInstance, dataType, pattern, questions);
      } else {
        //主要处理答题指导阶段的脚本拼装
        switch (mains[i].type) {
          case 'INTRODUCTION':
            mains[i].questions[0].scripts = [];
            if (
              (paperData.paperHead.paperHeadAudio != null &&
                paperData.paperHead.paperHeadAudio != '' &&
                paperData.paperHead.paperHeadAudio != undefined) ||
              paperData.paperHead.paperHeadName == '' ||
              paperData.paperHead.paperHeadName == null
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'PAPER_INTRODUCTION', //PAPER_INTRODUCTION开卷介绍/MAIN_GUIDE大题答题指导环节/CHILD_GUIDE子题型答题指导环节/QUESTION_INFO二层题型提示信息环节
                //GUIDE_PREFIX题前指导听题环节/GUIDE_MIDDLE中间指导听题环节/GUIDE_SUFFIX题后指导听题环节
                //READ_PHASE读题阶段/LISTENING_PHASE听题阶段/VIDEO_PHASE视频播放阶段/PREPARE_PHASE准备阶段/ANSWER_PHASE答题阶段/RECORD_PHASE录音答题阶段
                //SUB_READ_PHASE小题读题阶段/SUB_LISTENING_PHASE小题听题阶段/SUB_PREPARE_PHASE小题准备阶段/SUB_ANSWER_PHASE小题答题阶段/SUB_RECORD_PHASE小题录音答题阶段
                stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'PAPER_INTRODUCTION') ||
                  formatMessage(messages.toGuidance), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: paperData.paperHead.paperHeadAudio, //播放的资源文件ID
                time:
                  paperData.paperHead.paperHeadAudioTime == null ||
                  paperData.paperHead.paperHeadAudioTime == 0
                    ? 5
                    : paperData.paperHead.paperHeadAudioTime, //持续时间，秒
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
              });
            }
            if (paperData.paperHead.paperHeadDelay && paperData.paperHead.paperHeadDelay != 0) {
              mains[i].questions[0].scripts.push({
                index: 1,
                stepPhase: 'SPLITTER_DELAY',
                stepType: 'WAITING',
                stepLabel:
                  MatchDictionary(dataType, 'PAPER_INTRODUCTION_COUNTDOWN') ||
                  formatMessage(messages.toGuidance),
                resourceUrl: '',
                time:
                  paperData.paperHead.paperHeadDelay == null
                    ? 0
                    : paperData.paperHead.paperHeadDelay,
                subMappingIndex: [0],
              });
            }
            if (paperData.paperHead.paperHeadNavTime && paperData.paperHead.paperHeadNavTime != 0) {
              mains[i].questions[0].scripts.push({
                index: 2,
                stepPhase: 'PAPER_INTRODUCTION_COUNTDOWN',
                stepType: 'WAITING',
                stepLabel:
                  MatchDictionary(dataType, 'PAPER_INTRODUCTION_COUNTDOWN') ||
                  formatMessage(messages.toGuidance),
                resourceUrl: '',
                time:
                  paperData.paperHead.paperHeadNavTime == null
                    ? 0
                    : paperData.paperHead.paperHeadNavTime,
                subMappingIndex: [0],
              });
            }
            if (mains[i].questions[0].scripts.length == 0) {
              mains[i].questions[0].scripts.push({
                index: 1,
                stepPhase: 'SPLITTER_DELAY',
                stepType: 'WAITING',
                stepLabel:
                  MatchDictionary(dataType, 'PAPER_INTRODUCTION_COUNTDOWN') ||
                  formatMessage(messages.toGuidance),
                resourceUrl: '',
                time: 0,
                subMappingIndex: [0],
              });
            }
            break;
          case 'NORMAL':
            sortData = this.sort(showData, mains[i].questionPatternId, mains[i].type);
            for (let m in mains[i].questions) {
              if (m == 0) {
                pattern = paperInstance[i - 1].pattern;
                questions = paperInstance[i - 1].questions[m];
                mains[i].questions[m].scripts = [];
                if (pattern.mainPatterns.questionPatternInstanceAudio) {
                  mains[i].questions[m].scripts.push({
                    stepPhase: 'TITLE',
                    stepType: 'PLAY_AUDIO',
                    stepLabel:
                      MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.questionPatternInstanceAudio || '',
                    time: pattern.mainPatterns.questionPatternInstanceAudioTime || 5,
                    subMappingIndex: [0],
                  });
                }
                if (
                  pattern.mainPatterns.answerGuideText != 'NO_GUIDE' &&
                  pattern.mainPatterns.answerGuideAudio
                ) {
                  mains[i].questions[m].scripts.push({
                    stepPhase: 'MAIN_GUIDE',
                    stepType: 'WAITING',
                    stepLabel:
                      MatchDictionary(dataType, 'MAIN_GUIDE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.answerGuideAudio || '',
                    time: pattern.mainPatterns.answerGuideAudioTime || 5,
                    subMappingIndex: [0],
                  });
                }
                if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
                  if (
                    pattern.mainPatterns.answerGuideDelay &&
                    pattern.mainPatterns.answerGuideDelay != 0
                  ) {
                    mains[i].questions[m].scripts.push({
                      stepPhase: 'MAIN_GUIDE',
                      stepType: 'WAITING',
                      stepLabel: formatMessage(messages.waiting),
                      resourceUrl: '',
                      time: pattern.mainPatterns.answerGuideDelay || 5,
                      subMappingIndex: [0],
                    });
                  }
                }

                mains[i].questions[m].scripts = mains[i].questions[m].scripts.concat(
                  this.generate(paperData, mains[i].questions[m], sortData, i, m)
                );
              } else {
                mains[i].questions[m].scripts = this.generate(
                  paperData,
                  mains[i].questions[m],
                  sortData,
                  i,
                  m
                );
              }

              for (let n in mains[i].questions[m].scripts) {
                mains[i].questions[m].scripts[n].index = n;
              }
            }
            break;
          case 'TWO_LEVEL':
            sortData = this.sort(showData, mains[i].questionPatternId, mains[i].type);
            // console.log(sortData);
            // console.log("mains", mains[i])
            for (let m in mains[i].questions) {
              pattern = paperInstance[i - 1].pattern;
              questions = paperInstance[i - 1].questions[m];
              mains[i].questions[m].scripts = [];
              if (m == 0) {
                if (pattern.mainPatterns.questionPatternInstanceAudio) {
                  mains[i].questions[m].scripts.push({
                    stepPhase: 'TITLE',
                    stepType: 'PLAY_AUDIO',
                    stepLabel:
                      MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.questionPatternInstanceAudio || '',
                    time: pattern.mainPatterns.questionPatternInstanceAudioTime || 5,
                    subMappingIndex: [0],
                    showSubFocus: 'N',
                  });
                }
                if (
                  pattern.mainPatterns.answerGuideAudio &&
                  pattern.mainPatterns.answerGuideText != 'NO_GUIDE'
                ) {
                  mains[i].questions[m].scripts.push({
                    stepPhase: 'MAIN_GUIDE',
                    stepType: 'WAITING',
                    stepLabel:
                      MatchDictionary(dataType, 'MAIN_GUIDE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.answerGuideAudio || '',
                    time: pattern.mainPatterns.answerGuideAudioTime || 5,
                    subMappingIndex: [0],
                    showSubFocus: 'N',
                  });
                }

                if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
                  if (
                    pattern.mainPatterns.answerGuideDelay &&
                    pattern.mainPatterns.answerGuideDelay != 0
                  ) {
                    mains[i].questions[m].scripts.push({
                      stepPhase: 'MAIN_GUIDE',
                      stepType: 'WAITING',
                      stepLabel: formatMessage(messages.waiting),
                      resourceUrl: '',
                      time: pattern.mainPatterns.answerGuideDelay || 5,
                      subMappingIndex: [0],
                      showSubFocus: 'N',
                    });
                  }
                }
              }

              if (pattern.subQuestionPatterns[m].hintAudio) {
                mains[i].questions[m].scripts.push({
                  stepPhase: 'QUESTION_INFO',
                  stepType: 'WAITING',
                  stepLabel:
                    MatchDictionary(dataType, 'QUESTION_INFO') ||
                    formatMessage(messages.toGuidance),
                  resourceUrl: pattern.subQuestionPatterns[m].hintAudio || '',
                  time: pattern.subQuestionPatterns[m].hintAudioTime || 5,
                  subMappingIndex: [m],
                  showSubFocus: 'N',
                });
              }

              mains[i].questions[m].scripts = mains[i].questions[m].scripts.concat(
                this.generate(paperData, mains[i].questions[m], sortData, i, m)
              );

              if (paperInstance[i - 1].questions[m] != null) {
                //空题目不制题
                this.compressReadSection(mains[i].questions[m]);
              }

              for (let n in mains[i].questions[m].scripts) {
                mains[i].questions[m].scripts[n].index = n;
              }
            }
            break;
          case 'COMPLEX':
            for (let j in mains[i].questions) {
              sortData = this.sort(showData, mains[i].questionPatternId, mains[i].type, j);
              pattern = paperInstance[i - 1].pattern.groups[j].pattern;
              // questions = paperInstance[i-1].questions[0].data.groups[j];
              if (mains[i].questions[j].type == 'NORMAL') {
                mains[i].questions[j].scripts = [];
                if (j == 0) {
                  if (paperInstance[i - 1].pattern.mainPatterns.questionPatternInstanceAudio) {
                    mains[i].questions[j].scripts.push({
                      stepPhase: 'TITLE',
                      stepType: 'PLAY_AUDIO',
                      stepLabel:
                        MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                      resourceUrl:
                        paperInstance[i - 1].pattern.mainPatterns.questionPatternInstanceAudio ||
                        '',
                      time:
                        paperInstance[i - 1].pattern.mainPatterns
                          .questionPatternInstanceAudioTime || 5,
                      subMappingIndex: [0],
                    });
                  }
                  if (
                    paperInstance[i - 1].pattern.mainPatterns.answerGuideAudio &&
                    paperInstance[i - 1].pattern.mainPatterns.answerGuideText != 'NO_GUIDE'
                  ) {
                    mains[i].questions[j].scripts.push({
                      stepPhase: 'MAIN_GUIDE',
                      stepType: 'WAITING',
                      stepLabel:
                        MatchDictionary(dataType, 'MAIN_GUIDE') ||
                        formatMessage(messages.toGuidance),
                      resourceUrl: paperInstance[i - 1].pattern.mainPatterns.answerGuideAudio || '',
                      time: paperInstance[i - 1].pattern.mainPatterns.answerGuideAudioTime || 5,
                      subMappingIndex: [j],
                    });
                  }
                  if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
                    if (
                      paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay &&
                      paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay != 0
                    ) {
                      mains[i].questions[j].scripts.push({
                        stepPhase: 'MAIN_GUIDE',
                        stepType: 'WAITING',
                        stepLabel: formatMessage(messages.waiting),
                        resourceUrl: '',
                        time: paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay || 5,
                        subMappingIndex: [0],
                      });
                    }
                  }
                }
                if (pattern.mainPatterns.questionPatternInstanceAudio) {
                  mains[i].questions[j].scripts.push({
                    stepPhase: 'TITLE',
                    stepType: 'PLAY_AUDIO',
                    stepLabel:
                      MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.questionPatternInstanceAudio || '',
                    time: pattern.mainPatterns.questionPatternInstanceAudioTime || 5,
                    subMappingIndex: [0],
                  });
                }
                if (
                  pattern.mainPatterns.answerGuideAudio &&
                  pattern.mainPatterns.answerGuideText != 'NO_GUIDE'
                ) {
                  mains[i].questions[j].scripts.push({
                    stepPhase: 'CHILD_GUIDE',
                    stepType: 'WAITING',
                    stepLabel:
                      MatchDictionary(dataType, 'CHILD_GUIDE') ||
                      formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.answerGuideAudio || '',
                    time: pattern.mainPatterns.answerGuideAudioTime || 5,
                    subMappingIndex: [j],
                  });
                }
              } else if (mains[i].questions[j].type == 'TWO_LEVEL') {
                mains[i].questions[j].scripts = [];
                if (j == 0) {
                  if (paperInstance[i - 1].pattern.mainPatterns.questionPatternInstanceAudio) {
                    mains[i].questions[j].scripts.push({
                      stepPhase: 'TITLE',
                      stepType: 'PLAY_AUDIO',
                      stepLabel:
                        MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                      resourceUrl:
                        paperInstance[i - 1].pattern.mainPatterns.questionPatternInstanceAudio ||
                        '',
                      time:
                        paperInstance[i - 1].pattern.mainPatterns
                          .questionPatternInstanceAudioTime || 5,
                      subMappingIndex: [0],
                      showSubFocus: 'N',
                    });
                  }
                  if (
                    paperInstance[i - 1].pattern.mainPatterns.answerGuideAudio &&
                    paperInstance[i - 1].pattern.mainPatterns.answerGuideText != 'NO_GUIDE'
                  ) {
                    mains[i].questions[j].scripts.push({
                      stepPhase: 'MAIN_GUIDE',
                      stepType: 'WAITING',
                      stepLabel:
                        MatchDictionary(dataType, 'MAIN_GUIDE') ||
                        formatMessage(messages.toGuidance),
                      resourceUrl: paperInstance[i - 1].pattern.mainPatterns.answerGuideAudio || '',
                      time: paperInstance[i - 1].pattern.mainPatterns.answerGuideAudioTime || 5,
                      subMappingIndex: [j],
                      showSubFocus: 'N',
                    });
                  }

                  if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
                    if (
                      paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay &&
                      paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay != 0
                    ) {
                      mains[i].questions[j].scripts.push({
                        stepPhase: 'MAIN_GUIDE',
                        stepType: 'WAITING',
                        stepLabel: formatMessage(messages.waiting),
                        resourceUrl: '',
                        time: paperInstance[i - 1].pattern.mainPatterns.answerGuideDelay || 5,
                        subMappingIndex: [0],
                        showSubFocus: 'N',
                      });
                    }
                  }
                }
                if (pattern.mainPatterns.questionPatternInstanceAudio) {
                  mains[i].questions[j].scripts.push({
                    stepPhase: 'TITLE',
                    stepType: 'PLAY_AUDIO',
                    stepLabel:
                      MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.questionPatternInstanceAudio || '',
                    time: pattern.mainPatterns.questionPatternInstanceAudioTime || 5,
                    subMappingIndex: [0],
                    showSubFocus: 'N',
                  });
                }
                if (
                  pattern.mainPatterns.answerGuideAudio &&
                  pattern.mainPatterns.answerGuideText != 'NO_GUIDE'
                ) {
                  mains[i].questions[j].scripts.push({
                    stepPhase: 'CHILD_GUIDE',
                    stepType: 'WAITING',
                    stepLabel:
                      MatchDictionary(dataType, 'CHILD_GUIDE') ||
                      formatMessage(messages.toGuidance),
                    resourceUrl: pattern.mainPatterns.answerGuideAudio || '',
                    time: pattern.mainPatterns.answerGuideAudioTime || 5,
                    subMappingIndex: [j],
                    showSubFocus: 'N',
                  });
                }
                if (pattern.subQuestionPatterns[0] && pattern.subQuestionPatterns[0].hintAudio) {
                  mains[i].questions[j].scripts.push({
                    stepPhase: 'QUESTION_INFO',
                    stepType: 'WAITING',
                    stepLabel:
                      MatchDictionary(dataType, 'QUESTION_INFO') ||
                      formatMessage(messages.toGuidance),
                    resourceUrl:
                      (pattern.subQuestionPatterns[0] &&
                        pattern.subQuestionPatterns[0].hintAudio) ||
                      '',
                    time:
                      (pattern.subQuestionPatterns[0] &&
                        pattern.subQuestionPatterns[0].hintAudioTime) ||
                      5,
                    subMappingIndex: [j],
                    showSubFocus: 'N',
                  });
                }
              }
              mains[i].questions[j].scripts = mains[i].questions[j].scripts.concat(
                this.generate(paperData, mains[i].questions[j], sortData, i, j)
              );

              if (paperInstance[i - 1].questions[j] != null) {
                //空题目不制题
                this.compressReadSection(mains[i].questions[j]);
              }

              for (let n in mains[i].questions[j].scripts) {
                mains[i].questions[j].scripts[n].index = n;
              }
            }
            break;
          case 'SPLITTER':
            mains[i].questions[0].scripts = [];

            if (
              paperInstance[i - 1].splitter.audio != undefined &&
              paperInstance[i - 1].splitter.audio != ''
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_AUDIO',
                stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_AUDIO') || formatMessage(messages.toGuidance), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: paperInstance[i - 1].splitter.audio, //播放的资源文件地址
                time: paperInstance[i - 1].splitter.audioTime, //持续时间，秒
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
              });
            }
            if (paperInstance[i - 1].splitter.navTime != 0) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_DELAY',
                stepType: 'WAITING', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_DELAY') ||
                  formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: '', //播放的资源文件地址
                time: paperInstance[i - 1].splitter.navTime, //持续时间，秒
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
              });
            }

            break;
          case 'RECALL':
            mains[i].questions[0].scripts = [];

            if (
              paperInstance[i - 1].recall.startPage &&
              paperInstance[i - 1].recall.startPage.audio != undefined &&
              paperInstance[i - 1].recall.startPage.audio != ''
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_AUDIO',
                stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_AUDIO') || formatMessage(messages.toGuidance), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: paperInstance[i - 1].recall.startPage.audio, //播放的资源文件地址
                time: paperInstance[i - 1].recall.startPage.audioTime, //持续时间，秒
                content: paperInstance[i - 1].recall.startPage.content,
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
                start: true,
              });
            }
            if (
              paperInstance[i - 1].recall.startPage &&
              paperInstance[i - 1].recall.startPage.navTime &&
              paperInstance[i - 1].recall.startPage.navTime != 0
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_DELAY',
                stepType: 'WAITING', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_DELAY') ||
                  formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: '', //播放的资源文件地址
                time: paperInstance[i - 1].recall.startPage.navTime, //持续时间，秒
                content: paperInstance[i - 1].recall.startPage.content,
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
                start: true,
              });
            }
            if (paperInstance[i - 1].recall.time && paperInstance[i - 1].recall.time != 0) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'RECALL',
                stepType: 'WAITING', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'RECALL') ||
                  formatMessage({ id: 'app.text.Intheback', defaultMessage: '回溯中' }), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: '', //播放的资源文件地址
                time: paperInstance[i - 1].recall.time, //持续时间，秒
                recallIndex: i,
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
              });
            }

            if (
              paperInstance[i - 1].recall.endPage &&
              paperInstance[i - 1].recall.endPage.audio != undefined &&
              paperInstance[i - 1].recall.endPage.audio != ''
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_AUDIO',
                stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_AUDIO') || formatMessage(messages.toGuidance), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: paperInstance[i - 1].recall.endPage.audio, //播放的资源文件地址
                time: paperInstance[i - 1].recall.endPage.audioTime, //持续时间，秒
                content: paperInstance[i - 1].recall.endPage.content,
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
                start: false,
              });
            }
            if (
              paperInstance[i - 1].recall.endPage &&
              paperInstance[i - 1].recall.endPage.navTime &&
              paperInstance[i - 1].recall.endPage.navTime != 0
            ) {
              mains[i].questions[0].scripts.push({
                //单个环节
                index: 0,
                stepPhase: 'SPLITTER_DELAY',
                stepType: 'WAITING', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel:
                  MatchDictionary(dataType, 'SPLITTER_DELAY') ||
                  formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }), //显示在状态栏的名称，与stepPhase对应，增加一些格式转换要求
                resourceUrl: '', //播放的资源文件地址
                time: paperInstance[i - 1].recall.endPage.navTime, //持续时间，秒
                content: paperInstance[i - 1].recall.endPage.content,
                subMappingIndex: [0], //映射到哪个小题题序，注意是index
                start: false,
              });
            }

            break;
        }
      }
    }

    return masterData;
  }

  /**
   * 压缩读题时间
   * @Author   tina.zhang
   * @DateTime 2018-12-25T11:37:33+0800
   * @return   {[type]}                 [description]
   */
  compressReadSection = mains => {
    for (let n in mains.scripts) {
      if (mains.allowCompressReadSection == 'Y') {
        if (mains.scripts[n].stepPhase == 'SUB_LISTENING_PHASE') {
          if (mains.scripts[n].resourceUrl == '' || mains.scripts[n].resourceUrl == null) {
            //去掉听题时间
            for (let m in mains.scripts) {
              if (mains.scripts[m].stepPhase == 'SUB_READ_PHASE') {
                mains.scripts.splice(n, 1);
                break;
              }
            }
          } else {
            for (let m in mains.scripts) {
              //去掉读题时间
              if (mains.scripts[n].subMappingIndex && mains.scripts[m].subMappingIndex) {
                if (
                  mains.scripts[m].stepPhase == 'SUB_READ_PHASE' &&
                  mains.scripts[n].subMappingIndex[0] == mains.scripts[m].subMappingIndex[0]
                ) {
                  mains.scripts.splice(m, 1);
                }
              }
            }
          }
        }
      }
    }
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-28
   * @copyright 考试流程排序
   * @param     {[type]}    questionPatternId [description]
   * @param     {[type]}    type              [description]
   * @return    {[type]}                      [description]
   */
  sort = (showData, questionPatternId, type, complexIndex = undefined) => {
    let componentsData,
      subComponentsData,
      newData = [];

    if (type === 'COMPLEX') {
      componentsData =
        showData[questionPatternId].structure.groups[complexIndex].structure.flowInfo.components; // 小题的配置
      subComponentsData =
        showData[questionPatternId].structure.groups[complexIndex].structure.flowInfo.subComponents; // 子题的配置
    } else {
      componentsData = showData[questionPatternId].structure.flowInfo.components; // 小题的配置
      subComponentsData = showData[questionPatternId].structure.flowInfo.subComponents; // 子题的配置
    }
    // sort排序components
    for (let i in componentsData) {
      let index = Number(componentsData[i].orderIndex);
      newData[index] = {};
      newData[index].components = componentsData[i];
    }
    // sort排序subComponents
    for (let i in subComponentsData) {
      let index = Number(subComponentsData[i].orderIndex);
      if (newData[index] == undefined) {
        newData[index] = {};
        newData[index].subComponents = subComponentsData[i];
      } else {
        newData[index].subComponents = subComponentsData[i];
      }
    }
    // 去除数组中的空值
    return newData.filter(item => item);
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-28
   * @copyright 生成小题实际做题阶段脚本
   * @return    {[type]}    [description]
   */
  generate(paperData, mainData, sortData, mainIndex, questionIndex, subIndex = undefined) {
    let paperInstance = paperData.paperInstance;
    let pattern, questions;
    let hintsObject = {};
    const { dataType } = this.props;
    let questionId_flag = false; //判断题目是否制作完成
    if (paperInstance[mainIndex - 1].questions[questionIndex] == null) {
      questionId_flag = true;
    }
    if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
      pattern = paperInstance[mainIndex - 1].pattern.groups[questionIndex].pattern;
      if (paperInstance[mainIndex - 1].questions[0]) {
        questions = paperInstance[mainIndex - 1].questions[0].data.groups[questionIndex];
        questionId_flag = false;
      } else {
        questions = null;
        questionId_flag = true;
      }
    } else {
      pattern = paperInstance[mainIndex - 1].pattern;
      questions = paperInstance[mainIndex - 1].questions[questionIndex];
    }

    let scripts = [];
    for (let i in sortData) {
      if (sortData[i].components) {
        let subMappingIndex = [];
        if (mainData.allowMultiAnswerMode == 'Y') {
          subMappingIndex = mainData.subs;
        } else {
          subMappingIndex.push(mainData.subs[questionIndex]);
        }
        if (pattern.hints) {
          //提示语优化
          if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
            questionIndex = 0;
          }
          if (pattern.hints && pattern.hints[questionIndex]) {
            //主题目提示语脚本生成
            let hintsObject = this.getPatternInfoText(
              sortData[i].components.name,
              pattern.hints[questionIndex]
            );
            if (
              hintsObject &&
              (hintsObject.text != '' || hintsObject.audioTime || hintsObject.audio)
            ) {
              scripts.push({
                stepPhase: 'QUESTION_INFO',
                stepType: 'PLAY_AUDIO',
                stepLabel:
                  MatchDictionary(dataType, 'QUESTION_INFO') || formatMessage(messages.toGuidance),
                resourceUrl: hintsObject.audio || '',
                time: hintsObject.audioTime || 0,
                subMappingIndex: [0],
                info: hintsObject.text,
                showSubFocus: 'N',
              });
            }
          }
        }
        let arr1 = this.createStepPhase(
          sortData[i].components.name,
          pattern,
          questions,
          questionIndex,
          subIndex
        );

        // console.log("========a==========", pattern)
        if (arr1.readTime) {
          for (let m = 0; m < Number(arr1.readTime); m++) {
            let stepLabel = arr1.stepLabel.replace('&0&', '#' + (Number(m) + 1) + '#');

            if (paperData.config && paperData.config.showOrdinal == 'N') {
              stepLabel = stepLabel.split('|')[0] + '|';
            }

            if (m != 0 && pattern.audioGapHints && pattern.audioGapHints.stemListeningHintTime) {
              scripts.push({
                stepPhase: 'TITLE',
                stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel: MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                resourceUrl: pattern.audioGapHints.stemListeningHint || '',
                time: pattern.audioGapHints.stemListeningHintTime,
                subMappingIndex: subMappingIndex,
                tone: 'TYPE_00',
                showSubFocus: 'N',
              });
            }
            if (
              (Number(m) + 1) % 2 == 0 &&
              arr1.resourceUrl2 != '' &&
              arr1.resourceUrl2 != null &&
              arr1.resourceUrl2 != undefined
            ) {
              scripts.push({
                stepPhase: arr1.stepPhase,
                stepType: arr1.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel: stepLabel,
                resourceUrl: arr1.resourceUrl2 || '',
                time: arr1.time2 || 5,
                aheadDelivery: arr1.aheadDelivery,
                subMappingIndex: subMappingIndex,
                tone: arr1.tone || 'TYPE_00',
                showSubFocus: 'N',
              });
            } else {
              if (
                (arr1.resourceUrl != '' &&
                  arr1.resourceUrl != null &&
                  arr1.resourceUrl != undefined) ||
                questionId_flag
              ) {
                scripts.push({
                  stepPhase: arr1.stepPhase,
                  stepType: arr1.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                  stepLabel: stepLabel,
                  resourceUrl: arr1.resourceUrl || '',
                  time: arr1.time || 5,
                  aheadDelivery: arr1.aheadDelivery,
                  subMappingIndex: subMappingIndex,
                  tone: arr1.tone || 'TYPE_00',
                  showSubFocus: 'N',
                });
              }
            }
          }
        } else {
          if (arr1.time != 0 || questionId_flag) {
            scripts.push({
              stepPhase: arr1.stepPhase,
              stepType: arr1.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
              stepLabel: arr1.stepLabel,
              resourceUrl: arr1.resourceUrl || '',
              time: arr1.time || 5,
              aheadDelivery: arr1.aheadDelivery,
              subMappingIndex: subMappingIndex,
              tone: arr1.tone || 'TYPE_00',
              showSubFocus: 'N',
              recordHints: (paperData.config && paperData.config.recordHints) || {
                start: 'Y',
                end: 'Y',
              },
            });
          }
        }
      }
    }

    if (pattern.questionPatternType == 'NORMAL') {
      if (pattern.interval) {
        //主题目间隔音效生成
        if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
          questionIndex = 0;
        }
        if (pattern.interval[questionIndex][0]) {
          scripts.push({
            stepPhase: 'INTERVAL',
            stepType: 'WAITING',
            stepLabel:
              MatchDictionary(dataType, 'INTERVAL') ||
              formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }),
            resourceUrl: pattern.interval[questionIndex][0].audioType,
            time: pattern.interval[questionIndex][0].delay,
            subMappingIndex: [0],
          });
        }
      }
    }
    if (pattern.questionPatternType == 'TWO_LEVEL') {
      //二层题型的脚本生成
      let subQuestionCount;
      if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
        questionIndex = 0;
      }
      if (pattern.subQuestionPatterns[questionIndex]) {
        subQuestionCount = pattern.subQuestionPatterns[questionIndex].subQuestionCount;
      } else {
        subQuestionCount = pattern.mainPatterns.subQuestionCount;
      }

      if (subQuestionCount == 0) {
        subQuestionCount = pattern.mainPatterns.subQuestionCount;
      }
      if (mainData.allowMultiAnswerMode == 'Y') {
        //合并答题处理
        for (let i in sortData) {
          if (sortData[i].subComponents) {
            if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
              questionIndex = 0;
            }
            if (pattern.hints && pattern.hints[questionIndex]) {
              //子题目提示语生成
              hintsObject = this.getPatternInfoText(
                sortData[i].subComponents.name,
                pattern.hints[questionIndex],
                0,
                'Y'
              );
              if (
                hintsObject &&
                (hintsObject.text != '' || hintsObject.audioTime || hintsObject.audio)
              ) {
                scripts.push({
                  stepPhase: 'QUESTION_INFO',
                  stepType: 'PLAY_AUDIO',
                  stepLabel:
                    MatchDictionary(dataType, 'QUESTION_INFO') ||
                    formatMessage({ id: 'app.listen.to.guidance', defaultMessage: '听指导' }),
                  resourceUrl: hintsObject.audio || '',
                  time: hintsObject.audioTime || 0,
                  subMappingIndex: [mainData.subs[0]],
                  info: hintsObject.text,
                });
              }
            }

            let arr2 = this.createStepPhase(
              sortData[i].subComponents.name,
              pattern,
              questions,
              questionIndex
            );
            if (arr2.time != 0 || questionId_flag) {
              scripts.push({
                stepPhase: arr2.stepPhase,
                stepType: arr2.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                stepLabel: arr2.stepLabel,
                resourceUrl: arr2.resourceUrl || '',
                time: arr2.time || 5,
                aheadDelivery: arr2.aheadDelivery,
                subMappingIndex: mainData.subs,
                tone: arr2.tone || 'TYPE_00',
                recordHints: (paperData.config && paperData.config.recordHints) || {
                  start: 'Y',
                  end: 'Y',
                },
              });
            }
          }
        }

        if (pattern.interval) {
          //子题目间隔音生成

          let maxLength = pattern.interval[questionIndex].length - 1;

          if (pattern.interval[questionIndex][maxLength]) {
            scripts.push({
              stepPhase: 'INTERVAL',
              stepType: 'WAITING',
              stepLabel:
                MatchDictionary(dataType, 'INTERVAL') ||
                formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }),
              resourceUrl: pattern.interval[questionIndex][maxLength].audioType,
              time: pattern.interval[questionIndex][maxLength].delay,
              subMappingIndex: mainData.subs,
            });
          }
        }
      } else {
        //分开答题处理
        for (let n = 0; n < subQuestionCount; n++) {
          /**问答切换处理位置 */
          if (!questionId_flag) {
            if (
              questions.data.subQuestion[n] &&
              questions.data.subQuestion[n].askAnswerSection == null
            ) {
              sortData = this.exchange(sortData, 'ANSWER');
            }

            if (questions.data.subQuestion[n] && questions.data.subQuestion[n].askAnswerSection) {
              if (questions.data.subQuestion[n].askAnswerSection === 'ASK') {
                sortData = this.exchange(sortData, 'ASK');
              } else if (questions.data.subQuestion[n].askAnswerSection === 'ANSWER') {
                sortData = this.exchange(sortData, 'ANSWER');
              }
            }
          }

          for (let i in sortData) {
            if (sortData[i].subComponents) {
              if (pattern.hints) {
                //子题提示语优化
                if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
                  questionIndex = 0;
                }
                if (pattern.hints && pattern.hints[questionIndex]) {
                  hintsObject = this.getPatternInfoText(
                    sortData[i].subComponents.name,
                    pattern.hints[questionIndex],
                    n
                  );

                  if (
                    hintsObject &&
                    (hintsObject.text != '' || hintsObject.audioTime || hintsObject.audio)
                  ) {
                    scripts.push({
                      stepPhase: 'QUESTION_INFO',
                      stepType: 'PLAY_AUDIO',
                      stepLabel:
                        MatchDictionary(dataType, 'QUESTION_INFO') ||
                        formatMessage(messages.toGuidance),
                      resourceUrl: hintsObject.audio || '',
                      time: hintsObject.audioTime || 0,
                      subMappingIndex: [mainData.subs[n]],
                      info: hintsObject.text,
                      showSubFocus: 'Y',
                    });
                  }
                }
              }
              let arr2 = this.createStepPhase(
                sortData[i].subComponents.name,
                pattern,
                questions,
                questionIndex,
                n
              );
              if (arr2.readTime) {
                //听题脚本生成
                for (let m = 0; m < Number(arr2.readTime); m++) {
                  let stepLabe2 = arr2.stepLabel.replace('&0&', '#' + (Number(m) + 1) + '#');
                  if (paperData.config && paperData.config.showOrdinal == 'N') {
                    stepLabe2 = stepLabe2.split('|')[0] + '|';
                  }

                  if (
                    m != 0 &&
                    pattern.audioGapHints &&
                    pattern.audioGapHints.subQuestionStemListeningHintTime
                  ) {
                    //听音频之间的音频生成脚本
                    scripts.push({
                      stepPhase: 'TITLE',
                      stepType: 'PLAY_AUDIO', //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                      stepLabel:
                        MatchDictionary(dataType, 'TITLE') || formatMessage(messages.toGuidance),
                      resourceUrl: pattern.audioGapHints.subQuestionStemListeningHint || '',
                      time: pattern.audioGapHints.subQuestionStemListeningHintTime,
                      subMappingIndex: [mainData.subs[n]],
                      tone: 'TYPE_00',
                      showSubFocus: 'Y',
                    });
                  }
                  if (
                    (Number(m) + 1) % 2 == 0 &&
                    arr2.resourceUrl2 != '' &&
                    arr2.resourceUrl2 != null &&
                    arr2.resourceUrl2 != undefined
                  ) {
                    scripts.push({
                      stepPhase: arr2.stepPhase,
                      stepType: arr2.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                      stepLabel: stepLabe2,
                      resourceUrl: arr2.resourceUrl2 || '',
                      time: arr2.time2 || 5,
                      aheadDelivery: arr2.aheadDelivery,
                      subMappingIndex: [mainData.subs[n]],
                      tone: arr2.tone || 'TYPE_00',
                      showSubFocus: 'Y',
                    });
                  } else {
                    if (
                      (arr2.resourceUrl != '' &&
                        arr2.resourceUrl != null &&
                        arr2.resourceUrl != undefined) ||
                      questionId_flag
                    ) {
                      if (
                        questionId_flag &&
                        (arr2.resourceUrl == '' ||
                          arr2.resourceUrl == null ||
                          arr2.resourceUrl == undefined)
                      ) {
                        //制题了 但是未传音频不生成脚本
                      } else {
                        scripts.push({
                          stepPhase: arr2.stepPhase,
                          stepType: arr2.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                          stepLabel: stepLabe2,
                          resourceUrl: arr2.resourceUrl || '',
                          time: arr2.time || 5,
                          aheadDelivery: arr2.aheadDelivery,
                          subMappingIndex: [mainData.subs[n]],
                          tone: arr2.tone || 'TYPE_00',
                          showSubFocus: 'Y',
                        });
                      }
                    }
                  }
                }
              } else {
                if (arr2.time != 0 || questionId_flag) {
                  scripts.push({
                    stepPhase: arr2.stepPhase,
                    stepType: arr2.stepType, //PLAY_AUDIO播放音频/PLAY_VIDEO播放视频/WAITING等待/ANSWER笔试答题/RECORD口语录音答题
                    stepLabel: arr2.stepLabel,
                    resourceUrl: arr2.resourceUrl || '',
                    time: arr2.time || 5,
                    aheadDelivery: arr2.aheadDelivery,
                    subMappingIndex: [mainData.subs[n]],
                    tone: arr2.tone || 'TYPE_00',
                    showSubFocus: 'Y',
                    recordHints: (paperData.config && paperData.config.recordHints) || {
                      start: 'Y',
                      end: 'Y',
                    },
                  });
                }
              }
            }
          }
          if (pattern.interval) {
            // console.log((pattern.interval[questionIndex])[n])
            if (pattern.interval[questionIndex][n]) {
              scripts.push({
                stepPhase: 'INTERVAL',
                stepType: 'WAITING',
                stepLabel:
                  MatchDictionary(dataType, 'INTERVAL') ||
                  formatMessage({ id: 'app.message.free', defaultMessage: '空闲中' }),
                resourceUrl: pattern.interval[questionIndex][n].audioType,
                time: pattern.interval[questionIndex][n].delay,
                subMappingIndex: [mainData.subs[n]],
                showSubFocus: 'Y',
              });
            }
          }
        }
      }
    }
    return scripts;
  }

  /**
   * 调换二层题型流程
   */
  exchange(sortData, type) {
    let newSortData = JSON.parse(JSON.stringify(sortData));
    let startIndex = '';
    let endIndex = '';
    for (let i in sortData) {
      if (sortData[i].subComponents) {
        if (sortData[i].subComponents.name === 'subQuestionStemAudioSection') {
          startIndex = Number(i);
        }

        if (sortData[i].subComponents.name === 'subQuestionAnswerSection') {
          endIndex = Number(i);
        }
      }
    }
    if (type === 'ASK') {
      if (startIndex < endIndex) {
        newSortData[startIndex] = sortData[endIndex];
        newSortData[endIndex] = sortData[startIndex];
      }
    } else if (type === 'ANSWER') {
      if (startIndex > endIndex) {
        newSortData[endIndex] = sortData[startIndex];
        newSortData[startIndex] = sortData[endIndex];
      }
    }

    return newSortData;
  }

  /**
   * 返回提示语信息
   * @Author   tina.zhang
   * @DateTime 2019-01-17T17:37:07+0800
   * @param    {[type]}                 data [description]
   * @param    {[type]}                 type [description]
   * @return   {[type]}                      [description]
   */
  matchHint = (data, type) => {
    for (let i in data) {
      if (data[i].name == type) {
        return data[i];
      }
    }
    return null;
  };

  /**
   * 提示语优化
   * @Author   tina.zhang
   * @DateTime 2019-01-17T14:13:25+0800
   * @param    {[type]}                 hintData [description]
   * @param    {[type]}                 script   [description]
   * @return   {[type]}                          [description]
   */
  getPatternInfoText(value, hintData, subIndex, allowMultiAnswerMode = 'N') {
    let data = null;
    switch (value) {
      case 'stemAudioSection':
        data = this.matchHint((hintData && hintData.mainHints) || [], 'stemListening');
        break;
      case 'stemReadSection':
        data = this.matchHint((hintData && hintData.mainHints) || [], 'readTime');
        break;
      case 'prepareSection':
        data = this.matchHint((hintData && hintData.mainHints) || [], 'prepareTime');
        break;
      case 'answerSection':
        data = this.matchHint((hintData && hintData.mainHints) || [], 'answerTime');
        break;
      case 'subQuestionStemAudioSection':
        if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
          data = this.matchHint(
            (hintData && hintData.subHints[subIndex]) || [],
            'subQuestionStemListening'
          );
        }
        if (data == null) {
          data = this.matchHint((hintData && hintData.mainHints) || [], 'subQuestionStemListening');
        }
        break;
      case 'subQuestionStemReadSection':
        if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
          data = this.matchHint(
            (hintData && hintData.subHints[subIndex]) || [],
            'subQuestionReadTime'
          );
        }
        if (data == null) {
          data = this.matchHint((hintData && hintData.mainHints) || [], 'subQuestionReadTime');
        }
        break;
      case 'subQuestionPrepareSection':
        if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
          data = this.matchHint(
            (hintData && hintData.subHints[subIndex]) || [],
            'subQuestionPrepareTime'
          );
        }
        if (data == null) {
          data = this.matchHint((hintData && hintData.mainHints) || [], 'subQuestionPrepareTime');
        }
        break;
      case 'subQuestionAnswerSection':
        if (allowMultiAnswerMode == 'Y') {
          data = this.matchHint((hintData && hintData.mainHints) || [], 'answerTime');
        } else {
          if (hintData && hintData.subHints && hintData.subHints[subIndex]) {
            data = this.matchHint((hintData && hintData.subHints[subIndex]) || [], 'answerTime');
          }
          if (data == null) {
            data = this.matchHint((hintData && hintData.mainHints) || [], 'answerTime');
          }
        }
        break;
      default:
        break;
    }
    return data;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-28
   * @copyright 脚本类型
   * @return    {[type]}    [description]
   */

  createStepPhase(value, pattern, questions, questionIndex, subIndex = undefined) {
    const { dataType } = this.props;
    let stepPhase = '';
    let tones = [];
    if (pattern.tones) {
      tones = pattern.tones;
    }
    switch (value) {
      case 'guidePrefixAudioSection':
        return {
          stepPhase: 'GUIDE_PREFIX',
          stepType: 'PLAY_AUDIO',
          stepLabel: MatchDictionary(dataType, 'GUIDE_PREFIX') || formatMessage(messages.toTips),
          resourceUrl: questions && questions.data.mainQuestion['guidePrefixAudio'],
          time: questions && questions.data.mainQuestion['guidePrefixAudioTime'],
        };
        break;
      case 'guideMiddleAudioSection':
        return {
          stepPhase: 'GUIDE_MIDDLE',
          stepType: 'PLAY_AUDIO',
          stepLabel: MatchDictionary(dataType, 'GUIDE_MIDDLE') || formatMessage(messages.toTips),
          resourceUrl: questions && questions.data.mainQuestion['guideMiddleAudio'],
          time: questions && questions.data.mainQuestion['guideMiddleAudioTime'],
        };
        break;
      case 'guideSuffixAudioSection':
        return {
          stepPhase: 'GUIDE_SUFFIX',
          stepType: 'PLAY_AUDIO',
          stepLabel: MatchDictionary(dataType, 'GUIDE_SUFFIX') || formatMessage(messages.toTips),
          resourceUrl: questions && questions.data.mainQuestion['guideSuffixAudio'],
          time: questions && questions.data.mainQuestion['guideSuffixTime'],
        };
        break;

      case 'stemReadSection':
        return {
          stepPhase: 'READ_PHASE',
          stepType: 'WAITING',
          stepLabel:
            (MatchDictionary(dataType, 'READ_PHASE') ||
              formatMessage({ id: 'app.text.pleaseread', defaultMessage: '请读题' })) +
            '|' +
            formatMessage(messages.Countdown),
          time:
            (pattern &&
              pattern.subQuestionPatterns &&
              pattern.subQuestionPatterns[questionIndex] &&
              pattern.subQuestionPatterns[questionIndex]['readTime']) ||
            (pattern && pattern.mainPatterns['readTime']),
          tone: MatchTpye(tones, 'readTime') || 'TYPE_00',
        };
        break;

      case 'stemAudioSection':
        if (questions && questions.data.mainQuestion.answerType == 'CLOSED_ORAL') {
          return {
            stepPhase: 'LISTENING_PHASE',
            stepType: 'PLAY_AUDIO',
            stepLabel:
              (MatchDictionary(dataType, 'LISTENING_PHASE') ||
                formatMessage({ id: 'app.text.listensound', defaultMessage: '听原音' })) +
              '|' +
              formatMessage(messages.SpeechTimes),
            resourceUrl: questions && questions.data.mainQuestion['stemAudio'],
            time: questions && questions.data.mainQuestion['stemAudioTime'],
            resourceUrl2: questions && questions.data.mainQuestion['stemAudio2'],
            time2: questions && questions.data.mainQuestion['stemAudioTime2'],
            readTime:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['stemListening']) ||
              (pattern && pattern.mainPatterns['stemListening']),
            tone: MatchTpye(tones, 'stemListening') || 'TYPE_00',
          };
        } else {
          return {
            stepPhase: 'LISTENING_PHASE',
            stepType: 'PLAY_AUDIO',
            stepLabel:
              (MatchDictionary(dataType, 'LISTENING_PHASE') ||
                formatMessage({ id: 'app.text.pleaselisten', defaultMessage: '请听题' })) +
              '|' +
              formatMessage(messages.SpeechTimes),
            resourceUrl: questions && questions.data.mainQuestion['stemAudio'],
            time: questions && questions.data.mainQuestion['stemAudioTime'],
            resourceUrl2: questions && questions.data.mainQuestion['stemAudio2'],
            time2: questions && questions.data.mainQuestion['stemAudioTime2'],
            readTime:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['stemListening']) ||
              (pattern && pattern.mainPatterns['stemListening']),
            tone: MatchTpye(tones, 'stemListening') || 'TYPE_00',
          };
        }
        break;
      case 'stemVideoSection': //视频部分
        return {
          stepPhase: 'VIDEO_PHASE',
          stepType: 'WAITING',
          stepLabel:
            (MatchDictionary(dataType, 'VIDEO_PHASE') ||
              formatMessage({ id: 'app.text.watchvideo', defaultMessage: '看视频' })) +
            '|' +
            formatMessage(messages.Countdown),
          resourceUrl: questions && questions.data.mainQuestion['stemVideo'],
          time: questions && questions.data.mainQuestion['stemVideoTime'],
        };
        break;
      case 'prepareSection':
        return {
          stepPhase: 'PREPARE_PHASE',
          stepType: 'WAITING',
          stepLabel:
            (MatchDictionary(dataType, 'PREPARE_PHASE') ||
              formatMessage({ id: 'app.text.pleasepreare', defaultMessage: '请准备' })) +
            '|' +
            formatMessage(messages.Countdown),
          time:
            (pattern &&
              pattern.subQuestionPatterns &&
              pattern.subQuestionPatterns[questionIndex] &&
              pattern.subQuestionPatterns[questionIndex]['prepareTime']) ||
            (pattern && pattern.mainPatterns['prepareTime']),
          tone: MatchTpye(tones, 'prepareTime') || 'TYPE_00',
        };
        break;
      case 'answerSection':
        if (
          questions &&
          (questions.data.mainQuestion.answerType == 'CHOICE' ||
            questions.data.mainQuestion.answerType == 'GAP_FILLING')
        ) {
          stepPhase =
            questions.data.mainQuestion.answerType == 'CHOICE'
              ? 'ANSWER_PHASE_CHOICE'
              : 'ANSWER_PHASE_GAP_FILLING';
          return {
            stepPhase: stepPhase,
            stepType: 'ANSWER',
            stepLabel:
              (MatchDictionary(dataType, stepPhase) || formatMessage(messages.answerQuestion)) +
              '|' +
              formatMessage(messages.Countdown),
            time:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['answerTime']) ||
              (pattern && pattern.mainPatterns['answerTime']),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        } else if (questions && questions.data.mainQuestion) {
          let mom_answerTime = 0;
          if (
            pattern &&
            pattern.subQuestionPatterns &&
            pattern.subQuestionPatterns[questionIndex] &&
            pattern.subQuestionPatterns[questionIndex]['answerTime']
          ) {
            if (
              pattern.subQuestionPatterns[questionIndex]['answerTime'] > 0 &&
              pattern.subQuestionPatterns[questionIndex]['answerTime'] < 2
            ) {
              mom_answerTime = 2;
            } else {
              mom_answerTime = pattern.subQuestionPatterns[questionIndex]['answerTime'];
            }
          }

          return {
            stepPhase: 'RECORD_PHASE',
            stepType: 'RECORD',
            stepLabel:
              MatchDictionary(dataType, 'RECORD_PHASE') ||
              formatMessage({ id: 'app.button.startrecord', defaultMessage: '开始录音' }) +
                '|' +
                formatMessage(messages.AudioRecording) +
                '|' +
                formatMessage({ id: 'app.text.recordend', defaultMessage: '录音结束' }) +
                '|' +
                formatMessage(messages.Countdown),
            time:
              mom_answerTime ||
              (pattern &&
                (pattern.mainPatterns['answerTime'] < 2 ? 2 : pattern.mainPatterns['answerTime'])),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        } else {
          //未添加题目
          return {
            stepPhase: 'ANSWER_PHASE',
            stepType: 'WAITING',
            stepLabel:
              (MatchDictionary(dataType, 'ANSWER_PHASE') ||
                formatMessage(messages.answerQuestion)) +
              '|' +
              formatMessage(messages.Countdown),
            time:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['answerTime']) ||
              (pattern && pattern.mainPatterns['answerTime']),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        }
        break;
      case 'subQuestionStemReadSection':
        return {
          stepPhase: 'SUB_READ_PHASE',
          stepType: 'WAITING',
          stepLabel:
            (MatchDictionary(dataType, 'SUB_READ_PHASE') ||
              formatMessage({ id: 'app.text.pleaseread', defaultMessage: '请读题' })) +
            '|' +
            formatMessage(messages.Countdown),
          time:
            (pattern &&
              pattern.subQuestionPatterns[questionIndex] &&
              pattern.subQuestionPatterns[questionIndex]['subQuestionReadTime']) ||
            (pattern && pattern.mainPatterns['subQuestionReadTime']),
          tone: MatchTpye(tones, 'subQuestionReadTime') || 'TYPE_00',
        };
        break;
      case 'subQuestionStemAudioSection':
        // console.log(questions)
        // console.log(questions.data.subQuestion[subIndex]['subQuestionStemAudio'])

        // console.log({
        //   stepPhase: 'SUB_LISTENING_PHASE',
        //   stepType: 'PLAY_AUDIO',
        //   stepLabel: '请听题|第{0}遍',
        //   time: (questions && (subIndex != undefined) && questions.data.subQuestion[subIndex]['subQuestionStemAudioTime']) || 5,
        //   resourceUrl: questions && (subIndex != undefined) && questions.data.subQuestion[subIndex]['subQuestionStemAudio'],
        //   readTime: (pattern && pattern.subQuestionPatterns[questionIndex] && pattern.subQuestionPatterns[questionIndex]['subQuestionStemListening']) ||
        //     (pattern && pattern.mainPatterns['subQuestionStemListening']),
        // })
        // console.log("二层题型的答题类")
        // console.log(questions)
        // console.log(pattern)
        // console.log("是否一样?")
        //二层题型的答题类是否一样？
        if (questions && questions.data.mainQuestion.answerType == 'CLOSED_ORAL') {
          return {
            stepPhase: 'SUB_LISTENING_PHASE',
            stepType: 'PLAY_AUDIO',
            stepLabel:
              (MatchDictionary(dataType, 'SUB_LISTENING_PHASE') ||
                formatMessage({ id: 'app.text.listensound', defaultMessage: '听原音' })) +
              '|' +
              formatMessage(messages.SpeechTimes),
            time:
              (questions &&
                subIndex != undefined &&
                questions.data.subQuestion[subIndex]['subQuestionStemAudioTime']) ||
              5,
            resourceUrl:
              questions &&
              subIndex != undefined &&
              questions.data.subQuestion[subIndex]['subQuestionStemAudio'],
            time2:
              (questions &&
                subIndex != undefined &&
                questions.data.subQuestion[subIndex]['subQuestionStemAudioTime2']) ||
              0,
            resourceUrl2:
              questions &&
              subIndex != undefined &&
              questions.data.subQuestion[subIndex]['subQuestionStemAudio2'],

            readTime:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['subQuestionStemListening']) ||
              (pattern && pattern.mainPatterns['subQuestionStemListening']),
            tone: MatchTpye(tones, 'subQuestionStemListening') || 'TYPE_00',
          };
        } else {
          return {
            stepPhase: 'SUB_LISTENING_PHASE',
            stepType: 'PLAY_AUDIO',

            stepLabel:
              (MatchDictionary(dataType, 'SUB_LISTENING_PHASE') ||
                formatMessage({ id: 'app.text.pleaselisten', defaultMessage: '请听题' })) +
              '|' +
              formatMessage(messages.SpeechTimes),
            time:
              (questions &&
                subIndex != undefined &&
                questions.data.subQuestion[subIndex]['subQuestionStemAudioTime']) ||
              5,
            resourceUrl:
              questions &&
              subIndex != undefined &&
              questions.data.subQuestion[subIndex]['subQuestionStemAudio'],
            time2:
              (questions &&
                subIndex != undefined &&
                questions.data.subQuestion[subIndex]['subQuestionStemAudioTime2']) ||
              0,
            resourceUrl2:
              questions &&
              subIndex != undefined &&
              questions.data.subQuestion[subIndex]['subQuestionStemAudio2'],
            readTime:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['subQuestionStemListening']) ||
              (pattern && pattern.mainPatterns['subQuestionStemListening']),
            tone: MatchTpye(tones, 'subQuestionStemListening') || 'TYPE_00',
          };
        }
        break;
      case 'subQuestionPrepareSection':
        return {
          stepPhase: 'SUB_PREPARE_PHASE',
          stepType: 'WAITING',
          stepLabel:
            (MatchDictionary(dataType, 'SUB_PREPARE_PHASE') ||
              formatMessage({ id: 'app.text.pleasepreare', defaultMessage: '请准备' })) +
            '|' +
            formatMessage(messages.Countdown),
          time:
            (pattern &&
              pattern.subQuestionPatterns[questionIndex] &&
              pattern.subQuestionPatterns[questionIndex] &&
              pattern.subQuestionPatterns[questionIndex]['subQuestionPrepareTime']) ||
            (pattern && pattern.mainPatterns['subQuestionPrepareTime']),
          tone: MatchTpye(tones, 'subQuestionPrepareTime') || 'TYPE_00',
        };
        break;
      case 'subQuestionAnswerSection':
        if (
          questions &&
          (questions.data.mainQuestion.answerType == 'CHOICE' ||
            questions.data.mainQuestion.answerType == 'GAP_FILLING')
        ) {
          stepPhase =
            questions.data.mainQuestion.answerType == 'CHOICE'
              ? 'ANSWER_PHASE_CHOICE'
              : 'ANSWER_PHASE_GAP_FILLING';
          return {
            stepPhase: stepPhase,
            stepPhase: 'SUB_ANSWER_PHASE',
            stepType: 'ANSWER',
            stepLabel:
              (MatchDictionary(dataType, stepPhase) || formatMessage(messages.answerQuestion)) +
              '|' +
              formatMessage(messages.Countdown),
            time:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['answerTime']) ||
              (pattern && pattern.mainPatterns['answerTime']),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        } else if (questions && questions.data.mainQuestion) {
          let sub_answerTime = 0;
          if (
            pattern &&
            pattern.subQuestionPatterns[questionIndex] &&
            pattern.subQuestionPatterns[questionIndex]['answerTime']
          ) {
            if (
              pattern.subQuestionPatterns[questionIndex]['answerTime'] > 0 &&
              pattern.subQuestionPatterns[questionIndex]['answerTime'] < 2
            ) {
              sub_answerTime = 2;
            } else {
              sub_answerTime = pattern.subQuestionPatterns[questionIndex]['answerTime'];
            }
          }

          return {
            stepPhase: 'SUB_RECORD_PHASE',
            stepType: 'RECORD',
            stepLabel:
              MatchDictionary(dataType, 'SUB_RECORD_PHASE') ||
              formatMessage({ id: 'app.button.startrecord', defaultMessage: '开始录音' }) +
                '|' +
                formatMessage(messages.AudioRecording) +
                '|' +
                formatMessage({ id: 'app.text.recordend', defaultMessage: '录音结束' }) +
                '|' +
                formatMessage(messages.Countdown),
            time:
              sub_answerTime ||
              (pattern &&
                (pattern.mainPatterns['answerTime'] < 2 ? 2 : pattern.mainPatterns['answerTime'])),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        } else {
          //未添加题目
          return {
            stepPhase: 'SUB_ANSWER_PHASE',
            stepType: 'WAITING',
            stepLabel:
              (MatchDictionary(dataType, 'SUB_ANSWER_PHASE') ||
                formatMessage(messages.answerQuestion)) +
              '|' +
              formatMessage(messages.Countdown),
            time:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['answerTime']) ||
              (pattern && pattern.mainPatterns['answerTime']),
            aheadDelivery:
              (pattern &&
                pattern.subQuestionPatterns[questionIndex] &&
                pattern.subQuestionPatterns[questionIndex]['aheadDelivery']) ||
              (pattern && pattern.mainPatterns['aheadDelivery']),
            tone: MatchTpye(tones, 'answerTime') || 'TYPE_00',
          };
        }
        break;
      default:
        break;
    }
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
    const vb = window.vb
    if (window.ExampaperStatus !== "EXAM") {// 非考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      if(vb && vb.getRecorderManager() && vb.getRecorderManager().recording){
        message.warn(formatMessage({id:"app.text.isTheRecordingPleaseStopTheRecording",defaultMessage:"正在录音中，请先停止录音"}))
        return
      }
    }else{// 考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      // if (recordManager && vb.deviceState && vb.deviceState.value === "recording") {
      //   message.warn(formatMessage({id:"app.text.inTheRecording",defaultMessage:"正在录音中"}))
      //   return
      // }
    }
    let staticIndex = this.state.masterData.recallIndex || this.state.masterData.staticIndex;
    let mains = this.state.masterData.mains;
    let script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        this.state.masterData.dynamicIndex.scriptIndex
      ];

    console.log(this.state.masterData);
    if (script.stepPhase === 'RECALL') {
      //回溯 左侧导航变化
      let newData = JSON.parse(JSON.stringify(this.state.masterData));
      if (newData.recallIndex) {
      } else {
        newData.recallIndex = JSON.parse(JSON.stringify(newData.staticIndex));
      }

      newData.staticIndex.mainIndex = mainIndex;
      newData.staticIndex.questionIndex = questionIndex;
      if (type == 'TWO_LEVEL') {
        newData.staticIndex.subIndex = item;
      } else {
        delete newData.staticIndex.subIndex;
      }
      console.log(newData);
      this.setState({ masterData: newData }, e => {
        this.scrollTop();
      });
    } else {
      emitter.emit('changePlay', true);
      this.state.isExam = true;
      let newData = JSON.parse(JSON.stringify(this.state.masterData));
      delete newData.recallIndex;
      newData.staticIndex.mainIndex = mainIndex;
      newData.staticIndex.questionIndex = questionIndex;

      let scriptIndex = 0;

      let mains = newData.mains;
      let scripts = mains[mainIndex].questions[questionIndex].scripts;
      if (type == 'TWO_LEVEL') {
        newData.staticIndex.subIndex = item;
        if (returnSubIndex(newData) == 0) {
          scriptIndex = 0;
        } else {
          for (let i in scripts) {
            if (scripts[i].subMappingIndex) {
              if (scripts[i].subMappingIndex[0] == item) {
                scriptIndex = Number(scripts[i].index);
                break;
              }
            }
          }
        }
      } else {
        delete newData.staticIndex.subIndex;
      }
      newData.dynamicIndex = {
        scriptIndex: scriptIndex,
        timeStart: 0,
      };
      let staticIndex = newData.staticIndex;
      let script =
        mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
          newData.dynamicIndex.scriptIndex
        ];
      if (script == undefined && mainIndex > 0) {
        this.changeFocusIndex(item, mainIndex + 1, questionIndex, type);
      } else {
        // console.log(newData, newData.dynamicIndex)
        this.setState({ masterData: newData }, e => {
          this.scrollTop();
        });
      }
    }
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
    this.state.isExam = true;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));

    if (type === 'NORMAL') {
      questionIndex = questionIndex - 1;
    }

    if (
      mainIndex != newData.staticIndex.mainIndex ||
      questionIndex != newData.staticIndex.questionIndex ||
      subIndex != newData.staticIndex.subIndex
    ) {
      newData.staticIndex.mainIndex = mainIndex;

      newData.staticIndex.questionIndex = questionIndex;

      if (subIndex != undefined) {
        newData.staticIndex.subIndex = subIndex;
      }
      // newData.dynamicIndex = {
      //   scriptIndex: 0,
      //   timeStart: 0,
      // };
      // console.log(newData.staticIndex)
      this.setState({ masterData: newData });
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 右侧上一步下一步按钮
   * @param     {[type]}    type 上一步，下一步
   * @return    {[type]}         [description]
   */
  changeRightIcon(type) {
    // let vb = window.vb;
    // let recordManager = vb.getRecorderManager();
    // recordManager.onStop(tokenId => {
    //   console.log('================监听onStop===========');

    // });
    this.state.isExam = true;
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));

    if (newData.recallIndex) {
      newData.staticIndex = newData.recallIndex;
      delete newData.recallIndex;
    }
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;
    let paperInstance = paperData.paperInstance;
    let questions = [];
    questions = mains[mainIndex];
    if (type === 'up') {
      // 上滑
      if (questions.type == 'INTRODUCTION') {
        return;
      } else if (
        questions.type === 'NORMAL' ||
        questions.type === 'SPLITTER' ||
        questions.type == 'RECALL'
      ) {
        if (newData.staticIndex.questionIndex != 0) {
          newData.staticIndex.questionIndex = newData.staticIndex.questionIndex - 1;
          if (newData.staticIndex.questionIndex == -1) {
            newData.staticIndex.questionIndex = 0;
            newData.staticIndex.mainIndex = 0;
          }
        } else {
          newData = this.turnUp();
        }
      } else if (questions.type === 'TWO_LEVEL') {
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
              mains[mainIndex].questions[newData.staticIndex.questionIndex - 1].type === 'TWO_LEVEL'
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
              mains[mainIndex].questions[newData.staticIndex.questionIndex - 1].type === 'TWO_LEVEL'
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
      }
    } else {
      // 下滑
      if (questions.type == 'INTRODUCTION') {
        newData.staticIndex.mainIndex = mainIndex + 1;
        if (mains[mainIndex + 1] == undefined) {
          console.log('脚本结束！');
          // message.warn(
          //   formatMessage({ id: 'app.text.lastquestion', defaultMessage: '最后一道题' }) + '！'
          // );
          emitter.emit('endExam', true);
          return;
        } else {
          if (mains[mainIndex + 1].questions[0].type == 'TWO_LEVEL') {
            newData.staticIndex.questionIndex = 0;
            newData.staticIndex.subIndex = 1;
          } else if (mains[mainIndex + 1].questions[0].type == 'NORMAL') {
            newData.staticIndex.questionIndex = 0;
            delete newData.staticIndex.subIndex;
          }
        }
        // isKeyLocked(paperData, newData);
      } else if (
        questions.type == 'NORMAL' ||
        questions.type == 'SPLITTER' ||
        questions.type == 'RECALL'
      ) {
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
          // isKeyLocked(paperData, newData);
        } else {
          newData = this.turnDown();
        }
      }
    }

    if (newData) {
      newData.dynamicIndex.scriptIndex = 0;
      if (window.ExampaperStatus == 'EXAM') {
        let studentIpAddress = localStorage.getItem('studentIpAddress');

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

        let answerNumArr = [];
        for (let i = 0; i < newData.mains.length; i++) {
          if (i != 0) {
            if (Number(i) == Number(newData.staticIndex.mainIndex)) {
              answerNumArr.push('S');
            } else if (Number(i) < Number(newData.staticIndex.mainIndex)) {
              answerNumArr.push('F');
            } else if (Number(i) > Number(newData.staticIndex.mainIndex)) {
              answerNumArr.push('N');
            }
          }
        }

        if (newData.staticIndex.mainIndex > 0) {
          //正在进行的步骤，答卷中当前所进行题目的标号，如：一_4(第一大题，第4小题)
          let body = {
            paperId: paperData.id,
            paperName: paperData.name,
            description: description,
            answerNum: answerNumArr,
            instanceList,
            answerCount: mains.length - 1,
            ipAddr: studentIpAddress, //学生机IP，可选
          };
          console.log(body);
          const { sendMS, storeData } = this.props.instructions;
          sendMS('progress', body);

          //当在做题的过程，发送progress指令后，调用Shell
          storeData({ binessStatus: 'MS_8' });
        }
      }

      this.setState({ masterData: newData }, e => {
        this.scrollTop();
        const {
          masterData: { staticIndex },
        } = this.state;
        // 切题以后的回调
        const { onProgress, answeringNo = {} } = this.props;
        if (typeof onProgress === 'function') {
          const params = {
            subIndex: staticIndex.subIndex,
            mainIndex: staticIndex.mainIndex,
            questionIndex: staticIndex.questionIndex,
            type: typeof staticIndex.subIndex !== 'undefined' ? 'TWO_LEVEL' : '',
          };
          if (JSON.stringify(answeringNo) !== JSON.stringify(params)) {
            onProgress(params);
          }
        }
      });
    } else {
      console.log('脚本结束！');
      this.setState({ isExam: false });
      if (window.ExampaperStatus == 'EXAM') {
        vb.isKeyLocked = 'special';
        this.endExam();
      } else {
        // message.warn(
        //   formatMessage({ id: 'app.text.lastquestion', defaultMessage: '最后一道题' }) + '！'
        // );
        emitter.emit('endExam', true);
      }

      // 如果是客户练习模式
      if (window.ExampaperStatus === 'AFTERCLASS') {
        // 触发 练习完成的回调
        const { onComplete } = this.props;
        if (typeof onComplete === 'function') {
          const { answersData } = this.state;
          // 当前练习完成
          onComplete(answersData);
        }
      }
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 上滑
   * @return    {[type]}    [description]
   */
  turnUp() {
    // console.log("====什么鬼数据===")
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    if (newData.recallIndex) {
      newData.staticIndex = newData.recallIndex;
      delete newData.recallIndex;
    }
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;
    newData.staticIndex.mainIndex = mainIndex - 1;

    let staticIndex = newData.staticIndex;
    let scriptsLength =
      mains[staticIndex.mainIndex].questions[0].scripts &&
      mains[staticIndex.mainIndex].questions[0].scripts.length; //当此题环节动态脚本为空则执行下一步
    if (scriptsLength == 0) {
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
      mains[mainIndex - changeIndex].type == 'SPLITTER' ||
      mains[mainIndex - changeIndex].type == 'RECALL'
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
    // console.log("====挑剔====")
    const { masterData } = this.state;
    const { paperData } = this.props;
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    if (newData.recallIndex) {
      newData.staticIndex = newData.recallIndex;
      delete newData.recallIndex;
    }
    let mainIndex = newData.staticIndex.mainIndex;
    let mains = masterData.mains;

    if (mainIndex + 1 > mains.length - 1) {
      //最后一道题
      console.log('最后一道题');
      return null;
    }
    newData.staticIndex.mainIndex = mainIndex + 1;
    let staticIndex = newData.staticIndex;
    let scriptsLength =
      mains[staticIndex.mainIndex].questions[0] &&
      mains[staticIndex.mainIndex].questions[0].scripts &&
      mains[staticIndex.mainIndex].questions[0].scripts.length; //当此题环节动态脚本为空则执行下一步
    if (scriptsLength == 0) {
      //跳过回溯阶段处理
      this.downHandle(newData, 2);
    } else {
      this.downHandle(newData);
    }
    // isKeyLocked(paperData, newData);
    return newData;
  }

  downHandle(newData, changeIndex = 1) {
    const { masterData } = this.state;
    const { paperData } = this.props;
    let mainIndex = masterData.staticIndex.mainIndex;
    let mains = masterData.mains;
    if (masterData.recallIndex) {
      newData.staticIndex.mainIndex = masterData.recallIndex.mainIndex + changeIndex;
    } else {
      newData.staticIndex.mainIndex = mainIndex + changeIndex;
    }

    if (
      mains[mainIndex + changeIndex].type == 'NORMAL' ||
      mains[mainIndex + changeIndex].type == 'SPLITTER' ||
      mains[mainIndex + changeIndex].type == 'RECALL'
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
  endRecord() {
    var vb = window.vb;
    var recordManager = vb.getRecorderManager();
    if (recordManager && vb.deviceState.value === 'recording') {
      try {
        recordManager.stop();
      } catch (e) {}
    }
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-23
   * @copyright 滚动到指定位置
   * @return    {[type]}    [description]
   */
  scrollTop() {
    setTimeout(function() {
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
  }

  paperHeadChange(data, coverRate) {
    this.props.index.paperHeadChange(data);
    let newData = JSON.parse(JSON.stringify(this.state.masterData));
    newData.coverRate = coverRate;
    this.setState({ masterData: newData });
  }

  stopRecorded(type, isStop = false, recordType = '') {
    console.log('stopRecorded');

    let vb = window.vb;
    let recordManager = vb.getRecorderManager();

    const { masterData, currentStatus } = this.state;
    if (currentStatus === 'end') {
      return;
    }

    let self = this;
    let mains = masterData.mains;
    let script =
      mains[masterData.staticIndex.mainIndex].questions[masterData.staticIndex.questionIndex]
        .scripts[masterData.dynamicIndex.scriptIndex];
    // console.log(script)
    if (
      recordType &&
      script.stepPhase != 'RECORD_PHASE' &&
      script.stepPhase != 'SUB_RECORD_PHASE'
    ) {
      return;
    }
    if (script && (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE')) {
      console.log('================监听onStop1===========');
      if (isStop) {
        self.changeDynamicIndex(type);
      }
    } else {
      this.changeDynamicIndex(type);
    }
  }

  changeDynamicIndex(type = 'down') {
    const { masterData } = this.state;
    let staticIndex = masterData.staticIndex;
    let mains = masterData.mains;
    let newData = JSON.parse(JSON.stringify(masterData));
    if (newData.recallIndex) {
      newData.staticIndex = newData.recallIndex;
      staticIndex = newData.recallIndex;
      delete newData.recallIndex;
    }
    if (type == 'down') {
      if (
        mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
          masterData.dynamicIndex.scriptIndex + 1
        ]
      ) {
        newData.dynamicIndex.scriptIndex = newData.dynamicIndex.scriptIndex + 1;
        if (
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex + 1
          ].stepPhase.indexOf('SUB') > -1
        ) {
          if (
            mains[staticIndex.mainIndex].questions[staticIndex.questionIndex]
              .allowMultiAnswerMode != 'Y'
          ) {
            newData.staticIndex.subIndex =
              mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
                masterData.dynamicIndex.scriptIndex + 1
              ].subMappingIndex[0];
          }
        }
        if (
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex + 1
          ].stepPhase === 'RECALL'
        ) {
          if (newData.recallIndex) {
          } else {
            newData.recallIndex = JSON.parse(JSON.stringify(newData.staticIndex));
          }
          newData.staticIndex.mainIndex = 1;
          newData.staticIndex.questionIndex = 0;
        }

        this.setState({ masterData: newData });
      } else {
        this.changeRightIcon(type);
      }
    } else if (type == 'up') {
      if (masterData.dynamicIndex.scriptIndex != 0) {
        let script =
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex - 1
          ];

        if (script.time == 0 && script.stepPhase == 'QUESTION_INFO') {
          newData.dynamicIndex.scriptIndex = newData.dynamicIndex.scriptIndex - 2;
          script =
            mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
              newData.dynamicIndex.scriptIndex
            ];
          let res = this.upHandleMore(newData, script, type);
          if (res == null) {
            return;
          }
        } else {
          newData.dynamicIndex.scriptIndex = newData.dynamicIndex.scriptIndex - 1;
        }

        if (
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex - 1
          ].stepPhase.indexOf('SUB') > -1
        ) {
          if (
            mains[staticIndex.mainIndex].questions[staticIndex.questionIndex]
              .allowMultiAnswerMode != 'Y'
          ) {
            newData.staticIndex.subIndex =
              mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
                masterData.dynamicIndex.scriptIndex - 1
              ].subMappingIndex[0];
          }
        }

        if (
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex - 1
          ].stepPhase === 'RECALL'
        ) {
          if (newData.recallIndex) {
          } else {
            newData.recallIndex = JSON.parse(JSON.stringify(newData.staticIndex));
          }
          newData.staticIndex.mainIndex = 1;
          newData.staticIndex.questionIndex = 0;
        }

        console.log('newData.dynamicIndex', newData.dynamicIndex);
        this.setState({ masterData: newData });

        // 切题以后的回调
        const { onProgress, answeringNo = {} } = this.props;
        if (typeof onProgress === 'function') {
          const params = {
            subIndex: newData.staticIndex.subIndex,
            mainIndex: newData.staticIndex.mainIndex,
            questionIndex: newData.staticIndex.questionIndex,
            type: typeof newData.staticIndex.subIndex !== 'undefined' ? 'TWO_LEVEL' : '',
          };
          if (JSON.stringify(answeringNo) !== JSON.stringify(params)) {
            onProgress(params);
          }
        }
      } else {
        this.changeRightIcon(type);
      }
    }
  }

  upHandleMore(newData, script, type) {
    let staticIndex = newData.staticIndex;
    let mains = newData.mains;
    script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        newData.dynamicIndex.scriptIndex
      ];
    newData.dynamicIndex.scriptIndex = newData.dynamicIndex.scriptIndex - 1;
    if (script == undefined) {
      this.changeRightIcon(type);
      return null;
    } else if (script.time && script.time == 0) {
      this.upHandleMore(newData);
    } else if (newData.dynamicIndex.scriptIndex < 0) {
      this.changeRightIcon(type);
      return null;
    }
    return newData;
  }

  goToReport() {
    const { paperData, showData } = this.props;
    let time;
    if (this.refs.rightContent.stopPlay()) {
      //如果是在倒计时状不态弹出试做报告
      time = (Date.parse(new Date()) - this.startTime) / 1000; //时间戳用于计时
      localStorage.setItem('useTime', time); //时间戳计时
      emitter.emit('changePlay', false);
      showExamReport({
        dataSource: {
          paperData: paperData,
          showData: showData,
          startTime: this.startTime,
          stopTime: this.stopTime,
        },
        callback: e => {},
      });
    }
  }

  getPaperId() {
    return this.props.paperData.id;
  }

  /**
   * 重新下载试卷
   * @Author   tina.zhang
   * @DateTime 2019-01-03T11:43:42+0800
   * @return   {[type]}                 [description]
   */
  reLoadPaperPackage() {
    this.setState({ currentStatus: 'loading' });
    this.props.index.fileDownLoading();
  }

  /**
   * 右侧content 渲染部分
   * @author tina.zhang
   * @DateTime 2018-12-17T15:08:45+0800
   * @param    {[type]}                 status [description]
   * @return   {[type]}                        [description]
   */
  renderRight(status) {
    const {
      masterData,
      answersData,
      currentStatus,
      completeStatus,
      isConnect,
      isExam,
      changePreTime,
      respondentsObject,
    } = this.state;
    const { paperData, showData, ExampaperStatus, instructions, isOpenSwitchTopic } = this.props;

    if (ExampaperStatus != 'EXAM') {
      status = 'Examination';
    }

    switch (status) {
      //硬件检测
      case 'preExamCheck':
      case 'preExamCheckError':
        return (
          <PreExamCheck
            onCallbackRecordId={ids => {
              this.state.recordIds = ids;
              console.log(this.state.recordIds);
            }}
            instructions={instructions}
            changePreTime={changePreTime}
            callback={e => {
              if (e === 'MS_4') {
                this.setState({ currentStatus: 'loading' });
                this.props.callback();
              } else if (e === 'MS_5') {
                this.setState({ currentStatus: 'preExamCheckError' });
              }

              // let self = this;
              // /*老师发指令 允许考试*/
              // setTimeout(function(){
              //   let now = (new Date()).getTime();
              //   self.setState({ currentStatus: "Examination", startExamTime: now })
              // },3000)
            }}
          />
        );
      //试卷下载中
      case 'loading':
        return <PaperLoading status={currentStatus} index={this} />;
      //试卷下载完成
      case 'loaded':
        return <PaperLoading status={currentStatus} index={this} />;
      //试卷下载失败
      case 'failed':
        return <PaperLoading status={currentStatus} index={this} />;
      //考试中
      case 'Examination':
        return (
          <RightContent
            masterData={masterData}
            index={this}
            paperData={paperData}
            showData={showData}
            answersData={answersData}
            isExam={isExam}
            isOpenSwitchTopic={isOpenSwitchTopic}
            ref="rightContent"
          />
        );
      //答题完成
      case 'end':
        return (
          <PaperComplete
            respondentsObject={respondentsObject}
            status={completeStatus}
            isConnect={isConnect}
            instructions={instructions}
          />
        );
    }
  }

  renderLeft(status) {
    const { masterData, currentStatus, number } = this.state;
    const { paperData, invalidate, ExampaperStatus, isExamine, instructions } = this.props;
    let staticIndex = masterData.recallIndex || masterData.staticIndex;
    let mains = masterData.mains;

    let script =
      (staticIndex &&
        mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
          masterData.dynamicIndex.scriptIndex
        ]) ||
      {};
    if (script.stepPhase === 'RECALL') {
      //回溯 左侧导航变化
      return (
        <RecallLeftMenu
          masterData={masterData}
          ExampaperStatus={ExampaperStatus}
          index={this}
          isExamine={isExamine}
          invalidate={invalidate}
          paperData={paperData}
          isPreview={true} //如果是true 表示为试卷结构预览，则不显示整卷报告按钮
          instructions={instructions}
        />
      );
    } else {
      switch (ExampaperStatus) {
        case 'AFTERCLASS':
        case 'EXAM':
          return (
            <LeftMenuExam
              masterData={masterData}
              index={this}
              ExampaperStatus={ExampaperStatus}
              paperData={paperData}
              status={currentStatus}
              number={number}
              instructions={instructions}
            />
          );
        default:
          return (
            <LeftMenu
              masterData={masterData}
              ExampaperStatus={ExampaperStatus}
              index={this}
              isExamine={isExamine}
              invalidate={invalidate}
              paperData={paperData}
              isPreview={this.props.isPreview} //如果是true 表示为试卷结构预览，则不显示整卷报告按钮
            />
          );
      }
    }
  }

  render() {
    const { masterData, currentStatus } = this.state;

    const { ExampaperStatus } = this.props;
    if (masterData.controlStatus == undefined && ExampaperStatus != 'EXAM') {
      return null;
    } else {
      let ExampaperStyle = {};
      if (ExampaperStatus != 'EXAM' && ExampaperStatus !== 'AFTERCLASS') {
        ExampaperStyle = { marginTop: '80px' };
      }
      return (
        <div className="ExampaperProduct" id="examRoot" style={ExampaperStyle}>
          {/*制作试卷top部分*/}

          {ExampaperStatus !== 'AFTERCLASS' && <PaperTop coverRate={masterData.coverRate} />}

          <div style={{ width: '1024px', height: '659px', position: 'relative' }}>
            <Layout className="leftMenus">
              {this.renderLeft()}
              {/*右侧试卷内容*/}
              {this.renderRight(currentStatus)}
            </Layout>
          </div>
        </div>
      );
    }
  }
}
