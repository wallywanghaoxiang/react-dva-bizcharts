import React, { Component } from 'react';
import { Modal,List,Radio,Checkbox} from 'antd';
import { formatMessage } from 'umi/locale';
import './index.less';
const RadioGroup = Radio.Group;


class TestSetModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
          visible: true,
          distribution:props.dataSource.distributionName||"",
          strategy:props.dataSource.strategyName||[],
          rectify:props.dataSource.rectifyName||''
        };
      }
    onChange = (e) => {
        this.setState({
            distribution: e.target.value,
        });
      }
    onChangeStrategy=(checkedValues)=>{
        this.setState({
            strategy: checkedValues,
        });
      }

      onChangeRectify=(e)=>{
        this.setState({
            rectify: e.target.value,
        });
      }
      
    onHandleCancel = () => {
        this.setState({
        visible: false,
        });
        this.props.onClose();
    };
    onHandleOK = () => {
        this.setState({
        visible: false,
        });
        this.props.callback(this.state.distribution,this.state.strategy,this.state.rectify);
        this.props.onClose();
        
    };
      render(){
          return(<Modal
            visible={this.state.visible}
            centered={true}
            title={formatMessage({id:"app.examination.inspect.task.detail.exam.setting.title",defaultMessage:"考试设置"})}
            closable={false}
            cancelText={formatMessage({id:"app.cancel",defaultMessage:"取消"})}
            okText={formatMessage({id:"app.confirm",defaultMessage:"确定"})}
            onCancel={this.onHandleCancel}
            onOk={this.onHandleOK}
            className="TestSetModal"       
          >
            <div className="TestSetList">
                <div className="tabList" style={{paddingTop:"0px"}}>
                    <div className="tipTitle">{formatMessage({id:"app.examination.inspect.task.detail.dist.mode.title",defaultMessage:"分发试卷方式："})}</div>
                    <div className="content">
                        <RadioGroup onChange={this.onChange} value={this.state.distribution}>
                        {this.props.dataSource.distribution.map(item=>{
                            return(<Radio value={item.value} key={item.id}>{item.value}</Radio>)
                        })}                  
                        </RadioGroup>
                    </div>
                </div>
                <div className="tabList">
                    <div className="tipTitle">{formatMessage({id:"app.title.exam.publish.exam.strategy",defaultMessage:"考试策略"})}</div>
                    <div className="content">
                        <Checkbox.Group onChange={this.onChangeStrategy} value={this.state.strategy}>  
                            {this.props.dataSource.strategy.map(item=>{
                                return(<Checkbox value={item.value} key={item.id}>{item.value}</Checkbox>)
                            })}              
                        </Checkbox.Group>
                    </div>
                </div>
                <div className="tabList">
                    <div className="tipTitle">{formatMessage({id:"app.title.exam.publish.manual.rectification",defaultMessage:"人工纠偏"})}</div>
                    <div className="content">
                        <RadioGroup onChange={this.onChangeRectify} value={this.state.rectify}>
                        {this.props.dataSource.rectify.map(item=>{
                            return(<Radio value={item.value} key={item.id}>{item.value}</Radio>)
                        })}                  
                        </RadioGroup>
                    </div>
                </div>
            </div>
          </Modal>)
      }
    
}
export default TestSetModal