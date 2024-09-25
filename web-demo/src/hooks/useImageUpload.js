import { useState, useEffect } from 'react';
import { postImages, getResult } from '../services/imagesService';
import config from '../configs';
const useImageUpload = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({
    input:{
      source:"",
      input_type:"",
    }
   })
  const [file, setFile] = useState("");
  const [mask, setMask] = useState("");
  
  // const handleFileChange = (event) => {
  //   setFormData({ ...formData, file: event.target.files[0] });
  // };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      // Cập nhật formData với Base64 của file
      setFormData({ 
        ...formData, 
        input: {
          source: reader.result,
          input_type: 'base64'
        }
      });
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle form submission
    console.log(formData)
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      setFile(`data:image/png;base64,${res.image}`);
      setMask(`data:image/png;base64,${res.result_base64}`)
    }
  };

  return {
    file,
    mask,
    formData,
    handleFileChange,
    handleSubmit,
    setFormData
  };
}

export default useImageUpload;