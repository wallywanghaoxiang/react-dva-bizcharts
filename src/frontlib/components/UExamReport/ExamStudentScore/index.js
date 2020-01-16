import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Input, Button, Icon, message } from 'antd';
// import NoData from '@/components/NoData/index';
// eslint-disable-next-line import/no-extraneous-dependencies
import Highlighter from 'react-highlight-words';
import ReportFilter from '../Components/ReportFilter';
import constant from '../constant';
import styles from './index.less';
import TranscriptList from './TranscriptList';

const { FULL_CAMPUS_ID, SYS_TYPE } = constant;

/**
 * 考试情况总览
 * @author tina.zhang
 * @date   2019-8-21 16:53:04
 * @param {string} taskId - 任务ID
 */
class ExamStudentScore extends PureComponent {
  state = {
    paperId: '', // 试卷ID
    classId: '',
    pageNo: 1,
    paperInfo: {
      subjectiveNum: 1,
      objectiveNum: 1,
    },
    current: 1,

    searchBody: {},
  };

  componentWillMount() {
    const { taskInfo } = this.props;
    const { paperList = [] } = taskInfo;
    this.setState({
      paperInfo: {
        subjectiveNum: paperList[0].subjectiveNum,
        objectiveNum: paperList[0].objectiveNum,
      },
    });
    this.loadData();
  }

  /**
   * 加载学生成绩单数据
   */
  loadData(pageNo = 1, sort = {}) {
    const { dispatch, taskId, type } = this.props;
    const { paperId, classId, searchBody } = this.state;

    const params = {
      taskId,
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
      paperId,
      pageIndex: pageNo,
      pageSize: 10,
      ...sort,
      ...searchBody,
    };

    this.setState({ current: params.pageIndex });

    if (type === SYS_TYPE.CAMPUS) {
      params.classIdList = classId;
    }
    // 单班报告时、班级下拉为全部时，需传递参数 classIdList
    else if (type === SYS_TYPE.CLASS) {
      if (!classId || classId.length === 0) {
        const { classIds: theClassIds } = JSON.parse(
          localStorage.getItem('redirect_to_report_params')
        );
        if (!theClassIds || theClassIds.length === 0) {
          message.error('参数异常 [redirect_to_report_params]');
          return;
        }
        params.classIdList = theClassIds.join(',');
      } else {
        params.classIdList = classId;
      }
    }

    dispatch({
      type: 'uexamReport/getStudentScore',
      payload: params,
    });
  }

  // eslint-disable-next-line react/sort-comp
  handlePaperChanged = value => {
    let paperDetail = null;
    const { taskInfo } = this.props;
    const { paperList = [] } = taskInfo;
    if (taskInfo && value !== 'FULL') {
      paperDetail = paperList.find(item => item.paperId === value);
      this.state.paperInfo = paperDetail;
    } else {
      this.state.paperInfo = {
        subjectiveNum: paperList[0].subjectiveNum,
        objectiveNum: paperList[0].objectiveNum,
      };
    }

    this.setState({ paperId: value }, () => {
      this.loadData();
    });
  };

  handleClassChanged = value => {
    // this.state.classId = value;
    // this.loadData();
    this.setState({ classId: value }, () => {
      this.loadData();
    });
  };

  onSortChange(pagination, filters, sorter) {
    const sort = {};

    if (pagination) {
      this.state.pageNo = pagination.current;
    }

    if (sorter) {
      if (sorter.columnKey) {
        const { paperId } = this.state;
        if (sorter.columnKey === 'gradeRank' && (paperId !== 'FULL' && paperId !== '')) {
          sort.sort = 'paperGradeRank';
        } else {
          sort.sort = sorter.columnKey;
        }

        if (sorter.order === 'descend') {
          sort.asc = false;
        } else if (sorter.order === 'ascend') {
          sort.asc = true;
        }
      }
    }
    const { pageNo } = this.state;
    this.loadData(pageNo, sort);
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={formatMessage({
            id: 'app.title.pleaseInputSearchContent',
            defaultMessage: '请输入搜索内容',
          })}
          value={selectedKeys[0]}
          maxLength={20}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {formatMessage({ id: 'app.button.menu.campus.search', defaultMessage: '搜索' })}
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters, dataIndex)}
          size="small"
          style={{ width: 90 }}
        >
          {formatMessage({ id: 'app.button.menu.campus.reset', defaultMessage: '重置' })}
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),

    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => {
      const { searchText } = this.state;
      return (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      );
    },
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    console.log(this.searchInput.state.value);

    const { searchBody } = this.state;

    searchBody[dataIndex] = this.searchInput.state.value;

    const body = {};
    // eslint-disable-next-line prefer-destructuring
    body[dataIndex] = selectedKeys[0];
    this.loadData(1, body);
    // confirm();
    // this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    const { searchBody } = this.state;
    searchBody[dataIndex] = '';
    this.setState({ searchText: '', searchBody }, () => {
      const body = {};
      this.loadData(1, body);
    });
  };

  render() {
    const { loading, taskInfo, studentScore, type, studentScoreTotal } = this.props;
    const { paperId, classId, paperInfo, current } = this.state;
    return (
      <div className={styles.examOverview}>
        {taskInfo && (
          <>
            <ReportFilter
              type={type}
              showFullPaperOption
              paperList={taskInfo.paperList}
              classList={
                type !== SYS_TYPE.UEXAM && taskInfo.classList.length > 1 ? taskInfo.classList : null
              }
              examNum={taskInfo.successNum}
              onPaperChanged={this.handlePaperChanged}
              onClassChanged={this.handleClassChanged}
            />
          </>
        )}
        {/* {loading && <NoData tip={formatMessage({ id: "app.examination.report.reportoverview.loadingTip", defaultMessage: "分析报告加载中，请稍等..." })} onLoad />} */}
        <TranscriptList
          // taskId={taskOverview.taskId}
          type={type}
          // isExerciseReport={isExerciseReport}
          dataSource={loading ? [] : studentScore}
          key={paperId + classId}
          // classType={taskOverview.classType}
          // classCount={taskOverview.classList.length}
          current={current}
          paperId={paperId}
          getColumnSearchProps={this.getColumnSearchProps}
          loading={loading} // {state.tableLoading}
          total={studentScoreTotal}
          onSortChange={(pagination, filters, sorter) => {
            this.onSortChange(pagination, filters, sorter);
          }}
          {...paperInfo}
        />
      </div>
    );
  }
}

export default connect(({ uexamReport, loading }) => ({
  taskInfo: uexamReport.taskInfo, // 任务总览
  studentScore: uexamReport.studentScore, // 考试情况总览
  studentScoreTotal: uexamReport.studentScoreTotal,
  loading: loading.effects['uexamReport/getStudentScore'],
}))(ExamStudentScore);
