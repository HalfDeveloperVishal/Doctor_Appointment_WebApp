# patient/views_payment.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
import razorpay
from dotenv import load_dotenv
from datetime import datetime
import os

from ..models import Booking, PatientBookingInfo
from doctor.models import DoctorProfile

load_dotenv()

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class CreatePaymentOrderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Data needed to create booking AFTER payment verification
        doctor_id = request.data.get("doctor_id")
        date = request.data.get("date")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        full_name = request.data.get("full_name")
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")
        date_of_birth = request.data.get("date_of_birth")
        reason_to_visit = request.data.get("reason_to_visit", "")
        symptoms_or_concerns = request.data.get("symptoms_or_concerns", "")
        amount = request.data.get("amount")

        required = [doctor_id, date, start_time, end_time, full_name, phone_number, date_of_birth, amount]
        if not all(required):
            return Response({"error": "Missing required fields"}, status=400)

        # Razorpay expects amount in paise
        amount_paise = int(float(amount) * 100)

        # Create Razorpay order
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "razorpay_key": RAZORPAY_KEY_ID,
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            # Send all booking details back so frontend re-sends them to VerifyPayment
            "booking_data": {
                "doctor_id": doctor_id,
                "date": date,
                "start_time": start_time,
                "end_time": end_time,
                "full_name": full_name,
                "email": email,
                "phone_number": phone_number,
                "date_of_birth": date_of_birth,
                "reason_to_visit": reason_to_visit,
                "symptoms_or_concerns": symptoms_or_concerns
            }
        })


class VerifyPaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Razorpay details
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_signature = request.data.get("razorpay_signature")

        # Booking fields from frontend
        doctor_id = request.data.get("doctor_id")
        date = request.data.get("date")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        full_name = request.data.get("full_name")
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")
        date_of_birth = request.data.get("date_of_birth")
        reason_to_visit = request.data.get("reason_to_visit", "")
        symptoms_or_concerns = request.data.get("symptoms_or_concerns", "")

        required = [
            razorpay_payment_id, razorpay_order_id, razorpay_signature,
            doctor_id, date, start_time, end_time, full_name, phone_number, date_of_birth
        ]

        if not all(required):
            return Response({"error": "Missing required fields"}, status=400)

        # Verify signature
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment verification failed"}, status=400)

        # Convert date/time
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        start_time_obj = datetime.strptime(start_time, "%I:%M %p").time()
        end_time_obj = datetime.strptime(end_time, "%I:%M %p").time()
        dob_obj = datetime.strptime(date_of_birth, "%Y-%m-%d").date()

        # Get doctor
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        # Ensure slot was not booked in meantime
        if Booking.objects.filter(doctor=doctor, date=date_obj, start_time=start_time_obj).exists():
            return Response({"error": "Slot already booked"}, status=400)

        # CREATE BOOKING NOW (only after successful payment)
        booking = Booking.objects.create(
            doctor=doctor,
            patient=request.user,
            date=date_obj,
            start_time=start_time_obj,
            end_time=end_time_obj,
            payment_method="online",
            payment_status="success",
            payment_id=razorpay_payment_id
        )

        # Create patient info
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
            "success": True,
            "message": "Payment verified. Appointment booked.",
            "booking_id": booking.id
        })
