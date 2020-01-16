import React, { PureComponent } from 'react';
import styles from './index.less';
import { Layout, Popover, message, Modal } from 'antd';
import showEarMicVolumeView from '../Components/PreExamCheck/EarMicVolumeView/api';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

const { Sider } = Layout;

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      isShow: false,
    };
  }

  help() {
    const { sendMS } = this.props.instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS('help', { ipAddr: studentIpAddress });
    message.success(formatMessage({id:"app.text.raiseyourhand",defaultMessage:"举手成功！"}));
  }

  volume() {
    const { instructions, status } = this.props;
    const { getEarphoneVolume, getMicphoneVolume } = instructions;
    let type = '';
    if ( status !== 'preExamCheck' && status !== 'preExamCheckError' ) {
      type = 'earphone';
    }
    // 耳机音量
    const earVolume = getEarphoneVolume();
    // 麦克风音量
    const micVolume = getMicphoneVolume();

    showEarMicVolumeView({
      dataSource: {
        type, // type 必传  '':(耳麦调整)、earphone:（耳机调整）、micphone:（麦克风调整）
        earVolume,
        micVolume,
        instructions,
      },
    });
  }

  renderFooter() {
    const { status } = this.props;
    return (
      <div className="left-bottom">
        <div className={styles.cancel} onClick={this.volume.bind(this)}>
          <i className={'iconfont icon-set'} />
          <span className={styles.cancel_text}>&nbsp;{status !== 'preExamCheck' && status !== 'preExamCheckError' ? formatMessage({id:"app.text.earphone",defaultMessage:"耳机"}):formatMessage({id:"app.text.headset",defaultMessage:"耳麦"})}</span>
        </div>
        <div className={styles.cancel} onClick={this.help.bind(this)}>
          <i className={'iconfont icon-raise-hand'} />
          <span className={styles.cancel_text}>&nbsp;{formatMessage({id:"app.text.raisehand",defaultMessage:"举手"})}</span>
        </div>
      </div>
    );
  }

  render() {
    const { paperData, status, number, ExampaperStatus } = this.props;
    const studentInfo = localStorage.getItem('studentInfo');
    const studentJson = JSON.parse(studentInfo);
    const localStorage_number = localStorage.getItem('number');

    return (
      <Sider
        trigger={null}
        collapsible
        breakpoint="lg"
        theme="light"
        width={200}
        className={styles.sider}
      >
        {
          ExampaperStatus === "AFTERCLASS" ? (
            <div className={styles.studentInfo}>
              <div className={styles.baseInfoTitle}>
                {formatMessage({id:"app.text.studentInfo",defaultMessage:"学生信息"})}
              </div>
              <div className={styles.stuName}>
                {studentJson && studentJson.name ? studentJson.name : ''}
              </div>
              <div className={styles.baseInfo}>
                <span>{studentJson && studentJson.studentNo ? studentJson.studentNo : ''}</span>{formatMessage({id:"app.text.studentNo",defaultMessage:"学号"})}
              </div>
            </div>
          ) : (
            <div className={styles.studentInfo}>
              <div className={styles.baseInfoTitle}>
                {formatMessage({id:"app.text.examstudentInfo",defaultMessage:"考生信息"})}
              </div>
              <div className={styles.stuName}>
                {studentJson && studentJson.name ? studentJson.name : ''}
              </div>
              <div className={styles.baseInfo}>
                <span> {number && number !== '' ? number : localStorage_number ? localStorage_number : ''}</span> {formatMessage({id:"app.text.seatNo",defaultMessage:"座位号"})}
              </div>

              <div className={styles.baseInfo}>
                <span>{studentJson && studentJson.id ? studentJson.id : ''}</span>{formatMessage({id:"app.text.examNo",defaultMessage:"考号"})}
              </div>
            </div>
          )
        }


        {ExampaperStatus !== "AFTERCLASS" && this.renderFooter()}
      </Sider>
    );
  }
}
