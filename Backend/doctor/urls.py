from django.urls import path
from .views import DoctorProfileCreateView,DoctorProfileCheckView, DoctorProfileView, DoctorListView

urlpatterns = [
    path('doctor_profile_create/', DoctorProfileCreateView.as_view(), name='doctor-profile-create'),
    path('doctor_profile_check/', DoctorProfileCheckView.as_view(), name='doctor_profile_check'),
    path('doctor_profile/', DoctorProfileView.as_view(), name='doctor_profile_retrieve'),
    path('doctor_listing/', DoctorListView.as_view(), name='doctor_listing'),
]
