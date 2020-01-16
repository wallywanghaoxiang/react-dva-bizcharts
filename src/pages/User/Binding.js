import React, { Component } from 'react';
import {Button} from 'antd';
import './Binding.less';
import { connect } from 'dva';

class UserBinding extends Component {

 constructor(props) {
   super(props);
 }

 componentDidMount() {
  const { dispatch } = this.props;
  const mobile = localStorage.getItem('mobile');
  const params = {
    mobile: mobile
  }
  dispatch({
    type: 'invitecampus/fetch',
    payload: params
  })
 }

 handleJoin = (id) => {
   const { dispatch } = this.props;
   console.log(id);
   
    const params = {
      teacherId: id,
    }
    dispatch({
        type: 'binding/fetch',
        payload: params,
    });
 }
 
 render() {
   const {invitecampus:{invitecampusRes}} = this.props;
   
   return (
     <div className="user-binding">
     您需要先加入学校才能使用老师平台，请先联系校学科组长加入学校！
     {(invitecampusRes.data&&invitecampusRes.data.length>0)?(
       invitecampusRes.data.map(item => 
        <div className="item" key={item.id}>
          <p>{item.campusName}</p>
          <Button onClick={() => this.handleJoin(item.id)}>确定</Button>
        </div>)
     ):null}
       
     </div>
   );
 }
}

export default connect(({binding,invitecampus}) => ({
  binding,invitecampus
}))(UserBinding)
