/*
 * @Author    tina.zhang
 * @Date      2019-5-15
 * @copyright 学校报告显示人数
 */
import React, { PureComponent } from 'react';
import { Card, Tabs, Button, Message, Select, Input, message,Anchor } from 'antd';
import { toChinesNum } from '@/frontlib/utils/utils';
import { formatMessage} from 'umi/locale';
import './index.less';

class ShowRightNumber extends PureComponent {
  constructor(props) {
    super(props);
    this.state={
      multiClass:false,//是否多班
      classData:[],//班级正确人数
      taskData:[],//任务正确人数
      show:false,//是否显示信息
    }
  }

  componentDidMount() {
    const{dataSource,twoLevel, classNum}=this.props
    let mulitTemp=false;
    let classDataTemp=[];
    let taskDataTemp=[];
    let showTemp=false;
    if(!dataSource){
      return
    }
    if(twoLevel){
      dataSource.map((item,index)=>{
        classDataTemp.push({"num":item.num,"data":item.data.classMarkNum});
        taskDataTemp.push({"num":item.num,"data":item.data.markNum});
        if(classNum>1){
          mulitTemp=true;
        }
        if(item.data.answerType=="GAP_FILLING"||item.data.answerType=="CHOICE"){
          showTemp=true;
        }
      })
    }else{
      classDataTemp.push({"num":-1,"data":dataSource.classMarkNum});
      taskDataTemp.push({"num":-1,"data":dataSource.markNum});
      if(classNum>1){
        mulitTemp=true;
      }
      if(dataSource.answerType=="GAP_FILLING"||dataSource.answerType=="CHOICE"){
        showTemp=true;
      }
    }
    // console.log("classDataTemp",classDataTemp)
    // console.log("taskDataTemp",taskDataTemp)
    this.setState({
      show:showTemp,
      multiClass:mulitTemp,
      classData:classDataTemp,
      taskData:taskDataTemp,
    })
  }

  render() {
    const{multiClass,classData,taskData,show}=this.state;
    const{exercise}=this.props;
    return (
      <div className="showRightNumber">
      {show&&<table border="0">
        <tbody>
          <tr>
            <td className="leftTitle">{multiClass?formatMessage({id:"app.text.classrightnumber",defaultMessage:"本班正确人数："}):formatMessage({id:"app.text.rightnumber",defaultMessage:"正确人数："})}</td>
            <td className="rightInfo">
            { classData.map((item,index)=>{
              return(
              <div key={"dev"+index} className="unit">{item.num==-1?"":<div className="point"><span>{item.num}</span></div>}{item.data+"人"}</div>
              )
             })
            }     
            </td>
          </tr>
          {multiClass&&<tr>
            <td className="leftTitle">{exercise?formatMessage({id:"app.text.bclxzqrs",defaultMessage:"本次练习正确人数："}):formatMessage({id:"app.text.bckszqrs",defaultMessage:"本次考试正确人数："})}</td>
            <td className="rightInfo">
            { taskData.map((item,index)=>{
              return(
              <div key={"dev1"+index} className="unit">{item.num==-1?"":<div className="point"><span>{item.num}</span></div>}{item.data+formatMessage({id:"app.text.r",defaultMessage:"人"})}</div>
              )
             })
            }
            </td>
          </tr>}
        </tbody>
        </table>}
      </div>
    );
  }
}
export default ShowRightNumber;
