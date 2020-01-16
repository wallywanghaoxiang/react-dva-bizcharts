// 基本信息
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Button, Input, message } from 'antd';
import CustomUpload from '@/frontlib/components/CustomUpload';
import userlogo from '@/assets/avarta_teacher.png';
import { getUserAvatar } from '@/services/api';
import styles from './index.less';

const messages = defineMessages({
  usercentermanage: { id: 'app.menu.account.user', defaultMessage: '基本设置' },
  usercenter: { id: 'app.menu.account.usercenter', defaultMessage: '个人中心' },
  avatarUpload: { id: 'app.avatar.upload.btn', defaultMessage: '上传新头像' },
  okText: { id: 'app.save', defaultMessage: '保存' },
  editText: { id: 'app.cancel', defaultMessage: '编辑' },
});

@connect(({ login }) => {
  const { campusList, avatar } = login;
  return { campusList, avatar };
})
class BasicSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: localStorage.getItem('imageUrl') || '',
      status: 0,
      nickName: localStorage.getItem('nickName'),
    };
    this.newUrl = '';
    this.id = '';
  }

  componentWillMount() {
    const that = this;
    if (localStorage.getItem('uid')) {
      getUserAvatar({
        fileId: localStorage.getItem('uid'),
      }).then(e => {
        that.setState({
          imageUrl: e.data.path,
        });
        localStorage.setItem('imageUrl', e.data.path);
      });
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   const { avatar } = nextProps;
  //   const { props } = this;
  //   const that = this;
  //   if (avatar !== props.avatar) {
  //     fetchPaperFileUrl({
  //       fileId:avatar
  //     }).then((e)=>{
  //       that.setState({
  //         imageUrl:e.data.path,
  //       })
  //       localStorage.setItem('imageUrl', e.data.path);
  //     })
  //   }
  // }

  /**
   * 上传
   */
  handleSuccess = (id, path) => {
    this.setState({
      imageUrl: path,
    });
    this.newUrl = path;
    this.id = id;
  };

  // 切换编辑或保存状态
  changeStatus = status => {
    const { dispatch } = this.props;
    const { nickName } = this.state;

    if (!status) {
      if (nickName.trim() === '') {
        message.warning(
          formatMessage({
            id: 'app.import.student.table.student.name.tip',
            defaultMessage: '姓名不能为空',
          })
        );
        return;
      }
      // 保存数据
      const that = this;
      dispatch({
        type: 'login/editTeacherInfoHeaderMobile',
        payload: {
          campusId: localStorage.getItem('campusId'),
          teacherId: localStorage.getItem('teacherId'),
          avatar: this.id,
          nickname: nickName,
        },
        callback: res2 => {
          if (res2.responseCode === '200') {
            getUserAvatar({
              fileId: localStorage.getItem('uid'),
            }).then(e => {
              dispatch({
                type: 'login/saveAvatarUrl',
                payload: {
                  url: e.data.path,
                },
              });
              that.setState({
                imageUrl: e.data.path,
              });
              localStorage.setItem('imageUrl', e.data.path);
            });
            localStorage.setItem('nickName', nickName);
          } else {
            message.error(res2.data);
          }
        },
      });
    }
    this.setState({
      status,
    });
  };

  // 保存新的姓名
  saveInput = e => {
    this.setState({ nickName: e.target.value });
  };

  // 显示编辑还是保存
  renderBtn = status => {
    if (status) {
      return (
        <Button className={styles.save} onClick={() => this.changeStatus(0)}>
          {formatMessage(messages.okText)}
        </Button>
      );
    }
    return (
      <Button className={styles.save} onClick={() => this.changeStatus(1)}>
        {formatMessage({
          id: 'app.teacher.manager.list.item.edit.btn.title',
          defaultMessage: '编辑',
        })}
      </Button>
    );
  };

  // 显示可编辑还是展示
  renderInput = (status, nickName) => {
    if (status) {
      return <Input defaultValue={nickName} onChange={this.saveInput} maxLength={20} />;
    }
    return nickName;
  };

  render() {
    const { imageUrl, status, nickName } = this.state;
    const { campusList } = this.props;
    const vbNumber = localStorage.getItem('vbNumber');
    return (
      <div className={styles.basicSet}>
        <h1 className={styles.nowTitle}>{formatMessage(messages.usercentermanage)}</h1>
        <div className={styles.userInfo}>
          <div className={styles.userDetail}>
            <dl>
              <dt>高耘号</dt>
              <dd>{vbNumber}</dd>
            </dl>
            <dl>
              {' '}
              <dt>姓名</dt>
              <dd>{this.renderInput(status, nickName)}</dd>
            </dl>
            <dl>
              <dt>所在学校</dt>
              <dd>
                {campusList.map(item => {
                  return <span key={item.campusId}>{item.campusName}</span>;
                })}
              </dd>
            </dl>
          </div>
          <div className={styles.userHeader}>
            <img className={styles.pic} src={imageUrl || userlogo} alt="logo" />
            {status ? (
              <CustomUpload
                className="upload"
                onSuccess={this.handleSuccess}
                name={formatMessage(messages.avatarUpload)}
                accept="image/*"
                uploadType="userImg"
              />
            ) : (
              ''
            )}
          </div>
          <div className={styles.clearfix} />
          <div className={styles.lastOperation}>{this.renderBtn(status)}</div>
        </div>
      </div>
    );
  }
}

export default BasicSet;
