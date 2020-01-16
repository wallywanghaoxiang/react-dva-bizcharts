/*
 * @Author    tina
 * @Date      2019-6-28
 * @copyright 人工纠偏
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage} from 'umi/locale';
import classNames from 'classnames';
import styles from './index.less';
import {assemblyData} from './utils'
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import DetailPage from './DetailPage';
import NoData from '@/components/NoData/index';

@connect(({ correction }) => ({
  showData: correction.showData,
  paperData: correction.paperData,
  teacherPaperInfo: correction.teacherPaperInfo,
  checkedID:correction.checkedID,
  subQuestions:correction.subQuestions,
  checkClassId:correction.checkClassId
}))
class ArtificialCorrect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      subScoreData:'',
      onLoad: true
    };
  }

  componentDidMount() {
    const{paperId}=this.props
 
    this.loadPaperData(paperId);// 获取试卷快照
    
 
  }

  componentWillReceiveProps(nextProps){
    const{paperId,checkedID,taskId}=this.props
    if(checkedID!==nextProps.checkedID){
      this.loadPaperData(nextProps.paperId);// 获取试卷快照
      this.setState({
        onLoad:true
      })
    }
  
  }

  // 组卷销毁时清空数据
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
      type: 'correction/getPaperSapshot',
      payload: {
        paperId,
        taskId
      },
      callback:(res)=>{
          console.log(res)
        if(res.paperInstance.length>0) {
            this.loadShowData(paperId,res);
        }
      }
    })
  };

  // 加载试卷结构
  loadShowData = (paperId,paperData) => {
    const { dispatch,studentId,classId,taskId,role} = this.props;
    let idList = '';
    console.log(paperData)
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
    console.log(paperId,idList)
    dispatch({
      type: 'correction/fetchPaperShowData',
      payload: idLists,
    }).then(() => {
      this.setState({
        onLoad: false
      });
    });
  };







  render() {
    const { paperData, showData,role,taskId,paperId,classId,classNum,subQuestions,checkedID,checkClassId } = this.props;
    const { subScoreData,onLoad } = this.state;

   
    return (
      <div className={classNames(styles.paperReport, styles.ArtificialCorrection)}>
        {onLoad ?
          <NoData noneIcon={noneicon} tip={formatMessage({id:"app.text.paperLoading",defaultMessage:"试卷加载中，请稍等..."})} onLoad={onLoad} />
          :paperData&&paperData.id&&showData&&(JSON.stringify(showData) !== "{}")&&
          <DetailPage
            paperData={paperData}
            subScoreData={subScoreData}
            showData={showData}
            classNum={classNum}
            self={this}
            role={role}
            taskId={taskId} 
            paperId={paperId} 
            classId={classId}
            checkedID={checkedID}
            checkClassId={checkClassId}
            subQuestions={subQuestions}
          
          />}
        
      </div>
    );
  }
}
export default ArtificialCorrect;
