import React, { PureComponent } from 'react';
import QuestionShowCard from "../Components/QuestionShowCard"
import endLogo from '@/frontlib/assets/logo_foot_dark.png';
import './index.less';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  paperAnalysisTit:{id:'app.paper.analysis.separator.txt',defaultMessage:'试卷解析'},
});

/**
 *整卷报告组件
 *
 * @author tina.zhang
 * @date 2018-12-20
 * @export
 * @class DetailPage
 * @extends {PureComponent}
 */
export default class DetailPage extends PureComponent {
  constructor(props) {
    super(props);
    this.subScoreData;
    this.state = {
      isShow:false,
      masterData:{
        questionIndex:"",
        subIndex:0,
        id:"",
      }
    };

  }

  componentDidMount() {

  }

  //用于控制跨showCard之间只有一个音频能播放
  changeId(id){
    this.setState({ id: id });
  }

  /**
   *获取每道题目的总分
   *
   * @author tina.zhang
   * @date 2018-12-28
   * @param {*} mainIndex
   * @param {*} subIndex
   * @param {*} type
   * @returns
   * @memberof DetailPage
   */
  getSubFallMark(mainIndex,subIndex,type){
    const { paperData } = this.props;
    let data=paperData.paperInstance[mainIndex].pattern;
    let subFallMark=-1;
    switch(type){
      case "NORMAL":
        subFallMark=data.mainPatterns.questionMark;
      break;
      case "TWO_LEVEL":
        subFallMark=data.subQuestionPatterns[subIndex].subQuestionMark==0?data.mainPatterns.subQuestionMark:data.subQuestionPatterns[subIndex].subQuestionMark;
      break;
      case"COMPLEX":
         if(paperData.paperInstance[mainIndex].questions[0].data.groups[subIndex].data.mainQuestion.answerType!="GAP_FILLING"){
          subFallMark=data.groups[subIndex].pattern.mainPatterns.questionMark!=0?data.groups[subIndex].pattern.mainPatterns.questionMark:data.groups[subIndex].pattern.mainPatterns.subQuestionMark;
         }else{
          subFallMark=data.groups[subIndex].pattern.mainPatterns.fullMark;
         }
      break;
      default:
      break;
    }
    return subFallMark;
  }


  /**
   *计算每道小题的起始序号，小题按1开始依次起算
   *
   * @author tina.zhang
   * @date 2018-12-28
   * @param {*} mainIndex
   * @param {*} subIndex
   * @param {*} type
   * @returns
   * @memberof DetailPage
   */
  getSubStartNum(mainIndex,subIndex,type){
    const { paperData } = this.props;
    let data=paperData.paperInstance[mainIndex].questions;
    let num=0;
    if(!data){
      return
    }
    if(type=="NORMAL"){
      return subIndex;
    }
    if(subIndex>0){
      for(let i=subIndex-1;i>=0;i--){
        switch(type){
          case "TWO_LEVEL":
           if(data[i]&&data[i].data.subQuestion){
             num=num+data[i].data.subQuestion.length;
           }else{
             num=num+1;
           }
          break;
          case"COMPLEX":
            if(data[0].data.groups[i].data.subQuestion){
              num=num+data[0].data.groups[i].data.subQuestion.length;
            }else{
              num=num+1;
            }
          break;
          default:
          break;
        }
      }
    }
    return num;
  }


  render() {
    const { paperData, showData, } = this.props;
    const{id}=this.state;
    let sub=[];
    let type="";
    paperData.paperInstance.map((Item,index)=>{
      if(!Item.type||(Item.type!="RECALL"&&Item.type!="SPLITTER")){
      type=Item.pattern.questionPatternType;
      if("COMPLEX"!=type){
        Item.questions.map((Item1,index1)=>{
          if(Item1){
            sub.push(
              <div className="card" key={String(index1)}>
                <QuestionShowCard
                dataSource={Item1}
                showData={showData[Item1.questionPatternId]}
                titleData={Item.pattern}
                paperInstance={paperData.paperInstance}
                type={type}
                subStartIndex={this.getSubStartNum(index,index1,type)}
                key={Item1.questionPatternId+index1}
                subFallMark={this.getSubFallMark(index,index1,type)}
                patternType={type}
                mainIndex = {index}
                questionIndex = {index1}
                self = {this}
                focus = {true}
                id={id}
                />
              </div>
            )
          }
        })
      }else{
        for(let i in Item.pattern.groups){
          if(Item.questions[0]){
            sub.push(
              <div className="card" key={String(i)}>
              <QuestionShowCard
                dataSource={Item.questions[0]}
                //showData={showData[Item.questions[0].questionPatternId]}
                showData={showData[Item.pattern.questionPatternId]}
                titleData={Item.pattern}
                paperInstance={paperData.paperInstance}
                questionIndex={i}
                subFallMark={this.getSubFallMark(index,i,type)}
                type={type}
                subStartIndex={this.getSubStartNum(index,i,type)}
                mainIndex = {index}
                patternType={type}
                key={Item.questions[0].questionPatternId+i}
                self = {this}
                focus = {true}
                id={id}
                />
              </div>
            )
          }

        }
      }
    }
    })

      return (
        <div className="DetailPage">
             <div className="midline">
                <div className="leftline"></div>
                <div className="word"><FormattedMessage {...messages.paperAnalysisTit} /></div>
                <div className="rightline"></div>
             </div>
             {sub}
             <div className="end">
                <img className="endlogo" src={endLogo} alt="logo" />
             </div>
        </div>
      );

  }
}
