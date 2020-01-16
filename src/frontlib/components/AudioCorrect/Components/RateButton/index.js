import { Icon, Select } from 'antd';
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';

class RateButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { onRateChange } = this.props;
    return (
      <div className="mediatoolCorrect-rateButton">
        <Select defaultValue="normal" onChange={onRateChange}>
          <Select.Option value="normal">{formatMessage({id:"app.text.mediatoolCorrect.rateButton.normal",defaultMessage:"原速"})}</Select.Option>
          <Select.Option value="slow">{formatMessage({id:"app.text.mediatoolCorrect.rateButton.slow",defaultMessage:"较慢"})}</Select.Option>
          <Select.Option value="slower">{formatMessage({id:"app.text.mediatoolCorrect.rateButton.slower",defaultMessage:"慢速"})}</Select.Option>
        </Select>
      </div>
    );
  }
}
export default RateButton;
