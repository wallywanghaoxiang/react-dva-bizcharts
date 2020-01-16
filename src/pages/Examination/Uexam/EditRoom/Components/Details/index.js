import React, { PureComponent, Fragment } from 'react';
import { Select,Modal,Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';


/**
 * 策略详情页弹框
 * @author tina.zhang.xu
 * @date   2019-8-10
 */

@connect(({ editroom, loading }) => ({
  stdDict: editroom.stdDict,
}))
class Details extends PureComponent {
  constructor(props) {
    super(props);

  }
  componentDidMount() {
  }


  handleback=()=>{
    this.props.callback();
  }
  
  footer=()=>{
    let html=(
      <div className={styles.footer}>
        <div className={styles.info}>
        </div>
        <div className={styles.btns}>
         <Button className={styles.btnCancel} onClick={this.handleback}>{formatMessage({id:"app.notice.info.return",defaultMessage:"返回"})}</Button>
         </div>
      </div>
    )
  return html;
  }
  //弹窗顶部的信息
  head=()=>{
    let html=(
      <div className={styles.head}>
        <div className={styles.title}>
            {formatMessage({id:"app.text.clxq",defaultMessage:"策略详情"})}
        </div>
      </div>
    )
    return html;
  }
  showList=()=>{
    let html=[];
    let data=this.props.dataSource.examBatchList
    if(this.props.dataSource&&this.props.dataSource.examBatchList){
      data=this.props.dataSource.examBatchList;
      for(let i=0; i<data.length;i++){
        html.push(
          <tr key={i}>
          <td style={{width:100}}>{data[i].name}</td>
          <td style={{width:120}}>{this.code(data[i].type)}</td>
          <td>{data[i].startTime+"-"+data[i].endTime}</td>
        </tr>
        )
      }
    }
    return html;
  }

  code=(type)=>{
    let a=this.props.stdDict.find(function(item){
      return item.code===type;
    })

    return a.value
  }

render() {
  const{dataSource}=this.props
  return (
    <Modal
        title={null}
        visible={true}
        bodyStyle={{marginTop:"50px"}}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: true }}
        width={433}
        closable={false}
        footer={null}
      >
        <div className={styles.details}>
          <>{this.head()}</>
          <div className={styles.name}>{dataSource.name}</div>

          <div className={styles.tableList}>
          <table className={styles.table} >
            <thead>
              <tr>
                <th style={{width:100}}>{formatMessage({id:"app.text.uexam.examination.editroom.details.batch",defaultMessage:"批次"})}</th>
                <th style={{width:120}}>{formatMessage({id:"app.text.uexam.examination.editroom.details.batchType",defaultMessage:"批次类型"})}</th>
                <th>{formatMessage({id:"app.text.uexam.examination.editroom.details.time",defaultMessage:"时间"})}</th>
              </tr>
            </thead>
      </table>
        <div  className={styles.tableBody}>
        <table className={styles.table} >
              <tbody>
                {this.showList()}
              </tbody>
        </table>
        </div>
          </div>
          <div className={styles.info}><span>{formatMessage({id:"app.text.uexam.examination.editroom.details.theNumberOfTheTest",defaultMessage:"考场人数"})}</span><span>{dataSource.isLimited=="Y"?formatMessage({id:"app.text.xd",defaultMessage:"限定"}):formatMessage({id:"app.text.bxd",defaultMessage:"不限定"})}</span></div>
          <div className={styles.line}></div>
          <div className={styles.info}><span>{formatMessage({id:"app.text.uexam.examination.editroom.details.theStandbyMachineNumber",defaultMessage:"备用机数"})}</span><span>{`每考场${dataSource.backupMachineNum}台`}</span></div>
          <div className={styles.line}></div>
          <>{this.footer()}</>
        </div>
  </Modal>
  )
}
}
export default Details
