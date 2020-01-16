/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright 题干控件
 */
import React, { Component } from 'react';
import { Input, Tabs, Form, Modal } from 'antd';
import IconButton from '../../../../IconButton';
import UpLoadImg from './UpLoadImg';

import TextareaClearData from './TextareaClearData';
import { formatMessage, FormattedMessage } from 'umi/locale';
const confirm = Modal.confirm;
const FormItem = Form.Item;
import './index.less';


const { TextArea } = Input;
const { TabPane } = Tabs;
//获取上传文件的详情
import { fetchPaperFileUrl } from '@/services/api';
class StemInfoControl extends Component {
  constructor(props) {
    super(props);
    const { showData, index2, data } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2;
    this.state = {
      visible: true,
      activeKey: data.params.image == 'N' ? '2' : '1',
      imgID: '',
      id: '',
      name: '',
      audioUrl: "",
      allowEnterVo: 'N',
      stemTextValue: showData ? (showData.data.patternType != "COMPLEX" ? showData.data.mainQuestion.stemText : showData.data.groups[mainIndex].data.mainQuestion.stemText) : '', //文本框值
      isUsebraftEdit:false
    };
  }
  componentWillMount() {
    const { data, showData, subIndex, index2 } = this.props;
    //渲染数据
    const editData = showData && showData.data
    var fileID = '';
    var stemTextData = '';
    let self = this;
    if (editData) {
      const mainIndex = index2 == 'all' ? '1' : index2
      if (editData && editData.patternType != "COMPLEX") {
        this.setState({
          stemTextValue: editData.mainQuestion.stemText
        })
        stemTextData = editData.mainQuestion.stemText
        fileID = editData.mainQuestion.stemImage;

      } else if (editData && editData.patternType == "COMPLEX" && editData.groups[mainIndex].data) {
        this.setState({
          stemTextValue: editData.groups[mainIndex].data.mainQuestion.stemText
        })
        stemTextData = editData.groups[mainIndex].data.mainQuestion.stemText
        fileID = editData.groups[mainIndex].data.mainQuestion.stemImage;
      }
      if (fileID) {
        fetchPaperFileUrl({
          fileId: fileID
        }).then((e) => {
          self.setState({
            id: e.data.id,
            audioUrl: e.data.path,
            name: e.data.fileName
          })
        })
      }
      if (stemTextData) {
        this.props.saveStemTextModal(stemTextData, index2)
        this.setState({
          activeKey: '2'
        })
      }
      if (fileID) {
        this.props.saveStemImgModal(fileID, index2)
        this.setState({
          activeKey: '1'
        })
      }

    }
  }
  // 保存题干文本
  saveStemText = (value,type) => {
    this.props.form.resetFields();
    const { referenceTextMark, index2 } = this.props
    const { stemTextValue, allowEnterVo } = this.state;
    const mainIndex = index2 == 'all' ? '1' : index2

    if (referenceTextMark.length > 0 && value != stemTextValue) {
      console.log(value + '~~~~~~~~~~~~~~~~~~~~~~' + stemTextValue)
      const that = this;
      let manualEntry = localStorage.getItem("manualEntry")
      if(type === "change"){
        if(manualEntry === "true"){
          that.props.saveStemTextModal(value, index2, allowEnterVo)
          //that.props.saveStemImgModal('',index2) 
          that.setState({
            stemTextValue: value
          })
        }else{
          confirm({
            title: formatMessage({id:"app.message.tip",defaultMessage:"提示"}),
            content: formatMessage({id:"app.title.referenceTextMarkcontent",defaultMessage:"修改短文内容将丢失已有标注，是否确定修改？"}),
            okText: formatMessage({id:"app.text.confirm",defaultMessage:"确认"}),
            cancelText: formatMessage({id:"app.text.cancel",defaultMessage:"取消"}),
            className: 'editRemarked',
            onOk() {

              that.props.saveStemTextModal(value, index2, allowEnterVo)
              //that.props.saveStemImgModal('',index2) 
              that.setState({
                stemTextValue: value
              })
            },
            onCancel() {
              that.setState({
                stemTextValue: that.state.stemTextValue
              })
            },
          });
        }
      }
    } else {
      this.setState({
        stemTextValue: value
      })

      this.props.saveStemTextModal(value, index2, allowEnterVo)
      this.props.form.setFieldsValue();
      //this.props.saveStemImgModal('',index2) 

    }

  }
  // 保存题干图片
  saveStemImg = (id) => {
    const { index2, subIndex } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    this.setState({
      id: id
    })
    this.props.saveStemImgModal(id, index2)
    //this.props.saveStemTextModal('',index2)
    this.props.form.setFieldsValue();
  }
  //标签切换
  onChange = (activeKey) => {
    this.props.form.resetFields();
    this.setState({ activeKey });
    const { index2, subIndex } = this.props;
    const { id, stemTextValue, allowEnterVo } = this.state;
    if (activeKey == 1) {
      this.props.saveStemImgModal(id, index2)
      //this.props.saveStemTextModal('',index2)
    } else {
      //this.props.saveStemImgModal('',index2)
      this.props.saveStemTextModal(stemTextValue, index2, allowEnterVo)
    }
  }
  saveStemAllowEnter = (value) => {
    const { index2, subIndex } = this.props;
    const { id, stemTextValue } = this.state;
    this.setState({ allowEnterVo: value })
    this.props.saveStemTextModal(stemTextValue, index2, value)
  }


  isUsebraft = (e)=>{
    console.log(e)
    this.setState({ isUsebraftEdit:e })
  }

  render() {
    const { data, showData, index2, subIndex, allowEnterStemInfo } = this.props;
    const { id, audioUrl, name, activeKey, stemTextValue,isUsebraftEdit } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const tipMessage = <FormattedMessage id="app.is.upload.model" values={{name:data.params.imageLabel}} defaultMessage="请上传{name}"></FormattedMessage>;
    const tipInput = <FormattedMessage id="app.is.input.model" values={{name:data.params.textLabel}} defaultMessage="请输入{name}"></FormattedMessage>;
    console.log(stemTextValue)
    return (
      <div className="demon">     
        <Tabs type="card" defaultActiveKey={data.params.image=='N'?'2':stemTextValue?'2':id?'1':'1'} onChange={this.onChange} animated={false} className={data.params.image=='N'||data.params.text=='N'?'singleStemInfo':data.params.image=='Y'&&data.params.text=='Y'?'doubleStemInfo':''}>
            <TabPane tab={data.params.imageLabel} key="1">
            {data.params.image!=='N'&&activeKey=='1'&&<FormItem label={data.params.imageLabel}>
                {getFieldDecorator('stemTextImg'+subIndex+index2, {
                  initialValue: id,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipMessage }],
                })(
                 <div> {audioUrl!=''&&<UpLoadImg
                  displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={''}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id)}
                /> }    
                {audioUrl==''&&<UpLoadImg
                  displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={''}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id)}
                /> }  </div>
                )}
              </FormItem>}
              
            </TabPane>
            <TabPane tab={data.params.textLabel} key="2">
            {
              data.params.text!='N'&&activeKey=='2'&&     
            <FormItem label={data.params.textLabel}>
                {getFieldDecorator('stemText'+subIndex+index2, {
                  initialValue: stemTextValue,
                  rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipInput }],
                })(
                  <TextareaClearData 
                    saveClear={(value)=>this.props.saveClearTrue(value)}
                    initvalue={stemTextValue} 
                    onChange={(value,type="")=>this.saveStemText(value,type)} 
                    isUsebraft = {(value)=>this.isUsebraft(value)} 
                    textlabel={data.params.textLabel} 
                    autocleaning={data.params.autoCleaning}
                    allowEnter={allowEnterStemInfo}
                    braft = {true}
                    isUsebraftEdit = {isUsebraftEdit}
                    saveAllowEnter={(value)=>this.saveStemAllowEnter(value)}
                  /> 
                )}
              </FormItem>
              }
                
               
            </TabPane>            
          </Tabs>
      </div>
    );
  }
}

export default StemInfoControl;
