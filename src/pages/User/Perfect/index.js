/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-18
 * Time: PM 13:32
 * Explain: 完善个人资料
 *
 * */
import React, { Component } from 'react';
import router from 'umi/router';
import { Input, Button, message } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
// import schoolGirl from '@/assets/user/school_girl.png';
// import schoolBoy from '@/assets/user/school_boy.png';
import selection from '@/assets/user/selection.png';
import logo from '@/assets/logo.png';

import iconLeft from '@/assets/examination/task_type_title_bg_left.png';
import iconRight from '@/assets/examination/task_type_title_bg_right.png';
import schoolGirl from '@/assets/student/female.png';
import schoolBoy from '@/assets/student/male.png';
import styles from './index.less';
import { Trim } from '@/utils/utils';

// 国际化适配方式
const messages = defineMessages({
  perfectSuccess: {
    id: 'app.menu.user.perfect success',
    defaultMessage: '已完善个人信息，请加入班级！',
  },
  perfectFailure: { id: 'app.menu.user.perfect failure', defaultMessage: '完善失败！' },
  tit: { id: 'app.student.perfect.title', defaultMessage: '完善个人资料' },
  nameInputPlaceholder: {
    id: 'app.student.perfect.name.input.placeholder',
    defaultMessage: '输入你的真实姓名，检查有没有错别字哦',
  },
  gender: { id: 'app.student.perfect.gender.title', defaultMessage: '我的性别' },
  btnTit: { id: 'app.student.perfect.submit.btn.title', defaultMessage: '我填写好了' },
  man: { id: 'app.student.perfect.gender.man.title', defaultMessage: '男生' },
  woman: { id: 'app.student.perfect.gender.woman.title', defaultMessage: '女生' },
});

@connect(() => ({}))
class Perfect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // userInfo:
      //   props.location.state && props.location.state.userInfo ? props.location.state.userInfo : {},
      // selectedSex: '',
      selectedSex: 'MALE', // 隐藏性别默认男
      inputName: '',
    };
  }

  componentDidMount() {
    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', () => {
        window.history.pushState('forward', null, '#');
        window.history.forward(1);
        localStorage.clear();
        window.location.href = '/user/login';
      });
    }

    window.history.pushState('forward', null, '#'); // 在IE中必须得有这两行
    window.history.forward(1);
  }

  // 修改成后回调重新列表
  selectedSex = type => {
    if (type === 'MALE') {
      this.setState({
        selectedSex: type,
      });
    } else {
      this.setState({
        selectedSex: type,
      });
    }
  };

  getInputValue = e => {
    this.setState({
      inputName: e.target.value,
    });
  };

  // 校验合法性
  inspectProblem = name => {
    const str = Trim(name, 'g');
    if (str === '' || str === null) {
      return true;
    }
    if (str.length > 20) {
      return true;
    }
    return false;
  };

  // 提交信息
  submitInfo = () => {
    const { dispatch } = this.props;
    const { selectedSex, inputName } = this.state;
    const uid = localStorage.getItem('uid');
    const params = {
      // avatar: userInfo.avatar,
      // email: userInfo.email,
      id: uid,
      // identityId: userInfo.identity.identityId,
      // loginCount: userInfo.loginCount,
      // mobile: userInfo.mobile,
      // nickname: userInfo.nickname,
      // vbNumber: userInfo.vbNumber,
      // verifyCode: userInfo.verifyCode,
      name: inputName,
      gender: selectedSex,
    };
    dispatch({
      type: 'perfect/editTeacherInfo',
      payload: params,
      callback: res => {
        if (res === '200' || res.responseCode === '200') {
          message.success(formatMessage(messages.perfectSuccess));
          localStorage.setItem('name', inputName);
          localStorage.setItem('gender', selectedSex);
          setTimeout(() => {
            router.push({
              pathname: '/student/center',
              // state: {
              //   paramsInfo: params,
              // },
            });
          }, 500);
        } else {
          message.error(formatMessage(messages.perfectFailure));
        }
      },
    });
  };

  handleOut = () => {
    localStorage.clear();
    window.location.href = '/user/login';
  };

  render() {
    const { selectedSex, inputName } = this.state;
    return (
      <div className={styles.perfect}>
        <div className={styles.loginOut} onClick={this.handleOut}>
          退出
        </div>
        <div className={styles.logo}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.center}>
          <div className={styles.center_box}>
            <div className={styles.title}>
              <span>{formatMessage(messages.tit)}</span>
            </div>
            <div className={styles.inputName}>
              <Input
                maxLength={20}
                size="large"
                onChange={this.getInputValue}
                placeholder={formatMessage(messages.nameInputPlaceholder)}
              />
            </div>

            {/* <div className={styles.genderflex}>
              <img src={iconLeft} alt="leftIcon" />
              <div className={styles.gender}>{formatMessage(messages.gender)}</div>
              <img src={iconRight} alt="rightIcon" />
            </div> */}
            {/* <div className={styles.selectSex}>
              <div
                className={styles.male}
                onClick={() => {
                  this.selectedSex('MALE');
                }}
              >
                <div className={styles.avatarBox}>
                  {selectedSex === 'MALE' ? <div className={styles.selection}><img src={selection} alt='' /></div> : null}
                  <img className={styles.genderIcon} src={schoolBoy} alt='' style={{opacity:selectedSex === 'MALE'?0.2:1}} />
                </div>
                <div className={styles.txt}>{formatMessage(messages.man)}</div>
              </div>
              <div
                className={styles.female}
                onClick={() => {
                  this.selectedSex('FEMALE');
                }}
              >
                <div className={styles.avatarBox}>
                  {selectedSex === 'FEMALE' ? <div className={styles.selection}><img src={selection} alt='' /></div> : null}
                  <img className={styles.genderIcon} src={schoolGirl} alt='' style={{opacity:selectedSex === 'FEMALE'?0.2:1}} />
                </div>
                <div className={styles.txt}>{formatMessage(messages.woman)}</div>
              </div>
            </div> */}
            <div className={styles.btn}>
              <Button
                type="primary"
                onClick={() => {
                  this.submitInfo();
                }}
                disabled={!selectedSex || this.inspectProblem(inputName)}
              >
                {formatMessage(messages.btnTit)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Perfect;
