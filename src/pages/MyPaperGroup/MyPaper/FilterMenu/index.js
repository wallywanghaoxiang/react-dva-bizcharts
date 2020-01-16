import React, { Component } from 'react';
import { connect } from 'dva';
import { Radio } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  inspect: { id: 'app.examination.inspect.screen', defaultMessage: '筛选' },
  type: { id: 'app.examination.inspect.screen.type', defaultMessage: '按类型' },
  status: { id: 'app.examination.inspect.screen.status', defaultMessage: '按状态' },
  time: { id: 'app.examination.inspect.screen.time', defaultMessage: '按时间' },
  classType: { id: 'app.examination.inspect.screen.classType', defaultMessage: '按班级' },
  unlimited: { id: 'app.examination.inspect.screen.unlimited', defaultMessage: '不限' },
  thisTerm: { id: 'app.examination.inspect.screen.this.term', defaultMessage: '本学期' },
});

@connect(({ papergroup }) => {
  // 筛选条件
  const {
    type, // 任务类型
    status, // 任务状态
    time, // 时间
    classType, // 班级类型
  } = papergroup.taskData;
  const { taskfilterData } = papergroup;

  return {
    type,
    status,
    time,
    classType,
    taskfilterData,
  };
})
class LeftSide extends Component {
  componentDidMount() {}

  // 处理判断条件
  handleChange = e => {
    const { 'data-select-key': selectKey, value, data } = e.target;
    const { grade, paperScope, paperScopeValue } = data;
    const { dispatch } = this.props;
    // 更新列表
    dispatch({
      type: 'papergroup/taskList',
      payload: {
        [selectKey]: value,
        paper_scope: paperScopeValue ? paperScope || grade : '',
        grade: paperScopeValue ? '' : grade,
        pageIndex: 1,
      },
    });
  };

  render() {
    const { type, status, time, classType, taskfilterData } = this.props;
    const params = { type, status, time, classType };

    const firstValue = formatMessage(messages.unlimited);
    const propTaskType = [
      {
        paperScope: '',
        grade: '',
        paperScopeValue: firstValue,
      },
      ...taskfilterData,
    ];

    const listParams = [
      {
        title: formatMessage({ id: 'app.grade', defaultMessage: '适用范围' }),
        list: propTaskType,
        key: 'type',
      },
    ];

    // 列表选择项条件集合
    console.log(propTaskType);
    const checkboxGroup = listParams.map(data => (
      <div key={data.key}>
        <h4>{data.title}</h4>
        <Radio.Group
          onChange={this.handleChange}
          className={styles.group}
          name={data.key}
          value={params[data.key]}
        >
          {data.list.map(tag => {
            console.log(tag);
            const item = { ...tag };
            if (!tag) return null;
            return (
              <Radio.Button
                size="small"
                className={styles['select-params']}
                key={item.paperScope || item.grade}
                data-select-key={data.key}
                data={item}
                value={item.paperScope || item.grade}
              >
                {item.paperScopeValue || item.gradeValue}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
    ));

    return <div className={styles.content}>{checkboxGroup}</div>;
  }
}
export default LeftSide;
