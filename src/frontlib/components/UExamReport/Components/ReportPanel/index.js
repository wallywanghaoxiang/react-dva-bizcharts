import React, { useState, useEffect } from 'react'
import { Divider, Icon } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  extendedBtnText: { id: 'app.examination.report.reportpanel.extendedBtnText', defaultMessage: '展开' },
  unExtendedBtnText: { id: 'app.examination.report.reportpanel.unExtendedBtnText', defaultMessage: '收起' }
});

/**
 * 考后报告-内容Panel
 * @author  leo.guo
 * @date    2019-05-06
 * @param {string} title - 外标题
 * @param {string} innerTitle - 内标题
 * @param {string} bgColor - 背景色
 * @param {string} padding - padding
 * @param {string} hidden - 默认是否收起
 * @param {string} showExtendBtn - 显示展开/收起按钮
 * @param {object} style - panelContent style
 */
function ReportPanel(props) {
  const { title, innerTitle, bgColor, padding, hidden, showExtendBtn, children, style } = props;

  const extendedBtnText = formatMessage(messages.extendedBtnText);
  const unExtendedBtnText = formatMessage(messages.unExtendedBtnText);

  const backgroundStyle = {
    background: bgColor || '#F5F5F5',
    padding
  };
  // 背景、收缩展开按钮
  const [state, setState] = useState({
    background: {
      ...backgroundStyle
    },
    extended: {
      isExtended: false,
      btnText: extendedBtnText,
      iconRotate: 90
    }
  });

  useEffect(() => {
    // 延迟隐藏，否则图表尺寸渲染异常
    if (hidden) {
      setTimeout(() => {
        setState({
          ...state,
          background: {
            ...backgroundStyle,
            display: 'none'
          },
        });
      }, 200);
    }
  }, []);

  // 展开&收缩
  const handleExtended = () => {
    const { isExtended } = state.extended;
    if (!isExtended) {
      setState({
        background: {
          ...state.background,
          display: 'block'
        },
        extended: {
          isExtended: true,
          btnText: unExtendedBtnText,
          iconRotate: -90
        }
      });
    } else {
      setState({
        background: {
          ...state.background,
          display: 'none'
        },
        extended: {
          isExtended: false,
          btnText: extendedBtnText,
          iconRotate: 90
        }
      });
    }
  }

  const iconStyle = {
    transform: `rotate(${state.extended.iconRotate}deg)`,
    WebkitTransform: `rotate(${state.extended.iconRotate}deg)`,
    transformOrigin: '50% 50%'
  }

  return (
    <div className={styles.reportPanel}>
      {title &&
        <div className={styles.header}>
          <Divider type="vertical" />
          <span className="report-panel-title">{title}</span>
          {showExtendBtn &&
            <span className="report-panel-btnbox">
              <span className={styles.btnExtend} onClick={() => { handleExtended(); }}>
                {/* rotate={extended.iconRotate} ant 3.11版本不支持 rotate */}
                <Icon type="double-right" style={iconStyle} />&nbsp;{state.extended.btnText}
              </span>
            </span>
          }
        </div>
      }
      <div className={styles.panelContent} style={{ ...state.background, ...style }}>
        {innerTitle &&
          <div className={styles.innerTitle}>
            <span>{innerTitle}</span>
            <Divider type="horizontal" />
          </div>
        }
        {children}
      </div>
    </div>
  )
}

export default ReportPanel
