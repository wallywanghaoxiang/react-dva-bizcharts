/**
 * @Author    tina.zhang
 * @DateTime  2018-12-15
 * @copyright 解析字段
 */
import React, { Component } from 'react';
import { Input,Button,Form } from 'antd';
import './index.less';
const { TextArea } = Input;
import IconButton from '../../../../IconButton';
import TextareaClearData from './TextareaClearData';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  QuestionTips: {
    id: 'app.question.tips',
    defaultMessage: '点拨',
  },
  TODO_tips: {
    id: 'app.question.tips.tab',
    defaultMessage: '请输入解析内容!',
  }, 
});
const FormItem = Form.Item;
class AnswerExplanation extends Component {
  constructor(props) {
    super(props);
    const{showData,index2} = this.props;  
    const mainIndex=index2=='all'?'1':index2
    this.state = {
      visible: true,
      answerExplanation:"",
      //answerExplanation:showData?(showData.data.patternType!="COMPLEX"?showData.data.mainQuestion.answerExplanation:showData.data.groups[mainIndex].data.mainQuestion.answerExplanation):''
    };
  }
  componentDidMount() {
    const { showData,index2,subIndex} = this.props;
    console.log("subIndex");
    console.log(subIndex);
     //渲染数据
  
     const mainIndex=index2=='all'?'1':index2;
     const editData = showData&&showData.data;
     
    if(editData&&editData.patternType!="COMPLEX") {
      if(editData&&editData.patternType=="NORMAL"){
        this.setState({
          answerExplanation:editData.mainQuestion.answerExplanation//普通题型
      })
       }
       if(editData&&editData.patternType=="TWO_LEVEL"){
        this.setState({
          answerExplanation:editData.subQuestion[subIndex].answerExplanation//二层题型
      })
     }
   }
   if(editData&&editData.patternType=="COMPLEX") { 
    const childData =editData.groups[mainIndex].data;
    if(childData&&childData.patternType=="NORMAL"){
      this.setState({
        answerExplanation:childData.mainQuestion.answerExplanation//复合普通题型
       })
     }
     if(childData&&childData.patternType=="TWO_LEVEL"){
      this.setState({
        answerExplanation:childData.subQuestion[subIndex].answerExplanation//复合二层题型
    })
     }
  }

  }
  saveAnswerExplanation=(value)=>{
    console.log(value);
    const{showData,index,index2,subIndex} = this.props;  
    console.log("savesubIndex");
    console.log(subIndex);
    this.props.saveAnswerExplanation(value,subIndex,index2)
    this.setState({
      answerExplanation:value
      })
}
  render() { 
    const { data,form,subIndex,index2} = this.props;
    const { answerExplanation } = this.state;  
    const { getFieldDecorator } = form;
    return (
      <div className="demon" style={{display:'block'}}>
        
        {<FormItem label={formatMessage(messages.QuestionTips)}>
                {getFieldDecorator('answerExplanation'+index2+subIndex, {
                  initialValue: answerExplanation,
                  rules: [{ required:false, message: formatMessage({id:"app.placeholder.answerExplanation",defaultMessage:"请输入解析内容!"}) }],
                })(
                  <TextareaClearData initvalue={answerExplanation} onChange={(value)=>this.saveAnswerExplanation(value)} autocleaning={false} min={true} saveClear={(value)=>this.props.saveClearTrue(value)}/>              
                )}
          </FormItem>}
      </div>
    );
  }
}

export default AnswerExplanation;
