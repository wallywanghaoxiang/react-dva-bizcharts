/**
 * @Author    tina
 * @DateTime  2018-11-22
 * @copyright 7.2.15	提问方式控件（chooseModeSelectControl）
 */
import React, { Component } from 'react';
import { Input,Radio,Form} from 'antd';
const RadioGroup = Radio.Group;
import './index.less';
import {queryAskAnswerSection} from '@/services/api';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  AssessmentEngine1: {
    id: 'app.assessment.engine1',
    defaultMessage: '提问方式',
  },
  AssessmentEngine2: {
    id: 'app.assessment.engine2',
    defaultMessage: '文字+音频提问',
  },
  AssessmentEngine3: {
    id: 'app.assessment.engine3',
    defaultMessage: '文字提问',
  },
  AssessmentEngine4: {
    id: 'app.assessment.engine4',
    defaultMessage: '音频提问',
  },
});
const FormItem = Form.Item;
class ChooseModeSelectControl extends Component {
  constructor(props) {
    super(props);
    const { data,subIndex,index2} = this.props;
    const { patternType,showData } = this.props;   
    let askAnswerSection=''  
   //渲染数据     
   const editData = showData&&showData.data 
   const mainIndex=index2=='all'?'1':index2;

  if(editData&&editData.patternType=="TWO_LEVEL") {   
      const subQuestionInfo =editData.subQuestion[subIndex];
        if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
            askAnswerSection='1';
        } 
        else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                askAnswerSection='2';
            }
        else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
            askAnswerSection='3';
        } else {
            askAnswerSection='1';
        }
        
  }
  else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) { 
      if(editData.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editData.groups[mainIndex].data.subQuestion[subIndex]) {   
        const subQuestionInfo=editData.groups[index2].data.subQuestion[subIndex]   
        if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
            askAnswerSection='1';
        } 
        else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                askAnswerSection='2';
            }
        else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
            askAnswerSection='3';
        } else {
            askAnswerSection='1';
        }      
      }     
    }
    this.state = {
      visible: true,  
      askAnswerSection:askAnswerSection?askAnswerSection:'1'
    };
  }

  componentDidMount() {
    const { subIndex,index2} = this.props;
    this.props.saveSubAskAnswer(this.state.askAnswerSection,subIndex,index2);
  } 
  //答题方式
  selectSort=(e)=>{
      this.setState({
            askAnswerSection:e.target.value
        })
    const { subIndex,index2} = this.props;
    this.props.saveSubAskAnswer(e.target.value,subIndex,index2)
  }
 
  render() {
    const { data,subIndex,index2} = this.props;
    const { askAnswerSection } = this.state; 
    return (
        <div className="demon">   
       <h1><span>*</span>提问方式</h1>
       <RadioGroup className="answerOption" onChange={this.selectSort} defaultValue={askAnswerSection}>           
            <Radio value={'1'} key={'1'+subIndex+index2}>{formatMessage({id:"app.text.askAnswerSection_a",defaultMessage:"文字+音频提问"})}</Radio> 
            <Radio value={'2'} key={'2'+subIndex+index2}>{formatMessage({id:"app.text.askAnswerSection_b",defaultMessage:"文字提问"})}</Radio> 
            <Radio value={'3'} key={'3'+subIndex+index2}>{formatMessage({id:"app.text.askAnswerSection_c",defaultMessage:"音频提问"})}</Radio>             
        </RadioGroup>
      </div>
    );
  }
}

export default ChooseModeSelectControl;
