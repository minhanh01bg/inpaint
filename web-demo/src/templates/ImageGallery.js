import { useState } from 'react';

function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null); // Quản lý ảnh được chọn

  const handleClickImage = (imageSrc) => {
    setSelectedImage(imageSrc); // Đặt ảnh được chọn
  };

  const handleCloseModal = () => {
    setSelectedImage(null); // Đóng modal bằng cách đặt lại ảnh được chọn thành null
  };

  return (
    <>
      {images && (
        <div>
          <span className="font-bold text-lg">Results</span>
          <div className="mt-5 flex">
            {images.map((imageSrc, idx) => (
              <div key={idx} className="w-52 text-center ml-3">
                <img
                  src={imageSrc}
                  alt={`Image ${idx + 1}`}
                  onClick={() => handleClickImage(imageSrc)} // Xử lý sự kiện bấm vào ảnh
                  className="cursor-pointer"
                />
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
          onClick={handleCloseModal} // Đóng modal khi bấm ra ngoài
        >
          <div className="relative">
            <img src={selectedImage} alt="Zoomed" className="max-w-full max-h-full" />
            <button
              className="absolute top-0 right-0 m-4 text-white text-2xl"
              onClick={handleCloseModal} // Đóng modal khi bấm nút
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
