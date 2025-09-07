from rest_framework import generics, permissions
from .models import DoctorProfile
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import DoctorProfileSerializer
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q


class DoctorProfileCreateView(generics.CreateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        print(f"User: {self.request.user}, Auth: {self.request.auth}")  # Debug
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
            return Response({"detail": "Doctor profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
        except DoctorProfile.DoesNotExist:
            return Response({"detail": "Doctor profile not found."}, status=status.HTTP_404_NOT_FOUND)

        if profile.user != request.user:
            raise PermissionDenied("You are not authorized to edit this profile.")

        serializer = DoctorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
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
            words = search.lower().split()  # split search by spaces
            query = Q()
            for word in words:
                query &= Q(user__first_name__icontains=word) | Q(user__last_name__icontains=word) | Q(clinic_name__icontains=word)
            queryset = queryset.filter(query)

        return queryset