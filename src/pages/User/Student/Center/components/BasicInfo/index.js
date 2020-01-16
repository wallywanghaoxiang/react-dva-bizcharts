import React, { Component } from 'react';
import { Divider, Radio, Button } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import iconLeft from '@/assets/examination/task_type_title_bg_left.png';
import iconRight from '@/assets/examination/task_type_title_bg_right.png';
import schoolGirl from '@/assets/student/female.png';
import smallLogo from '@/assets/student/user_id_icon.png';
import schoolBoy from '@/assets/student/male.png';
import styles from './index.less';
import ClassTag from './ClassTag/index';
import CustomUpload from '@/frontlib/components/CustomUpload';

const messages = defineMessages({
  avatarUpload: { id: 'app.avatar.upload.btn', defaultMessage: '上传新头像' },
  personInfoTit: { id: 'app.student.user.center.person.center.title', defaultMessage: '个人信息' },
  nameTit: { id: 'app.student.user.center.person.center.name.title', defaultMessage: '姓名' },
  nameIputPlaceholder: {
    id: 'app.student.perfect.name.input.placeholder',
    defaultMessage: '输入你的真实姓名，检查有没有错别字哦',
  },
  genderTit: { id: 'app.student.user.center.person.center.gender.title', defaultMessage: '性别' },
  saveBtnTit: { id: 'app.save', defaultMessage: '保存' },
  classTit: { id: 'app.student.user.center.person.center.class.title', defaultMessage: '所在班级' },
});

@connect(({ login, file }) => {
  const { studentInfoList } = login;
  const { userImgPath } = file;

  return {
    studentInfoList,
    userImgPath,
  };
})
class BasicInfo extends Component {
  state = {
    name: localStorage.getItem('name'),
    studentCode: '',
    gender: localStorage.getItem('gender'),
    editAvatar: false,
    avatarId: '',
  };

  componentWillMount() {}

  // 名字
  nameInputChange = e => {
    this.setState({
      name: e.target.value,
    });
  };

  // 学籍号
  // stuCodeInputChange = (e) => {
  //   this.setState({
  //     studentCode:e.target.value
  //   })
  // }

  // 性别
  onGenderChange = e => {
    this.setState({
      gender: e.target.value,
    });
  };

  saveInfo = () => {
    const { name, gender, avatarId } = this.state;
    const { dispatch, onSaveInfoSuccess } = this.props;
    const uid = localStorage.getItem('uid');
    let params = { id: uid };
    if (name) {
      params['name'] = name;
    }
    if (gender && gender !== 'null') {
      params['gender'] = gender;
    } else {
      // 默认值
      params['gender'] = 'MALE';
    }
    if (avatarId) {
      params['avatar'] = avatarId;
    }
    dispatch({
      type: 'login/editStudentInfo',
      payload: params,
      callback: () => {
        onSaveInfoSuccess();
        if (avatarId) {
          localStorage.setItem('avatar', avatarId);
        }
        localStorage.setItem('name', name);
        localStorage.setItem('gender', gender);
      },
    });
  };

  handleEditAvatar = () => {
    const { editAvatar } = this.state;
    this.setState({
      editAvatar: !editAvatar,
    });
  };

  handleSuccess = (id, path, name) => {
    // console.log(id,path,name);
    const { dispatch } = this.props;
    this.setState(
      {
        avatarId: id,
      },
      () => {
        this.saveInfo();
      }
    );

    dispatch({
      type: 'file/updateAvatarPath',
      payload: { path },
    });
  };

  render() {
    const { name, studentCode, gender, editAvatar } = this.state;
    const { studentInfoList, userImgPath } = this.props;
    const canUse = name && gender; // 保存按钮控制
    const nameInputReadOnly = studentInfoList.length > 0; // 姓名只读
    const vbNumber = localStorage.getItem('vbNumber');
    const defaultAvatar = gender === 'MALE' ? schoolBoy : schoolGirl;

    return (
      <div className={styles.basicInfo}>
        <div className={styles.userInfoflex} style={{ marginBottom: '20px' }}>
          <img src={iconLeft} alt="leftIcon" />
          <div className={styles.headerTit}>{formatMessage(messages.personInfoTit)}</div>
          <img src={iconRight} alt="rightIcon" />
        </div>
        <div className={styles.editInfoBox}>
          {/* 头像和高耘号 */}
          <div className={styles.left}>
            <img src={userImgPath ? userImgPath : defaultAvatar} alt="userImg" />
            {editAvatar && (
              <div className={styles.upload}>
                <CustomUpload
                  uploadType="userImg"
                  name={formatMessage(messages.avatarUpload)}
                  onSuccess={this.handleSuccess}
                  accept="image/*"
                />
              </div>
            )}

            {/* 高耘号 */}
            <div className={styles.VBNumber}>
              <img src={smallLogo} alt="smallLogo" />
              <Divider type="vertical" />
              <span>{vbNumber}</span>
            </div>
            <div className={styles.editBtn} onClick={this.handleEditAvatar}>
              <i className="iconfont icon-edit" style={{ fontSize: '13px' }} />
            </div>
          </div>
          {/* 姓名和性别 */}
          <div className={styles.right} style={{ paddingTop: '30px' }}>
            <div className={styles.editItem}>
              <div className={styles.itemTit}>{formatMessage(messages.nameTit)}：</div>
              <input
                placeholder={formatMessage(messages.nameIputPlaceholder)}
                value={name}
                onChange={this.nameInputChange}
                maxLength={20}
                readOnly={nameInputReadOnly}
              />
            </div>
            {/* <div className={styles.editItem}>
                  <div className={styles.itemTit}>学籍号：</div>
                  <input placeholder="请输入16位学籍号" value={studentCode} onChange={this.stuCodeInputChange} maxLength={19} />   
                </div> */}
            {/* <div className={styles.editItem}>
              <div className={styles.itemTit}>{formatMessage(messages.genderTit)}：</div>
              <Radio.Group onChange={this.onGenderChange} value={gender}>
                <Radio value="MALE" disabled={nameInputReadOnly}>
                  男
                </Radio>
                <Radio value="FEMALE" disabled={nameInputReadOnly}>
                  女
                </Radio>
              </Radio.Group>
            </div> */}
            {!nameInputReadOnly && (
              <div className={styles.submitBtn}>
                <Button onClick={this.saveInfo} disabled={!canUse}>
                  {formatMessage(messages.saveBtnTit)}
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* 所在班级 */}
        {studentInfoList.length > 0 && (
          <div>
            <div className={styles.userInfoflex} style={{ margin: '20px 0px' }}>
              <img src={iconLeft} alt="leftIcon" />
              <div className={styles.headerTit}>{formatMessage(messages.classTit)}</div>
              <img src={iconRight} alt="rightIcon" />
            </div>
            <div className={styles.campusClassBox}>
              {studentInfoList.map(item => {
                return (
                  <div className={styles.campusClassItem} key={item.campusId}>
                    <div className={styles.campusName}>{item.campusName}</div>
                    <div className={styles.classList}>
                      {item.classList.map(tag => {
                        return <ClassTag data={tag} key={tag.classId} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BasicInfo;
