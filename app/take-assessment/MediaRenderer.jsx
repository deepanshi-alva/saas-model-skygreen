import React from "react";
import { Eye } from "lucide-react"; // Import the desired icon

const MediaRenderer = ({ description, handleImageClick, handleVideoClick }) => {
  console.log("description", description);

  // Parse the description and convert it to JSX
  const parseDescription = (description) => {
    if (!description) return null;

    // Create a temporary container to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");
    const elements = [];

    // Process media (images, iframes)
    const mediaElements = [];
    const images = doc.querySelectorAll("img");
    images.forEach((img, index) => {
      mediaElements.push(
        <div key={`img-${index}`} className="relative shadow-sm dark:border rounded p-4 col-span-2 mb-4">
          <img
            src={img.src}
            alt={img.alt || "Image"}
            style={{
              maxWidth: "100%",
              height: "auto",
              cursor: "pointer",
              display: "block",
            }}
          />
          <Eye
            onClick={() => handleImageClick(img.src, "image")}
            className="absolute top-3 right-3 flex gap-1.5 text-primary cursor-pointer"
          />
        </div>
      );
    });

    const iframes = doc.querySelectorAll("iframe");
    iframes.forEach((iframe, index) => {
      mediaElements.push(
        <div
          key={`iframe-${index}`}
          className="relative shadow-sm dark:border rounded p-4 col-span-2 mb-4"
        >
          <iframe
            src={iframe.src}
            frameBorder="0"
            allowFullScreen
            style={{
              maxWidth: "100%",
              height: "auto",
              cursor: "pointer",
              display: "block"
            }}
          ></iframe>
          <Eye
            onClick={() => handleVideoClick(iframe.src, "video")}
            className="absolute top-3 right-3 flex gap-1.5 text-primary cursor-pointer"
          />
        </div>
      );
    });

    // Return media elements for rendering inside the grid
    return mediaElements;
  };

  // Extract pure text paragraphs (<p>) and render them outside of the grid
  const extractTextContent = (description) => {
    if (!description) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");

    // Extract all paragraphs
    const paragraphs = doc.querySelectorAll("p");
    const textElements = [];

    paragraphs.forEach((p, index) => {
      textElements.push(
        <p key={`p-${index}`} className="mb-4">
          {p.textContent}
        </p>
      );
    });

    return textElements;
  };

  return (
    <>
      <div>
        {/* Render paragraphs (text) outside the grid */}
        <div className="text-container mb-6">
          {extractTextContent(description)}
        </div>

        {/* Render media inside the grid */}
        <div className="media-container relative grid grid-cols-12 mb-6 gap-6">
          {parseDescription(description)}
        </div>
      </div>
    </>
  );
};

export default MediaRenderer;
