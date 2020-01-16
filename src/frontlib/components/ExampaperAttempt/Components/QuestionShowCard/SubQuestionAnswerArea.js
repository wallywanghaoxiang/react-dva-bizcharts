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

  componentDidMount() {}

  render() {
    const { index, value, isRight, callback, disabled, isDisabled, subStyle, callbackBlur, allowMultiAnswerMode} = this.props;
    let borderColor = '';
    borderColor = "1px solid rgba(204, 204, 204, 1)";
    return (
      <div className={styles.answerArea} style={subStyle=="flex"?{border:borderColor}:{borderBottom:borderColor}}>
        {allowMultiAnswerMode === "Y" && <div className={styles.question_num} style={{ borderRight: borderColor }}>
          {index}
        </div>}
        {disabled ? <div className={styles.ant_div} >
                    {value}
                </div>:
                <Input className={styles.ant_input} 
                    defaultValue={value}
                    disabled={isDisabled}
                    maxLength={200}
                    onChange={(e)=>{
                      console.log(e.target.value);
                      callback(e.target.value)
                    }}
                    onBlur={(e)=>{
                      console.log(e.target.value);
                      callbackBlur(e.target.value)
                    }}
                />}
      </div>
    );
  }
}
