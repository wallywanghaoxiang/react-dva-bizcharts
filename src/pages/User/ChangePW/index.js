import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import styles from './index.less';
import ChangeBox from './ChangeBox/index';
import logo from '@/assets/logo.png';


class ChangePW extends Component {
    state = {
      type:'teacher',
      };

      componentWillMount() {
        const { match } = this.props;
        const {params} = match;
        const {type} = params;
        this.setState({
          type
        })
    }


    render() {
        const { containerWidth,containerHeight } = this.props;
        const {type} = this.state;
        const boxHeight = 446;
        const mt = (containerHeight - boxHeight) / 2;
        let smallScreen;
        let bgImgeStyle;
        if (containerWidth<1024) {
            smallScreen = true;
            bgImgeStyle = {backgroundPosition:'center center'};
        } else {
            smallScreen = false;
            bgImgeStyle = {backgroundPosition:`6% center`};
        }
        const style = smallScreen ? {position:'fixed',left:'50%',top:'50%',marginLeft:'-205px',marginTop:'-223px',boxShadow:'0px 2px 20px 0px rgba(0,0,0,0.1)'} : {margin:'0 auto',marginTop:`${mt}px`,boxShadow:'none'};
        return (
          <div className={styles.resetPW} style={bgImgeStyle}>
            <div className={styles.logoBox}>
              <img src={logo} alt="logo" />
            </div>
            <div className={styles.right} style={{width:smallScreen?'0px':'50%'}}>
              <ChangeBox style={style} type={type} />
            </div>
          </div>
    )
    }
}

export default Dimensions({
    getHeight: () => {
      // element
      return window.innerHeight;
    },
    getWidth: () => {
      // element
      return window.innerWidth;
    },
  })(
    ChangePW
  );