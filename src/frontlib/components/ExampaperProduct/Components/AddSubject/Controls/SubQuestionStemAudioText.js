/**
 * @Author    tina
 * @DateTime  2018-10-22
 * @copyright 小题题干音频文本控件
 */
import React, { Component } from 'react';
import { Input,Button,Form } from 'antd';
import './index.less';
const { TextArea } = Input;
import IconButton from '../../../../IconButton';
import TextareaClearData from './TextareaClearData';
import { formatMessage,FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
class SubQuestionStemAudioText extends Component {
  constructor(props) {
    super(props);
    const{showData,index2,subIndex} = this.props;     
    const mainIndex=index2=='all'?'1':index2
    this.state = {
      visible: true,
      stemAudioTextData:showData?(showData.data.patternType!="COMPLEX"?showData.data.subQuestion[subIndex].subQuestionStemAudioText:showData.data.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudioText):'',
    };
  }
  componentDidMount() {
    const { data,showData,index2,subIndex} = this.props;
     //渲染数据
     const mainIndex=index2=='all'?'1':index2;
     const editData = showData&&showData.data;
     var stemAudioTextData='';
     if(editData&&editData.patternType!="COMPLEX"&&editData.subQuestion[subIndex].subQuestionStemAudioText) {   
            stemAudioTextData=editData.subQuestion[subIndex].subQuestionStemAudioText;
        }
    else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {   
          
           stemAudioTextData=editData.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudioText;
        } 
        this.props.saveSubStemAudioTextModal(stemAudioTextData,subIndex,mainIndex)  
      if(data.params.input=='COPY') {
        const { subIndex } = this.props;
          //音频原文 此copy时音频原来的数据复制 短文内容的数据
          this.props.saveSubCopyStemAudioText(true,subIndex,mainIndex)
      }
  }
  saveStemAudioText=(value)=>{
    const { data,subIndex,index2} = this.props;
    const mainIndex=index2=='all'?'1':index2;
    this.setState({
      stemAudioTextData:value
    })
    if(data.params.input=='COPY') {
        //音频原文 此copy时音频原来的数据复制 短文内容的数据
        this.props.saveSubCopyStemAudioText(true,subIndex,mainIndex)
    } else {
      this.props.saveSubCopyStemAudioText(false,subIndex,mainIndex)
    }    
    this.props.saveSubStemAudioTextModal(value,subIndex,mainIndex)
}
  render() {
    const { data,form,subIndex,index2 } = this.props;
    const { getFieldDecorator } = form;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.label}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon" style={{display:(data.params.input=='COPY'?'none':'block')}}>
       {data.params.input!='COPY'&&<FormItem label={data.params.label}>
                {getFieldDecorator('subQuestionStemAudioText'+subIndex+index2, {
                  initialValue: this.state.stemAudioTextData,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipInput }],
                })(
                  <TextareaClearData initvalue={this.state.stemAudioTextData} 
                  saveClear={(value)=>this.props.saveClearTrue(value)}
                  onChange={(value)=>this.saveStemAudioText(value)} textlabel={data.params.label} autocleaning={data.params.autoCleaning}/> 
                )}
              </FormItem>}
        
                     
      </div>
    );
  }
}

export default SubQuestionStemAudioText;
