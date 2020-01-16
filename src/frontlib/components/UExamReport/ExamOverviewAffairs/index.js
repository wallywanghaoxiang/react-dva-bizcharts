import React, { PureComponent } from 'react';
import cs from 'classnames';
import { formatMessage } from 'umi/locale';
import { Table, Modal, Tooltip } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
// import Highlighter from 'react-highlight-words';
import { InputFilter, SelectorFilter } from '@/frontlib/components/TableFilter';
import constant from '../constant';

const { SYS_TYPE, FULL_CAMPUS_ID } = constant;

@connect(({ uexamReport }) => ({
  taskInfo: uexamReport.taskInfo,
  examDeatil: uexamReport.examDeatil,
  studentList: uexamReport.studentList,
  examDeatilTotal: uexamReport.examDeatilTotal,
  studentListTotal: uexamReport.studentListTotal,
}))
class ExamOverviewAffairs extends PureComponent {
  state = {
    baseInfoVisible: false,
    pageNo: 1,
    modalPageNo: 1,
    requestType: '',
    record: '',
    inputFilters: null, // 表头筛选 input
    selectorFilters: null, // 表头筛选 selector
    sorter: {
      // 监听table，获取排序的规则
      columnKey: '',
      order: '',
    },
  };

  componentWillMount() {
    const { pageNo } = this.state;
    this.loadData(pageNo);
  }

  loadData = (pageNo = 1, sort = {}) => {
    const { dispatch, taskId } = this.props;

    const params = {
      taskId,
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
      pageIndex: pageNo,
      pageSize: 1000,
      ...sort,
    };

    dispatch({
      type: 'uexamReport/getExamDetailInfo',
      payload: params,
    });
  };

  showModal = (type, record, pageNo = 1) => {
    const { dispatch, taskId } = this.props;
    const { campusId, classId } = record;

    dispatch({
      type: 'uexamReport/getTypeStudentList',
      payload: {
        taskId,
        campusId,
        type,
        classId,
        pageIndex: pageNo,
        pageSize: 10,
      },
    }).then(() => {
      const { baseInfoVisible } = this.state;
      if (!baseInfoVisible) {
        this.setState({
          baseInfoVisible: true,
          modalPageNo: 1,
          requestType: type,
          record,
        });
      }
    });
  };

  matchTitle = type => {
    switch (type) {
      case 'ABSENT':
        return '缺考考生名单';
      case 'MAKEUP':
        return '补考考生名单';
      case 'REENROLL':
        return '补报名名单';
      case 'CHEAT':
        return '作弊考生名单';
      case 'FAIL':
        return '考试失败考生名单';
      default:
        return '';
    }
  };

  handleSearch = (dataIndex, selectedKeys) => {
    const { inputFilters } = this.state;
    this.setState({
      inputFilters: {
        ...inputFilters,
        [dataIndex]: selectedKeys[0],
      },
    });
  };

  handleReset = dataIndex => {
    const { inputFilters } = this.state;
    this.setState({
      inputFilters: {
        ...inputFilters,
        [dataIndex]: '',
      },
    });
  };

  handleSelectorSearch = (dataIndex, selectedKeys) => {
    const { selectorFilters } = this.state;
    this.setState({
      selectorFilters: {
        ...selectorFilters,
        [dataIndex]: selectedKeys,
      },
    });
  };

  handleSelectorReset = dataIndex => {
    const { selectorFilters } = this.state;
    this.setState({
      selectorFilters: {
        ...selectorFilters,
        [dataIndex]: [],
      },
    });
  };

  handleTableChangeSorter = (pagination, filters, sorter) => {
    if (pagination) {
      this.state.pageNo = pagination.current;
    }

    if (sorter) {
      if (sorter.columnKey) {
        this.setState({ sorter });
      }
    }
  };

  // 对数据进行排序
  sortStudent = students => {
    // debugger
    const { sorter, inputFilters, selectorFilters } = this.state;
    const { columnKey, order } = sorter;
    if (columnKey && order) {
      students.sort((a, b) => {
        let val = 0;
        val = Number(a[columnKey]) - Number(b[columnKey]);

        // 升序
        if (order === 'ascend') {
          return val;
        }

        // 如果是降序
        if (order === 'descend') {
          return val * -1;
        }

        // 不排序
        return 0;
      });
    }
    // 表头过滤
    let afterFilter = students;
    if (inputFilters) {
      Object.keys(inputFilters).forEach(k => {
        const filterValue = inputFilters[k];
        if (filterValue) {
          afterFilter = afterFilter.filter(s => s[k].indexOf(filterValue) > -1);
        }
      });
    }
    if (selectorFilters) {
      Object.keys(selectorFilters).forEach(k => {
        const filterValue = selectorFilters[k];
        if (filterValue && filterValue.length > 0) {
          afterFilter = afterFilter.filter(s => filterValue.indexOf(s[k]) > -1);
        }
      });
    }

    return afterFilter;
  };

  handleTableChangePagination = pagination => {
    if (pagination) {
      this.state.modalPageNo = pagination.current;
    }
    const { requestType, record, modalPageNo } = this.state;
    this.showModal(requestType, record, modalPageNo);
  };

  render() {
    const columns = [];
    const { type, examDeatil, studentList, studentListTotal, taskInfo } = this.props;
    const examDeatils = this.sortStudent(examDeatil);
    const classList = [];
    examDeatil.forEach(v => {
      if (v.classId && !classList.some(c => c.value === v.classId)) {
        classList.push({ text: v.className, value: v.classId });
      }
    });
    if (type === SYS_TYPE.UEXAM) {
      columns.push(
        {
          title: formatMessage({
            id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.schoolNo',
            defaultMessage: '学校号',
          }),
          dataIndex: 'campusNumber',
          key: 'campusNumber',
          width: 80,
          // ...InputFilter('campusNumber', this.handleSearch, this.handleReset),
        },
        {
          title: formatMessage({
            id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theSchool',
            defaultMessage: '学校',
          }),
          dataIndex: 'campusName',
          key: 'campusName',
          width: 100,
          // ...InputFilter('campusName', this.handleSearch, this.handleReset),
          render: campusName => {
            return (
              <div className={styles.campusName} title={campusName}>
                {campusName}
              </div>
            );
          },
        },
        {
          title: formatMessage({
            id: 'app.text.uexam.report.taskinfo.batchnum',
            defaultMessage: '完成场次',
          }),
          dataIndex: 'subTaskNum',
          key: 'subTaskNum',
          width: 60,
        }
      );
    } else {
      columns.push({
        title: formatMessage({
          id: 'app.title.campus.frontlib.uexamreport.examoverviewaffairs.theClass',
          defaultMessage: '班级',
        }),
        dataIndex: 'className',
        key: 'className',
        width: 80,
        // ...SelectorFilter(
        //   classList,
        //   'classId',
        //   this.handleSelectorSearch,
        //   this.handleSelectorReset,
        //   true
        // ),
      });
    }
    columns.push(
      {
        title: formatMessage({
          id:
            'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theExamineeRegistrationNumber',
          defaultMessage: '考生报名数',
        }),
        dataIndex: 'studentNum',
        key: 'studentNum',
        width: 90,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfRealTest',
          defaultMessage: '实考人数',
        }),
        dataIndex: 'examNum',
        key: 'examNum',
        width: 70,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfSuccessful',
          defaultMessage: '成功人数',
        }),
        dataIndex: 'successNum',
        key: 'successNum',
        width: 70,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: successNum => {
          if (successNum > 0) {
            return <span>{successNum}</span>;
          }

          return <span>0</span>;
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfFailures',
          defaultMessage: '失败人数',
        }),
        dataIndex: 'failNum',
        key: 'failNum',
        width: 70,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (failNum, record) => {
          if (failNum > 0) {
            return (
              <span className={styles.blue} onClick={this.showModal.bind(this, 'FAIL', record, 1)}>
                {failNum}
              </span>
            );
          }
          return <span>0</span>;
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.lackOfTheNumberOfTest',
          defaultMessage: '缺考人数',
        }),
        dataIndex: 'absentNum',
        key: 'absentNum',
        width: 70,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (absentNum, record) => {
          let jsx = null;
          if (record.absentRate > 0) {
            jsx = (
              <Tooltip
                title={formatMessage({
                  id:
                    'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.lackOfExaminationRate',
                  defaultMessage: '缺考率',
                })}
              >
                <span>{`${Number(Number(record.absentRate * 100).toFixed(1))}%`}</span>
              </Tooltip>
            );
          } else {
            jsx = (
              <Tooltip
                title={formatMessage({
                  id:
                    'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.lackOfExaminationRate',
                  defaultMessage: '缺考率',
                })}
              >
                <span>0%</span>
              </Tooltip>
            );
          }

          if (absentNum > 0) {
            return (
              <div>
                <span
                  className={styles.blue}
                  onClick={this.showModal.bind(this, 'ABSENT', record, 1)}
                >
                  {absentNum}
                </span>
                &nbsp;&nbsp;{jsx}
              </div>
            );
          }
          return (
            <div>
              <span>0</span>&nbsp;&nbsp;{jsx}
            </div>
          );
        },
      },
      // {
      //   title: formatMessage({id:"app.title.uexam.frontlib.uexamreport.examoverviewaffairs.lackOfExaminationRate",defaultMessage:"缺考率"}),
      //   dataIndex: 'absentRate',
      //   key: 'absentRate',
      //   width:60,
      //   sorter: true,
      //   sortDirections: ['descend', 'ascend'],
      //   render: (absentRate,record)=>{
      //     if(absentRate>0){
      //       return <span>{Number(absentRate*100).toFixed(1) + "%"}</span>
      //     }else{
      //       return <span>0%</span>
      //     }
      //   }
      // },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationNumber',
          defaultMessage: '补考人数',
        }),
        dataIndex: 'makeUpNum',
        key: 'makeUpNum',
        width: 70,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (makeUpNum, record) => {
          let jsx = null;
          if (record.reRnrollRate > 0) {
            jsx = (
              <Tooltip
                title={formatMessage({
                  id:
                    'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationRate',
                  defaultMessage: '补考率',
                })}
              >
                <span>{`${Number(Number(record.reRnrollRate * 100).toFixed(1))}%`}</span>
              </Tooltip>
            );
          } else {
            jsx = (
              <Tooltip
                title={formatMessage({
                  id:
                    'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationRate',
                  defaultMessage: '补考率',
                })}
              >
                <span>0%</span>
              </Tooltip>
            );
          }

          if (makeUpNum > 0) {
            return (
              <div>
                <span
                  className={styles.blue}
                  onClick={this.showModal.bind(this, 'MAKEUP', record, 1)}
                >
                  {' '}
                  {makeUpNum}{' '}
                </span>
                &nbsp;&nbsp;{jsx}
              </div>
            );
          }
          return <div>0&nbsp;&nbsp;{jsx}</div>;
        },
      },
      // {
      //   title: formatMessage({id:"app.title.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationRate",defaultMessage:"补考率"}),
      //   dataIndex: 'reRnrollRate',
      //   key: 'reRnrollRate',
      //   width:60,
      //   sorter: true,
      //   sortDirections: ['descend', 'ascend'],
      //   render: (reRnrollRate,record)=>{
      //     if(reRnrollRate>0){
      //       return <span>{Number(reRnrollRate*100).toFixed(1) + "%"}</span>
      //     }else{
      //       return <span>0%</span>
      //     }
      //   }
      // },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.forApplicants',
          defaultMessage: '补报名人数',
        }),
        dataIndex: 'reRnrollNum',
        key: 'reRnrollNum',
        width: 90,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (reRnrollNum, record) => {
          if (reRnrollNum > 0) {
            return (
              <span
                className={styles.blue}
                onClick={this.showModal.bind(this, 'REENROLL', record, 1)}
              >
                {reRnrollNum}
              </span>
            );
          }
          return <span>0</span>;
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfCheating',
          defaultMessage: '作弊人数',
        }),
        dataIndex: 'cheatNum',
        key: 'cheatNum',
        width: 110,
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (cheatNum, record) => {
          if (cheatNum > 0) {
            return (
              <span className={styles.blue} onClick={this.showModal.bind(this, 'CHEAT', record, 1)}>
                {cheatNum}
              </span>
            );
          }
          return <span>0</span>;
        },
      }
    );

    const modalColumns = [
      {
        title: formatMessage({ id: 'app.text.kh', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        key: 'examNo',
      },
      {
        title: formatMessage({ id: 'app.text.xm', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        key: 'studentName',
        render: studentName => {
          return (
            <>
              <div className={styles.studentName} title={studentName}>
                {studentName}
              </div>
            </>
          );
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.subordinate.school',
          defaultMessage: '所属学校',
        }),
        dataIndex: 'campusName',
        key: 'campusName',
        render: campusName => {
          return (
            <div className={styles.campusName} title={campusName}>
              {campusName}
            </div>
          );
        },
      },
      {
        title: formatMessage({ id: 'app.text.bj', defaultMessage: '班级' }),
        dataIndex: 'className',
        key: 'className',
      },
    ];

    const { requestType, baseInfoVisible } = this.state;

    if (requestType === 'MAKEUP') {
      modalColumns.push({
        title: formatMessage({
          id: 'app.text.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationNumber',
          defaultMessage: '补考次数',
        }),
        dataIndex: 'makeUpNum',
        key: 'makeUpNum',
      });
    }
    if (requestType === 'REENROLL') {
      modalColumns.push({
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.fillRegistrationForm',
          defaultMessage: '补报名方式',
        }),
        dataIndex: 'reEnrollValue',
        key: 'reEnrollValue',
      });
    }
    if (requestType === 'FAIL') {
      modalColumns.push({
        title: formatMessage({
          id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.testFailureReason',
          defaultMessage: '考试失败原因',
        }),
        dataIndex: 'cmonitoringDescValue',
        key: 'cmonitoringDescValue',
      });
    }

    modalColumns.push({
      title: formatMessage({
        id: 'app.button.app.button.uexam.exam.inpect.examInfo',
        defaultMessage: '考务信息',
      }),
      dataIndex: 'examPlaceName',
      key: 'examPlaceName',
      render: (examPlaceName, record) => {
        return (
          <span>
            {`${examPlaceName}/${record.examBatchName}/${record.examRoomName}|${formatMessage({
              id: 'app.title.uexam.invigilate.teacher',
              defaultMessage: '监考老师',
            })}:${record.teacherName}`}
          </span>
        );
      },
    });

    const {
      examNum,
      studentNum,
      absentNum,
      makeUpNum,
      reRnrollNum,
      cheatNum,
      failNum,
      successNum,
    } = taskInfo;

    const allRecord = {
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId, // FULL代表统考报告
      classId: 'FULL', // FULL代表全校名单
    };
    return (
      <div className={styles.affairs}>
        <div className={styles.affairs_top}>
          <div className={cs(styles.affairs_text, styles.no_border)}>
            <div className={styles.title}>
              {formatMessage({
                id:
                  'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theExamineeRegistrationNumber',
                defaultMessage: '考生报名数',
              })}
            </div>
            <div className={styles.num}>{studentNum || 0}</div>
          </div>
          <div className={cs(styles.affairs_text)}>
            <div className={styles.title}>
              {formatMessage({
                id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfRealTest',
                defaultMessage: '实考人数',
              })}
            </div>
            <div className={styles.num}>{examNum || 0}</div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id: 'app.title.theNumberOfExamSuccess',
                defaultMessage: '考试成功人数',
              })}
            </div>
            <div className={cs(styles.num)}>{successNum || 0}</div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id:
                  'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfTestFailure',
                defaultMessage: '考试失败人数',
              })}
            </div>
            <div
              className={cs(styles.num, styles.blue)}
              onClick={this.showModal.bind(this, 'FAIL', allRecord, 1)}
            >
              {failNum || 0}
            </div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id:
                  'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.lackOfTheNumberOfTest',
                defaultMessage: '缺考人数',
              })}
            </div>
            <div
              className={cs(styles.num, styles.blue)}
              onClick={this.showModal.bind(this, 'ABSENT', allRecord, 1)}
            >
              {absentNum || 0}
            </div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id:
                  'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.makeupExaminationNumber',
                defaultMessage: '补考人数',
              })}
            </div>
            <div
              className={cs(styles.num, styles.blue)}
              onClick={this.showModal.bind(this, 'MAKEUP', allRecord, 1)}
            >
              {makeUpNum || 0}
            </div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.forApplicants',
                defaultMessage: '补报名人数',
              })}
            </div>
            <div
              className={cs(styles.num, styles.blue)}
              onClick={this.showModal.bind(this, 'REENROLL', allRecord, 1)}
            >
              {reRnrollNum || 0}
            </div>
          </div>
          <div className={styles.affairs_text}>
            <div className={styles.title}>
              {formatMessage({
                id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.theNumberOfCheating',
                defaultMessage: '作弊人数',
              })}
            </div>
            <div
              className={cs(styles.num, styles.blue)}
              onClick={this.showModal.bind(this, 'CHEAT', allRecord, 1)}
            >
              {cheatNum || 0}
            </div>
          </div>
        </div>
        <div className={styles.title_tips}>
          {formatMessage({
            id: 'app.title.uexam.frontlib.uexamreport.examoverviewaffairs.takeTheDetail',
            defaultMessage: '考务明细',
          })}
        </div>

        <Table
          dataSource={examDeatils}
          columns={columns}
          className={styles.transcriptTable}
          pagination={{ hideOnSinglePage: true, pageSize: 10, total: examDeatils.length }}
          onChange={this.handleTableChangeSorter}
        />

        <Modal
          visible={baseInfoVisible}
          className={styles.confirm}
          closable
          centered
          destroyOnClose
          width={1010}
          onCancel={() => {
            this.setState({
              baseInfoVisible: false,
            });
          }}
          footer={null}
        >
          <div className={styles.titleText}>{this.matchTitle(requestType)}</div>

          <Table
            dataSource={studentList || []}
            columns={modalColumns}
            pagination={{ hideOnSinglePage: true, pageSize: 10, total: studentListTotal }}
            onChange={this.handleTableChangePagination}
            // scroll={{ y: 340 }}
          />
        </Modal>
      </div>
    );
  }
}

export default ExamOverviewAffairs;
