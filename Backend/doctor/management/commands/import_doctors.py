import pandas as pd
from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from doctor.models import DoctorProfile

class Command(BaseCommand):
    help = "Import doctors from an Excel file and create users + profiles"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to the Excel file")

    def handle(self, *args, **kwargs):
        file_path = kwargs["file_path"]

        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Failed to read Excel file: {e}"))
            return

        for index, row in df.iterrows():
            email = row["email"]

            # Skip if doctor already exists
            if CustomUser.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(
                    f"⚠️ Doctor {email} already exists. Skipping."
                ))
                continue

            # Create user with fixed password
            user = CustomUser.objects.create_user(
                first_name=row["first_name"],
                last_name=row["last_name"],
                email=email,
                password="Vishal@2003",  # fixed password
                role="doctor",
            )

            # Parse working_days (stored as JSON string in Excel)
            working_days = row["working_days"]
            if isinstance(working_days, str):
                try:
                    working_days = eval(working_days)
                except Exception:
                    working_days = []

            # Create doctor profile
            DoctorProfile.objects.create(
                user=user,
                phone_number=row["phone_number"],
                specialization=row["specialization"],
                years_of_experience=int(row["years_of_experience"]),
                consultation_fee=float(row["consultation_fee"]),
                qualifications=row["qualifications"],
                clinic_name=row["clinic_name"],
                address=row["address"],
                working_days=working_days,
                start_time=row["start_time"],
                end_time=row["end_time"],
                appointment_duration=int(row["appointment_duration"]),
                bio=row["bio"],
            )

            self.stdout.write(self.style.SUCCESS(
                f"✅ Doctor {email} imported successfully."
            ))

        self.stdout.write(self.style.SUCCESS("🎉 Import completed successfully!"))
