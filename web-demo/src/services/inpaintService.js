// src/services/apiService.js
import axios from 'axios';
import config from '../configs';
// 
export const postImages = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/inpainting?permit_key=${config.permit_key}`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      
    },
  };
  try {
    const res = await axios.post(url, formData, option);
    return res.data;
  } catch (err) {
    // console.error('Error submitting form:', err);
    if (err.response.data.detail[0].msg !== undefined){
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined){
        showErrorNotification(err.response.data.detail)
    } else {
        showErrorNotification(err.message)
    }
  }
};



export const inPaintImage = async (formData, showErrorNotification, showSuccessNotification) =>{
    const url = `${config.apiUrl}/remove_anything?permit_key=${config.permit_key}`;
    const option = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
           'Content-Type': 'application/json',
        },
    };
    try {
        const res = await axios.post(url,formData,option);
        showSuccessNotification('Inpaint successfully');
        return res.data;
    } catch (err) {
        if (err.response.data.detail[0].msg !== undefined){
            showErrorNotification(err.response.data.detail[0].msg)
        } else if (err.response.data.detail !== undefined){
            showErrorNotification(err.response.data.detail)
        } else {
            showErrorNotification(err.message)
        }
    }
}

export const inPaintImage2 = async (formData, showErrorNotification, showSuccessNotification) =>{
  const url = `${config.apiUrl}/remove_anything2?permit_key=${config.permit_key}`;
  const option = {
      method: 'POST',
      headers: {
          Accept: 'application/json',
         'Content-Type': 'application/json',
      },
  };
  try {
    const res = await axios.post(url,formData,option);
    showSuccessNotification('Inpaint successfully');
    return res.data;
  } catch (err) {
    if (err.response.data.detail[0].msg !== undefined){
        showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined){
        showErrorNotification(err.response.data.detail)
    } else {
        showErrorNotification(err.message)
    }
  }
}
export const checkImageInpaintStatus = async (imageId) => {
  try {
    const response = await axios.get(`${config.apiUrl}/remove_anything2/status/${imageId}?permit_key=${config.permit_key}`);
    return response.data;
  } catch (error) {
    throw new Error('Error checking image status');
  }
};