import React, { Component } from 'react';
import {Form} from 'antd';
import {Select} from 'antd';

const FormItem = Form.Item;

/**
 * 跟读模仿插件
 *
 * @author tina.zhang
 */
class NormalControl extends Component {
  constructor(props) {
    super(props);
    this.state={
      value:"",
    }
  }

  componentDidMount(){
    const { dataSource,labelName } = this.props;
    if(dataSource && dataSource.mainPatterns){
        this.setState({value:dataSource.mainPatterns[labelName]})
    }
  }

  render() {
    const { callback,form,dataSource,title_before,title_after,labelName,message } = this.props;
    const { getFieldDecorator } = form;
    const {value}  =this.state;
    return (
      <div>
        <span className="title">{title_before}</span>
        <FormItem>
        {getFieldDecorator(labelName, {
                  initialValue: value,
                  rules: [{ required: true, message: message }],
                })(
                  <input className="input" ref={myInput => (this.myInput = myInput)} onChange={()=>{
                    //手动赋值
                    this.setState({
                      value:this.myInput.value
                    },()=>{
                      callback(Number(this.myInput.value),labelName);
                    })
                    
                  }} />
                )}

        </FormItem>

        <span className="title">{title_after}&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
    );
  }
}

export default NormalControl;
