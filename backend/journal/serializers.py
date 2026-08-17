from rest_framework import serializers
from .models import Entry


class EntrySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Entry
        fields = (
            'id',
            'date',
            'content',
            'mood',
            'prompt_answered',
            'owner',
            'owner_username',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Gratitude entry content cannot be empty.")
        return value.strip()
