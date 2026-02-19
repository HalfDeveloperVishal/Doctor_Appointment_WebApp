from django.urls import path
from .views import RegisterView, LoginView, SignupGoogleAuthView, LoginGoogleAuthView,VerifyEmailView,ForgotPasswordView,ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('google-signup/', SignupGoogleAuthView.as_view(), name='google-signup'),
    path('google-login/', LoginGoogleAuthView.as_view(), name='google-login'),
    path("verify-email/<uidb64>/<token>/", VerifyEmailView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/<uidb64>/<token>/", ResetPasswordView.as_view()),
]
