import React, { Component } from 'react';
import { Popover } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import classNames from 'classnames';
import styles from './index.less';

const messages = defineMessages({
  classN: { id: 'app.campus.manage.basic.class', defaultMessage: '班' },
  dissolutionClassTit: {
    id: 'app.campus.manage.class.manage.dissolution.class.btn.title',
    defaultMessage: '解散本班',
  },
  openClassSwapBtnTit: {
    id: 'app.campus.manage.class.manage.open.class.swap.btn.title',
    defaultMessage: '开启本班异动',
  },
  classSwapTip: {
    id: 'app.campus.manage.class.manage.class.swap.tip',
    defaultMessage: '本班异动已开启',
  },
  teacher: {
    id: 'app.campus.manage.class.manage.class.item.teacher.title',
    defaultMessage: '教师',
  },
});
class ClassItem extends Component {
  state = {
    visible: false,
  };

  handleDelete = () => {
    const { onDelete } = this.props;
    onDelete();
  };

  // 解散本班
  dissolutionClass = () => {
    const { onDissolutionClass } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onDissolutionClass();
      }
    );
  };

  // 开启异动
  startSwap = () => {
    const { onStartSwap } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onStartSwap();
      }
    );
  };

  // 当元素在有效拖放目标上正在被拖动时运行
  handleDragOver = ev => {
    ev.preventDefault();
  };

  // 当被拖元素正在被拖放时运行
  handleDrop = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    const data = ev.dataTransfer.getData('data');
    const jsonData = JSON.parse(data);
    const { onDropEnd } = this.props;
    onDropEnd(jsonData);
  };

  render() {
    const { item, clickTeacher } = this.props;
    console.log('----clickTeacher:', clickTeacher);
    const clickTeacherId = clickTeacher && clickTeacher.teacherId;
    const { visible } = this.state;
    if (!item) {
      return null;
    }

    let name = '';
    if (item.teacherName && item.teacherName.length > 4) {
      name = `${item.teacherName.substring(0, 4)}...`;
    } else {
      name = item.teacherName;
    }

    if (item.teacherId) {
      const content = (
        <div className={styles.cont}>
          <div className={styles.selectItem} onClick={this.dissolutionClass}>
            {formatMessage(messages.dissolutionClassTit)}
          </div>
          {/* 是否开启了异动 */}
          {item.lastDays && Number(item.lastDays) > 0 ? (
            <div
              className={styles.selectItem}
              style={{ color: '#B2B2B2', background: 'rgba(245,245,245,1)' }}
            >
              {formatMessage(messages.classSwapTip)}
            </div>
          ) : (
            <div className={styles.selectItem} onClick={this.startSwap}>
              {formatMessage(messages.openClassSwapBtnTit)}
            </div>
          )}
        </div>
      );
      return (
        <div
          className={classNames(
            styles.hasManagerItem,
            clickTeacherId === item.teacherId ? styles.clickTeacherItem : null
          )}
          onDrop={this.handleDrop}
          onDragOver={this.handleDragOver}
          onMouseLeave={() => {
            this.setState({
              visible: false,
            });
          }}
        >
          <div className={styles.className}>
            {Number(item.classIndex)}
            {formatMessage(messages.classN)}
          </div>
          <div className={styles.teacherName}>
            <span>{formatMessage(messages.teacher)}：</span>
            <span title={item.teacherName && item.teacherName.length > 4 && item.teacherName}>
              {name}
            </span>
          </div>
          <Popover
            placement="bottomLeft"
            visible={visible}
            arrowPointAtCenter
            overlayClassName={styles.pop}
            content={content}
          >
            <i
              className="iconfont icon-set"
              onMouseEnter={() => {
                this.setState({
                  visible: true,
                });
              }}
            />
          </Popover>
        </div>
      );
    }

    if (!item.teacherId) {
      return (
        <div className={styles.classItem} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
          <span>
            {Number(item.classIndex)}
            {formatMessage(messages.classN)}
          </span>
        </div>
      );
    }
  }
}

export default ClassItem;
