import React, { useState, useCallback, useRef } from 'react';
import { Modal, Input, Message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel/index';
import TraceBar from './TraceBar';
import styles from './index.less';

const messages = defineMessages({
  panelText: { id: 'app.examination.report.st.scoreratetrace.panelText', defaultMessage: '进阶足迹' },
  inputErrorTip: { id: 'app.examination.report.st.scoreratetrace.inputErrorTip', defaultMessage: '请输入有效的得分率(1-100)' },
  resetScoreRateLabelText: { id: 'app.examination.report.st.scoreratetrace.resetScoreRateLabelText', defaultMessage: '重新设置' },
  resetScoreRateBtnText: { id: 'app.examination.report.st.scoreratetrace.resetScoreRateBtnText', defaultMessage: '我的目标' },
  myTargetScoreRate: { id: 'app.examination.report.st.scoreratetrace.myTargetScoreRate', defaultMessage: '我的得分率' },
  currentTaskScoreRate: { id: 'app.examination.report.st.scoreratetrace.currentTaskScoreRate', defaultMessage: '本次考试得分率' },
  modalTitle: { id: 'app.examination.report.st.scoreratetrace.modalTitle', defaultMessage: '设置目标得分率' },
  modalInputPlaceholder: { id: 'app.examination.report.st.scoreratetrace.modalInputPlaceholder', defaultMessage: '请输入目标1-100得分率' },
});

/**
 * 学生报告-能力分析
 * @author tina.zhang
 * @date   2019-05-16
 * @param {number} targetRate - 我的得分率
 * @param {number} taskId - 任务ID
 * @param {array} historyRates - 数据源
 * @param {function} setScoreRate - 设置目标得分率
 */
function ScoreRateTrace(props) {

  const { targetRate, taskId, historyRates, setScoreRate } = props;

  // 设置得分率初始化
  const rate = parseFloat(targetRate) || 0;
  let tateText = '';
  let showModal = true;
  let okBtnDisable = true;
  const isStudent = localStorage.identityCode === 'ID_STUDENT';
  if (rate > 0) {
    tateText = rate * 1000 / 10;
    showModal = false;
    okBtnDisable = false;
  }

  const [state, setState] = useState(() => ({
    targetRate: tateText,
    tempRate: tateText,
    showModal: isStudent && showModal,
    okBtnDisable
  }))

  // 本次考试
  const currentTask = historyRates.find(v => v.taskId === taskId);
  // 历史记录
  const historyTasks = historyRates.filter(v => v.taskId !== taskId);


  // #region 事件处理
  const stateRef = useRef();
  stateRef.current = state;
  // 弹窗
  const handleSetRateClick = useCallback(() => {
    setState({
      ...stateRef.current,
      showModal: true
    });
  }, []);

  // 设置的得分率
  const inputErrorTip = formatMessage(messages.inputErrorTip);
  const handleNumberChange = useCallback((e) => {
    const iptVal = parseFloat(e.target.value);
    if (!iptVal || iptVal <= 0 || iptVal > 100) {
      setState({
        ...stateRef.current,
        // targetRate: e.target.value,
        tempRate: e.target.value,
        okBtnDisable: true
      });
      Message.info(inputErrorTip);
      return;
    }
    setState({
      ...stateRef.current,
      okBtnDisable: false,
      // targetRate: iptVal
      tempRate: iptVal,
    });
  }, []);

  // 提交
  const handleBtnOk = useCallback(() => {
    const val = parseFloat(stateRef.current.tempRate) || 0;// targetRate
    if (val < 0 || val > 100) {
      Message.info(inputErrorTip);
      return;
    }
    setScoreRate(val, () => {
      setState({
        ...stateRef.current,
        targetRate: val,
        showModal: false
      });
    });
  }, []);

  const handleBtnCancel = useCallback(() => {
    setState({
      ...stateRef.current,
      tempRate: stateRef.current.targetRate,
      showModal: false
    });
  }, []);

  // #endregion

  return (
    <ReportPanel title={formatMessage(messages.panelText)}>
      <div className={styles.scoreRateTrace}>
        {isStudent &&
          <div className={styles.headerBtns}>
            <span>{formatMessage(messages.resetScoreRateLabelText)}&nbsp;&nbsp;</span>
            <a href="javascript:void(0);" onClick={() => handleSetRateClick()}>{formatMessage(messages.resetScoreRateBtnText)}</a>
          </div>
        }
        <div className={styles.scoreRateTraceBox}>
          {/* 我的得分率 */}
          <TraceBar key="tb_my" rate={(parseFloat(state.targetRate) || 0) / 100} taskName={formatMessage(messages.myTargetScoreRate)} />
          {/* 本次考试 */}
          {currentTask && <TraceBar key="tb_task" rate={parseFloat(currentTask.scoreRate) || 0} taskName={formatMessage(messages.currentTaskScoreRate)} isCurrentTask />}
          {/* 历史足迹 */}
          {historyTasks.map((v, i) => {
            return (
              <TraceBar key={`${v.taskId}_${i}`} rate={parseFloat(v.scoreRate) || 0} taskName={v.taskName} />
            )
          })}
        </div>
        {state.showModal &&
          <Modal
            className={styles.modalBtns}
            width="350px"
            visible
            title={formatMessage(messages.modalTitle)}
            okButtonProps={{ disabled: state.okBtnDisable }}
            maskClosable={false}
            closable={false}
            onCancel={handleBtnCancel}
            onOk={handleBtnOk}
          // footer={[
          //   <Button key="button" type="default" onClick={handleBtnCancel}>
          //     取消
          //   </Button>,
          //   <Button key="submit" type="primary" disabled={state.okBtnDisable} onClick={handleBtnOk}>
          //     保存
          //   </Button>,
          // ]}
          >
            <Input
              className={styles.scoreInput}
              placeholder={formatMessage(messages.modalInputPlaceholder)}
              value={state.tempRate}
              onChange={(e) => { handleNumberChange(e) }}
            />
          </Modal>
        }
      </div>
    </ReportPanel>
  )
}

export default ScoreRateTrace
