import React, { Component } from 'react';
import { Modal, messag, Tabs } from 'antd';
import  './index.less';
import { Button } from 'antd/lib/radio';
import StemImage from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemImage.js';
import AutoPlay from '../../../AutoPlay';
import StemVideo from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemVideo';
import StemVideoText from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemVideoText';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

/**
 * 题目题干等，包括图片视频和文字
 */
class SubjectTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      small:true,
    };
  }

  componentDidMount() {

  }
  onClick=()=>{
    this.setState({
      small:!this.state.small
    })

  }
  playingId = (Id) => {
    this.props.callback(Id)
  }

  render() {
    const{data,image,audio,audioText,callback,normal,top,pop}=this.props;
    return (
      <div className="subjectTitle">
      {pop&&(image||data.stemVideo)&&<div className={this.state.small?"pic picSmall":"pic"}>
          {image&&<StemImage
            id={image}
            className="stemImage_little"
          />}
          {data.stemVideo&&<div>
            {data.stemVideoText&&<StemVideoText
              text={data.stemVideoText}
              key={'Auto_' + data.stemVideo}
              isQuestionCard={true}
              style={{marginTop:'10px'}}
              callback={id => {
              }}
            />}
            <StemVideo
            id={data.stemVideo}
            key={data.stemVideo+"video"}
            style={{width: '440px'}}
          /></div>}
          </div>}
     {pop&&(image||data.stemVideo)?<div className="put"><div className={this.state.small?"img down":"img up"} onClick={this.onClick}>{this.state.small?formatMessage({id:"app.examination.report.currentexam.extended",defaultMessage:"展开"}):formatMessage({id:"app.examination.inspect.task.detail.check.btn.title1",defaultMessage:"收起"})}</div></div>:!normal&&!top&&<div className="line"></div>}
      {pop&&audio&&callback&& 
       <div className="titleName">
        <div className="dic"></div><span className="dix">{formatMessage({id:"app.text.ckyw",defaultMessage:"参考原文"})} </span>
        <AutoPlay id={audio}
                  focusId = {this.props.tokenId}
                  callback={this.playingId}
                  text={audioText}
                  focus ={true}
                  /></div>}
      </div>
    );
  }
}

export default SubjectTitle;
