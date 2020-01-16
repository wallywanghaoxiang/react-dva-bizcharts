import { Icon, Select } from 'antd';
import React, { Component } from 'react';

class ChangeTypeButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { onTypeChange } = this.props;
    return (
      <div className="mediatool-ChangeTypeButton">
        <Select defaultValue="1" onChange={onTypeChange} showArrow={false}>
          <Select.Option value="1">原音1</Select.Option>
          <Select.Option value="2">原音2</Select.Option>
        </Select>
      </div>
    );
  }
}
export default ChangeTypeButton;
