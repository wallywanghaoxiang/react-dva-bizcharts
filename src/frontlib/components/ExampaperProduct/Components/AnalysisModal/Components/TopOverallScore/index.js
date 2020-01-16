import React, { Component } from 'react';
import AutoPlay from '../../../AutoPlay';
import S1 from '@/frontlib/assets/WellDone/text_awesome.png';
import S2 from '@/frontlib/assets/WellDone/text_excellent.png';
import S3 from '@/frontlib/assets/WellDone/text_fantastic.png';
import A1 from '@/frontlib/assets/WellDone/text_wonderful.png';
import A2 from '@/frontlib/assets/WellDone/text_great.png';
import A3 from '@/frontlib/assets/WellDone/text_perfect.png';
import B1 from '@/frontlib/assets/WellDone/text_good.png';
import B2 from '@/frontlib/assets/WellDone/text_nice.png';
import B3 from '@/frontlib/assets/WellDone/text_well_done.png';
import C1 from '@/frontlib/assets/WellDone/text_normal.png';
import D1 from '@/frontlib/assets/WellDone/text_poor@2x.png';
import './index.less';
import OOPS from '@/frontlib/assets/WellDone/oops_icon.png';
import OOPST from '@/frontlib/assets/WellDone/oops_text_max.png';
import SubjectTitle from '../SubjectTitle/index';
import { DoWithNum, checkTempStr } from '@/frontlib/utils/utils';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

/**
 * 总分得分显示/参考音频
 */
class TopOverallScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overall: 0, // 总得分
      overMark: '', // 总分
      src: '',
    };
  }

  componentDidMount() {
    this.scorcpic();
  }

  scorcpic = () => {
    const { score, mark } = this.props;
    const count = score / mark;
    const S = [S1, S2, S3, A3];
    const A = [A1, A2];
    const B = [B1, B2, B3];
    let pic = '';
    if (count >= 0.95) {
      pic = S[Math.floor(Math.random() * 4)];
    } else if (count >= 0.85) {
      pic = A[Math.floor(Math.random() * 2)];
    } else if (count >= 0.7) {
      pic = B[Math.floor(Math.random() * 3)];
    } else if (count >= 0.55) {
      pic = C1;
    } else if (count >= 0) {
      pic = D1;
    }
    this.setState({
      src: pic,
    });
  };

  playingId = Id => {
    this.props.callback(Id);
  };

  // 普通题型未答题显示
  oops = () => {
    const { data, normal } = this.props;
    const html = [];
    if (normal) {
      // 二层题型未做题显示
      if (!data.answerId && !(data.answerValue && data.answerValue.result)) {
        if (data.answerType == 'GAP_FILLING' && data.answerValue && data.answerValue.length > 0) {
          return;
        }
        html.push(
          <div className="ops">
            <div>
              <img src={OOPS} />
            </div>
            <div className="ops-info">
              <div>
                <img src={OOPST} />
              </div>
              <div>
                {this.props.online &&
                data.answerType !== 'GAP_FILLING' &&
                data.answerType !== 'CHOICE' &&
                data.fileId
                  ? formatMessage({
                      id: 'app.text.txndsybgqxwzo',
                      defaultMessage: '同学，你的声音不够清晰完整哦！',
                    })
                  : formatMessage({
                      id: 'app.text.oopsinfo',
                      defaultMessage: '同学，你还没做本题哦！',
                    })}
              </div>
            </div>
          </div>
        );
      }
    }
    return html;
  };

  render() {
    const { score, mark, data, noShow, noContent, normal, pop, isCanSee } = this.props;
    return (
      <div className="overall">
        <div className={isCanSee ? 'overallScore' : 'overallScore overallHide'}>
          <span className="score">{DoWithNum(score)}</span>/{mark}
          {formatMessage({ id: 'app.examination.inspect.paper.mark', defaultMessage: '分' })}
          {!noShow && <img className="slogan" src={this.state.src} alt="" />}
        </div>
        {this.oops()}
        <SubjectTitle
          data={data}
          image={data.stemImage}
          audio={data.stemAudio}
          audioText={data.stemAudioText}
          callback={this.playingId}
          tokenId={this.props.tokenId}
          top
          pop={this.props.pop}
          normal={normal}
        />
        {/* {data&&data.stemAudio &&callback&& 
       <div className="titleName">
        <div className="dic"></div>参考原文
        <AutoPlay id={data.stemAudio}
                  focusId = {this.props.tokenId}
                  callback={this.playingId}
                  text={data.stemAudioText}
                  focus ={true}
                  /></div>} */}
        {pop && !noContent && (
          <div className={checkTempStr(data.stemText) ? 'content' : 'content_normal'}>
            {data.stemText}
          </div>
        )}
      </div>
    );
  }
}

export default TopOverallScore;
