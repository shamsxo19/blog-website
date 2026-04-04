import React, {useId} from 'react'

function Select({
    options,
    label,
    className = "",
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='w-full'>
        {label && <label htmlFor={id} className='inline-block mb-1.5 pl-0.5 text-sm font-medium text-slate-700'>{label}</label>}
        <select
        {...props}
        id={id}
        ref={ref}
        className={`px-4 py-2.5 rounded-lg bg-white text-slate-800 outline-none border border-slate-200 w-full transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${className}`}
        >
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
  )
}

export default React.forwardRef(Select)