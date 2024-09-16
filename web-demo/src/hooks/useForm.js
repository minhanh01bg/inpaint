import { useState } from 'react';

const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleFormDataChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const clearForm = () => {
    // setFormData(initialState);
    setFormData(initialState);
  };

  return [formData, handleFormDataChange, clearForm, setFormData];
};

export default useForm;
