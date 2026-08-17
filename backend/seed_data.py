import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'journal_backend.settings')
django.setup()

from django.contrib.auth.models import User
from journal.models import Entry

def seed():
    print("Seeding demo gratitude data...")

    # Create Demo User 1: mindful_user
    user1, created1 = User.objects.get_or_create(
        username='mindful_user',
        defaults={'email': 'mindful@example.com'}
    )
    if created1:
        user1.set_password('MindfulPass123!')
        user1.save()
        print("Created user: mindful_user / MindfulPass123!")
    else:
        user1.set_password('MindfulPass123!')
        user1.save()
        print("Updated user: mindful_user / MindfulPass123!")

    # Create Demo User 2: second_user (to demonstrate data isolation)
    user2, created2 = User.objects.get_or_create(
        username='second_user',
        defaults={'email': 'second@example.com'}
    )
    if created2:
        user2.set_password('SecondPass123!')
        user2.save()
        print("Created user: second_user / SecondPass123!")
    else:
        user2.set_password('SecondPass123!')
        user2.save()
        print("Updated user: second_user / SecondPass123!")

    # Add Gratitude Entries for mindful_user (Creating a 4-day streak ending today)
    today = datetime.date.today()
    sample_entries_user1 = [
        {
            'date': today,
            'mood': 'grateful',
            'prompt_answered': 'What is a simple, everyday comfort you appreciated today?',
            'content': 'Enjoyed a calm morning with warm herbal tea and fifteen minutes of mindful silence before the bustle of the day began. Feeling deeply centered and present.'
        },
        {
            'date': today - datetime.timedelta(days=1),
            'mood': 'joyful',
            'prompt_answered': 'What made you genuinely smile or laugh out loud today?',
            'content': 'Had an unexpected video call with an old childhood friend. We reminisced about our school days and laughed until our stomachs hurt. Human connection is such a precious gift.'
        },
        {
            'date': today - datetime.timedelta(days=2),
            'mood': 'energized',
            'prompt_answered': 'What is a small win or accomplishment that made you feel proud?',
            'content': 'Completed a demanding project milestone ahead of schedule! My focus was sharp and the collaborative rhythm with the team felt seamless and inspiring.'
        },
        {
            'date': today - datetime.timedelta(days=3),
            'mood': 'peaceful',
            'prompt_answered': 'What is something beautiful in nature or your surroundings you noticed today?',
            'content': 'Took an evening walk right as the sun set. The golden twilight casting long shadows against the trees brought a deep sense of stillness and reverence.'
        },
        {
            'date': today - datetime.timedelta(days=6),
            'mood': 'reflective',
            'prompt_answered': 'What challenge or obstacle did you face that taught you something valuable?',
            'content': 'Ran into an unexpected bug earlier this week. Instead of feeling frustrated, taking a step back and methodically testing assumptions helped me resolve it smoothly.'
        }
    ]

    for item in sample_entries_user1:
        Entry.objects.update_or_create(
            owner=user1,
            date=item['date'],
            defaults={
                'mood': item['mood'],
                'prompt_answered': item['prompt_answered'],
                'content': item['content']
            }
        )

    # Add sample entry for second_user (independent entry)
    Entry.objects.update_or_create(
        owner=user2,
        date=today,
        defaults={
            'mood': 'hopeful',
            'prompt_answered': 'What is something you are looking forward to with hope and excitement?',
            'content': "Excited about starting a new chapter tomorrow. Fresh beginnings bring renewed energy and perspective."
        }
    )

    print("Seeding complete! You can now log in with mindful_user / MindfulPass123!")

if __name__ == '__main__':
    seed()
