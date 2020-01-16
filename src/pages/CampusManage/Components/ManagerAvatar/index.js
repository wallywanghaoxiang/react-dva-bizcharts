import React, { Component } from 'react';
import { connect } from 'dva';
import { Avatar, Tooltip } from 'antd';
import './index.less';
import TeacherAvatar from '@/assets/campus/avarta_teacher.png';

@connect(({ campusmanage }) => {
  const { gradList } = campusmanage;

  return { gradList };
})
class ManagerAvatar extends Component {
  state = {
    currentAvatar: '',
  };

  componentDidMount() {
    // 获取头像
    const { item, dispatch } = this.props;
    if (item && item.accountId) {
      const params = {
        fileId: item.accountId,
      };
      dispatch({
        type: 'file/avatar',
        payload: params,
        callback: data => {
          this.setState({
            currentAvatar: data.path,
          });
        },
      });
    }
  }

  handleDelete = () => {
    const { onDelete } = this.props;
    onDelete();
  };

  render() {
    const { item, gradList } = this.props;
    const { currentAvatar } = this.state;
    if (!item) {
      return null;
    }

    const gradeObj = gradList ? gradList.find(tag => tag.grade === item.grade) : null;

    return (
      <div className="manager-avatar">
        <div className="avatar">
          <Avatar src={currentAvatar || TeacherAvatar} />
        </div>
        <Tooltip placement="bottom" title={item.teacherName} arrowPointAtCenter>
          <div className="name">{item.teacherName ? item.teacherName : ''}</div>
        </Tooltip>
        {/* 学科管理员年级 */}
        {item.roleCode === 'CampusAdmin' && (
          <div className="name" style={{ fontSize: '12px', color: '#888' }}>
            {gradeObj ? gradeObj.gradeValue : ''}
          </div>
        )}

        {item.roleCode === 'CampusOwner' ? null : (
          <div className="subject">{item.subjectValue ? item.subjectValue[0] : ''}</div>
        )}
        {item.roleCode === 'CampusOwner' ? null : (
          <i className="iconfont icon-delete-corner delete" onClick={this.handleDelete} />
        )}
      </div>
    );
  }
}

export default ManagerAvatar;
