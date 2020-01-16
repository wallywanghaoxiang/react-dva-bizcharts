/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-globals */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-loop-func */
/* eslint-disable no-unused-vars */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/jsx-closing-tag-location */
/**
 * 试卷详情
 * @author tina
 */
import React, { PureComponent } from 'react';
// import {message} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input, message, Dropdown, Modal, Icon } from 'antd';
import noneicon from '@/assets/none_task_pic.png';
import NoData from '@/components/NoData/index';
import IconButton from '@/components/IconButton';
import { toChinesNum } from '@/frontlib/utils/utils';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/index';
import ConfirmInput from './ConfirmInput';
import Permission from '@/pages/Permission';
import styles from '../index.less';
// import emitter from '@/utils/ev';

// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

const grid = 8;

@connect(({ papergroup, permission }) => ({
  currentPaperDetail: papergroup.currentPaperDetail,
  preViewShowData: papergroup.preViewShowData,
  paperData: papergroup.paperData,
  defaultPatternData: papergroup.defaultPatternData,
  defaultPermissionList: permission,
}))
class ShopCart extends PureComponent {
  state = {
    visibleShop: true,
    showPaper: false,
    rulesList: getItems(4),
    isDragging: false,
  };

  componentDidMount() {
    // emitter.removeAllListeners('addPapergroupQuestions');
    // emitter.addListener('addPapergroupQuestions', x => {
    //   // setTimeout(() => {
    //   const ele = document.getElementById('shopcontent');
    //   ele.scrollTop = ele.scrollHeight;
    //   // }, 3000);
    // });
  }

  onChangeShop = () => {
    const { visibleShop } = this.state;

    this.setState({
      visibleShop: !visibleShop,
    });
  };

  /** 题目排序 */
  onDragEnd = result => {
    // dropped outside the list
    this.setState({ isDragging: false });
    if (!result.destination) {
      return;
    }

    const { paperQestion } = this.props;

    const newArr = [];
    for (const i in paperQestion) {
      newArr.push(paperQestion[i]);
    }
    const items = this.reorder(newArr, result.source.index, result.destination.index);
    const newArrs = items.reduce((newArrs, item) => {
      const itemObj = {};
      if (item[0].data.patternType === 'COMPLEX') {
        newArrs[item[0].id] = item;
      } else {
        newArrs[item[0].questionPatternId] = item;
      }

      return newArrs;
    }, {});

    const { dispatch } = this.props;

    dispatch({
      type: 'papergroup/savePaperQuestions',
      payload: newArrs,
    });
  };

  // a little function to help us with reordering the result
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // padding: grid * 2,
    marginBottom: grid,

    // change background colour if dragging
    // background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  getListStyle = isDraggingOver => ({
    // background: isDraggingOver ? 'lightblue' : 'lightgrey',
    // padding: grid,
    width: 190,
  });

  toChinesNums = key => {
    const { paperQestion } = this.props;
    let num = 0;
    for (const i in paperQestion) {
      num += 1;
      if (i === key) {
        break;
      }
    }
    return toChinesNum(num);
  };

  savePaperData = () => {
    const LocalData = localStorage.getItem('confirmInputScore');
    let body = {};
    if (LocalData) {
      body = JSON.parse(LocalData);
      for (const key in body) {
        if (!body[key]) {
          message.warn('请填入正确分数');
          return;
        }
      }
    }

    const { savePaperData } = this.props;
    savePaperData();
    this.setState({ showPaper: true });
  };

  renderchooseQuestion(paperQestion) {
    const { delAllPaperCart, addPaperCart, defaultPatternData } = this.props;
    const jsx = [];
    let questionNumber = 0;
    const { rulesList, isDragging } = this.state;

    for (const key in paperQestion) {
      let subQuestionNum = 1;
      jsx.push(
        <Draggable key={key} draggableId={key} index={questionNumber}>
          {(provided1, snapshot1) => (
            <div>
              <div className="border-dashed">
                {
                  <div>
                    <div
                      className="title"
                      ref={provided1.innerRef}
                      style={this.getItemStyle(provided1.draggableStyle, snapshot1.isDragging)}
                      {...provided1.draggableProps}
                    >
                      <div
                        style={{ color: '#333', fontWeight: '600', fontSize: '13px' }}
                        className={styles.question_title}
                        title={
                          (defaultPatternData[key] &&
                            (defaultPatternData[key].pattern.mainPatterns &&
                              defaultPatternData[key].pattern.mainPatterns
                                .questionPatternInstanceName)) ||
                          (defaultPatternData[key] &&
                            defaultPatternData[key].pattern.questionPatternName)
                        }
                      >
                        {`${this.toChinesNums(key)}、${(defaultPatternData[key].pattern
                          .mainPatterns &&
                          defaultPatternData[key].pattern.mainPatterns
                            .questionPatternInstanceName) ||
                          defaultPatternData[key].pattern.questionPatternName}`}{' '}
                        {/** 题型配置默认名称 */}
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div
                          onMouseDown={e => {
                            this.setState({ isDragging: true });
                          }}
                          onMouseUp={e => {
                            this.setState({ isDragging: false });
                          }}
                          title={formatMessage({
                            id: 'app.text.dragTheSorting',
                            defaultMessage: '拖动排序',
                          })}
                          className="dragTheSorting"
                        >
                          <div {...provided1.dragHandleProps}>
                            <IconButton iconName="icon-move" />
                          </div>
                        </div>
                        <i
                          className="iconfont icon-detele"
                          onClick={() => {
                            delAllPaperCart(key);
                          }}
                        />
                      </div>
                    </div>

                    {!isDragging &&
                      paperQestion[key].map((item, index) => {
                        let questionNum = index + 1;

                        let mark = 1;
                        let precision = 1;
                        if (item.data.patternType === 'COMPLEX') {
                          let groupJsx = [];
                          const { groups } = item.data;
                          groupJsx = groups.map((itemObj, index) => {
                            if (itemObj.data.patternType === 'TWO_LEVEL') {
                              let len = subQuestionNum + 1;
                              if (itemObj.data.subQuestion.length !== 0) {
                                len = subQuestionNum + itemObj.data.subQuestion.length - 1;
                              }
                              questionNum = `${subQuestionNum}~${len}`;
                              mark =
                                defaultPatternData[key].pattern.groups[index].pattern.mainPatterns
                                  .subQuestionMark * itemObj.data.subQuestion.length;
                              precision =
                                defaultPatternData[key].pattern.groups[index].pattern.mainPatterns
                                  .precision;
                              subQuestionNum = len + 1;
                            } else {
                              questionNum = index + 1;
                              mark =
                                defaultPatternData[key].pattern.groups[index].pattern.mainPatterns
                                  .questionMark;
                              precision =
                                defaultPatternData[key].pattern.groups[index].pattern.mainPatterns
                                  .precision;
                            }

                            return (
                              <div className="question complexitem">
                                <div className="question_number">{`第1-${index + 1}题`}</div>
                                <div>
                                  <ConfirmInput
                                    className="question_score"
                                    precision={precision}
                                    defaultValue={mark}
                                    item={itemObj}
                                    index={index}
                                    datakey={key}
                                    isComplex
                                  />
                                  <span>分</span>
                                </div>
                              </div>
                            );
                          });

                          return (
                            <div className="complexquestion">
                              <div>{groupJsx}</div>
                              <i
                                className="iconfont icon-detele"
                                onClick={() => {
                                  addPaperCart(item);
                                }}
                              />
                              {/* <IconButton
                                iconName="icon-detele"
                                onClick={() => {
                                  addPaperCart(item);
                                }}
                              /> */}
                            </div>
                          );
                        }

                        if (item.data.patternType === 'TWO_LEVEL') {
                          let len = subQuestionNum + 1;
                          if (item.data.subQuestion.length !== 0) {
                            len = subQuestionNum + item.data.subQuestion.length - 1;
                          }
                          questionNum = `${subQuestionNum}~${len}`;
                          if (
                            defaultPatternData[key].pattern.subQuestionPatterns &&
                            defaultPatternData[key].pattern.subQuestionPatterns[index]
                          ) {
                            mark =
                              defaultPatternData[key].pattern.subQuestionPatterns[index]
                                .subFullMark;
                          } else {
                            mark =
                              defaultPatternData[key].pattern.mainPatterns.subQuestionMark *
                              item.data.subQuestion.length;
                          }
                          precision = defaultPatternData[key].pattern.mainPatterns.precision;
                          subQuestionNum = len + 1;
                        } else if (
                          defaultPatternData[key].pattern.subQuestionPatterns &&
                          defaultPatternData[key].pattern.subQuestionPatterns[index]
                        ) {
                          mark =
                            defaultPatternData[key].pattern.subQuestionPatterns[index].questionMark;
                          precision = defaultPatternData[key].pattern.mainPatterns.precision;
                        } else {
                          mark = defaultPatternData[key].pattern.mainPatterns.questionMark;
                          precision = defaultPatternData[key].pattern.mainPatterns.precision;
                        }

                        return (
                          <div className="question">
                            <div className="normal">
                              <div className="question_number">{`第${questionNum}题`}</div>
                              <div>
                                <ConfirmInput
                                  className="question_score"
                                  defaultValue={mark}
                                  item={item}
                                  precision={precision}
                                  index={index}
                                  datakey={key}
                                />
                                <span>分</span>
                              </div>
                            </div>
                            <i
                              className="iconfont icon-detele"
                              onClick={() => {
                                addPaperCart(item);
                              }}
                            />
                            {/* <IconButton
                              iconName="icon-detele"
                              onClick={() => {
                                addPaperCart(item);
                              }}
                            /> */}
                          </div>
                        );
                      })}
                  </div>
                }
              </div>
              {provided1.placeholder}
            </div>
          )}
        </Draggable>
      );

      questionNumber += 1;
    }
    return (
      <div className="shopcontent" id="shopcontent">
        <DragDropContext
          onDragEnd={this.onDragEnd}
          // onDragStart={(e, m) => {
          //   this.setState({ isDragging: true });
          // }}
          onMouseDown={(e, m) => {
            this.setState({ isDragging: true });
          }}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={this.getListStyle(snapshot.isDraggingOver)}
                {...provided.droppableProps}
              >
                {jsx}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }

  render() {
    const { visibleShop, showPaper } = this.state;
    localStorage.removeItem('confirmInputScore');
    const {
      paperQestion,
      questionIds,
      delAllPaperCart,
      paperData,
      preViewShowData,
      savemyPaperdata,
      showStyle,
      defaultPermissionList,
    } = this.props;
    const arr = Object.keys(paperQestion);

    if (visibleShop) {
      return (
        <div className="shoppaperDrawer" style={showStyle}>
          <div className="lefttop">
            <div style={{ color: '#333', fontWeight: '600' }}>
              {formatMessage({ id: 'app.text.myPaperBasket', defaultMessage: '我的试题篮' })}
            </div>

            <div
              className="clear_text"
              onClick={() => {
                delAllPaperCart();
              }}
            >
              {formatMessage({ id: 'app.text.classManage.clearAll', defaultMessage: '清空' })}
            </div>
          </div>
          {arr.length !== 0 ? (
            this.renderchooseQuestion(paperQestion)
          ) : (
            <NoData
              noneIcon={noneicon}
              tip={`${formatMessage({
                id: 'app.text.haventAddTryOh',
                defaultMessage: '还未添加试题哦',
              })}~`}
            />
          )}

          {arr.length !== 0 && (
            <div className="shop_footer">
              <span>
                {formatMessage({
                  id: 'app.text.hasSelectedTopicQuantity',
                  defaultMessage: '已选题量',
                })}
                :
              </span>
              <span>{questionIds.length}</span>
              <span>
                {formatMessage({ id: 'app.menu.papermanage.paperItem', defaultMessage: '题' })}
              </span>
              <div className="btn" onClick={this.savePaperData}>
                {formatMessage({ id: 'app.menu.papermanage.view', defaultMessage: '预览' })}
              </div>
            </div>
          )}
          <div className="tag" onClick={this.onChangeShop}>
            <div>
              <div>
                <i className="iconfont icon-link-arrow" />
              </div>
              <div className="text">
                {formatMessage({
                  id: 'app.examination.inspect.task.detail.check.btn.title1',
                  defaultMessage: '收起',
                })}
              </div>
            </div>
          </div>

          {showPaper && (
            <ExampaperPreview
              dataSource={{
                showData: preViewShowData,
                defaultPermissionList,
                paperData,
                displayMode: 'campus-resource',
              }}
              zIndex={99}
              onClose={() => {
                this.setState({
                  showPaper: false,
                });
              }}
              onSave={() => {
                if (defaultPermissionList && !defaultPermissionList.V_CUSTOM_PAPER) {
                  // console.log('弹窗');
                  Permission.open('V_CUSTOM_PAPER');
                } else {
                  savemyPaperdata();
                }
              }}
            />
          )}
        </div>
      );
    }
    return (
      <div className="shoppaperDraweropen" style={showStyle}>
        <div className="tag" onClick={this.onChangeShop}>
          <div>
            {questionIds.length !== 0 && <div className="dots">{questionIds.length}</div>}
            <div>
              <i className="iconfont icon-link-arrow-left" />
            </div>
            <div className="text">
              {formatMessage({ id: 'app.text.paperBasket', defaultMessage: '试题篮' })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ShopCart;
