import React, { Component } from 'react';
import { Divider, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import IconButton from '@/frontlib/components/IconButton';
import styles from './index.less';
import { showTime } from '@/utils/timeHandle';

const { confirm } = Modal;

class TaskItem extends Component {
  constructor(props) {
    super(props);
    const { item } = this.props;
    this.diffDayResult = {
      // 报名截止
      enrollEnd: this.diffDays(item.enrollEndTime),
      // 编排截止
      arrangeEnd: this.diffDays(item.arrangeEndTime),
      // 监考安排截止
      invigilateEnd: this.diffDays(item.invigilateEndTime),
    };
  }

  componentDidMount() {}

  // 计算倒计时
  diffDays = theTime => {
    // 计算剩余天数
    const nowUnix = new Date().getTime();
    const diff = theTime - nowUnix; // 毫秒
    if (diff < 0) {
      return diff;
    }
    const days = Math.ceil(diff / (3600 * 1000) / 24);
    return days;
  };

  // 报名
  getCustomPaperData = () => {
    const { getCustomPaperData } = this.props;
    getCustomPaperData();
  };

  // 删除组卷
  delCustomPaperById = () => {
    const tip = formatMessage({
      id: 'app.text.deleteTheExaminationPaperWillCauseYouCantUseTheCopyPaperIfConfirmDelete',
      defaultMessage: '删除试卷将导致您后续无法使用该份试卷，是否确认删除？',
    });
    const self = this;
    confirm({
      content: tip,
      okText: formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' }),
      cancelText: formatMessage({ id: 'app.cancel', defaultMessage: '取消' }),
      centered: true,
      onOk() {
        const { onDeleteTask } = self.props;
        onDeleteTask();
      },
      onCancel() {},
    });
  };

  render() {
    const { item } = this.props;

    return (
      <div className={styles.taskItem}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.leftTop}>
              <span>
                {/* 任务名称 */}
                <span className={styles.taskTit}>{item.paperName}</span>
              </span>
            </div>
            <div className={styles.bottom}>
              <>
                <span className={styles.tit}>
                  {formatMessage({
                    id: 'app.examination.inspect.task.detail.full.mark',
                    defaultMessage: '总分',
                  })}
                  ：
                </span>
                <span>
                  {Number(Number(item.fullMark)) +
                    formatMessage({ id: 'app.text.minute', defaultMessage: '分' }) || 0}
                </span>
                <Divider type="vertical" />
                <span className={styles.tit}>
                  {formatMessage({
                    id: 'app.examination.inspect.task.detail.time',
                    defaultMessage: '时长',
                  })}
                  ：
                </span>
                <span>{showTime(Number(item.paperTime), 's') || '--'}</span>
                <Divider type="vertical" />
                <span className={styles.tit}>
                  {formatMessage({ id: 'app.text.theTopicQuantity', defaultMessage: '题量' })}：
                </span>
                <span>{item.questionCount || 0}</span>
                <Divider type="vertical" />
                <span className={styles.tit}>
                  {formatMessage({ id: 'app.grade', defaultMessage: '适用范围' })}：
                </span>
                <span>{item.gradeValue || item.paperScopeValue || '--'}</span>
              </>
            </div>
          </div>
          <div className={styles.btnGroup}>
            <IconButton
              text={formatMessage({ id: 'app.menu.papermanage.view', defaultMessage: '预览' })}
              className={styles.btnNormal}
              onClick={() => this.getCustomPaperData()}
            />

            <IconButton
              text={formatMessage({ id: 'app.delete', defaultMessage: '删除' })}
              className={styles.btnRed}
              onClick={() => this.delCustomPaperById(item.paperName)}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default TaskItem;
