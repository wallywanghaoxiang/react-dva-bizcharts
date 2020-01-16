import React, { PureComponent } from 'react';
import { connect } from 'dva';
import instructions from '@/frontlib/utils/instructions';
import Exam, { UserPageComponent as ExampaperProduct } from '@/frontlib';

const { ExampaperAttempt } = Exam;

@connect(({ examBlock }) => {
  const { taskType, snapshotId, paperList, student, taskId } = examBlock;
  const { paperData, showData, paperId, answers = [], answeringNo = {} } =
    paperList.find(item => item.snapshotId === snapshotId) || {};
  const { studentName, studentClassCode, studentId } = student || {};
  return {
    taskType, // 考试模式还是练习模式
    paperData,
    showData,
    paperList,
    snapshotId,
    paperId,
    answers, // 当前答案集合
    answeringNo, // 当前选中的题号或进度
    studentName,
    studentClassCode,
    studentId,
    taskId,
  };
})
class InTask extends PureComponent {
  constructor(props) {
    super(props);
    const { studentName, studentId, studentClassCode, taskId } = props;
    localStorage.setItem(
      'studentInfo',
      JSON.stringify({
        name: studentName,
        studentNo: studentClassCode,
        stuid: studentId,
        taskId,
      })
    );
    this.state = {
      PHASE_LABEL: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'examBlock/startTiming',
    });
    dispatch({
      type: 'dict/getDictionariesData',
      payload: { type: 'PHASE_LABEL' },
    }).then(e => {
      // console.log("PHASE_LABEL",e)
      this.setState({ PHASE_LABEL: e });
    });

    window.addEventListener('beforeunload', this.unload, false);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // 停用计时器
    dispatch({
      type: 'examBlock/endTiming',
    });
    window.removeEventListener('beforeunload', this.unload);
  }

  /**
   * 退出的时候保持下，当前的时间搓
   */
  unload = () => {
    const { answeringNo } = this.props;
    // 记录当前的时间错
    this.onProgress(answeringNo);
  };

  /**
   *  切题以后的消息回调
   */
  onProgress = async (data = {}) => {
    const { onProgress, dispatch, paperId } = this.props;
    const { timing } = await dispatch({ type: 'examBlock/getCurrentPaperObj' });
    // 添加当前的考试时长
    const answeringNo = {
      ...data,
      duration: timing,
    };
    console.log('==切题==', answeringNo);
    if (typeof onProgress === 'function') {
      onProgress(answeringNo);
    }
    dispatch({
      type: 'examBlock/updatePaperState',
      payload: {
        paperId,
        answeringNo,
      },
    });
  };

  /**
   * 每个小题结束后，会调用评分后的值的回调
   */
  onAnswerChange = (changeList, allList) => {
    const { onAnswerChange, dispatch, paperId } = this.props;
    console.log('==小题结束==', changeList, allList);
    if (typeof onAnswerChange === 'function') {
      onAnswerChange(changeList, allList);
    }
    dispatch({
      type: 'examBlock/updatePaperState',
      payload: {
        paperId,
        answer: allList,
      },
    });
  };

  /**
   * 考试状态的变动
   */
  onStateChange = data => {
    const { onStateChange } = this.props;
    if (typeof onStateChange === 'function') {
      onStateChange(data);
    }
  };

  /**
   * 任务结束的回调
   * answerData : 答题的结果
   */
  onComplete = answersData => {
    const { onComplete, paperId, dispatch } = this.props;
    // 结束倒计时
    dispatch({
      type: 'examBlock/endTiming',
    });
    // 记录当前的进度
    this.onProgress();
    console.log('==任务结束==', answersData);
    if (typeof onComplete === 'function') {
      onComplete({
        paperId,
        answersData,
      });
    }
    dispatch({
      type: 'examBlock/completeTask',
      payload: {
        paperId,
        answersData,
      },
    });
  };

  // 是否有进度控制器
  isOpenSwitchTopic = () => {
    // 1、开发环境，默认就是打开的
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    // 2、判断当前的网址是否是sit环境的网址,并且 window.name==="development" 才能显示
    if (window.location.hostname === 'campusweb-sit.aidoin.com' && window.name === 'development') {
      return true;
    }
    return false;
  };

  render() {
    const { taskType, paperData, showData, paperList, dispatch, answers, answeringNo } = this.props;
    const { PHASE_LABEL } = this.state;
    if (!taskType) {
      return null;
    }

    if (taskType === 'practice') {
      return (
        <ExampaperProduct
          paperData={paperData}
          showData={showData}
          answers={answers} // 当前答案集合
          answeringNo={answeringNo} // 当前选中的题号或进度
          isLoad
          ExampaperStatus="AFTERCLASS"
          instructions={instructions}
          paperList={paperList}
          index={this}
          onAnswerChange={this.onAnswerChange} // 每一次完成答题的回调
          onComplete={this.onComplete} // 任务完成的回调
          onProgress={this.onProgress} // 当前进度
          callback={e => {
            dispatch({
              type: 'student/setPaperList',
              payload: e,
            });
          }}
        />
      );
    }

    if (taskType === 'exam') {
      return (
        <ExampaperAttempt
          paperData={paperData}
          showData={showData}
          instructions={instructions}
          isOpenSwitchTopic={this.isOpenSwitchTopic()}
          ExampaperStatus="AFTERCLASS"
          answers={answers} // 当前答案集合
          answeringNo={answeringNo} // 当前选中的题号或进度
          onAnswerChange={this.onAnswerChange} // 每一次完成答题的回调
          onComplete={this.onComplete} // 任务完成的回调
          onProgress={this.onProgress} // 当前进度
          dataType={PHASE_LABEL}
          index={this}
        />
      );
    }

    return null;
  }
}

export default InTask;
