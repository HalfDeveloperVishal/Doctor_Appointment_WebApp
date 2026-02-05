# serializers.py
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
import re

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email',  'phone_number','password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': True},
        }

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
    
    def validate_phone_number(self, value):
        if not re.match(r"^\+?\d{10,15}$", value):
            raise serializers.ValidationError("Invalid phone number format")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user
