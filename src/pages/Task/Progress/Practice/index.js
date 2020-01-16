/**
 * 线上平台的-练习模式
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import TaskBlock from '@/frontlib/taskBlock';

@connect(({ task }) => {
  const { taskId, paperList = [], studentId, studentName, studentClassCode } = task;

  return {
    // 任务信息
    taskId, // 任务ID
    // 考生信息
    studentId, // 学生id
    studentName, // 学生名册
    studentClassCode, // 学号
    paperList: [...paperList], // 学生列表
  };
})
class PracticePaper extends Component {
  // 考试组件是懒加载
  onLoad = () => {
    // 初始化考试的基础配置
    const { dispatch, studentId, studentName, paperList, studentClassCode, taskId } = this.props;
    // 任务基础配置
    dispatch({
      type: 'examBlock/updateState',
      payload: {
        taskId,
        process: 'deviceCheck', // 当期主流程
        taskModel: 'brower', // 浏览器模式
        taskType: 'practice', // 考试模式
        paperState: 'single', // 单试卷模式
      },
    });
    // 学生基本配置
    dispatch({
      type: 'examBlock/updateStudentState',
      payload: {
        studentId, // 学生id
        studentName, // 学生名称
        studentClassCode, // 学号
      },
    });
    // 试卷格式化，生成试卷列表
    dispatch({
      type: 'examBlock/formatPaperList',
      payload: JSON.parse(JSON.stringify(paperList)),
    });
  };

  /**
   * 改变主流程状态
   * process ：
   * deviceCheck : 硬件检测状态 download: 准备页面（下载试卷）  inTask: 任务中   endTask : 任务结束
   */
  changeProcess = process => {
    const { dispatch } = this.props;
    dispatch({
      type: 'examBlock/updateState',
      payload: { process },
    });
  };

  // ================================= 设备检测 props ===============================================

  /**
   * 设备检测结果内容变更
   * state :
   *  checking ：检测中
   *  success  : 检测通过
   *  fail     : 检测失败
   */
  onCheckStateChange = state => {
    if (state === 'success') {
      // 检测结束，进入下载试卷页面
      this.changeProcess('download');
    }
  };

  // ================================= 下载组件相关的 props ===============================================

  /**
   * 试卷下载结果变更
   * state :  下载状态
   *  downloading : 下载中  success : 下载成功   fail : 下载失败
   * paperId : 试卷id
   */
  onDownloadChange = status => {
    if (status === 'success') {
      // 下载成功，进入考试页面
      this.changeProcess('inTask');
    }
  };

  // ====================================== 任务进行中的 props =============================================

  /**
   * 答题的进度改变的回调
   */
  onTaskProgress = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/saveAnsweringNo',
      payload: data,
    });
  };

  /**
   * 任务状态的改变（ play : 进行中； pause : 暂停； stop: 停止 ）
   */
  onInTaskChange = () => {};

  /**
   * 题目状态改变的时候的回调
   * answerData : 变动的答案
   * answersData ： 所有的答案集合
   */
  onAnswerChange = (answerData, answersData) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/saveQuestionAnswer',
      payload: {
        answerData,
        answersData,
      },
    });
  };

  /**
   * 完成任务的回调
   */
  onTaskComplete = data => {
    // 检测结束，进入上传试卷页面
    const { paperId } = data;
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updatePaperListState',
      payload: {
        paperId,
        examStatus: 'ES_4',
      },
    });
    this.changeProcess('upload');
  };

  /**
   * 监听任务中状态的变化
   */
  onInTaskChange = state => {
    // 考试中的状态 play : 进行中； pause : 暂停； stop: 停止
    console.log(state);
  };

  // ================================= 上传组件相关的 props ===============================================

  /**
   * 试卷上传结果变更
   * status  :  下载状态
   *    loading : 下载中  success : 下载成功   fail : 下载失败
   */
  onUploadChange = status => {
    const { taskId } = this.props;
    if (status === 'success') {
      // 检测结束，进入下载试卷页面
      router.replace(`/task/${taskId}/result`);
    }
  };

  /**
   * 页面生成
   */
  render() {
    return (
      <TaskBlock
        onLoad={this.onLoad} // 考试组件加载完毕
        // 设备检测props
        deviceCheckProps={{
          taskType: 'exam', // 是否检测采用考试类型的模式
          onChange: this.onCheckStateChange, // 状态改变 checking : 检测中success : 检测通过  fail:检测失败
          checkItems: ['computerAi', 'microphone'], // 只检测  评分引擎 和  麦克风
        }}
        // 试卷下载页面props  下载试卷
        downloadPaperProps={{
          type: 'single', // single : 单张试卷下载， mutiple : 多试卷选择
          onChange: this.onDownloadChange, // 下载状态的回调， downloading : 下载中， success: 下载成功, fail：下载失败
          downloadEffect: 'task/downloadPaper', // 试卷下载的 effects
        }}
        // 考试中页面Props ( paperData，showData ：  )
        inTaskProps={{
          initData: '', // 初始化数据，如果 initData 有值，则组件第一步，将值写入modal。 试卷中的数据都是从modal中获取
          // initData    :  {                // 主要用于单独进行任务的时候使用（ 独立使用 考试组件 ）
          //   paperId,       // 试卷id
          //   paperData,     // 试卷数据
          //   showData,      // 展示数据
          //   answerData     // 当前的答卷数据
          // },
          onProgress: this.onTaskProgress, // 题目答题的进度
          onAnswerChange: this.onAnswerChange, // 每个小题答题完成的时候进行回调
          onStateChange: this.onInTaskChange, // 监听答题状态变更 play : 进行中； pause : 暂停； stop: 停止（ 如考中耳机掉落，进度暂停，手动结束 ）
          onComplete: this.onTaskComplete, // 练习完成
        }}
        // 打包上传答卷包
        uploadPaperProps={{
          onChange: this.onUploadChange, // 状态改变 sate: loading:上传中 success : 上传成功  fail:上传失败
          uploadEffect: 'task/uploadPaper', // 试卷上传的 effects
        }}
        // 结束页面
        endTaskProps={{
          status: 'success', // 任务的状态  success 成功  fail 考试失败
        }}
      />
    );
  }
}

export default PracticePaper;
