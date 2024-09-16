// src/services/rollCallService.js
import axios from 'axios';
import config from '../configs';
// 

export const postVideo = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/roll_call`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    const res = await axios.post(url, formData, option);
    return res;
  } catch (err) {
    // console.error('Error submitting form:', err);
    if (err.response.data.detail[0].msg !== undefined) {
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined) {
      showErrorNotification(err.response.data.detail)
    } else {
      showErrorNotification(err.message)
    }
  }
}

export const getVideo = async (video_url, showErrorNotification) =>{
  const url = `${config.apiUrl}/video_feed?file_location=${video_url}`;
  const option = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }
  try {
    const res = await axios.get(url, option);
    return res;
  } catch (err) {
    if (err.response.data.detail[0].msg !== undefined) {
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined) {
      showErrorNotification(err.response.data.detail)
    } else {
      showErrorNotification(err.message)
    }
  }
}

export const uploadDataPerson = async (formData,showErrorNotification) =>{
  const url = `${config.apiUrl}/upload`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }
  try {
    const res = await axios.post(url, formData, option);
    if (res !== undefined){
      return res.data;
    } else {
      return res;
    }
  } catch (err){
    if (err.response.data.detail[0].msg !== undefined) {
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined) {
      showErrorNotification(err.response.data.detail)
    } else {
      showErrorNotification(err.message)
    }
  }
}