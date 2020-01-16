/**
 * @Author    tina
 * @DateTime  2018-10-23
 * @copyright 题后指导文本控件
 */
import React, { Component } from 'react';
import { Input,Button,Form} from 'antd';
import './index.less';
const { TextArea } = Input;
import IconButton from '../../../../IconButton';
import { formatMessage,FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
class GuideSuffixTextControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      guideSuffixText:""
    };
  }
  componentDidMount() {
    const{data,showData,subIndex,index2} = this.props;    
     //渲染数据
     const editData = showData&&showData.data   
     var guideSuffer = ''; 
      if(editData&&editData.patternType!="COMPLEX"&&editData.mainQuestion.guideSuffixText!=null) {
        this.setState({
            guideSuffixText:editData.mainQuestion.guideSuffixText
          })
          guideSuffer=editData.mainQuestion.guideSuffixText
           this.props.saveGuideSuffixTextInfo(guideSuffer,index2)
      }
      else if(editData&&editData.patternType=="COMPLEX") {  
        const mainIndex=index2=='all'?'1':index2
         if(editData.groups[mainIndex].data.patternType=="NORMAL"&&editData.groups[mainIndex].data.mainQuestion.guideSuffixText!=null) { 
         this.setState({
            guideSuffixText:editData.groups[mainIndex].data.mainQuestion.guideSuffixText
          })
          guideSuffer=editData.groups[mainIndex].data.mainQuestion.guideSuffixText
          this.props.saveGuideSuffixTextInfo(guideSuffer,index2)
     } else if(editData.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editData.groups[mainIndex].data.mainQuestion.guideSuffixText&&editData.groups[mainIndex].data.mainQuestion.guideSuffixText!=null) {  
        this.setState({
            guideSuffixText:editData.groups[mainIndex].data.mainQuestion.guideSuffixText
          })
           this.props.saveGuideSuffixTextInfo(editData.groups[mainIndex].data.mainQuestion.guideSuffixText,index2)
     }
  }

  }
  saveGuideSuffixText=(e)=>{
    const{index2} = this.props; 
    const mainIndex=index2=='all'?'1':index2
    this.setState({
      guideSuffixText:e.target.value
    });
    this.props.saveGuideSuffixTextInfo(e.target.value,index2)
}
  render() {
    const { data,form,subIndex,index2} = this.props;
    const { getFieldDecorator } = form;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.label}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon">
        <FormItem label={data.params.label}>
          {getFieldDecorator('guideSuffixText'+subIndex+index2, {
            initialValue: this.state.guideSuffixText,
            rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipInput }],
          })(
            <TextArea onChange={(e)=>this.saveGuideSuffixText(e) } autosize={{ minRows: 3, maxRows: 5 }}/>
          )}
        </FormItem>
        {/**<h1>{data.params.label}<span>*</span></h1>
        <TextArea autosize={{ minRows: 3, maxRows: 5 }} onChange={this.saveGuideSuffixText} value={this.state.guideSuffixText}/>
           **/}
      </div>
    );
  }
}

export default GuideSuffixTextControl;
