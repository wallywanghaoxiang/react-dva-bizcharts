import React, { PureComponent } from 'react';
import styles from './index.less';
import side_cut_page_pic from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic.png';
import side_cut_page_pic_active from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic_active.png';
/*
    制作试卷左侧图标

 */

export default class DotTag extends PureComponent {
    constructor(props) {
        super(props);
    }

    checktype(item) {
        const { status, data, focusIndex, mainIndex, questionType } = this.props;

        let isChoose = false;

        let dataType = data.type;

        if (dataType == 'NORMAL' || dataType == 'INTRODUCTION') {
            if (
                focusIndex.mainIndex == mainIndex &&
                focusIndex.questionIndex == data.index &&
                focusIndex.subIndex == undefined
            ) {
                isChoose = true;
            }
        } else if (dataType == 'TWO_LEVEL') {
            if (
                focusIndex.mainIndex == mainIndex &&
                focusIndex.subIndex == item &&
                focusIndex.questionIndex == data.index
            ) {
                isChoose = true;
            }
            if (data.allowMultiAnswerMode == 'Y') {
                if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index) {
                    isChoose = true;
                }
            }
        } else if (dataType == 'COMPLEX') {}

        if (isChoose) {
            return 'orange-dot';
        } else {
            switch (status) {
                case 0:
                    return 'normal-dot';
                case 100:
                    return 'green-dot';
                case 200: //●有回复
                    return 'blue-dot';
                case 300: //●有误
                    return 'red-dot';
            }
        }
    }

    background(status) {
        switch (status) {
            case 0:
                return 'DotTag-orange ';
            case 100:
                return 'DotTag-green ';
            case 200: //●有回复
                return 'DotTag-blue ';
            case 300: //●有误
                return 'DotTag-red ';
        }
    }

    render() {
        const {
            title,
            onClick,
            className,
            status,
            style,
            arr,
            data,
            focusIndex,
            mainIndex,
        } = this.props;
        let width = arr.length * 24;

        return (
            <div
        className={this.background(status) + className}
        onClick={onClick}
        style={style}
        style={{ width: width + 'px' }}
      >
        {arr.map((item, index) => {
          return (
            <div
              className={'dot ' + this.checktype(item)}
              key={'dot_' + index}
              onClick={() => {
                //console.log(data)
                this.props.index.onClick(Number(item), mainIndex, data.index, data.type);
              }}
            >
              <span>{item}</span>
            </div>
          );
        })}
      </div>
        );
    }
}