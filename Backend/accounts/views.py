from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from doctor.models import DoctorProfile 
from rest_framework.permissions import AllowAny
from .models import CustomUser
from google.oauth2 import id_token
from google.auth.transport import requests

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully",
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_profile_completed": False
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)

            # Check if doctor has completed profile
            is_profile_completed = False
            if user.role == 'doctor':
                is_profile_completed = DoctorProfile.objects.filter(user=user).exists()

            response = Response({
                "message": "Login successful",
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_profile_completed": is_profile_completed,
                "user_id": user.id
            }, status=status.HTTP_200_OK)
            
            # Set secure cookies
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax'
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SignupGoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("credential")  # JWT from Google
        if not token:
            return Response({"error": "Missing Google credential"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify token with Google
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            # Check if user already exists
            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    "message": "User already exists. Please log in instead.",
                    "email": email
                }, status=status.HTTP_400_BAD_REQUEST)

            # User does not exist → create account
            user = CustomUser.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=request.data.get("role", "patient"),  # default patient
                is_active=True
            )

            # Generate JWT token for your app
            refresh = RefreshToken.for_user(user)

            # Check profile completion if doctor
            is_profile_completed = False
            if user.role == "doctor":
                is_profile_completed = DoctorProfile.objects.filter(user=user).exists()

            return Response({
                "message": "Account created successfully with Google.",
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_profile_completed": is_profile_completed,
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)

        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)


class LoginGoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("credential")  # JWT from Google
        if not token:
            return Response({"error": "Missing Google credential"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify token with Google
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]

            # Check if user exists
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    "error": "User not registered. Please sign up first."
                }, status=status.HTTP_404_NOT_FOUND)

            # Generate JWT token for the existing user
            refresh = RefreshToken.for_user(user)

            # Check if doctor profile is completed
            is_profile_completed = False
            if user.role == "doctor":
                is_profile_completed = DoctorProfile.objects.filter(user=user).exists()

            return Response({
                "message": "Login successful via Google.",
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_profile_completed": is_profile_completed,
                "user_id": user.id
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)
