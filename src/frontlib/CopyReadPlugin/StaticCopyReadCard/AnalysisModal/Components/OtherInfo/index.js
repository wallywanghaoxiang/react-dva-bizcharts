import React, { Component } from 'react';

import  './index.less';

import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import Item from 'antd/lib/list/Item';



/**
 * 示范音等其他信息
 */
class OtherInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      tokenId: "",
    };
  }

  componentDidMount() {

  }
  playingId = (Id) => {
    this.props.callback(Id)
  }

  renderAnswer(data){
      let jsx = data.subQuestion.map((Item,index)=>{
        return  <div>
                  <div className="titleName">{"句子" + (Number(index) + 1)}</div>
                  <div className="tipsName flex"><div className="tips">点拨</div><div className="tip2"></div>{Item.answerExplanation}</div>
                  {Item.answerValue ? <div className="titleName"><div className="dic"></div>我的朗读
                                        <AutoPlay token_id={Item.answerValue.tokenId} 
                                              focusId = {this.props.tokenId} 
                                              callback={this.playingId}/>
                                      </div>
                                    : <div className="titleName"><div className="dic"></div>我的朗读
                                        未答题
                                      </div>
                  }
                </div>
      })

      return jsx
  }

  render() {
    const{data}=this.props
    let answerValue = data.answerValue;
   return (   
    <div className="otherInfo1">
       {data.mainQuestion.stemAudio && 
       <div className="titleName"><div className="dic"></div>示范朗读
        <AutoPlay id={data.mainQuestion.stemAudio}
                  focusId = {this.props.tokenId}
                  callback={this.playingId}
                  focus ={true}
                  /></div>}
        {this.renderAnswer(data)}
    </div> 
    );
  }
}

export default OtherInfo;
