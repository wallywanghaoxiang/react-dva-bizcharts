import React, { Component } from 'react';
import styles from './index.less';
import volume0 from '../../assets/VolumeIcon/volume_0.png';
import volume1 from '../../assets/VolumeIcon/volume_1.png';
import volume2 from '../../assets/VolumeIcon/volume_2.png';
import volume3 from '../../assets/VolumeIcon/volume_3.png';
import volume4 from '../../assets/VolumeIcon/volume_4.png';
import volume5 from '../../assets/VolumeIcon/volume_5.png';

class RealVolumeIcon extends Component {
    state = {
      };

      componentWillMount() {
    }


    render() {
       const { data } = this.props;
    //    console.log('volumeIcon-data:',data);
       let volumeIcon = volume0;
       if (data) {
        const { volume } = data;
        const multipleVolume = volume * 10000;
        // console.log('volume:',volume);
        // console.log('multipleVolume:',multipleVolume);
        if (multipleVolume>6000) {
            volumeIcon = volume5;
        } else if(multipleVolume>1000) {
            volumeIcon = volume4;
        }else if(multipleVolume>500) {
            volumeIcon = volume3;
        }else if(multipleVolume>100) {
            volumeIcon = volume2;
        }else if(multipleVolume>10) {
            volumeIcon = volume1;
        }else{
            volumeIcon = volume0;
        }
       }
        return (
          <div className={styles.volumeIconBox}>
            <img src={volumeIcon} alt="volumeIcon" />
          </div>
    )
    }
}

export default RealVolumeIcon