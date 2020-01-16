import React, { Component } from 'react';
import styles from './index.less';

class ItemTitle extends Component {
    state = {
      };

      componentWillMount() {
    }


    render() {
       const { text } = this.props;
        return (
          <div className={styles.itemTitle}>
            <div className={styles.icon} />
            <div className={styles.title}>{text}</div>
          </div>
    )
    }
}

export default ItemTitle