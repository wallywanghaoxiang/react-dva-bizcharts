import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    制作试卷底部按钮

 */


export default class MyButton extends PureComponent {
  constructor(props) {
    super(props);

  }



  render() {
    const {title,onClick,className} = this.props; 

    return (
        <div className="MyButton" onClick={onClick}>
            {title}
        </div>        
    );
  }
}
