import React, { Component } from 'react';
import { Modal, messag, Tabs } from 'antd';
import  './index.less';
import styles from './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import {PluginEvaluateStr} from '@/frontlib/CopyReadPlugin/utils';


/**
 * 四位得分和评价
 */
class Evaluate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      tokenId: "",
    };
    this.scoreCn=["差","差","中","良","优"];
  }

  componentDidMount() {

  }

  showResult(){
    const{resultJson,normal}=this.props
    let item=["integrity","pronunciation","fluency","rhythm"];
    let name=["完整度","发音得分","流利度","韵律度"];
    let html=[];
    if(resultJson){
        item.map((i,index)=>{
            if(resultJson.result[i]!= undefined){
              html.push(
                <div >
                {normal?(<div className="itmesbig"><div className={"cnbig score"+resultJson.result[i].score}>{this.scoreCn[resultJson.result[i].score]}</div>
                  <div className={"wordbig"}>{name[index]}</div></div>)
                  :(<div className="itmessmall"><div className={"wordsmall"}>{name[index]+":"}</div>
                  <div className={"cnsmall score"+resultJson.result[i].score}>{this.scoreCn[resultJson.result[i].score]}</div>
                  </div>)}
                </div>)
            }
          })
    }
    return html;
  }

  render() {
    const{normal,resultJson}=this.props
    return (
       <div className="evaluate1">
          <div className={normal?"evaluateScoreBig":"evaluateScoreSmall"}>
            {this.showResult()}
          </div>
          <div className="evaluateInfo">
            <div className="title">评价：</div>
            <div className="content">{PluginEvaluateStr(resultJson)}</div>
          </div>
          {/* <div className="evaluateInfo">
            <div className="title">评价：</div>
            <div className="content">你的整体表现还行！能读出主要的句子和单词，但朗读不够连贯，发音清晰准确，饱满且地道，朗读节奏感需加强，重读单词还需抓准，升降调需要努力把握。</div>
          </div>         */}
       </div>
      
    );
  }
}

export default Evaluate;
