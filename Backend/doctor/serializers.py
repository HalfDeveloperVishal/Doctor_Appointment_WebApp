from rest_framework import serializers
from .models import DoctorProfile

class DoctorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()

    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'full_name', 'email', 'phone_number', 'specialization','specialization_display',
            'years_of_experience', 'consultation_fee', 'qualifications',
            'clinic_name', 'address', 'working_days', 'start_time', 'end_time',
            'appointment_duration', 'bio', 'profile_photo','profile_photo_url'
        ]
        read_only_fields = ['user', 'full_name', 'email']
        
    def get_profile_photo_url(self, obj):
            request = self.context.get('request')
            if obj.profile_photo and hasattr(obj.profile_photo, 'url'):
                return request.build_absolute_uri(obj.profile_photo.url)
            return None