
// 班级列表
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from "dva";
import { Button,Menu,Dropdown,Modal,message,Tooltip} from 'antd';
import styles from '../index.less'

const {confirm} = Modal;

const messages = defineMessages({
    addGroup:{id:'app.menu.learngroup.addGroup',defaultMessage:'创建小组'},
    delGroupSucess:{id:'app.menu.learngroup.delGroupSucess',defaultMessage:'删除成功'},
    delGroupFailure:{id:'app.menu.learngroup.delGroupFailure',defaultMessage:'删除失败'},
    editGroup:{id:'app.menu.learngroup.editGroup',defaultMessage:'编辑小组'},
    delGroup:{id:'app.menu.learngroup.delGroup',defaultMessage:'删除小组'},
    cancel: { id: 'app.cancel', defaultMessage: '取消' },
    submit: { id: 'app.button.comfirm', defaultMessage: '确认' },
    cancelconfirm: { id: 'app.menu.learngroup.cancelconfirm', defaultMessage: '确认删除' },
    submityesorno: { id: 'app.menu.learngroup.submityesorno', defaultMessage: '小组，是否确认？' },
 
})


@connect(({ learn,login }) =>{
    const {groupList,currentLearnGroupID} = learn;
    const { campusID } = login;
    return { groupList,currentLearnGroupID,campusID};
  })
class SiderClass extends Component {
    state = {
    };

    componentWillMount() {
    // 获取小组列表并设置第一个为默认小组
     this.setGroup()
  }


  // 当校区切换时所有数据重新请求
  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {   // 获取小组列表并设置第一个为默认小组
      this.setGroup()
    }
  }

  // 获取小组列表并设置当前小组ID等

  setGroup=()=>{
    const {dispatch} = this.props;
      dispatch({
        type:'learn/fetchGroupList',
        payload:{
          campusId:localStorage.getItem('campusId'),
          teacherId:localStorage.getItem('teacherId')
        },
        callback:(res) => {
          const groupMyList = [];
          if(res.length>0) {
            res.forEach((item)=>{
              if(item.learningGroupList.length>0) {
                item.learningGroupList.forEach((vo)=>{
                  groupMyList.push({vo,naturalClassId:item.naturalClassId,classNameInfo:item.alias||item.className})
                })
              }
            })
          }
          if(groupMyList.length>0) {
            this.saveInfo(groupMyList[0].vo.learningGroupId,groupMyList[0].vo.name,groupMyList[0].naturalClassId,groupMyList[0].classNameInfo)        
          }
        }
      })
  }

  // 保存当前小组信息 当前小组包含的学生
  saveInfo=(id,name,naturalClassId,classNameInfo)=>{
    const {dispatch} = this.props;
    dispatch({
      type:'learn/saveCurrent',
      payload:{
        id,currentGroupName:name,
        naturalClassId,classNameInfo
      }
    })
    dispatch({
      type:'learn/fetchStudentList',
      payload:{
        id
      }
    })
    dispatch({
      type:'learn/fetchNaturalClassList',
      payload:{        
        naturalClassId,
        campusId:localStorage.getItem('campusId'),
        teacherId:localStorage.getItem('teacherId')
      }
    })
  }
 

    // 编辑小组
    editGroup=(id,name,subjectCode,className)=>{
      const {addGroup,dispatch} = this.props;
      console.log(name)
      dispatch({
        type:'learn/saveCurrentGroupInfo',
        payload:{
          name,subjectCode,className
        }
      })
      addGroup(id)
    }

    // 切换当前小组
    changeCurrentGroup=(id,name,naturalClassId,className)=>{ 
      this.saveInfo(id,name,naturalClassId,className)    
    }
    
    // 删除小组
    delGroup=(id,name)=>{
      const {dispatch} = this.props;
      const that = this     
      confirm({
        title:'',
        content: (
          <div className="cont">
            <span>{formatMessage(messages.cancelconfirm)}</span>
            <span className="name">{name}</span>
            <span> {formatMessage(messages.submityesorno)}</span>
          </div>
        ),
        okText: formatMessage(messages.submit),
        cancelText: formatMessage(messages.cancel),
        onOk() {
          dispatch({
            type:'learn/delMyNaturalClasses',
            payload:{
              id
            },
            callback:(res) => {
              const x=typeof res==='string'?JSON.parse(res):res;
              const {responseCode} = x
              if(responseCode==='200') {
                that.setGroup()
                message.success(formatMessage(messages.delGroupSucess))
              }else{
                message.error(formatMessage(messages.delGroupFailure))
              }
            }
          })
        },
        onCancel() {},
      });
    }

    render() {
      const {addGroup,groupList,currentLearnGroupID} = this.props;
      const groupMyList = [];
      if(groupList.length>0) {
        groupList.forEach((item)=>{
          if(item.learningGroupList.length>0) {
            item.learningGroupList.forEach((vo)=>{
              groupMyList.push(vo)
            })
          }
        })
      }
    
      const menu =(id,name,subjectCode,className)=> (
        <Menu>
          <Menu.Item onClick={()=>this.editGroup(id,name,subjectCode,className)}>
            编辑小组
          </Menu.Item>
          <Menu.Item onClick={()=>this.delGroup(id,name)}>
            删除小组
          </Menu.Item>
          
        </Menu>
      );
        return (
          groupMyList.length>0&&
          <div className={styles.learnLeft}>
            <Button className={styles.addGroup} onClick={()=>addGroup('')}><i className="iconfont icon-add" />{formatMessage(messages.addGroup)}</Button>
            {groupList.length>0&&groupList.map((item)=>{
             
                return (
                  item.learningGroupList.length>0&&
                  <dl>
                    <dt><Tooltip title={item.alias||item.className}>{item.alias||item.className}</Tooltip></dt>
                    <dd>
                      <ul>
                        {
                          item.learningGroupList.map((vo)=>{
                            return (
                              <li className={currentLearnGroupID===vo.learningGroupId?(styles.current):''} onClick={()=>this.changeCurrentGroup(vo.learningGroupId,vo.name,item.naturalClassId,item.alias||item.className)}>
                                <span className={styles.studentNum}>{vo.studentNum}</span><p className={styles.classGradeName}>{vo.name}</p>
                                <Dropdown overlay={menu(vo.learningGroupId,vo.name,vo.subjectCode,item.className)}>
                                  <b>...</b>
                                </Dropdown>
                              </li>
                            )
                          })
                        }
                        
                      </ul>
                    </dd>
                  </dl>
                )
              
            })}
            
           
          </div>
        
         
        )
    }
}

export default SiderClass