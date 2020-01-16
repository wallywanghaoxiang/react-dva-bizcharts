/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    底部提示

 */

export default class CountDown extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
        ishaveMore:false,
    };
  }

  componentDidMount(){
      
    // 监听滚动事件
    setTimeout(() => {
        document
          .getElementById('paper_rightContent')
          .addEventListener('scroll', this.handScroll, { passive: true });
      }, 500);
  }

  componentWillReceiveProps(nextProps) {
    const { paperData, masterData } = nextProps;
    const newstaticIndex = masterData.staticIndex;
    const oldstaticIndex = this.props.masterData.staticIndex;
    if (
        paperData.paperInstance[newstaticIndex.mainIndex - 1] &&
        paperData.paperInstance[newstaticIndex.mainIndex - 1].pattern &&
        paperData.paperInstance[newstaticIndex.mainIndex - 1].pattern.questionPatternType === 'NORMAL'
      ) {
        if (newstaticIndex.mainIndex !== oldstaticIndex.mainIndex) {
          setTimeout(() => {
            const scrollDiv = document.getElementById('paper_rightContent');
            if(scrollDiv){
              if (scrollDiv.scrollHeight === scrollDiv.clientHeight+scrollDiv.scrollTop) {
                this.setState({ ishaveMore: false });
              }else if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
                this.setState({ ishaveMore: true });
              }else{
                  this.setState({ ishaveMore: false });
                }
            }
          }, 1000);
        } else {
          // 分页处理
          const { mains } = masterData;
          const max =
            Number(newstaticIndex.questionIndex) > Number(oldstaticIndex.questionIndex)
              ? Number(newstaticIndex.questionIndex)
              : Number(oldstaticIndex.questionIndex);
          const min =
            Number(newstaticIndex.questionIndex) < Number(oldstaticIndex.questionIndex)
              ? Number(newstaticIndex.questionIndex)
              : Number(oldstaticIndex.questionIndex);
          let falg = false;
          for (let i = min; i < max; i++) {
            if (mains[newstaticIndex.mainIndex].questions[i].pageSplit === 'Y') {
              falg = true;
              break;
            }
          }
          if (falg) {
            setTimeout(() => {
              const scrollDiv = document.getElementById('paper_rightContent');
              if(scrollDiv){
                if (scrollDiv.scrollHeight === scrollDiv.clientHeight+scrollDiv.scrollTop) {
                  this.setState({ ishaveMore: false });
                }else if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
                  this.setState({ ishaveMore: true });
                }else{
                  this.setState({ ishaveMore: false });
                }
              }
            }, 1000);
          }else{
            setTimeout(() => {
                const scrollDiv = document.getElementById('paper_rightContent');
                if(scrollDiv){
                  if (scrollDiv.scrollHeight === scrollDiv.clientHeight+scrollDiv.scrollTop) {
                      this.setState({ ishaveMore: false });
                  }
                }
              }, 1000);
          }
        }
      } else if (
        newstaticIndex.mainIndex !== oldstaticIndex.mainIndex ||
        newstaticIndex.questionIndex !== oldstaticIndex.questionIndex
      ) {
        setTimeout(() => {
          const scrollDiv = document.getElementById('paper_rightContent');
        //   console.log(scrollDiv.scrollHeight,scrollDiv.clientHeight,scrollDiv.scrollTop)
        if(scrollDiv){
          if (scrollDiv.scrollHeight === scrollDiv.clientHeight+scrollDiv.scrollTop) {
            this.setState({ ishaveMore: false });
          }else if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
              this.setState({ ishaveMore: true });
            }else{
              this.setState({ ishaveMore: false });
            }
        }
        }, 1000);
      }
  }

   /**
   * 右侧滚动去除样式
   */
  handScroll = () => {
    const { ishaveMore } = this.state;
    if (ishaveMore) {
      this.setState({ ishaveMore: false });
    }
  };
  
  componentWillUnmount() {
  }

  render() {
    const {ishaveMore} = this.state;
    if(!ishaveMore) return null
    return (
      <div className={styles.ishaveMore}>
        <div className={styles.tips} style={{ bottom: '76px' }}>
          <div className={styles.myanimation}>
            <div className={styles.greentips}>
              <i className="iconfont icon-mouse" />
              {'下面还有哟~'}
            </div>
            <div className={styles.triangle} />
          </div>
        </div>
      </div>
    );
  }
}
