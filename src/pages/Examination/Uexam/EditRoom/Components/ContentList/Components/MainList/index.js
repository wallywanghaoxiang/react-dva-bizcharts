import React, { PureComponent, Fragment } from 'react';
import { Button, Divider,Tooltip,Input,Table ,Popover} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';
import cs from 'classnames';
import LittleCard from '../../../LittleCard/index'
import{lessWords} from '@/frontlib/utils/utils'

/**
 * 主表
 * @author tina.zhang.xu
 * @date   2019-8-7
 */


class MainList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tableData:[],
    
        }
        this.columns = [
            {
              title: formatMessage({id:"app.text.xx",defaultMessage:"学校"}),
              dataIndex: 'schoolName',
              width:"30%",
              render: data => (<div className={styles.info}>
                <Tooltip title={data}>
                  {`${lessWords(data)}`}
                </Tooltip>
              </div>)
            },
            {
              title: formatMessage({id:"app.text.cl",defaultMessage:"策略"}),
              dataIndex: 'strategynum',
              width:"33%",
              render: data => (
                    data.strategyName?<Popover content={this.pop(data)} placement="bottom" trigger="hover">
                                {data.strategyName}
                            </Popover>:<div>{formatMessage({id:"app.examination.inspect.exam.no.data",defaultMessage:"无"})}</div>)
            },
            {
              title: formatMessage({id:"app.text.uexam.examination.editroom.littlecard.theDailyBatch",defaultMessage:"每日批次"}),
              dataIndex: 'dayList',
              width:"29%",
            },
            {
              title: formatMessage({id:"app.text.cz",defaultMessage:"操作"}),
              dataIndex: 'action',
              width:"8%",
              render:data=>(
                <a onClick={()=>{this.props.callback(data)}}>{formatMessage({id:"app.text.tzcl",defaultMessage:"调整策略"})}</a>
              )
            },
          ];
      }
    componentDidMount() {
      const {dataSource}=this.props;
      this.initData(dataSource)
    }
    componentWillReceiveProps(nextProps){
      this.initData(nextProps.dataSource)
    }
   initData=(dataSource)=>{
       let data=[];
       dataSource.map((Item,index)=>{
        data.push({
            key:index,
            schoolName:Item.campusName,
            strategynum:Item,
            dayList:Item.strategyName&&<FormattedMessage
                        id="app.text.bzby"
                        defaultMessage="标准：{standardNum}场/备用：{backupNum}场"
                        values={{
                            standardNum:Item.standardNum,
                            backupNum:Item.backupNum,
                        }}
                    />,
            action:index
        })
       })
       this.setState({
        tableData:data, 
       })
   }

   //策略悬浮框
   pop=(Item)=>{
        return(
               <div style={{width:220}}><LittleCard Item={Item} show={false}></LittleCard></div>
           )
   }

render() {
    const pagination={
        position:"bottom",
    }
  return (
    <div className={"mainlist"}>
       <Table 
            pagination={pagination} 
            columns={this.columns} 
            dataSource={this.state.tableData} 
            />
        <Button className="btn" onClick={this.props.nextPart} >{formatMessage({id:"app.text.ksbp",defaultMessage:"开始编排"})}</Button>
    </div>
  )
}
}

export default MainList

