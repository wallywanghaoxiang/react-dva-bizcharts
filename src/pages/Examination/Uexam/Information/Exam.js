import React, { PureComponent } from 'react';
import { Select, Tabs, Button, Divider } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import XLSX from 'xlsx';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import SearchBar from '@/components/SearchBar';
import NoData from '@/components/NoData/index';
import TaskInfo from './Components/TaskInfo';
import StudentList from './Components/StudentList';
import AdmissionTickets from './Components/AdmissionTickets';
import TableTags from './Components/TableTags';
import DoorTags from './Components/DoorTags';
import styles from './index.less';

const { TabPane } = Tabs;
const { Option } = Select;
/**
 * 考务信息
 * @author tina.zhang
 * @date   2019-8-19 17:47:52
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, loading }) => ({
  taskInfo: uexam.taskInfo,
  campusInfo: uexam.campusInfo,
  studentList: uexam.studentList, // 考生列表-- 供导出 Excel 使用
  admissionTickets: uexam.admissionTickets, // 准考证列表
  placeInfos: uexam.placeInfos,
  taskInfoLoading: loading.effects['uexam/getTaskInfo'],
}))
class Exam extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      activeTabKey: '1',
      classList: null, // 可选班级列表
      activeClassId: 'ALL', // 准考证：当前选中的班级ID
      searchText: '', // 准考证：当前搜索条件
      activePlaceId: 'ALL', // 桌贴&门贴：当前选中的考点ID
      activeRoomId: 'ALL', // 桌贴&门贴：当前选中的考场ID
      activePlaceRooms: null, // 当前考点下的所有考场
    };
  }

  componentDidMount() {
    this.loadTaskInfo();
    this.loadRoomBatchStatis();
  }

  componentWillReceiveProps(nextProps) {
    const { classList } = this.state;
    // 可选班级列表
    if (classList === null && nextProps.admissionTickets && nextProps.admissionTickets.length > 0) {
      const clist = nextProps.admissionTickets.map(v => ({
        classId: v.classId,
        className: v.className,
      }));
      this.setState({
        classList: clist,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'uexam/clearTaskInfo',
    });
  }

  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId },
    });
  };

  // 加载校区-考点考场批次
  loadRoomBatchStatis = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getCampusPlaceInfos',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
      },
    }).then(res => {
      if (res.responseCode === '200' && res.data) {
        //! 考点下拉框要“全部”
        const { examRoomList } = res.data;
        this.setState({
          activePlaceRooms: [...examRoomList],
        });

        //! 考点下拉框不需要“全部”
        // const { examPlaceList, examRoomList } = res.data;
        // // 默认选中第一个考点
        // const { examPlaceId } = examPlaceList[0];
        // // 选中考点下的所有考场
        // const rooms = examRoomList.filter(r => r.examPlaceId === examPlaceId);
        // this.setState({
        //   activePlaceId: examPlaceId,
        //   activePlaceRooms: [...rooms],
        // });
      }
    });
  };

  // tab 切换事件
  handleTabChange = activeKey => {
    this.setState({
      activeTabKey: activeKey,
      activeClassId: 'ALL', // 准考证：当前选中的班级ID
      searchText: '', // 准考证：当前搜索条件
      // activePlaceId: null, // 桌贴&门贴：当前选中的考点ID
      activeRoomId: 'ALL', // 桌贴&门贴：当前选中的考场ID
    });
  };

  // 导出Excel
  handleExportClick = () => {
    const { studentList } = this.props;
    if (!studentList || !studentList.records || studentList.records.length === 0) {
      return;
    }
    const data = studentList.records.map(item => {
      return {
        [formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.table.examNo',
          defaultMessage: '考号',
        })]: item.examNo,
        [formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.studentName',
          defaultMessage: '考生姓名',
        })]: item.studentName,
        [formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.result.className',
          defaultMessage: '班级',
        })]: item.className,
        [formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examPlaceName',
          defaultMessage: '考点',
        })]: item.examPlaceName,
        [formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examRoomName',
          defaultMessage: '考场',
        })]: item.examRoomName,
        [formatMessage({
          id: 'app.title.uexam.exam.batch',
          defaultMessage: '批次',
        })]: item.examBatchName,
        [formatMessage({
          id: 'app.title.uexam.invigilate.teacher',
          defaultMessage: '监考老师',
        })]: item.teacherName,
        [formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examDate2',
          defaultMessage: '考试日期',
        })]: item.dateFormat,
      };
    });
    // const headers = {
    //   examNo: formatMessage({ id: "app.title.uexam.examination.inspect.registration.table.examNo", defaultMessage: "考号" }),
    //   studentName: formatMessage({ id: "app.title.uexam.examination.invigilation.result.studentName", defaultMessage: "考生姓名" }),
    //   className: formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.className", defaultMessage: "班级" }),
    //   examPlaceName: formatMessage({ id: "app.title.uexam.examination.invigilation.result.examPlaceName", defaultMessage: "考点" }),
    //   examRoomName: formatMessage({ id: "app.title.uexam.examination.invigilation.result.examRoomName", defaultMessage: "考场" }),
    //   examBatchName: formatMessage({ id: "app.title.uexam.exam.batch", defaultMessage: "批次" }),
    //   teacherName: formatMessage({ id: "app.title.uexam.invigilate.teacher", defaultMessage: "监考老师" }),
    //   dateFormat: formatMessage({ id: "app.title.uexam.examination.invigilation.result.examDate2", defaultMessage: "考试日期" })
    // };
    // studentList.records.unshift(headers);
    // const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }; // 定义导出的格式类型
    const wopts = { bookType: 'biff2', bookSST: false, type: 'binary' }; // 定义导出的格式类型
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(data); //  { header: ["考号", "考生姓名", "班级", "考点", "考场", "批次", "监考老师", "考试日期"], skipHeader: true }
    // this.saveAsExcel(new Blob([this.s2ab(XLSX.write(wb, wopts))], { type: "application/octet-stream" }), `考务明细.${(wopts.bookType === "biff2" ? "xls" : wopts.bookType)}`);
    XLSX.writeFile(wb, `考务明细.${wopts.bookType === 'biff2' ? 'xls' : wopts.bookType}`, {
      compression: true,
    });
  };

  // 打印
  handlePrintClick = () => {
    const { activeTabKey } = this.state;
    let printDom = null;
    switch (activeTabKey) {
      case '2':
        printDom = document.getElementById('admissionTickets');
        break;
      case '3':
        printDom = document.getElementById('tableTags');
        break;
      case '4':
        printDom = document.getElementById('doorTags');
        break;
      default:
        break;
    }

    if (printDom) {
      // // 替换body
      // this.replaceBody(printDom);

      // 隐藏root，添加打印 dom
      this.appendPrintDom(printDom);
    }
  };

  // 替换 body
  replaceBody = printDom => {
    // 备份原来的页面
    const old = window.document.body.innerHTML;
    window.document.body.innerHTML = '';
    // 将你要打印的内容附加到这
    window.document.body.appendChild(printDom);
    // 调用print()函数时，会跳出打印预览的界面，以下的代码被阻塞，关闭预览界面后继续执行
    window.print();
    // 重新加载旧页面
    window.document.body.innerHTML = old;
    // TODO  不重新加载页面，事件不能正常响应
    // window.location.reload()
  };

  // 隐藏root，添加打印 dom
  appendPrintDom = printDom => {
    const root = document.getElementById('root');
    root.style.display = 'none';
    let printContainer = document.getElementById('printContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'printContainer';
    }
    printContainer.innerHTML = printDom.outerHTML;
    document.body.appendChild(printContainer);
    window.print();
    printContainer.innerHTML = '';
    root.style.display = 'block';
  };

  // 班级切换
  handleClassChanged = val => {
    this.setState({
      activeClassId: val,
    });
  };

  // 考点切换
  handlePlaceChanged = val => {
    const { placeInfos } = this.props;
    // 所有考场信息
    const { examRoomList } = placeInfos;
    // 选中考点下的所有考场
    const rooms = val === 'ALL' ? examRoomList : examRoomList.filter(r => r.examPlaceId === val);
    this.setState({
      activePlaceId: val,
      activeRoomId: 'ALL',
      activePlaceRooms: [...rooms],
    });
  };

  // 考场切换
  handleRoomChanged = val => {
    this.setState({
      activeRoomId: val,
    });
  };

  // 搜索（准考证）
  handleSearch = value => {
    this.setState({
      searchText: value,
    });
  };

  // TAB 右侧操作栏
  getRightButton = () => {
    const {
      activeTabKey,
      classList,
      activeClassId,
      activeRoomId,
      activePlaceId,
      activePlaceRooms,
    } = this.state;
    const { placeInfos } = this.props;

    // update 隐藏导出功能 2019-11-14 15:49:02
    // if (activeTabKey === '1') {
    //   return (
    //     <div className={styles.tabRight}>
    //       <Button className={styles.btnExport} shape="round" onClick={this.handleExportClick}>
    //         {formatMessage({
    //           id: 'app.button.uexam.examination.info.exportexcel',
    //           defaultMessage: '导出Excel',
    //         })}
    //       </Button>
    //     </div>
    //   );
    // }
    if (activeTabKey === '2') {
      return (
        <div className={styles.tabRight}>
          <Select
            className={styles.classSelector}
            dropdownMatchSelectWidth={false}
            value={activeClassId}
            onChange={val => this.handleClassChanged(val)}
          >
            <Option value="ALL" className={styles.classSelectorItem}>
              {formatMessage({
                id: 'app.text.uexam.examination.info.classselector.all',
                defaultMessage: '全部',
              })}
            </Option>
            {classList &&
              classList.length > 0 &&
              classList.map(v => {
                return (
                  <Option value={v.classId} className={styles.classSelectorItem}>
                    {v.className}
                  </Option>
                );
              })}
          </Select>
          <div className={styles.searchContainer}>
            <SearchBar
              placeholder={formatMessage({
                id: 'app.placeholder.uexam.examination.info.searchticket',
                defaultMessage: '请输入学生姓名/考号搜索',
              })}
              onSearch={this.handleSearch}
              maxLength="30"
            />
          </div>
          {/* update 隐藏打印功能 2019-11-15 15:32:00 */}
          {/* <Divider type="vertical" />
          <Button
            type="primary"
            shape="round"
            className={styles.btnPrint}
            onClick={this.handlePrintClick}
          >
            {formatMessage({ id: 'app.result.success.btn-print', defaultMessage: '打印' })}
          </Button> */}
        </div>
      );
    }
    if (activeTabKey === '3' || activeTabKey === '4') {
      // 所有考点、考场信息
      const { examPlaceList } = placeInfos;

      return (
        <div className={styles.tabRight}>
          <span className={styles.label}>考点</span>
          <Select
            className={styles.placeSelector}
            dropdownMatchSelectWidth={false}
            value={activePlaceId}
            onChange={val => this.handlePlaceChanged(val)}
          >
            <Option value="ALL" className={styles.classSelectorItem}>
              {formatMessage({
                id: 'app.text.uexam.examination.info.classselector.all',
                defaultMessage: '全部',
              })}
            </Option>
            {examPlaceList &&
              examPlaceList.length > 0 &&
              examPlaceList.map(v => {
                return (
                  <Option value={v.examPlaceId} className={styles.classSelectorItem}>
                    {v.examPlaceName}
                  </Option>
                );
              })}
          </Select>
          <span className={styles.label}>考场</span>
          <Select
            className={styles.roomSelector}
            dropdownMatchSelectWidth={false}
            value={activeRoomId}
            onChange={val => this.handleRoomChanged(val)}
          >
            <Option value="ALL" className={styles.classSelectorItem}>
              {formatMessage({
                id: 'app.text.uexam.examination.info.classselector.all',
                defaultMessage: '全部',
              })}
            </Option>
            {activePlaceRooms &&
              activePlaceRooms.length > 0 &&
              activePlaceRooms.map(v => {
                return (
                  <Option value={v.id} className={styles.classSelectorItem}>
                    {v.name}
                  </Option>
                );
              })}
          </Select>
          {/* update 隐藏打印功能 2019-11-14 15:49:02 */}
          {/* <Divider type="vertical" />
          <Button type="primary" shape="round" className={styles.btnPrint} onClick={this.handlePrintClick}>
            {formatMessage({ id: "app.result.success.btn-print", defaultMessage: "打印" })}
          </Button> */}
        </div>
      );
    }

    return null;
  };

  render() {
    const { activeTabKey, activeClassId, searchText, activeRoomId, activePlaceRooms } = this.state;
    const { match, taskInfoLoading, taskInfo, campusInfo, placeInfos } = this.props;

    const { taskId } = match.params;

    // 是否学科管理员
    const isSubjectAdmin =
      localStorage.isSubjectAdmin === 'true' || localStorage.isAdmin === 'true';

    return (
      <div className={styles.information}>
        <h1 className={styles.menuName}>
          <Link to="/examination/uexam">
            <span>
              {formatMessage({
                id: 'app.title.examination.uexam.tasklist',
                defaultMessage: '统考',
              })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({
            id: 'app.title.examination.uexam.examInfo',
            defaultMessage: '考务信息',
          })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {taskInfoLoading && (
            <NoData
              tip={formatMessage({
                id: 'app.message.registration.taskinfo.loading.tip',
                defaultMessage: '信息加载中，请稍等...',
              })}
              onLoad={taskInfoLoading}
            />
          )}
          {!taskInfoLoading && taskInfo && (
            <>
              <TaskInfo taskInfo={taskInfo} studentNum={campusInfo.studentNum} />
              <div className={styles.tabContainer}>
                <Tabs
                  className={styles.infoTabs}
                  tabBarExtraContent={this.getRightButton()}
                  activeKey={activeTabKey}
                  onChange={this.handleTabChange}
                >
                  <TabPane
                    tab={formatMessage({
                      id: 'app.title.uexam.examination.info.tab.detail',
                      defaultMessage: '考务明细',
                    })}
                    key="1"
                  >
                    <StudentList taskId={taskId} />
                  </TabPane>
                  {isSubjectAdmin && (
                    <TabPane
                      tab={formatMessage({
                        id: 'app.title.uexam.examination.info.tab.tickets',
                        defaultMessage: '准考证',
                      })}
                      key="2"
                    >
                      <AdmissionTickets
                        taskId={taskId}
                        taskName={taskInfo.name}
                        classId={activeClassId === 'ALL' ? null : activeClassId}
                        filterWords={searchText}
                      />
                    </TabPane>
                  )}
                  {isSubjectAdmin && (
                    <TabPane
                      tab={formatMessage({
                        id: 'app.title.uexam.examination.info.tab.tablestick',
                        defaultMessage: '桌贴',
                      })}
                      key="3"
                    >
                      {placeInfos && (
                        <TableTags
                          roomId={activeRoomId === 'ALL' ? null : activeRoomId}
                          examRoomList={activePlaceRooms}
                        />
                      )}
                    </TabPane>
                  )}
                  {isSubjectAdmin && (
                    <TabPane
                      tab={formatMessage({
                        id: 'app.title.uexam.examination.info.tab.doorstick',
                        defaultMessage: '门贴',
                      })}
                      key="4"
                    >
                      {placeInfos && (
                        <DoorTags
                          taskName={taskInfo.name}
                          roomId={activeRoomId === 'ALL' ? null : activeRoomId}
                          examRoomList={activePlaceRooms}
                        />
                      )}
                    </TabPane>
                  )}
                </Tabs>
              </div>
            </>
          )}
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Exam;
