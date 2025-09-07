# doctor/forms.py

from django import forms
from .models import DoctorProfile,DAYS_OF_WEEK

class DoctorProfileForm(forms.ModelForm):
    class Meta:
        model = DoctorProfile
        fields = [
            'phone_number', 'specialization', 'years_of_experience',
            'consultation_fee', 'qualifications', 'clinic_name', 'address',
            'working_days', 'start_time', 'end_time', 'appointment_duration',
            'bio', 'profile_photo'
        ]
        widgets = {
            'working_days': forms.CheckboxSelectMultiple(choices=DAYS_OF_WEEK),
            'start_time': forms.TimeInput(format='%H:%M', attrs={'type': 'time'}),
            'end_time': forms.TimeInput(format='%H:%M', attrs={'type': 'time'}),
        }
