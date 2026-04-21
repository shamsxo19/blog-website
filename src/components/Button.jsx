import React from "react";

export default function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    ...props
}) {
    const variantClasses = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        danger: "btn-danger",
        success: "btn-success"
    };

    return (
        <button 
            className={`${variantClasses[variant] || variantClasses.primary} ${className}`} 
            type={type}
            {...props}
        >
            {children}
        </button>
    );
}
