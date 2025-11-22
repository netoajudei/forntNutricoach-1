"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BetaCTAProps {
  text?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

export default function BetaCTA({ 
  text = "Quero ser um Beta Tester", 
  className = "",
  variant = "primary"
}: BetaCTAProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
  
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 border border-transparent",
    secondary: "bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50",
    outline: "bg-transparent text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm"
  };

  return (
    <Link href="/register">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {text}
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </Link>
  );
}
