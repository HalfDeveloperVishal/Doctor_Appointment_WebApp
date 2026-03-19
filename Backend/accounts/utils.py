from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import datetime, timedelta
from django.conf import settings

class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.is_verified}"

email_verification_token = EmailVerificationTokenGenerator()

# utils.py
def normalize_phone(phone):
    if not phone.startswith("+"):
        phone = "+91" + phone
    return phone