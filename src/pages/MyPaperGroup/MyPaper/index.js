/* eslint-disable camelcase */
import React from 'react';
import { connect } from 'dva';
import { Spin, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import Dimensions from 'react-dimensions';
import styles from './index.less';
import LeftSide from './FilterMenu/index';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination/index';
import noTaskIcon from '@/assets/none_task_pic.png';
import noSosoIcon from '@/assets/none_soso_pic.png';

import { formatDateTime, getWeek, isToday } from '@/utils/utils';
import TaskItem from './TaskItem/index';
import showExampaperPreview from '@/frontlib/components/ExampaperPreview/api';

const messages = defineMessages({
  inspect: { id: 'app.menu.examination.inspect', defaultMessage: '检查' },
  editTaskNameSuccess: {
    id: 'app.examination.inspect.edit.task.name.success',
    defaultMessage: '编辑任务名称成功！',
  },
  deleteTaskSuccess: {
    id: 'app.examination.inspect.delete.task.success',
    defaultMessage: '删除任务成功！',
  },
  confirmTitle1: { id: 'app.examination.inspect.delete.task.title1', defaultMessage: '删除' },
  confirmTitle2: {
    id: 'app.examination.inspect.delete.task.title2',
    defaultMessage: '，是否确认？',
  },
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确定' },
  noDataTip: { id: 'app.exam.inspect.list.no.data.tip', defaultMessage: '暂无搜索结果' },
  searchPlaceholder: {
    id: 'app.exam.inspect.list.search.palceholder',
    defaultMessage: '输入名称进行搜索',
  },
  today: { id: 'app.exam.inspect.today', defaultMessage: '今天' },
  scoreingTip: { id: 'app.exam.inspect.score.loading.tip', defaultMessage: '正在评分，请稍等..' },
});

@connect(({ dict, papergroup, loading }) => ({
  filterWord: papergroup.taskData.filterWord,
  paper_scope: papergroup.taskData.paper_scope,
  grade: papergroup.taskData.grade,
  records: papergroup.taskData.records,
  pageIndex: papergroup.taskData.pageIndex,
  pageSize: papergroup.taskData.pageSize,
  total: papergroup.taskData.total,
  taskfilterData: papergroup.taskfilterData,
  customPaperData: papergroup.customPaperData,
  customShowData: papergroup.customShowData,
  dict,
  fetchPapertaskList: loading.effects['papergroup/taskList'] || false,
  fetchCustomPaper: loading.effects['papergroup/fetchCustomPaperDetail'] || false,
}))
class Step extends React.PureComponent {
  state = { isSearch: false, LeftSideKey: '' };

  componentWillMount() {
    const { dispatch } = this.props;
    // localStorage.getItem("teacherId")
    dispatch({
      type: 'papergroup/fetchGradesByTeacherId',
      payload: { teacherId: localStorage.getItem('teacherId') },
    }).then(() => {
      this.setState({ LeftSideKey: new Date().getTime() });
    });
    this.getTaskList({ pageIndex: 1 });
  }

  getTaskList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papergroup/taskList',
      payload: params,
    });
  };

  // 分页
  onPageChange = e => {
    const params = {
      pageIndex: e,
    };
    this.getTaskList(params);
  };

  /* =========== 搜索功能 ============ */
  handleSearch = value => {
    this.setState({ isSearch: true });
    const params = {
      pageIndex: 1,
      keyword: value,
    };
    this.getTaskList(params);
  };

  handleValueChange = value => {
    if (!value) {
      const params = {
        keyword: '',
      };
      this.getTaskList(params);
    }
  };

  deleteTask = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papergroup/delCustomPaperById',
      payload: { id: item.paperId },
    }).then(e => {
      if (e === 'SUCCESS') {
        message.success(
          formatMessage({
            id: 'app.text.theExaminationPaperHasBeenDeleted',
            defaultMessage: '试卷已删除',
          })
        );
        this.getTaskList({ pageIndex: 1 });
      }
    });
  };

  getCustomPaperData = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papergroup/fetchCustomPaperDetail',
      payload: { id: item.paperId },
    }).then(() => {
      const { customShowData, customPaperData } = this.props;
      showExampaperPreview({
        dataSource: {
          paperData: customPaperData,
          showData: customShowData,
          displayMode: 'paper_preview',
        },
      });
    });
  };

  render() {
    const {
      records,
      total,
      pageIndex,
      pageSize,
      filterWord,
      fetchPapertaskList,
      fetchCustomPaper,
      containerHeight,
      goSelectPaper,
      grade,
      paper_scope,
    } = this.props;
    const { isSearch, LeftSideKey } = this.state;
    if (!isSearch && records.length === 0 && grade === '' && paper_scope === '') {
      return (
        <Spin delay={500} spinning={fetchPapertaskList || fetchCustomPaper}>
          <div className={styles.inspectContainers}>
            <div className={styles.noData} style={{ height: containerHeight - 160 }}>
              <img src={noTaskIcon} alt="" />
              <p>
                {formatMessage({ id: 'app.text.noPapersPlease', defaultMessage: '暂无试卷，请' })}
                <span
                  className={styles.blue_text}
                  onClick={() => {
                    goSelectPaper();
                  }}
                >
                  {formatMessage({ id: 'app.text.toSetVolume', defaultMessage: '前往组卷' })}
                </span>
              </p>
            </div>
          </div>
        </Spin>
      );
    }
    return (
      <div className={styles.inspectContainers}>
        <div wrapperClassName="wrapperMain">
          <div className={styles.inspectContent}>
            <LeftSide key={LeftSideKey} />
            <div className={styles.rightLists}>
              <div className={styles.search}>
                <SearchBar
                  placeholder={formatMessage({
                    id: 'app.title.theInputTestNameToSearch',
                    defaultMessage: '输入试卷名称进行搜索',
                  })}
                  maxLength={30}
                  value={filterWord}
                  onChange={value => this.handleValueChange(value)}
                  onSearch={value => this.handleSearch(value)}
                />
              </div>
              <Spin delay={500} spinning={fetchPapertaskList || fetchCustomPaper}>
                {records.length > 0 ? (
                  <div className={styles.taskList}>
                    <ul>
                      {records.map((item, idx) => {
                        // 日期格式
                        const date = formatDateTime(Number(item.createdDateTime));
                        // 周几
                        const week = getWeek(date);
                        // 是否是今天
                        const today = isToday(Number(item.createdDateTime));

                        // 判断上一条数据的日期
                        const lastItem = idx > 0 ? records[idx - 1] : null;
                        let isSameDay = false;
                        if (lastItem) {
                          const lastDateStr = formatDateTime(Number(lastItem.createdDateTime));
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
                          <div key={item.taskId}>
                            {/* TODO 任务时间比较  */}
                            {!isSameDay && (
                              <li className={styles.date}>
                                {today ? formatMessage(messages.today) : date} {week}
                              </li>
                            )}
                            <li className={styles.task}>
                              <TaskItem
                                item={item}
                                onEditTaskName={value => this.editTaskName(value, item)}
                                onDeleteTask={() => this.deleteTask(item)}
                                getCustomPaperData={() => this.getCustomPaperData(item)}
                                scoreResult={() => this.scoreResults(item.taskId)}
                              />
                            </li>
                          </div>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className={styles.noDatas}>
                    <img src={noSosoIcon} alt="" />
                    <p>
                      {formatMessage({
                        id: 'app.text.notSearchToThePaper',
                        defaultMessage: '未搜索到试卷',
                      })}
                    </p>
                  </div>
                )}
              </Spin>
              {/* 分页 */}
              {records.length > 0 && (
                <div className={styles.pagination}>
                  <Pagination
                    current={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onChange={this.onPageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dimensions({
  getHeight() {
    // element
    return window.innerHeight;
  },
  getWidth() {
    // element
    return window.innerWidth;
  },
})(Step);
