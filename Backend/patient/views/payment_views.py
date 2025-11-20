# patient/views_payment.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
import razorpay
from ..models import Booking
from dotenv import load_dotenv
import os
load_dotenv()

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class CreatePaymentOrderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        amount = request.data.get("amount")  # Amount in rupees

        if not booking_id or not amount:
            return Response({"error": "booking_id and amount are required"}, status=400)

        try:
            booking = Booking.objects.get(id=booking_id, patient=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        # Razorpay expects amount in paise
        amount_paise = int(float(amount) * 100)

        # Create Razorpay order
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,  # Auto capture
            "notes": {
                "booking_id": str(booking.id),
                "patient": request.user.get_full_name()
            }
        })

        # Save order_id in booking for reference
        booking.payment_id = order["id"]
        booking.payment_status = "pending"
        booking.save()

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "razorpay_key": RAZORPAY_KEY_ID 
        })


class VerifyPaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([booking_id, razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            return Response({"error": "Missing payment details"}, status=400)

        try:
            booking = Booking.objects.get(id=booking_id, patient=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        # Verify signature
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
        except razorpay.errors.SignatureVerificationError:
            booking.payment_status = "failed"
            booking.save()
            return Response({"error": "Payment verification failed"}, status=400)

        # Payment successful
        booking.payment_status = "success"
        booking.payment_id = razorpay_payment_id
        booking.save()
        return Response({"success": True, "message": "Payment verified and booking confirmed"})
