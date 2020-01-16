/**
 *
 * User: tina.zhang
 * Date: 19-04-10
 * Explain: 学生标签
 *
 * */
import React, { Component } from 'react';
import {Tooltip} from 'antd';
import {getUserAvatar} from '@/services/api';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import styles from './index.less';



class StudentTip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: "", // 图片路径
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

  render() {
      const {item,isMark} = this.props;
      const { audioUrl } = this.state;
    return (
      <div className={styles.studentTip}>
        {isMark&&item.isMark==='Y'&&<span className={styles.greenColor}>T</span>}
        <span className={styles.classNum}>{item.studentClassCode}</span>
        {
          audioUrl ?  
            <img src={audioUrl || TeacherAvatar} key={item.id} alt="" />
            :
            <img src={TeacherAvatar} alt="" />
            
         
        } 
        <Tooltip title={item.studentName}><span className={styles.userName}>{item.studentName||item.name}</span></Tooltip>
        
      </div>
    );
  }
}

export default StudentTip;
