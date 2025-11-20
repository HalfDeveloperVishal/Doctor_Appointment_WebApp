# doctor/models.py
from django.db import models

from django.db import models
from django.conf import settings

class Booking(models.Model):
    doctor = models.ForeignKey('doctor.DoctorProfile', on_delete=models.CASCADE, related_name='bookings')
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Rejection
    is_rejected = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)

    # 🔐 Payment Fields
    payment_method = models.CharField(
        max_length=20,
        choices=[("counter", "Pay at Counter"), ("online", "Pay Online")],
        default="counter"
    )
    payment_id = models.CharField(max_length=100, blank=True, null=True)  # Razorpay payment ID
    payment_status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed")],
        default="pending"
    )

    class Meta:
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        status = "Rejected" if self.is_rejected else "Accepted"
        payment = f" | Payment: {self.payment_status}" if self.payment_method else ""
        return f"{self.doctor} - {self.patient} on {self.date} at {self.start_time} ({status}){payment}"

    def reject(self, reason=None):
        """Reject the appointment with optional reason."""
        self.is_rejected = True
        self.rejection_reason = reason
        self.save()


class PatientBookingInfo(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='patient_info')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    reason_to_visit = models.TextField(blank=True, null=True)
    symptoms_or_concerns = models.TextField(blank=True, null=True)
    

    def __str__(self):
        return f"{self.full_name} info for booking {self.booking.id}"