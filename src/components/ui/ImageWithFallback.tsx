import React, { useState } from "react";
import ERROR_IMG_SRC from "./ErrorImage";
import UserPlaceholderIcon from "./UserPlaceholderIcon";

export default function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  // If no src provided or empty string, show placeholder
  if (!src || src.trim() === "") {
    return (
      <div className={`${className ?? ""} block`} style={style}>
        <UserPlaceholderIcon />
      </div>
    );
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
          className="w-100"
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
