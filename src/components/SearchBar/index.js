import React, { PureComponent } from 'react';
import { Input} from 'antd';
import styles from './index.less';


/**
 * 搜索
 * onSearch 搜索callback
 * @author tina.zhang
 */
export default class QuestionManage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
      showClear:props.value?true:false
    }
  }

  render() {
    const { width, height, placeholder, onSearch, maxLength,onChange } = this.props;
    const {value,showClear} = this.state;
    return (
      <div className="custom-searchbar">
        <div
          className="ant-input-search Search ant-input-affix-wrapper"
          style={{ width, height}}
        >
          <Input type="search" value={value} placeholder={placeholder} maxLength={maxLength||100} onChange={(e)=>{
            console.log(e);
            if (onChange) {
              onChange(e.target.value);
            }
            if (e.target.value) {
              this.setState({
                showClear:true,
                value:e.target.value
              })
            }else {
              this.setState({
                showClear:false,
                value:e.target.value
              })
            }

          }} className="ant-input" type="text" ref="search" onPressEnter={(e)=>{
            
            onSearch(value);
            
          }} />
          {showClear?<i
            className="iconfont icon-error clear"
            ref="clear"
            onClick={()=>{
              onSearch('');
              this.setState({
                showClear:false,
                value:''
              })
            }}
          />:null}

          <div
            className="ant-input-suffix left-icon"
            onClick={() => {
                onSearch(value);
                
            }}
          >
            <i className="iconfont icon-serach ant-input-search-icon" />
          </div>
        </div>
      </div>
    );
  }
}
