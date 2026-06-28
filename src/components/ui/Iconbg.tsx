import React, { ReactElement } from 'react';
interface IIconbg{
    className?:string;
    icon?: ReactElement;
}

const Iconbg: React.FC<IIconbg> = ({ className, icon }) => {
    return (
        <div className={`${className ?? ''} relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-400 to-yellow-300 text-white shadow-2xl overflow-hidden`}>
            <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-yellow-300/70 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-white/80 shadow-sm" />
            <div className="absolute inset-0 rounded-full border border-white/20" />
            <span className="relative z-10 text-2xl">{icon}</span>
        </div>
    );
};

export default Iconbg;