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
from google.auth.transport.requests import Request
from twilio.rest import Client
import requests
from dotenv import load_dotenv
import os
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .utils import email_verification_token, normalize_phone
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

            phone_number = normalize_phone(request.data.get("phone_number"))

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
            
            if not GOOGLE_CLIENT_ID:
                return Response(
                    {"error": "Google Client ID not configured"},
                    status=500
                )

            idinfo = id_token.verify_oauth2_token(
                token, Request(), GOOGLE_CLIENT_ID
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
                token, Request(), GOOGLE_CLIENT_ID
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

# class SendPhoneOTPView(APIView): in these we genrated otp and it gets sended to number by the twilio
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = normalize_phone(request.data.get("phone_number"))

#         if not phone_number:
#             return Response({"error": "Phone number is required"}, status=400)

#         otp = str(random.randint(100000, 999999))

#         # ✅ DELETE old OTPs (important)
#         PhoneOTP.objects.filter(phone_number=phone_number).delete()

#         # Save new OTP
#         PhoneOTP.objects.create(
#             phone_number=phone_number,
#             otp=otp
#         )

#         try:
#             client = Client(
#                 os.environ.get("TWILIO_ACCOUNT_SID"),
#                 os.environ.get("TWILIO_AUTH_TOKEN")
#             )

#             client.messages.create(
#                 body=f"Your OTP is {otp}",
#                 from_=os.environ.get("TWILIO_PHONE_NUMBER"),
#                 to=phone_number
#             )

#             return Response({"message": "OTP sent successfully"})

#         except Exception as e:
#             print("Twilio Error:", str(e))
#             return Response({"error": "Failed to send OTP"}, status=500)

class SendPhoneOTPView(APIView): # in these we use twilio which send the otp on it own
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = normalize_phone(request.data.get("phone_number"))

        if not phone_number:
            return Response({"error": "Phone number is required"}, status=400)
        try:
            client = Client(
                os.environ.get("TWILIO_ACCOUNT_SID"),
                os.environ.get("TWILIO_AUTH_TOKEN")
            )

            verification = client.verify.services(
                
                os.environ.get("TWILIO_VERIFY_SERVICE_SID")
            ).verifications.create(
                to=phone_number,
                channel="sms"
            )

            return Response({"message": "OTP sent successfully"})

        except Exception as e:
            print("Twilio Verify Error:", str(e))
            return Response({"error": "Failed to send OTP"}, status=500)

    
# class VerifyPhoneOTPView(APIView): in these we verify the otp which is gnerated and saved in db 
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = normalize_phone(request.data.get("phone_number"))
#         otp = request.data.get("otp")
#         user_id = request.data.get("user_id")   # ✅ add this

#         otp_obj = PhoneOTP.objects.filter(
#             phone_number=phone_number,
#             otp=otp
#         ).first()

#         if not otp_obj:
#             return Response({"error": "Invalid OTP"}, status=400)

#         # Expiry check
#         if timezone.now() > otp_obj.created_at + timedelta(minutes=5):
#             otp_obj.delete()
#             return Response({"error": "OTP expired"}, status=400)

#         otp_obj.is_verified = True
#         otp_obj.save()

#         # ✅ IMPORTANT FIX
#         if user_id:
#             try:
#                 user = CustomUser.objects.get(id=user_id)
#                 user.phone_number = phone_number   # ✅ save phone
#                 user.is_phone_verified = True
#                 user.save()
#             except CustomUser.DoesNotExist:
#                 return Response({"error": "User not found"}, status=404)

#         return Response({"message": "Phone verified successfully"})

class VerifyPhoneOTPView(APIView): #in this we use twilio nly for verifying otp
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = normalize_phone(request.data.get("phone_number"))
        otp = request.data.get("otp")
        user_id = request.data.get("user_id")

        if not phone_number or not otp:
            return Response({"error": "Phone number and OTP required"}, status=400)

        try:
            client = Client(
                os.environ.get("TWILIO_ACCOUNT_SID"),
                os.environ.get("TWILIO_AUTH_TOKEN")
            )

            verification_check = client.verify.services(
                os.environ.get("TWILIO_VERIFY_SERVICE_SID")
            ).verification_checks.create(
                to=phone_number,
                code=otp
            )

            if verification_check.status != "approved":
                return Response({"error": "Invalid OTP"}, status=400)

            # ✅ Mark user verified
            if user_id:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    user.phone_number = phone_number
                    user.is_phone_verified = True
                    user.save()
                except CustomUser.DoesNotExist:
                    return Response({"error": "User not found"}, status=404)

            return Response({"message": "Phone verified successfully"})

        except Exception as e:
            print("Twilio Verify Error:", str(e))
            return Response({"error": "Verification failed"}, status=500)