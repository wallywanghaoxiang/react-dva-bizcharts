import React, { PureComponent } from 'react';
import { Button } from 'antd';
import { formatMessage } from 'umi/locale';
// import { connect } from 'dva';
import styles from './index.less';
// import cs from 'classnames';
import ChangeRule from '../ChangeRule/index'
import RightList from './Components/RightList/index'
import SearchList from './Components/SearchList/index'
import FinishList from './Components/FinishList/index'
import ManageList from './Components/ManageList/index'




/**
 * 表格区域
 * @author tina.zhang.xu
 * @date   2019-8-7
 * 
 */

class ContentList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: "",// 如果是none就隐藏contentList
      changeRulePage:1,
      changeRuleCardIndex:0,
    }
  }


  componentDidMount() {
    const { doing } = this.props
    this.updataDoing(doing)
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.props

    this.updataDoing(nextProps.doing)
    if (nextProps.status === status) {
      return
    }
    this.setState({
      status: nextProps.status
    })
  }

  updataDoing = (e) => {
    this.setState({
      doing: e
    })
  }

  render() {
    const { step, taskId, searchValue, nextPart } = this.props;
    const { status, doing, changeRulePage,changeRuleCardIndex} = this.state
    return (
      <>
        <div className={status === "none" ? styles.none : styles.contentList}>
          <div className={styles.rightList}>
            {step === "step1" &&
              <ChangeRule 
                taskId={taskId}
                page={changeRulePage}
                cardIndex={changeRuleCardIndex}
                callback={(page, cardIndex) => {
                  this.setState({
                    changeRulePage:page,
                    changeRuleCardIndex:cardIndex,
                  })
                  nextPart("step2") 
                }}
              />}
            {step === "step2" && <RightList status={status} taskId={taskId} />}
            {step === "step3" && <FinishList taskId={taskId} />}
            {step === "manage" && <ManageList />}
          </div>
        </div>
        {status === "none" &&
          <div className={styles.contentList}>
            <SearchList searchValue={searchValue} taskId={taskId} />
          </div>}
        <div className={styles.footer}>
          {step === "step2" && <Button className={styles.btnsss} onClick={() => { nextPart("step3") }}>{formatMessage({ id: "app.text.wcbp", defaultMessage: "完成编排" })}</Button>}
          {step === "manage" && <Button className={styles.btnsss} disabled={doing} onClick={() => { nextPart("step3") }}>{formatMessage({ id: "app.text.wcbp", defaultMessage: "完成编排" })}</Button>}
        </div>
      </>
    )
  }
}


export default ContentList
