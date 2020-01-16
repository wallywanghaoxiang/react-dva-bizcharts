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
      stemVideoText:showData?(showData.data.patternType!="COMPLEX"?showData.data.mainQuestion.stemVideoText:showData.data.groups[mainIndex].data.mainQuestion.stemVideoText):''
    };
  }
  componentDidMount() {
    const { data,showData,index2,subIndex} = this.props;
     //渲染数据
     const mainIndex=index2=='all'?'1':index2;
     const editData = showData&&showData.data;
     var stemVideoTextData='';
     if(editData&&editData.patternType!="COMPLEX") {       
        this.setState({
        stemVideoText:editData.mainQuestion.stemVideoText
      })
      stemVideoTextData=editData.mainQuestion.stemVideoText
     }
      if(editData&&editData.patternType=="COMPLEX") { 
        const childData =editData.groups[mainIndex].data;
       this.setState({
        stemVideoText: childData.mainQuestion.stemVideoText
        })
        stemVideoTextData=childData.mainQuestion.stemVideoText
      }
      if(data.params.input=='COPY') {
          //音频原文 此copy时音频原来的数据复制 短文内容的数据
          this.props.saveCopyStemAudioText(true)
      }
      this.props.saveStemAudioTextModal(stemVideoTextData,index2)
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
      stemVideoText:value
      })
}
  render() { 
    const { data,form,subIndex,index2} = this.props;
    const { stemVideoText } = this.state;  
    const { getFieldDecorator } = form;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.label}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon" style={{display:(data.params.input=='COPY'?'none':'block')}}>
        
        {data.params.input!='COPY'&&<FormItem label={data.params.label}>
                {getFieldDecorator('stemVideoText'+subIndex+index2, {
                  initialValue: stemVideoText,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipInput }],
                })(
                  <TextareaClearData initvalue={stemVideoText} 
                  saveClear={(value)=>this.props.saveClearTrue(value)}
                  onChange={(value)=>this.saveStemAudioText(value)} textlabel={data.params.label} autocleaning={data.params.autoCleaning}/> 
                  
                )}
              </FormItem>}
              
      </div>
    );
  }
}

export default StemAudioTextControl;
