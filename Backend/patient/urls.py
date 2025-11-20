from django.urls import path
from .views.patient_views import DoctorAvailableSlotsView,DoctorListView,BookSlotView,PatientAppointmentsView,RejectBookingView
from .views.chatbot_view import MedicalChatView
from .views.payment_views import CreatePaymentOrderView,VerifyPaymentView

urlpatterns = [
    path('doctor_listing/', DoctorListView.as_view(), name='doctor_listing'),
    path('<int:doctor_id>/available_slots/', DoctorAvailableSlotsView.as_view(), name='doctor-available-slots'),
    path('<int:doctor_id>/book_slot/', BookSlotView.as_view(), name='book-slot'),
    path('patient-appointment/', PatientAppointmentsView.as_view(), name='patient-appointment'),
    path('booking/<int:booking_id>/reject/', RejectBookingView.as_view(), name='reject-booking'),
    path('chatbot/', MedicalChatView.as_view(), name='chatbot'),
    path("create_payment_order/", CreatePaymentOrderView.as_view(), name="create_payment_order"),
    path("verify_payment/", VerifyPaymentView.as_view(), name="verify_payment"),
]
