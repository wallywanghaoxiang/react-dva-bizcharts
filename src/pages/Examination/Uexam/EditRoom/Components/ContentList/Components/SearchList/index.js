import React, { PureComponent } from 'react';
import { Table, message, Modal, Empty } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';
import empty from '@/assets/examination/none_soso_pic.png';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import ManualArrange from '../Arrangement/ManualArrange';
import { showWaiting, hideLoading } from '@/frontlib/utils/utils';
import loadingif from '@/frontlib/assets/loading.gif';

const { confirm } = Modal;
/**
 * 搜索的时候页面上显示的结果
 * @author tina.zhang.xu
 * @date   2019-8-15
 */

@connect(({ editroom, loading }) => ({
  searchStudentList: editroom.searchStudentList,
  campusInfo: editroom.campusInfo,
  studentList: editroom.studentList,
  loading: loading.effects['editroom/getSearchStudentList'],
}))
class SearchList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      visibleManual: false, // 手动编排
      searchValue: '', // 搜索内容
      page: 1, // 当前打开页数
      total: 1,
    };
    this.columns = [
      {
        title: formatMessage({ id: 'app.text.xm', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: '10%',
        render: data => <span title={data.studentName}>{data.studentName}</span>,
      },
      {
        title: formatMessage({ id: 'app.text.kh', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: '16%',
        render: data => <div className={styles.info}>{`${data}`}</div>,
      },
      // {
      //   title: formatMessage({ id: "app.text.xxs", defaultMessage: "学校" }),
      //   dataIndex: 'campusName',
      //   width: "14%",
      //   render: data => (
      //     <span title={data}>{data}</span>
      //   )
      // },
      {
        title: formatMessage({ id: 'app.text.bj', defaultMessage: '班级' }),
        dataIndex: 'className',
        width: '13%',
        render: data => <span title={data}>{data}</span>,
      },
      {
        title: formatMessage({ id: 'app.text.kd', defaultMessage: '考点' }),
        dataIndex: 'examPlaceName',
        width: '24%',
        render: data => (
          <span title={data.replace(/null/g, '--')}>{data.replace(/null/g, '--')}</span>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.ksrq', defaultMessage: '考试日期' }),
        dataIndex: 'examDate',
        width: '13%',
        render: data => <div className={styles.info}>{`${data || '--'}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.cz', defaultMessage: '操作' }),
        dataIndex: 'action',
        width: '10%',
        render: data => (
          <div className={styles.link}>
            <a onClick={() => this.Arrangement(data)}>
              {formatMessage({ id: 'app.text.sdbp', defaultMessage: '手动编排' })}
            </a>
          </div>
        ),
      },
    ];
  }

  componentDidMount() {
    const { searchValue } = this.props;
    this.setState({
      searchValue,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { searchValue } = this.props;
    if (nextProps.searchStudentList) {
      this.initData(nextProps.searchStudentList);
    }
    if (nextProps.searchValue !== searchValue) {
      this.setState({
        searchValue: nextProps.searchValue,
      });
    }
  }

  initData = data => {
    let list = [];
    if (data && data.records) {
      list = data.records.map((Item, index) => {
        return {
          key: index,
          studentName: {
            studentName: Item.studentName,
            reExam: Item.reEnrollType === 'URET_1',
          },
          examNo: Item.examNo,
          campusName: Item.campusName,
          className: Item.className,
          examPlaceName: `${Item.examPlaceName}/${Item.examBatchName}/${Item.examRoomName}`,
          examDate: Item.dateFormat,
          action: Item,
        };
      });
    }
    this.setState({
      tableData: list,
      total: data.total,
    });
  };

  getAllStudentList = pageIndex => {
    // 刷新页面数据
    const { dispatch, taskId } = this.props;
    const { searchValue } = this.state;
    dispatch({
      type: 'editroom/getSearchStudentList',
      payload: {
        pageSize: 12,
        pageIndex,
        taskId,
        filterWord: searchValue,
        campusId: localStorage.getItem('campusId'),
      },
    }).then(() => {
      const { searchStudentList } = this.props;
      this.initData(searchStudentList);
    });
  };

  // 一键编排 手动编排  判断当前校区内学生是否有已被编排的学生
  confirmData = studentId => {
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
        that.examArrangeDeleted(studentId); // 先取消编排
      },
    });
  };

  // 取消编排
  examArrangeDeleted = studentId => {
    const { dispatch, taskId, campusInfo } = this.props;
    dispatch({
      type: 'editroom/examArrangeDeleted',
      payload: {
        taskId,
        studentIdList: studentId,
      },
      callback: res => {
        if (res.responseCode === '200') {
          dispatch({
            type: 'editroom/getExamCampus',
            payload: { taskId },
          }).then(() => {
            dispatch({
              type: 'editroom/getExamStatistics',
              payload: { taskId },
            });
            dispatch({
              type: 'editroom/getStudentList',
              payload: {
                taskId,
                campusId: campusInfo.campusId,
              },
            });
            this.getAllStudentList(1); // 更新页面数据
            this.getBatchInfo();
          });
        } else {
          message.error(res.data);
        }
      },
    });
  };

  getBatchInfo = () => {
    const { campusInfo, dispatch, taskId } = this.props;
    // 没有被编排的学生 则弹出 编排弹窗
    // 获取学校信息
    dispatch({
      type: 'editroom/geBatchRooms',
      payload: {
        taskId,
        campusId: campusInfo.campusId,
      },
      callback: data => {
        hideLoading();
        if (data && data.examDateList.length > 0 && data.examPlaceList.length > 0) {
          const { examDateList, examPlaceList } = data;
          // 手动编排则 根据考点时间查询批次考场
          dispatch({
            type: 'editroom/getBatchByPlaces',
            payload: {
              taskId,
              examPlaceId: examPlaceList[0].examPlaceId,
              examDate: examDateList[0].examDate.toString(),
              campusId: campusInfo.campusId,
            },
            callback: () => {
              this.setState({
                visibleManual: true,
              });
            },
          });
        }
      },
    });
  };

  // 手动编排 一键编排
  Arrangement = Item => {
    const { dispatch, taskId } = this.props;
    const studentId = [Item.studentId];
    dispatch({
      type: 'editroom/savePlanStudent',
      payload: {
        studentId,
        taskId,
      },
    }).then(() => {
      if (Item.examPlaceName) {
        // 判断是否已经编排
        this.confirmData(studentId);
      } else {
        showWaiting({
          img: loadingif,
          text: '处理中…请稍候',
        });
        this.getBatchInfo();
      }
    });
  };

  // 隐藏弹窗
  hideManual = e => {
    const { page } = this.state;
    if (e === true) {
      this.getAllStudentList(page); // 编辑后,更新页面数据
    }
    this.setState({ visibleManual: false });
  };

  render() {
    const { loading } = this.props;
    const { tableData, visibleManual, page, total } = this.state;
    const pagination = {
      position: 'bottom',
      defaultPageSize: 12,
      current: page,
      total,
      onChange: e => {
        this.getAllStudentList(e);
        this.setState({
          page: e,
        });
      },
    };
    return (
      <div className={styles.searchList}>
        {loading && (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage({
              id: 'app.message.registration.taskinfo.loading.tip',
              defaultMessage: '信息加载中，请稍等...',
            })}
            onLoad={loading}
          />
        )}
        {!loading && (
          <>
            {tableData.length > 0 ? (
              <Table
                pagination={pagination}
                columns={this.columns}
                dataSource={tableData}
                size="small"
                style={{ height: 480 }}
              />
            ) : (
              <div className={styles.empty}>
                <Empty
                  image={empty}
                  description={
                    <span>
                      {formatMessage({
                        id: 'app.text.uexam.examination.inspect.registration.import.noneSearch',
                        defaultMessage: '暂无搜索结果',
                      })}
                    </span>
                  }
                />
              </div>
            )}
          </>
        )}
        {visibleManual && (
          <ManualArrange visible={visibleManual} hideGroups={e => this.hideManual(e)} />
        )}
      </div>
    );
  }
}

export default SearchList;
