import React, { Component } from 'react';
import {getUserAvatar} from '@/services/api';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
/**
 * 图片
 * url          图片路径
 * duration     图片ID
 */
class UserAvatar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: "", // 图片路径
    };
  }

  componentDidMount(){
    const{id} = this.props;
    if(id) {
        const self = this;  
        getUserAvatar({
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
    if(nextProps.id!==id) {
      const self = this;  
      getUserAvatar({
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
    const { audioUrl } = this.state;
    const {avatar,id} = this.props;
    console.log(id)
    return (
      
    audioUrl&&id ?  
      <img style={avatar} src={audioUrl || TeacherAvatar} key={id} alt="" />
        :
      <img style={avatar} src={TeacherAvatar} alt="" />
       
    );
  }
}

export default UserAvatar;
