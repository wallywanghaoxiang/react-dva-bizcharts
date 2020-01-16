import React, { PureComponent } from 'react';
import router from 'umi/router'
import styles from './index.less';
import IconTips from '@/frontlib/components/IconTips';
import DotTag from '../Components/DotTag';
import { Layout, Popover, message, Modal } from 'antd';
import { scoringMachine, calculatScore, toChinesNum,isNowRecording } from '@/frontlib/utils/utils';
import PaperTag from '../Components/PaperTag/api';
import { Link } from 'dva/router';
const confirm = Modal.confirm;
import { submitVerification, submitVerificationResult } from '@/services/api';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  questionSelected: { id: 'app.selected.question', defaultMessage: '当前' },
  questionFinished: { id: 'app.edit.finished', defaultMessage: '已制作' },
  questionEdited: { id: 'app.to.be.edited', defaultMessage: '待制作' },
  questionPass: { id: 'app.pass.question.proofread', defaultMessage: '通过' },
  questionProofread: { id: 'app.question.to.be.proofread', defaultMessage: '待校对' },
  questionModified: { id: 'app.question.modified', defaultMessage: '已修正' },
  saveBtn: { id: 'app.save', defaultMessage: '保存' },
  cancelBtn: { id: 'app.cancel', defaultMessage: '取消' },
  PaperTrialTips: { id: 'app.paper.trial.tips', defaultMessage: '试做' },
  PaperFeaturing: { id: 'app.paper.featuring', defaultMessage: '打标签' },
  SubmitBtn: { id: 'app.submit', defaultMessage: '提交' },
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
  closeBtn: { id: 'app.close.btn', defaultMessage: '关闭' },
});
const { Sider } = Layout;
let statusOK = 80;

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      isShow: false,
      height: 512,
      clickStatus:true
    };
    this.index = 0;
  }

  componentDidMount() {
    let status = localStorage.getItem('ExampaperStatus');
    if (status) {
      var o = document.getElementById("left_middle");
      if (o) {
        var h = o.offsetHeight; //高度
        this.setState({ status: status, height: 582 - h - 20 });
      } else {
        this.setState({ status: status });
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

    if (masterData.mains[index].type == "SPLITTER" || masterData.mains[index].type == "RECALL") {
      this.index = this.index + 1;
      return
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

  renderLengend(type) {
    const { isShow } = this.state;
    const { isExamine } = this.props;
    let legendData = [];
    switch (type) {
      /*制卷过程*/
      case 'EDIT':
        legendData = [{
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
        break;
      case 'VALIDATE':
        if (isExamine == '1') {
          legendData = [{
              color: '#FF9900',
              title: formatMessage(messages.questionSelected),
            },
            {
              color: '#03C46B',
              title: formatMessage(messages.questionPass),
            },
            {
              color: '#FFFFFF',
              border: '#9AA7BE',
              title: formatMessage(messages.questionProofread),
            },
            {
              color: '#228EFF',
              title: formatMessage(messages.questionModified),
            },
            {
              color: '#FF6E4A',
              title: '有误',
            },
          ];
        } else {
          legendData = [{
              color: '#FF9900',
              title: formatMessage(messages.questionSelected),
            },
            {
              color: '#03C46B',
              title: formatMessage(messages.questionPass),
            },
            {
              color: '#FFFFFF',
              border: '#9AA7BE',
              title: formatMessage(messages.questionProofread),
            },
            {
              color: '#228EFF',
              title: formatMessage(messages.questionModified),
            },
            {
              color: '#FF6E4A',
              title: '有误',
            },
          ];
        }

        break;
      case 'CORRECT':
        legendData = [{
            color: '#FF9900',
            title: formatMessage(messages.questionSelected),
          },
          {
            color: '#03C46B',
            title: formatMessage(messages.questionPass),
          },
          {
            color: '#FFFFFF',
            border: '#9AA7BE',
            title: formatMessage(messages.questionEdited),
          },
          {
            color: '#228EFF',
            title: formatMessage(messages.questionModified),
          },
          {
            color: '#FF6E4A',
            title: '有误',
          },
        ];
        break;
      default:
        legendData = [{
          color: '#FF9900',
          title: formatMessage(messages.questionSelected),
        }, ];
        break;
    }

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
    const { masterData } = this.props;
    let questions = item.questions;
    let jsx = [];
    if (item.type != "SPLITTER" && item.type != "RECALL") {
      for (let i in questions) {
        if (questions[i].pageSplit == "Y") {
          jsx.push(<DotTag
                      status={questions[i].status}
                      arr={questions[i].subs}
                      className={'marginLeft'}
                      data={questions[i]}
                      questionType={item.type}
                      mainIndex={item.index}
                      focusIndex={masterData.staticIndex}
                      index={this}
                      key={'DotTag_' + i}
                    />);
          jsx.push(<div style={{width:"163px",height:"1px",background: "#ccc",margin:"5px 0px"}}/>)
        } else {
          jsx.push(<DotTag
                      status={questions[i].status}
                      arr={questions[i].subs}
                      className={'marginLeft'}
                      data={questions[i]}
                      questionType={item.type}
                      mainIndex={item.index}
                      focusIndex={masterData.staticIndex}
                      index={this}
                      key={'DotTag_' + i}
                    />);
        }
      }
      return (<div className="flex" style={{ flexWrap: 'wrap', marginLeft: '-4px' }}>
                  {jsx}
            </div>)

    } else if (item.type == "SPLITTER") {
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
    const { masterData, paperData } = this.props;
    return (
      <div className="left-content" style={{height:this.state.height}}>
        {masterData.mains.map((item, index) => {
          return (
            <div key={'mains_' + index} >
              <div className="title marginTop20-dot" onClick={()=>{
                if(paperData.config && paperData.config.mainGuideSinglePage == "Y"){
                  if(index == 0){
                    return
                  }
                  this.props.index.setState({mainType:true,guideIndex:index})
                }
              }}>{this.renderLabel(index, item.label)}</div>
              {this.renderDotTag(item)}
            </div>
          );
        })}
      </div>
    );
  }

  /*校对完成后可提交总控校对*/
  validateSubmit() {
    if(isNowRecording()) return;
    const {clickStatus} = this.state;
    if(clickStatus) {
      const { paperData, invalidate, ExampaperStatus } = this.props;
      this.setState({
        clickStatus:false
      })
      if (ExampaperStatus == 'VALIDATE') {
        if (paperData.coverRate > statusOK || paperData.coverRate == statusOK) {
          const params = {
            paperId: paperData.id,
          };
          submitVerificationResult(params)
            .then(res => {
              if (res.responseCode === '200') {
                confirm({
                  title: formatMessage(messages.PaperMakingSubmitSuccess),
                  content: '',
                  okText: formatMessage(messages.closeBtn),
                  cancelText: formatMessage(messages.cancelBtn),
                  className: 'validateClose',
                  onOk() {
                    history.back(-1);
                  },
                  onCancel() {},
                });
              } else {
                this.setState({
                  clickStatus:true
                })
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
          this.setState({
            clickStatus:true
          })
          message.warning(formatMessage(messages.PaperMakingNoValidateSubmitAlert));
        }
      }
  
      //试卷制作完成可提交到校对
      if (ExampaperStatus == 'EDIT' || ExampaperStatus == 'CORRECT') {
        if (paperData.coverRate > statusOK || paperData.coverRate == statusOK) {
          const params = {
            paperId: paperData.id,
          };
          submitVerification(params)
            .then(res => {
              if (res.responseCode === '200') {
                confirm({
                  title: formatMessage(messages.PaperMakingSubmitValidateSuccess),
                  content: '',
                  okText: formatMessage(messages.closeBtn),
                  cancelText: formatMessage(messages.PaperMakingSubmitValidateSuccess),
                  className: 'validateClose',
                  onOk() {
                    history.back(-1);
                  },
                  onCancel() {},
                });
              } else {
                this.setState({
                  clickStatus:true
                })
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
          this.setState({
            clickStatus:true
          })
          message.warning(formatMessage(messages.PaperMakingNoEndSubmitAlert));
        }
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
   * @copyright 刷新校对信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData() {
    this.props.index.reLoadVerifiesData();
  }
  /*试卷tag*/
  paperTag() {
    const { paperData, ExampaperStatus, isExamine } = this.props;
    PaperTag({
      dataSource: {
        title: formatMessage({id:"app.text.sjbq",defaultMessage:"试卷标签"}),
        paperID: paperData.id,
        difficultLevel: paperData.difficultLevel,
        difficultLevelValue: paperData.difficultLevelValue,
        status: ExampaperStatus == 'VALIDATE' || isExamine == 1 ? 'SHOW' : '',
      },
      callback: questioJson => {
        this.reLoadVerifiesData();
        //this.reLoadPaperData();
      },
    });
  }

  renderFooter() {
    const { ExampaperStatus, isExamine, paperData } = this.props;

    if (isExamine == '1'&&ExampaperStatus!=='VALIDATE') {
      //查看模式
      return (
        <div className="left-bottom">
          <div className="left-bottom-border" onClick={this.paperTag.bind(this)}>
              <IconTips text={formatMessage(messages.PaperFeaturing)} iconName="icon-tag" />
            </div>
          <Link to={`/ExampaperLayout/ExampaperAttempt/${paperData.id}/SHOW/0`}>
            <div className="left-bottom-border">
              <IconTips text={formatMessage(messages.PaperTrialTips)} iconName="icon-v-play" />
            </div>
          </Link>
        </div>
      );
    }
    switch (ExampaperStatus) {      
      case 'EDIT':
        return (
          <div className="left-bottom">
            <div className="left-bottom-border" onClick={this.paperTag.bind(this)}>
              <IconTips text={formatMessage(messages.PaperFeaturing)} iconName="icon-tag" />
            </div>
            <Link to={`/ExampaperLayout/ExampaperAttempt/${paperData.id}/SHOW/0`}>
              <div className="left-bottom-border">
                <IconTips text={formatMessage(messages.PaperTrialTips)} iconName="icon-v-play" />
              </div>
            </Link>
            <div className="left-bottom-border" onClick={this.validateSubmit.bind(this)}>
              <IconTips text={formatMessage(messages.SubmitBtn)} iconName="icon-right" />
            </div>
          </div>
        );
      case 'VALIDATE':
        return (
          <div className="left-bottom">
            <div className="left-bottom-border" onClick={this.paperTag.bind(this)}>
              <IconTips text={formatMessage(messages.PaperFeaturing)} iconName="icon-tag" />
            </div>
            <Link to={`/ExampaperLayout/ExampaperAttempt/${paperData.id}/SHOW/0`}>
              <div className="left-bottom-border">
                <IconTips text={formatMessage(messages.PaperTrialTips)} iconName="icon-v-play" />
              </div>
            </Link>
            <div className="left-bottom-border" onClick={this.validateSubmit.bind(this)}>
              <IconTips text={formatMessage(messages.SubmitBtn)} iconName="icon-right" />
            </div>
          </div>
        );
      case 'CORRECT':
        return (
          <div className="left-bottom">
            <div className="left-bottom-border" onClick={this.paperTag.bind(this)}>
              <IconTips text={formatMessage(messages.PaperFeaturing)} iconName="icon-tag" />
            </div>
            <Link to={`/ExampaperLayout/ExampaperAttempt/${paperData.id}/SHOW/0`}>
              <div className="left-bottom-border">
                <IconTips text={formatMessage(messages.PaperTrialTips)} iconName="icon-v-play" />
              </div>
            </Link>
            <div className="left-bottom-border" onClick={this.validateSubmit.bind(this)}>
              <IconTips text={formatMessage(messages.SubmitBtn)} iconName="icon-right" />
            </div>
          </div>
        );
    }
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
        <div className="left-middle" id="left_middle">
          <div className="paper-title">{paperData.name}</div>
          {this.renderLengend(this.state.status)}
        </div>
        {this.renderContent()}
        {this.renderFooter()}
      </Sider>
    );
  }
}
