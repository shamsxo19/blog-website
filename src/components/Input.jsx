import React, {useId} from 'react'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label 
            className='inline-block mb-1.5 pl-0.5 text-sm font-medium text-slate-700' 
            htmlFor={id}>
                {label}
            </label>
            }
            <input
            type={type}
            className={`input-field ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})

export default Input