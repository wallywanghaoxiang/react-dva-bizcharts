/*
 * @Author    tina
 * @Date      2019-07-01
 * @copyright 人工纠偏
 */
import React, { Component } from 'react';
import { message, List, Popover } from 'antd';
import { formatMessage } from 'umi/locale';
import AudioCorrect from '@/frontlib/components/AudioCorrect/low';
import AudioCorrectHigh from '@/frontlib/components/AudioCorrect';
import styles from './index.less';

class AudioScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: '',
      visible: false,
    };
  }

  componentDidMount() {
    const { subId, subQuestions } = this.props;
    const current = subQuestions.find(vo => vo.subquestionNo === subId.id);
    this.setState({
      score: current.manualScore !== null ? current.manualScore : '',
    });
  }

  generateScore = () => {
    const { subId, subQuestions } = this.props;
    const current = subQuestions.find(vo => vo.subquestionNo === subId.id);
    const { subFullMark } = this.props;
    // 生成给分板备选分数
    const precision = current.precisionValue * 1000; // 精度*1000，防止出现0.9999999之类的

    const fullMark = subFullMark * 1000; // 总分*1000，同上

    const totalMarkCount = fullMark / precision + 1; // 最多十个给分板

    const s = [];

    let m = 0;

    s.push(m / 1000);

    for (let i = 1; i < totalMarkCount; i++) {
      m += precision;

      while (m < (fullMark / (totalMarkCount - 1)) * i) m += precision;

      if (m > fullMark) break;

      s.push(m / 1000);
    }

    return s; // 返回给分板分值数组
  };

  // 播放当前音频
  playCurrent = () => {
    const { callback, subId } = this.props;
    callback(subId.id);
  };

  // 失焦保存数据
  saveManual = () => {
    const { score } = this.state;
    const { subId, saveManualUpdate, subQuestions } = this.props;
    const current = subQuestions.find(vo => vo.subquestionNo === subId.id);
    saveManualUpdate(current.id, this.nameInput.value || '', score || null);
  };

  // 选择分数
  editScore = score => {
    this.setState({ score, visible: false });
    const { subId, saveManualUpdate, subQuestions } = this.props;
    const current = subQuestions.find(vo => vo.subquestionNo === subId.id);
    saveManualUpdate(current.id, this.nameInput.value || '', score || 0);
    // this.scoreInput.value=score;
  };

  // 输入框输入分数
  saveScore = e => {
    const generate = this.generateScore();
    console.log(
      e.target.value.toString(),
      generate[generate.length - 1].toString(),
      e.target.value.toString() === generate[generate.length - 1].toString()
    );
    if (
      e.target.value < generate[generate.length - 1] ||
      e.target.value.toString() === generate[generate.length - 1].toString()
    ) {
      this.setState({ score: e.target.value });
    }
  };

  isIE = () => {
    const { userAgent } = navigator; // 取得浏览器的userAgent字符串
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; // 判断是否IE<11浏览器
    const isEdge = userAgent.indexOf('Edge') > -1 && !isIE; // 判断是否IE的Edge浏览器
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    if (isIE) {
      const reIE = new RegExp('MSIE (\\d+\\.\\d+);');
      reIE.test(userAgent);
      const fIEVersion = parseFloat(RegExp['$1']);
      if (fIEVersion === 7) {
        return 7;
      } else if (fIEVersion === 8) {
        return 8;
      } else if (fIEVersion === 9) {
        return 9;
      } else if (fIEVersion === 10) {
        return 10;
      } else {
        return 6; // IE版本<=7
      }
    } else if (isEdge) {
      return 'edge'; // edge
    } else if (isIE11) {
      return 11; // IE11
    } else {
      return -1; // 不是ie浏览器
    }
  };

  handleVisibleChange = visible => {
    this.setState({ visible });
  };

  render() {
    const { subFullMark, subId, subQuestions, focusId, id } = this.props;
    const current = subQuestions.find(vo => vo.subquestionNo === subId.id);
    const generate = this.generateScore();
    const { score, visible } = this.state;
    const { subTask } = this.props;
    const arr = [];
    if (generate.length > 15) {
      generate.forEach((vo, index) => {
        if (index > 14) {
          arr.push(vo);
        }
      });
    }
    const scoreListView = (
      <div>
        <List
          className={styles.placeInfo}
          dataSource={arr}
          renderItem={item => (
            <List.Item
              onClick={() => this.editScore(item)}
              className={score === item ? styles.selected : ''}
            >
              <span>{item}</span>
            </List.Item>
          )}
        />
      </div>
    );

    return (
      <div className={styles.correctScore}>
        <p className={styles.scoreCount}>
          {formatMessage({ id: 'app.text.Total.score.topic', defaultMessage: '本题总分：' })}
          {subFullMark}
          {formatMessage({ id: 'app.examination.report.charpie.score', defaultMessage: '分' })}
          <span>|</span>
          {formatMessage({ id: 'app.text.intelligence.score', defaultMessage: '智能评分' })}：
          {current.machineScore}分
        </p>
        <div className={styles.audioListen}>
          <span className={styles.bgWhite} />
          {this.isIE() > 0
            ? id === focusId && (
                <AudioCorrect audioSrc={current.tokenId} id={focusId} subId={subId.id} />
              )
            : id === focusId && (
                <AudioCorrectHigh audioSrc={current.tokenId} id={focusId} subId={subId.id} />
              )}
        </div>
        {subTask.rectifyStatus !== 'URT_3' && (
          <div className={styles.correct}>
            {formatMessage({ id: 'app.text.to', defaultMessage: '给' })}&nbsp;&nbsp;
            {formatMessage({ id: 'app.text.minute', defaultMessage: '分' })}&nbsp;&nbsp;
            {formatMessage({ id: 'app.text.plate', defaultMessage: '板' })}：
            {/* {给分板对应分值最多显示15个，超过则显示更多，点击更多弹出弹窗显示隐藏分值} */}
            {generate.map(
              (vo, index) =>
                index < 15 && (
                  <span
                    onClick={() => this.editScore(vo)}
                    className={score === vo ? styles.selected : ''}
                  >
                    {vo}
                  </span>
                )
            )}
            {arr.length > 0 && (
              <Popover
                placement="bottom"
                title=""
                content={scoreListView}
                trigger="click"
                overlayClassName={styles.scoreListView}
                visible={visible}
                onVisibleChange={this.handleVisibleChange}
              >
                更多…
              </Popover>
            )}
            {/* end */}
            {/* <input defaultValue={score} ref={scoreInput => {this.scoreInput = scoreInput}} onBlur={this.saveManual} onChange={this.saveScore} />分 */}
            {/* <b>(本题打分精度{current.precisionValue})</b> */}
          </div>
        )}
        <div className={styles.rating}>
          {formatMessage({ id: 'app.text.review', defaultMessage: '评' })}&nbsp;&nbsp;
          {formatMessage({ id: 'app.text.counts', defaultMessage: '价' })}：
          {subTask.rectifyStatus !== 'URT_3' ? (
            <input
              defaultValue={current.manualDetail || ''}
              maxLength={50}
              onBlur={this.saveManual}
              ref={nameInput => {
                this.nameInput = nameInput;
              }}
              placeholder={formatMessage({
                id: 'app.text.Input.evaluation.content',
                defaultMessage: '输入评价内容',
              })}
            />
          ) : (
            current.manualDetail
          )}
        </div>
      </div>
    );
  }
}
export default AudioScore;
