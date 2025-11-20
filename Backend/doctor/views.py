from rest_framework import generics, permissions
from .models import DoctorProfile
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import DoctorProfileSerializer
from patient.serializers import PatientAppointmentSerializer
from rest_framework.exceptions import PermissionDenied
from patient.models import Booking
from datetime import date
import logging

logger = logging.getLogger(__name__)


class DoctorProfileCreateView(generics.CreateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        if DoctorProfile.objects.filter(user=request.user).exists():
            return Response(
                {"detail": "Doctor profile already exists. Use PUT to update."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        if self.request.user.role != 'doctor':
            raise PermissionDenied("Only doctors can create a profile.")
        serializer.save(user=self.request.user)


class DoctorProfileCheckView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        profile_exists = DoctorProfile.objects.filter(user=request.user).exists()
        return Response({
            "has_profile": profile_exists
        }, status=status.HTTP_200_OK)


class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if profile.user != request.user:
            raise PermissionDenied("You are not authorized to edit this profile.")

        serializer = DoctorProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingInfoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # ✅ FIXED: Use correct related_name
            doctor_profile = request.user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prefetch patient_info to ensure each booking has its related info
        bookings = Booking.objects.filter(
            doctor=doctor_profile
        ).select_related('patient_info').order_by('-date', 'start_time')
        
        serializer = PatientAppointmentSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AppointmentStatsView(APIView): #this voew gives the ocunt of appointments
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            doctor_profile = request.user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=404
            )

        # Calculate stats
        bookings = Booking.objects.filter(doctor=doctor_profile)
        total_appointments = bookings.count()
        upcoming_appointments = bookings.filter(date__gt=date.today()).count()

        # Example: hardcoded for now
        total_patients_seen = 0  
        average_rating = 4.8  

        response_data = {
            "total_appointments": total_appointments,
            "upcoming_appointments": upcoming_appointments,
            "total_patients_seen": total_patients_seen,
            "average_rating": average_rating
        }

        return Response(response_data, status=200)

class DoctorPublicDetailView(APIView):
    permission_classes = [permissions.AllowAny]  

    def get(self, request, id):
        try:
            doctor = DoctorProfile.objects.get(id=id)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        serializer = DoctorProfileSerializer(doctor, context={'request': request})
        return Response(serializer.data, status=200)
