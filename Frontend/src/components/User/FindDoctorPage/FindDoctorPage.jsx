import React from 'react'
import FindDoctorBanner from './FindDocBanner'
import Navbar from '../HomePage/Navbar'
// import DoctorFilterBar from './DoctorFilterBar'
import DoctorListing from './DoctorListing'
import Chatbot from '../../Chatbot/Chatbot'

const FindDoctorPage = () => {
  return (
    <div style={{ backgroundColor: '#F9FAFB' }}>
        <Navbar/>
        <FindDoctorBanner/>
        {/* <DoctorFilterBar/> */}
        <DoctorListing/>
        <div className="fixed bottom-5 right-5 z-50">
                <Chatbot/>
              </div>
    </div>
    
  )
}

export default FindDoctorPage