
import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from "dva";
import cs from "classnames";
import BasicSet from './components/BasicSet';
import EditPassword from './components/EditPassword';
import BindAccount from './components/BindAccount';
import styles from './index.less';

const messages = defineMessages({
    usercentermanage:{id:'app.menu.account.user',defaultMessage:'基本设置'},
    usercenter:{id:'app.menu.account.usercenter',defaultMessage:'个人中心'},
 
})


@connect(({ login }) =>{
  const {campusList} = login;
  return { campusList};
})
class UserCenter extends Component {
    state = {
        current:'0'
      };

      componentWillMount() {
    }

   // 当前所在状态
    setCurrent=(current)=>{
        switch (current) {
            case '0':
            return <BasicSet />;
            case '1':
            return <EditPassword />;
            case '2':
            return <BindAccount />;
            default:
            return <div />;
        }
    }

    changeCurrent=(current)=>{
        this.setState({
            current
        })
    }

    render() {
       const {current} = this.state;
        return (
          <div className={styles['user-manager']}> 
            <h1 className={styles.stylesName}><span>{formatMessage(messages.usercenter)}&nbsp;/&nbsp;</span>{formatMessage(messages.usercentermanage)}</h1>
            
            <PageHeaderWrapper wrapperClassName={cs('wrapperMain',styles.BasicSetInfomation)}>
              <div className={styles.userAccount}>
                <div className={styles.navLeft}>
                  <ul>
                    <li className={current==='0'?styles.current:''} onClick={()=>this.changeCurrent('0')}>{formatMessage({id:"app.menu.account.user",defaultMessage:"基本设置"})}</li>
                    <li className={current==='1'?styles.current:''} onClick={()=>this.changeCurrent('1')}>{formatMessage({id:"app.student.user.center.tab2",defaultMessage:"修改密码"})}</li>
                    <li className={current==='2'?styles.current:''} onClick={()=>this.changeCurrent('2')}>{formatMessage({id:"app.menu.account.bind",defaultMessage:"账号绑定"})}</li>
                  </ul>
                </div>
                <div className={styles.navRight}>
                  {this.setCurrent(current)}
                </div>
              </div>
              
            </PageHeaderWrapper>
          </div>  
      )
    }
}

export default UserCenter