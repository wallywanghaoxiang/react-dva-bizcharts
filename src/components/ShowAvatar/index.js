import React, { Component } from 'react';
import {fetchPaperFileUrl} from '@/services/api';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
/**
 * url          图片路径
 * duration     图片ID
 */
class ShowAvatar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl:"",// 图片路径
    };
  }

  componentDidMount(){
    const{id} = this.props;
    if(id) {
        const self = this;  
        fetchPaperFileUrl({
          fileId:id
        }).then((e)=>{         
            self.setState({
            audioUrl:e.data.path
          })          
        })
    }

  }

  componentWillReceiveProps(nextProps) {
    const{id} = this.props;  
    if(id&&(nextProps.id!==id)) {
      const self = this;  
        fetchPaperFileUrl({
          fileId:id
        }).then((e)=>{  
          if (e.data) {
            self.setState({
              audioUrl:e.data.path
                        }) 
          }       
                     
        })
        
    }
}


  render() {
    const {audioUrl} = this.state;
    const{id} = this.props;
    console.log(id)
    return (
      <img src={audioUrl||TeacherAvatar} key={id} alt="" />
    );
  }
}

export default ShowAvatar;
