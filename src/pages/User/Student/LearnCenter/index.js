import React, { Component } from 'react';
import { connect } from 'dva';
import { Radio, Button, Affix } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import TaskItem from './components/TaskItem/index';
import { formatDateTime, getWeek, isToday } from '@/utils/utils';
import noDataPic from '@/assets/student/nodata_student.png';
import NoData from '@/components/NoData/index';
import styles from './index.less';

const messages = defineMessages({
  screen: { id: 'app.examination.inspect.screen', defaultMessage: '筛选' },
  status: { id: 'app.examination.inspect.screen.status', defaultMessage: '按状态' },
  time: { id: 'app.examination.inspect.screen.time', defaultMessage: '按时间' },
  unlimited: { id: 'app.examination.inspect.screen.unlimited', defaultMessage: '不限' },
  today: { id: 'app.exam.inspect.today', defaultMessage: '今天' },
  More: { id: 'app.teacher.papermanage.more', defaultMessage: '加载更多...' },
  end: { id: 'app.teacher.papermanage.end', defaultMessage: '我是有底线的 (⊙ˍ⊙)' },
  learningCenterChinese: {
    id: 'app.student.learn.center.title.chinese',
    defaultMessage: '学情中心',
  },
  learningCenterEng: {
    id: 'app.student.learn.center.title.eng',
    defaultMessage: 'LEARNING CENTER',
  },
  noDataTip: { id: 'app.student.learn.center.no.data.tip', defaultMessage: '教师还没有布置哦～' },
});

// const records = [{taskId:"47633178029981911",name:"六年级(一)班",type:"TT_1",typeValue:"本班考试",status:"TS_2",statusValue:"进行中",linkStatus:"ES_5",linkStatusValue:"",examTime:1559097854506,distributeType:"DT_1",distributeValue:"按IP地址",examStatus:"ET_1",examStatusValue:"题序打乱",rectifyType:"NOTHING",rectifyValue:"无",examNum:0,studentNum:3,classList:[{classId:"46440768407077010",className:"六年级(一)班"}],paperList:[{paperId:"47551401852670064",name:"sp15标准北京b卷",fullMark:40.0,paperTime:1549,grade:"",gradeValue:"",templateName:"sp15北京卷",paperTemplateId:"47465928782250041",isExamination:null,scopeName:"高考"}],teacher:{teacherId:"46794612508983361",teacherName:"甘昌瑞（1）甘昌瑞（1）甘昌瑞（1）甘昌"},teacherName:null}]

@connect(({ dict, student, loading }) => {
  // 筛选条件
  const {
    status, // 任务状态
    time, // 时间
    records,
    pageIndex,
    total,
  } = student.taskData;

  const listLoading = loading.effects['student/taskList'];
  // 数据字典

  const { taskDate, stuTaskStatus } = dict;

  const propTaskStatus = stuTaskStatus;

  const propTaskDate = [
    {
      code: 0,
      value: formatMessage(messages.unlimited),
    },
    ...taskDate,
  ];

  const listParams = [
    { title: formatMessage(messages.status), list: propTaskStatus, key: 'status' },
    { title: formatMessage(messages.time), list: propTaskDate, key: 'time' },
  ];
  return {
    status,
    time,
    records,
    pageIndex,
    total,
    listParams,
    listLoading,
  };
})
class LearningCenter extends Component {
  state = {
    currentIndex: 1,
    size: 10,
  };

  componentWillMount() {
    const { currentIndex, size } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'dict/taskDate',
      payload: {},
    });
    dispatch({
      type: 'dict/stuTaskStatus',
      payload: {},
    });

    const campusId = localStorage.getItem('campusId');
    if (campusId) {
      dispatch({
        type: 'student/taskList',
        payload: {
          pageIndex: currentIndex,
          pageSize: size,
        },
      });
    }
  }

  // 处理判断条件
  handleChange = e => {
    const { 'data-select-key': selectKey, value } = e.target;
    const { dispatch } = this.props;
    const { size } = this.state;
    // 条件改变复位当前index
    this.setState({
      currentIndex: 1,
    });
    // 更新列表
    dispatch({
      type: 'student/taskList',
      payload: {
        [selectKey]: value,
        pageIndex: 1,
        pageSize: size,
      },
    });
  };

  // 回到顶部
  backTop = () => {
    document.getElementById('stuLearnCenterList').scrollTop = 0;
  };

  // 加载更多
  loadMoreList = () => {
    const { dispatch } = this.props;
    let { currentIndex } = this.state;
    const { size } = this.state;
    currentIndex += 1;
    this.setState({ currentIndex });
    const pageSize = currentIndex * size;
    // 更新列表
    dispatch({
      type: 'student/taskList',
      payload: {
        pageIndex: 1,
        pageSize,
      },
    });
  };

  // 显示加载更多...或者显示已经到底了

  renderLoading = (currentIndex, showTotal, total) => {
    const { size } = this.state;
    if (total > size && currentIndex !== showTotal) {
      return (
        <Button className={styles.loadingMore} onClick={this.loadMoreList}>
          {formatMessage(messages.More)}
        </Button>
      );
    }
    return (
      currentIndex === showTotal && (
        <div className={styles.noDataLoading}>{formatMessage(messages.end)}</div>
      )
    );
  };

  render() {
    const { size, currentIndex } = this.state;
    const { status, time, listParams, records, total, listLoading } = this.props;
    const showTotal = Math.ceil(total / size);
    const params = { status, time };
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
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
    ));

    const studentId = localStorage.getItem('studentId');

    return (
      <div
        className={styles.learningCenterBox}
        id="stuLearnCenterList"
        ref={node => {
          this.container = node;
        }}
      >
        <div className={styles.top}>
          <div className={styles.chinese}>{formatMessage(messages.learningCenterChinese)}</div>
          <div className={styles.english}>{formatMessage(messages.learningCenterEng)}</div>
        </div>
        <div className={styles.content}>
          <Affix offsetTop={30} target={() => this.container}>
            <div className={styles.left}>
              <div className={styles.tit}>{formatMessage(messages.screen)}</div>
              {checkboxGroup}
            </div>
          </Affix>

          {/* 列表 */}
          <div className={styles.right}>
            {listLoading && (
              <NoData
                tip={formatMessage({
                  id: 'app.message.registration.taskinfo.loading.tip',
                  defaultMessage: '信息加载中，请稍等...',
                })}
                onLoad={listLoading}
              />
            )}

            {records.length > 0 && (
              <div>
                <div className={styles.taskList}>
                  <ul>
                    {records.map((item, idx) => {
                      // 日期格式
                      const date = formatDateTime(item.examTime);
                      // 周几
                      const week = getWeek(date);
                      // 是否是今天
                      const today = isToday(item.examTime);

                      // 判断上一条数据的日期
                      const lastItem = idx > 0 ? records[idx - 1] : null;
                      let isSameDay = false;
                      if (lastItem) {
                        const lastDateStr = formatDateTime(lastItem.examTime);
                        const preDate = new Date(date);
                        const lastDate = new Date(lastDateStr);
                        // 判断是否是同一天
                        if (preDate - lastDate === 0) {
                          isSameDay = true;
                        } else {
                          isSameDay = false;
                        }
                      }
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={item.taskId + idx}>
                          {/* TODO 任务时间比较  */}
                          {!isSameDay && (
                            <li className={styles.date}>
                              {today ? formatMessage(messages.today) : date} {week}
                            </li>
                          )}
                          <li className={styles.task}>
                            <TaskItem
                              key={item.taskId + studentId}
                              item={item}
                              onEditTaskName={value => this.editTaskName(value, item)}
                              onDeleteTask={() => this.deleteTask(item)}
                            />
                          </li>
                        </div>
                      );
                    })}
                  </ul>
                </div>

                {this.renderLoading(currentIndex, showTotal, total)}
              </div>
            )}
          </div>
        </div>
        {/* 悬浮按钮 */}
        {records.length > 0 && (
          <div className={styles.fixBtn} onClick={this.backTop}>
            <i className="iconfont icon-v-step-up" />
          </div>
        )}

        {/* 无数据 */}
        {records.length === 0 && !listLoading && (
          <div className={styles.noData}>
            <img src={noDataPic} alt="noData" />
            <div className={styles.noTip}>{formatMessage(messages.noDataTip)}</div>
          </div>
        )}
      </div>
    );
  }
}

export default LearningCenter;
