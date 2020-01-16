/**
 * @Author    tina
 * @DateTime  2018-10-26
 * @copyright 7.2.14	切换问答选择控件
 */
import React, { Component } from 'react';
import { Input,Radio,Form} from 'antd';
const RadioGroup = Radio.Group;
import './index.less';
import {queryAskAnswerSection} from '@/services/api';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  AssessmentEngine5: {
    id: 'app.assessment.engine5',
    defaultMessage: '答题方式',
  },
});
const FormItem = Form.Item;
class SwapAskAnswerControl extends Component {
  constructor(props) {
    super(props);
    const { data,subIndex,index2} = this.props;
    const { patternType,showData } = this.props;   
    var askAnswerSection=''  
   //渲染数据     
   const editData = showData&&showData.data 
   const mainIndex=index2=='all'?'1':index2;
  if(editData&&editData.patternType=="NORMAL") {
    askAnswerSection=editData.mainQuestion.askAnswerSection 
  }
  else if(editData&&editData.patternType=="TWO_LEVEL") {   
        askAnswerSection=editData.subQuestion[subIndex].askAnswerSection
  }
  else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {  
    if(editData.groups[mainIndex].data.patternType=="NORMAL"&&editData.groups[mainIndex].data.mainQuestion.askAnswerSection!=null) { 
        askAnswerSection=editData.groups[mainIndex].data.mainQuestion.askAnswerSection
    }
      if(editData.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editData.groups[mainIndex].data.subQuestion[subIndex].askAnswerSection!=null) {   
        askAnswerSection=editData.groups[mainIndex].data.subQuestion[subIndex].askAnswerSection         
      }     
    }
    this.state = {
      visible: true,
      answers:[],    
      askAnswerSection:askAnswerSection?askAnswerSection:props.data.params.defaultValue
    };
  }

  componentDidMount() {
    const { data,subIndex,index2} = this.props;      
    queryAskAnswerSection().then((res)=> {
      this.props.saveSubAskAnswer(this.state.askAnswerSection,subIndex,index2)
        this.setState({
            answers:res.data
        })
        
    }).catch(err => {
      console.log(err);
    });
  } 
  //答题方式
  selectSort=(e)=>{
      this.setState({
            askAnswerSection:e.target.value
        })
    const { data,subIndex,index2} = this.props;
    this.props.saveSubAskAnswer(e.target.value,subIndex,index2)
  }
 
  render() {
    const { data,subIndex} = this.props;
    const { answers,askAnswerSection } = this.state; 
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
        <div className="demon">   
        {data.params.selectable=='Y'&&<h1><span>*</span>{formatMessage({id:"app.assessment.engine5",defaultMessage:"答题方式"})}</h1> }
       {data.params.selectable=='Y'&&<RadioGroup className="answerOption" onChange={this.selectSort} defaultValue={askAnswerSection}>
            {answers.length>0&&answers.map((item)=>{
                return <Radio value={item.code} key={item.id}>{item.value}</Radio> 
            })}                       
            </RadioGroup>}
      </div>
    );
  }
}

export default SwapAskAnswerControl;
