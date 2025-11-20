# doctor/serializers.py
from rest_framework import serializers
from .models import Booking,PatientBookingInfo

class BookingSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    is_rejected = serializers.BooleanField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'doctor', 'doctor_name',
            'patient', 'patient_name',
            'date', 'start_time', 'end_time', 'created_at',
            'is_rejected', 'rejection_reason',
            'payment_method', 'payment_status', 'payment_id'
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'doctor_name', 'patient_name',
                            'is_rejected', 'rejection_reason', 'payment_status', 'payment_id']


class PatientBookingInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientBookingInfo
        fields = [
            'id',
            'booking', 
            'full_name',
            'email',
            'phone_number',
            'date_of_birth',
            'reason_to_visit',
            'symptoms_or_concerns'
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'reason_to_visit': {'required': False, 'allow_blank': True},
            'symptoms_or_concern': {'required': False, 'allow_blank': True},
        }

class PatientAppointmentSerializer(serializers.ModelSerializer):
    # 🩺 Doctor Details
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    doctor_email = serializers.EmailField(source='doctor.user.email', read_only=True)
    clinic_name = serializers.CharField(source='doctor.clinic_name', read_only=True)
    specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    address = serializers.CharField(source='doctor.address', read_only=True)
    qualifications = serializers.CharField(source='doctor.qualifications', read_only=True)
    
    patient_info = serializers.SerializerMethodField()
    is_rejected = serializers.BooleanField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'doctor_name', 'doctor_email', 'clinic_name',
            'specialization', 'address', 'qualifications', 'date', 'start_time', 'end_time', 'created_at',
            'patient_info','is_rejected', 'rejection_reason','payment_method', 'payment_status'
        ]

    def get_patient_info(self, obj):
        try:
            info = obj.patient_info  # Uses related_name
            return {
                "full_name": info.full_name,
                "email": info.email,
                "phone_number": info.phone_number,
                "date_of_birth": info.date_of_birth,
                "reason_to_visit": info.reason_to_visit,
                "symptoms_or_concerns": info.symptoms_or_concerns,
            }
        except PatientBookingInfo.DoesNotExist:
            return None
