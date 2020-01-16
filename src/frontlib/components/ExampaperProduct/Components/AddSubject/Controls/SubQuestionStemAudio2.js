/**
 * @Author    tina
 * @DateTime  2019-01-03
 * @copyright 小题题干音频控件2
 */
import React, { Component } from 'react';
import {Button } from 'antd';
import styles from './index.less';
import IconButton from '../../../../IconButton';
import UploadFile from '../../UpLoadFile';
//获取上传文件的详情
import {fetchPaperFileUrl} from '@/services/api';
class SubQuestionStemAudio2 extends Component {
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
            fileID=editData.subQuestion[subIndex].subQuestionStemAudio2;
            stemAudioTime=editData.subQuestion[subIndex].subQuestionStemAudioTime2
        }
        else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {   
          
           fileID=editData.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudio2;
           stemAudioTime=editData.groups[mainIndex].data.subQuestion[subIndex].subQuestionStemAudioTime2
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
    const { data,subIndex,index2} = this.props;
    const mainIndex=index2=='all'?'1':index2;
    const {id,audioUrl,duration,name} = this.state;
    return (
      <div className="demon">
        <h1>
        {data.params.label}2
        </h1>
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
          
        {//<Button className="tts">TTS</Button>
        }  
      </div>
    );
  }
}

export default SubQuestionStemAudio2;
