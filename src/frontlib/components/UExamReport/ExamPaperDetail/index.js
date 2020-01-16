/*
 * @Author    tina.zhang
 * @Date      2019-8-22
 * @copyright 统考报告页-答题详情
 */
import React, { Component } from 'react';
import { Card, Affix, BackTop } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
// eslint-disable-next-line import/no-extraneous-dependencies
import Dimensions from 'react-dimensions';
import {
  assemblyData,
  getLinkList,
  scrollTo,
} from '@/frontlib/components/MissionReport/Components/utils';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import emitter from '@/utils/ev';
import NoData from '@/components/NoData/index';
import MenuLeft from './MenuLeft';
import ReportRight from './ReportRight';
import ReportFilter from '../Components/ReportFilter/index';
import constant from '../constant';
import './index.less';

const { SYS_TYPE, FULL_CLASS_ID } = constant;

@connect(({ uexamReport }) => ({
  showData: uexamReport.showData,
  paperData: uexamReport.paperData,
  teacherPaperInfo: uexamReport.teacherPaperInfo,
  taskInfo: uexamReport.taskInfo, // 任务总览
  // studentAnswer: uexamReport.studentAnswer,
}))
class ExamPaperDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      paperList: [], // 用于显示左侧选择内容
      // linkList: [],
      onLoad: true,
      visible: false,
      defaultPaperId: '', // 默认选择的试卷ID
      hoverBacktop: false, // 返回顶部 hover 状态
      backTopRightStyle: null, // 返回顶部按钮style
    };
    this.paperId = '';
    this.classId = FULL_CLASS_ID;
    this.minWindowWith = 1400; // 浏览器宽度
  }

  componentDidMount() {
    const { type, taskInfo } = this.props;
    if (!taskInfo || !taskInfo.paperList || !taskInfo.paperList[0].paperId) {
      return;
    }

    if (type === SYS_TYPE.CLASS) {
      this.classId = taskInfo.classList[0].classId; // 获取第一个班级ID
    }

    for (let i = 0; i < taskInfo.paperList.length; i += 1) {
      if (taskInfo.paperList[i].examNum > 0) {
        this.paperId = taskInfo.paperList[i].paperId;
        this.setState({
          defaultPaperId: this.paperId,
        });
        break;
      }
    }
    if (!this.paperId) {
      return;
    }
    this.loadPaperData(this.paperId); // 获取试卷快照
    this.eventEmitter = emitter.addListener('teacherScroll', data => {
      const a = data.split('-');
      this.changeFocusIndex(Number(a[2]), Number(a[0]), Number(a[1]), a[3], false);
    });

    // 监听 resize
    window.addEventListener('resize', this.getBacktopRight);
    window.addEventListener('scroll', this.getBacktopRight);
  }

  // 组卷销毁时清空数据
  componentWillUnmount() {
    // const { dispatch } = this.props;
    window.onscroll = null;
    // dispatch({
    //   type: 'report/clearCache',
    //   payload: {},
    // });
    window.removeEventListener('resize', this.getBacktopRight);
    window.removeEventListener('scroll', this.getBacktopRight);
  }

  // 加载试卷快照
  loadPaperData = paperId => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'uexamReport/getPaperSapshot',
      payload: {
        paperId,
        taskId,
      },
    }).then(() => {
      this.loadShowData(paperId);
    });
  };

  // 加载试卷结构
  loadShowData = paperId => {
    const { dispatch, paperData, taskId } = this.props;
    let idList = '';
    Object.keys(paperData.paperInstance).forEach(key => {
      if (
        !paperData.paperInstance[key].type ||
        (paperData.paperInstance[key].type !== 'RECALL' &&
          paperData.paperInstance[key].type !== 'SPLITTER')
      ) {
        idList = `${idList},${paperData.paperInstance[key].pattern.questionPatternId}`;
      }
    });

    const idLists = {
      idList: idList.slice(1, idList.length), // 去掉第一个逗号
    };
    dispatch({
      type: 'uexamReport/fetchPaperShowData',
      payload: idLists,
    }).then(() => {
      this.loadPaperInfo(this.classId, paperId, taskId); // 获取教师报告内容
    });
  };

  // 获取试卷详情
  loadPaperInfo = (classId, paperId, taskId) => {
    const { dispatch, paperData, showData, type } = this.props;
    dispatch({
      type: 'uexamReport/getTeacherPaperInfo',
      payload: {
        campusId: type === SYS_TYPE.UEXAM ? 'FULL' : localStorage.getItem('campusId'),
        taskId,
        classId,
        paperId,
      },
    }).then(() => {
      //  console.log("teacherPaperInfo",this.props.teacherPaperInfo)
      // eslint-disable-next-line react/destructuring-assignment
      const masterData = assemblyData(paperData, this.props.teacherPaperInfo, showData);
      getLinkList(masterData);
      this.setState({
        onLoad: false,
        masterData,
        //  linkList,
      });
    });
  };

  onChangeLeft = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  handlePaperChanged = e => {
    this.paperId = e;
    this.loadPaperData(e); // 获取试卷快照
    this.setState({
      onLoad: true,
    });
  };

  handleClassChanged = e => {
    const { taskId } = this.props;
    this.classId = e || FULL_CLASS_ID;
    this.loadPaperInfo(this.classId, this.paperId, taskId); // 获取教师报告内容
    this.setState({
      onLoad: true,
    });
  };

  changeFocusIndex = (item, mainIndex, questionIndex, type, linkid) => {
    const { masterData } = this.state;
    if (linkid) {
      scrollTo(linkid);
    }
    const newData = JSON.parse(JSON.stringify(masterData));
    newData.staticIndex.mainIndex = mainIndex;
    newData.staticIndex.questionIndex = questionIndex;
    if (type === 'TWO_LEVEL') {
      newData.staticIndex.subIndex = item;
    } else {
      delete newData.staticIndex.subIndex;
    }
    this.setState({ masterData: newData });
  };

  // backtop hover 事件
  handleMouseHover = hover => {
    this.setState({
      hoverBacktop: hover,
    });
  };

  getBacktopTarget = () => {
    const { type } = this.props;
    let backTopTarget = window;
    const popWindow = document.getElementById('popWindow');
    if (popWindow) {
      backTopTarget = popWindow.parentNode;
    } else if (type === SYS_TYPE.UEXAM) {
      backTopTarget = document.getElementById('divReportOverview').parentNode.parentNode;
    }
    return backTopTarget;
  };

  getBacktopRight = () => {
    const windowWith = window.innerWidth;
    if (windowWith > this.minWindowWith) {
      const rightFlexLeft = document.getElementsByClassName('flexLeft').length > 0 ? 205 : 0;
      const rightCardWidth = 846;
      const reportLeft = document.getElementById('divReportOverview').offsetLeft + 24;
      let rightContainerWidth = 0;
      const reportRight = document.getElementsByClassName('reportRight');
      if (reportRight.length > 0) {
        rightContainerWidth = reportRight[0].clientWidth + 44;
      }
      const left =
        reportLeft +
        rightFlexLeft +
        rightContainerWidth -
        (rightContainerWidth - rightCardWidth) / 2 +
        40 +
        20;
      this.setState({
        backTopRightStyle: {
          right: windowWith - left - 40,
        },
      });
      return;
    }
    this.setState({
      backTopRightStyle: null,
    });
  };

  renderLeft(dom) {
    const { taskInfo, paperData, role } = this.props;
    const { masterData, paperList, visible } = this.state;

    if (visible) {
      return (
        <div className="selectpaperDrawer">
          {dom ? (
            <Affix offsetTop={64} target={() => dom}>
              <MenuLeft
                paperData={paperData}
                masterData={masterData}
                taskInfo={taskInfo}
                self={this}
                role={role}
                paperList={paperList}
                callback={id => this.loadPaperData(id)}
              />
              <div className="tag" onClick={this.onChangeLeft}>
                <div>
                  <div>
                    <i className="iconfont icon-link-arrow-left" />
                  </div>
                  <div className="text">
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.check.btn.title1',
                      defaultMessage: '收起',
                    })}
                  </div>
                </div>
              </div>
            </Affix>
          ) : (
            <Affix offsetTop={64}>
              <MenuLeft
                paperData={paperData}
                masterData={masterData}
                taskInfo={taskInfo}
                self={this}
                role={role}
                paperList={paperList}
                callback={id => this.loadPaperData(id)}
              />
              <div className="tag" onClick={this.onChangeLeft}>
                <div>
                  <div>
                    <i className="iconfont icon-link-arrow-left" />
                  </div>
                  <div className="text">
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.check.btn.title1',
                      defaultMessage: '收起',
                    })}
                  </div>
                </div>
              </div>
            </Affix>
          )}
        </div>
      );
      // eslint-disable-next-line no-else-return
    } else {
      return (
        <div className="selectpaperDraweropen">
          {dom ? (
            <Affix className="anchor" offsetTop={100} target={() => dom}>
              <div className="tag" onClick={this.onChangeLeft}>
                <div>
                  <div>
                    <i className="iconfont icon-link-arrow" />
                  </div>
                  <div className="text">
                    {formatMessage({ id: 'app.button.exam.open.title', defaultMessage: '展开' })}
                  </div>
                </div>
              </div>
            </Affix>
          ) : (
            <Affix className="anchor" offsetTop={100}>
              <div className="tag" onClick={this.onChangeLeft}>
                <div>
                  <div>
                    <i className="iconfont icon-link-arrow" />
                  </div>
                  <div className="text">
                    {formatMessage({ id: 'app.button.exam.open.title', defaultMessage: '展开' })}
                  </div>
                </div>
              </div>
            </Affix>
          )}
        </div>
      );
    }
  }

  render() {
    const {
      taskInfo,
      paperData,
      showData,
      role,
      containerWidth,
      type,
      classId,
      taskId,
      paperId,
      classCount,
      teacherPaperInfo,
      exercise,
    } = this.props;
    const {
      masterData,
      onLoad,
      paperList,
      defaultPaperId,
      hoverBacktop,
      backTopRightStyle,
    } = this.state;
    let dom = false;
    if (document.getElementById('popWindow')) {
      dom = document.getElementById('popWindow').parentNode;
    } else if (window.IsExamClient === 'Exam') {
      dom = document.getElementById('divReportOverview').parentNode.parentNode;
    }
    // console.log("dom",dom);
    // console.log("paperData");
    // console.log(paperData);
    // console.log("showData");
    // console.log(showData);
    return (
      <div className="uexamPaperReport">
        {taskInfo && defaultPaperId && (
          <>
            <ReportFilter
              type={type}
              showFullPaperOption={false}
              paperList={taskInfo.paperList}
              classList={
                type === SYS_TYPE.UEXAM || taskInfo.classList.length === 1
                  ? null
                  : taskInfo.classList
              }
              examNum={taskInfo.examNum}
              hiddenFullClassOption={type !== SYS_TYPE.CAMPUS}
              onPaperChanged={this.handlePaperChanged}
              onClassChanged={this.handleClassChanged}
              defaultPaperId={defaultPaperId}
            />
          </>
        )}
        {onLoad ? (
          <NoData noneIcon={noneicon} tip="任务报告加载中，请稍等..." onLoad={onLoad} />
        ) : (
          <Card bordered={false}>
            <div className="report">
              <div className="paperreport">
                {Object.keys(masterData).length > 0 && dom ? (
                  <div>
                    {containerWidth <= this.minWindowWith ? (
                      this.renderLeft(dom)
                    ) : (
                      <div className="flexLeft">
                        <Affix offsetTop={64} target={() => dom}>
                          <MenuLeft
                            paperData={paperData}
                            masterData={masterData}
                            taskInfo={taskInfo}
                            self={this}
                            role={role}
                            paperList={paperList}
                            callback={id => this.loadPaperData(id)}
                          />
                        </Affix>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {containerWidth <= this.minWindowWith ? (
                      this.renderLeft(dom)
                    ) : (
                      <div className="flexLeft">
                        <Affix offsetTop={64}>
                          <MenuLeft
                            paperData={paperData}
                            masterData={masterData}
                            taskInfo={taskInfo}
                            self={this}
                            role={role}
                            paperList={paperList}
                            callback={id => this.loadPaperData(id)}
                          />
                        </Affix>
                      </div>
                    )}
                  </div>
                )}
                {Object.keys(showData).length > 0 && (
                  <ReportRight
                    key={classId}
                    showData={showData}
                    taskId={taskId}
                    paperId={paperId}
                    classNum={classCount}
                    paperData={paperData}
                    teacherPaperInfo={teacherPaperInfo}
                    classId={classId}
                    exercise={exercise}
                    role={role}
                  />
                )}
              </div>
            </div>
          </Card>
        )}

        <BackTop
          style={backTopRightStyle}
          visibilityHeight={50}
          target={() => this.getBacktopTarget()}
        >
          <div
            className="backtop"
            onMouseEnter={() => this.handleMouseHover(true)}
            onMouseLeave={() => this.handleMouseHover(false)}
          >
            {!hoverBacktop && <i className="iconfont icon-top" />}
            {hoverBacktop && (
              <span className="text">
                {formatMessage({ id: 'app.text.report.backtop', defaultMessage: '顶部' })}
              </span>
            )}
          </div>
        </BackTop>
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
})(ExamPaperDetail);
