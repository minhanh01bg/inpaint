import { useState, useEffect } from 'react';
import { postImages } from '../services/inpaintService';
import config from '../configs';
const useImageInpainting = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({ file: null, type: 'front' })
  const [file, setFile] = useState("");
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      // Cập nhật formData với Base64 của file
      const base64String = reader.result.replace(/^data:image\/\w+;base64,/, '');
      // console.log(base64String)
      setFile(base64String)
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return {
    file,
    handleFileChange,
  };
}

export default useImageInpainting;