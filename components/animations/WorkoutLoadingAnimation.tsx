"use client";

import React from "react";

export const WorkoutLoadingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-64 h-64">
        <svg className="absolute inset-0" viewBox="0 0 200 200">
          {/* Chão */}
          <rect
            x="0"
            y="160"
            width="200"
            height="5"
            fill="#9CA3AF"
            className="opacity-50"
          />

          {/* Bonequinho - corpo */}
          <g className="animate-lift">
            {/* Cabeça */}
            <circle cx="100" cy="70" r="12" fill="#FBBF24" />
            <circle cx="97" cy="68" r="2" fill="#1F2937" />
            <circle cx="103" cy="68" r="2" fill="#1F2937" />

            {/* Corpo */}
            <rect
              x="94"
              y="82"
              width="12"
              height="25"
              rx="3"
              fill="#3B82F6"
            />

            {/* Braços */}
            <rect
              x="78"
              y="85"
              width="16"
              height="6"
              rx="3"
              fill="#F59E0B"
              className="origin-left rotate-[-20deg]"
              style={{ transformOrigin: '94px 88px' }}
            />
            <rect
              x="106"
              y="85"
              width="16"
              height="6"
              rx="3"
              fill="#F59E0B"
              className="origin-right rotate-[20deg]"
              style={{ transformOrigin: '106px 88px' }}
            />

            {/* Pernas */}
            <rect
              x="94"
              y="107"
              width="5"
              height="20"
              rx="2"
              fill="#1F2937"
            />
            <rect
              x="101"
              y="107"
              width="5"
              height="20"
              rx="2"
              fill="#1F2937"
            />

            {/* Pés */}
            <ellipse cx="96" cy="130" rx="6" ry="3" fill="#374151" />
            <ellipse cx="103" cy="130" rx="6" ry="3" fill="#374151" />
          </g>

          {/* Barra de peso - AGORA NAS MÃOS */}
          <g className="animate-barbell">
            {/* Barra central - na altura dos braços (y=87) */}
            <rect
              x="60"
              y="87"
              width="80"
              height="4"
              rx="2"
              fill="#4B5563"
            />

            {/* Peso esquerdo */}
            <rect
              x="50"
              y="79"
              width="12"
              height="20"
              rx="2"
              fill="#DC2626"
            />
            <rect
              x="48"
              y="77"
              width="4"
              height="24"
              fill="#991B1B"
            />

            {/* Peso direito */}
            <rect
              x="138"
              y="79"
              width="12"
              height="20"
              rx="2"
              fill="#DC2626"
            />
            <rect
              x="148"
              y="77"
              width="4"
              height="24"
              fill="#991B1B"
            />
          </g>

          {/* Partículas de esforço */}
          <g className="animate-particle-1">
            <circle cx="70" cy="102" r="3" fill="#EF4444" opacity="0.6" />
          </g>
          <g className="animate-particle-2">
            <circle cx="130" cy="107" r="2" fill="#F59E0B" opacity="0.6" />
          </g>
          <g className="animate-particle-3">
            <circle cx="85" cy="97" r="2.5" fill="#EF4444" opacity="0.6" />
          </g>
        </svg>
      </div>

      <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
        Criando seu plano de treino...
      </p>

      <style jsx>{`
        @keyframes lift {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes barbell {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .animate-lift {
          animation: lift 1.5s ease-in-out infinite;
        }

        .animate-barbell {
          animation: barbell 1.5s ease-in-out infinite;
        }

        .animate-particle-1 {
          --tx: -20px;
          --ty: -20px;
          animation: particle 1.5s ease-out infinite;
          animation-delay: 0s;
        }

        .animate-particle-2 {
          --tx: 20px;
          --ty: -15px;
          animation: particle 1.5s ease-out infinite;
          animation-delay: 0.5s;
        }

        .animate-particle-3 {
          --tx: -10px;
          --ty: -25px;
          animation: particle 1.5s ease-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};
