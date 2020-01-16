import React from 'react';
import { withRouter } from 'react-router-dom';
import { Divider, Button, Tooltip } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import classNames from 'classnames';
import constant from '../../constant';
import styles from './index.less';

// const keys
const { SYS_TYPE } = constant;

/**
 * 考后报告-任务信息
 * @author tina.zhang
 * @date   2019-05-06
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 * @param  {object} taskInfo - 任务信息
 * @param  {object} uexamTaskInfo - 统考任务信息
 * @param  {function} onPublish - 发布成绩回调
 * @param  {boolean} publishLoading - 发布成绩loading
 * @param {function} onDisplaySetClick - 设置按钮回调（设置本次统考数据是否可见）
 */
function TaskInfo(props) {
  const { type, taskInfo, uexamTaskInfo, onPublish, publishLoading, onRefresh, onDisplaySetClick } = props;

  let publishBtnDisabled = uexamTaskInfo && uexamTaskInfo.markStatus ? !(uexamTaskInfo.markStatus && uexamTaskInfo.markStatus === 'ES_3') : false;
  // 人工阅卷已结束 报告生成中
  if (uexamTaskInfo && uexamTaskInfo.summaryStatus === 'Y' && uexamTaskInfo.markStatus === 'ES_3') {
    publishBtnDisabled = true;
  }

  // 人工阅卷已结束 报告已生成
  if (uexamTaskInfo && uexamTaskInfo.summaryStatus === 'N' && uexamTaskInfo.markStatus === 'ES_3') {
    publishBtnDisabled = false;
  }

  const tip = formatMessage({ id: 'app.text.uexam.marking.button.hover.tip1', defaultMessage: '人工阅卷未完成，暂不可公布成绩', });

  // 报告生成中，暂不可公布成绩
  const tip2 = formatMessage({ id: 'app.text.uexam.marking.button.hover.tip2', defaultMessage: '报告生成中，暂不可公布成绩', });

  const tip3 = uexamTaskInfo && uexamTaskInfo.summaryStatus === 'Y' ? tip2 : '';
  const tipTxt = uexamTaskInfo && (uexamTaskInfo.markStatus === 'ES_1' || uexamTaskInfo.markStatus === 'ES_2') ? tip : tip3;

  // 人工阅卷
  const handleManualCorrection = () => {
    router.push(`/examination/inspect/markingtask/${taskInfo.taskId}`);
  };

  // 发布成绩
  const handlePublishGrade = () => {
    onPublish();
  };

  // 刷新
  const handleRefresh = () => {
    onRefresh();
  };

  // 设置
  const handleDisplaySet = () => {
    onDisplaySetClick();
  }

  return (
    <div className={styles.taskInfo}>
      <div className={styles.left}>
        <div className={styles.title}>
          <span className={styles.taskName}>{taskInfo.taskName}</span>
        </div>

        {type !== SYS_TYPE.CLASS &&
          <div className={styles.content}>
            {type === SYS_TYPE.UEXAM && (
              <>
                <span>
                  {formatMessage({ id: 'app.text.uexam.report.taskinfo.schoolnum', defaultMessage: '参与考试学校', })}：{taskInfo.campusNum}
                </span>
                <Divider type="vertical" />
              </>
            )}
            {(type === SYS_TYPE.UEXAM || type === SYS_TYPE.CAMPUS) && (
              <>
                <span>
                  {formatMessage({ id: 'app.text.uexam.report.taskinfo.batchnum', defaultMessage: '完成场次', })}：{taskInfo.subTaskNum}
                </span>
                <Divider type="vertical" />
                <span>
                  {formatMessage({ id: 'app.text.uexam.report.taskinfo.stunum', defaultMessage: '考生报名数', })}：{taskInfo.studentNum}人
                </span>
              </>
            )}
          </div>
        }
      </div>

      {uexamTaskInfo && uexamTaskInfo.status === 'TS_8' && (
        <div className={styles.right}>
          {uexamTaskInfo.summaryStatus === 'N' && uexamTaskInfo.markStatus === 'ES_3' && (
            <span className={styles.tip}>
              <i className="iconfont icon-warning" />
              <span>
                <FormattedMessage
                  values={{
                    element: (
                      <a onClick={handleRefresh}>
                        {formatMessage({ id: 'app.button.uexam.refresh', defaultMessage: '刷新' })}
                      </a>
                    ),
                  }}
                  {...{ id: 'app.text.uexam.report.generate.tip', defaultMessage: '新的报告已生成，请{element}', }}
                />
              </span>
            </span>
          )}

          {uexamTaskInfo.summaryStatus === 'Y' && uexamTaskInfo.markStatus === 'ES_3' && (
            <span>
              <span className={styles.tip}>
                <i className="iconfont icon-warning" />
                <span>
                  {formatMessage({ id: 'app.text.uexam.report.generating.tip', defaultMessage: '阅卷结果正在生成中，请耐心等待', })}
                </span>
              </span>

              <a onClick={handleRefresh} style={{ padding: '0 5px', color: '#228EFF', fontSize: '12px', textDecoration: 'underline ' }}>
                {formatMessage({ id: 'app.button.uexam.refresh', defaultMessage: '刷新' })}
              </a>
            </span>
          )}

          {uexamTaskInfo.markType === 'UMT_2' && (
            <Button className={styles.markingBtn} onClick={handleManualCorrection}>
              {formatMessage({ id: 'app.button.uexam.person.marking', defaultMessage: '人工阅卷' })}
            </Button>
          )}

          <Tooltip title={publishBtnDisabled ? tipTxt : ''} placement="top">
            <span
              style={publishBtnDisabled ? { display: 'inline-block', cursor: 'not-allowed' } : {}}
            >
              <Button
                type="primary"
                loading={publishLoading}
                disabled={publishBtnDisabled}
                className={styles.publishBtn}
                onClick={handlePublishGrade}
                style={publishBtnDisabled ? { pointerEvents: 'none' } : {}}
              >
                {formatMessage({ id: 'app.button.uexam.publish.results', defaultMessage: '公布成绩', })}
              </Button>
            </span>
          </Tooltip>
        </div>
      )}

      {uexamTaskInfo && uexamTaskInfo.status === 'TS_9' && (
        <div className={styles.right}>
          <span className={classNames(styles.tip, styles.settip)} style={{ color: "#333333" }}>
            {formatMessage({ id: "app.text.uexam.report.taskInfo.display.tip", defaultMessage: "本次统考统计数据" })}：
          </span>
          <span className={classNames(styles.tip, styles.settip)}>
            {taskInfo.displayUExamInfo === 'Y'
              ? formatMessage({ id: 'app.text.uexam.report.setdisplay.show', defaultMessage: '公布' })
              : formatMessage({ id: 'app.text.uexam.report.setdisplay.hide', defaultMessage: '不公布' })
            }
          </span>
          <Button type="primary" className={styles.publishBtn} onClick={handleDisplaySet}>
            {formatMessage({ id: "app.button.uexam.report.taskInfo.setdisplay", defaultMessage: "设置" })}
          </Button>
        </div>
      )}
    </div>
  );
}

export default withRouter(TaskInfo);
