import { useState, useEffect } from 'react';
import { postImages, getResult } from '../services/imagesService';
import config from '../configs';
const useImageUpload = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({ file: null, type: 'front' })
  const [file, setFile] = useState("");
  const [mask, setMask] = useState("");
  
  const handleFileChange = (event) => {
    setFormData({ ...formData, file: event.target.files[0] });
  };

 

  const clearForm = () => {
    setFormData({
      file: null,
      type: 'front',
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle form submission
    // showErrorNotification('process is running');
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      
      setFile(res.image);
      setMask(res.remove)
    }
  };

  return {
    file,
    mask,
    formData,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData
  };
}

export default useImageUpload;