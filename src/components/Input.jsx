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
            className={`px-4 py-2.5 rounded-lg bg-white text-slate-800 outline-none border border-slate-200 w-full transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})

export default Input