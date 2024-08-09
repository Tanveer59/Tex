'use client';
import Image from "next/image";
import { useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { Formik } from 'formik';
import Basic from "@/components/form";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-24">
      <div className="z-10 max-w-5xl w-full items-center flex-col font-mono text-sm lg:flex bg-white p-4">
        <div onClick={handleClick} className="flex justify-between items-center w-full pl-4 pr-4">  
          <h1 className="text-3xl heading">Add Tex</h1>
          {!isOpen ? <FaAngleDown className="text-2xl" /> : <RxCross2 className="text-2xl" /> }
        </div>
        <div className={`${!isOpen ? 'hidden' : 'block'} w-full`}>
          <Basic />

        </div>
      </div>

    </main>
  );
}
