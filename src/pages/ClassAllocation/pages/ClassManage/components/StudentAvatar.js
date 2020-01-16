import React, { Component } from 'react';
import { Avatar,Tooltip } from 'antd';
import classNames from 'classnames';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import styles from './index.less';

class StudentAvatar extends Component {
  state = {
    selectItem: '',// 选中的学生
  };

  // 切换校区
  componentWillReceiveProps(nextProps) {
    const { selectItem } = this.props;
    if (nextProps.selectItem !== selectItem) {
      this.setState({
        selectItem: nextProps.selectItem,
      });
    }
  }

  selectManager = () => {
    const { onHandleSelectManager,item } = this.props;
    const { selectItem } = this.state;
    if (onHandleSelectManager) {
      // onHandleSelectManager();
      if (item.id === (selectItem ? selectItem.id : '')) {
        onHandleSelectManager(false);
      } else {
        onHandleSelectManager(true);
      }
      
    }
  };

  // jsx语法视图渲染
  render() {
    const { item } = this.props;
    const { selectItem } = this.state;
    console.log(item,selectItem);
    return (
      <div className={styles.studentAvatar}>
        <div
          className={selectItem&&item.id === selectItem.id ? classNames(styles.studentAvatar, styles.selected) : classNames(styles.studentAvatar)}
          onClick={this.selectManager}
        >
          <Avatar src={item.avatar ? item.avatar : TeacherAvatar} />
          <Tooltip title={item.name || item.studentName} placement="topLeft"><div className={styles.userName}>{item.name || item.studentName}</div></Tooltip>
          
          <div className={styles.classNum}>{item.studentClassCode}</div>
        </div>
      </div>
    );
  }
}

export default StudentAvatar;
