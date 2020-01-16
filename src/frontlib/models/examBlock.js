/**
 * 考试模式下的modal
 */
import { EventEmitter } from 'events';
import tool from '@/frontlib/utils/instructions';
import delay from '@/frontlib/utils/delay';
import formateExamReport from '@/frontlib/utils/formatExamReport';

const eventEmitter = new EventEmitter();

const {
  checkEarAndMicphoneStatus, // 检验录音和放音设备状态
  play, // 播放录音
  recordSound, // 开始录音
  stopRecord, // 结束录音
  checkComputeAi, // 测试评分引擎
} = tool;

// 默认的任务state,每次任务结束都将还原默认值
const defaultState = {
  process: '', // 任务注流程 deviceCheck:硬件检测状态，download:下载试卷 ，inTask: 任务中，upload: 上传答案包  endTask : 任务结束
  taskModel: 'brower', // 考试的模式（brower: b/s模式，即线上平台; client: c/s模式,即考中平台 )
  taskType: 'exam', // 任务的模式类型（ exam: 考试模式， practice 练习模式 ）
  deviceCheckState: '', // 下载状态  "" : 未检测， loading ：检测中  success ：检测成功 fail : 检测失败
  paperState: 'single', // 任务的试卷模式（ single : 单试卷模式， multiple : 多试卷模式 ）

  taskId: '', // 任务的id

  envState: {
    // 环境状态
    player: true, // 放音设备是否可用
    recorder: true, // 录音设备是否可用
  },

  student: {
    // 学生信息
    studentId: '', // 学生id
    studentClassCode: '', // 学号
    identifyCode: '', // 考号( client )
    ipAddress: '', // ip地址( client )
    seatNo: '', // 座位号( client )
    studentName: '', // 学生名称
    studentAvatar: '', // 学生头像（备用）
  },

  snapshotId: '', // 当期的答题的试卷快照id
  controlState: '', // 考试的控制状态（ "": 未开始， run : 考试中，pause : 暂停中， stop: 结束  ）
  paperList: [
    // 任务中的试卷列表
    // {
    //   paperId       : "",        // 试卷id
    //   snapshotId    : "",        // 试卷快照
    //   paperMd5      : "",        // 试卷MD5
    //   downloadState : "",        // 下载状态  "" : 未下载， loading ：下载中  success ：下载成功 fail : 下载失败
    //   timing        : "",        // 计时器
    //   lookBackUpon  : false，    // 回溯的对象，false:无回溯， 对象 右侧选择模式，便进行回溯
    //   progress      : "",        // 正在进行答题的题号
    //   packageState  : "",        // 打包状态  "" : 未打包， loading : 打包中  success : 打包成功 fail : 打包失败 （ c/s ）
    //   uploadState   : "",        // 上传状态  "" : 未打包， loading : 上传中  success : 上传成功 fail : 上传失败 （ c/s ）
    //   paperData     : {},        // 试卷数据
    //   showData      : {},        // 考试流程数据
    //   answers       : [],        // 答题的数据
    //   answeringNo   : {},        // 当前的进度
    //   answerData    : ""，       // 答题
    // }
  ],

  // 答题的状态
  processProps: {
    state: 'free', // free: "空闲中", record : "录音中" answer  : "答题中" ready :"准备中" playQuestion :"听题中" readQuestion : "请读题" playSystem  : "系统放音中(听提示/听指导/开始录音/录音结束)" success : "成功的状态
    title: '', // 提示语
    time: 0, // 第几次
    countTotal: 10, // 倒计时的总数
    countDown: 10, // 倒计时："": 无倒计时；
    showControl: false, // 是否显示控制器（ 上一题，下一题，暂停，继续的功能 ）
    level: 0, // 录音级别
    isPlay: true, // 进度条是否在进行中
  },
};

export default {
  namespace: 'examBlock',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {
    /**
     * 格式化试卷列表
     * @param {*} param0
     * @param {*} param1
     */
    *formatPaperList({ payload = [] }, { put }) {
      const list = payload.map(item => ({
        paperId: '', // 试卷id
        snapshotId: '', // 试卷快照
        downloadState: '', // 下载状态  "" : 未下载， loading ：下载中  success ：下载成功 fail : 下载失败
        timing: 0, // 计时器
        paperData: [], // 试卷数据
        showData: [], // 考试流程数据
        answerData: '', // 答题的数据
        lookBackUpon: false, // 回溯的对象
        progress: '', // 正在进行答题的题号
        packageState: '', // 打包状态  "" : 未打包， loading : 打包中  success : 打包成功 fail : 打包失败 （ c/s ）
        uploadState: '', // 上传状态  "" : 未打包， loading : 上传中  success : 上传成功 fail : 上传失败 （ c/s ）
        ...item,
      }));
      yield put({
        type: 'updateState',
        payload: { paperList: list },
      });
    },

    /**
     * 下载试卷的方法
     */
    *downloadPaper({ payload }, { put }) {
      try {
        const {
          paperData,
          showData,
          paperId,
          snapshotId,
          answers,
          answeringNo = {},
        } = yield put.resolve({ type: payload });
        const { duration = 0 } = answeringNo || {};
        // 如果已经有部分答案，则将答案写入当前的试卷数据中
        if (answers && answers.length > 0) {
          // 将 answerData 写入进paperData
          formateExamReport(paperData, answers);
        }
        // 记录当期进行任务的试卷信息
        yield put({
          type: 'updateState',
          payload: {
            snapshotId,
          },
        });

        // 保存试卷信息
        yield put({
          type: 'updatePaperState',
          payload: {
            paperId,
            paperData,
            showData,
            answers,
            answeringNo,
            timing: duration,
          },
        });
        // 下载成功
        return true;
      } catch (e) {
        console.log(e);
        // 下载失败
        return false;
      }
    },

    /**
     * 结束任务
     * @param {Object} answerData 答案数据
     * @param {String} paperId    试卷id
     */
    *completeTask({ payload }, { put }) {
      const { answersData } = payload;
      const { timing, paperId } = yield put.resolve({ type: 'getCurrentPaperObj' });
      console.log(answersData, timing, paperId);
      answersData.duration = timing * 1000;
      yield put({
        type: 'updatePaperState',
        payload: {
          answersData,
          paperId,
        },
      });
    },

    /**
     * 上传答案的方法
     * @param {*} _
     * @param {*} param1
     */
    *uploadPaper({ payload }, { select, put }) {
      const { paperList, snapshotId } = yield select(state => state.examBlock);
      const { answersData } = paperList.find(item => item.snapshotId === snapshotId) || {};
      try {
        yield put.resolve({
          type: payload,
          payload: {
            answersData,
            snapshotId,
          },
        });
        // 上传成功
        return true;
      } catch (e) {
        console.log(e);
        // 上传失败
        return false;
      }
    },

    // ======================================== 设备信息  =====================================================
    // 1、 检测评分引擎
    // 2、 测试耳机
    // 3、 测试麦克风

    /**
     * 测试评分引擎
     * @param {*} _
     * @param {*} param1
     */
    *checkComputerAi(_, { call }) {
      const status = yield call(checkComputeAi);
      return status;
    },

    /**
     * 检测耳机和麦克风
     */
    *checkEarAndMicphoneStatus(_, { call, put }) {
      const data = yield call(checkEarAndMicphoneStatus);
      const { player, recorder } = data;
      yield put({
        type: 'updateEnvStateState',
        payload: {
          player,
          recorder,
        },
      });
      return data;
    },

    // ======================================== 操作信息  =====================================================
    // 1、 playSystem()     播放提示音，或者录音的语音
    // 2、 recordSound（）  开始录音
    // 3、 stopSound（）    停止录音

    /**
     * 播放系统类型语言，或录制的语音
     * @param {*} resourceType  : 系统类型的放音
     * @param {*} tokenId : 播放录音
     * @param {*} title : 显示的提示文本
     */
    *playSystem({ payload }, { call, put }) {
      const { resourceType, tokenId, title } = payload;
      yield put({
        type: 'updateProcessPropState',
        payload: {
          state: 'playSystem',
          title,
        },
      });
      const params = {};
      if (resourceType) {
        params.resourceType = resourceType;
      } else if (tokenId) {
        params.tokenId = tokenId;
      }
      yield call(play, params);
      yield put({
        type: 'updateProcessPropState',
        payload: { state: 'free' },
      });
    },

    /**
     * 开始录音
     * @param {Number} duration  录制时间
     * @param {String} type      test : 测试模式  其它：默认模式
     * @param {Function} onVolumeMeter 实时音量的回调
     * @param {Function} onCountDown  录音过程中倒计时的回调
     */
    *recordSound({ payload }, { call, put, race, take }) {
      const { duration, type, request, onVolumeMeter, onCountDown } = payload;

      const middleObj = {
        state: 'record',
        countTotal: duration || 10,
        countDown: duration,
        level: 0,
        isPlay: true,
      };

      // 开始录音
      yield put({
        type: 'updateProcessPropState',
        payload: middleObj,
      });

      const [, result] = yield race([
        take('loseDevices'), // 设备丢失
        call(recordSound, {
          duration,
          request,
          type,
          onVolumeMeter: data => {
            if (typeof onVolumeMeter === 'function') {
              onVolumeMeter(data);
            }
            const { volume } = data;
            const multipleVolume = volume * 10000;
            if (multipleVolume > 6000) {
              middleObj.level = 5;
            } else if (multipleVolume > 1000) {
              middleObj.level = 4;
            } else if (multipleVolume > 500) {
              middleObj.level = 3;
            } else if (multipleVolume > 100) {
              middleObj.level = 2;
            } else if (multipleVolume > 10) {
              middleObj.level = 1;
            } else {
              middleObj.level = 0;
            }
            eventEmitter.emit('recordSoundVolume', middleObj);
          },
          onCountDown: countDown => {
            if (typeof onCountDown === 'function') {
              onVolumeMeter(countDown);
            }
            middleObj.countDown = countDown;
            eventEmitter.emit('recordSoundCountDown', middleObj);
          },
        }),
      ]);

      // 成功录音
      if (result) {
        // 为了效果，暂停200ms 后进入下一步
        middleObj.isPlay = false;
        yield put({
          type: 'updateProcessPropState',
          payload: middleObj,
        });
        yield call(delay, 200);
        // 录音结束
        yield put({
          type: 'updateProcessPropState',
          payload: { state: 'free' },
        });
        return result.tokenId;
      }

      // 设备丢失导致，录音失败
      middleObj.isPlay = false;
      yield put({
        type: 'updateProcessPropState',
        payload: middleObj,
      });
      yield put({ type: 'stopSound' });
      throw String('no devices');
    },

    /**
     * 停止录音
     */
    *stopSound(_, { call }) {
      yield call(stopRecord);
    },

    /**
     * 设备丢失了，麦克风或耳机丢失了,触发设备丢失的channel
     * 主要用于
     * @param {*} _
     * @param {*} param1
     */
    *loseDevices() {
      yield true;
    },

    /**
     * 获取当前执行的试卷对象
     * @param {*} _
     * @param {*} param1
     */
    *getCurrentPaperObj(_, { select }) {
      const { paperList, snapshotId } = yield select(state => state.examBlock);
      return paperList.find(item => item.snapshotId === snapshotId) || {};
    },

    /**
     * 启用计时器
     * @param {*} _
     * @param {*} param1
     */
    *startTiming(_, { take, call, put, race }) {
      while (true) {
        const beginTime = Date.now();
        const timeResult = yield race({
          stopped: take('endTiming'),
          count: call(delay, 1000),
        });
        if (!timeResult.stopped) {
          const { timing, paperId } = yield put.resolve({ type: 'getCurrentPaperObj' });
          // 更新当前的倒计时
          const endTime = Date.now();
          const time = Math.round((endTime - beginTime) / 1000);
          yield put({
            type: 'updatePaperState',
            payload: {
              paperId,
              timing: timing + time,
            },
          });
        } else {
          break;
        }
      }
    },

    // 结束倒计时
    *endTiming() {
      // 为了结束上面的启用计时器方法
      yield true;
    },
  },

  reducers: {
    /**
     * 更新 state 状态
     * @param {*} state
     * @param {*} param1
     */
    updateState(state, { payload = {} }) {
      return {
        ...state,
        ...payload,
      };
    },

    /**
     * 还原状态
     * @param {*} state
     * @param {*} param1
     */
    resetState() {
      return JSON.parse(JSON.stringify(defaultState));
    },

    /**
     * 设备的可用状态
     * @param {*} state
     * @param {*} param1
     */
    updateEnvStateState(state, { payload = {} }) {
      return {
        ...state,
        envState: {
          ...state.envState,
          ...payload,
        },
      };
    },

    /**
     * 更新学生的信息
     */
    updateStudentState(state, { payload = {} }) {
      return {
        ...state,
        student: {
          ...state.student,
          ...payload,
        },
      };
    },

    /**
     * 更新某张试卷对应的状态
     */
    updatePaperState(state, { payload = {} }) {
      const { paperList } = state;
      // 判断paperId,是否存在
      if (!payload.paperId) {
        return state;
      }

      // 判断列表中是否有此 paperId
      const obj = paperList.find(item => item.paperId === payload.paperId);
      if (!obj) {
        // 额外添加试卷数据到 paperList中
        paperList.push({
          paperId: '', // 试卷id
          snapshotId: '', // 试卷快照
          downloadState: '', // 下载状态  "" : 未下载， loading ：下载中  success ：下载成功 fail : 下载失败
          timing: 0, // 计时器
          paperData: {}, // 试卷数据
          showData: {}, // 考试流程数据
          answerData: {}, // 答题的数据
          lookBackUpon: false, // 回溯的对象
          progress: '', // 正在进行答题的题号
          packageState: '', // 打包状态  "" : 未打包， loading : 打包中  success : 打包成功 fail : 打包失败 （ c/s ）
          uploadState: '', // 上传状态  "" : 未打包， loading : 上传中  success : 上传成功 fail : 上传失败 （ c/s ）
          ...payload,
        });
      } else {
        Object.assign(obj, payload);
      }

      return {
        ...state,
        paperList: [...paperList],
      };
    },

    /**
     * 更新答题流程情况
     * 每次都会还原默认值
     */
    updateProcessPropState(state, { payload = {} }) {
      const defaultProp = {
        state: 'free', // free: "空闲中", record : "录音中" answer  : "答题中" ready :"准备中" playQuestion :"听题中" readQuestion : "请读题" playSystem  : "系统放音中(听提示/听指导/开始录音/录音结束)" success : "成功的状态
        title: '', // 提示语
        time: 0, // 第几次
        countTotal: 10, // 倒计时总数
        countDown: 0, // 倒计时："": 无倒计时；
        showControl: false, // 是否显示控制器（ 上一题，下一题，暂停，继续的功能 ）
        level: 0, // 录音级别
        isPlay: true,
      };
      return {
        ...state,
        processProps: {
          ...defaultProp,
          ...payload,
        },
      };
    },
  },
  subscriptions: {
    bindEvent({ dispatch }) {
      // 录音中，进行倒计时
      eventEmitter.on('recordSoundCountDown', params => {
        dispatch({
          type: 'updateProcessPropState',
          payload: params,
        });
      });

      // 录音中，实时音量显示
      eventEmitter.on('recordSoundVolume', params => {
        dispatch({
          type: 'updateProcessPropState',
          payload: params,
        });
      });
    },
  },
};
