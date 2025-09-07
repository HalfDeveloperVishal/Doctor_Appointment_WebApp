from django.contrib import admin
from .models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'specialization',
        'clinic_name',
        'phone_number',
        'years_of_experience',
        'consultation_fee',
    )
    list_filter = ('specialization', 'working_days')
    search_fields = (
        'user__first_name',
        'user__last_name',
        'clinic_name',
        'specialization',
        'phone_number',
    )
    # readonly_fields = ('profile_photo',)

    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'profile_photo', 'phone_number', 'specialization', 'years_of_experience', 'consultation_fee')
        }),
        ('Professional Info', {
            'fields': ('qualifications', 'clinic_name', 'address', 'bio')
        }),
        ('Availability', {
            'fields': ('working_days', 'start_time', 'end_time', 'appointment_duration')
        }),
    )
