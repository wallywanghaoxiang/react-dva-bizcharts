import React from 'react';
import { Avatar } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import './index.less';
import TeacherAvatar from '@/assets/campus/avarta_teacher.png';

/**
 * type: classConfig(班级配置)、basicConfig(常规配置)
 *
 * @author tina.zhang
 * @date 2019-04-08
 * @class ManagerAvatarH
 * @extends {React.PureComponent}
 */
@connect(() => {})
class ManagerAvatarH extends React.PureComponent {
  state = {
    selectItem: '', // 选中的manager
    currentAvatar: '',
  };

  componentDidMount() {
    // 获取头像
    const { item, dispatch } = this.props;
    if (item.accountId) {
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

  componentWillReceiveProps(nextProps) {
    const { selectItem } = this.props;
    if (nextProps.selectItem !== selectItem) {
      this.setState({
        selectItem: nextProps.selectItem,
      });
    }
  }

  selectManager = () => {
    const { onHandleSelectManager } = this.props;
    onHandleSelectManager();
  };

  // 拖拽开始
  handleDragStart = (ev, item) => {
    // console.log(item);
    const str = JSON.stringify(item);
    ev.dataTransfer.setData('data', str);
  };

  render() {
    const { item, type } = this.props;
    const { selectItem, currentAvatar } = this.state;
    const selectStyle =
      item.teacherId === selectItem.teacherId ? 'manager-avatar-h selected' : 'manager-avatar-h';
    const styleName = type === 'classConfig' ? 'manager-avatar-h classConfigHover' : selectStyle;

    let name = '';
    if (item.teacherName && item.teacherName.length > 4) {
      name = `${item.teacherName.substring(0, 4)}...`;
    } else {
      name = item.teacherName;
    }

    return (
      <div
        className={styleName}
        onClick={this.selectManager}
        draggable="true"
        onDragStart={e => this.handleDragStart(e, item)}
        style={{ cursor: type === 'classConfig' ? 'move' : 'pointer' }}
        key={item.accountId}
      >
        <Avatar src={currentAvatar || TeacherAvatar} />
        <div className="right">
          <div
            className="name"
            title={item.teacherName && item.teacherName.length > 4 && item.teacherName}
          >
            {name}
          </div>

          <div className="mobile">
            {item.mobile ||
              formatMessage({
                id: 'app.message.notBindingMobilePhone',
                defaultMessage: '未绑定手机',
              })}
          </div>
        </div>
        {type === 'classConfig' && item.count && Number(item.count) > 0 && (
          <div className="count">{item.count}</div>
        )}
      </div>
    );
  }
}

export default ManagerAvatarH;
