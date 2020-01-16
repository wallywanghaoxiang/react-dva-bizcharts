import React, { PureComponent } from 'react';
import styles from './index.less';
import { Input } from 'antd';

/*
    填空答题区域

 */

export default class SubQuestionAnswerArea extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {
  }

  render() {
    const { index, value, isRight, callback,link,subStyle,type} = this.props;
    let borderColor = '';
    if (isRight == undefined) {
    } else if (isRight) {
      borderColor = '1px solid #03C46B';
    } else {
      borderColor = '1px solid #FF6E4A';
    }
    return (
      <div id={link+String(index)+"-"+type} className={styles.answerArea} style={{ border: borderColor }}>
      {/* <a>{'9'+link+String(index.substr(0,index.length-2))+"-"+type}</a> */}
        <div className={styles.question_num} style={{ borderRight: borderColor }}>
          {index}
        </div>
        <Input
          className={styles.ant_input}
          defaultValue={value}
          value={value}
          onChange={e => {
            console.log(e.target.value);
            callback(e.target.value);
          }}
        />
      </div>
    );
  }
}
