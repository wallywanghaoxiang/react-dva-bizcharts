/**
 * @Author    tina
 * @DateTime  2018-10-22
 * @copyright 小题题干音频控件
 */
import React, { Component } from 'react';
import {Button,Form } from 'antd';
import styles from './index.less';
import IconButton from '../../../../IconButton';
import UploadFile from '../../UpLoadFile';
import { formatMessage,FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
//获取上传文件的详情
import {fetchPaperFileUrl} from '@/services/api';
class SubQuestionStemAudio extends Component {
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
       const{data,showData,subIndex,index2} = this.props;    
     //渲染数据
     const editData = showData&&showData.data;
     var fileID =''; 
     var stemAudioTime='';
     let self = this;
     const mainIndex=index2=='all'?'1':index2;
     if(editData) {     
        if(editData&&editData.patternType!="COMPLEX"&&editData.subQuestion[subIndex].subQuestionStemAudio) {   
            fileID=editData.subQuestion[subIndex].subQuestionStemAudio;
            stemAudioTime=editData.subQuestion[subIndex].subQuestionStemAudioTime
        }
        else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {   
          
           fileID=editData.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudio;
           stemAudioTime=editData.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudioTime
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
          this.props.saveSubStemAudio(e.data.id,stemAudioTime,subIndex,mainIndex)        
        })
     } 
  }

  render() {
    const { data,form,index2,subIndex } = this.props;
    const mainIndex=index2=='all'?'1':index2
    const { getFieldDecorator } = form;
    const {id,audioUrl,duration,name} = this.state;
    const tipMessage = <FormattedMessage id="app.is.upload.model" values={{name:data.params.label}} defaultMessage="请上传{name}"></FormattedMessage>;
    return (
      <div className="demon"> 
      <FormItem label={data.params.label}>
      {getFieldDecorator('stemsubAudioControl'+index2+subIndex, {
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
            this.setState(e)
            this.props.saveSubStemAudio(e.id,e.duration,subIndex,mainIndex)
          }}
        /> }  
        {duration==''&&<UploadFile
          id={id}
          url={audioUrl}
          duration={duration}
          name={name}
          callback={(e)=>{            
            this.setState(e)
            this.props.saveSubStemAudio(e.id,e.duration,subIndex,mainIndex)
          }}
        />  }
        </div>
           )}
           </FormItem>
        {//<Button className="tts">TTS</Button>
        }  
      </div>
        
    );
  }
}

export default SubQuestionStemAudio;
