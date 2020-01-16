/**
 * 主体模块右下角相关的内容
 * state :   String    //  图标状态
 *     free          : "空闲中",
 *     record        : "录音中"
 *     answer        : "答题中"
 *     ready         : "准备中"
 *     playQuestion  : "听题中"
 *     readQuestion  : "请读题"
 *     playSystem    : "系统放音中(听提示/听指导/开始录音/录音结束)"
 *     finish       : "成功的状态
 *  title :   String   // 当前的标题 （ 如果为空，用下面的默认值，否则用自定义的值 ）
 *     free          : "空闲中",
 *     record        : "录音中"
 *     answer        : "请答题"
 *     ready         : "请准备"
 *     playQuestion  : "请听题"
 *     readQuestion  : "请读题"
 *     playSystem    : "听提示"
 *     finish        : "录音完成"
 *  time      : Number   // 当前次数  第 1 遍  当前主要用于( 请听题 )， 以后可能回用于其它状态，如多次答题之类的
 *  countDown : Number   // 倒计时
 *  control   : Boolean  // 是否显示 上一步 下一步 开始 停止的功能
 *  level     : 0-5      // 路由的时候音量大小级别（0，5）
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import ProgressBar from './ProgressBar';
import styles from './index.less';
import listening from './assets/listening.gif';
import preparing from './assets/preparing.gif';
import reading from './assets/reading.gif';
import waiting from './assets/waiting.gif';
import answer from './assets/answer.gif';
import hint from './assets/hint.gif';
import record from './assets/record.gif';
import finish from './assets/record_finish.gif';
import volume0 from './assets/VolumeIcon/volume_0.png';
import volume1 from './assets/VolumeIcon/volume_1.png';
import volume2 from './assets/VolumeIcon/volume_2.png';
import volume3 from './assets/VolumeIcon/volume_3.png';
import volume4 from './assets/VolumeIcon/volume_4.png';
import volume5 from './assets/VolumeIcon/volume_5.png';


// 默认的state 对于的 icon 和 title
const defaultState = (state="free")=>({
  "free"         : { icon : waiting,   title : formatMessage({id:"app.message.free",defaultMessage:"空闲中"}),      hasCountDown : false },
  "record"       : { icon : record,    title : formatMessage({id:"app.audio.recording",defaultMessage:"录音中"}),   hasCountDown : true },
  "answer"       : { icon : answer,    title : formatMessage({id:"app.please.answer",defaultMessage:"请答题"}),     hasCountDown : true },
  "ready"        : { icon : preparing, title : formatMessage({id:"app.text.pleasepreare",defaultMessage:"请准备"}), hasCountDown : true  },
  "playQuestion" : { icon : listening, title : formatMessage({id:"app.text.pleaselisten",defaultMessage:"请听题"}), hasCountDown : false},
  "readQuestion" : { icon : reading,   title : formatMessage({id:"app.text.pleaseread",defaultMessage:"请读题"}),   hasCountDown : true  },
  "playSystem"   : { icon : hint,      title : formatMessage({id:"app.listen.to.tips",defaultMessage:"听提示"}),    hasCountDown : false},
  "finish"       : { icon : finish,    title : formatMessage({id:"app.text.recordend",defaultMessage:"录音结束"}),  hasCountDown : false}
}[state]);

// 录音的音量级别
const defaultLevel = {
  0 : volume0,
  1 : volume1,
  2 : volume2,
  3 : volume3,
  4 : volume4,
  5 : volume5
}

// 批量的去缓存图片，加快打开速度
const allImg = [waiting,record,answer,preparing,listening,reading,hint,finish,volume0,volume1,volume2,volume3,volume4,volume5];
const list = allImg.map(item=>{
  const img = new Image();
  img.src = item;
  return img;
});
console.log(list);

@connect(({examBlock})=>{
  const { state, title, time, countDown, control, level, countTotal, isPlay } = examBlock.processProps || {};

  return {
    state,       // 当前的主要状态
    title,       // 显示的主要文字内容，如果为空则使用默认值
    time       : Number.isFinite(time)?time:0,   // 次数，如果不是数字类型，则认为不显示
    countDown  : Number.isFinite(countDown)?countDown:0,  // 倒计时
    countTotal : Number.isFinite(countTotal)?countTotal:0,  // 倒计总数
    control,     // 是否显示控制器
    level,       // 音量级别0-5
    isPlay,      // 是否在执行中（ 如 暂停操作 ）
  }
})
class PaperTimeProcess extends PureComponent {

  render(){
    const { state, title, time, countDown, control, level, countTotal, isPlay } = this.props;

    let showIcon = "";
    const { icon, title : defaultTitle, hasCountDown } = defaultState(state);

    if( state === "record" ){
      showIcon = defaultLevel[level||0];
    }else{
      showIcon = icon;
    }

    return (
      <div className={styles.body}>
        <div className={styles.connect}>
          <div className={styles['state-icon']} style={{backgroundImage:`url(${showIcon})`}} />
          <div className={styles['state-title']}>{title||defaultTitle}</div>
          { !!time && (
            <div className={styles['state-time']}>
              {formatMessage({id:"app.text.much.time",defaultMessage:"第{num}遍"},{"num":time})}
            </div>
          )}
          { hasCountDown && (
            <div className={styles['state-count']}>
              <ProgressBar isPlay={isPlay} endTime={countTotal} startTime={countTotal-countDown} />
              <div className={styles.down}>
                {formatMessage({id:"app.text.Countdown",defaultMessage:"倒计时"})}
                <span className={styles.number}>{countDown}</span>
                {formatMessage({id:"app.text.seconds",defaultMessage:"秒"})}
              </div>
            </div>
          )}
        </div>
        { control &&  <div>上一页，暂停，下一页功能</div> }
      </div>
    )
  }
}

export default PaperTimeProcess;
