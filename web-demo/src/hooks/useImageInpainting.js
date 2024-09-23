import { useState, useEffect } from 'react';
import { postImages } from '../services/inpaintService';
import config from '../configs';
const useImageInpainting = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({ file: null, type: 'front' })
  const [file, setFile] = useState("");
  
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
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      setFile(res.image_path);
      console.log(res.image_path)
    }
  };

  return {
    file,
    formData,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData
  };
}

export default useImageInpainting;