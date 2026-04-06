import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap -mx-6">
                <div className="w-full px-6 mb-8 md:mb-0 md:w-1/2 lg:w-5/12">
                    <div className="flex h-full flex-col justify-between">
                        <div className="mb-4">
                            <Logo width="120px" />
                            <p className="mt-3 text-sm text-slate-500 max-w-xs">
                                A modern blogging platform to share your stories and ideas with the world.
                            </p>
                        </div>
                        <p className="text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} PostNest. All Rights Reserved.
                        </p>
                    </div>
                </div>
                <div className="w-full px-6 mb-8 md:mb-0 md:w-1/2 lg:w-2/12">
                    <div className="h-full">
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Affiliate Program
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Press Kit
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="w-full px-6 mb-8 md:mb-0 md:w-1/2 lg:w-2/12">
                    <div className="h-full">
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Account
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Help
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Customer Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="w-full px-6 md:w-1/2 lg:w-3/12">
                    <div className="h-full">
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Legals
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link className="text-sm text-slate-600 hover:text-slate-900 transition-colors" to="/">
                                    Licensing
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer