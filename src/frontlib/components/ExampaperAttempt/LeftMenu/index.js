import React, { PureComponent } from 'react';
import router from 'umi/router'
import styles from './index.less';
import IconTips from '@/frontlib/components/IconTips';
import DotTag from '@/frontlib/components/ExampaperProduct/Components/DotTag';
import { Layout, Popover, message, Modal } from 'antd';
import { scoringMachine, calculatScore, toChinesNum } from '@/frontlib/utils/utils';
const confirm = Modal.confirm;
import { submitVerification, submitVerificationResult } from '@/services/api';
import { Link } from 'dva/router';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import { close,isVb } from '@/frontlib/utils/instructions';

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
      this.setState({ status: status, height: 582 - h - 20 });
    } else {
      this.setState({ status: status });
    }
  }

  onClick(item, mainIndex, questionIndex, type) {
    this.props.index.changeFocusIndex(item, mainIndex, questionIndex, type);
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
    return (
      <div className="left-content" style={{height:this.state.height}}>
        {masterData.mains.map((item, index) => {
          return (
            <div key={'mains_' + index}>
              <div className="title marginTop20-dot">{this.renderLabel(index, item.label)}</div>
              {this.renderDotTag(item)}
            </div>
          );
        })}
      </div>
    );
  }

  /*校验完成后可提交总控校验*/
  validateSubmit() {
    const { paperData, invalidate, ExampaperStatus } = this.props;

    if (ExampaperStatus == 'VALIDATE') {
      if (paperData.coverRate > statusOK || paperData.coverRate == statusOK) {
        const params = {
          paperId: paperData.id,
        };
        submitVerificationResult(params)
          .then(res => {
            if (res.responseCode === '200') {
              confirm({
                title: formatMessage(messages.PaperMakingSubmitValidateSuccess), //'提交校验成功！',
                content: '',
                okText: '关闭',
                cancelText: '取消',
                className: 'validateClose',
                onOk() {
                  history.back(-1);
                },
                onCancel() {},
              });
            } else {
              message.warning(res.data);
              if(res.responseCode==='464') {
                router.push('/task')
              }
             
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        message.warning(formatMessage(messages.PaperMakingNoValidateSubmitAlert)) //'试卷尚未校验完成，请完成后再提交!');
      }
    }
    //试卷制作完成可提交到校验
    if (ExampaperStatus == 'EDIT' || ExampaperStatus == 'CORRECT') {
      if (paperData.coverRate > statusOK || paperData.coverRate == statusOK) {
        const params = {
          paperId: paperData.id,
        };
        submitVerification(params)
          .then(res => {
            if (res.responseCode === '200') {
              confirm({
                title: formatMessage(messages.PaperMakingSubmitSuccess), //'提交试卷校验成功！',
                content: '',
                okText: formatMessage({id:"app.text.closed",defaultMessage:"关闭"}),
                cancelText: formatMessage({id:"app.text.cancel",defaultMessage:"取消"}),
                className: 'validateClose',
                onOk() {
                  history.back(-1);
                },
                onCancel() {},
              });
            } else {
              message.warning(res.data);
              if(res.responseCode==='464') {
                router.push('/task')
              }
             
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        message.warning(formatMessage(messages.PaperMakingNoEndSubmitAlert)) //'试卷尚未制作完成，请完成后再提交校验!');
      }
    }
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
    const { index, masterData } = this.props;
    let a = true; //控制报告页是否为灰色
    let staticIndex = masterData.staticIndex;
    let mains = masterData.mains;
    let script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];
    if (script && script.stepPhase == "PAPER_INTRODUCTION_COUNTDOWN") {
      a = false;
    }

    return (
      <div>
        {this.props.isPreview ? ( //如果是试卷结构预览，则不显示查看报告按钮
          <div className="left-bottom">
            <div
              className={styles.cancel}
              onClick={() => {
                
                if(isVb) {
                  close();
                } else{ 
                  history.back(-1);
                }
              }}
            >
              <IconTips iconName = "icon-logout" text={formatMessage(messages.quit)}/>
            </div>
          </div>
        ) : (
          <div className="left-bottom">
            <div
              className={styles.cancel}
              onClick={() => {
                try{
                  if(message){
                    message.destroy()
                  }
                }catch(e){

                }
                
                index.goToReport();
              }}
              // to={{ pathname: `/ExampaperLayout/ExampaperReport/${index.getPaperId()}` }}
              // target="_blank"
            >
              <i className="iconfont icon-file" />
              <span className={styles.cancel_text}><FormattedMessage {...messages.reportBtn} /></span>
            </div>
            <div
              className={styles.quit}
              onClick={() => {
                history.back(-1);
              }}
            >
              <IconTips iconName = "icon-logout" text={formatMessage(messages.quit)}/>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { paperData } = this.props;
    const content = (
      <div>
        <p>Content</p>
        <p>Content</p>
      </div>
    );
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
        <div className="left-middle" id="left_middle_exam">
          <div className="paper-title">{paperData.name}</div>
        </div>
        {this.renderContent()}
        {this.renderFooter()}
      </Sider>
    );
  }
}
