/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright 示范音频
 */
import React, { Component } from 'react';
import { Upload, message, Button, Icon,Form } from 'antd';
import styles from './index.less';
import IconButton from '../../../../IconButton';
import UpLoadVideo from '../../UpLoadVideo';
import { formatMessage,FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
//获取上传文件的详情
import {fetchPaperFileUrl} from '@/services/api';
class StemAudioControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,   
      id:'',
      duration:0,
      name:'',
      audioUrl:'', 
    };
  }

  componentDidMount() {
      const{data,showData,subIndex,index2,form} = this.props;    
     //渲染数据
     const editData = showData&&showData.data;
     const { getFieldDecorator } = form;
     var fileID =''; 
     var stemAudioTime='';
     let self = this;
     if(editData) {   
      const mainIndex=index2=='all'?'1':index2
        if(editData&&editData.patternType!="COMPLEX"&&editData.mainQuestion.stemVideo) {   
            fileID=editData.mainQuestion.stemVideo;
            stemAudioTime=editData.mainQuestion.stemVideoTime
        }
        else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {   
          
           fileID=editData.groups[mainIndex].data.mainQuestion.stemVideo;
           stemAudioTime=editData.groups[mainIndex].data.mainQuestion.stemVideoTime
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
          this.props.saveStemAudio(e.data.id,stemAudioTime,index2)        
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
          {getFieldDecorator('StemVideoControl'+index2+subIndex, {
            initialValue: id,
            rules: [{ required: data.params.input=='REQUIRED'?true:false, message: tipMessage }],
          })(
           <div>
            <UpLoadVideo
              id={id}
              url={audioUrl}
              duration={duration}
              name={name}
              key = {id}
              callback={(e)=>{            
                this.setState(e)
                this.props.saveStemAudio(e.id,e.duration,index2)
              }}
            /> 
           </div>
          )}
        </FormItem>
             
      </div>
    );
  }
}

export default StemAudioControl;
