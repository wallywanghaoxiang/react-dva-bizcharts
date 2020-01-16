import React, { Component } from 'react';
import { connect } from "dva";
import Avatar from '@/assets/class/avarta_teacher.png';
import { fetchPaperFileUrl } from '@/services/api';

/**
 * 代课教师头像卡片
 */
@connect(({ file }) => ({
  currentAvartar:file.userImgPath
}))
class Teacher extends Component {
  state = {
    teacherAvatar:""
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { selectedTeacher } = this.props;
    if (selectedTeacher.accountId) {
      const params = {
        fileId: selectedTeacher.accountId
      }
      dispatch({
        type: 'file/avatar',
        payload:params,
        callback:(data) => {
          this.setState({
            teacherAvatar: data.path
          })
        }
      })
    }
    
  }


  render() {
    const { selectedTeacher,onDel,noclosed } = this.props;
    const {teacherAvatar} = this.state;
    return (
      <div className={"studentAvatar"}>
        <img src={teacherAvatar ? teacherAvatar : Avatar} alt='avatar' />
        <div className={"userName"}>{selectedTeacher.teacherName}</div>
        {!noclosed && <i className={"iconfont icon-close"} style={{marginLeft:10}} onClick={(e)=>{onDel()}}/>}
      </div> 
    );
  }
}

export default Teacher;
