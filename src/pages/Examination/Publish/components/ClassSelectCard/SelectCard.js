/**
 * 选择班级卡片
 * @author tina.zhang
 */
import React, { PureComponent } from 'react';
import { Checkbox,Divider } from 'antd';
import { formatMessage } from 'umi/locale';


export default class SelectCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onClosed = () => {
    this.setState({
      classIDList: [],
    });
  };
  render() {
    const {checked,dataSource,choosedNum,total} =this.props;

    let teacherId = localStorage.getItem("teacherId");
    let teacherName = "";
    if(teacherId == dataSource.teacherId){
      teacherName = formatMessage({id:"app.text.exam.publish.me",defaultMessage:"我"});
    }else{
      teacherName = dataSource.teacherName;
    }
    console.log("checked",checked)
    return (
        <div className={checked ? "classCard_checked":"classCard"}>
            <div className="cardflex cardbetween">
            <div className="class">{dataSource.className || dataSource.name}</div>
            <Checkbox className="cardCheckbox" checked={checked} disabled={total === 0} onChange={(e)=>{
              console.log(e.target.checked);
              dataSource.isChoosed = e.target.checked;
              this.props.update(e.target.checked);
            }}/>
            </div>
            <div className="cardflex">
            <div title={teacherName && teacherName.length>4 ? teacherName : ""} className={"teacherName"}>{formatMessage({id:"app.text.classManageTeacher",defaultMessage:"教师"})}：{teacherName}</div>
            <Divider type="vertical" />
            <div style={{display: "flex",alignItems: "center",cursor:"pointer"}} onClick={(e)=>{
                this.props.showModal(dataSource);
              }}>
              
              <span>{formatMessage({id:"app.text.classManangeSelected",defaultMessage:"已选"})}:</span>
              <span>{choosedNum}/{total}{formatMessage({id:"app.text.exam.publish.number.student",defaultMessage:"名学生"})}</span>
              <i className="iconfont icon-link-arrow-down" />
            </div>
            </div>
        </div>
    );
  }
}
