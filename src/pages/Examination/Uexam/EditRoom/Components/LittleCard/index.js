import React, { PureComponent, Fragment } from 'react';
import { Button, Divider, Input,Radio  } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import{lessWords} from '@/frontlib/utils/utils'
import styles from './index.less';
import cs from 'classnames';

/**
 * 策略卡牌组件，用于列表策略悬浮显示和策略调整使用
 * @author tina.zhang.xu
 * @date   2019-8-7
 * 
 */

class LittleCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  componentDidMount() {
  }

    //104 设置默认策略
  updateStrategy = () => {
    const{Item}=this.props;
    if(Item.isDefault=="Y"){
      return
    }
    this.props.updateStrategy(Item.id)
  }

  showDetails=()=>{
    const{Item}=this.props;
    this.props.showDetails(Item);
  }

  onClick=()=>{
    const{callback,index}=this.props;
    callback(index);
  }

render() {
    const{Item,show,index,checked}=this.props;
  return (
    <div className="littlecard" onClick={this.onClick.bind(this)}>
      {show&&<div className="head">
        <Radio className="radio" checked={(index==checked)?true:false}>{lessWords(Item.name)}</Radio>
        <div className='line'></div>
      </div>}
      <div className="popCard"><span>{formatMessage({id:"app.text.kcrs",defaultMessage:"考场人数"})}</span><span>{Item.isLimited=="Y"?formatMessage({id:"app.text.xd",defaultMessage:"限定"}):formatMessage({id:"app.text.bxd",defaultMessage:"不限定"})}</span></div>
      <div className="popCard"><span>{formatMessage({id:"app.text.swkssj1",defaultMessage:"上午开始时间"})}</span><span>{Item.amBeginTime}</span></div>
      <div className="popCard"><span>{formatMessage({id:"app.text.xwkssj1",defaultMessage:"下午开始时间"})}</span><span>{Item.pmBeginTime}</span></div>
      <div className="popCard"><span>{formatMessage({id:"app.text.uexam.examination.editroom.littlecard.theTestTime",defaultMessage:"考试时长"})}</span><span>{Item.examTime+"分钟"}</span></div>
      <div className="popCard"><span>{formatMessage({id:"app.text.uexam.examination.editroom.littlecard.theDailyBatch",defaultMessage:"每日批次"})}</span>{<FormattedMessage
              id="app.text.bzby"
              defaultMessage="标准：{standardNum}场/备用：{backupNum}场"
              values={{
                  standardNum:Item.standardNum,
                  backupNum:Item.backupNum,
              }}
          />}</div>
      <div className="popCard"><span>{formatMessage({id:"app.text.byjs",defaultMessage:"备用机数"})}</span><span>{`每考场${Item.backupMachineNum}台`}</span></div>
      {show&&<div className={Item.isDefault=="Y"?"foot set":"foot"}>
              <span onClick={this.updateStrategy.bind(this)} >
               {Item.isDefault=="Y"?formatMessage({id:"app.text.mrcl",defaultMessage:"·默认策略"}):formatMessage({id:"app.text.swmr",defaultMessage:"设为默认"})}</span>
        <span onClick={this.showDetails.bind(this)} >{formatMessage({id:"app.text.xq",defaultMessage:"详情 "})}></span></div>}
    </div>
  )
}
}
export default LittleCard
