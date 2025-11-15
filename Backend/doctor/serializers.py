from rest_framework import serializers
from .models import DoctorProfile
import json
from patient.models import Booking,PatientBookingInfo

class DoctorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()

    # ✅ Use ListField instead of JSONField for working_days
    working_days = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'full_name', 'email',
            'phone_number', 'specialization', 'specialization_display',
            'years_of_experience', 'consultation_fee', 'qualifications',
            'clinic_name', 'address', 'working_days',
            'start_time', 'end_time', 'appointment_duration',
            'bio', 'profile_photo', 'profile_photo_url'
        ]
        read_only_fields = ['user', 'email', 'full_name']

    def get_profile_photo_url(self, obj):
        request = self.context.get('request')
        if obj.profile_photo and hasattr(obj.profile_photo, 'url'):
            return request.build_absolute_uri(obj.profile_photo.url)
        return None

    def validate_working_days(self, value):
        """Ensure working_days only contains valid weekdays."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Working days must be a list")
        valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        for day in value:
            if day.lower() not in valid_days:
                raise serializers.ValidationError(f"'{day}' is not a valid day")
        return [day.lower() for day in value]

    def update(self, instance, validated_data):
        # Update User's full name if provided
        user_data = validated_data.pop('user', {})
        full_name = user_data.get('get_full_name')
        if full_name:
            user = instance.user
            first_name, *last_name = full_name.split()
            user.first_name = first_name
            user.last_name = ' '.join(last_name)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
class BookingInfoSerializer(serializers.ModelSerializer):
    patient_full_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_info = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'patient_full_name', 'date', 'start_time', 'end_time', 'patient_info',"created_at"]

    def get_patient_info(self, obj):
        try:
            info = obj.patient_info  # this will now work due to related_name
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
