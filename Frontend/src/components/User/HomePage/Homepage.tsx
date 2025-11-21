import Navbar from './Navbar'
import HeroSection from './HeroSection'
import WhyChooseUs from './WhyChooseUs'
import FindSpecialists from './FindSpecialists'
import TestimonialSection from './TestimonialSection'
import Footer from './Footer'
import Chatbot from '../../Chatbot/Chatbot'

export const Homepage = () => {
  return (
    <>
    <Navbar/>
    <HeroSection/>
    <WhyChooseUs/>
    <FindSpecialists/>
    <TestimonialSection/>
    <Footer/>

    <div className="fixed bottom-5 right-5 z-50">
        <Chatbot/>
      </div>
    </>
  )
}
