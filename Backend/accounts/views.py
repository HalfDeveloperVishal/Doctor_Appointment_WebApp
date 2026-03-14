import random
from .models import PhoneOTP
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
from dotenv import load_dotenv
import os
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .utils import email_verification_token
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.utils import timezone
import threading
from datetime import timedelta
from django.contrib.auth.tokens import PasswordResetTokenGenerator

password_reset_token = PasswordResetTokenGenerator()

load_dotenv()


def send_verification_email(user, verification_link):
    """
    Sends email verification link in background thread
    """
    send_mail(
        subject="Verify your account",
        message=f"Click the link to verify your account:\n\n{verification_link}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=True,  # prevents crash if email fails
    )
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            phone_number = request.data.get("phone_number")
            if phone_number and not phone_number.startswith("+"):
                phone_number = "+91" + phone_number

            otp_verified = PhoneOTP.objects.filter(
                phone_number=phone_number,
                is_verified=True
            ).exists()

            if not otp_verified:
                return Response(
                    {"error": "Phone number not verified"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create user
            user = serializer.save()
            user.is_phone_verified = True
            user.is_active = False  # Activate only after email verify
            user.save()

            # Generate email verification link
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = email_verification_token.make_token(user)

            verification_link = (
                f"http://localhost:5173/verify-email/{uid}/{token}/"
            )

            # Send email in background thread (non-blocking)
            send_verification_email(user, verification_link)

            return Response({
                "message": "Registration successful. Please verify your email."
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
        token = request.data.get("credential")
        if not token:
            return Response({"error": "Missing Google credential"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use env variable directly
            GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    "message": "User already exists. Please log in instead.",
                    "email": email
                }, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=request.data.get("role", "patient"),
            is_active=True,
            is_verified=True  # ✅ auto verified
)


            refresh = RefreshToken.for_user(user)

            is_profile_completed = False
            if user.role == "doctor":
                is_profile_completed = DoctorProfile.objects.filter(user=user).exists()

            return Response({
                "message": "Account created successfully with Google.",
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_profile_completed": is_profile_completed,
                "user_id": user.id,
                "is_phone_verified": user.is_phone_verified,
                "phone_number": user.phone_number
            }, status=status.HTTP_201_CREATED)

        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)


class LoginGoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("credential")
        if not token:
            return Response({"error": "Missing Google credential"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]

            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({
                    "error": "User not registered. Please sign up first."
                }, status=status.HTTP_404_NOT_FOUND)

            refresh = RefreshToken.for_user(user)

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

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid link"}, status=400)

        if not email_verification_token.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        if user.is_verified:
            return Response({"message": "Account already verified."})

        user.is_verified = True
        user.is_active = True  # 🔓 activate account
        user.save()

        return Response({"message": "Email verified successfully!"})

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=404)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token.make_token(user)

        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            subject="Reset Your Password",
            message=f"Click the link to reset your password:\n{reset_link}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
        )

        return Response({"message": "Password reset email sent."}, status=200)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except:
            return Response({"error": "Invalid link"}, status=400)

        if not password_reset_token.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        new_password = request.data.get("password")

        if not new_password:
            return Response({"error": "Password is required"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successful!"})

class SendPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")

        if not phone_number:
            return Response({"error": "Phone number is required"}, status=400)

        otp = str(random.randint(100000, 999999))

        PhoneOTP.objects.create(
            phone_number=phone_number,
            otp=otp
        )

        print("OTP:", otp)

        return Response({"message": "OTP sent successfully"})
    
class VerifyPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp = request.data.get("otp")

        if CustomUser.objects.filter(phone_number=phone_number).exists():
            return Response({"error": "Phone already in use"}, status=400)

        otp_obj = PhoneOTP.objects.filter(
            phone_number=phone_number,
            otp=otp,
            is_verified=False
        ).order_by("-created_at").first()

        if not otp_obj:
            return Response({"error": "Invalid OTP"}, status=400)

        if timezone.now() > otp_obj.created_at + timedelta(minutes=5):
            return Response({"error": "OTP expired"}, status=400)

        otp_obj.is_verified = True
        otp_obj.save()

        return Response({"message": "Phone verified successfully"})