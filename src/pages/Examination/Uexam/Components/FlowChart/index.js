import React, { Component, Fragment } from 'react';
import { Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
// eslint-disable-next-line import/no-extraneous-dependencies
import router from 'umi/router';
import styles from './index.less';
import ArrowDown from '../ArrowDown';

/**
 *
 * @author tina.zhang
 * @date 2019-08-06
 * @class FlowChart
 * @extends {Component}
 * @param {string} taskId - 任务id
 * @param {number} status - 当前节点状态
 * @param {object} taskInfo - 当前任务信息
 * @param {boolean} showFillInBtn -  是否显示补报名按钮
 *
 */
class FlowChart extends Component {
  constructor(props) {
    super(props);
    const lastChar = props.status ? props.status.substr(props.status.length - 1, 1) : 0;
    const activeIndex = Number(lastChar) + 1;
    const { enrollType, arrangeType } = props.taskInfo; //  'UET' 1 校报名 2：区报名

    this.state = {
      maxIndex: activeIndex,
      flowList: [
        {
          index: 1,
          name: (
            <>
              <FormattedMessage
                values={{ element: <br /> }}
                {...{ id: 'app.button.uexam.exam.plan.title', defaultMessage: '考试{element}计划' }}
              />
            </>
          ),
          path: '', // `/examination/publish/examplan/${props.taskId}`
        },
        {
          index: 2,
          name: formatMessage({
            id: 'app.button.uexam.exam.inpect.sign.up',
            defaultMessage: '报名',
          }),
          path:
            activeIndex === 2
              ? `/examination/uexam/registration/manage/${props.taskId}`
              : `/examination/uexam/registration/result/${props.taskId}`,
        },
        {
          index: 3,
          name: (
            <>
              <FormattedMessage
                values={{ element: <br /> }}
                {...{
                  id: 'app.button.uexam.exam.room.arrange',
                  defaultMessage: '考场{element}编排',
                }}
              />
            </>
          ),
          path:
            arrangeType === 'UAT_1' ? `/examination/uexam/editroom/roommanage/${props.taskId}` : '',
        },
        {
          index: 4,
          name: (
            <>
              <FormattedMessage
                values={{ element: <br /> }}
                {...{
                  id: 'app.button.uexam.exam.inspect.arrange',
                  defaultMessage: '监考{element}安排',
                }}
              />
            </>
          ),
          path:
            activeIndex === 4
              ? `/examination/uexam/invigilation/manage/${props.taskId}`
              : `/examination/uexam/invigilation/result/${props.taskId}`,
        },
        {
          index: 5,
          name: (
            <>
              <FormattedMessage
                values={{ element: <br /> }}
                {...{
                  id: 'app.button.uexam.paper.arrange.title',
                  defaultMessage: '试卷{element}安排',
                }}
              />
            </>
          ),
          path: '', // `/examination/inspect/paperarrange/${props.taskId}`,
        },
        {
          index: 6,
          name: formatMessage({ id: 'app.examination.publish.publish', defaultMessage: '发布' }),
          path: '', // `/examination/inspect/releaseexam/${props.taskId}`,
        },
        {
          index: 7,
          name: formatMessage({ id: 'app.button.uexam.in.the.exam', defaultMessage: '考试中' }),
          path: '',
        },
        {
          index: 8,
          name: formatMessage({ id: 'app.text.exam.publish.marking', defaultMessage: '阅卷' }),
          path: '',
        },
        {
          index: 9,
          name: formatMessage({ id: 'app.text.exam.publish.publish.list', defaultMessage: '发榜' }),
          path: '',
        },
      ],
    };
  }

  componentDidMount() {}

  handleClick = flow => {
    // const { maxIndex } = this.state;
    // if (maxIndex !== flow.index) {
    //     router.push(flow.path);
    // }
    if (flow.path) {
      router.push(flow.path);
    }
  };

  // 补报名
  clickFillIn = () => {};

  render() {
    const { flowList, maxIndex } = this.state;
    const { showFillInBtn } = this.props;
    return (
      <div className={styles.flowChartContainer}>
        {flowList.map((flow, idx) => {
          let buttonStyle = '';
          if (maxIndex === flow.index) {
            buttonStyle = styles.yellow;
          } else if (maxIndex > flow.index) {
            buttonStyle = styles.green;
          }

          if (idx === flowList.length - 1) {
            return (
              <Button
                key={`button${flow.index}`}
                onClick={() => this.handleClick(flow)}
                shape="circle"
                className={buttonStyle}
                disabled={maxIndex < flow.index}
              >
                {flow.name}
              </Button>
            );
          }

          return (
            <Fragment key={`fragment${flow.index}`}>
              <Button
                key={`button${flow.index}`}
                onClick={() => this.handleClick(flow)}
                shape="circle"
                className={buttonStyle}
                disabled={maxIndex < flow.index}
              >
                {flow.name}
              </Button>
              <ArrowDown key={`arrow${flow.index}`} arrowHeight={10} gapTop gapBottom />
            </Fragment>
          );
        })}

        {showFillInBtn && (
          <Button className={styles.fillInBtn} onClick={this.clickFillIn}>
            补报名
          </Button>
        )}
      </div>
    );
  }
}
export default FlowChart;
