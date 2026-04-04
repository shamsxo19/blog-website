import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-slate-800",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button 
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out hover:opacity-90 active:scale-[0.98] ${bgColor} ${textColor} ${className}`} 
            type={type}
            {...props}
        >
            {children}
        </button>
    );
}
