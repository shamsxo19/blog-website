import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import {Button, Input, Logo} from "./index"
import {useDispatch} from "react-redux"
import authService from "../appwrite/auth"
import {useForm} from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")

    const login = async(data) => {
        setError("")
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(authLogin({userData}));
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div className='flex items-center justify-center w-full min-h-[calc(100vh-200px)]'>
        <div className='w-full max-w-md bg-white rounded-2xl p-8 border border-slate-100 shadow-sm'>
            <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                    <Logo width="120px" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Don&apos;t have an account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-slate-800 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
            {error && <p className="text-red-600 text-sm text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit(login)}>
                <div className='space-y-4'>
                    <Input
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    {...register("email", {
                        required: true,
                        validate: {
                            matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                            "Email address must be a valid address",
                        }
                    })}
                    />
                    <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password", {
                        required: true,
                    })}
                    />
                    <Button
                    type="submit"
                    className="w-full"
                    >Sign in</Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login