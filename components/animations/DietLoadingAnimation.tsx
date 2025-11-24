"use client";

import React from "react";

export const DietLoadingAnimation: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-64 h-64">
                {/* Prato */}
                <svg className="absolute inset-0" viewBox="0 0 200 200">
                    {/* Prato principal */}
                    <ellipse
                        cx="100"
                        cy="140"
                        rx="70"
                        ry="15"
                        fill="#E5E7EB"
                        className="opacity-80"
                    />
                    <ellipse
                        cx="100"
                        cy="135"
                        rx="75"
                        ry="12"
                        fill="#F3F4F6"
                    />

                    {/* Alimentos caindo - Maçã vermelha */}
                    <g className="animate-fall-1">
                        <circle cx="70" cy="0" r="12" fill="#EF4444" />
                        <rect
                            x="68"
                            y="-8"
                            width="4"
                            height="8"
                            fill="#78350F"
                            className="origin-center"
                        />
                        <ellipse
                            cx="72"
                            cy="-6"
                            rx="6"
                            ry="3"
                            fill="#15803D"
                            className="origin-center -rotate-45"
                        />
                    </g>

                    {/* Abacate verde */}
                    <g className="animate-fall-2">
                        <ellipse cx="130" cy="0" rx="10" ry="14" fill="#84CC16" />
                        <ellipse cx="130" cy="0" rx="6" ry="9" fill="#FDE047" />
                        <circle cx="130" cy="-8" r="4" fill="#78350F" />
                    </g>

                    {/* Cenoura laranja */}
                    <g className="animate-fall-3">
                        <path
                            d="M 45,0 L 40,20 L 50,20 Z"
                            fill="#F97316"
                        />
                        <rect
                            x="42"
                            y="-5"
                            width="6"
                            height="5"
                            fill="#15803D"
                        />
                    </g>

                    {/* Frango dourado */}
                    <g className="animate-fall-4">
                        <ellipse cx="155" cy="0" rx="14" ry="10" fill="#FBBF24" />
                        <ellipse cx="155" cy="0" rx="10" ry="7" fill="#F59E0B" />
                    </g>

                    {/* Brócolis verde */}
                    <g className="animate-fall-5">
                        <circle cx="100" cy="0" r="8" fill="#22C55E" />
                        <circle cx="95" cy="-3" r="6" fill="#16A34A" />
                        <circle cx="105" cy="-3" r="6" fill="#16A34A" />
                        <rect
                            x="98"
                            y="8"
                            width="4"
                            height="10"
                            fill="#15803D"
                        />
                    </g>
                </svg>
            </div>

            <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
                Preparando seu plano alimentar...
            </p>

            <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(130px) rotate(360deg);
            opacity: 0.8;
          }
        }

        .animate-fall-1 {
          animation: fall 2s ease-in-out infinite;
          animation-delay: 0s;
        }

        .animate-fall-2 {
          animation: fall 2s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .animate-fall-3 {
          animation: fall 2s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .animate-fall-4 {
          animation: fall 2s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        .animate-fall-5 {
          animation: fall 2s ease-in-out infinite;
          animation-delay: 1.6s;
        }
      `}</style>
        </div>
    );
};
