
import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from "dva";
import { message,Modal } from 'antd';
import NoData from '@/components/NoData';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import LeftSide from './Components/FilterMenu/index';
import SearchBar from '@/components/SearchBar';
import TaskItem from './Components/TaskItem/index';
import Pagination from '@/components/Pagination/index';
import router from 'umi/router';
import {
  showWaiting,
  hideLoading,
  } from '@/frontlib/utils/utils';
  import loading from '@/frontlib/assets/loading.gif';
import noTaskIcon from '@/assets/none_task_pic.png'
import { formatDateTime,getWeek,isToday } from '@/utils/utils';


const messages = defineMessages({
    inspect:{id:'app.menu.examination.inspect',defaultMessage:'检查'},
    editTaskNameSuccess:{id:'app.examination.inspect.edit.task.name.success',defaultMessage:'编辑任务名称成功！'},
    deleteTaskSuccess:{id:'app.examination.inspect.delete.task.success',defaultMessage:'删除任务成功！'},
    confirmTitle1:{id:'app.examination.inspect.delete.task.title1',defaultMessage:'删除'},
    confirmTitle2:{id:'app.examination.inspect.delete.task.title2',defaultMessage:'，是否确认？'},
    cancel:{id:'app.cancel',defaultMessage:'取消'},
    confirm:{id:'app.confirm',defaultMessage:'确定'},
    noDataTip:{id:'app.exam.inspect.list.no.data.tip',defaultMessage:'暂无搜索结果'},
    searchPlaceholder:{id:'app.exam.inspect.list.search.palceholder',defaultMessage:'输入名称进行搜索'},
    today:{id:'app.exam.inspect.today',defaultMessage:'今天'},
    scoreingTip:{id:'app.exam.inspect.score.loading.tip',defaultMessage:"正在评分，请稍等.."},
  })

@connect(({ dict,inspect,home }) => ({
    dict,
    records:inspect.taskData.records,
    pageIndex:inspect.taskData.pageIndex,
    pageSize:inspect.taskData.pageSize,
    total:inspect.taskData.total,
    filterWord:inspect.taskData.filterWord,
    home
}))
class Inspect extends Component {
    state = {
      };

    componentWillMount() {

        const { dispatch,pageIndex } = this.props;

        dispatch({
         type    : 'dict/taskType',
         payload : {}
        });
        dispatch({
            type    : 'dict/taskStatus',
            payload : {}
        });
        dispatch({
            type    : 'dict/taskDate',
            payload : {}
        });
        dispatch({
            type    : 'dict/classType',
            payload : {}
        });
        this.getTaskList({pageIndex});
    }

    componentWillUnmount() {
      // const { filterWord } = this.props;
      // console.log('===componentWillUnmount==name:',filterWord);
    }

    getTaskList = (params) => {
      const { dispatch } = this.props;
      dispatch({
        type    : 'inspect/taskList',
        payload : params
      });
    }

    /* =========== 搜索功能 ============ */
    handleSearch = (value) => {
      const params = {
        pageIndex : 1,
        filterWord: value
      }
      this.getTaskList(params);
    }

    handleValueChange = (value) => {
      if (!value) {
        const params = {
          filterWord : '',
        }
        this.getTaskList(params);
      }
    }

    // 分页
    onPageChange = (e) => {
      const params = {
        pageIndex : e,
      }
      this.getTaskList(params);
    }

    // 编辑任务名称
    editTaskName = (name,item) => {
      // console.log(name,item);
      const { dispatch } = this.props;
      const params = {
        name,
        taskId:item.taskId
      }
      dispatch({
        type    : 'inspect/editTaskName',
        payload : params,
        callback:() => {
          const mgs = formatMessage(messages.editTaskNameSuccess);
          message.success(mgs);
          this.getTaskList({pageIndex : 1});
        }
      });
    }

    // 删除任务
    deleteTask = (item) => {
      // console.log(item);
      const { dispatch } = this.props;
      const {name} = item;
      Modal.confirm({
        content: (
          <div className="cont">
            <span>{formatMessage(messages.confirmTitle1)}</span>
            <span className="name">{name}</span>
            <span>{formatMessage(messages.confirmTitle2)}</span>
          </div>
        ),
        okText: formatMessage(messages.confirm),
        centered: true,
        cancelText: formatMessage(messages.cancel),
        onOk: () => {
          const params = {
            taskId:item.taskId
          }
          dispatch({
            type    : 'inspect/deleteTask',
            payload : params,
            callback:() => {
              const mgs = formatMessage(messages.deleteTaskSuccess);
              message.success(mgs);
              this.getTaskList({pageIndex : 1});
            }
          });
        },
      });
    }

    scoreResults=(taskId)=>{
      // 点击评分结果
      showWaiting({
        img: loading,
        text: formatMessage(messages.scoreingTip)
      })
      // 调用是否汇总，弹出loading页面 返回结果，无论成功失败，打开报告页面。
      const {dispatch} = this.props;
      dispatch({
        type: 'home/getSummaryData',
        payload: {taskId},
        callback:()=>{
          hideLoading()
          router.push({ pathname: `/examination/inspect/report/${taskId}` });
        }
      })

    }

    render() {

        const { records,total,pageIndex,pageSize,filterWord } = this.props;
        console.log(records);

        return (
          <div className={styles.inspectContainer}>

            <div className={styles.tit}>
              {formatMessage(messages.inspect)}
            </div>

            <PageHeaderWrapper wrapperClassName="wrapperMain">
              <div className={styles.inspectContent}>
                <LeftSide />
                <div className={styles.rightList}>
                  <div className={styles.search}>
                    <SearchBar
                      placeholder={formatMessage(messages.searchPlaceholder)}
                      value={filterWord}
                      onChange={(value)=>this.handleValueChange(value)}
                      onSearch={(value)=>this.handleSearch(value)}
                    />
                  </div>

                  {records.length>0 ?
                    <div className={styles.taskList}>
                      <ul>
                        {records.map((item,idx) => {

                             // 日期格式
                             const date = formatDateTime(item.examTime);
                             // 周几
                             const week = getWeek(date);
                             // 是否是今天
                             const today = isToday(item.examTime);

                             // 判断上一条数据的日期
                            const lastItem = idx>0 ? records[idx-1] : null;
                            let isSameDay = false;
                            if (lastItem) {
                              const lastDateStr = formatDateTime(lastItem.examTime);
                              const preDate = new Date(date);
                              const lastDate = new Date(lastDateStr);
                              // 判断是否是同一天
                              if (preDate-lastDate === 0) {
                                isSameDay = true;
                              } else {
                                isSameDay = false;
                              }

                            }
                            return (
                              <div key={item.taskId}>
                                {/* TODO 任务时间比较  */}
                                {!isSameDay&&<li className={styles.date}>{today?formatMessage(messages.today):date} {week}</li>}
                                <li className={styles.task}>
                                  <TaskItem
                                    item={item}
                                    onEditTaskName={(value)=>this.editTaskName(value,item)}
                                    onDeleteTask={()=>this.deleteTask(item)}
                                    scoreResult={()=>this.scoreResults(item.taskId)}
                                  />
                                </li>
                              </div>
                            )
                        })}

                      </ul>
                    </div> : <NoData tip={formatMessage(messages.noDataTip)} noneIcon={noTaskIcon} />

                  }

                  {/* 分页 */}
                  {records.length>0 &&
                  <div className={styles.pagination}>
                    <Pagination
                      current={pageIndex}
                      pageSize={pageSize}
                      total={total}
                      onChange={this.onPageChange}
                    />
                  </div>}

                </div>
              </div>

            </PageHeaderWrapper>
          </div>
    )
    }
}

export default Inspect
