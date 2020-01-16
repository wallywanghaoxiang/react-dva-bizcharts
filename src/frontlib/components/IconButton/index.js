import React, { PureComponent } from 'react';
import styles from './index.less';

/**
 * 带图标的按钮组件
 * onClick 	点击事件
 * text 	按钮文字
 * iconName 图标
 *
 * @author tina.zhang
 */
class IconButton extends PureComponent {
  render() {
    const {
      iconName,
      onClick,
      text,
      style,
      className,
      type,
      isNotext,
      textColor,
      tag,
    } = this.props;
    if (type === 'button') {
      return (
        <div className={`iconButton ${className}`} onClick={onClick} style={style}>
          <i className={`iconfont ${iconName}`} />
          {isNotext ? null : <span className={`icontext ${textColor}`}>{text}</span>}
          {tag ? <div className={styles.tag}>{tag}</div> : null}
        </div>
      );
    }

    return (
      <div className={`icon-btn ${className}`} onClick={onClick} style={style}>
        <i className={`iconfont ${iconName}`} />
        <span className={`icontext ${textColor}`}>{text}</span>
        {tag ? <div className={styles.tag}>{tag}</div> : null}
      </div>
    );
  }
}

export default IconButton;
