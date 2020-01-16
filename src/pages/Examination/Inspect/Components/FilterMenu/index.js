import React, { Component } from 'react';
import { connect } from 'dva';
import { Radio, Badge } from 'antd';
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

@connect(({ dict, inspect, menu }) => {
  // 筛选条件
  const {
    type, // 任务类型
    status, // 任务状态
    time, // 时间
    classType, // 班级类型
  } = inspect.taskData;

  // 数据字典

  const taskTypeDic = dict.taskType;
  const { taskStatus } = dict;
  const { taskDate } = dict;
  const classTypeDic = dict.classType;
  // 未发布的成绩的任务数量
  const { unPublicNum } = menu;

  const firstValue = formatMessage(messages.unlimited);
  const thisTerm = formatMessage(messages.thisTerm);
  const propTaskType = [
    {
      code: '',
      value: firstValue,
    },
    ...taskTypeDic,
  ];

  const staticTaskStatus = [];
  //  界面只需要五个
  taskStatus.forEach(element => {
    if (element.code === 'TS_1') {
      const code = 'TS_0_1,TS_0,TS_1';
      const combinationStatus = {
        code,
        value: element.value,
      };
      staticTaskStatus.push(combinationStatus);
    }
    if (element.code === 'TS_2') {
      staticTaskStatus.push(element);
    }
    if (element.code === 'TS_3') {
      staticTaskStatus.push(element);
    }
    if (element.code === 'TS_4') {
      staticTaskStatus.push(element);
    }
    if (element.code === 'TS_5') {
      staticTaskStatus.push(element);
    }
  });
  const propTaskStatus = [
    {
      code: '',
      value: firstValue,
    },
    ...staticTaskStatus,
  ];

  const propTaskDate = [
    {
      code: 0,
      value: thisTerm,
    },
    ...taskDate,
  ];
  const propClassType = [
    {
      code: '',
      value: firstValue,
    },
    ...classTypeDic,
  ];

  const listParams = [
    { title: formatMessage(messages.type), list: propTaskType, key: 'type' },
    { title: formatMessage(messages.status), list: propTaskStatus, key: 'status' },
    { title: formatMessage(messages.time), list: propTaskDate, key: 'time' },
    { title: formatMessage(messages.classType), list: propClassType, key: 'classType' },
  ];
  return {
    type,
    status,
    time,
    classType,
    listParams,
    unPublicNum,
  };
})
class LeftSide extends Component {
  componentDidMount() {}

  // 处理判断条件
  handleChange = e => {
    const { 'data-select-key': selectKey, value } = e.target;
    const { dispatch } = this.props;
    // 更新列表
    dispatch({
      type: 'inspect/taskList',
      payload: {
        [selectKey]: value,
        pageIndex: 1,
      },
    });
  };

  render() {
    const { type, status, time, classType, listParams, unPublicNum } = this.props;
    const params = { type, status, time, classType };
    // console.log(listParams);

    // 列表选择项条件集合
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
            const item = { ...tag };
            return (
              <Radio.Button
                size="small"
                className={styles['select-params']}
                key={item.code}
                data-select-key={data.key}
                value={item.code}
              >
                {item.value}
                {item.code === 'TS_4' && (
                  <Badge title="" count={unPublicNum} style={{ backgroundColor: '#FF6E4A' }} />
                )}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
    ));

    return (
      <div className={styles.content}>
        <div className={styles.tit}>{formatMessage(messages.inspect)}</div>
        {checkboxGroup}
      </div>
    );
  }
}
export default LeftSide;
