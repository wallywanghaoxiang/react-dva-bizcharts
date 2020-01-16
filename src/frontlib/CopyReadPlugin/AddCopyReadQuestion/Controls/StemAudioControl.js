/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright 示范音频
 */
import React, { Component } from 'react';
import { Upload, message, Button, Icon,Form } from 'antd';
import styles from '../index.less';
import UploadFile from '@/frontlib/components/ExampaperProduct/Components/UpLoadFile';
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
    let self = this;
    const{stemAudio,stemAudioTime} = this.props;
    
    console.log("stemAudio",stemAudio)
    if(stemAudio){
      fetchPaperFileUrl({
        fileId:stemAudio
      }).then((e)=>{         
          self.setState({
          id:e.data.id,
          audioUrl:e.data.path,
          duration:stemAudioTime,
          name:e.data.fileName
        })  
        // this.props.saveStemAudio(e.data.id,stemAudioTime,index2)        
      })
    }
  }

  render() {
    const { data,form,index,label,callback,required,message} = this.props;
    const {id,audioUrl,duration,name} = this.state;
    const { getFieldDecorator } = form;
    return (
      <div className="demon">
        <FormItem label={label}>
          {getFieldDecorator('stemAudioControl'+index, {
            initialValue: id,
            rules: [{ required: required, message: message }],
          })(
           <div>
            <UploadFile
              key={id}
              id={id}
              url={audioUrl}
              duration={duration}
              name={name}
              callback={(e)=>{            
                this.setState(e)
                callback(e.id,e.duration)
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
