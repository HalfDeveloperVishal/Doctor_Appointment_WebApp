from django.db import models
from accounts.models import CustomUser
from django.conf import settings

SPECIALIZATION_CHOICES = [
    ('cardiology', 'Cardiology'),
    ('dermatology', 'Dermatology'),
    ('neurology', 'Neurology'),
    ('orthopedics', 'Orthopedics'),
]

DAYS_OF_WEEK = [
    ('monday', 'Monday'),
    ('tuesday', 'Tuesday'),
    ('wednesday', 'Wednesday'),
    ('thursday', 'Thursday'),
    ('friday', 'Friday'),
    ('saturday', 'Saturday'),
    ('sunday', 'Sunday'),
]

class DoctorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    
    phone_number = models.CharField(max_length=20)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    years_of_experience = models.PositiveIntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    qualifications = models.TextField()
    clinic_name = models.CharField(max_length=100)
    address = models.TextField()
    working_days = models.JSONField() 
    start_time = models.TimeField()
    end_time = models.TimeField()
    appointment_duration = models.PositiveIntegerField(help_text="Duration in minutes")
    bio = models.TextField()
    profile_photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
    
    @property
    def profile_picture_url(self):
        """Return full URL for profile picture."""
        if self.profile_photo:
            return f"{settings.MEDIA_URL}{self.profile_photo}"
        return None
