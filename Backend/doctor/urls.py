from django.urls import path
from .views import DoctorProfileCreateView,DoctorProfileCheckView, DoctorProfileView,BookingInfoView,AppointmentStatsView,DoctorPublicDetailView

urlpatterns = [
    path('doctor_profile_create/', DoctorProfileCreateView.as_view(), name='doctor-profile-create'),
    path('doctor_profile_check/', DoctorProfileCheckView.as_view(), name='doctor_profile_check'),
    path('doctor_profile/', DoctorProfileView.as_view(), name='doctor_profile_retrieve'),
    path('booking-info/', BookingInfoView.as_view(), name='booking-info'),
    path('appointment-stats/', AppointmentStatsView.as_view(), name='appointment-stats'),
    path('<int:id>/details/', DoctorPublicDetailView.as_view(), name='doctor-details'),
    
]
