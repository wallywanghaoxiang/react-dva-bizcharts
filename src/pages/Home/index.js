import React, { Component } from 'react';
import { Modal, message, Divider, Tooltip } from 'antd';
// eslint-disable-next-line no-unused-vars
import { routerRedux } from 'dva/router';
import router from 'umi/router';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import nonePaper from '@/assets/none_school_icon.png';
import newSchool from '@/assets/new_school_pop_pic.png';
// eslint-disable-next-line no-unused-vars
import welcomeSchool from '@/assets/school_welcome_pic.png';
import { getUnBindCampus, addCamplus } from '@/services/api';
import { showWaiting, hideLoading } from '@/frontlib/utils/utils';
import loading from '@/frontlib/assets/loading.gif';

import styles from './index.less';
import NoData from '@/components/NoData/index';
import noDataPic from '@/assets/home/nodata.png';
import publicPic from '@/assets/home/public.png';
import checkPic from '@/assets/home/check.png';
import classPic from '@/assets/home/class_manage.png';
import paperPic from '@/assets/home/paper.png';
import ItemTitle from './components/ItemTitle/index';
import EntryItem from './components/EntryItem/index';
import LearnSituationItem from './components/LearnSituationItem/index';
import DropoutItem from './components/DropoutItem/index';

const messages = defineMessages({
  SucessAdd: { id: 'app.teacher.account.sucessAdd', defaultMessage: '您已成功加入该学校！' },
  FaliureAdd: { id: 'app.teacher.account.faliureAdd', defaultMessage: '加入失败！' },
  WelcomeAdd: { id: 'app.teacher.account.welcomeAdd', defaultMessage: '欢迎您的加入！' },
  ConcatManage: {
    id: 'app.teacher.account.concatManage',
    defaultMessage: '您尚未添加入任何校区，请联系校管理员老师',
  },
  ConfirmAdd: { id: 'app.teacher.account.confirmAdd', defaultMessage: '确认加入' },
  InviteAdd: { id: 'app.teacher.account.inviteAdd', defaultMessage: '您被邀请加入' },
  NoAdd: { id: 'app.teacher.account.noAdd', defaultMessage: '不加入' },
  welcomeTip: { id: 'app.teacher.home.welcom.tip', defaultMessage: '欢迎回来，祝您工作愉快！' },
  campusSwapTip: {
    id: 'app.teacher.home.campus.swap.tip',
    defaultMessage: '行政班校区异动已开启，距离结束还剩',
  },
  classSwapTip: {
    id: 'app.teacher.home.class.swap.tip',
    defaultMessage: '教学班校区异动已开启，距离结束还剩',
  },
  day: { id: 'app.teacher.home.day', defaultMessage: '天' },
  lastDay: { id: 'app.campus.manage.class.config.last.day', defaultMessage: '最后一天' },
  naturalClass: { id: 'app.teacher.home.natural.class.title', defaultMessage: '行政班' },
  teachingClass: { id: 'app.teacher.home.teaching.class.title', defaultMessage: '教学班' },
  teacherNum: { id: 'app.teacher.home.teacher.number.title', defaultMessage: '教师数' },
  studentNum: { id: 'app.teacher.home.student.number.title', defaultMessage: '学生数' },
  uint1: { id: 'app.teacher.home.unit1', defaultMessage: '个' },
  uint2: { id: 'app.teacher.home.unit2', defaultMessage: '人' },
  swapTip: {
    id: 'app.teacher.home.swap.hover.tip',
    defaultMessage:
      '异动期内开放添加，批量导入学生，从其他 班级调入学生，删除学生，如有学生变动， 请在异动期结束之前处理。',
  },
  noDataTip: { id: 'app.teacher.home.no.data.tip', defaultMessage: '还没有数据哦~' },
  entryTitle: { id: 'app.teacher.home.shortcut.entry.title', defaultMessage: '快捷入口' },
  learnSituationTitle: { id: 'app.teacher.home.learn.situation.title', defaultMessage: '学情检查' },
  leaveSchoolTitle: { id: 'app.teacher.home.leave.school.title', defaultMessage: '退学管理' },
  publicTit: { id: 'app.teacher.home.public.title', defaultMessage: '发布' },
  checkTit: { id: 'app.teacher.home.check.title', defaultMessage: '检查' },
  classTit: { id: 'app.teacher.home.class.title', defaultMessage: '我的班级' },
  paperTit: { id: 'app.teacher.home.paper.title', defaultMessage: '试卷库' },
  dropOutTip1: {
    id: 'app.teacher.home.campus.manager.drop.out.school.tip1',
    defaultMessage: '确认同意',
  },
  dropOutTip2: {
    id: 'app.teacher.home.campus.manager.drop.out.school.tip2',
    defaultMessage: '的退学申请？退学后，学校将无法查看该学生信息。',
  },
  cancle: { id: 'app.cancel', defaultMessage: '取消' },
  okText: { id: 'app.teacher.home.campus.manager.drop.out.btn.title', defaultMessage: '退学' },
});

@connect(({ login, home, file }) => {
  const { campusList, campusID } = login;
  const { fileInfo } = file;
  const {
    statistics,
    learnSituationList,
    quitStudentList,
    teacherInfoList,
    teacherClassSwapInfo,
    campusInfo,
  } = home;
  const { naturalClassNum, studentNum, teacherNum, teachingClassNum } = statistics;

  // 处理校区
  const campusId = localStorage.getItem('campusId');
  // 获取当前校区
  const currentCampus = teacherInfoList ? teacherInfoList.find(it => it.campusId === campusId) : '';
  return {
    campusList,
    campusID,
    naturalClassNum,
    studentNum,
    teacherNum,
    teachingClassNum,
    learnSituationList,
    quitStudentList,
    teacherInfoList,
    currentCampus,
    teacherClassSwapInfo,
    campusInfo,
    fileInfo,
  };
})
class Home extends Component {
  state = {
    visible: true,
    camplusLists: [],
    campusName: localStorage.getItem('campusName'),
    currentPage: 1, // 当前页
    total: 0, // 总条数
    pageSize: 5, // 退学管理每页显示条数
    currentLogoPath: '',
    showQuitStudents: [], // 展示的退学学生
  };

  componentWillMount() {
    const that = this;
    const mobile = localStorage.getItem('mobile');
    const campusId = localStorage.getItem('campusId');
    if (mobile) {
      getUnBindCampus({ mobile }).then(e => {
        if (e && e.responseCode === '200') {
          that.setState({
            camplusLists: e.data,
          });
        }
      });
    }

    if (campusId) {
      // 查看校区信息
      this.getCurrentCampusInfo();

      // 查询老师班级异动
      this.getTeacherClassSwap();

      // 老师角色信息
      this.getTeacherInfo();

      // 查询校区统计信息
      this.getCampusStatistics();

      // 查询学情分析列表
      this.getLearnList();

      // 查询退学学生
      this.getQuitStudent();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      this.setState({ campusName: localStorage.getItem('campusName') });
      this.getCurrentCampusInfo();
    }
  }

  // 查询校区基本信息
  getCurrentCampusInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'home/campusInfo',
      payload: {},
      callback: data => {
        const { logo } = data;
        if (logo) {
          // 有logo
          const params = {
            fileId: logo,
          };
          dispatch({
            type: 'file/file',
            payload: params,
            callback: fileData => {
              const { path } = fileData;
              this.setState({
                currentLogoPath: path,
              });
            },
          });
        } else {
          this.setState({
            currentLogoPath: '',
          });
        }
      },
    });
  };

  // 查询老师班级异动
  getTeacherClassSwap = () => {
    const { dispatch } = this.props;
    const teacherId = localStorage.getItem('teacherId');
    const params = {
      teacherId,
    };
    dispatch({
      type: 'home/teacherClassSwap',
      payload: params,
    });
  };

  // 老师角色信息
  getTeacherInfo = () => {
    const { dispatch } = this.props;
    const accountId = localStorage.getItem('uid');
    const params = {
      accountId,
    };
    dispatch({
      type: 'home/teacherInfo',
      payload: params,
    });
  };

  // 查询校区统计信息
  getCampusStatistics = () => {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const teacherId = localStorage.getItem('teacherId');
    const params = {
      campusId,
      teacherId,
    };
    dispatch({
      type: 'home/statistics',
      payload: params,
    });
  };

  // 查询学情分析列表
  getLearnList = () => {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const teacherId = localStorage.getItem('teacherId');
    const params = {
      campusId,
      teacherId,
      pageIndex: 1,
      pageSize: 3,
      status: 'TS_4,TS_5',
    };
    dispatch({
      type: 'home/learnSituation',
      payload: params,
    });
  };

  // 查询退学学生
  getQuitStudent = () => {
    const { pageSize } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'home/quitStudent',
      payload: {},
      callback: list => {
        const num = list.length;
        let arr = [];
        if (list.length > pageSize) {
          arr = list.slice(0, pageSize);
        } else {
          arr = list;
        }
        this.setState({
          total: num,
          showQuitStudents: arr,
        });
      },
    });
  };

  hideModal = () => {
    // 确认拒绝加入
    const { camplusLists } = this.state;
    const accountId = localStorage.getItem('uid');
    const teacherId = camplusLists[0].id;
    const param = { accountId, teacherId, bindStatus: 'REFUSE' };
    addCamplus(param).then(() => {
      this.setState({ visible: false });
      window.location.href = '/home';
    });
  };

  scoreResults = taskId => {
    // 点击评分结果
    showWaiting({
      img: loading,
      text: '正在评分，请稍等..',
    });
    // 调用是否汇总，弹出loading页面 返回结果，无论成功失败，打开报告页面。
    const { dispatch } = this.props;
    dispatch({
      type: 'home/getSummaryData',
      payload: { taskId },
      callback: () => {
        hideLoading();
        router.push({ pathname: `/examination/inspect/report/${taskId}` });
      },
    });
  };

  // 校区切换
  handleCampusChange = (value, campusId, name, campusName, tenantId, isAdmin, isSubjectAdmin) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/switchCurrentCampus',
      payload: { value, campusId },
      callback: () => {
        localStorage.setItem('campusId', campusId);
        localStorage.setItem('teacherId', value);
        localStorage.setItem('userName', name);
        localStorage.setItem('campusName', campusName);
        localStorage.setItem('tenantId', tenantId);
        localStorage.setItem('isAdmin', isAdmin);
        localStorage.setItem('isSubjectAdmin', isSubjectAdmin);
        window.location.href = '/home';
      },
    });
  };

  okModal = () => {
    // 确认加入
    const { camplusLists } = this.state;
    const that = this;
    const accountId = localStorage.getItem('uid');
    const teacherId = camplusLists[0].id;
    const param = { accountId, teacherId, bindStatus: 'BIND' };
    addCamplus(param).then(e => {
      if (e.responseCode === '200') {
        message.success(formatMessage(messages.SucessAdd));
        that.handleCampusChange(
          camplusLists[0].id,
          camplusLists[0].campusId,
          camplusLists[0].name,
          camplusLists[0].campusName,
          camplusLists[0].tenantId,
          camplusLists[0].isAdmin,
          camplusLists[0].isSubjectAdmin
        );
        this.setState({
          campusName: camplusLists[0].campusName,
        });
        const { dispatch } = this.props;
        dispatch({
          type: 'login/queryCampusList',
          payload: param,
        });
      } else {
        message.warning(e.data);
      }
      this.setState({ visible: false });
    });
  };

  // 分页
  clickPreview = () => {
    const { currentPage, pageSize } = this.state;
    const { quitStudentList } = this.props;
    if (currentPage > 1) {
      const page = currentPage - 1;
      const endIdx = page * pageSize;
      const startIdx = (page - 1) * pageSize;

      const showArr = quitStudentList.slice(startIdx, endIdx);
      this.setState({
        currentPage: page,
        showQuitStudents: showArr,
      });
    }
  };

  clickNext = () => {
    const { currentPage, total, pageSize } = this.state;
    const { quitStudentList } = this.props;
    if (currentPage * pageSize < total) {
      const page = currentPage + 1;
      const startIdx = currentPage * pageSize;
      const endIdx = page * pageSize;
      const showArr = quitStudentList.slice(startIdx, endIdx);
      this.setState({
        currentPage: page,
        showQuitStudents: showArr,
      });
    }
  };

  render() {
    const {
      visible,
      camplusLists,
      campusName,
      currentPage,
      total,
      currentLogoPath,
      showQuitStudents,
      pageSize,
    } = this.state;
    const {
      campusList,
      learnSituationList,
      naturalClassNum,
      studentNum,
      teacherNum,
      teachingClassNum,
      quitStudentList,
      // eslint-disable-next-line no-unused-vars
      teacherInfoList,
      currentCampus, // 当前校区信息
      teacherClassSwapInfo, // 教师班级异动
      campusInfo, // 校区信息
    } = this.props;

    let previewDisable;
    let nextDisable;
    if (currentPage === 1) {
      previewDisable = true;
    } else {
      previewDisable = false;
    }
    if (currentPage * pageSize < total) {
      nextDisable = false;
    } else {
      nextDisable = true;
    }

    // 异动处理
    const classLastDays =
      teacherClassSwapInfo && teacherClassSwapInfo.naturalClass
        ? teacherClassSwapInfo.naturalClass.lastDays
        : null;
    const teachingLastDays =
      teacherClassSwapInfo && teacherClassSwapInfo.teachingClass
        ? teacherClassSwapInfo.teachingClass.lastDays
        : null;

    return (
      <div>
        {/* 已绑定校区 */}
        {campusList && campusList.length > 0 && (
          // <div className={styles.welcome}>
          //   <img className={styles["welcome-img"]} src={welcomeSchool} alt='' />
          //   <div className={styles["welcome-school"]}>{campusName}</div>
          //   <div className={styles["welcome-text"]}>{formatMessage(messages.WelcomeAdd)}</div>
          // </div>
          <div className={styles.homeContainer}>
            {/* top 顶部 */}
            <div className={styles.top}>
              <div className={styles.topCont}>
                <div className={styles.left}>
                  {currentLogoPath ? (
                    <div className={styles.campusLogo}>
                      <img src={currentLogoPath} alt="logo" />
                    </div>
                  ) : (
                    <div className={styles.campusName}>{campusName}</div>
                  )}

                  <div className={styles.line} />
                  <div className={styles.welcomeTip}>
                    {campusInfo && campusInfo.description
                      ? campusInfo.description
                      : formatMessage(messages.welcomeTip)}
                  </div>
                </div>
                <div className={styles.right}>
                  {currentCampus && currentCampus.isAdmin && (
                    <div className={styles.numberBox}>
                      {/* 行政班 */}
                      <div className={styles.numberItem}>
                        <div className={styles.tit}>{formatMessage(messages.naturalClass)}</div>
                        <div className={styles.cont}>
                          <span className={styles.number}>{naturalClassNum}</span>
                          <span className={styles.unit}>{formatMessage(messages.uint1)}</span>
                        </div>
                      </div>
                      {/* 教学班 */}
                      <div className={styles.numberItem}>
                        <div className={styles.tit}>{formatMessage(messages.teachingClass)}</div>
                        <div className={styles.cont}>
                          <span className={styles.number}>{teachingClassNum}</span>
                          <span className={styles.unit}>{formatMessage(messages.uint1)}</span>
                        </div>
                      </div>
                      {/* 教师数 */}
                      <div className={styles.numberItem}>
                        <div className={styles.tit}>{formatMessage(messages.teacherNum)}</div>
                        <div className={styles.cont}>
                          <span className={styles.number}>{teacherNum}</span>
                          <span className={styles.unit}>{formatMessage(messages.uint2)}</span>
                        </div>
                      </div>
                      {/* 学生数 */}
                      <div className={styles.numberItem}>
                        <div className={styles.tit}>{formatMessage(messages.studentNum)}</div>
                        <div className={styles.cont}>
                          <span className={styles.number}>{studentNum}</span>
                          <span className={styles.unit}>{formatMessage(messages.uint2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* 异动 */}
              <div className={styles.swapTip}>
                {/* 行政班异动 */}
                {classLastDays && Number(classLastDays) > 0 && (
                  <span>
                    <span>{formatMessage(messages.campusSwapTip)}</span>
                    <span className={styles.day} style={{ paddingRight: '0px' }}>
                      {Number(classLastDays) === 1
                        ? formatMessage(messages.lastDay)
                        : `${classLastDays}${formatMessage(messages.day)}`}
                    </span>
                    {teachingLastDays && Number(teachingLastDays) > 0 && (
                      <Divider type="vertical" />
                    )}
                  </span>
                )}
                {/* 教学班异动 */}
                {teachingLastDays && Number(teachingLastDays) > 0 && (
                  <span>
                    <span>{formatMessage(messages.classSwapTip)}</span>
                    <span className={styles.day}>
                      {Number(teachingLastDays) === 1
                        ? formatMessage(messages.lastDay)
                        : `${teachingLastDays}${formatMessage(messages.day)}`}
                    </span>
                  </span>
                )}
                {((classLastDays && Number(classLastDays) > 0) ||
                  (teachingLastDays && Number(teachingLastDays) > 0)) && (
                  <Tooltip
                    placement="topRight"
                    title={formatMessage(messages.swapTip)}
                    arrowPointAtCenter
                  >
                    <i className="iconfont icon-help" />
                  </Tooltip>
                )}
              </div>
            </div>

            {/* 中间 */}
            {
              // (!currentCampus || currentCampus.isAdmin || currentCampus.isSubjectAdmin)
              // ?
              // null
              // :
              <div className={styles.middle}>
                {/* 学情检测 */}
                <div className={styles.learnSituation}>
                  <ItemTitle text={formatMessage(messages.learnSituationTitle)} />
                  {learnSituationList.length > 0 ? (
                    <div className={styles.learnSituationList}>
                      {learnSituationList.map(item => {
                        return (
                          <LearnSituationItem
                            item={item}
                            key={item.taskId}
                            scoreResult={() => this.scoreResults(item.taskId)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <NoData noneIcon={noDataPic} tip={formatMessage(messages.noDataTip)} />
                  )}
                </div>
                {/* 快捷入口 */}
                <div className={styles.shortCutEntry}>
                  <ItemTitle text={formatMessage(messages.entryTitle)} />
                  <div className={styles.shortEntryItem}>
                    <EntryItem
                      icon={publicPic}
                      text={formatMessage(messages.publicTit)}
                      onClick={() => {
                        router.push({ pathname: `/examination/publish/step` });
                      }}
                    />
                    <EntryItem
                      icon={checkPic}
                      text={formatMessage(messages.checkTit)}
                      onClick={() => {
                        router.push({ pathname: `/examination/inspect` });
                      }}
                    />
                  </div>
                  <div className={styles.shortEntryItem}>
                    <EntryItem
                      icon={classPic}
                      text={formatMessage(messages.classTit)}
                      onClick={() => {
                        router.push({ pathname: `/classallocation/classmanage` });
                      }}
                    />
                    <EntryItem
                      icon={paperPic}
                      text={formatMessage(messages.paperTit)}
                      onClick={() => {
                        router.push({ pathname: `/papermanage/schoolpaper` });
                      }}
                    />
                  </div>
                </div>
              </div>
            }

            {/* 退学管理 */}
            {currentCampus && currentCampus.isAdmin && (
              <div className={styles.bottom}>
                <ItemTitle text={formatMessage(messages.leaveSchoolTitle)} />
                {/* 分页按钮 */}
                {quitStudentList.length > 0 && (
                  <div className={styles.pagination}>
                    <div
                      className={styles.preview}
                      style={{ cursor: previewDisable ? 'not-allowed' : 'pointer' }}
                      onClick={this.clickPreview}
                    >
                      <i
                        className="iconfont icon-link-arrow-left"
                        style={{ color: previewDisable ? '#B2B2B2' : '#333333' }}
                      />
                    </div>
                    <div
                      className={styles.next}
                      style={{ cursor: nextDisable ? 'not-allowed' : 'pointer' }}
                      onClick={this.clickNext}
                    >
                      <i
                        className="iconfont icon-link-arrow"
                        style={{ color: nextDisable ? '#B2B2B2' : '#333333' }}
                      />
                    </div>
                  </div>
                )}

                {quitStudentList.length > 0 ? (
                  <div className={styles.leaveSchoolList}>
                    {showQuitStudents.map(item => {
                      return (
                        <DropoutItem
                          item={item}
                          onAgree={() => {
                            // 同意
                            Modal.confirm({
                              content: (
                                <div className="cont">
                                  <span>{formatMessage(messages.dropOutTip1)}</span>
                                  <span style={{ paddingLeft: '5px' }}>{item.className}</span>
                                  <span className="name">{item.studentName}</span>
                                  <span>{formatMessage(messages.dropOutTip2)}</span>
                                </div>
                              ),
                              okText: formatMessage(messages.okText),
                              centered: true,
                              cancelText: formatMessage(messages.cancle),
                              onOk: () => {
                                const { dispatch } = this.props;
                                const params = {
                                  id: item.id,
                                  status: 'Y',
                                };
                                dispatch({
                                  type: 'home/quitApply',
                                  payload: params,
                                  callback: () => {
                                    // 处理成功
                                    this.getQuitStudent();
                                  },
                                });
                              },
                            });
                          }}
                          onReject={() => {
                            // 驳回
                            const { dispatch } = this.props;
                            const params = {
                              id: item.id,
                              status: 'N',
                            };
                            dispatch({
                              type: 'home/quitApply',
                              payload: params,
                              callback: () => {
                                // 处理成功
                                this.getQuitStudent();
                              },
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <NoData noneIcon={noDataPic} tip={formatMessage(messages.noDataTip)} />
                )}
              </div>
            )}
          </div>
        )}
        {campusList && campusList.length === 0 && (
          <div className={styles.empty}>
            <img
              className={styles['empty-img']}
              src={nonePaper}
              alt={formatMessage(messages.ConcatManage)}
            />
            <div className={styles['empty-text']}>{formatMessage(messages.ConcatManage)}</div>
          </div>
        )}
        {camplusLists.length > 0 ? (
          <Modal
            title=""
            centered
            visible={visible}
            onOk={this.okModal}
            onCancel={this.hideModal}
            width={440}
            closable={false}
            okText={formatMessage(messages.ConfirmAdd)}
            cancelText={formatMessage(messages.NoAdd)}
            className="addCamplus"
          >
            <div>
              <img className="top_img" src={newSchool} alt="" />
            </div>
            <p className={styles.f16}>{formatMessage(messages.InviteAdd)}</p>
            <p className={styles.f24}>{camplusLists[0].campusName}</p>
          </Modal>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default Home;
