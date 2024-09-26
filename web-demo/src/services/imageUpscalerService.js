import axios from 'axios';
import config from '../configs';

export const postImages = async (formData, showErrorNotification) => {
  let url = `${config.apiUrl}/upscaler?permit_key=${config.permit_key}`;
  if (config.check_server){
    url = `${config.apiUpscaling}/run`;
  }
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization:`Bearer ${config.apiKeyRunpod}`
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


export const checkImageStatus = async (id) => {
  if (config.check_server){
    let url = `${config.apiUpscaling}/status/${id}`;
    try {
      const option = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:`Bearer ${config.apiKeyRunpod}`
        },
      };
      const response = await axios.post(url,{},option);
      return response.data;
    } catch (error) {
      throw new Error('Error checking image status');
    }
  }
  else{
    let url = `${config.apiUrl}/upscaler/status/${id}?permit_key=${config.permit_key}`
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Error checking image status');
    }
  }
};