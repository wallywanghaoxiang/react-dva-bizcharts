import React, { PureComponent } from 'react';
import styles from './index.less';
import DotTag from '@/frontlib/components/ExampaperProduct/Components/DotTag';
import { Layout, Popover, message, Modal } from 'antd';
import { toChinesNum } from '@/frontlib/utils/utils';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import showEarMicVolumeView from '../Components/PreExamCheck/EarMicVolumeView/api';

const messages = defineMessages({
  PaperMakingNoEndSubmitAlert: {
    id: 'app.paper.making.no.end.submit.alert',
    defaultMessage: '试卷尚未制作完成，请完成后再提交！',
  },
  PaperMakingSubmitSuccess: {
    id: 'app.paper.making.submit.success',
    defaultMessage: '提交试卷成功！',
  },
  PaperMakingNoValidateSubmitAlert: {
    id: 'app.paper.making.no.validate.submit.alert',
    defaultMessage: '试卷尚未校验完成，请完成后再提交!',
  },
  PaperMakingSubmitValidateSuccess: {
    id: 'app.paper.making.submit.validate.success',
    defaultMessage: '提交校验成功！',
  },
  reportBtn: { id: 'app.check.trial.report.btn', defaultMessage: '查看报告' },
  quit: { id: 'app.quit.paper.trial', defaultMessage: '退出' }
});
const { Sider } = Layout;
let statusOK = 80;

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      isShow: false,
      height: 512
    };
  }

  componentDidMount() {
    let status = localStorage.getItem('ExampaperStatus');
    var o = document.getElementById("left_middle_exam");
    if (o) {
      var h = o.offsetHeight; //高度
      this.setState({ status: status, height: 630 - h - 20 });
    } else {
      this.setState({ status: status });
    }
  }

  onClick(item, mainIndex, questionIndex, type) {
    this.props.index.changeFocusIndex(item, mainIndex, questionIndex, type);
  }

  help() {
    const { sendMS } = this.props.instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS('help', { ipAddr: studentIpAddress });
    message.success('举手成功！');
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
    console.log('handleMouseOver');
    this.setState({ isShow: true });
  };

  handleMouseOut = () => {
    console.log('handleMouseOut');
    this.setState({ isShow: false });
  };

  renderDotTag(item) {
    const { masterData } = this.props;
    let script =
    masterData.mains[masterData.staticIndex.mainIndex].questions[masterData.staticIndex.questionIndex].scripts[
      masterData.dynamicIndex.scriptIndex
    ];
    let questions = item.questions;
    let jsx = [];
    if (item.type != 'SPLITTER' && item.type != 'RECALL') {
      for (let i in questions) {
        if (questions[i].pageSplit == 'Y') {
          jsx.push(
            <DotTag
              status={questions[i].status}
              arr={questions[i].subs}
              className={'marginLeft'}
              data={questions[i]}
              questionType={item.type}
              mainIndex={item.index}
              focusIndex={masterData.staticIndex}
              index={this}
              isPlugin={script && script.isPlugin}
              key={'DotTag_' + i}
            />
          );
          jsx.push(
            <div style={{ width: '163px', height: '1px', background: '#ccc', margin: '5px 0px' }} />
          );
        } else {
          if(questions[i].subjectiveAndObjective && questions[i].subjectiveAndObjective === "SUBJECTIVE_ORAL"){

          }else{
              jsx.push(
                <DotTag
                  status={questions[i].status}
                  arr={questions[i].subs}
                  className={'marginLeft'}
                  data={questions[i]}
                  questionType={item.type}
                  mainIndex={item.index}
                  focusIndex={masterData.staticIndex}
                  isPlugin={script && script.isPlugin}
                  index={this}
                  key={'DotTag_' + i}
                />
              );
          }
          
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
    } else if (item.type == "RECALL") {
      return (<div className="flex">
                  <DotTag
                      status={questions[0].status}
                      arr={["i"]}
                      data={questions[0]}
                      questionType={item.type}
                      mainIndex={item.index}
                      focusIndex={masterData.staticIndex}
                      index={this}
                      key={'DotTags_' + 0}
                    />
            </div>)
    }
  }

  renderContent() {
    const { masterData } = this.props;
    let script;
    if(masterData.recallIndex){
      script = masterData.mains[masterData.recallIndex.mainIndex].questions[masterData.recallIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];
    }else{
      script = masterData.mains[masterData.staticIndex.mainIndex].questions[masterData.staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];
    }
    
    return (
      <div className="left-content" style={{height:this.state.height}}>
        {masterData.mains.map((item, index) => {
          if((item.subjectiveAndObjective === "OBJECTIVE" || item.type === "COMPLEX") && Number(script.recallIndex)>=Number(index)){
            return (
              <div key={'mains_' + index}>
                <div className="title marginTop20-dot">{this.renderLabel(index, item.label)}</div>
                {this.renderDotTag(item)}
              </div>
            );
          }else{
            return null
          }
          
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
   * @copyright 刷新校验信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData() {
    this.props.index.reLoadVerifiesData();
  }
  renderFooter() {
    const { status } = this.props;
    return (
      <div className="left-bottom">
        <div className={styles.cancel} onClick={this.volume.bind(this)}>
          <i className={'iconfont icon-set'} />
          <span className={styles.cancel_text}>&nbsp;{status !== 'preExamCheck' && status !== 'preExamCheckError' ? "耳机":"耳麦"}</span>
        </div>
        <div className={styles.cancel} onClick={this.help.bind(this)}>
          <i className={'iconfont icon-raise-hand'} />
          <span className={styles.cancel_text}>&nbsp;举手</span>
        </div>
      </div>
    );
  }

  render() {
    const { paperData } = this.props;
    return (
      <Sider
        trigger={null}
        collapsed = {false}
        breakpoint="lg"
        theme="light"
        width={200}
        className={styles.sider}
      >
        {/*试卷标题+图例*/}
        {/* <div className="left-middle" id="left_middle_exam">
          <div className="paper-title">{paperData.name}</div>
        </div> */}
        <div className={styles.left_middle}>
          <div className={styles.title}>{formatMessage({id:"app.text.checkanswering",defaultMessage:"正在校对答案"}) + "..."}</div>
          <div className={styles.paper_title}>{formatMessage({id:"app.text.recalltips",defaultMessage:"点击题目序号修改答案"})}</div>
        </div>
        {this.renderContent()}
        {window.ExampaperStatus === 'EXAM' && this.renderFooter()}
      </Sider>
    );
  }
}
