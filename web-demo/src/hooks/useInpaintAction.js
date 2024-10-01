import { useState } from 'react';
import { inPaintImage2, checkImageInpaintStatus, checkSegmentImageStatus, segmentImage } from '../services/inpaintService';

const useInpaintAction = (showErrorNotification,showSuccessNotification) => {
    const [labels, setLabels] = useState(true);
    const [labelLs, setLabelsList] = useState([]);
    const [maskAction, setMaskAction] = useState(undefined);

    
    const onClickActionTrue = () => {
        setLabels(true);     
    }
    const onClickActionFalse = () =>{
        setLabels(false);
    }

    return {
        labels,
        labelLs,
        maskAction,
        setMaskAction,        
        setLabels,
        setLabelsList,
        onClickActionTrue,
        onClickActionFalse
    }
}

export default useInpaintAction;