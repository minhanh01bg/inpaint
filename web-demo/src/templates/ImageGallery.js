import { useState } from 'react';
import Base64Image from './Base64Image'; // Đảm bảo đã sửa lại Base64Image
import config from '../configs';

function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleClickImage = (imageSrc) => {
    setSelectedImage(imageSrc); // Đặt ảnh được chọn
  };

  const handleCloseModal = () => {
    setSelectedImage(null); // Đóng modal
  };

  const formattedImages = images.map((path) => {
    return `data:image/png;base64,${path}`;
  });

  return (
    <>
      {images && (
        <div>
          <span className="font-bold text-lg">Results</span>
          <div className='mt-3'>
            <span>Click on the image to zoom</span>
          </div>
          <div className="mt-5 flex">
            {formattedImages.map((imageSrc, idx) => (
              <div key={idx} className="w-52 text-center mr-2" onClick={() => {
                handleClickImage(imageSrc)
                }}>
                <Base64Image base64String={imageSrc}/>
                <span>Inpainted result {idx}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal phóng đại ảnh */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="relative">
            <img src={selectedImage} alt="Zoomed" className="max-w-full max-h-full" />
            <button
              className="absolute top-0 right-0 m-4 text-white text-2xl"
              onClick={handleCloseModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;
