import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import { Layout, message, Modal } from 'antd';
import IconTips from '@/frontlib/components/IconTips';
import IconButton from '@/frontlib/components/IconButton';
import DotTag from '../Components/DotTag';
import { toChinesNum } from '@/frontlib/utils/utils';
import showEarMicVolumeView from '@/frontlib/components/ExampaperAttempt/Components/PreExamCheck/EarMicVolumeView/api';
import showEndExamModal from '../Components/EndExamModal/api';
import showResultExamModal from '../Components/ResultExamModal/api';
import styles from './index.less';
import emitter from '@/utils/ev';

const messages = defineMessages({
  questionSelected: { id: 'app.selected.question', defaultMessage: '当前' },
  questionFinished: { id: 'app.is.finished', defaultMessage: '已完成' },
  questionEdited: { id: 'app.to.be.finished', defaultMessage: '未完成' },
  questionPass: { id: 'app.pass.question.proofread', defaultMessage: '通过' },
  questionProofread: { id: 'app.question.to.be.proofread', defaultMessage: '待校对' },
  questionModified: { id: 'app.question.modified', defaultMessage: '已修正' },
  saveBtn: { id: 'app.save', defaultMessage: '保存' },
  cancelBtn: { id: 'app.cancel', defaultMessage: '取消' },

  PaperTrialTips: { id: 'app.paper.exam.handup', defaultMessage: '举手' },
  PaperFeaturing: { id: 'app.paper.exam.earsetting', defaultMessage: '耳麦' },

  SubmitBtn: { id: 'app.exam.finished', defaultMessage: '结束本张试卷练习' },
  handInPaper: { id: 'app.button.exam.handInPaper', defaultMessage: '交卷' },
  PaperResult: {
    id: 'app.exam.check',
    defaultMessage: '查看练习结果',
  },
  closeBtn: { id: 'app.close.btn', defaultMessage: '关闭' },
});
const { Sider } = Layout;

/**
 * 考中练习左侧部分
 *
 */
@connect(({ examProduct }) => {
  const { exerciseList } = examProduct;
  return { exerciseList };
})
class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      isShow: false,
      height: 512,
    };
    this.index = 0;
  }

  componentDidMount() {
    const status = localStorage.getItem('ExampaperStatus');
    if (status) {
      const o = document.getElementById('left_middle');
      if (o) {
        var h = o.offsetHeight; //高度
        this.setState({ status: status, height: 582 - h - 20 });
      } else {
        this.setState({ status });
      }
    }
  }

  onClick(item, mainIndex, questionIndex, type) {
    this.props.index.changeFocusIndex(item, mainIndex, questionIndex, type);
  }

  /**
   * 渲染题序
   * @Author   tina.zhang
   * @DateTime 2018-12-27T17:33:26+0800
   * @param    {[type]}                 index [description]
   * @param    {[type]}                 label [description]
   * @return   {[type]}                       [description]
   */
  renderLabel(index, label) {
    const { masterData } = this.props;

    if (masterData.mains[index].newLabel) {
      return masterData.mains[index].newLabel;
    }

    if (index == 0) {
      this.index = 0;
    }

    if (masterData.mains[index].type == 'SPLITTER' || masterData.mains[index].type == 'RECALL') {
      this.index = this.index + 1;
      return;
    }

    if (index == 0) {
      return label;
    } else {
      return toChinesNum(Number(index) - this.index) + '、' + label;
    }
  }

  handleMouseOver = () => {
    // console.log('handleMouseOver');
    this.setState({ isShow: true });
  };

  handleMouseOut = () => {
    // console.log('handleMouseOut');
    this.setState({ isShow: false });
  };

  renderLengend() {
    const { isShow } = this.state;
    let legendData = [];
    legendData = [
      {
        color: '#FF9900',
        title: formatMessage(messages.questionSelected),
      },
      {
        color: '#03C46B',
        title: formatMessage(messages.questionFinished),
      },
      {
        color: '#FFFFFF',
        border: '#9AA7BE',
        title: formatMessage(messages.questionEdited),
      },
    ];

    return (
      <div className="popoverrelative">
        <div
          className="flex"
          style={{ width: 9 * legendData.length + 'px' }}
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseOut}
        >
          {legendData.map((item, index) => {
            return (
              <div className="flex_then" key={'legendData_' + index}>
                <div
                  className="dot"
                  style={{
                    backgroundColor: item.color,
                    border: '1px solid ' + (item.border || item.color),
                  }}
                />
              </div>
            );
          })}
        </div>
        {isShow ? (
          <div className="popoverflex" style={{ width: 55 * legendData.length + 'px' }}>
            {legendData.map((item, index) => {
              return (
                <div className="flex_then" key={'legendData_' + index}>
                  <div
                    className="dot"
                    style={{ backgroundColor: item.color, border: '1px solid ' + item.border }}
                  />
                  {<div className="legendtext">{item.title}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }

  renderDotTag(item) {
    const { masterData, paperData } = this.props;
    let questions = item.questions;
    let jsx = [];
    let answerStatus = 0;
    if (item.type != 'SPLITTER' && item.type != 'RECALL') {
      for (let i in questions) {
        /**
         * 考中答题完成
         * @type {Object}
         */
        let paperInstance = {};
        if (item.index > 0) {
          paperInstance = paperData.paperInstance[item.index - 1];
          let pattern = paperData.paperInstance[item.index - 1].pattern;
          if (pattern.questionPatternType == 'COMPLEX') {
            if (
              paperInstance.questions[0].data.groups[i].data.totalPoints ||
              paperInstance.questions[0].data.groups[i].data.totalPoints == 0
            ) {
              answerStatus = 100;
            } else {
              answerStatus = 0;
            }
          } else {
            if (
              paperInstance.questions[i].data.totalPoints ||
              paperInstance.questions[i].data.totalPoints == 0
            ) {
              answerStatus = 100;
            } else {
              answerStatus = 0;
            }
          }
        } else {
          answerStatus = 100;
        }
        if (questions[i].pageSplit == 'Y') {
          jsx.push(
            <DotTag
              status={answerStatus}
              arr={questions[i].subs}
              className={'marginLeft'}
              data={questions[i]}
              questionType={item.type}
              mainIndex={item.index}
              focusIndex={masterData.staticIndex}
              index={this}
              key={'DotTag_' + i}
            />
          );
          jsx.push(
            <div style={{ width: '163px', height: '1px', background: '#ccc', margin: '5px 0px' }} />
          );
        } else {
          jsx.push(
            <DotTag
              status={answerStatus}
              arr={questions[i].subs}
              className={'marginLeft'}
              data={questions[i]}
              questionType={item.type}
              mainIndex={item.index}
              focusIndex={masterData.staticIndex}
              index={this}
              key={'DotTag_' + i}
            />
          );
        }
      }
      return (
        <div className="flex" style={{ flexWrap: 'wrap', marginLeft: '-4px' }}>
          {jsx}
        </div>
      );
    } else if (item.type == 'SPLITTER') {
      return (
        <div className="flex">
          <DotTag
            status={questions[0].status}
            arr={['i']}
            data={questions[0]}
            questionType={item.type}
            mainIndex={item.index}
            focusIndex={masterData.staticIndex}
            index={this}
            key={'DotTags_' + 0}
          />
        </div>
      );
    }
  }

  renderContent() {
    const { masterData, paperData } = this.props;

    return (
      <div className="left-content" style={{ height: this.state.height }}>
        {masterData.mains.map((item, index) => {
          return (
            <div key={'mains_' + index}>
              <div
                className="title marginTop20-dot"
                onClick={() => {
                  if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
                    if (index == 0) {
                      return;
                    }
                    this.props.index.setState({ mainType: true, guideIndex: index });
                  }
                }}
              >
                {this.renderLabel(index, item.label)}
              </div>
              {this.renderDotTag(item)}
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-06
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData() {
    this.props.index.reLoadPaperData();
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-06
   * @copyright 刷新校对信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData() {
    this.props.index.reLoadVerifiesData();
  }

  /**
   * 音量调节
   * @Author   tina.zhang
   * @DateTime 2019-02-25T15:07:57+0800
   * @return   {[type]}                 [description]
   */
  volume() {
    const { getEarphoneVolume, getMicphoneVolume } = this.props.instructions;
    let type = '';
    // if (this.props.status != 'preExamCheck') {
    //   type = 'earphone';
    // }
    //耳机音量
    let earVolume = getEarphoneVolume();
    //麦克风音量
    let micVolume = getMicphoneVolume();

    showEarMicVolumeView({
      dataSource: {
        type: type, //type 必传  '':(耳麦调整)、earphone:（耳机调整）、micphone:（麦克风调整）
        earVolume: earVolume,
        micVolume: micVolume,
        instructions: this.props.instructions,
      },
    });
  }

  /**
   * 举手动作
   * @Author   tina.zhang
   * @DateTime 2019-02-25T15:08:12+0800
   * @return   {[type]}                 [description]
   */
  help() {
    const { sendMS } = this.props.instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS('help', { ipAddr: studentIpAddress });
    message.success(formatMessage({ id: 'app.text.raiseyourhand', defaultMessage: '举手成功！' }));
  }

  delay = time => {
    return new Promise(resove => {
      setTimeout(() => {
        resove();
      }, time);
    });
  };

  /**
   * 显示测试结果
   */
  showTestResult = async () => {
    const {
      exerciseList,
      index,
      instructions,
      paperData: { id },
    } = this.props;
    console.log('exerciseList2', exerciseList);
    if (window.ExampaperStatus === 'EXAM') {
      // 考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      const recordManager = vb.getRecorderManager();
      if (recordManager && vb.deviceState && vb.deviceState.value === 'recording') {
        message.warn(
          formatMessage({
            id: 'app.text.isTheRecordingPleaseStopTheRecording',
            defaultMessage: '正在录音中，请先停止录音',
          })
        );
        return;
      }
    }
    index.setState({ isPlay: false });
    await this.delay(100);
    index.updatePaperList({});
    await this.delay(100);
    showResultExamModal({
      dataSource: this.props.paperList,
      instructions,
      id,
      callback: () => {
        index.setState({ isPlay: true });
      },
    });
  };

  /**
   * 交卷, 练习模式下
   */
  handInPaper = async () => {
    if (window.ExampaperStatus === 'EXAM') {
      // 考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      const recordManager = vb.getRecorderManager();
      if (recordManager && vb.deviceState && vb.deviceState.value === 'recording') {
        message.warn(
          formatMessage({
            id: 'app.text.isTheRecordingPleaseStopTheRecording',
            defaultMessage: '正在录音中，请先停止录音',
          })
        );
        return;
      }
    }
    const {
      paperList,
      answersData,
      index,
      paperData: { id },
    } = this.props;
    index.setState({ isPlay: false });
    await this.delay(100);
    index.updatePaperList({});
    await this.delay(100);
    /**这边不要改了，就用this.props ============== tina.zhang */
    showEndExamModal({
      dataSource: this.props.paperList,
      answersData: this.props.answersData,
      id,
      callback: () => {
        index.setState({ isPlay: true });
        index.reLoadPaperList();
      },
    });
  };

  /**
   * 课后训练的交卷按钮
   */
  handInPaperAfterClass = async () => {
    if (window.ExampaperStatus !== 'EXAM') {
      // 非考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      if (vb && vb.getRecorderManager() && vb.getRecorderManager().recording) {
        message.warn(
          formatMessage({
            id: 'app.text.isTheRecordingPleaseStopTheRecording',
            defaultMessage: '正在录音中，请先停止录音',
          })
        );
        return;
      }
    }
    const { index } = this.props;
    index.setState({ isPlay: false });
    index.updatePaperList({});
    Modal.confirm({
      content: (
        <div className="cont">
          {formatMessage({
            id: 'app.message.sure.submit.this.test',
            defaultMessage: '确认提交本次训练结果？',
          })}
        </div>
      ),
      okText: formatMessage({ id: 'app.text.confirm', defaultMessage: '确认' }),
      okButtonProps: { type: 'main' },
      centered: true,
      cancelText: formatMessage({ id: 'app.text.cancel', defaultMessage: '取消' }),
      onOk: () => {
        index.setState({ isPlay: true });
        emitter.emit('recycle', 'continue');
      },
    });
  };

  /**
   * 客户端模式，进行练习
   */
  renderFooter = () => {
    return (
      <div className="left-bottom">
        <div className="left-bottom-border" onClick={this.volume.bind(this)}>
          <IconTips text={formatMessage(messages.PaperFeaturing)} iconName="icon-set" />
        </div>
        <div className="left-bottom-border" onClick={this.help.bind(this)}>
          <IconTips text={formatMessage(messages.PaperTrialTips)} iconName="icon-raise-hand" />
        </div>
        <div className="left-bottom-border" onClick={this.showTestResult}>
          <IconTips text={formatMessage(messages.PaperResult)} iconName="icon-eye" />
        </div>
        <div
          className="left-bottom-border"
          style={{ border: '1px solid #FFB400', background: '#FFB400' }}
          onClick={this.handInPaper}
        >
          <IconTips text={formatMessage(messages.SubmitBtn)} iconName="icon-right icon-color" />
        </div>
      </div>
    );
  };

  /**
   * 浏览器版本的练习（ 暂时用于课后练习 ）
   */
  renderFooterBrower = () => {
    return (
      <div className="left-bottom">
        <IconButton
          className="hand-in-paper"
          text={formatMessage(messages.handInPaper)}
          iconName="icon-right"
          textColor="white"
          onClick={this.handInPaperAfterClass}
        />
      </div>
    );
  };

  render() {
    const { paperData, ExampaperStatus } = this.props;
    const { status } = this.state;
    return (
      <Sider
        trigger={null}
        collapsed={false}
        breakpoint="lg"
        theme="light"
        width={200}
        className={styles.sider}
      >
        {/* 试卷标题+图例 */}
        <div className="left-middle" id="left_middle">
          <div className="paper-title">{paperData.name}</div>
          {this.renderLengend(status)}
        </div>
        {this.renderContent()}
        {ExampaperStatus === 'EXAM' ? this.renderFooter() : this.renderFooterBrower()}
      </Sider>
    );
  }
}

export default SiderMenu;
