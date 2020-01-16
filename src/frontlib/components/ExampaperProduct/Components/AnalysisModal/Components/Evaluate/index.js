import React, { Component } from 'react';
import { formatMessage, } from 'umi/locale';
import './index.less';
import { speechReport } from '@/frontlib/utils/utils';


/**
 * 四位得分和评价
 */
class Evaluate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // visible: true,
      // tokenId: "",
    };
    this.scoreCn = [formatMessage({ id: "app.text.bad", defaultMessage: "差" }), formatMessage({ id: "app.text.bad", defaultMessage: "差" }), formatMessage({ id: "app.text.centre", defaultMessage: "中" }), formatMessage({ id: "app.text.fine", defaultMessage: "良" }), formatMessage({ id: "app.text.excellent", defaultMessage: "优" })];
  }

  componentDidMount() {

  }

  showResult() {
    const { data, normal } = this.props;
    const html = [];
    const resultJson = data.answerValue;
    if (resultJson) {
      const item = ["pronunciation", "integrity", "fluency"];
      const name = [formatMessage({ id: "app.text.fy", defaultMessage: "发音" }), formatMessage({ id: "app.text.wanzd", defaultMessage: "完整度" }), formatMessage({ id: "app.text.lld", defaultMessage: "流利度" })];

      if (resultJson && resultJson.result) {
        item.map((i, index) => {
          if (resultJson.result[i] !== undefined) {
            html.push(
              <div>
                {normal ? (
                  <div className="itmesbig">
                    <div className={`cnbig score${resultJson.result[i].score}`}>{this.scoreCn[resultJson.result[i].score]}</div>
                    <div className="wordbig">{name[index]}</div>
                  </div>)
                  : (
                    <div className="itmessmall"><div className="wordsmall">{`${name[index]}:`}</div>
                      <div className={`cnsmall score${resultJson.result[i].score}`}>{this.scoreCn[resultJson.result[i].score]}</div>
                    </div>)}
              </div>)
          }
          return ""
        })
      }
    }
    return html;
  }

  showSentInfo() {
    const { data } = this.props;
    const resultJson = data.answerValue;
    const html = [];
    if (resultJson && resultJson.result && resultJson.result.fluency) {
      const speed = Number(resultJson.result.fluency.speed);
      let speedText = '';
      if (speed === 0) {
        speedText = formatMessage({ id: "app.text.speed.low", defaultMessage: "慢" })
      } else if (speed === 1) {
        speedText = formatMessage({ id: "app.text.speed.normal", defaultMessage: "正常" })
      } if (speed >= 2) {
        speedText = formatMessage({ id: "app.text.speed.fast", defaultMessage: "快" })
      }

      html.push(
        <div className="evaluateInfo">
          <div className="title">{formatMessage({ id: "app.text.gcsj", defaultMessage: "过程数据" })}：</div>
          {/* resultJson.result.fluency.speed}{formatMessage({ id: "app.text.cfz", defaultMessage: "词/分钟" }) */}
          <div className="content">{` 【${formatMessage({ id: "app.text.ys", defaultMessage: "语速" })}】`}{speedText}{` 【${formatMessage({ id: "app.text.pause", defaultMessage: "停顿" })}】`}{resultJson.result.fluency.pause}{`/${formatMessage({ id: "app.text.ci", defaultMessage: "次" })}`}</div>
        </div>)
    }
    return html;
  }

  render() {
    const { normal, model, data } = this.props
    return (
      <div className="evaluate">
        <div className={normal ? "evaluateScoreBig" : "evaluateScoreSmall"}>
          {this.showResult()}
        </div>
        {model === "eval.sent.en" ? this.showSentInfo() : null}
        {(model === "eval.sent.en" || model === "eval.para.en") ? data.answerValue && data.answerValue.result &&
          <div className="evaluateInfo">
            <div className="title">{formatMessage({ id: "app.text.ping", defaultMessage: "评" })}{model === "eval.sent.en" && '\xa0\xa0\xa0\xa0\xa0\xa0'}{formatMessage({ id: "app.text.jia", defaultMessage: "价" })}：</div>
            <div className="content">{data.manualDetail||speechReport(data.answerValue)}</div>
          </div> : null}
      </div>

    );
  }
}

export default Evaluate;
