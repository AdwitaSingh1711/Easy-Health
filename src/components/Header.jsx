

import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#E6F7FF] rounded-lg px-6 md:px-10 lg:px-20 py-10 md:py-16">
      
      {/* --------- Header Left --------- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-6">
        {/* Logo / Title */}
        

        {/* Main Heading */}
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-snug">
          Book Appointments <br/>
          <span className="text-[#0053b3]">With Trusted Doctors</span>
        </p>
       


        {/* Sub Text */}
        <p className="text-gray-600 text-base">
          Browse our verified list of healthcare professionals <br className="hidden sm:block" /> 
          and book your appointment with ease.
        </p>

        {/* Trusted Users */}
        <div className="flex items-center gap-3">
          <img className='w-28' src={assets.group_profiles} alt="" />
          <p className="text-gray-600 text-sm">Trusted by 10,000+ patients</p>
        </div>

        {/* CTA Button */}
        <a
          href="/doctors"
          className="flex items-center justify-center gap-2 bg-[#1a85ff] px-8 py-3 rounded-lg text-white text-base font-medium shadow-md hover:scale-105 transition-all duration-300"
        >
          Book Appointment →
        </a>
      </div>

      {/* --------- Header Right --------- */}
      <div className="md:w-1/2 flex justify-center mt-10 md:mt-0 relative">
        <img
          className="w-full max-w-md h-full"
          src={assets.header_img}
          alt="Doctors"
        />
      </div>
    </div>
  );
};

export default Header;