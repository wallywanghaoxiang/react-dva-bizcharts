import React, { Component } from 'react';
import { Tooltip } from 'antd';
import {getUserAvatar} from '@/services/api';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import adminAvatar from '@/assets/class/admin_avatar.png';
/**
 * url          图片路径
 * duration     图片ID
 */

 // style行内样式的初始化
const conTextTip = {
  display: 'flex',
  width: 'auto',
  paddingLeft:'',
  paddingRight:'5px'
};
const nameTip = {
  fontSize: 18,
};
const imgTip = {
  width: 20,
  height: 20,
  marginLeft: 4,
  marginRight: 4,
  position: 'relative',
  top: 3,
};
const subjectListTip = {
  position: 'relative',
  top: 4,
  display: 'flex',
};
const subjectTip = {
  width: 40,
  height: 20,
  paddingRight: 2,
  paddingLeft: 2,
  borderRadius: 13,
  border: 1,
  borderStyle: 'double',
  fontSize: 12,
  position: 'relative',
  left: 4,
};
const subjectSpanTip = {
  position: 'relative',
  left: 6,
};

class ShowAvatar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl:"",// 图片路径
    };
  }

  componentDidMount(){
    
    const{item} = this.props;
    
    if(item.accountId) {
        const self = this;  
        getUserAvatar({
          fileId:item.accountId
        }).then((e)=>{         
            self.setState({
            audioUrl:e.data.path
          })          
        })
    }

  }

  componentWillReceiveProps(nextProps) {
    const{item} = this.props;
    const id = item.accountId
    if(id&&(nextProps.item.accountId!==id)) {
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

  // hover消息头提取
  showMessage = student => {
    console.log(student)
    return [
      <div style={conTextTip}>
        <span style={nameTip}>{student.teacherName}</span>
        {student.isOwner === '1' ? <span>
          <img
            style={imgTip}
            src={adminAvatar}
            alt=""
          />
        </span> : null}
        {student && student.subjectList && student.subjectList.length > 0 ? (
          student.subjectList.map(subject => (
            <div style={subjectListTip}>
              <div style={subjectTip}>
                <span style={subjectSpanTip}>{subject.subjectValue}</span>
              </div>
            </div>
          ))
        ) : (
          <span />
        )}
      </div>,
    ];
  };

  render() {
    const {audioUrl} = this.state;
    const{item} = this.props;
    return (
      <Tooltip placement="top" title={this.showMessage(item)}>
        <img src={audioUrl||TeacherAvatar} key={item.teacherId} alt="" />
      </Tooltip>
      
    );
  }
}

export default ShowAvatar;
