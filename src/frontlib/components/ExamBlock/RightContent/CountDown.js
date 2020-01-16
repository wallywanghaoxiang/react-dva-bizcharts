import React, { PureComponent } from 'react';
import styles from './index.less';
import { playResource } from '@/frontlib/utils/utils';

/*
    开卷介绍倒计时组件

 */

export default class CountDown extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      time: props.time
    };
  }

  componentDidMount() {
    let self = this;
    playResource({
      type: "TYPE_05",
      success: () => {},
    });
    this.timer1 = setInterval(function() {
      console.log(self.state.time)

      let time = self.state.time;

      if (time - 1 > 0) {
        if(time - 2 === 0){
          playResource({
            type: "TYPE_06",
            success: () => {},
          });
        }else{
          playResource({
            type: "TYPE_05",
            success: () => {},
          });
        }
        self.setState({ time: time - 1 })
      } else {
        self.props.index.props.index.stopRecorded('down');
        clearInterval(this.timer1);
      }

    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer1);
  }

  render() {

    return (
      <div className={styles.content}>
          <div className={styles.count_down}>
              {this.state.time}
          </div>
      </div>
    );
  }
}
