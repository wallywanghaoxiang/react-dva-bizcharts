/*
 * @Author    tina.zhang
 * @Date      2019-5-6
 * @copyright 教师答案详情
 */
import React, { Component, PureComponent } from 'react';
import router from 'umi/router';
import { Card, Tabs, Button, Message, Select, Anchor } from 'antd';
import { connect } from 'dva';
import './index.less';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import MenuLeft from './MenuLeft';
import ReportRight from './ReportRight';
import {assemblyData,getLinkList,scrollTo} from '../utils'
import emitter from '@/utils/ev';
import {OptionDisturb,sequenceDisrupted} from '@/frontlib/utils/utils';
import Dimensions from 'react-dimensions';

@connect(({ report,permission }) => ({
  showData: report.showData,
  paperData: report.paperData,
  teacherPaperInfo: report.teacherPaperInfo,
  studentAnswer: report.studentAnswer,
  //! TODO 是否有权限查看学生报告答案解析权限
  V_ANSWER_ANALYSIS: permission.V_ANSWER_ANALYSIS
}))
class PaperReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      paperList: [],//用于显示左侧选择内容
      linkList:[],//用于存储试卷的题号link
      onLoad: true,
      visible:false,
    };
  }

  componentDidMount() {
    const{paperId,classId}=this.props
   // console.log("props",this.props);
    this.loadPaperData(paperId);//获取试卷快照
    this.eventEmitter = emitter.addListener('teacherScroll', (data) => {
      let a=data.split("-")
      this.changeFocusIndex(Number(a[2]),Number(a[0]),Number(a[1]),a[3],false);
    });
  }
  componentWillReceiveProps(nextProps){
    const{paperId,classId,taskId}=this.props
    if(paperId!=nextProps.paperId){
      this.loadPaperData(nextProps.paperId);//获取试卷快照
      this.setState({
        onLoad:true
      })
    }
    if(classId!=nextProps.classId){
      this.loadPaperInfo(nextProps.classId,paperId,taskId);//获取教师报告内容
      this.setState({
        onLoad:true
      })
    }
  }

  //组卷销毁时清空数据
  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onscroll=null;
    // dispatch({
    //   type: 'report/clearCache',
    //   payload: {},
    // });
  }


  // 加载试卷快照
  loadPaperData = (paperId) => {
    const { dispatch,taskId } = this.props;
    dispatch({
      type: 'report/getPaperSapshot',
      payload: {
        paperId:paperId ,
        taskId:taskId
      },
    }).then(e => {
      this.loadShowData(paperId);
    });
  };

  // 加载试卷结构
  loadShowData = (paperId) => {
    const { dispatch, paperData,studentId,classId,taskId,role} = this.props;
    let idList = '';
    for (let i in paperData.paperInstance) {
      if (
        !paperData.paperInstance[i].type ||
        (paperData.paperInstance[i].type != 'RECALL' &&
          paperData.paperInstance[i].type != 'SPLITTER')
      ) {
        idList = idList + ',' + paperData.paperInstance[i].pattern.questionPatternId;
      }
    }

    let idLists = {
      idList: idList.slice(1, idList.length),//去掉第一个逗号
    };
    dispatch({
      type: 'report/fetchPaperShowData',
      payload: idLists,
    }).then(() => {
      if(role){
        this.loadPaperInfo(classId,paperId,taskId);//获取教师报告内容
      }else{
        this.loadStudentAnswer(studentId,paperId,taskId);
      }
    });
  };

  //获取试卷详情
  loadPaperInfo = (classId,paperId,taskId) => {
    const { dispatch,paperData,showData} = this.props;
    dispatch({
      type: 'report/getTeacherPaperInfo',
      payload: {
        campusId:localStorage.campusId,
        taskId: taskId,
        classId: classId,
        paperId: paperId,
      },
    }).then(() => {
    //  console.log("teacherPaperInfo",this.props.teacherPaperInfo)
      let masterData=assemblyData(paperData,this.props.teacherPaperInfo,showData)
      let linkList=getLinkList(masterData);
      this.setState({
        onLoad: false,
        masterData: masterData ,
        linkList:linkList,
      });
    });
  }


  //加载学生试卷答案快照
  loadStudentAnswer = (studentId,paperId,taskId) => {
    const { dispatch,paperData,showData} = this.props;
    dispatch({
      type: 'report/getStudentAnswerReport',
      payload: {
        taskId: taskId,
        studentId: studentId,
        paperId: paperId
      }
    }).then(e => {
  //    console.log("studentAnswer",this.props.studentAnswer)
      let masterData=assemblyData(paperData,this.props.studentAnswer,showData)
      let linkList=getLinkList(masterData);
      this.setState({
        onLoad: false,
        masterData: masterData ,
        linkList:linkList,
      });
    });
  };

  changeFocusIndex(item, mainIndex, questionIndex, type,linkid) {
    let newData;
    if(linkid){
      scrollTo(linkid);
    }
    newData = JSON.parse(JSON.stringify(this.state.masterData));
    newData.staticIndex.mainIndex = mainIndex;
    newData.staticIndex.questionIndex = questionIndex;
    if (type == 'TWO_LEVEL') {
      newData.staticIndex.subIndex = item;
    } else {
      delete newData.staticIndex.subIndex;
    }
     this.setState({ masterData: newData });
  }

  renderLeft(dom){
    const { taskInfo, paperData, showData,role,containerWidth } = this.props;
    const { masterData, onLoad,visible } = this.state;
    const { Link } = Anchor;

    if(visible){
      return  <div className="selectpaperDrawer">
                {dom?<Anchor offsetTop={100} getContainer={()=>dom} >
                        <MenuLeft
                          paperData={paperData}
                          masterData={masterData}
                          taskInfo={taskInfo}
                          self={this}
                          role={role}
                          paperList={this.state.paperList}
                          callback={(id) => this.loadPaperData(id)}
                        />
                  <div className="tag" onClick={this.onChangeLeft}>
                  <div>
                    <div>
                      <i className={'iconfont icon-link-arrow-left'} />
                    </div>
                    <div className="text">收起</div>
                  </div>
                </div>
                  </Anchor>
                  :
                  <Anchor offsetTop={160} >
                        <MenuLeft
                          paperData={paperData}
                          masterData={masterData}
                          taskInfo={taskInfo}
                          self={this}
                          role={role}
                          paperList={this.state.paperList}
                          callback={(id) => this.loadPaperData(id)}
                        />
                  <div className="tag" onClick={this.onChangeLeft}>
                  <div>
                    <div>
                      <i className={'iconfont icon-link-arrow-left'} />
                    </div>
                    <div className="text">收起</div>
                  </div>
                </div>
                </Anchor>}</div>
    }else{
      return  <div className="selectpaperDraweropen">
               {dom?<Anchor className="anchor" offsetTop={100} getContainer={()=>dom} >
                <div className="tag" onClick={this.onChangeLeft}>
                  <div>
                    <div>
                      <i className={'iconfont icon-link-arrow'} />
                    </div>
                    <div className="text">展开</div>
                  </div>
                </div>
                </Anchor>:
                <Anchor className="anchor" offsetTop={100} >
                <div className="tag" onClick={this.onChangeLeft}>
                  <div>
                    <div>
                      <i className={'iconfont icon-link-arrow'} />
                    </div>
                    <div className="text">展开</div>
                  </div>
                </div>
                </Anchor>}
              </div>
    }

  }

  onChangeLeft = () => {
    const {visible} =  this.state;

    this.setState({
      visible: !visible,
    });
  };


  render() {
    const { taskInfo, paperData, showData,role,containerWidth,V_ANSWER_ANALYSIS } = this.props;
    const { masterData, onLoad } = this.state;
    const { Link } = Anchor;
    let dom=false;
    if(document.getElementById('popWindow')){
      // 学生报告-modal弹窗
      dom=document.getElementById('popWindow').parentNode;
    }else if(window.IsExamClient == 'Exam'){
      // 考中 抽屉弹窗
      dom=document.getElementById('divReportOverview').parentNode.parentNode;
    }
     //console.log("dom",dom);
    //   console.log("paperData");
    // console.log(paperData);
    // console.log("showData");
    // console.log(showData);
    return (
        <div className="paperReport">
          {onLoad ?
            <NoData noneIcon={noneicon} tip="任务报告加载中，请稍等..." onLoad={onLoad} />
            :
            <Card bordered={false}>
              <div className="report">
                <div className="paperreport">
                  {Object.keys(masterData).length > 0 && dom?(
                    <div>{containerWidth <= 1366 ?this.renderLeft(dom):
                    <div className="flexLeft">
                      <Anchor offsetTop={60} getContainer={()=>dom} >
                        <MenuLeft
                          paperData={paperData}
                          masterData={masterData}
                          taskInfo={taskInfo}
                          self={this}
                          role={role}
                          paperList={this.state.paperList}
                          callback={(id) => this.loadPaperData(id)}
                        /></Anchor></div>}</div>
                  ):(
                    <div>
                    {containerWidth <= 1366 ?this.renderLeft(dom):
                    <div className="flexLeft">
                      <Anchor offsetTop={120} >
                        <MenuLeft
                          paperData={paperData}
                          masterData={masterData}
                          taskInfo={taskInfo}
                          self={this}
                          role={role}
                          paperList={this.state.paperList}
                          callback={(id) => this.loadPaperData(id)}
                        /></Anchor></div>
                      }</div>
                  )}
                  {Object.keys(showData).length > 0 && (
                    <ReportRight
                      key={this.props.classId}
                      showData={showData}
                      taskId={this.props.taskId}
                      paperId={this.props.paperId}
                      classNum = {this.props.classCount}
                      paperData={paperData}
                      teacherPaperInfo={this.props.teacherPaperInfo}
                      classId={this.props.classId}
                      exercise={this.props.exercise}
                      role={role}
                      V_ANSWER_ANALYSIS={V_ANSWER_ANALYSIS}
                      //V_ANSWER_ANALYSIS
                      />
                  )}
                </div>
              </div>
            </Card>}
        </div>
    );
  }
}

export default Dimensions({
  getHeight: function() {
    //element
    return window.innerHeight;
  },
  getWidth: function() {
    //element
    return window.innerWidth;
  },
})(PaperReport)
