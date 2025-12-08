# patient/views.py
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime, timedelta
from doctor.models import DoctorProfile
from ..models import Booking,PatientBookingInfo
from ..serializers import BookingSerializer,PatientBookingInfoSerializer,PatientAppointmentSerializer
from doctor.serializers import DoctorProfileSerializer 
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        queryset = DoctorProfile.objects.all()
        specialization = self.request.query_params.get('specialization')
        search = self.request.query_params.get('search')

        if specialization and specialization.lower() != "all":
            queryset = queryset.filter(specialization__iexact=specialization)

        if search:
            words = search.lower().split()
            query = Q()
            for word in words:
                query &= (
                    Q(user__first_name__icontains=word) |
                    Q(user__last_name__icontains=word) |
                    Q(clinic_name__icontains=word)
                )
            queryset = queryset.filter(query)

        return queryset


class BookSlotView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, doctor_id):

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        # 2️⃣ Booking & Patient info
        date_str = request.data.get('date')
        start_time_str = request.data.get('start_time')
        end_time_str = request.data.get('end_time')
        full_name = request.data.get('full_name')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        date_of_birth = request.data.get('date_of_birth')
        reason_to_visit = request.data.get('reason_to_visit', '')
        symptoms_or_concerns = request.data.get('symptoms_or_concerns', '')
        payment_method = request.data.get('payment_method', 'counter')

        # 3️⃣ Validate fields
        required = [date_str, start_time_str, end_time_str, full_name, phone_number, date_of_birth]
        if not all(required):
            return Response({"error": "Missing required fields"}, status=400)

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            start_time_obj = datetime.strptime(start_time_str, "%I:%M %p").time()
            end_time_obj = datetime.strptime(end_time_str, "%I:%M %p").time()
            dob_obj = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date/time format"}, status=400)

        # 4️⃣ Check slot availability
        if Booking.objects.filter(doctor=doctor, patient=request.user, date=date_obj).exists():
            return Response({"error": "You already have an appointment with this doctor on this date"}, status=400)

        if Booking.objects.filter(doctor=doctor, date=date_obj, start_time=start_time_obj).exists():
            return Response({"error": "This slot is already booked"}, status=400)

        # 5️⃣ Handle counter payment → CREATE booking immediately
        if payment_method == "counter":
            booking = Booking.objects.create(
                doctor=doctor,
                patient=request.user,
                date=date_obj,
                start_time=start_time_obj,
                end_time=end_time_obj,
                payment_method="counter",
                payment_status="success"
            )

            PatientBookingInfo.objects.create(
                booking=booking,
                full_name=full_name,
                email=email,
                phone_number=phone_number,
                date_of_birth=dob_obj,
                reason_to_visit=reason_to_visit,
                symptoms_or_concerns=symptoms_or_concerns
            )

            return Response({
                "id": booking.id,
                "message": "Appointment booked successfully (Counter Payment)"
            }, status=201)

        # 6️⃣ Handle online payment → DO NOT create booking yet
        return Response({
            "doctor_id": doctor.id,
            "date": date_str,
            "start_time": start_time_str,
            "end_time": end_time_str,
            "full_name": full_name,
            "email": email,
            "phone_number": phone_number,
            "date_of_birth": date_of_birth,
            "reason_to_visit": reason_to_visit,
            "symptoms_or_concerns": symptoms_or_concerns,
            "message": "Proceed to online payment"
        }, status=200)




class DoctorAvailableSlotsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, doctor_id):
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        date_str = request.GET.get("date")
        if not date_str:
            return Response({"error": "Date is required (YYYY-MM-DD)"}, status=400)

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format, use YYYY-MM-DD"}, status=400)

        weekday = date_obj.strftime("%A").lower()
        if weekday not in doctor.working_days:
            return Response({
                "doctor": doctor.user.get_full_name(),
                "slots": [],
                "message": f"Doctor does not take appointments on {weekday.title()}."
            })

        # Generate slots
        start = datetime.combine(date_obj, doctor.start_time)
        end = datetime.combine(date_obj, doctor.end_time)
        duration = timedelta(minutes=doctor.appointment_duration)

        # Get already booked slots
        booked_slots = Booking.objects.filter(doctor=doctor, date=date_obj).values_list('start_time', flat=True)

        slots = []
        current = start
        while current + duration <= end:
            slots.append({
                "start_time": current.strftime("%I:%M %p"),
                "end_time": (current + duration).strftime("%I:%M %p"),
                "is_booked": current.time() in booked_slots
            })
            current += duration

        return Response({
            "doctor": doctor.user.get_full_name(),
            "date": date_str,
            "slots": slots
        })

class PatientAppointmentsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all bookings for the logged-in patient
        bookings = Booking.objects.filter(patient=request.user).select_related(
            'doctor', 'doctor__user', 'patient_info'
        ).order_by('-date', 'start_time')

        serializer = PatientAppointmentSerializer(bookings, many=True)
        return Response(serializer.data)
    

class RejectBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        reason = request.data.get("reason", "")
        try:
            booking = Booking.objects.get(id=booking_id)
            booking.reject(reason=reason)
            serializer = PatientAppointmentSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)
        