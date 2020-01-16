import React, { PureComponent } from 'react';
import { Button, Divider, Tooltip, Select, Checkbox, Modal, Table, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import OneClickArrange from '../Arrangement/OneClickArrange';
import ManualArrange from '../Arrangement/ManualArrange';
import styles from './index.less';
import { showWaiting, hideLoading, lessWords } from '@/frontlib/utils/utils';
import loadingif from '@/frontlib/assets/loading.gif';

const { confirm } = Modal;

/**
 * 考生编排右边的表格
 * @author tina.zhang.xu
 * @date   2019-8-7
 */

@connect(({ editroom }) => ({
  campusInfo: editroom.campusInfo,
  studentList: editroom.studentList,
  backStatus: editroom.backStatus,
}))
class RightList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checkedNum: 0, // 选中学生的数量
      myClassList: [], // 班级列表
      myStudentList: [], // 学生列表
      classId: 'FULL', // 所选班级ID
      visibleOne: false, // 一键编排
      visibleManual: false, // 手动编排
      page: 1, // 当前分页位置
    };
    this.saveStatus = {}; // 保存当前的状态
    this.studentData = []; // 学生列表信息所有的

    this.columns = [
      {
        title: formatMessage({ id: 'app.text.xm', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: '14%',
        render: data => (
          <div className={styles.studentName}>
            <Checkbox
              checked={data.checked}
              onChange={e => {
                this.checked(e.target.checked, data.info);
              }}
            >
              <Tooltip title={data.studentName}>{`${lessWords(data.studentName, 5)}`}</Tooltip>
            </Checkbox>
            {data.reExam && <span className={styles.bubm}>补</span>}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.bj', defaultMessage: '班级' }),
        dataIndex: 'className',
        width: '15%',
        render: data => <div className={styles.info}>{`班级：${data}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.kh', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: '20%',
        render: data => <div className={styles.info}>{`考号：${data}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.kd', defaultMessage: '考点' }),
        dataIndex: 'examPlaceName',
        width: '26%',
        render: data => <div className={styles.info}>{`考点：${data.replace(/null/g, '--')}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.ksrq', defaultMessage: '考试日期' }),
        dataIndex: 'examDate',
        width: '15%',
        render: data => <div className={styles.info}>{`考试日期：${data || '--'}`}</div>,
      },
    ];
  }

  componentDidMount() {
    const { campusInfo, studentList } = this.props;
    showWaiting({
      img: loadingif,
      text: '加载中…请稍候',
    });
    this.showList(campusInfo, studentList);
    if (studentList && studentList.records && studentList.records.length > 0) {
      hideLoading();
    }
    this.getStudentList();
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.props;
    if (
      nextProps.studentList &&
      nextProps.studentList.records &&
      nextProps.studentList.records.length > 0
    ) {
      hideLoading();
    }
    if (nextProps.backStatus) {
      this.showOldList(nextProps.campusInfo, nextProps.studentList);
    } else {
      this.showList(nextProps.campusInfo, nextProps.studentList);
    }
    if (nextProps.status === 'none' && status !== 'none') {
      // 开始搜索时，需要保存当下数据
      this.saveInfo();
    }
  }

  checked = (check, info) => {
    const data = this.studentData.find(Item => {
      return Item.studentId === info.studentId;
    });
    data.studentName.checked = check;
    this.getShowStudentList();
  };

  // 切换学校后，渲染学生列表
  initStudentList = (a, back) => {
    const list = a.records;
    this.studentData = [];
    let checked = false;
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i += 1) {
        checked = false;
        if (back) {
          // 恢复当时的选中状态
          const data = this.saveStatus.checkedList.find(Item => {
            return Item === list[i].studentId;
          });
          if (data) {
            checked = true;
          }
        }
        this.studentData.push({
          key: i,
          studentName: {
            studentName: list[i].studentName,
            checked,
            info: list[i], // 完整学生信息
            reExam: list[i].reEnrollType === 'URET_1',
          },
          examNo: list[i].examNo,
          examPlaceName: `${list[i].examPlaceName}/${list[i].examBatchName}/${list[i].examRoomName}`,
          examDate: list[i].dateFormat,
          className: list[i].className,
          studentId: list[i].studentId,
          classId: list[i].classId,
        });
      }
    }
  };

  // 109 学生列表
  getStudentList = () => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/getStudentList',
      payload: {
        taskId,
        campusId: localStorage.getItem('campusId'),
        backStatus: false,
      },
    });
  };

  // 全选和取消全选
  studentSelect = type => {
    const { classId } = this.state;
    let data = this.studentData;
    if (classId !== 'FULL') {
      data = this.studentData.filter(Item => {
        return Item.classId === classId;
      });
    }
    if (type === 'all') {
      for (let i = 0; i < data.length; i += 1) {
        data[i].studentName.checked = true;
      }
    } else if (type === 'none') {
      for (let i = 0; i < data.length; i += 1) {
        data[i].studentName.checked = false;
      }
    }
    this.getShowStudentList();
  };

  // 更新学生列表和班级列表
  showList = (list1, list2) => {
    // console.log("list", list1, list2)
    if (list1 && list2) {
      this.initStudentList(list2, false);
      this.setState({
        classId: 'FULL',
        myClassList: list1.classList,
        myStudentList: this.studentData,
        checkedNum: 0,
        page: 1,
      });
    }
  };

  // 更新学生列表和班级列表,并恢复成原来的状态
  showOldList = (list1, list2) => {
    this.initStudentList(list2, true);
    this.setState({
      classId: this.saveStatus.classId,
      myClassList: list1.classList,
      // myStudentList:this.studentData,
      // checkedNum:this.saveStatus.checkedList.length,
      page: this.saveStatus.page,
    });
    this.getShowStudentList();
  };

  // 保存当前状态信息，用于在一键编排、手动编排、取消编排后回到操作时的状态
  saveInfo = () => {
    const { page, classId } = this.state;
    this.saveStatus = {
      page,
      checkedList: this.getChoiceId(),
      classId,
    };
  };

  // 经过班级后的学生列表
  getShowStudentList = () => {
    const { classId } = this.state;
    let num = 0;
    let data = JSON.parse(JSON.stringify(this.studentData));
    if (classId !== 'FULL') {
      data = this.studentData.filter(Item => {
        return Item.classId === classId;
      });
    }
    num = this.studentData.filter(Item => {
      return Item.studentName.checked === true;
    }).length;

    this.setState({
      myStudentList: data,
      checkedNum: num,
    });
  };

  // 切换班级
  changeClass = e => {
    // console.log(e);
    this.setState(
      {
        classId: e,
      },
      () => {
        this.getShowStudentList();
      }
    );
  };

  // 获取当前选中的学生ID
  getChoiceId = () => {
    const data = [];
    let list = [];
    list = this.studentData.filter(Item => {
      return Item.studentName.checked === true;
    });
    if (list.length > 0) {
      Object.keys(list).forEach(index => {
        data.push(list[index].studentId);
      });
    }
    return data;
  };

  // 取消编排
  examArrangeDeleted = (show = true, type) => {
    const { dispatch, taskId } = this.props;
    const data = this.getChoiceId();
    if (data.length > 0) {
      dispatch({
        type: 'editroom/examArrangeDeleted',
        payload: {
          taskId,
          studentIdList: data,
        },
        callback: res => {
          if (res.responseCode === '200') {
            if (show) {
              message.success(`您已成功取消${res.data}名考生的编排！`);
            }
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
              });
              if (!show) {
                this.getBatchInfo(type);
              }
            });
          } else {
            message.error(res.data);
          }
        },
      });
    }
  };

  // 判断选中的学生 是否有编排过的
  noRoom = () => {
    const list = this.studentData.filter(Item => {
      return Item.studentName.checked === true;
    });
    return list.some(Item => {
      return Item.examDate.length > 0;
    });
  };

  // 取消
  cancel = () => {
    if (!this.saveStudents()) {
      return;
    }
    if (!this.noRoom()) {
      // 如果所有选择的学生，都未编排，则退出
      return;
    }
    const that = this;
    this.saveInfo();
    confirm({
      // 警告弹框
      title: '',
      content: (
        <div className="cont">
          {formatMessage({
            id: 'app.text.nsfyqxzxxsdbp',
            defaultMessage: '您是否要取消这些学生的编排？',
          })}
        </div>
      ),
      okText: '是的',
      cancelText: formatMessage({ id: 'app.cancel', defaultMessage: '取消' }),
      onOk() {
        // 点击重新编排 根据类型 弹出编排弹窗
        that.examArrangeDeleted();
      },
    });
  };

  // 一键编排 手动编排 保存学生列表ID
  saveStudents = () => {
    const { dispatch, taskId } = this.props;
    const studentId = this.getChoiceId();
    if (studentId.length === 0) {
      message.warning(
        formatMessage({ id: 'app.text.qxzxybpdxs', defaultMessage: '请选择需要编排的学生！' })
      );
      return false;
    }
    dispatch({
      type: 'editroom/savePlanStudent',
      payload: {
        studentId,
        taskId,
      },
    });
    return true;
  };

  // 一键编排 手动编排  判断当前校区内学生是否有已被编排的学生
  confirmData = type => {
    // 一键编排时判断当前校区内学生是否有已被编排的学生
    const that = this;
    confirm({
      title: '',
      content: (
        <div className="cont">
          {formatMessage({
            id: 'app.text.One.click.orchestration',
            defaultMessage: '您选中的学生中，有已安排的学生，是否重新安排？',
          })}
        </div>
      ),
      okText: formatMessage({
        id: 'app.button.uexam.examination.invigilation.reset',
        defaultMessage: '重新安排',
      }),
      cancelText: formatMessage({ id: 'app.cancel', defaultMessage: '取消' }),
      onOk() {
        showWaiting({
          img: loadingif,
          text: '处理中…请稍候',
        });
        // 点击重新编排 根据类型 弹出编排弹窗
        that.examArrangeDeleted(false, type); // 先取消编排
        // that.getBatchInfo(type)
      },
    });
  };

  getBatchInfo = type => {
    const { dispatch, taskId } = this.props;
    // 没有被编排的学生 则弹出 编排弹窗
    // 获取学校信息
    dispatch({
      type: 'editroom/geBatchRooms',
      payload: {
        taskId,
        campusId: localStorage.getItem('campusId'),
      },
      callback: data => {
        hideLoading();
        if (data && data.examDateList.length > 0 && data.examPlaceList.length > 0) {
          const { examDateList, examPlaceList } = data;
          if (type) {
            this.setState({
              visibleOne: true,
            });
          } else {
            // 手动编排则 根据考点时间查询批次考场
            dispatch({
              type: 'editroom/getBatchByPlaces',
              payload: {
                taskId,
                examPlaceId: examPlaceList[0].examPlaceId,
                examDate: examDateList[0].examDate.toString(),
                campusId: localStorage.getItem('campusId'),
              },
              callback: () => {
                this.setState({
                  visibleManual: true,
                });
              },
            });
          }
        }
      },
    });
  };

  // 手动编排 一键编排
  Arrangement = type => {
    if (!this.saveStudents()) {
      return;
    }
    this.saveInfo();
    const checked = this.studentData.filter(
      Item => Item.studentName.checked === true && Item.examPlaceName !== '' && Item.examDate !== ''
    );
    if (checked.length > 0) {
      this.confirmData(type);
    } else {
      showWaiting({
        img: loadingif,
        text: '处理中…请稍候',
      });
      this.getBatchInfo(type);
    }
  };

  // 隐藏弹窗
  hideManual = type => {
    if (type) {
      this.setState({ visibleOne: false });
    } else {
      this.setState({ visibleManual: false });
    }
  };

  render() {
    const { Option } = Select;
    const {
      page,
      classId,
      myClassList,
      myStudentList,
      checkedNum,
      visibleOne,
      visibleManual,
    } = this.state;
    const pagination = {
      position: 'bottom',
      defaultPageSize: 12,
      current: page,
      onChange: e => {
        this.setState({
          page: e,
        });
      },
    };
    return (
      <div className={styles.rightList}>
        <div className={styles.head}>
          <div className={styles.left}>
            <Select
              defaultValue="FULL"
              onChange={this.changeClass}
              value={classId}
              style={{ width: 115, fontSize: '13px' }}
            >
              <Option key="FULL" value="FULL">
                {formatMessage({ id: 'app.text.qbbj', defaultMessage: '全部班级' })}
              </Option>
              {myClassList &&
                myClassList.map((Item, index) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Option key={index} value={Item.classId}>
                      {Item.className}
                    </Option>
                  );
                })}
            </Select>
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.studentSelect('all');
              }}
            >
              {formatMessage({ id: 'app.text.qxx', defaultMessage: '全选' })}
            </a>
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.studentSelect('none');
              }}
            >
              {formatMessage({
                id: 'app.button.uexam.examination.editroom.contentlist.rightlist.uncheck',
                defaultMessage: '取消选中',
              })}
            </a>
          </div>
          <div className={styles.right}>
            <div>
              {formatMessage({ id: 'app.text.xz', defaultMessage: '选中：' })}
              <span>{checkedNum}</span>
            </div>
            <Button className={styles.btn} onClick={() => this.Arrangement('one')}>
              {formatMessage({ id: 'app.text.yjbp', defaultMessage: '一键编排' })}
            </Button>
            <Button className={styles.btn} onClick={() => this.Arrangement()}>
              {formatMessage({ id: 'app.text.sdbp', defaultMessage: '手动编排' })}
            </Button>
            <Button className={styles.btn} onClick={this.cancel}>
              {formatMessage({ id: 'app.text.qxbp', defaultMessage: '取消编排' })}
            </Button>
          </div>
        </div>
        <Table
          columns={this.columns}
          dataSource={myStudentList}
          showHeader={false}
          // rowSelection={rowSelection}
          pagination={pagination}
          size="small"
          style={{ height: 480 }}
        />
        {visibleOne && (
          <OneClickArrange visible={visibleOne} hideGroups={() => this.hideManual('one')} />
        )}
        {visibleManual && (
          <ManualArrange visible={visibleManual} hideGroups={() => this.hideManual()} />
        )}
      </div>
    );
  }
}

export default RightList;
