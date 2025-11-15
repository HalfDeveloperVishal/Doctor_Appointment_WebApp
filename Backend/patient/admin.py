from django.contrib import admin
from .models import Booking,PatientBookingInfo

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'patient', 'date', 'start_time', 'end_time', 'created_at')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name', 'patient__email')
    list_filter = ('doctor', 'date')
    ordering = ('-date', 'start_time')

@admin.register(PatientBookingInfo)
class PatientBookingInfoAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'booking', 'phone_number', 'email', 'date_of_birth')
    search_fields = ('full_name', 'email', 'phone_number', 'booking__doctor__user__first_name')
    list_filter = ('booking__doctor', 'date_of_birth')