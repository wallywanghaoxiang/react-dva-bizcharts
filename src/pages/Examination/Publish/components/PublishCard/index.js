/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { connect } from 'dva';
import styles from '../../index.less';
import IconButton from '@/frontlib/components/IconButton';
import Permission from '@/pages/Permission';
import iconPro from '@/assets/icon_pro.png';

@connect(({ permission = [] }) => {
  return { permissionList: permission };
})
class PublishCard extends Component {
  state = {
    styleText: '',
  };

  componentDidMount() {}

  handleMouseOver = () => {
    // console.log("handleMouseOver")
    this.setState({ styleText: '_hover' });
  };

  handleMouseOut = () => {
    // console.log("handleMouseOut")
    this.setState({ styleText: '' });
  };

  onClick = () => {
    const { data, dispatch, permissionList } = this.props;
    const { code, permissionCode } = data;
    // 权限判断写入
    if (!permissionList[permissionCode]) {
      // 如果没有权限跳转到一个弹出框上
      Permission.open(permissionCode);
      return;
    }

    dispatch({
      type: 'release/saveTaskType',
      payload: { taskType: data.code },
    });
    if (code === 'TT_5') {
      // 课后训练
      router.push(`/examination/publish/selectpaper/${code}`);
    } else {
      router.push(`/examination/publish/selectpaper/${code}`);
    }
  };

  render() {
    const { styleText } = this.state;
    const { data, opacity, permissionList } = this.props;
    const { permissionCode } = data;
    const rule = permissionList[permissionCode];
    let cardStyle = styles.card_unfocus;
    let imgUrl = data.img;
    if (styleText !== '') {
      cardStyle = `${styles.card_focus} _hover`;
      imgUrl = data.imghover;
    }
    return (
      <div style={opacity ? { opacity: 0.5 } : {}}>
        <div
          className={cardStyle}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        >
          <div className={styles.topimg}>
            <img src={imgUrl} />
          </div>
          <div className={styles[`title${styleText}`]}>{data.title}</div>
          <div className={styles[`tips${styleText}`]}>{data.tip}</div>
          <div className={styles.content}>
            <div className={styles.flex}>
              <div className={styles[`dot${styleText}`]} />
              <div className={styles[`normal${styleText}`]}>{data.content[0]}</div>
            </div>
            <div className={styles.flex}>
              <div className={styles[`dot${styleText}`]} />
              <div className={styles[`normal${styleText}`]}>{data.content[1]}</div>
            </div>
            <div className={styles.flex}>
              <div className={styles[`dot${styleText}`]} />
              <div className={styles[`normal${styleText}`]}>{data.content[2]}</div>
            </div>
          </div>
          <div className={styles.flex} style={{ marginTop: 70 }}>
            {data.isuse ? (
              <IconButton
                iconName="icon-arrow-half-right"
                className={styles[`publish${styleText}`]}
                textColor={`textColor${styleText}`}
                text="发布"
                onClick={this.onClick}
                tag={rule ? null : <img src={iconPro} alt="" />}
              />
            ) : (
              <div className={styles.disablebtn}>
                {formatMessage({
                  id: 'app.text.exam.publish.wait.in.hope',
                  defaultMessage: '敬请期待',
                })}
              </div>
            )}
          </div>
        </div>
        <div className={styles[`bottomBorder${styleText}`]} />
      </div>
    );
  }
}

export default PublishCard;
