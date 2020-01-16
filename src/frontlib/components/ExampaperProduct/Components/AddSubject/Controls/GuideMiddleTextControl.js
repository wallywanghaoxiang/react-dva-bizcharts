/**
 * @Author    tina
 * @DateTime  2018-11-20
 * @copyright 7.2.11	中间指导文本控件（guideMiddleTextControl）
 */
import React, { Component } from 'react';
import { Input,Form } from 'antd';
import './index.less';
const { TextArea } = Input;
const FormItem = Form.Item;
import { formatMessage,FormattedMessage } from 'umi/locale';
class GuideMiddleTextControl extends Component {
  constructor(props) {
    super(props);    
    const{showData,index2} = this.props;  
    const mainIndex=index2=='all'?'1':index2
    this.state = {
      visible: true,
      stemTextValue:showData?(showData.data.patternType!="COMPLEX"?showData.data.mainQuestion.guideMiddleText:showData.data.groups[mainIndex].data.mainQuestion.guideMiddleText):''
    };
  }
  componentDidMount() {
        const{data,showData,index2,subIndex} = this.props;
     //渲染数据
     const editData = showData&&showData.data 
     if(editData&&editData.patternType!="COMPLEX") {
        this.setState({
        stemTextValue:editData.mainQuestion.guideMiddleText
      })
      this.props.saveGuideSuffixTextInfo(editData.mainQuestion.guideMiddleText)
     }
  
    if(editData&&editData.patternType=="COMPLEX") { 
      const mainIndex=index2=='all'?'1':index2
    const childData =editData.groups[mainIndex].data;
    this.setState({
    stemTextValue: childData.mainQuestion.guideMiddleText
    })
    this.props.saveGuideSuffixTextInfo(childData.mainQuestion.guideMiddleText,index2)
  }
 
  }
  saveGuideSuffixText=(e)=>{
    const{index2} = this.props;
    const mainIndex=index2=='all'?'1':index2
      this.setState({
        stemTextValue:e.target.value
      })
    this.props.saveGuideSuffixTextInfo(e.target.value,index2)
}
  render() {
    const { data,form ,subIndex,index2} = this.props;
    const { getFieldDecorator } = form;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.label}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon">
         <FormItem label={data.params.label}>
                {getFieldDecorator('guideMiddleText'+subIndex+index2, {
                  initialValue: this.state.stemTextValue,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message:tipInput}],
                })(
                  <TextArea onChange={(e)=>this.saveGuideSuffixText(e) } autosize={{ minRows: 3, maxRows: 5 }}/>
                )}
              </FormItem>
     
      </div>
    );
  }
}

export default GuideMiddleTextControl;
