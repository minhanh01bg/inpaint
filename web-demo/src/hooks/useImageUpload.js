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
      const arrayBuffer = reader.result;  // This is the binary data
      const binaryData = new Uint8Array(arrayBuffer);  // Convert ArrayBuffer to Uint8Array
  
      // Update formData with binary data
      setFormData({ 
        ...formData, 
        input: {
          source: binaryData,  // Send binary data as Uint8Array
          input_type: 'base64'  // Indicate that it's binary data
        }
      });
    };
  
    if (file) {
      reader.readAsArrayBuffer(file);  // Read file as binary data
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