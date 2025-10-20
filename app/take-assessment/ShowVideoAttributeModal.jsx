import React from 'react';

const ShowVideoAttributeModal = ({ isVideoModalOpen, closeModal, modalVideoSrc }) => {
  return (
    <>
      {isVideoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              className="ql-video"
              frameBorder="0"
              allowFullScreen
              src={modalVideoSrc}
              title="Video"
              // className="max-w-full max-h-full"
              style={{height:"75%" , width:"75%"}}
            ></iframe>
            <button
              className="absolute top-4 right-4 text-white text-2xl"
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

export default ShowVideoAttributeModal;
