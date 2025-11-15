from django.urls import path
from .views import RegisterView, LoginView, SignupGoogleAuthView, LoginGoogleAuthView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('google-signup/', SignupGoogleAuthView.as_view(), name='google-signup'),
    path('google-login/', LoginGoogleAuthView.as_view(), name='google-login'),
]
