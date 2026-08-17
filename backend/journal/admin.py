from django.contrib import admin
from .models import Entry


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'date', 'mood', 'created_at')
    list_filter = ('mood', 'date', 'created_at')
    search_fields = ('content', 'prompt_answered', 'owner__username')
    ordering = ('-date', '-created_at')
