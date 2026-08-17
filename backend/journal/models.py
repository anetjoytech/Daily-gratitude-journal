from django.db import models
from django.contrib.auth.models import User
import datetime


class Entry(models.Model):
    """
    Daily Gratitude Journal Entry model.
    Scoped strictly to the owning user.
    """
    MOOD_CHOICES = [
        ('grateful', '🙏 Grateful'),
        ('joyful', '✨ Joyful'),
        ('peaceful', '🌿 Peaceful'),
        ('energized', '⚡ Energized'),
        ('reflective', '💭 Reflective'),
        ('hopeful', '🌅 Hopeful'),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gratitude_entries',
        help_text="The user who authored this journal entry"
    )
    date = models.DateField(
        default=datetime.date.today,
        help_text="The date of the gratitude entry (YYYY-MM-DD)"
    )
    content = models.TextField(
        help_text="A paragraph expressing daily gratitude and reflection"
    )
    mood = models.CharField(
        max_length=30,
        choices=MOOD_CHOICES,
        default='grateful',
        blank=True
    )
    prompt_answered = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Optional prompt used for inspiration"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        unique_together = ('owner', 'date')
        verbose_name = 'Gratitude Entry'
        verbose_name_plural = 'Gratitude Entries'

    def __str__(self):
        return f"{self.owner.username}'s Gratitude on {self.date}"
