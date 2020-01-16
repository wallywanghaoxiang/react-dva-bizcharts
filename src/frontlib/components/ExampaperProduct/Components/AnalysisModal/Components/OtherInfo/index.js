import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { DoWithNum, fromCharCode, checkTempStr } from '@/frontlib/utils/utils';
import './index.less';
import rightIcon from '@/frontlib/assets/qus_right_icon.png';
import wrongIcon from '@/frontlib/assets/qus_wrong_icon.png';
import AutoPlay from '../../../AutoPlay';
import CapsuleInfo from '../CapsuleInfo/index';
import SubjectTitle from '../SubjectTitle/index';
import StemImage from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemImage';

/**
 * 示范音等其他信息//选择填空等信息
 * add by leo 2019-4-25 16:12:05
 */
class OtherInfo extends Component {
  constructor(props) {
    super(props);
    this.fluencyInfo = [
      formatMessage({ id: 'app.text.ldbll', defaultMessage: '朗读不流利' }),
      formatMessage({ id: 'app.text.ldbll', defaultMessage: '朗读不流利' }),
      formatMessage({ id: 'app.text.ldbgll', defaultMessage: '朗读不够流利' }),
      formatMessage({ id: 'app.text.ldjblc', defaultMessage: '朗读基本顺畅' }),
      formatMessage({ id: 'app.text.ldllsc', defaultMessage: '朗读流利顺畅' }),
    ];
  }

  componentDidMount() {}

  playingId = Id => {
    const { callback } = this.props;
    callback(Id);
  };

  splitText = value => {
    if (value) {
      const stemText = value.split('\n');
      const jsx = stemText.map(item => {
        return <div className={checkTempStr(item) ? '' : 'text'}>{item}</div>;
      });
      return jsx;
    }
    return '';
  };

  // 返回语速描述
  speedInfo = speed => {
    const sp = Number(speed);
    let answer = '';
    if (sp > 180) {
      answer = `${formatMessage({
        id: 'app.text.ysgk',
        defaultMessage: '语速过快',
      })}(${speed}${formatMessage({ id: 'app.text.cfz', defaultMessage: '词/分钟' })})`;
    } else if (sp > 141) {
      answer = speed + formatMessage({ id: 'app.text.cfz', defaultMessage: '词/分钟' });
    } else if (sp > 101) {
      answer = `${formatMessage({
        id: 'app.text.yssz',
        defaultMessage: '语速适中',
      })}(${speed}${formatMessage({ id: 'app.text.cfz', defaultMessage: '词/分钟' })})`;
    } else if (sp > 81) {
      answer = `${formatMessage({
        id: 'app.text.ysjm',
        defaultMessage: '语速较慢',
      })}(${speed}${formatMessage({ id: 'app.text.cfz', defaultMessage: '词/分钟' })})`;
    } else {
      answer = `${formatMessage({
        id: 'app.text.yshm',
        defaultMessage: '语速缓慢',
      })}(${speed}${formatMessage({ id: 'app.text.cfz', defaultMessage: '词/分钟' })})`;
    }
    return answer;
  };

  // 显示填空题
  showGAPResult() {
    const { data } = this.props;
    const html = [];
    if (data.answerValue) {
      html.push(
        <div className="answer">
          {`${formatMessage({ id: 'app.my.answer.label', defaultMessage: '我的答案' })}：${
            data.answerValue
          }`}
          {<img src={data.isRight ? rightIcon : wrongIcon} alt="" />}
        </div>
      );
    } else {
      html.push(this.oooops());
      // html.push(<div className="answer">{"我的答案：同学你还没做本题哦"}</div>)
    }
    if (data.gapFillingQuestionAnswerInfo && data.gapFillingQuestionAnswerInfo.answers) {
      const a = data.gapFillingQuestionAnswerInfo.answers.map(item => {
        // 用的选择内容
        return item.text;
      });
      html.push(
        <div className="answer">
          {`${formatMessage({
            id: 'app.reference.answer.label',
            defaultMessage: '参考答案',
          })}：${a.join()}`}
        </div>
      );
    }
    if (data.answerExplanation) {
      html.push(
        <div className="tipsName flex">
          <div className="tips">
            {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
          </div>
          <div className="tip2" />
          <div style={{ width: '90%' }}>{data.answerExplanation}</div>
        </div>
      );
    }

    return html;
  }

  // 显示半开放题型
  showHalfOpenOralResult() {
    const { data, normal, model, hiddenRecordAnswer, tokenId } = this.props;
    const { answerValue } = data;
    const html = [];
    if (!normal) {
      // 二层题型未做题显示
      if (!answerValue || !answerValue.result) {
        html.push(this.oooops(data.fileId));
      } else if (model === 'eval.choc.en') {
        // if (answerValue.result.keywords && answerValue.result.keywords.length > 0) {
        //   const point = [0, 0, 0, 0]// 得分点命中数、总数、扣分命中数、总数
        //   Object.keys(answerValue.result.keywords).forEach(index => {
        //     if (answerValue.result.keywords[index].exclude === false) {
        //       point[1] += 1;
        //       if (answerValue.result.keywords[index].hits > 0) {
        //         point[0] += 1;
        //       }
        //     } else {
        //       point[3] += 1;
        //       if (answerValue.result.keywords[index].hits > 0) {
        //         point[2] += 1;
        //       }
        //     }
        //   })
        //   html.push(
        //     <div className="result">
        //       <div className="titleName"><div className="dic" />{formatMessage({ id: "app.text.wdbx", defaultMessage: "我的表现" })}</div>
        //       {point[1] > 0 &&
        //         <div>
        //           <div className="titlePoint">{formatMessage({ id: "app.text.dfdmz", defaultMessage: "得分点命中" })}<span className="win">{point[0]}</span>{`/${point[1]}${formatMessage({ id: "app.text.ge", defaultMessage: "个" })}`}</div>
        //           <div className="myPerformance">
        //             {
        //               answerValue.result.keywords.map((item,index) => {
        //                 const n=index;
        //                 if (item.exclude === false) {
        //                   return (
        //                     <CapsuleInfo
        //                       key={`CapsuleInfo${n}`}
        //                       type={2}
        //                       word={item.text}
        //                       result={Number(item.hits) > 0}
        //                     />)
        //                 }
        //                   return ""
        //               })
        //             }
        //           </div>
        //         </div>}
        //       {point[3] > 0 &&
        //         <div>
        //           <div className="titlePoint">{formatMessage({ id: "app.text.kfdmz", defaultMessage: "扣分点命中" })}<span className="los">{point[2]}</span>{`/${  point[3]  }${formatMessage({ id: "app.text.ge", defaultMessage: "个" })}`}</div>
        //           <div className="myPerformance">
        //             {
        //               answerValue.result.keywords.map((item,index) =>{
        //                 const n=index;
        //                 if (item.exclude === true) {
        //                   return (
        //                     <CapsuleInfo
        //                       key={`CapsuleInfo${n}`}
        //                       type={3}
        //                       word={item.text}
        //                       result={Number(item.hits) > 0}
        //                     />)
        //                 }
        //                  return ""
        //               })
        //             }
        //           </div>
        //         </div>}
        //     </div>)
        // }
      }
    }
    // 人工纠偏评价
    if (data.manualDetail) {
      html.push(
        <div className="evaluateInfo">
          <div className="title">
            {formatMessage({ id: 'app.text.ping', defaultMessage: '评' })}
            {'\xa0\xa0\xa0\xa0\xa0\xa0'}
            {formatMessage({ id: 'app.text.jia', defaultMessage: '价' })}：
          </div>
          <div className="content">{data.manualDetail}</div>
        </div>
      );
    }

    html.push(
      <div className="titleName">
        <div className="dic" />
        {formatMessage({ id: 'app.reference.answer.label', defaultMessage: '参考答案' })}
      </div>
    );
    Object.keys(data.halfOpenOralQuestionAnswerInfo.referenceAnswer).forEach(index => {
      if (index < 5)
        html.push(
          <div key={`answerhalf${index}`} className="answerhalf ">
            {`${Number(index) + 1}.${data.halfOpenOralQuestionAnswerInfo.referenceAnswer[index]}`}
          </div>
        );
    });

    if (data.answerExplanation) {
      html.push(
        <div className="tipsName flex">
          <div className="tips">
            {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
          </div>
          <div className="tip2" />
          <div style={{ width: '90%' }}>{data.answerExplanation}</div>
        </div>
      );
    }
    if (typeof answerValue !== 'undefined' && answerValue) {
      html.push(
        <div className="titleName">
          <div className="dic" />
          <span className="dix">
            {formatMessage({ id: 'app.text.wdhd', defaultMessage: '我的回答' })}{' '}
          </span>
          <AutoPlay
            token_id={answerValue.tokenId}
            hiddenRecordAnswer={hiddenRecordAnswer}
            // replay={true}
            // id={answerValue.tokenId}
            key={answerValue.tokenId}
            focusId={tokenId}
            callback={this.playingId}
            focus
          />
        </div>
      );
    }
    return html;
  }

  // 开放题型答案展示
  showOpenOralResult() {
    const { data, hiddenRecordAnswer, tokenId } = this.props;
    const { answerValue } = data;
    const html = [];
    if (answerValue && answerValue.result) {
      if (answerValue.result.keywords && answerValue.result.keywords.length > 0) {
        const point = [0, 0, 0, 0]; // 得分点命中数、总数、扣分命中数、总数
        Object.keys(answerValue.result.keywords).forEach(index => {
          if (answerValue.result.keywords[index].exclude === false) {
            point[1] += 1;
            if (answerValue.result.keywords[index].hits > 0) {
              point[0] += 1;
            }
          } else {
            point[3] += 1;
            if (answerValue.result.keywords[index].hits > 0) {
              point[2] += 1;
            }
          }
        });

        html.push(
          <div className="result">
            <div className="titleName">
              <div className="dic" />
              {formatMessage({ id: 'app.text.wdbx', defaultMessage: '我的表现' })}
            </div>
            <div className="myPerformance">
              <CapsuleInfo
                key={`CapsuleInfo${11}`}
                type={1}
                title={formatMessage({ id: 'app.text.ztbd', defaultMessage: '整体表达' })}
                content={this.fluencyInfo[Number(answerValue.result.fluency.score)]}
              />
              {/* update 2019-10-12 14:04:04 */}
              {/* <CapsuleInfo key={`CapsuleInfo${22}`} type={1} title={formatMessage({ id: "app.text.ys", defaultMessage: "语速" })} content={this.speedInfo(answerValue.result.fluency.speed)} />
              <CapsuleInfo key={`CapsuleInfo${33}`} type={1} title={formatMessage({ id: "app.text.pause", defaultMessage: "停顿" })} content={answerValue.result.fluency.pause + formatMessage({ id: "app.text.chu", defaultMessage: "处" })} /> */}
              {/* <CapsuleInfo key={`CapsuleInfo${44}`} type={1} title={formatMessage({ id: "app.text.cfd", defaultMessage: "重复读" })} content={answerValue.result.fluency.repeat + formatMessage({ id: "app.text.ci_a", defaultMessage: "词" })} /> */}
            </div>
            {data.manualDetail && ( // 人工纠偏评价
              <div className="evaluateInfo">
                <div className="title">
                  {formatMessage({ id: 'app.text.ping', defaultMessage: '评' })}
                  {'\xa0\xa0\xa0\xa0\xa0\xa0'}
                  {formatMessage({ id: 'app.text.jia', defaultMessage: '价' })}：
                </div>
                <div className="content">{data.manualDetail}</div>
              </div>
            )}
            {point[1] > 0 && (
              <div>
                <div className="titlePoint">
                  {formatMessage({ id: 'app.text.dfdmz', defaultMessage: '得分点命中' })}
                  <span className="win">{point[0]}</span>
                  {`/${point[1]}${formatMessage({ id: 'app.text.ge', defaultMessage: '个' })}`}
                </div>
                <div className="myPerformance">
                  {answerValue.result.keywords.map((item, index) => {
                    const n = index;
                    if (item.exclude === false) {
                      return (
                        <CapsuleInfo
                          key={`CapsuleInfo${n}`}
                          type={2}
                          word={item.text}
                          result={Number(item.hits) > 0}
                        />
                      );
                    }
                    return '';
                  })}
                </div>
              </div>
            )}
            {point[3] > 0 && (
              <div>
                <div className="titlePoint">
                  {formatMessage({ id: 'app.text.kfdmz', defaultMessage: '扣分点命中' })}
                  <span className="los">{point[2]}</span>
                  {`/${point[3]}${formatMessage({ id: 'app.text.ge', defaultMessage: '个' })}`}
                </div>
                <div className="myPerformance">
                  {answerValue.result.keywords.map((item, index) => {
                    const n = index;
                    if (item.exclude === true) {
                      return (
                        <CapsuleInfo
                          key={`CapsuleInfo${n}`}
                          type={3}
                          word={item.text}
                          result={Number(item.hits) > 0}
                        />
                      );
                    }
                    return '';
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }
    } else {
      html.push(this.oooops(data.fileId));
    }
    html.push(
      <div className="titleName">
        <div className="dic" />
        {formatMessage({ id: 'app.reference.answer.label', defaultMessage: '参考答案' })}
      </div>
    );
    data.openOralQuestionAnswerInfo.referenceAnswer.map((item, index) => {
      // update 2019-10-18 17:23:32
      // VB-7788 参考答案最多显示5条
      if (index > 4) {
        return '';
      }
      html.push(
        <div className="answer">
          {index + 1}
          {'.'}
          {item}
        </div>
      );
      return '';
    });
    if (data.answerExplanation) {
      html.push(
        <div className="tipsName flex">
          <div className="tips">
            {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
          </div>
          <div className="tip2" />
          <div style={{ width: '90%' }}>{data.answerExplanation}</div>
        </div>
      );
    }
    html.push(
      <div>
        {typeof answerValue !== 'undefined' && answerValue && (
          <div className="titleName">
            <div className="dic" />
            <span className="dix">
              {formatMessage({ id: 'app.text.wdhd', defaultMessage: '我的回答' })}{' '}
            </span>
            <AutoPlay
              token_id={answerValue.tokenId}
              hiddenRecordAnswer={hiddenRecordAnswer}
              // replay={true}
              // id={answerValue.tokenId}
              key={answerValue.tokenId}
              focusId={tokenId}
              callback={this.playingId}
              focus
            />
          </div>
        )}
      </div>
    );
    return html;
  }

  // 显示选择题的答案
  showChoiceResult() {
    const { data } = this.props;
    const html = [];
    const mainHtml = [];
    let isPic = false; // 是否为图片选择题
    let answer = ''; // 用的选择内容
    if (data.answerId) {
      answer = data.answerId;
      if (data.choiceQuestionAnswerInfo && data.choiceQuestionAnswerInfo.options) {
        data.choiceQuestionAnswerInfo.options.map((item, index) => {
          if (answer === item.id) {
            if (item.image) {
              isPic = true;
            }
            if (item.isAnswer === 'Y') {
              html.push(
                <div className="answer rightAnswer">
                  {`${fromCharCode(index + 1)}.${item.text}`}
                  {item.image && <StemImage id={item.image} className="stemImage" />}
                  <img src={rightIcon} alt="" />
                </div>
              );
            } else {
              html.push(
                <div className="answer wrong">
                  {`${fromCharCode(index + 1)}.${item.text}`}
                  {item.image && <StemImage id={item.image} className="stemImage" />}
                  <img src={wrongIcon} alt="" />
                </div>
              );
            }
          } else if (item.isAnswer === 'Y') {
            html.push(
              <div className="answer rightAnswer">
                {`${fromCharCode(index + 1)}.${item.text}`}
                {item.image && <StemImage id={item.image} className="stemImage" />}
                <img src={rightIcon} alt="" />
              </div>
            );
          } else {
            html.push(
              <div className="answer">
                {`${fromCharCode(index + 1)}.${item.text}`}
                {item.image && <StemImage id={item.image} className="stemImage" />}
              </div>
            );
          }
          return '';
        });
      }
    } else {
      if (data.choiceQuestionAnswerInfo && data.choiceQuestionAnswerInfo.options) {
        data.choiceQuestionAnswerInfo.options.map((item, index) => {
          const n = index;
          if (item.image) {
            isPic = true;
          }
          if (item.isAnswer === 'Y') {
            html.push(
              <div className="answer rightAnswer noanswer">
                {`${fromCharCode(index + 1)}.${item.text}`}
                {item.image && <StemImage id={item.image} className="stemImage" />}
                <i className="iconfont icon-right" />
              </div>
            );
          } else {
            html.push(
              <div key={`answer_${n}`} className="answer">
                {`${fromCharCode(index + 1)}.${item.text}`}
                {item.image && <StemImage id={item.image} className="stemImage" />}
              </div>
            );
          }
          return '';
        });
      }
      html.push(this.oooops());
    }

    mainHtml.push(<div className={isPic ? 'flex' : null}>{html}</div>);
    if (data.answerExplanation) {
      mainHtml.push(
        <div className="tipsName flex">
          <div className="tips">
            {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
          </div>
          <div className="tip2" />
          <div style={{ width: '90%' }}>{data.answerExplanation}</div>
        </div>
      );
    }
    return mainHtml;
  }

  oooops(fileId) {
    const { normal, online } = this.props;
    let text = formatMessage({ id: 'app.text.oopsinfo', defaultMessage: '同学，你还没做本题哦！' });
    let className = 'oops-info';
    if (normal) {
      return null;
    }
    if (online) {
      // 口语题
      if (fileId) {
        // 线上平台，如有fileId表示有录音
        text = formatMessage({
          id: 'app.text.txndsybgqxwzo',
          defaultMessage: '同学，你的声音不够清晰完整哦！',
        });
        className = 'oops-info-long';
      }
    }
    return (
      <div className="ooops">
        <div>Oops...</div>
        <div className={className}>
          <span>{text}</span>
        </div>
      </div>
    );
  }

  render() {
    const {
      data,
      normal,
      model,
      index,
      pop,
      hiddenRecordAnswer,
      tokenId,
      evaluations,
    } = this.props;
    const { answerValue } = data;
    const html = [];
    if (model === 'CHOICE') {
      html.push(
        <div className="result">
          <div className="question">
            {index
              ? `${index}${pop && data.subQuestionStemText ? data.subQuestionStemText : ''}`
              : ''}
            {normal ? null : (
              <div className="subScore">
                <span className="score">
                  {data.receivePoints ? DoWithNum(data.receivePoints) : '0'}
                </span>
                {formatMessage({ id: 'app.examination.inspect.paper.mark', defaultMessage: '分' })}
              </div>
            )}
          </div>
          {normal ? null : (
            <SubjectTitle
              data={data}
              image={data.subQuestionStemImage}
              audio={data.subQuestionStemAudio}
              audioText={data.subQuestionStemAudioText}
              callback={this.playingId}
              tokenId={tokenId}
              pop={pop}
              normal={normal}
            />
          )}
          {this.showChoiceResult()}
        </div>
      );
    } else if (model === 'GAP_FILLING') {
      html.push(
        <div className="result">
          <div className="question">
            {index
              ? `${index}${pop && data.subQuestionStemText ? data.subQuestionStemText : ''}`
              : ''}
            {normal ? null : (
              <div className="subScore">
                <span className="score">
                  {data.receivePoints ? DoWithNum(data.receivePoints) : '0'}
                </span>
                {formatMessage({ id: 'app.examination.inspect.paper.mark', defaultMessage: '分' })}
              </div>
            )}
          </div>
          {normal ? null : (
            <SubjectTitle
              data={data}
              image={data.subQuestionStemImage}
              audio={data.subQuestionStemAudio}
              audioText={data.subQuestionStemAudioText}
              callback={this.playingId}
              tokenId={tokenId}
              pop={pop}
              normal={normal}
            />
          )}
          {this.showGAPResult()}
        </div>
      );
    } else if (model === 'HALF_OPEN_ORAL' || model === 'eval.choc.en') {
      html.push(
        <div className="result">
          {normal ? null : (
            <div>
              <div className="question flex">
                <div className="question_no">{index}</div>
                <div className="question_content">
                  {pop && this.splitText(data.subQuestionStemText)}
                </div>
                <div className="subScore">
                  <span className="score">
                    {data.receivePoints ? DoWithNum(data.receivePoints) : '0'}
                  </span>
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                </div>
              </div>
              <SubjectTitle
                data={data}
                image={data.subQuestionStemImage}
                audio={data.subQuestionStemAudio}
                audioText={data.subQuestionStemAudioText}
                callback={this.playingId}
                pop={pop}
                tokenId={tokenId}
                normal={normal}
              />
            </div>
          )}
          {this.showHalfOpenOralResult()}
        </div>
      );
    } else if (model === 'OPEN_ORAL') {
      html.push(
        <div className="result">
          {normal ? null : (
            <div>
              <div className="question">
                {pop && (data.subQuestionStemText ? index + data.subQuestionStemText : index)}
                <div className="subScore">
                  <span className="score">
                    {data.receivePoints ? DoWithNum(data.receivePoints) : '0'}
                  </span>
                  {formatMessage({
                    id: 'app.examination.inspect.paper.mark',
                    defaultMessage: '分',
                  })}
                </div>
              </div>
              <SubjectTitle
                data={data}
                image={data.subQuestionStemImage}
                audio={data.subQuestionStemAudio}
                audioText={data.subQuestionStemAudioText}
                callback={this.playingId}
                tokenId={tokenId}
                pop={pop}
                normal={normal}
              />
            </div>
          )}
          {this.showOpenOralResult()}
        </div>
      );
    } else if (model === 'eval.word.en') {
      html.push(
        <div>
          {data.closeOralQuestionAnswerInfo.referenceAudio && (
            <div className="titleName">
              <div className="dic" />
              <span className="dix">
                {formatMessage({ id: 'app.audio.example', defaultMessage: '示范朗读' })}{' '}
              </span>
              <AutoPlay
                id={data.closeOralQuestionAnswerInfo.referenceAudio}
                focusId={tokenId}
                callback={this.playingId}
                focus
              />
            </div>
          )}
          <div className="titleName">{data.closeOralQuestionAnswerInfo.referenceText}</div>
          {data.answerExplanation && (
            <div className="tipsName flex">
              <div className="tips">
                {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
              </div>
              <div className="tip2" />
              <div style={{ width: '90%' }}>{data.answerExplanation}</div>
            </div>
          )}
          {typeof answerValue !== 'undefined' && answerValue && !evaluations && (
            <div className="titleName">
              <div className="dic" />
              <span className="dix">
                {formatMessage({ id: 'app.text.wdld', defaultMessage: '我的朗读' })}{' '}
              </span>
              {!evaluations && (
                <AutoPlay
                  token_id={answerValue.tokenId}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                  // replay={true}
                  // id={answerValue.tokenId}
                  focusId={tokenId}
                  callback={this.playingId}
                  focus
                />
              )}
            </div>
          )}
        </div>
      );
    } else {
      html.push(
        <div>
          {data.closeOralQuestionAnswerInfo.referenceAudio && (
            <div className="titleName">
              <div className="dic" />
              <span className="dix">
                {formatMessage({ id: 'app.audio.example', defaultMessage: '示范朗读' })}{' '}
              </span>
              <AutoPlay
                id={data.closeOralQuestionAnswerInfo.referenceAudio}
                focusId={tokenId}
                callback={this.playingId}
                focus
              />
            </div>
          )}
          {data.answerExplanation && (
            <div className="tipsName flex">
              <div className="tips">
                {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
              </div>
              <div className="tip2" />
              <div style={{ width: '90%' }}>{data.answerExplanation}</div>
            </div>
          )}
          {typeof answerValue !== 'undefined' && answerValue && !evaluations && (
            <div className="titleName">
              <div className="dic" />
              <span className="dix">
                {formatMessage({ id: 'app.text.wdld', defaultMessage: '我的朗读' })}{' '}
              </span>
              <AutoPlay
                token_id={answerValue.tokenId}
                hiddenRecordAnswer={hiddenRecordAnswer}
                // replay={true}
                // id={answerValue.tokenId}
                focusId={tokenId}
                callback={this.playingId}
                focus
              />
            </div>
          )}
        </div>
      );
    }

    return <div className="otherInfo">{html}</div>;
  }
}

export default OtherInfo;
