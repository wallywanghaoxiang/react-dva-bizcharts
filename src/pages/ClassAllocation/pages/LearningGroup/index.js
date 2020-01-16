/**
 *
 * User: tina.zhang
 * Explain: 学习小组入口
 *
 * */
import React, { Component } from 'react';
import ListItem from './components/ListItem';
import SiderClass from './components/SiderClass';
import AddGroupModal from './components/AddGroupModal';
import ReGroupModal from './components/ReGroupModal';
import AddStudentModal from './components/AddStudentModal';
import NoGroup from './components/NoGroup';
import styles from './index.less';



class Learning extends Component {
  state = {
    visibleModal:false,
    visibleModalGroup:false,
    visibleStudentModal:false,
    id:''
  };

  componentWillMount() {
}

  // 添加分组
  addGroupModal=(id)=>{
    this.setState({
      visibleModal:true,
      id
    })

  }

  // 关闭弹窗
  hideModalGroup=()=>{
    this.setState({
      visibleModal:false,
      visibleModalGroup:false,
      visibleStudentModal:false
    })
  }

  //  加入现有小组
  reGroupItem=()=>{
    this.setState({
      visibleModalGroup:true
    })
  }

  // 添加学生
  addStudentModal=()=>{
    this.setState({
      visibleStudentModal:true
    })
  }

  render() {
    const {visibleModal,id,visibleModalGroup,visibleStudentModal} = this.state;
    return (
      <div>
        <div className={styles.learning}>        
          <SiderClass addGroup={(id)=>this.addGroupModal(id)} />
          <ListItem reGroup={this.reGroupItem} addStudent={this.addStudentModal} />
        </div>
        <AddStudentModal visible={visibleStudentModal} hideModal={this.hideModalGroup}  />


        <AddGroupModal visible={visibleModal} hideModal={this.hideModalGroup} id={id} />

        <ReGroupModal visible={visibleModalGroup} hideModal={this.hideModalGroup} reGroup={this.reGroupItem} />

        <NoGroup addGroup={(id)=>this.addGroupModal('')} />
      </div>
      
    );
  }
}

export default Learning;
