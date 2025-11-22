"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Header() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
        >
            <div className="bg-white/90 backdrop-blur-md text-emerald-900 rounded-full px-6 py-3 shadow-xl flex items-center gap-8 border border-emerald-100/50 max-w-3xl w-full justify-between">

                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/zapnutri_logo.png" alt="ZapNutri Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight text-emerald-950">ZapNutri</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-800">
                    <Link href="#como-funciona" className="hover:text-emerald-600 transition-colors">Como Funciona</Link>
                    <Link href="#nutricionistas" className="hover:text-emerald-600 transition-colors">Para Profissionais da Saúde</Link>
                </nav>

                {/* Action / Mobile Menu */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="hidden sm:block bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-1.5 rounded-full text-sm font-bold transition-colors"
                    >
                        Entrar
                    </Link>
                    <button className="md:hidden text-white">
                        <Menu size={24} />
                    </button>
                </div>

            </div>
        </motion.header>
    );
}
