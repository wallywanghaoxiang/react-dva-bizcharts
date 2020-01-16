import React, { Component } from 'react';
import styles from './index.less';

class ClassTag extends Component {
    state = {
      };

      componentWillMount() {
    }


    render() {
       const {data} = this.props;
        return (
          <div className={styles.classBox}>
            {data.className}
          </div>
    )
    }
}

export default ClassTag