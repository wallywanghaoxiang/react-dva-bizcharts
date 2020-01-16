import React, { PureComponent } from 'react';
import styles from './index.less';

/**
 * [— 40 +] 长这样的空间，用于加减里面的数值
 * @author tina.zhang.xu
 * @date   2019-8-10
 */

class MyAddNum extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      num: 0, // 选择时间面板
    };
    this.uplimite = 100; // 数值上限
  }

  componentDidMount() {
    const { value, uplimite } = this.props;
    this.setState({
      num: value,
    });
    this.uplimite = uplimite;
  }

  onChange = e => {
    const { num } = this.state;
    let a = num;
    if (e === 'add') {
      if (a + 1 <= this.uplimite) {
        a += 1;
      }
    } else if (e === 'less') {
      if (a - 1 > 0) {
        a -= 1;
      }
    }
    this.callback(a);
  };

  inputNum = e => {
    const a = e.target.value.replace(/[^\d]/g, ''); // 只能填数字
    if (a > 0 && a <= this.uplimite) {
      this.callback(a);
    }
  };

  callback = a => {
    const { callback } = this.props;
    callback(a);
    this.setState({
      num: Number(a),
    });
  };

  render() {
    const { num } = this.state;
    return (
      <div className={styles.myAddNum}>
        <div key={1} className={styles.add} onClick={this.onChange.bind(this, 'less')}>
          -
        </div>
        <input className={styles.input} type="text" onChange={this.inputNum} value={num} />
        <div key={2} className={styles.add} onClick={this.onChange.bind(this, 'add')}>
          +
        </div>
      </div>
    );
  }
}
export default MyAddNum;
