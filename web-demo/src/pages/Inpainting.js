import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageInpainting from '../hooks/useImageInpainting';
import { useNotification } from '../contexts/NotificationContext';
import { useState } from 'react'
import config from '../configs';
import Inpaint from '../components/Inpaint'
function Inpainting() {
  const { showErrorNotification, showSuccessNotification } = useNotification();
  let [isOpen, setIsOpen] = useState(false)

  const {
    file,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData
  } = useImageInpainting(showErrorNotification, showSuccessNotification);

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Inpainting' />
      <div className='p-5'>
        <form onSubmit={handleSubmit}>
          <input
              type="file"
              className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />
          
          <button
              type="submit"
              className="btn btn-primary btn-sm">
              Submit
          </button>
          {/* <button  type='button' className='btn border-base-300 bg-base-100 btn-sm mr-3' onClick={clearForm}>Clear</button> */}
        </form>
        
        
        {file && (
            <Inpaint imageUrl={config.apiMedia + '/' + file} />
        )}
      </div>
    </>
  )
}

export default Inpainting;