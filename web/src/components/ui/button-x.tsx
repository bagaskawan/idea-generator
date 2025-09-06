import React from "react";

/**
 * AnimatedIconButton Component
 * * A stylish, animated button that transforms its icon on hover.
 * Based on a design from Uiverse.io by ilkhoeri.
 * * @param {object} props - The props for the component.
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {string} props.className - Additional CSS classes to apply to the button.
 * @param {React.ReactNode} [props.children] - Optional children to render inside the button.
 * @returns {JSX.Element} The rendered button component.
 */
const ButtonX = ({ className = "", ...props }) => {
  return (
    <button
      className={`
        group flex items-center justify-center relative z-10 p-1.5 cursor-pointer 
        outline-none focus-visible:outline-2 focus-visible:outline-blue-500
        transition-all duration-500 ease-in-out
        ${className}
      `}
      aria-label="Animated action button"
      {...props}
    >
      <svg
        fill="currentColor"
        stroke="none"
        strokeWidth="0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="
          w-5 h-5 overflow-visible 
          transition-transform duration-350 ease-in-out group-hover:rotate-45 
          group-hover:[transition-delay:250ms]
          [&_path]:transition-transform [&_path]:duration-350 [&_path]:ease-in-out
        "
      >
        {/* Top-left path, transforms on hover */}
        <path
          className="group-hover:[transform:rotate(112.5deg)_translate(-27.2%,-80.2%)]"
          d="m3.45,8.83c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L14.71,2.08c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L3.84,8.75c-.13.05-.25.08-.38.08Z"
        ></path>
        {/* Middle path, transforms on hover */}
        <path
          className="group-hover:[transform:rotate(22.5deg)_translate(15.5%,-23%)]"
          d="m2.02,17.13c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L21.6,6.94c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L2.4,17.06c-.13.05-.25.08-.38.08Z"
        ></path>
        {/* Bottom-right path, transforms on hover */}
        <path
          className="group-hover:[transform:rotate(112.5deg)_translate(-15%,-149.5%)]"
          d="m8.91,21.99c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31l11.64-4.82c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31l-11.64,4.82c-.13.05-.25.08-.38.08Z"
        ></path>
      </svg>
    </button>
  );
};

export default ButtonX;
