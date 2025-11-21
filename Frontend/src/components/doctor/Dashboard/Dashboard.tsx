import WelcomeHeader from './WelcomeHeader'
import { Appointment_info_card } from './Appointment_info_card'
import  UpcomingAppointments  from './UpcomingAppointments'

function Dashboard() {
  return (
    <div className='min-h-screen p-4'>
      <WelcomeHeader/>
      <Appointment_info_card/>
      <UpcomingAppointments/>
    </div>
  )
}

export default Dashboard
