import React, { PureComponent } from 'react';
import styles from './index.less';
import listening from '@/frontlib/assets/ExampaperAttempt/listening.gif';
import preparing from '@/frontlib/assets/ExampaperAttempt/preparing.gif';
import reading from '@/frontlib/assets/ExampaperAttempt/reading.gif';
import waiting from '@/frontlib/assets/ExampaperAttempt/waiting.gif';
import answer from '@/frontlib/assets/ExampaperAttempt/answer.gif';
import hint from '@/frontlib/assets/ExampaperAttempt/hint.gif';
import record from '@/frontlib/assets/record.gif';
import { message } from 'antd';
import { calculatScore, playResource, showLoading, hideLoading, getRatio,getRequest_obj, convertNote } from '@/frontlib/utils/utils';
import CountDown from './CountDown';
import PlayButtons from './PlayButtons';
import ProgressBar from './ProgressBar';
import { fetchPaperFileUrl } from '@/services/api';
import emitter from '@/utils/ev';
import saverecord from '@/frontlib/assets/saverecord.gif';
import RealVolumeIcon from '@/frontlib/components/RealVolumeIcon/index';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  toGuidance: { id: 'app.listen.to.guidance', defaultMessage: '听指导' },
  toTips: { id: 'app.listen.to.tips', defaultMessage: '听提示' },
});

/**
 * 整卷试做时间进度控制组件
 * @Author    tina.zhang
 * @DateTime  2018-10-17
 * @param     {[type]}    script        阶段脚本
 */
var ctx,
  can,
  index = 0,
  flag = true,
  wid = 300,
  hei = 64,
  x = 0,
  y = hei / 2,
  timestamp_arr = [],
  averageValue = 0,
  timer,
  globalTimer,
  renderCount = -1,
  cycle = 4,
  firstGetVolumn = true; ///第一次接收到实时音量回调
export default class PaperTimeProcess extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      end_time: 10,
      audioUrl: '',
      isLoad: true,
      flag: true,
      isAheadDelivery: false,
      isPlay: true,
      staticIndex: undefined,
      isEnd: false,
      onEval: false,
      automatiEnd: '',
      volumeData: null
    };
    this.iscallback = true;

    //删除无用事件
    emitter.removeAllListeners("toggleExamStatus");
    emitter.removeAllListeners("endExam");
    // 绑定试卷的开始暂停的监听事件
    emitter.addListener("toggleExamStatus", (tag) => {
      this.changePlay(tag);
    });

  }

  componentWillMount() {
    const { script, callback ,paperData,masterData} = this.props;
    this.state.redios = Number(paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.mainPatterns.markRatio) || 1;

    if (this.state.staticIndex == undefined) {
      this.state.staticIndex = this.props.masterData.staticIndex;
    }
    let self = this;
    if (window.ExampaperStatus == 'EXAM') {
      x = 0;
      let paperMd5 = localStorage.getItem('paperMd5');
      if (script.resourceUrl) {
        self.setState({
            audioUrl: window.paperUrl + '/' + paperMd5 + '/' + script.resourceUrl,
            end_time: script.time,
            isLoad: false,
          },
          e => {
            this.audioValue.addEventListener('canplay', function() {
              if (self.audioValue) {
                (self.audioValue).addEventListener('ended', function() {
                  console.log('音乐播放完毕');
                  callback('end');
                }, false)
              }
              console.log('音乐加载完毕');
            })
          }
        );
      } else {
        this.setState({ isLoad: false, end_time: script.time });
      }
    } else {
      if (script.resourceUrl && script.stepPhase != 'INTERVAL') {
        fetchPaperFileUrl({
          fileId: script.resourceUrl,
        }).then(e => {
          if (e.data) {
            self.setState({
                audioUrl: e.data.path,
                end_time: script.time,
                isLoad: false,
              },
              e => {
                this.audioValue.addEventListener('canplay', function() {
                  if (self.audioValue) {
                    (self.audioValue).addEventListener('ended', function() {
                      console.log('音乐播放完毕');
                      callback('end');
                    }, false)
                  }
                  console.log('音乐加载完毕');
                })
              }
            );
          }
        });
      } else {
        this.setState({ isLoad: false, end_time: script.time });
      }

      this.eventEmitter = emitter.addListener('endExam', x => {
        self.setState({ end_time: 0, isPlay: false });
        clearInterval(self.timer1);
      });
    }

    this.time = 0;
    if (script.stepPhase == 'PAPER_INTRODUCTION_COUNTDOWN') {
      self.paperHeadAutoRun();
    } else if (script.stepPhase == 'INTERVAL') {
      //时间间隔
      if (script.resourceUrl != "TYPE_00") {
        playResource({
          type: script.resourceUrl,
          success: () => {},
        });
      }
      self.myAutoRun();
    } else if (script.tone == "TYPE_00" || script.tone == undefined) {
      if (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE') {
        self.setState({ automatiEnd: (script.stepLabel + '').split('|')[0] });

        if (script.recordHints && (script.recordHints.start == "Y" || script.recordHints.start == null)) {
          playResource({
            type: "TYPE_D2",
            success: () => {
              if (self.state.isPlay) {
                self.myAutoRun();
              }
            },
          });
        } else {
          self.myAutoRun();
        }

      } else {
        self.myAutoRun();
      }
    } else {
      if (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE') {
        self.setState({ automatiEnd: (script.stepLabel + '').split('|')[0] });
        if (script.recordHints && (script.recordHints.start == "Y" || script.recordHints.start == null)) {
          playResource({
            type: "TYPE_D2",
            success: () => {
              playResource({
                type: script.tone,
                success: () => {
                  if (window.ExampaperStatus == "EXAM") {
                    self.myAutoRun();
                  }
                },
              });
              if (self.state.isPlay && window.ExampaperStatus != "EXAM") {
                self.myAutoRun();
              }
            },
          });
        } else {
          playResource({
            type: script.tone,
            success: () => {
              // if (window.ExampaperStatus == "EXAM") {
              if (self.state.isPlay) {
                self.myAutoRun();
              }
              // }
            },
          });
          // if (self.state.isPlay && window.ExampaperStatus != "EXAM") {
          //   self.myAutoRun();
          // }
        }

      } else {
        playResource({
          type: script.tone,
          success: () => {
            self.myAutoRun();
          },
        });

      }
    }
  }




  /**
   * 流程定时器
   * @author tina.zhang
   * @DateTime 2018-12-05T11:53:28+0800
   * @return   {[type]}                 [description]
   */
  myAutoRun() {
    const { script, callback } = this.props;
    let self = this;
    if (script.resourceUrl && script.stepPhase != 'INTERVAL') { //音频播放不需用计时，以音频实际时长为准。

    } else {
      self.setState({ automatiEnd: (script.stepLabel + '').split('|')[1] });
      this.timer1 = setInterval(() => {
        self.time += 1;
        // console.log(self.time / 10, script.time)
        if (self.time / 10 >= script.time) {
          self.state.automatiEnd = (script.stepLabel + '').split('|')[2];
        }

        self.setState({
            end_time: script.time - self.time / 10 >= 0 ? Math.floor(script.time - self.time / 10) : 0,
          },
          () => {
            if (
              self.time / 10 >= Number(script.time) - Number(script.aheadDelivery) &&
              !this.state.isAheadDelivery &&
              Number(script.aheadDelivery) != 0
            ) {
              //提前交卷
              self.setState({ isAheadDelivery: true });
            }
            if (self.time / 10 >= script.time) {
              clearInterval(self.timer1);
              if (self.iscallback) {
                if (script.stepPhase == 'ANSWER_PHASE' || script.stepPhase == 'SUB_ANSWER_PHASE') {
                  self.onsubmitAnswer('end');
                } else if (
                  script.stepPhase == 'RECORD_PHASE' ||
                  script.stepPhase == 'SUB_RECORD_PHASE'
                ) {
                  self.onsubmitRecordAnswer();
                }
                callback('end');
              }

              self.iscallback = false;
            }
          }
        );

      }, 100);

    }
  }

  /**
   * 开卷介绍倒计时
   * @author tina.zhang
   * @DateTime 2018-12-05T11:53:28+0800
   * @return   {[type]}                 [description]
   */
  paperHeadAutoRun() {
    const { script, callback } = this.props;
    let self = this;
    this.timer2 = setInterval(() => {
      self.time += 1;
      playResource({
        type: "TYPE_01",
        success: () => {},
      });
      self.setState({ end_time: script.time - self.time >= 0 ? Math.floor(script.time - self.time) : 0 },
        () => {
          if (self.time >= script.time) {
            clearInterval(self.timer2);
            if (self.iscallback) {
              callback('end');
            }
            self.iscallback = false;
          }
        }
      );
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {
    console.log('组件销毁', emitter);
    clearInterval(this.timer2);
    clearInterval(this.timer1);

    // this.eventEmitter_toggleExamStatus.remove();
    // this.eventEmitter.remove();

    // this.endRecord();
  }
  componentDidUpdate() {
    const { script, callback } = this.props;
    let self = this;


    let myVid = document.getElementById('audioUrl_' + script.resourceUrl);
    if (script.stepPhase.indexOf('RECORD_PHASE') > -1 && self.state.flag && self.state.automatiEnd == (script.stepLabel + '').split('|')[1]) {
      self.state.flag = false;
      // setTimeout(function(){self.startRecord();},100)
      self.startRecord();
    }
    if (myVid) {
      myVid.onloadeddata = function() {
        if (self.audioValue) {
          self.audioValue.play(0);
        }
      };
    }
  }

  onsubmitRecordAnswer() {
    console.log('停止录音');
    this.endRecord();
    // let that = this;
    // setTimeout(function() {
    //   that.props.self.props.index.stopRecorded("down");
    // }, 1000)
  }

  onsubmitAnswer(status = "down") {
    console.log('提交本题');
    const { type, masterData, paperData } = this.props;
    let dataSource = paperData.paperInstance[masterData.staticIndex.mainIndex - 1].questions;
    let staticIndex = masterData.staticIndex;
    let mainData;
    if (type == 'COMPLEX') {
      if (dataSource[0]) {
        mainData = dataSource[0].data;
        if (mainData) {
          let groupsItem = mainData.groups[staticIndex.questionIndex].data;
          this.props.self.scoringMachine(groupsItem);
        }
      }
    } else {
      if (dataSource[staticIndex.questionIndex]) {
        mainData = dataSource[staticIndex.questionIndex].data;
        if (mainData) {
          this.props.self.scoringMachine(mainData);
        }
      }
    }
    if (status == 'end') {} else {
      this.props.self.props.index.stopRecorded(status);
    }
  }

  //停止录音
  endRecord() {
    var vb = window.vb;
    var recordManager = vb.getRecorderManager();
    // if (recordManager && vb.deviceState &&vb.deviceState.value === "recording" ) {
    //   try {
    //     recordManager.stop();
    //   } catch (e) {}
    // }

    if(window.ExampaperStatus == "EXAM"){
      if (recordManager && vb.deviceState &&vb.deviceState.value === "recording" ) {
        try {
          recordManager.stop();
        } catch (e) {}
      }
    }else{
      if (recordManager ) {
        try {
          recordManager.stop();
        } catch (e) {}
      }
    }
  }


  //改版开始录音
  startRecord() {
    const { paperData, masterData, script } = this.props;
    let result=getRequest_obj(paperData,masterData,script.subMappingIndex[0],"CLOSED_ORAL",this.state.redios);
    let duration=result.duration
    this.setState({
      isRecord: 1,
      // time_second: duration,
    });

    var vb = window.vb;
    //console.log(vb.getRecorderManager());

    var recordManager = vb.getRecorderManager();

    // 录音启动前的回调
    recordManager.onStart(() => {
      const { onStateChange } = this.props;
      if (onStateChange && typeof(onStateChange) === "function") {
        onStateChange("recording");
      }
      console.log('vb-start--测试');
    });
    // 录音结束后的回调 返回音频的ID，用于回放录音使用
    recordManager.onStop(data => {
      this.state.automatiEnd = (script.stepLabel + '').split('|')[2];
      const { onStateChange } = this.props;
      let timer = data.timer;
      if (onStateChange && typeof(onStateChange) === "function") {
        onStateChange("unrecord");
      }

      console.log('vb-onStop-----测试');
      this.state.tokenId = data.tokenId;
      // clearInterval(timer);
      /*清除页面所有定时器*/
      let end = setInterval(function() {}, 100);
      let start = (end - 100) > 0 ? end - 100 : 0;
      for (let i = start; i <= end; i++) {
        if (i != timer) { //跳过评分引擎计时器
          clearInterval(i);
        }
      }

      if (window.ExampaperStatus == 'EXAM') {
        this.setState({ onEval: true });
        let res = {
          tokenId: data.tokenId,
          ...(result.request_obj),
        };

        this.props.scoringcallback(res, this.state.staticIndex);
        if (this.state.automatiEnd == (script.stepLabel + '').split('|')[2]) {
          if (script.recordHints && (script.recordHints.end == "Y" || script.recordHints.end == null)) {
            playResource({
              type: "TYPE_D3",
              success: () => {
                this.props.self.props.index.stopRecorded('down', true);
              },
            });
          } else {
            this.props.self.props.index.stopRecorded('down', true);
          }

        } else {
          if (this.state.isPlay) {
            this.props.self.props.index.stopRecorded('down', true);
          }
        }
      } else {
        showLoading({
          img: saverecord,
          callback: () => {
            let obj1 = document.getElementById('c-loading-change');
            obj1.addEventListener('click', this.changeNextStep, true);
          }
        });
      }
    });
    //录音实时音量回调
    recordManager.onVolumeMeter(data => {

       this.setState({
        volumeData:data
       })


    });

    //录音完成后，评分结果回调
    recordManager.onEval(result => {
      const { paperData, masterData } = this.props;
      // let times=getRatio(paperData, masterData);
      let times = this.state.redios;
      //console.log('----录音完成后-----');
      console.log(result);
      console.log('vb-onEval-----录音完成后');
      this.setState({ isRecord: -1, onEval: true });
      hideLoading();
      let res = JSON.parse(result);
      if (res.errId) {} else {
        res.result.overall = Math.round(res.result.overall / times);

        const ItemData = paperData.paperInstance[masterData.staticIndex.mainIndex-1].questions[masterData.staticIndex.questionIndex].data ;
        ItemData.subQuestion[script.subMappingIndex[0]].receivePoints = res.result.overall;
        ItemData.totalPoints = res.result.rank;
        let receivePoints = 0;
        for(let i in ItemData.subQuestion){
          if(ItemData.subQuestion[i].receivePoints){
            receivePoints = receivePoints + Number(ItemData.subQuestion[i].receivePoints);
          }
        }
        receivePoints = receivePoints/((ItemData.subQuestion).length)
        ItemData.receivePoints = receivePoints;
        console.log(ItemData,paperData)
        this.props.scoringcallback(res, this.state.staticIndex);

        if (this.state.automatiEnd == (script.stepLabel + '').split('|')[2]) {
          if (script.recordHints && (script.recordHints.end == "Y" || script.recordHints.end == null)) {
            playResource({
              type: "TYPE_D3",
              success: () => {
                this.props.self.props.index.stopRecorded('down', true);
              },
            });
          } else {
            this.props.self.props.index.stopRecorded('down', true);
          }

        } else {
          if (this.state.isPlay) {
            this.props.self.props.index.stopRecorded('down', true);
          }
        }
      }
    });
    //录音错误回调
    recordManager.onError(error => {
      console.log(error);
      if (typeof(error) == "string") {
        try{
          error = JSON.parse(error);
        }catch(e){
          console.error(e)
        }
      }
      console.log('vb-onError-----测试');
      if ((error.error).indexOf('AudioDeviceNotStart') > -1 && window.ExampaperStatus == 'EXAM') {
        return;
      }

      if (window.ExampaperStatus != 'EXAM') {
        if (error.errId == 10010) {
          message.warning('评分服务异常，请稍后再试。');
        } else if (error.errId == 10011) {
          message.warning('设备没有插麦克风，或者没有允许浏览器使用麦克风。');
        } else {
          message.warning('评分服务异常，请稍后再试。');
        }
      } else {
        message.warning('评分服务异常，请稍后再试。');
      }

      this.setState({ isRecord: -1 });
      hideLoading();

      if (window.ExampaperStatus != 'EXAM') {
        if (error && (error.error + "").indexOf("core timeout") > -1) {
          this.props.self.props.index.stopRecorded('down', true);
        }
      }


    });

    console.log('duration', duration);

    let requestObj = {
      duration: duration,
      hint: false,
      nsx: false,
    };
    if (window.ExampaperStatus != 'EXAM') {
      requestObj.request = result.request_obj;
    }
    recordManager.start(requestObj);
  }

  /**
   * 放弃评分跳转下一题
   * @Author   tina.zhang
   * @DateTime 2019-01-16T13:31:37+0800
   * @return   {[type]}                 [description]
   */
  changeNextStep = () => {
    var recordManager = vb.getRecorderManager();
    recordManager.cancel();
    hideLoading();
    this.props.self.props.index.stopRecorded('down', true);
  }

  changePlay = (isPlay) => {
    this.setState({ isPlay: isPlay });
    const { script } = this.props;
    let self = this;
    if (isPlay) {
      emitter.emit('changePlay', true);
      if (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE') {
        if (
          this.state.automatiEnd == (script.stepLabel + '').split('|')[0] ||
          this.state.automatiEnd == (script.stepLabel + '').split('|')[2] ||
          this.state.automatiEnd == ''
        ) {
          this.props.self.props.index.stopRecorded('down', true);
        } else {
          this.props.self.props.index.stopRecorded('down', this.state.onEval);
        }
      } else {
        this.myAutoRun();
        if (this.audioValue) {
          this.audioValue.play(0);
        }
      }
    } else {
      emitter.emit('changePlay', false);
      clearInterval(this.timer1);
      console.log('pause');
      this.endRecord();
      console.log("录音倒计时清0")
      //录音倒计时清0
      if (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE') {
        this.setState({ end_time: 0 }, () => {
          console.log("录音倒计时清0", self.state.end_time)
        });
      }

      if (this.audioValue) {
        this.audioValue.pause();
      }
    }
  }

  stopTheButton() {
    try {
      this.refs.theButton.stop();
    } catch {}
  }

  render() {
    const { script, isExam } = this.props;
    const { audioUrl, isLoad, isAheadDelivery, end_time, isPlay, onEval, automatiEnd,volumeData } = this.state;

    if (isLoad) {
      return null;
    }

    if (!isExam) {
      //空闲中
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={waiting} />
              <span className={styles.text}>空闲中</span>
            </div>
            <div />
          </div>
        </div>
      );
    }
    if (script.stepPhase == 'PAPER_INTRODUCTION' || script.stepPhase == 'SPLITTER_AUDIO') {
      return (
        <div>
          {audioUrl && (
            <audio
              ref={audio => {
                this.audioValue = audio;
              }}
              src={audioUrl}
              id={'audioUrl_' + script.resourceUrl}
              autoPlay
            />
          )}
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={hint} />
              <span className={styles.text}>{(script.stepLabel) || "空闲中"}</span>
            </div>

            {<PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else if (script.stepLabel.indexOf(formatMessage(messages.toGuidance)) > -1 || script.stepLabel.indexOf(formatMessage(messages.toTips)) > -1) {
      return (
        <div>
          {audioUrl && (
            <audio
              ref={audio => {
                this.audioValue = audio;
              }}
              src={audioUrl}
              id={'audioUrl_' + script.resourceUrl}
              autoPlay
            />
          )}
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={hint} />
              <span className={styles.text}>{script.stepLabel}</span>
            </div>
            <div />
            { <PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else if (script.stepPhase == 'READ_PHASE' || script.stepPhase == 'SUB_READ_PHASE' || script.stepPhase == 'VIDEO_PHASE') {
      //请读题
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={reading} />
              <span className={styles.text}>{(script.stepLabel + '').split('|')[0]}</span>
              <ProgressBar time={script.time} isPlay={isPlay} />
              <CountDown time={end_time} />
            </div>
            {<PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else if (script.stepPhase == 'LISTENING_PHASE' || script.stepPhase == 'SUB_LISTENING_PHASE') {
      //请听题
      let labelText = (script.stepLabel + '').split('|')[1];
      labelText = (labelText + '').split('#');
      return (
        <div>
          {audioUrl && (
            <audio
              ref={audio => {
                this.audioValue = audio;
              }}
              src={audioUrl}
              id={'audioUrl_' + script.resourceUrl}
              autoPlay
            />
          )}
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={listening} />
              <span className={styles.text}>{(script.stepLabel + '').split('|')[0]}</span>
              {/*<ProgressBar time={script.time} isPlay={isPlay} />*/}

              <span className={styles.little_text} style={{marginLeft:"14px"}}>{labelText[0]} </span>
              <span className={styles.redtext}>&nbsp; {labelText[1]} &nbsp;</span>
              <span className={styles.little_text}> {labelText[2]}</span>
            </div>
            {<PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else if (script.stepPhase == 'PREPARE_PHASE' || script.stepPhase == 'SUB_PREPARE_PHASE') {
      //请准备答题
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={preparing} />
              <span className={styles.text}>{(script.stepLabel + '').split('|')[0]}</span>
              <ProgressBar time={script.time} isPlay={isPlay} />
              <CountDown time={end_time} />
            </div>
            {<PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else if (script.stepPhase.indexOf('ANSWER_PHASE') > -1) {
      //普通答题
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={answer} />
              <span className={styles.text}>{(script.stepLabel + '').split('|')[0]}</span>
              <ProgressBar time={script.time} isPlay={isPlay} />
              <CountDown time={end_time} />
            </div>
            {isAheadDelivery ? (
              <div className={styles.right_btn} onClick={this.onsubmitAnswer.bind(this)}>
                {<div>提交本题</div>}
              </div>
            ) : (
              ""
            )}
            {window.ExampaperStatus != 'EXAM' &&<PlayButtons ref="theButton" index={this} callback={(e)=>{
              this.onsubmitAnswer(e);
            }}/>}
          </div>
        </div>
      );
    } else if (script.stepPhase == 'RECORD_PHASE' || script.stepPhase == 'SUB_RECORD_PHASE') {
      //录音
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              {/* <img src={record} /> */}
              {automatiEnd === (script.stepLabel + '').split('|')[1] ? (
                <RealVolumeIcon data={volumeData} />
              ) : <img src={record} /> }
              <span className={styles.text}>{automatiEnd}</span>

              {automatiEnd == (script.stepLabel + '').split('|')[1] && (
                <ProgressBar time={script.time} isPlay={isPlay} />
              )}
              {/* {automatiEnd == (script.stepLabel + '').split('|')[1] && (
                <div className={styles.bgline} />
              )} */}
              {/*<ProgressBar time={script.time} />*/}
              {automatiEnd == (script.stepLabel + '').split('|')[1] && (
                <CountDown time={end_time} />
              )}
            </div>
            {automatiEnd == (script.stepLabel + '').split('|')[1] ? (
              isAheadDelivery ? (
                <div className={styles.right_btn} onClick={this.onsubmitRecordAnswer.bind(this)}>
                  {<div>提交本题</div>}
                </div>
              ) : (
                ""
              )
            ) : (
              ''
            )}
            {window.ExampaperStatus != 'EXAM' &&<PlayButtons index={this} isRecord={true} onEval={onEval} automatiEnd={automatiEnd} script={script} />}
          </div>
        </div>
      );
    } else if (script.stepType == 'PLAY_AUDIO' || script.resourceUrl) {
      return (
        <div>
          {audioUrl && (
            <audio
              ref={audio => {
                this.audioValue = audio;
              }}
              src={audioUrl}
              id={'audioUrl_' + script.resourceUrl}
              autoPlay
            />
          )}
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={hint} />
              <span className={styles.text}>{script.stepLabel}</span>
            </div>
            <div />
            { <PlayButtons ref="theButton" index={this} />}
          </div>
        </div>
      );
    } else {
      //空闲中
      return (
        <div>
          <div className="right-bottom-pro">
            <div className={styles.flex}>
              <img src={waiting} />
              <span className={styles.text}>{(script.stepLabel) || "空闲中"}</span>
            </div>

            {<PlayButtons ref="theButton" index={this} isRecord={true} onEval={onEval} />}
          </div>
        </div>
      );
    }
  }
}
