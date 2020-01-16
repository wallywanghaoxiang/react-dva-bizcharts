import React, { Component } from 'react';
import { Tooltip } from 'antd';
import './index.less';
import { formatMessage, } from 'umi/locale';
import LabelButton from '../LabelButton'
import { DoWithNum, IfLevel } from '@/frontlib/utils/utils';

/**
 * 评分内容和细节多维度展示
 */
class ContentDetails extends Component {
  constructor(props) {
    super(props);
    this.offset = 0;
    this.state = {
      html: [],
      taginfo: [],
      id: 0,
      showTitle: true
    };
    this.info = {
      "eval.word.en": formatMessage({ id: "app.text.worden", defaultMessage: "细节表现" }),
      "eval.sent.en": formatMessage({ id: "app.text.senten", defaultMessage: "拆句解词" }),
      "eval.para.en": formatMessage({ id: "app.text.paraen", defaultMessage: "拆解段落" }),
    }
    // 段落和句子评测的标签按钮，段落的index从1-2，句子是3-6
    this.lab = [formatMessage({ id: "app.text.none", defaultMessage: "无" }), formatMessage({ id: "app.text.missingwords", defaultMessage: "漏词" }), formatMessage({ id: "app.text.sentenceperformance", defaultMessage: "句子表现" }), formatMessage({ id: "app.text.missingwords", defaultMessage: "漏词" }), formatMessage({ id: "app.text.stress ", defaultMessage: "重读" }), formatMessage({ id: "app.text.pause", defaultMessage: "停顿" }), formatMessage({ id: "app.text.risingfallingtone", defaultMessage: "升降调" })]
  }

  componentDidMount() {
    const { data } = this.props;
    if (data && data.answerValue && data.answerValue.result) {
      if (Object.prototype.hasOwnProperty.call(data.answerValue.result, "offset")) {
        this.offset = data.answerValue.result.offset
      }
    }
    this.defaultShow();
  }

  oooops = () => {
    const { normal } = this.props;
    this.setState({
      showTitle: false
    })
    if (normal) {
      return null
    }
    return (
      <div className="ooops">
        <div>Oops...</div>
        <div className="oops-info"><span>{formatMessage({ id: "app.text.oopsinfo", defaultMessage: "同学，你还没做本题哦！" })}</span></div>
      </div>
    )
  }

  // 显示分维度标签按钮
  showlab = () => {
    const { model } = this.props;
    const { id } = this.state;
    const html = [];
    let index = 0;
    let max = 0;
    if (model === "eval.word.en") return "";
    if (model === "eval.sent.en") {
      index = 3;
      max = 6
    }
    if (model === "eval.para.en") {
      index = 1;
      max = 2;
    }
    for (let i = index; i <= max; i += 1) {
      html.push(
        <LabelButton
          name={this.lab[i]}
          callback={a => this.onclick(a, i)}
          index={i}
          id={id}
        />
      )
    }
    return html;
  }

  defaultShow = () => {
    const { model } = this.props;
    switch (model) {
      case "eval.word.en": {
        this.showPhone();
        break;
      }
      case "eval.sent.en": {
        this.showSentword();
        break;
      }
      case "eval.para.en": {
        this.showWords();
        break;
      }
      default: break;
    }
  }

  // 单词显示每个音素得分
  showPhone = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    const cn = [formatMessage({ id: "app.text.bad", defaultMessage: "差" }), formatMessage({ id: "app.text.bad", defaultMessage: "差" }), formatMessage({ id: "app.text.centre", defaultMessage: "中" }), formatMessage({ id: "app.text.fine", defaultMessage: "良" }), formatMessage({ id: "app.text.excellent", defaultMessage: "优" })];
    let html = [];
    let score = 1;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((Item, ) => {
        if (Item.details) {
          html.push(<span className="words">[</span>)
          Item.details.map((k) => {
            score = IfLevel(Number(k.score) + this.offset);
            html.push(<Tooltip overlayClassName={`lev lev${score}`} title={cn[k.score]}><span className={`words phone score${score}`}>{k.text}</span></Tooltip>)
            return "";
          })
          html.push(<span className="words">]</span>)
        }
        return "";
      })

    } else {
      html = this.oooops();
    }
    this.setState({
      html,
    })
  }

  // 句子显示每个单词得分
  showSentword = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    // let resultJson=data;
    let html = [];
    let html2 = [];
    let total = 0;
    let score = 1;
    const num = [0, 0, 0, 0, 0]// 分别代表优良中差的数量
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((Item, ) => {
        // score 重置为 1， 否则下一句未读句子会沿用上一句子的 score 值
        score = 1;
        if (Number(Item.type) !== 1) {
          score = IfLevel(Number(Item.score) + this.offset);
        }
        if (Number(Item.type) === 7) {
          html.push(<span className="words score">{Item.text}</span>)
        } else {
          html.push(<span className={`words score${score || ""}`}>{Item.text}</span>)
        }
        if (score && Number(Item.type) !== 7) {
          num[Number(score)] += 1;
        }
        return ""
      })
      total = num[0] + num[1] + num[2] + num[3] + num[4];
      html2.push(<div className="flex"> <div className="ponit score4" />{formatMessage({ id: "app.text.excellent", defaultMessage: "优" })}<span className="percent">{`${Math.round(num[4] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score3" />{formatMessage({ id: "app.text.fine", defaultMessage: "良" })}<span className="percent">{`${Math.round(num[3] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score2" />{formatMessage({ id: "app.text.centre", defaultMessage: "中" })}<span className="percent">{`${Math.round(num[2] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score1" />{formatMessage({ id: "app.text.bad", defaultMessage: "差" })}<span className="percent">{`${Math.round((num[1] + num[0]) / total * 10000) / 100.00}%`}</span></div>)
    } else {
      html = this.oooops();
      html2 = [];
    }
    this.setState({
      html,
      taginfo: html2,
    })
  }

  // 段落显示每个单词得分
  showWords = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    let html = [];
    let html2 = [];
    let total = 0;
    let score = 1;
    const num = [0, 0, 0, 0, 0]// 分别代表优良中差的数量
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((Item, ) => {
        if (Item.details) {
          Item.details.map((k) => {
            // score 重置为 1， 否则下一句未读句子会沿用上一句子的 score 值
            score = 1;
            if (Number(k.type) !== 1) {// 跳过漏词
              score = IfLevel(Number(k.score) + this.offset);
            }
            if (Number(k.type) === 7) {
              html.push(<span className="words score">{k.text}</span>)
            } else {
            html.push(<span className={`words score${score || ""}`}>{k.text}</span>)
            }
            if (score && Number(k.type) !== 7) {
              num[Number(score)] += 1;
            }
            return ""
          })
        }
        return ""
      })
      total = num[0] + num[1] + num[2] + num[3] + num[4];
      html2.push(<div className="flex"> <div className="ponit score4" />{formatMessage({ id: "app.text.excellent", defaultMessage: "优" })}<span className="percent">{`${Math.round(num[4] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score3" />{formatMessage({ id: "app.text.fine", defaultMessage: "良" })}<span className="percent">{`${Math.round(num[3] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score2" />{formatMessage({ id: "app.text.centre", defaultMessage: "中" })}<span className="percent">{`${Math.round(num[2] / total * 10000) / 100.00}%`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score1" />{formatMessage({ id: "app.text.bad", defaultMessage: "差" })}<span className="percent">{`${Math.round((num[1] + num[0]) / total * 10000) / 100.00}%`}</span></div>)
    } else {

      html = this.oooops();
      html2 = [];
    }
    this.setState({
      html,
      taginfo: html2,
    })
  }

  // 显示每个句子得分
  showSent = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    // let resultJson=data;
    let html = [];
    let html2 = [];
    let score = 1;
    const num = [0, 0, 0, 0, 0]// 分别代表优良中差的数量
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((Item, ) => {
        if (Item.details) {
          Item.details.map((k) => {
            // score 重置为 1， 否则下一句未读句子会沿用上一句子的 score 值
            score = 1;
            if(Item.type!==1){// 跳过漏句
              score = IfLevel(Number(Item.score) + this.offset);
            }
            if (score) {
              html.push(<span className={`words sent${score || ""}`}>{k.text}</span>)
            } else {
              html.push(<span className={`words score sent${score || ""}`}>{k.text}</span>)
            }
            return ""
          })
          // update 2019-12-13 11:13:51
          // VB-9430 【v1.4】【线上&考中&区校】【生产】段落朗读的答题详情拆解段落的优良中差的句子数不正确
          if (Item.text) {
            num[Number(score)] += 1;
          }
        }
        // if (Item.text) {
        //     num[Number(score)] += 1;
        // }
        return ""
      })
      html2.push(<div className="flex"> <div className="ponit score4" />{formatMessage({ id: "app.text.excellent", defaultMessage: "优" })}<span className="percent">{`${num[4]}句`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score3" />{formatMessage({ id: "app.text.fine", defaultMessage: "良" })}<span className="percent">{`${num[3]}句`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score2" />{formatMessage({ id: "app.text.centre", defaultMessage: "中" })}<span className="percent">{`${num[2]}句`}</span></div>)
      html2.push(<div className="flex"> <div className="ponit score1" />{formatMessage({ id: "app.text.bad", defaultMessage: "差" })}<span className="percent">{`${num[1]}句`}</span></div>)
    } else {
      html = this.oooops();
      html2 = [];
    }
    this.setState({
      html,
      taginfo: html2,
    })

  }

  // 段落显示漏词
  showMiss = () => {
    const { data } = this.props;
    const resultJson = data.answerValue;
    let html = [];
    let html2 = [];
    let missNum = 0;
    let total = 0;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((Item, ) => {
        if (Item.details) {
          Item.details.map((k) => {
            if (Number(k.type) !== 7) {
              total += 1;
            }
            if (Number(k.type) === 1) {
              html.push(<span className="words score0">{k.text}</span>)
              missNum += 1;
            } else {
              html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}</span>)
            }
            return ""
          })
        }
        return ""
      })
      if (total > 0) {
        if (missNum === 0) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.excellent", defaultMessage: "你很棒，没有漏词哦！" })}</div>)
        } else if (missNum === total) {
          html = [];
          // 显示黑色的文本
          resultJson.result.details.map((Item, ) => {
            if (Item.details) {
              Item.details.map((k) => {
                html.push(<span className={(Number(k.type) === 7 ? "words score" : "words")}>{k.text}</span>)
                return ""
              })
            }
            return ""
          })
          html2.push(<div className="tips">{formatMessage({ id: "app.message.bad", defaultMessage: "你还没读哦" })}!</div>)
        } else {
          html2.push(<div className="tips" />)
        }
      }
    } else {
      html = this.oooops();
      html2 = [];
    }
    this.setState({
      html,
      taginfo: html2,
    })
  }

  // 句子显示漏读
  showSentMiss = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    const html = [];
    const html2 = [];
    let missNum = 0;
    let total = 0;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((k, ) => {
        if (Number(k.type) !== 7) {
          total += 1;
        }
        if (Number(k.type) === 1) {
          html.push(<span className="words score0">{k.text}</span>)
          missNum += 1;
        } else {
          html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}</span>)
        }
        return ""
      })
      if (total > 0) {
        if (missNum === 0) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.excellent", defaultMessage: "你很棒，没有漏词哦！" })}</div>)
        } else if (missNum === total) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.bad", defaultMessage: "你还没读哦" })}!</div>)
        } else {
          html2.push(<div className="tips" />)
        }
      }

      this.setState({
        html,
        taginfo: html2,
      })
    }
  }

  // 句子显示重读
  showSentStress = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    const html = [];
    const html2 = [];
    let stressNum = 0;
    let total = 0;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((k, ) => {
        if (Number(k.type) !== 7) {
          total += 1;
        }
        if (k.stress === true) {
          html.push(<span className="words score"><span className="icon score1">'</span>{k.text}</span>)
          stressNum += 1;
        } else {
          html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}</span>)
        }
        return ""
      })
      if (total > 0) {
        if (stressNum === 0) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.bad_a", defaultMessage: "你的朗读中没有重读哦！" })}</div>)
        } else if (stressNum === total) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.good_a", defaultMessage: "你的朗读全都重读了哦！" })}!</div>)
        } else {
          html2.push(<div className="tips" />)
        }
      }

      this.setState({
        html,
        taginfo: html2,
      })
    }
  }

  // 句子显示停顿
  showSentPause = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    const html = [];
    const html2 = [];
    let pauseNum = 0;
    let total = 0;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((k, ) => {
        if (Number(k.type) !== 7) {
          total += 1;
        }
        if (k.pause === true) {
          html.push(<span className="words score"><span className="icon score1">|</span>{k.text}</span>)
          pauseNum += 1;
        } else {
          html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}</span>)
        }
        return "";
      })
      if (total > 0) {
        if (pauseNum === 0) {
          html2.push(<div className="tips">{formatMessage({ id: "app.message.bad_b", defaultMessage: "你的朗读中没有停顿哦！" })}</div>)
        } else if (pauseNum === total) {
          html2.push(<div className="tips">{formatMessage({ id: "app.text.good_a", defaultMessage: "你的朗读全都停顿了哦！" })}!</div>)
        } else {
          html2.push(<div className="tips" />)
        }
      }
      this.setState({
        html,
        taginfo: html2,
      })
    }
  }

  // 句子显示升降调
  showSentTone = () => {
    const { data } = this.props;
    const resultJson = data.answerValue
    const html = [];
    const html2 = [];
    let tone = false;
    if (resultJson && resultJson.result && resultJson.result.details) {
      resultJson.result.details.map((k, index) => {
        if (index !== resultJson.result.details.length - 1) {
          html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}</span>)
          if (Number(k.type) !== 7) {
            // eslint-disable-next-line prefer-destructuring
            tone = k.tone;
          }
        } else {
          html.push(<span className={`words ${Number(k.type) === 7 ? "score nomal" : "nomal"}`}>{k.text}<span><i className={tone ? "iconfont score1 icon-rising-tune" : "iconfont score1 icon-falling-tune"} /></span></span>)
        }
        return ""
      })
      html2.push(<div className="tips" />)// 保证界面不抖动
      this.setState({
        html,
        taginfo: html2,
      })
    }
  }

  onclick = (a, index) => {
    if (a) {
      this.setState({
        id: index
      })
      if (index === 2) {
        this.showSent()
      }
      if (index === 1) {
        this.showMiss()
      }
      if (index === 3) {
        this.showSentMiss()
      }
      if (index === 4) {
        this.showSentStress()
      }
      if (index === 5) {
        this.showSentPause()
      }
      if (index === 6) {
        this.showSentTone()
      }
    } else {
      this.setState({
        id: 0
      })
      this.defaultShow();
    }

  }

  render() {
    const { taginfo, html, showTitle } = this.state;
    const { normal, data, index, model } = this.props;
    return (
      <div className="contentDetails">
        {normal ? showTitle &&
          <>{model==="eval.word.en"&&data.manualDetail&& // 单词评价
          <div className="evaluateInfo">
            <div className="title">{formatMessage({ id: "app.text.ping", defaultMessage: "评" })}{'\xa0\xa0\xa0\xa0\xa0\xa0'}{formatMessage({ id: "app.text.jia", defaultMessage: "价" })}：</div>
            <div className="content">{data.manualDetail}</div>
          </div>}
            <div className="titleName">
              <div className="dic" />{this.info[model]}
            </div>
          </> : null}
        <div className="details">
          {normal ? null : <div className="subIndex">{index}</div>}
          <div className="content">{html} </div>
          {normal ? null : <div className="subScore"><span className="score">{data.receivePoints ? DoWithNum(data.receivePoints) : 0}</span>{formatMessage({ id: "app.text.fen", defaultMessage: "分" })}</div>}
        </div>
        {taginfo.length > 0 &&
          <div className="taginfo">
            {taginfo}
          </div>}
        <div className="flex">
          {data.answerValue && data.answerValue.result && this.showlab()}
        </div>
      </div>

    );
  }
}

export default ContentDetails;
