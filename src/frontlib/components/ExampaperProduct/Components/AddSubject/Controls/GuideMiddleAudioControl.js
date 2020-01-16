/**
 * @Author    tina
 * @DateTime  2018-11-20
 * @copyright 7.2.13	中间指导音频控件（guideMiddleAudioControl）
 */
import React, { Component } from 'react';
import { Form } from 'antd';
import styles from './index.less';
import UploadFile from '../../UpLoadFile';
const FormItem = Form.Item;
//获取上传文件的详情
import {fetchPaperFileUrl} from '@/services/api';
import { formatMessage,FormattedMessage } from 'umi/locale';
class GuideMiddleAudioControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,   
      id:'',
      duration:0,
      name:'',
      audioUrl:"", 
    };
  }
  handleSuccess = (id,path) => {
    this.props.saveStemAudio(id)
  }

  componentDidMount() {
     const{data,showData,subIndex,index2} = this.props;    
     //渲染数据
     const editData = showData&&showData.data;
     var fileID =''; 
     var stemAudioTime='';
     let self = this;
     if(editData) {     
      const mainIndex=index2=='all'?'1':index2   
        if(editData&&editData.patternType!="COMPLEX"&&editData.mainQuestion.guideMiddleAudio) {   
            fileID=editData.mainQuestion.guideMiddleAudio;
            stemAudioTime=editData.mainQuestion.guideMiddleAudioTime
            this.props.saveGuideSuffixAudio(fileID,stemAudioTime)
        }
        else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {   
          
           fileID=editData.groups[mainIndex].data.mainQuestion.guideMiddleAudio;
           stemAudioTime=editData.groups[mainIndex].data.mainQuestion.guideMiddleAudioTime
           this.props.saveGuideSuffixAudio(fileID,stemAudioTime,index2)
        }        
        fetchPaperFileUrl({
          fileId:fileID
        }).then((e)=>{         
            self.setState({
            id:e.data.id,
            audioUrl:e.data.path,
            duration:stemAudioTime,
            name:e.data.fileName
          })          
        })
     }
  }

  render() {
    const { data,form,index2,subIndex } = this.props;
    const {id,audioUrl,duration,name} = this.state;
    const mainIndex=index2=='all'?'1':index2 
    const { getFieldDecorator } = form;
    const tipMessage = <FormattedMessage id="app.is.upload.model" values={{name:data.params.label}} defaultMessage="请上传{name}"></FormattedMessage>;
    return (
      <div className="demon">
        <FormItem label={data.params.label}>
          {getFieldDecorator('GuideMiddleAudioControl'+index2+subIndex, {
            initialValue: id,
            rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipMessage }],
          })(
           <div>
              {duration!=''&&<UploadFile
                id={id}
                url={audioUrl}
                duration={duration}
                name={name}
                callback={(e)=>{
                  this.props.saveGuideSuffixAudio(e.id,e.duration,index2)
                  this.setState(e)
                }}
              /> }  
              {duration==''&&<UploadFile
                id={id}
                url={audioUrl}
                duration={duration}
                name={name}
                callback={(e)=>{
                  this.props.saveGuideSuffixAudio(e.id,e.duration,index2)
                  this.setState(e)
                }}
              /> }
           </div>
          )}
        </FormItem>
        
      </div>
    );
  }
}

export default GuideMiddleAudioControl;
