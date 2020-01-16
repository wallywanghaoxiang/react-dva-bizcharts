import React, { PureComponent } from 'react';
import { Modal, Divider } from 'antd';
// import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import ExampaperPreview from './ExampaperPreview';
import { MatchUnitType } from '@/frontlib/utils/utils';
import { showTime } from '@/utils/timeHandle';
import IconPro from '../../assets/icon_pro.png';
import styles from './index.less';

const messages = defineMessages({
  paperreportPageTitle: { id: 'app.trial.preview.page.title', defaultMessage: '试卷预览' },
  schoolYear: { id: 'task.school.year', defaultMessage: '学年' },
  grade: { id: 'task.grade', defaultMessage: '适用范围' },
  time: { id: 'task.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'task.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'task.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  mark: { id: 'task.examination.inspect.paper.mark', defaultMessage: '分' },
});
/**
 *整卷试做报告
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @export
 * @class Exampaper
 * @extends {PureComponent}
 */

// @connect(({ permission }) => ({
//   defaultPermissionList: permission.defaultPermissionList,
// }))
export default class ExamPreview extends PureComponent {
  constructor(props) {
    super(props);
    this.stTime = [];
    this.spTime = [];
    this.st = '';
    this.sp = '';
    this.state = {
      paperData: '',
      showData: '',
      displayMode: '',
      show: true,
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    if (dataSource) {
      this.setState({
        paperData: dataSource.paperData,
        showData: dataSource.showData,
        displayMode: dataSource.displayMode,
      });
    }
  }

  onClose = () => {
    const { onClose } = this.props;
    this.setState({
      show: false,
    });
    onClose();
  };

  render() {
    const { paperData, showData, displayMode, show } = this.state;
    const { name, fullMark, paperTime, templateName, questionCount } = paperData;
    const {
      onSave,
      zIndex,
      dataSource: { defaultPermissionList },
    } = this.props;
    console.log(defaultPermissionList);
    const cardTitle = (
      <div className={styles['card-title']}>
        <div className={styles.name}>{name}</div>
        <div className={styles.tips}>
          <span>{formatMessage(messages.fullmark)}：</span>
          <span className={styles.black}>
            {fullMark} {formatMessage(messages.mark)}
          </span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.time)}：</span>
          <span className={styles.black}>{(paperTime && showTime(paperTime, 's')) || '--'}</span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />

          <span>
            {formatMessage({
              id: 'app.text.uexam.frontlib.exampaperpreview.titleNumber',
              defaultMessage: '题目数',
            })}
            ：
          </span>
          <span className={styles.black}>{questionCount}</span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.grade)}：</span>
          <span className={styles.black}>{MatchUnitType(paperData) || '--'}</span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.paperTemplate)}：</span>
          <span className={styles.black}>{templateName}</span>
        </div>
      </div>
    );
    return (
      <Modal
        visible={show}
        centered
        title={cardTitle}
        width="800"
        maskClosable={false}
        className="report reports"
        destroyOnClose
        onCancel={this.onClose}
        zIndex={zIndex}
        okText=""
        footer={
          onSave ? (
            <div
              className={styles.bottom_btn}
              onClick={() => {
                onSave();
              }}
            >
              {defaultPermissionList && !defaultPermissionList.V_CUSTOM_PAPER && (
                <img src={IconPro} alt="" />
              )}
              {formatMessage({ id: 'app.text.saveToMyGroup', defaultMessage: '保存到我的组卷' })}
            </div>
          ) : null
        }
      >
        <div style={{ justifyContent: 'center', display: 'flex' }}>
          <div style={{ position: 'absolute' }}>
            <div id="recorder_swf" />
          </div>
          <div>
            <ExampaperPreview
              showData={showData}
              paperData={paperData}
              displayMode={displayMode}
              defaultPermissionList={defaultPermissionList}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
