import { useEffect, useState } from 'react'
import '../css/Dropdown.css'
import { useNotification } from '../contexts/NotificationContext';
import { createUser } from '../services/userService'
import useForm from '../hooks/useForm';
import ModalTemplate from '../templates/Modal'
export default function CreateUserModal({ title, description, str, data, setData, formConfig, initialFormState }) {
  let [isOpen, setIsOpen] = useState(false)
  const { showErrorNotification, showSuccessNotification } = useNotification();
  const [formData, handleFormDataChange, clearForm, setFormData] = useForm(initialFormState);

  function closeModal() {
    setIsOpen(false)
    // clearForm()
  }
  
  function openModal() {
    setIsOpen(true)
    setFormData({
      ...formData
    });
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle form submission
    const res = await createUser(formData, showErrorNotification, showSuccessNotification);
    if (res !== undefined) {
      setData([...data, res]);
    }
  };
  useEffect(()=>{

  },[formData])
  return (
    <>
      <div className="inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="btn btn-sm btn-primary"
        >
          {str}
        </button>
      </div>

      <ModalTemplate isOpen={isOpen} closeModal={closeModal} title={title}>
        <form 
          className="flex flex-col min-h-full justify-center" 
          onSubmit={handleSubmit}
          onChange={handleFormDataChange}
        >
          <div className="mt-2">
            <p className="text-sm">{ description }</p>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
              {formConfig.map(({name, label, type})=>(
                <div key={name} className="sm:col-span-6">
                  <label 
                    htmlFor={name}
                    className="block text-sm font-medium leading-6"
                  >
                    {label}
                  </label>
                  <div className="mt-2">
                    <input
                      type={type}
                      name={name}
                      id={name}
                      autoComplete={name}
                      className="input input-bordered w-full"
                      placeholder={label}
                      value={formData[name] || ''}
                      onChange={handleFormDataChange}
                    />
                  </div>
                </div> 
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-row-reverse">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              onClick={closeModal}
            >
              Submit
            </button>
            <button  type='button' className='btn border-base-300 bg-base-100 btn-sm mr-3' onClick={clearForm}>Clear</button>
          </div>
        </form>
      </ModalTemplate>
    </>
  )
}
