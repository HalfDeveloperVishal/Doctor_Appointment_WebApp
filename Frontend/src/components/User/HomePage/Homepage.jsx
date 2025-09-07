import React from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import WhyChooseUs from './WhyChooseUs'
import FindSpecialists from './FindSpecialists'
import TestimonialSection from './TestimonialSection'
import Footer from './Footer'

export const Homepage = () => {
  return (
    <>
    <Navbar/>
    <HeroSection/>
    <WhyChooseUs/>
    <FindSpecialists/>
    <TestimonialSection/>
    <Footer/>
    </>
  )
}
