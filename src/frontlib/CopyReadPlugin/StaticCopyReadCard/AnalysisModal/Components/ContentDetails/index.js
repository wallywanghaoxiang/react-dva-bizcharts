import React, { Component } from 'react';
import { Modal, messag, Tabsm,Tooltip } from 'antd';
import  './index.less';
import LabelButton from '../LabelButton'



/**
 * 评分内容和细节多维度展示
 */
class ContentDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      html:[],
      taginfo:[],
      id:0,
      lablebutton:[],
    };
    this.info={
      "eval.word.en":"细节表现",
      "eval.sent.en":"拆句解词",
      "eval.para.en":"拆解段落",
    }
    //段落和句子评测的标签按钮，段落的index从1-2，句子是3-6
    this.lab=["无","漏词","句子表现","漏词","重读","停顿","升降调"]
  }
  
  componentDidMount() {
    this.defaultShow();
    
  }
  //显示分维度标签按钮
  showlab(){
    const{model}=this.props;
    let html=[];
    let index=0;
    let max=0;
    if(model=="eval.word.en")return;
    if(model=="eval.sent.en"){
      index=3;
      max=6
    }
    if(model=="eval.para.en"){
      index=1;
      max=2;
    }
    for(let i=index;i<=max;i++){
      html.push(
        <LabelButton
        name={this.lab[i]}
        callback={a=>this.onclick(a,i)}
        index={i}
        id={this.state.id}/>
      )
    }
    return html;
  }
  defaultShow(){
    const{model}=this.props;
    switch(model){
      case "eval.word.en":{
        this.showPhone();
        break;
      }
      case "eval.sent.en":{
        this.showSentword();
        break;
      }
      case "eval.para.en":{
        this.showWords();
        break;
      }
      default:break;
    }
  }

  //单词显示每个音素得分
  showPhone(){
    const{data}=this.props;
    let resultJson=data.answerValue
    //let resultJson=data;
    let cn=["差","差","中","良","优"];
    let html=[];
    if(resultJson&&resultJson.result&&resultJson.result.details){
      resultJson.result.details.map((Item,index)=>{
        if(Item.details){
          html.push(<span className={"words"}>{"["}</span>)
          Item.details.map((k)=>{
            html.push(<Tooltip title={cn[k.score]}><span className={"words phone score"+(k.score)}>{k.text}</span></Tooltip>)
          })
          html.push(<span className={"words"}>{"]"}</span>)
        }
      })
      this.setState({
        html:html,
      })
    }
  }
  //句子显示每个单词得分
  showSentword(){
    const{data}=this.props;
    let resultJson=data.answerValue
    //let resultJson=data;
   
    let html=[];
    let html2=[];
    let total=0;
    let num=[0,0,0,0,0]//分别代表优良中差的数量
    if(resultJson&&resultJson.result&&resultJson.result.details){
      resultJson.result.details.map((Item,index)=>{
        html.push(<span className={"words score"+(Item.score?Item.score:"")}>{Item.text}</span>)
        if(Item.score){
            num[Number(Item.score)]++;
        }
      })
      total=num[0]+num[1]+num[2]+num[3]+num[4];
      html2.push(<div className="flex"> <div className="ponit score4"></div>优<span className="percent">{(Math.round(num[4] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score3"></div>良<span className="percent">{(Math.round(num[3] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score2"></div>中<span className="percent">{(Math.round(num[2] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score1"></div>差<span className="percent">{(Math.round((num[1]+num[0]) / total * 10000) / 100.00)+"%"}</span></div>)
      this.setState({
        html:html,
        taginfo:html2,
      })
    }
  }
  //段落显示每个单词得分
  showWords(){
    const{data}=this.props;
    let resultJson=data.answerValue
    let html=[];
    let html2=[];
    let total=0;
    let num=[0,0,0,0,0]//分别代表优良中差的数量
    if(resultJson&&resultJson.result&&resultJson.result.details){
      resultJson.result.details.map((Item,index)=>{
        if(Item.details){
          Item.details.map((k)=>{
            html.push(<span className={"words score"+(k.score?k.score:"")}>{k.text}</span>)
            if(k.score){
              num[Number(k.score)]++;
            }
          })
        }
      })
      total=num[0]+num[1]+num[2]+num[3]+num[4];
      html2.push(<div className="flex"> <div className="ponit score4"></div>优<span className="percent">{(Math.round(num[4] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score3"></div>良<span className="percent">{(Math.round(num[3] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score2"></div>中<span className="percent">{(Math.round(num[2] / total * 10000) / 100.00)+"%"}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score1"></div>差<span className="percent">{(Math.round((num[1]+num[0]) / total * 10000) / 100.00)+"%"}</span></div>)
      this.setState({
        html:html,
        taginfo:html2,
      })
    }
  }
  //显示每个句子得分
  showSent(){
    const{data}=this.props;
    let resultJson=data.answerValue
    //let resultJson=data;
    let html=[];
    let html2=[];
    if(resultJson&&resultJson.result&&resultJson.result.details){
      resultJson.result.details.map((Item,index)=>{
        if(Item.details){
          Item.details.map((k)=>{
            if(k.score){
              html.push(<span className={"words sent"+(Item.score?Item.score:"")}>{k.text}</span>)
            }else{
              html.push(<span className={"words score sent"+(Item.score?Item.score:"")}>{k.text}</span>)
            }
          })
        }
      })
      this.setState({
        html:html,
        taginfo:html2,
      })
    }


  }
   //段落显示漏测
  showMiss(){
    const{data}=this.props;
    let resultJson=data.answerValue
    let html=[];
    let html2=[];
    let missNum=0;
    let total=0;
    if(resultJson&&resultJson.result&&resultJson.result.details){
      resultJson.result.details.map((Item,index)=>{
        if(Item.details){
          Item.details.map((k)=>{
            if(k.type!=7){
              total++;
            }
            if(k.type==1){
              html.push(<span className={"words score0"}>{k.text}</span>)
              missNum++;
            }else{
              html.push(<span className={"words "+(k.type==7?"score nomal":"nomal")}>{k.text}</span>)
            }
          })
        }
      })
      if(total>0){
        if(missNum==0){
          html2.push(<div className="tips">你很棒，没有漏词哦！</div>)
        }
        if(missNum==total){
          html2.push(<div className="tips">你还没读哦!</div>)
        }
      }
      
      this.setState({
        html:html,
        taginfo:html2,
      })
    }
  }
 //句子显示漏读
 showSentMiss(){
  const{data}=this.props;
  let resultJson=data
  let html=[];
  let html2=[];
  let missNum=0;
  let total=0;
  if(resultJson&&resultJson.result&&resultJson.result.details){
    resultJson.result.details.map((k,index)=>{
          if(k.type!=7){
            total++;
          }
          if(k.type==1){
            html.push(<span className={"words score0"}>{k.text}</span>)
            missNum++;
          }else{
            html.push(<span className={"words "+(k.type==7?"score nomal":"nomal")}>{k.text}</span>)
          }
    })
    if(total>0){
      if(missNum==0){
        html2.push(<div className="tips">你很棒，没有漏词哦！</div>)
      }
      if(missNum==total){
        html2.push(<div className="tips">你还没读哦!</div>)
      }
    }
    
    this.setState({
      html:html,
      taginfo:html2,
    })
  }
}
 //句子显示重读
 showSentStress(){
  const{data}=this.props;
  let resultJson=data
  let html=[];
  let html2=[];
  let stressNum=0;
  let total=0;
  if(resultJson&&resultJson.result&&resultJson.result.details){
    resultJson.result.details.map((k,index)=>{
          if(k.type!=7){
            total++;
          }
          if(k.stress==true){
            html.push(<span className={"words score"}><span className={"score1"}>{"'"}</span>{k.text}</span>)
            stressNum++;
          }else{
            html.push(<span className={"words "+(k.type==7?"score nomal":"nomal")}>{k.text}</span>)
          }
    })
    if(total>0){
      if(stressNum==0){
        html2.push(<div className="tips">你的朗读中没有重读哦！</div>)
      }
      if(stressNum==total){
        html2.push(<div className="tips">你的朗读全都重读了哦！!</div>)
      }
    }
    
    this.setState({
      html:html,
      taginfo:html2,
    })
  }
}
 //句子显示停顿
 showSentPause(){
  const{data}=this.props;
  let resultJson=data
  let html=[];
  let html2=[];
  let pauseNum=0;
  let total=0;
  if(resultJson&&resultJson.result&&resultJson.result.details){
    resultJson.result.details.map((k,index)=>{
          if(k.type!=7){
            total++;
          }
          if(k.pause==true){
            html.push(<span className={"words score"}><span className={"score1"}>{"|"}</span>{k.text}</span>)
            pauseNum++;
          }else{
            html.push(<span className={"words "+(k.type==7?"score nomal":"nomal")}>{k.text}</span>)
          }
    })
    if(total>0){
      if(pauseNum==0){
        html2.push(<div className="tips">你的朗读中没有重读哦！</div>)
      }
      if(pauseNum==total){
        html2.push(<div className="tips">你的朗读全都重读了哦！!</div>)
      }
    }
    this.setState({
      html:html,
      taginfo:html2,
    })
  }
}

 //句子显示升降调
 showSentTone(){
  const{data}=this.props;
  let resultJson=data
  let html=[];
  let tone=false;
  if(resultJson&&resultJson.result&&resultJson.result.details){
    resultJson.result.details.map((k,index)=>{
       html.push(<span className={"words "+(k.type==7?"score nomal":"nomal")}>{k.text}</span>)
       if(k.type!=7){
        tone=k.tone;
       }
    })
    html.push(<span><i className={tone?"iconfont score1 icon-rising-tune":"iconfont score1 icon-falling-tune"}/></span>)
    this.setState({
      html:html,
    })
  }
}
  onclick=(a,index)=>{
    if(a){
      this.setState({
        id:index
      })
      if(2==index){
        this.showSent()
      }
      if(1==index){
        this.showMiss()
      }
      if(3==index){
        this.showSentMiss()
      }
      if(4==index){
        this.showSentStress()
      }
      if(5==index){
        this.showSentPause()
      }
      if(6==index){
        this.showSentTone()
      }
    }else{
      this.setState({
        id:0
      })
      this.defaultShow();
    }

  }

  render() {
    const{taginfo,html,lablebutton}=this.state;
    const{normal,data,index,model}=this.props;
    return (
       <div className="contentDetails1">
          {normal?<div className="titleName"><div className="dic"></div>{this.info[model]}</div>:null}
          <div className="details">
            {normal?null:<div className="subIndex">{index}</div>}
              <div className="content">{html} </div>
            {normal?null: <div className="subScore"><span className="score">{data.receivePoints?data.receivePoints:0}</span>分</div>}
          </div>
          <div className="taginfo">
            {taginfo}
          </div>
          <div className="flex">
           {this.showlab()}
          </div>
        </div>
      
    );
  }
}

export default ContentDetails;
