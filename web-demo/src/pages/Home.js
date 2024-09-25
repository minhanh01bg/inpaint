import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageUpload from '../hooks/useImageUpload';
import { useNotification } from '../contexts/NotificationContext';
import { useState } from 'react'
import config from '../configs';
import Base64Image from '../templates/Base64Image';
function Home() {
  const { showErrorNotification, showSuccessNotification } = useNotification();
  let [isOpen, setIsOpen] = useState(false)

  const {
    file,
    mask,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData
  } = useImageUpload(showErrorNotification, showSuccessNotification);

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Home' />
      <div className='p-5 max-w-xl mx-auto'>
        <form onSubmit={handleSubmit}>
          <input
              type="file"
              className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />
          
          <button
              type="submit"
              className="btn btn-primary btn-sm">
              Submit
          </button>
          <button  type='button' className='btn border-base-300 bg-base-100 btn-sm mr-3' onClick={clearForm}>Clear</button>
        </form>
        {file && (
          // <div className='mt-5'>
          //   <p>Image preview:</p>
          //   <img
          //     src={config.apiMedia + '/' + file}
          //     alt="Selected preview"
          //     className="w-48 h-48 object-contain border border-gray-300"
          //   />
          // </div>
          <div className="diff aspect-[16/10] mt-5 border-2 rounded-box max-w-xl">
            <div className="diff-item-1">
              {/* <img
                alt="daisy"
                src={config.apiMedia + '/' + mask +'?permit_key='+config.permit_key} /> */}
                <Base64Image base64String={mask}/>
            </div>
            <div className="diff-item-2">
                {/* <img alt="daisy" src={config.apiMedia + '/' + file +'?permit_key='+config.permit_key} /> */}
                <Base64Image base64String={file}/>
            </div>
            <div className="diff-resizer"></div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home;