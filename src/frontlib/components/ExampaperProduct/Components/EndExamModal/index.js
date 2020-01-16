import React, { Component } from 'react';
import { Modal, message, Divider } from 'antd';
import styles from './index.less';
import { DoWithNum } from '@/frontlib/utils/utils';
import { formatMessage, FormattedMessage } from 'umi/locale';
import emitter from '@/utils/ev';
import { countDown } from '@/utils/timeHandle';

/**
 * 保存开卷介绍入参 {
paperId (string, optional): 试卷ID ,
paperHeadName (string, optional): 开卷介绍文本 ,
paperHeadAudio (string, optional): 开卷介绍音频ID ,
paperIntroductionTime (integer, optional): 开卷介绍音频持续时间 ,
navTime (integer, optional): 跳转倒计时
}
 */
class EndExamModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      upLoadSuccess: false,
      id: '',
      duration: 0,
      audioData: null,
      name: '',
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    if (dataSource.paperHeadAudioUrl) {
      this.paperHeadName = dataSource.paperHeadName;
      this.navTime = dataSource.paperHeadNavTime;
      this.setState({
        id: dataSource.paperHeadAudio,
        audioUrl: dataSource.paperHeadAudioUrl,
        duration: dataSource.paperHeadAudioTime,
        name: dataSource.name,
      });
    }
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
    this.props.callback();
  };
  onHandleOK = () => {
    let self = this;
    const { form } = self.props;
    form.validateFields((err, values) => {
      if (err) {
        message.warning(
          formatMessage({ id: 'app.text.validateFields', defaultMessage: '请填写完整数据！' })
        );
        return;
      } else {
        if (Number(self.navTime) >= 0) {
          self.props.callback(self.paperHeadName, self.navTime, self.state, this.paperHeadDelay);
          self.setState({
            visible: false,
          });
          self.props.onClose();
        } else {
          // message.warning('等待时间请输入大于0的数字!');
        }
      }
    });
  };

  isRequired = (rules, value, callback) => {
    if (Number(value) >= 0 && Number(value) < 100) {
      callback();
    } else {
      callback(
        formatMessage({
          id: 'app.text.ddsjqsrxy',
          defaultMessage: '等待时间请输入大于0,小于100的数字',
        })
      );
    }
  };

  render() {
    const { dataSource, id, answersData } = this.props;
    const { upLoadSuccess, name, audioUrl, isPlay } = this.state;

    let hadExam = false;
    for (let i in dataSource) {
      if (dataSource[i].finishTime && Number(dataSource[i].paperId) != Number(id)) {
        hadExam = true;
      }
    }

    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        closable={false}
        title={<FormattedMessage id="app.open.book.add.btn" defaultMessage="交卷" />}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.PaperModal}
        destroyOnClose={true}
        maskClosable={false}
        footer={
          <div className={styles.footer_flex}>
            <div className={styles.white} onClick={this.onHandleCancel}>
              {formatMessage({ id: 'app.text.jxlx', defaultMessage: '继续练习' })}
            </div>
            <div
              className={styles.green}
              onClick={() => {
                if (!this.state.visible) {
                  return;
                }
                this.setState({
                  visible: false,
                });
                this.props.onClose();
                emitter.emit('recycle', 'continue');
              }}
            >
              {formatMessage({ id: 'app.button.exam.handInPaper', defaultMessage: '交卷' })}
            </div>
            {/* <div className={styles.red} onClick={()=>{
                if(!this.state.visible){
                  return
                }
                console.log("结束练习")
                this.setState({
                  visible: false,
                });
                this.props.onClose();
                emitter.emit("recycle", "");
              }}>
                结束练习
              </div> */}
          </div>
        }
      >
        {hadExam && (
          <div className={styles.sub_title} style={{ marginTop: 10 }}>
            {formatMessage({ id: 'app.text.yjj', defaultMessage: '已交卷' })}
          </div>
        )}
        {dataSource.map((item, index) => {
          if (item.finishTime && item.paperId != id) {
            return (
              <div className={styles.sub_content}>
                <div>
                  <div className={styles.sub_contentName}>{item.name}</div>
                  <div>
                    <span className={styles.sub_contentTip}>
                      {formatMessage({ id: 'app.text.yongshi', defaultMessage: '用时' })}：
                    </span>
                    <span className={styles.sub_contentCon}>{countDown(item.finishTime)}</span>
                    <Divider type="vertical" />
                    <span className={styles.sub_contentTip}>
                      {formatMessage({ id: 'app.text.yizuo', defaultMessage: '已做' })}：
                    </span>
                    <span className={styles.sub_contentCon}>
                      {item.answeredNum || 0}/{item.questionPointCount || 0}
                      {formatMessage({ id: 'app.text.subquestion', defaultMessage: '小题' })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className={styles.getScore}>
                    {(item.answersData &&
                      item.answersData.totalScore &&
                      DoWithNum(item.answersData.totalScore)) ||
                      0}
                  </span>
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                  /{item.fullMark || 100}
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                </div>
              </div>
            );
          }
        })}

        <div
          className={styles.sub_title}
          style={{ borderBottom: '0px', borderTop: '1px solid #e5e5e5' }}
        >
          {formatMessage({ id: 'app.text.dqsj', defaultMessage: '当前试卷' })}
        </div>
        {dataSource.map((item, index) => {
          if (item.paperId == id) {
            return (
              <div className={styles.sub_content} style={{ background: 'rgba(183,255,208,1)' }}>
                <div>
                  <div className={styles.sub_contentName}>{item.name}</div>
                  <div>
                    <span className={styles.sub_contentTip}>
                      {formatMessage({ id: 'app.text.yongshi', defaultMessage: '用时' })}：
                    </span>
                    <span className={styles.sub_contentCon}>{countDown(item.finishTime)}</span>
                    <Divider type="vertical" />
                    <span className={styles.sub_contentTip}>
                      {formatMessage({ id: 'app.text.yizuo', defaultMessage: '已做' })}：
                    </span>
                    <span className={styles.sub_contentCon}>
                      {item.answeredNum || 0}/{item.questionPointCount || 0}
                      {formatMessage({ id: 'app.text.subquestion', defaultMessage: '小题' })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className={styles.getScore}>
                    {(answersData && answersData.totalScore && DoWithNum(answersData.totalScore)) ||
                      0}
                  </span>
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                  /{item.fullMark || 100}
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                </div>
              </div>
            );
          }
        })}
      </Modal>
    );
  }
}

export default EndExamModal;
