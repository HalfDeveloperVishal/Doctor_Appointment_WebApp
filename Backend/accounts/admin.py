# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        'email',
        'first_name',
        'last_name',
        'role',
        "is_phone_verified",
        'is_verified',   # ✅ added
        'is_staff',
        'is_superuser'
    )

    list_filter = (
        'role',
        "is_phone_verified",
        'is_verified',   # ✅ added
        'is_staff',
        'is_superuser',
        'is_active'
    )

    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ("Personal Info", {
            'fields': ('first_name', 'last_name', 'role')
        }),
        ("Verification", {  # ✅ added section
            'fields': ('is_verified', "is_phone_verified",)
        }),
        ("Permissions", {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            )
        }),
        ("Important dates", {
            'fields': ('last_login',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'first_name',
                'last_name',
                'role',
                'password1',
                'password2',
                'is_active',
                'is_staff',
                'is_superuser',
                'is_verified',
                "is_phone_verified",# ✅ added here too
            ),
        }),
    )


admin.site.register(CustomUser, CustomUserAdmin)
