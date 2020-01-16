/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Modal, Select, Tabs, List, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { showWaiting, hideLoading } from '@/frontlib/utils/utils';
import loadingif from '@/frontlib/assets/loading.gif';

const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

@connect(({ editroom, loading }) => ({
  campusInfo: editroom.campusInfo,
  BatchRoom: editroom.BatchRoom,
  layoutStudent: editroom.layoutStudent,
  BatchByPlaces: editroom.BatchByPlaces,
  taskId: editroom.taskId,
  examArrange: loading.effects['editroom/examArrangeHands'],
}))
class ManualArrange extends Component {
  constructor(props) {
    super(props);
    const {
      BatchByPlaces,
      BatchRoom: { examPlaceList, examDateList },
    } = props;
    const current =
      examPlaceList[0].isLimited === 'N'
        ? BatchByPlaces
        : BatchByPlaces.filter(vo => vo.leftNum !== 0);
    this.state = {
      visible: props.visible,
      checkedBatch: current.length > 0 ? current[0].examBatchId : '',
      checkedRooms: [],
      defaultPlace: examPlaceList[0].examPlaceId,
      isLimited: examPlaceList[0].isLimited,
      counts: 0,
      examDateTime: examDateList[0].examDate,
    };
  }

  // 保存后端数据
  saveData = () => {
    const { dispatch, taskId, layoutStudent, hideGroups } = this.props;
    const { checkedRooms, counts } = this.state;
    const subTaskIdList = [];
    checkedRooms.forEach(vo => {
      subTaskIdList.push({ subTaskId: vo.id, num: vo.count });
    });
    showWaiting({
      img: loadingif,
      text: '编排学生中…请稍候',
    });
    dispatch({
      type: 'editroom/examArrangeHands',
      payload: {
        studentIdList: layoutStudent,
        subTaskArrangeList: subTaskIdList,
        taskId,
      },
      callback: res => {
        if (res.responseCode === '200') {
          message.success(
            `您已成功编排${counts < layoutStudent.length ? counts : layoutStudent.length}名考生！`
          );
          // 刷新左侧学校列表后，更新之前所点击的学校Id
          dispatch({
            type: 'editroom/getExamCampus',
            payload: { taskId, campusId: localStorage.getItem('campusId') },
          }).then(() => {
            dispatch({
              type: 'editroom/getExamStatistics',
              payload: { taskId, campusId: localStorage.getItem('campusId') },
            });
            dispatch({
              type: 'editroom/getStudentList',
              payload: {
                taskId,
                campusId: localStorage.getItem('campusId'),
                backStatus: true, // 数据刷新后保持原样
              },
            }).then(() => {
              hideLoading();
              hideGroups(true); // 用于搜索页面判断
            });
          });
        } else {
          message.error(res.data);
          hideLoading();
          hideGroups(true); // 用于搜索页面判断
        }
      },
    });
  };

  // 保存
  handleCreate = () => {
    const { layoutStudent } = this.props;
    const { counts, checkedRooms } = this.state;
    const that = this;
    if (checkedRooms.length === 0) {
      message.warning(
        formatMessage({
          id: 'app.text.pleaseSelectANeedChoreographyBatches',
          defaultMessage: '请选择需要编排的批次！',
        })
      );
      return;
    }
    if (counts < layoutStudent.length) {
      confirm({
        title: '',
        className: 'giveUp',
        content: (
          <div className="cont">
            {formatMessage({
              id: 'app.text.manual.manage.count.layoutstudent',
              defaultMessage: '您选中的学生中，还有部分未安排批次/考场，是否放弃安排？',
            })}
          </div>
        ),
        okText: formatMessage({ id: 'app.text.go.on.plan', defaultMessage: '继续安排' }),
        cancelText: formatMessage({ id: 'app.text.give.up', defaultMessage: '放弃' }),
        onOk() {},
        onCancel() {
          // 点击继续安排
          that.saveData();
        },
      });

      return;
    }
    that.saveData();
  };

  // 选择场次
  selectBatch = (item, count) => {
    const { isLimited } = this.state;
    if (count || isLimited === 'N') {
      this.setState({
        checkedBatch: item,
      });
    }
  };

  // 选择考场
  selectRoom = (item, count) => {
    const { layoutStudent } = this.props;
    const { counts, isLimited } = this.state;
    let { checkedRooms } = this.state;
    if (isLimited === 'N') {
      // 此时是非限定人数
      const arr = [];
      arr.push({
        id: item,
        count: layoutStudent.length + count,
      });
      this.setState({
        checkedRooms: arr,
        counts: layoutStudent.length,
      });
      return;
    }
    if (layoutStudent.length - counts < 0 || layoutStudent.length - counts === 0) {
      checkedRooms = checkedRooms.filter(vo => vo.id !== item);
      let num = 0;
      checkedRooms.forEach(item2 => {
        num += item2.count;
      });
      this.setState({
        checkedRooms,
        counts: num,
      });
      return;
    }
    if (count) {
      if (checkedRooms.filter(vo => vo.id === item).length === 0) {
        checkedRooms.push({
          id: item,
          count: count < layoutStudent.length - counts ? count : layoutStudent.length - counts,
        });
      } else {
        checkedRooms = checkedRooms.filter(vo => vo.id !== item);
      }
      let numbers = 0;
      checkedRooms.forEach(item2 => {
        numbers += item2.count;
      });
      this.setState({
        checkedRooms,
        counts: numbers,
      });
    }
  };

  // 日期转换
  dateToYMD = data => {
    const M = new Date(data).getMonth() + 1;
    const D = new Date(data).getDate();
    return (
      <div className={styles.batchDate}>
        <span>{M}月</span>
        {D}
      </div>
    );
  };

  handleChange = value => {
    const that = this;
    const {
      dispatch,
      taskId,
      campusInfo: { campusId },
      BatchRoom: { examPlaceList },
    } = this.props;
    const current = examPlaceList.find(vo => vo.examPlaceId === value);
    const { examDateTime } = this.state;
    this.setState({
      defaultPlace: value,
      isLimited: current.isLimited,
    });
    console.log(value);
    // 手动编排则 根据考点时间查询批次考场
    dispatch({
      type: 'editroom/getBatchByPlaces',
      payload: {
        taskId,
        examPlaceId: value,
        examDate: examDateTime.toString(),
        campusId,
      },
      callback: data => {
        if (data.length > 0) {
          const currents = data.filter(vo => vo.leftNum !== 0);
          that.setState({
            checkedBatch: currents.length > 0 ? currents[0].examBatchId : '',
          });
        }
      },
    });
  };

  changeDate = key => {
    // 切换日期 获取场次
    const {
      taskId,
      dispatch,
      campusInfo: { campusId },
    } = this.props;
    const { defaultPlace } = this.state;
    const that = this;
    this.setState({
      examDateTime: key,
    });
    dispatch({
      type: 'editroom/getBatchByPlaces',
      payload: {
        taskId,
        examPlaceId: defaultPlace,
        examDate: key,
        campusId,
      },
      callback: data => {
        if (data.length > 0) {
          const current = data.filter(vo => vo.leftNum !== 0);
          that.setState({
            checkedBatch: current.length > 0 ? current[0].examBatchId : '',
          });
        }
      },
    });
  };

  render() {
    const {
      hideGroups,
      layoutStudent,
      BatchRoom: { examPlaceList, examDateList },
      BatchByPlaces,
      examArrange,
    } = this.props;
    const { visible, checkedBatch, checkedRooms, defaultPlace, counts, isLimited } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        width={663}
        title={formatMessage({
          id: 'app.title.exam.Manual.Arrangement',
          defaultMessage: '手动编排',
        })}
        okText={formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' })}
        onCancel={hideGroups}
        onOk={this.handleCreate}
        maskClosable={false}
        closable={false}
        className={styles.ManualArrange}
        okButtonProps={{ disabled: examArrange }}
      >
        <div className={styles.manualDetail}>
          <div className={styles.planPeople}>
            <p>待安排</p>
            <span>
              {layoutStudent.length > counts ? Number(layoutStudent.length) - Number(counts) : 0}
            </span>
            人
          </div>
          <div className={styles.examAddress}>
            选择考点：
            <Select defaultValue={defaultPlace} style={{ width: 240 }} onChange={this.handleChange}>
              {examPlaceList.map(vo => (
                <Option value={vo.examPlaceId} key={vo.examPlaceId}>
                  {vo.examPlaceName}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        <div className={styles.manualData}>
          <Tabs onChange={this.changeDate}>
            {examDateList.map(vo => (
              <TabPane tab={this.dateToYMD(vo.examDate)} key={vo.examDate}>
                <div className={styles.mainManual}>
                  <div className={styles.manualLeft}>
                    <List
                      className={styles.batchInfo}
                      dataSource={BatchByPlaces}
                      renderItem={item => (
                        <List.Item
                          className={
                            checkedBatch === item.examBatchId
                              ? styles.checkedBatch
                              : (item.leftNum === 0 &&
                                  (isLimited === 'N'
                                    ? styles.normalBatch
                                    : styles.disabledBatch)) ||
                                ''
                          }
                          onClick={() => this.selectBatch(item.examBatchId, item.leftNum)}
                        >
                          <span className={styles.Remnant}>
                            {isLimited === 'N' ? '已排' : '剩'}
                            {isLimited === 'N' ? item.studentNum : item.leftNum}
                          </span>
                          {item.examBatchName}
                        </List.Item>
                      )}
                    />
                  </div>
                  <div className={styles.manualRight}>
                    <List
                      className={styles.batchInfo}
                      dataSource={
                        BatchByPlaces.filter(vo2 => vo2.examBatchId === checkedBatch).length > 0
                          ? BatchByPlaces.find(vo2 => vo2.examBatchId === checkedBatch).examRoomList
                          : []
                      }
                      locale={{
                        emptyText: '当前日期的批次考点已满，您可以切换日期或者选择其他考点！',
                      }}
                      renderItem={item => (
                        <List.Item
                          className={
                            checkedRooms.filter(vo2 => vo2.id === item.subTaskId).length > 0
                              ? styles.checkedRooms
                              : ((item.leftNum === 0 ||
                                  layoutStudent.length - counts < 0 ||
                                  layoutStudent.length - counts === 0) &&
                                  (isLimited === 'N' ? '' : styles.disabledBatch)) ||
                                styles.normalBatch
                          }
                          onClick={() =>
                            this.selectRoom(
                              item.subTaskId,
                              isLimited === 'N' ? item.studentNum : item.leftNum
                            )
                          }
                        >
                          <div className={styles.detail}>
                            <div className={styles.roomName}>{item.examRoomName}</div>
                            <p className={styles.roomNumber}>
                              {isLimited === 'N'
                                ? checkedRooms.filter(vo2 => vo2.id === item.subTaskId).length > 0
                                  ? layoutStudent.length + item.studentNum
                                  : item.studentNum
                                : checkedRooms.filter(vo2 => vo2.id === item.subTaskId).length > 0
                                ? item.leftNum -
                                  checkedRooms.find(vo2 => vo2.id === item.subTaskId).count
                                : item.leftNum}
                            </p>
                            <div className={styles.roomOnly}>
                              {isLimited === 'N' ? '已安排' : '剩余'}
                            </div>
                            <div className={styles.sizes}>
                              <em className={styles.selected} />
                              <i>
                                {' '}
                                {isLimited === 'N' ? (
                                  <i className="iconfont icon-right" />
                                ) : (
                                  checkedRooms.findIndex(tag => tag.id === item.subTaskId) + 1
                                )}
                              </i>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </Modal>
    );
  }
}

export default ManualArrange;
