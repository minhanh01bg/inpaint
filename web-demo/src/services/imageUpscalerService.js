import axios from 'axios';
import config from '../configs';
export const postImages = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/imgs_upscaler?permit_key=${config.permit_key}`;
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


export const checkImageStatus = async (imageId) => {
  try {
    const response = await axios.get(`${config.apiUrl}/imgs_upscaler/status/${imageId}?permit_key=${config.permit_key}`);
    return response.data;
  } catch (error) {
    throw new Error('Error checking image status');
  }
};