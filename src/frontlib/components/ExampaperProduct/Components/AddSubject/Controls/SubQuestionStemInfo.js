/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright  小题题干控件
 */
import React, { Component } from 'react';
import { Input, Tabs, Form } from 'antd';
import IconButton from '../../../../IconButton';
const FormItem = Form.Item;
import UpLoadImg from './UpLoadImg';
import TextareaClearData from './TextareaClearData';
import { formatMessage, FormattedMessage } from 'umi/locale';
import './index.less';
const { TextArea } = Input;
const { TabPane } = Tabs;
import { fetchPaperFileUrl } from '@/services/api';
class SubQuestionStemInfo extends Component {
  constructor(props) {
    super(props);
    const { showData, index2, subIndex, data } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    this.state = {
      visible: true,
      activeKey: data.params.image == 'N' ? '2' : '1',
      subImgId: '',
      id: showData ? (showData.data.patternType != "COMPLEX" ? showData.data.subQuestion[subIndex].subQuestionStemImage : showData.data.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemImage) : '',
      duration: 0,
      name: '',
      audioUrl: "",
      allowEnterVo: 'N',
      stemTextValue: showData ? (showData.data.patternType != "COMPLEX" ? showData.data.subQuestion[subIndex].subQuestionStemText : showData.data.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemText) : '',
      subQuestionStemImage: ""
    };
  }

  componentWillMount() {
    const { data, showData, subIndex, index2 } = this.props;
    //渲染数据
    const mainIndex = index2 == 'all' ? '1' : index2;
    const editData = showData && showData.data;
    var stemImgInfo = '';
    var stemTextInfo = '';
    let self = this;
    if (editData && editData.patternType == "TWO_LEVEL") {
      this.setState({
        stemTextValue: editData.subQuestion[subIndex].subQuestionStemText,
        subQuestionStemImage: editData.subQuestion[subIndex].subQuestionStemImage
      })
      stemImgInfo = editData.subQuestion[subIndex].subQuestionStemImage;
      stemTextInfo = editData.subQuestion[subIndex].subQuestionStemText
    }

    //渲染的是复合题型下的
    if (editData && editData.patternType == "COMPLEX") {
      const childData = editData.groups[mainIndex] && editData.groups[mainIndex].data;
      if (childData.subQuestion[subIndex] && childData.subQuestion[subIndex].subQuestionStemText || childData.subQuestion[subIndex] && childData.subQuestion[subIndex].subQuestionStemImage) {
        this.setState({
          stemTextValue: childData.subQuestion[subIndex].subQuestionStemText,
          subQuestionStemImage: childData.subQuestion[subIndex].subQuestionStemImage
        })
        stemImgInfo = childData.subQuestion[subIndex].subQuestionStemImage;
        stemTextInfo = childData.subQuestion[subIndex].subQuestionStemText
      }
    }
    if (editData) {
      if (stemImgInfo) {
        fetchPaperFileUrl({
          fileId: stemImgInfo
        }).then((e) => {
          self.setState({
            id: e.data.id,
            audioUrl: e.data.path,
            duration: '',
            name: e.data.fileName
          })
        })
        // stemImgInfo = childData.subQuestion[subIndex].subQuestionStemImage;
        // stemTextInfo = childData.subQuestion[subIndex].subQuestionStemText
      }
    }
    if (editData) {
      if (stemImgInfo) {
        fetchPaperFileUrl({
          fileId: stemImgInfo
        }).then((e) => {
          self.setState({
            id: e.data.id,
            audioUrl: e.data.path,
            duration: '',
            name: e.data.fileName
          })
        })

      }
      if (stemTextInfo) {
        this.props.saveSubStemText(stemTextInfo, subIndex, mainIndex, this.state.allowEnterVo)
        this.setState({
          activeKey: '2'
        })
      }

    }
  }
  // 保存题干文本
  saveStemImg = (id) => {
    const { subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    this.setState({
      id: id
    })
    this.props.saveSubStemImg(id, subIndex, mainIndex)
    //this.props.saveSubStemText('',subIndex,mainIndex)
    this.props.form.setFieldsValue();
  }
  // 保存题干图片
  saveStemText = (value) => {
    const { subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    this.setState({
      stemTextValue: value
    })
    //this.props.saveSubStemImg('',subIndex,mainIndex)
    this.props.saveSubStemText(value, subIndex, mainIndex, this.state.allowEnterVo)
    this.props.form.setFieldsValue();
  }
  //标签切换
  onChange = (activeKey) => {
    this.props.form.resetFields();
    const { subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    const { id, stemTextValue, allowEnterVo } = this.state
    if (activeKey == 1) {
      this.props.saveSubStemImg(id, subIndex, mainIndex)
      //this.props.saveSubStemText('',subIndex,mainIndex)
    } else {
      this.props.saveSubStemText(stemTextValue, subIndex, mainIndex, allowEnterVo)
      //this.props.saveSubStemImg('',subIndex,mainIndex)
    }
    this.setState({ activeKey });
  }
  saveStemAllowEnter = (value) => {
    console.log(value)
    const { subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    const { id, stemTextValue } = this.state
    this.setState({ allowEnterVo: value })
    this.props.saveSubStemText(stemTextValue, subIndex, mainIndex, value)
  }
  render() {

    const { data, form, allowEnterSubStemInfo } = this.props;
    const { subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    const { id, audioUrl, duration, name, activeKey, stemTextValue } = this.state;
    const { getFieldDecorator } = form;
    const tipMessage = <FormattedMessage id="app.is.upload.model" values={{name:data.params.imageLabel}} defaultMessage="请上传{name}"></FormattedMessage>;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.textLabel}} defaultMessage="请输入{name}"></FormattedMessage>;
    return (
      <div className="demon">     
        <Tabs type="card" defaultActiveKey={data.params.image=='N'?'2':stemTextValue?'2':id?'1':'1'} onChange={this.onChange} animated={false} className={data.params.image=='N'||data.params.text=='N'?'singleStemInfo':data.params.image=='Y'||data.params.text=='Y'?'doubleStemInfo':''}>
            <TabPane tab={data.params.imageLabel} key="1">
            {data.params.image=='Y'&&activeKey=='1'&&<FormItem label={data.params.imageLabel}>
                {getFieldDecorator('stemsubTextImg'+subIndex+index2, {
                  initialValue: id,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipMessage }],
                })(<div>
             {audioUrl!=''&&<UpLoadImg
             displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={duration}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id,subIndex,mainIndex)}  
                /> }    
                {audioUrl==''&&<UpLoadImg
                displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={duration}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id,subIndex,mainIndex)}  
                /> }  
            </div> )}
              </FormItem>}             
            </TabPane>
            <TabPane tab={data.params.textLabel} key="2">
            {data.params.text!='N'&&activeKey=='2'&&<FormItem label={data.params.textLabel}>
                {getFieldDecorator('subQuestionStemText'+subIndex+index2, {
                  initialValue: this.state.stemTextValue,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message:tipInput }],
                })(
                  <TextareaClearData initvalue={this.state.stemTextValue} 
                  allowEnter={allowEnterSubStemInfo}
                  saveClear={(value)=>this.props.saveClearTrue(value)}
                  saveAllowEnter={(value)=>this.saveStemAllowEnter(value)}
                  onChange={(value)=>this.saveStemText(value)} textlabel={data.params.textLabel} autocleaning={data.params.autoCleaning}/> 
                )}
              </FormItem>}
                    
            </TabPane>            
          </Tabs>
      </div>
    );
  }
}

export default SubQuestionStemInfo;
