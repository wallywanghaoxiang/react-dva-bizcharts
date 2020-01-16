/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright 音频原文
 */
import React, { Component } from 'react';
import { Input,Button,Form } from 'antd';
import './index.less';
const { TextArea } = Input;
import IconButton from '../../../../IconButton';
import TextareaClearData from './TextareaClearData';
import { formatMessage,FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
class StemAudioTextControl extends Component {
  constructor(props) {
    super(props);
    const{showData,index2} = this.props;  
    const mainIndex=index2=='all'?'1':index2
    this.state = {
      visible: true,
      stemAudioText:showData?(showData.data.patternType!="COMPLEX"?showData.data.mainQuestion.stemAudioText:showData.data.groups[mainIndex].data.mainQuestion.stemAudioText):''
    };
  }
  componentDidMount() {
    const { data,showData,index2,subIndex} = this.props;
     //渲染数据
     const mainIndex=index2=='all'?'1':index2;
     const editData = showData&&showData.data;
     var stemAudioTextData='';
     if(editData&&editData.patternType!="COMPLEX") {       
        this.setState({
        stemAudioText:editData.mainQuestion.stemAudioText
      })
      stemAudioTextData=editData.mainQuestion.stemAudioText
     }
      if(editData&&editData.patternType=="COMPLEX") { 
        const childData =editData.groups[mainIndex].data;
       this.setState({
        stemAudioText: childData.mainQuestion.stemAudioText
        })
        stemAudioTextData=childData.mainQuestion.stemAudioText
      }
      if(data.params.input=='COPY') {
          //音频原文 此copy时音频原来的数据复制 短文内容的数据
          this.props.saveCopyStemAudioText(true)
      }
      this.props.saveStemAudioTextModal(stemAudioTextData,index2)
  }
  saveStemAudioText=(value)=>{
    const {index2} = this.props;
    //渲染数据
    const mainIndex=index2=='all'?'1':index2;
    const { data} = this.props;
    if(data.params.input=='COPY') {
      //音频原文 此copy时音频原来的数据复制 短文内容的数据
      this.props.saveCopyStemAudioText(true)
   } else {
    this.props.saveCopyStemAudioText(false)
   }    
    this.props.saveStemAudioTextModal(value,index2)
    this.setState({
      stemAudioText:value
      })
}
  render() { 
    const { data,form,subIndex,index2} = this.props;
    const { stemAudioText } = this.state;  
    const { getFieldDecorator } = form;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.label}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon" style={{display:(data.params.input=='COPY'?'none':'block')}}>
        
        {data.params.input!='COPY'&&<FormItem label={data.params.label}>
                {getFieldDecorator('stemAudioText'+subIndex+index2, {
                  initialValue: stemAudioText,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipInput }],
                })(
                  <TextareaClearData initvalue={stemAudioText} 
                  saveClear={(value)=>this.props.saveClearTrue(value)}
                  onChange={(value)=>this.saveStemAudioText(value)} textlabel={data.params.label} autocleaning={data.params.autoCleaning}/> 
                  
                )}
              </FormItem>}
              
      </div>
    );
  }
}

export default StemAudioTextControl;
