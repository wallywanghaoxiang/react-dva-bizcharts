/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Pagination from '@/components/Pagination';
import { formatDateTime, getWeek, isToday } from '@/utils/utils';
import NoData from '@/components/NoData';
// import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import noTaskIcon from '@/assets/none_task_pic.png';
import SearchBar from '@/components/SearchBar';
import TaskItem from './TaskItem';
import styles from './index.less';

/**
 * 统考任务列表
 * @author tina.zhang
 * @date   2019-8-12 10:24:554
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, loading, clzss }) => ({
  taskList: uexam.taskList, // 任务列表
  loading: loading.effects['uexam/getTaskList'],
  pagination: uexam.pagination,
  classList: clzss.classList, // 普通教师任课班级
}))
class TaskList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      classIds: null, // 普通教师任课班级
    };
  }

  componentDidMount() {
    //! 任务列表请求方式 update 2019-10-25 14:06:26
    // 学科管理员 (isSubjectAdmin === 'true' || isAdmin === 'true')
    // 不需要参数 teacherId, 但需要 classIds
    // 非学科管理员 (isSubjectAdmin !== 'true' && isAdmin !== 'true')
    // 需要参数 teacherId, 且需要 classIds
    //! 报告入口按钮逻辑，取决于列表返回数据中的 isSubjectAdmin、classIds
    // isSubjectAdmin===true 【学科管理员报告入口按钮】  classIds!=='' 【单班单班报告入口】
    // 【单班单班报告入口】

    // // const isSubjectAdmin = localStorage.isSubjectAdmin;
    // // const isAdmin = localStorage.isAdmin;

    // // update VB-7370
    // // 非学科管理员，仅查看任课班级统考任务
    // // if (isSubjectAdmin === 'true' || isAdmin === 'true') {
    // //   this.loadTaskList();
    // // } else {
    this.loadClassList();
    // // }
  }

  // 加载任课班级
  loadClassList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'clzss/fetchClassList',
      payload: {
        campusId: localStorage.campusId,
        teacherId: localStorage.teacherId,
      },
      callback: classData => {
        const { naturalClassList } = classData;
        if (classData && naturalClassList && naturalClassList.length > 0) {
          const classIds = naturalClassList.map(v => v.naturalClassId).join(',');
          this.setState(
            {
              classIds,
            },
            () => {
              this.loadTaskList();
            }
          );
        } else {
          this.loadTaskList();
        }
      },
    });
  };

  // 加载任务列表
  loadTaskList = params => {
    const { classIds } = this.state;
    const { dispatch } = this.props;
    const payload = {
      campusId: localStorage.campusId,
      classIds,
      ...params,
    };
    const isSubjectAdmin = localStorage.isSubjectAdmin;
    const isAdmin = localStorage.isAdmin;
    if (isSubjectAdmin !== 'true' && isAdmin !== 'true') {
      payload.teacherId = localStorage.teacherId;
    }
    // // if (classIds) {
    // //   payload.classIds = classIds;
    // // }
    dispatch({
      type: 'uexam/getTaskList',
      payload,
    });
  };

  // 搜索
  handleSearch = value => {
    const params = {
      pageIndex: 1,
      filterWord: value,
    };
    this.loadTaskList(params);
  };

  handleValueChange = value => {
    if (!value) {
      const params = {
        filterWord: '',
      };
      this.loadTaskList(params);
    }
  };

  // 分页
  onPageChange = e => {
    const params = {
      pageIndex: e,
    };
    this.loadTaskList(params);
  };

  render() {
    const { taskList, pagination, loading } = this.props;

    // const { records, total } = taskListInfo;
    // const { filterWord } = pagination;

    return (
      <div className={styles.uexamTaskList}>
        <div className={styles.tit}>
          {formatMessage({ id: 'app.title.examination.uexam.tasklist', defaultMessage: '统考' })}
        </div>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div className={styles.inspectContent}>
            <div className={styles.rightList}>
              <div className={styles.search}>
                <SearchBar
                  maxLength={30}
                  placeholder={formatMessage({
                    id: 'app.exam.inspect.list.search.palceholder',
                    defaultMessage: '输入名称进行搜索',
                  })}
                  value={pagination ? pagination.filterWord : ''}
                  onChange={value => this.handleValueChange(value)}
                  onSearch={value => this.handleSearch(value)}
                />
              </div>
              <Divider type="horizontal" />
              {loading && !taskList && (
                <NoData
                  tip={formatMessage({
                    id: 'app.message.registration.taskinfo.loading.tip',
                    defaultMessage: '信息加载中，请稍等...',
                  })}
                  onLoad={loading}
                />
              )}
              {!loading && (!taskList || taskList.length === 0) && (
                <NoData
                  tip={formatMessage({
                    id: 'app.exam.inspect.list.no.data.tip',
                    defaultMessage: '暂无搜索结果',
                  })}
                  noneIcon={noTaskIcon}
                />
              )}
              {taskList && taskList.length > 0 && (
                <>
                  <div className={styles.taskList}>
                    <ul>
                      {taskList.map((item, idx) => {
                        // 日期格式
                        const date = formatDateTime(item.examTime);
                        // 周几
                        const week = getWeek(date);
                        // 是否是今天
                        const today = isToday(item.examTime);

                        // 判断上一条数据的日期
                        const lastItem = idx > 0 ? taskList[idx - 1] : null;
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
                          <div key={item.id}>
                            {/* TODO 任务时间比较  */}
                            {!isSameDay && (
                              <li className={styles.date}>
                                {today
                                  ? formatMessage({
                                      id: 'app.exam.inspect.today',
                                      defaultMessage: '今天',
                                    })
                                  : date}{' '}
                                {week}
                              </li>
                            )}
                            <li className={styles.task}>
                              <TaskItem
                                item={item}
                                onEditTaskName={value => this.editTaskName(value, item)}
                                onDeleteTask={() => this.deleteTask(item)}
                                scoreResult={() => this.scoreResults(item.taskId)}
                              />
                            </li>
                          </div>
                        );
                      })}
                    </ul>
                  </div>
                  {pagination.total > pagination.pageSize && (
                    <div className={styles.pagination}>
                      <Pagination
                        current={pagination.pageIndex}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={this.onPageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}
export default TaskList;
