from django.core.mail import send_mail
from django.conf import settings

def send_booking_confirmation_email(user, booking, patient_info):
    subject = "Appointment Confirmation"

    message = f"""
Hello {user.get_full_name()},

Your appointment has been successfully booked.

Doctor: {booking.doctor.user.get_full_name()}
Specialization: {booking.doctor.specialization}
Clinic: {booking.doctor.clinic_name}

Date: {booking.date}
Time: {booking.start_time} - {booking.end_time}

Patient Name: {patient_info.full_name}
Phone: {patient_info.phone_number}
Reason: {patient_info.reason_to_visit}

Payment Method: {booking.payment_method}
Payment Status: {booking.payment_status}

Thank you for choosing our service.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
