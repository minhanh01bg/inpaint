// src/services/apiService.js
import axios from 'axios';
import config from '../configs';
// 
export const postImages = async (formData, showErrorNotification) => {
  let url = `${config.apiUrl}/remove_background?permit_key=${config.permit_key}`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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

export const removeBackground = async (formData, showErrorNotification) => {
  let url = `${config.apiUrl}/remove_background2?permit_key=${config.permit_key}`;
  console.log(config.check_server)
  if (config.check_server){
    url = `${config.apiRemBg}/run`;
  }
  console.log(url)
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
  let url = `${config.apiUrl}/remove_background2/status/${id}?permit_key=${config.permit_key}`;
  if (config.check_server){
    url = `${config.apiRemBg}/status/${id}`;
    console.log(url)
    try {
      const option = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:`Bearer ${config.apiKeyRunpod}`
        },
      };
      const response = await axios.post(url,{}, option);
      return response.data;
    } catch (error) {
      throw new Error('Error checking image status');
    }
  }
  else {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Error checking image status');
    }
  }
};