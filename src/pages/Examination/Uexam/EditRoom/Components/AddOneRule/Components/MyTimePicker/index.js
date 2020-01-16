import React, { PureComponent } from 'react';
import { Button,TimePicker } from 'antd';
import { formatMessage, } from 'umi/locale';
import moment from 'moment';
import styles from './index.less';

/**
 * 封装TimePicker组件，用于时间选择
 * @author tina.zhang.xu
 * @date   2019-8-10
 * when "am" "pm"
 * defaultValue 默认的时间
 */


class MyTimePicker extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,    // 选择时间面板
    }
    this.timeNow = "00:00"
  }

  componentDidMount() {
    const { defaultValue } = this.props
    this.timeNow = moment(defaultValue, 'HH:mm')
  }


  handleOk = () => {
    this.setState({ open: false });
    this.callback()
  }

  onChange = (e) => {
    this.timeNow = e;
  }

  onOpenChange = (open) => {
    this.setState({ open });
    if (!open) {// 关闭面板
      this.callback()
    }
  }

  callback = () => {
    const { when, callback } = this.props
    callback(this.timeNow, when);
  }


  hours = () => {
    const { when } = this.props
    const arr = [...Array(24).keys()];
    if (when === "am") {
      return arr.splice(12, 24)
    } 
    if (when === "pm") {
      return arr.splice(0, 12)
    }
    return ""
  }

  render() {
    const { defaultValue } = this.props
    const { open } = this.state
    const format = 'HH:mm';
    return (
      <TimePicker
        className={styles.setmypptime}
        open={open}
        onChange={(e) => this.onChange(e)}
        onOpenChange={this.onOpenChange}
        defaultValue={moment(defaultValue, format)}
        format={format}
        allowClear={false}
        disabledHours={this.hours}
        addon={() => (
          <div className={styles.btnxxpas}>
            <Button size="small" type="primary" onClick={this.handleOk}>
              {formatMessage({ id: "app.text.qd", defaultMessage: "确定" })}
            </Button>
          </div>

        )}
      />
    )
  }
}
export default MyTimePicker
