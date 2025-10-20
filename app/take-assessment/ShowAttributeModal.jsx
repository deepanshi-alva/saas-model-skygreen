import React from 'react';

const ShowAttributeModal = ({ isModalOpen, closeModal, imageSrc }) => {
  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={imageSrc} alt="Full Size" className="max-w-full max-h-full" />
            <button
              className="absolute top-4 right-4 text-white text-2xl 111"
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowAttributeModal;
