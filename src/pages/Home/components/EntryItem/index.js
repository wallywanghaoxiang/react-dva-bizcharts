import React, { Component } from 'react';
import styles from './index.less';

class EntryItem extends Component {
    state = {
      };

      componentWillMount() {
    }


    render() {
       const { icon, text,onClick } = this.props;
        return (
          <div className={styles.entryItem}>
            <img className={styles.icon} alt="" src={icon} onClick={onClick} />
            <div className={styles.title}>{text}</div>
          </div>
    )
    }
}

export default EntryItem