"use client";

import React from "react";
import { DietLoadingAnimation } from "./DietLoadingAnimation";
import { WorkoutLoadingAnimation } from "./WorkoutLoadingAnimation";

interface LoadingModalProps {
    isOpen: boolean;
    type: "diet" | "workout";
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, type }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                {type === "diet" ? <DietLoadingAnimation /> : <WorkoutLoadingAnimation />}
            </div>
        </div>
    );
};
