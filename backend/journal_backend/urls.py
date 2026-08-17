"""
URL configuration for journal_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Authentication endpoints (login, register, refresh, me)
    path('api/auth/', include('authentication.urls')),
    # Journal endpoints (entries, stats, calendar lookups)
    path('api/', include('journal.urls')),
]
