import React from 'react'
import FindDoctorBanner from './FindDocBanner'
import Navbar from '../HomePage/Navbar'
// import DoctorFilterBar from './DoctorFilterBar'
import DoctorListing from './DoctorListing'

const FindDoctorPage = () => {
  return (
    <div style={{ backgroundColor: '#F9FAFB' }}>
        <Navbar/>
        <FindDoctorBanner/>
        {/* <DoctorFilterBar/> */}
        <DoctorListing/>
    </div>
  )
}

export default FindDoctorPage