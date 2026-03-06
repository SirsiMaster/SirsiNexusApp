/**
 * Signup — Pixel-perfect port of packages/sirsi-portal/signup.html
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Matches the original HTML card-centered form with same fields, styling, and behavior.
 */

import { createRoute } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'
import { useState } from 'react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/signup',
    component: SignupPage,
})

const ROLES = [
    { value: '', label: 'Select your role' },
    { value: 'developer', label: 'Developer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'architect', label: 'Solutions Architect' },
    { value: 'manager', label: 'Engineering Manager' },
    { value: 'cto', label: 'CTO' },
    { value: 'other', label: 'Other' },
]

function SignupPage() {
    usePageMeta('Sign Up | SirsiNexus', 'Create your SirsiNexus account. Start managing infrastructure with AI.')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [company, setCompany] = useState('')
    const [role, setRole] = useState('')
    const [newsletter, setNewsletter] = useState(false)
    const [beta, setBeta] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            console.log('Signup submitted:', { name, email, company, role, newsletter, beta })
            setSuccess(true)
            setLoading(false)
            setName(''); setEmail(''); setCompany(''); setRole('')
            setNewsletter(false); setBeta(false)
            setTimeout(() => setSuccess(false), 5000)
        }, 1500)
    }

    const inputClass = "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white text-sm"

    return (
        <>
            {/* Success Toast */}
            {success && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center transition-transform" style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thank you for signing up! We'll be in touch soon.
                </div>
            )}

            {/* Main Content — matches signup.html layout */}
            <main className="min-h-screen py-20" style={{ background: 'linear-gradient(135deg, #f8fafc, #eff6ff, #ecfdf5)' }}>
                <div className="max-w-md mx-auto px-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Stay Updated</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Get notified about new features, updates, and early access opportunities
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input type="text" id="name" required value={name} onChange={e => setName(e.target.value)}
                                    className={inputClass} placeholder="Enter your full name" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className={inputClass} placeholder="Enter your email address" />
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company (Optional)</label>
                                <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)}
                                    className={inputClass} placeholder="Enter your company name" />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                                <select id="role" value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" id="newsletter" checked={newsletter} onChange={e => setNewsletter(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600" />
                                <label htmlFor="newsletter" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                    I want to receive product updates and newsletters
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" id="beta" checked={beta} onChange={e => setBeta(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600" />
                                <label htmlFor="beta" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                    I'm interested in beta testing opportunities
                                </label>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50">
                                {loading ? 'Submitting...' : 'Sign Up for Updates'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Already signed up?{' '}
                                <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Access the platform</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
