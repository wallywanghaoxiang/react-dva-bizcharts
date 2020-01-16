import React, { Component } from 'react';
import {Form, Modal, Select,message} from 'antd';
import { connect } from "dva";
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
const {Option} = Select
// formatMessage(
const messages = defineMessages({
  editSuccess: { id: 'app.menu.learngroup.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.learngroup.add.success.toast', defaultMessage: '您已成功创建' },
  editFailure: { id: 'app.menu.learngroup.success.editFailure', defaultMessage: '编辑失败！' },
  addFailure: { id: 'app.menu.learngroup.add.success.addFailure', defaultMessage: '创建失败' },
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  naturalName: { id: 'app.menu.learngroup.class.name', defaultMessage: '行政班' },
  unitName: { id: 'app.menu.learngroup.learn.name', defaultMessage: '学科' },
  unitNameInput: { id: 'app.menu.learngroup.learn.unitNameInput', defaultMessage: '小组名称' },
  unitNameInputPlaceholder: { id: 'app.menu.learngroup.learn.unitNameInputPlaceholder', defaultMessage: '请输入小组名称' },
  unitNameIsTooLong: { id: 'app.menu.learngroup.name.length.over.unitNameIsTooLong', defaultMessage: '长度不能超过20字' },
  unitNameIsNoData: { id: 'app.menu.learngroup.name.length.over.limited', defaultMessage: '小组名称不能为空' },
  naturalNameIsNoData: { id: 'app.menu.learngroup.name.length.over.naturalNameIsNoData', defaultMessage: '行政班不能为空' },
  groupIsTooLong: { id: 'app.menu.learngroup.name.length.over.groupIsTooLong', defaultMessage: '您创建的学习小组数量已达上限，不可再添加！' },
  addGroup:{id:'app.menu.learninggroup.addGroup',defaultMessage:'创建小组'},
  editGroup:{id:'app.menu.learninggroup.editGroup',defaultMessage:'编辑小组'},
  selectPlaceholder:{id:'app.menu.learninggroup.selectPlaceholder',defaultMessage:'请选择'},
});

@Form.create()

@connect(({ learn }) =>{
  const {naturalClassList,teachingClassList,groupList,subjectCode,currentGroupName,name,naturalClassId} = learn;
  return { naturalClassList,teachingClassList,groupList,subjectCode,currentGroupName,name,naturalClassId};
})
class AddGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:false,
      naturalClassId:'',
      naturalClassName:'',
      subjectCode:'',
      gradeId:'',
    };
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type:'learn/queryMyNaturalClasses',
      payload:{
        campusId:localStorage.getItem('campusId'),
        teacherId:localStorage.getItem('teacherId')
      }
    })
  }

 // 获取小组列表
 fetchGroup=()=>{
  const {dispatch,id} = this.props;
  let {naturalClassId} = this.state;
  if(id) {
    naturalClassId = this.props.naturalClassId
  }
  dispatch({
    type:'learn/fetchGroupList',
    payload:{
      campusId:localStorage.getItem('campusId'),
      teacherId:localStorage.getItem('teacherId')
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

  this.setState({
    naturalClassId:'',
    naturalClassName:'',
    subjectCode:'',
    gradeId:''
  })

}

  onHandleCancel = () => {
      const {hideModal} = this.props;
      hideModal()

  };

  // 创建编辑
  onHandleOK = () => {
    const { form,dispatch,id,groupList,name } = this.props;
    const {naturalClassId,subjectCode,gradeId,naturalClassName} = this.state;
    const that = this;
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
    if(groupMyList.length>10||groupMyList.length===10&&id==='') {
      message.error(formatMessage(messages.groupIsTooLong));
      return;
    }
    form.validateFields((err, values) => {
      if (!err) {
          console.log(err,values)
          const {hideModal} = this.props;
          this.setState({
            loading:true
          })
          if(id) {
            const {naturalClassId} = this.props;
            const currentNewGroupName = this.nameInput.value
            dispatch({
              type:'learn/editMyNaturalClasses',
              payload:{
                id,
                campusId:localStorage.getItem('campusId'),
                teacherId:localStorage.getItem('teacherId'),
                naturalClassId,
                subjectCode:'103',
                name:this.nameInput.value,
                gradeId
              },
              callback:(res) => {
                that.setState({
                  loading:false                
                })
                if(res.responseCode==='200') {
                  dispatch({
                    type:'learn/saveCurrent',
                    payload:{
                      id,currentGroupName:currentNewGroupName,
                      naturalClassId,classNameInfo:name
                    }
                  })
                  that.fetchGroup()
                  message.success(formatMessage(messages.editSuccess))
                } else{
                  message.error(formatMessage(messages.editFailure))
                }
              }
            })
          }
          else {
            dispatch({
              type:'learn/createMyNaturalClasses',
              payload:{
                campusId:localStorage.getItem('campusId'),
                teacherId:localStorage.getItem('teacherId'),
                naturalClassId,
                subjectCode,
                name:this.nameInput.value,
                gradeId
              },
              callback:(res) => {
                that.setState({
                  loading:false                  
                })
                if(res.responseCode==='200') {
                  const {data} = res;
                  // 创建成功后设置当前小组为新增的小组ID
                  dispatch({
                    type:'learn/saveCurrent',
                    payload:{
                      id:data.id,
                      currentGroupName:data.name,
                      naturalClassId,
                      classNameInfo:naturalClassName
                    }
                  })
                  // 创建成功后立即查询该小组下的学生列表
                  dispatch({
                    type:'learn/fetchStudentList',
                    payload:{
                      id:data.id
                    }
                  })
                  that.fetchGroup()
                  message.success(formatMessage(messages.addSuccess)+res.data.name)
                }else{
                  message.error(formatMessage(messages.addFailure))
                }
              }
            })
          }

          hideModal()

      }
    })
  };

  // 切换行政班
  changeNatural=(value)=>{
    const {naturalClassList,form} = this.props;
    form.resetFields();
    const result = naturalClassList.find(item=>item.naturalClassId===value)
    console.log(result.naturalClassId)
    this.setState({
      naturalClassId:result.naturalClassId,
      naturalClassName:result.className,
      gradeId:result.gradeId
    })
  }


  // 切换学科
  changeTeaching=(value)=>{
    this.setState({
      subjectCode:value
    })
  }

  // 验证输入的名称长度
  checkInput = (rule,value, callback) => {
    if(this.nameInput.value.trim()==='') {
      callback(formatMessage(messages.unitNameIsNoData));
    }
    if (this.nameInput.value.length < 21) {
      callback();
      return;
    }
    callback(formatMessage(messages.unitNameIsTooLong));
  }


 // 	学科，默认用自己所教的学科(班级管理首页已经返回【CAMPUS -301】)，如果就一个，则没有下拉选择，如果多个，则让下拉选择学科
  renderTeaching=()=>{
    const {id,teachingClassList} = this.props;
    console.log(teachingClassList)
    if(id||teachingClassList.length===1) {
      // let current = ''
      // teachingClassList.forEach((item)=>{
      //   if(item.subjectId===subjectCode) {
      //     current=item.subjectName
      //   }
      // })
      return <div className={styles.teaching}><span className="itemTitle">{formatMessage(messages.unitName)}<i>&nbsp;</i></span>{formatMessage({id:"app.text.classManage.english",defaultMessage:"英语"})}</div>
    }
    return (
      <div className="item">
        <span className="itemTitle">{formatMessage(messages.unitName)}<i>&nbsp;</i></span>{formatMessage({id:"app.text.classManage.english",defaultMessage:"英语"})}
        {/* <Select placeholder={formatMessage(messages.selectPlaceholder)} onChange={this.changeTeaching}>
          {teachingClassList.map((item)=>{
              return <Option value={item.subjectId} key={item.id}>{item.subjectName}</Option>
          })}
        </Select> */}
      </div>
  )

  }

  renderNatural =()=>{
    const {id,naturalClassList,form,name} = this.props;
    const { getFieldDecorator } = form;
    const {naturalClassId} = this.state;
    console.log(naturalClassList)
    if(id) {
      return <div className={styles.teaching}><span className="itemTitle">{formatMessage(messages.naturalName)}<i>&nbsp;</i></span>{name}</div>
    }
    return (
      <FormItem>
        {getFieldDecorator('naturalClass', {
          initialValue: naturalClassId,
          rules: [
            { required: true, message: formatMessage(messages.naturalNameIsNoData)}
          ],
        })(
          <div className="item">
            <span className="itemTitle">{formatMessage(messages.naturalName)}<i>*</i></span>
            <Select placeholder={formatMessage(messages.selectPlaceholder)} onChange={this.changeNatural}>
              {naturalClassList.map((item)=>{
                  return <Option value={item.naturalClassId} key={item.naturalClassId}>{item.alias||item.className}</Option>
              })}
            </Select>

          </div>
        )}
      </FormItem>
    )
  }

 


  render() {
    const { loading } = this.state;
    const { form,visible,id,currentGroupName } = this.props;
    const { getFieldDecorator } = form;
    console.log(currentGroupName,id)
    return (
      <Modal
        visible={visible}
        centered
        title={id?formatMessage(messages.editGroup):formatMessage(messages.addGroup)}
        closable={false}
        confirmLoading={loading}
        width={360}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.AddGroupModal}
      >

        <Form layout="vertical">


          {this.renderNatural()}
          {this.renderTeaching()}


          <FormItem>
            {getFieldDecorator('nameInput', {
              initialValue: id?currentGroupName:'',
              rules: [               
                { validator: this.checkInput }
              ],
            })(
              <div className="item">
                <span className="itemTitle">{formatMessage(messages.unitNameInput)}<i>*</i></span>
                <input placeholder={formatMessage(messages.unitNameInputPlaceholder)} maxLength={20} ref={nameInput => {this.nameInput = nameInput}} defaultValue={id?currentGroupName:''} />
              </div>
            )}
          </FormItem>

        </Form>
      </Modal>
    );
  }
}

export default AddGroupModal;
