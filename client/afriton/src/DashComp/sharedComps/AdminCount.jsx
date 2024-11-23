import React from 'react'
import { Bell, Settings, Map, Users, PieChart, Building2, UserRound, ClipboardList, ArrowRight, Send, CreditCard, Shield, Wallet, Heart, Brain, Scissors, Menu, X, LogOut, User, Mail, ChevronDown } from 'lucide-react';

export const AdminCount = () => {

    const data = [
        {
            icon: Send,
            label: 'Cross Border Payments',
            value: '2,580 transfers',
            iconColor: 'text-blue-500',
        },
        {
            icon: CreditCard,
            label: 'Banking Services',
            value: '$5.3M in transactions',
            iconColor: 'text-green-500',
        },
        {
            icon: PieChart,
            label: 'Money Flow Control',
            value: '12% budget growth',
            iconColor: 'text-red-500',
        },
        {
            icon: Shield,
            label: 'Multi-Channel Access',
            value: '35K active users',
            iconColor: 'text-purple-500',
        },
        {
            icon: ClipboardList,
            label: 'Payments & Shopping',
            value: '$1.2M spent',
            iconColor: 'text-amber-500',
        },
        {
            icon: Wallet,
            label: 'Financial Growth',
            value: '450 loans approved',
            iconColor: 'text-indigo-500',
        },
        {
            icon: Building2,
            label: 'Business Solutions',
            value: '$3.5M salaries processed',
            iconColor: 'text-teal-500',
        },
        {
            icon: Users,
            label: 'Family & Savings',
            value: '3.8K sub-accounts',
            iconColor: 'text-pink-500',
        },
    ];
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
                {data.map(({ icon: Icon, label, value, iconColor }) => (
                    <div key={label}
                        className="bg-white dark:bg-[#0c0a1f] p-6 cursor-pointer rounded-xl  hover:shadow-xl transition-shadow duration-200 transform hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-full shadow-md ${iconColor}`}>
                                <Icon className="text-lg" size={28} />
                            </div>
                            <div>
                                <div className="text-gray-800 dark:text-slate-300">{value}</div>
                                <div className="text-xs text-gray-700 dark:text-slate-200">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
