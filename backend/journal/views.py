import datetime
from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Entry
from .serializers import EntrySerializer


class EntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user gratitude entries.
    Strictly scoped to the authenticated user.
    """
    serializer_class = EntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensure users only ever access their own entries.
        Supports filtering by month/year, date, or search keywords.
        """
        user = self.request.user
        queryset = Entry.objects.filter(owner=user)

        # Filter by specific date
        date_str = self.request.query_params.get('date', None)
        if date_str:
            queryset = queryset.filter(date=date_str)

        # Filter by year and month for calendar view
        year = self.request.query_params.get('year', None)
        month = self.request.query_params.get('month', None)
        if year and month:
            queryset = queryset.filter(date__year=year, date__month=month)

        # Search in content
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) | Q(prompt_answered__icontains=search)
            )

        return queryset.order_by('-date', '-created_at')

    def perform_create(self, serializer):
        """
        Automatically bind the logged-in user as the owner.
        """
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-date/(?P<date_val>[^/.]+)')
    def get_by_date(self, request, date_val=None):
        """
        Get single gratitude entry for a specific date (YYYY-MM-DD).
        """
        try:
            entry = Entry.objects.get(owner=request.user, date=date_val)
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
        except Entry.DoesNotExist:
            return Response(
                {"detail": "No gratitude entry found for this date."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Compute gratitude statistics:
        - Total entries
        - Current consecutive streak
        - Longest streak
        - Mood counts
        """
        user = request.user
        entries = Entry.objects.filter(owner=user).values_list('date', flat=True).order_by('-date')
        entry_dates = set(entries)
        total_count = len(entry_dates)

        # Calculate current streak
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        
        current_streak = 0
        check_date = today if today in entry_dates else (yesterday if yesterday in entry_dates else None)

        if check_date:
            while check_date in entry_dates:
                current_streak += 1
                check_date -= datetime.timedelta(days=1)

        # Calculate longest streak
        sorted_dates = sorted(list(entry_dates))
        longest_streak = 0
        temp_streak = 0
        prev_date = None

        for d in sorted_dates:
            if prev_date is None:
                temp_streak = 1
            elif d == prev_date + datetime.timedelta(days=1):
                temp_streak += 1
            else:
                temp_streak = 1
            prev_date = d
            if temp_streak > longest_streak:
                longest_streak = temp_streak

        # Mood distribution
        moods = (
            Entry.objects.filter(owner=user)
            .values('mood')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            "total_entries": total_count,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "has_logged_today": today in entry_dates,
            "moods": list(moods),
        })
