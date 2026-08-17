import datetime
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Entry


class JournalEntryTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='alice',
            password='AlicePassword123!'
        )
        self.user2 = User.objects.create_user(
            username='bob',
            password='BobPassword123!'
        )
        self.entries_url = '/api/entries/'

        # Seed an entry for Alice
        self.entry_alice = Entry.objects.create(
            owner=self.user1,
            date=datetime.date(2026, 8, 14),
            content="Grateful for morning sunlight and fresh coffee.",
            mood="grateful",
        )

        # Seed an entry for Bob
        self.entry_bob = Entry.objects.create(
            owner=self.user2,
            date=datetime.date(2026, 8, 14),
            content="Grateful for finishing the project milestone.",
            mood="joyful",
        )

    def test_unauthenticated_access_blocked(self):
        response = self.client.get(self.entries_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_scoped_querysets_isolation(self):
        """
        Ensure Alice ONLY sees Alice's entries and Bob ONLY sees Bob's entries.
        """
        # Authenticate as Alice
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.entries_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.entry_alice.id)
        self.assertEqual(response.data[0]['content'], "Grateful for morning sunlight and fresh coffee.")

        # Authenticate as Bob
        self.client.force_authenticate(user=self.user2)
        response_bob = self.client.get(self.entries_url)
        self.assertEqual(response_bob.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_bob.data), 1)
        self.assertEqual(response_bob.data[0]['id'], self.entry_bob.id)
        self.assertEqual(response_bob.data[0]['content'], "Grateful for finishing the project milestone.")

    def test_user_cannot_access_or_modify_other_users_entry(self):
        """
        Alice cannot access or modify Bob's entry by ID.
        """
        self.client.force_authenticate(user=self.user1)
        
        # Alice tries to retrieve Bob's entry
        detail_url = f"{self.entries_url}{self.entry_bob.id}/"
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Alice tries to update Bob's entry
        update_response = self.client.put(detail_url, {
            'date': '2026-08-14',
            'content': 'Hacked content',
            'mood': 'grateful'
        })
        self.assertEqual(update_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_journal_entry(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            'date': '2026-08-15',
            'content': 'Grateful for learning full-stack Django and React!',
            'mood': 'energized',
            'prompt_answered': 'What energized you today?'
        }
        response = self.client.post(self.entries_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner_username'], 'alice')
        self.assertEqual(response.data['content'], payload['content'])

        # Verify entry exists in DB with owner=alice
        entry = Entry.objects.get(id=response.data['id'])
        self.assertEqual(entry.owner, self.user1)

    def test_get_by_date(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.entries_url}by-date/2026-08-14/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.entry_alice.id)

        # Non-existent date returns 404
        not_found_resp = self.client.get(f"{self.entries_url}by-date/2020-01-01/")
        self.assertEqual(not_found_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_stats_and_streak_calculation(self):
        self.client.force_authenticate(user=self.user1)
        
        # Add consecutive days for Alice (today and yesterday)
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        Entry.objects.all().delete()  # Clear initial setup

        Entry.objects.create(owner=self.user1, date=yesterday, content="Day 1", mood="grateful")
        Entry.objects.create(owner=self.user1, date=today, content="Day 2", mood="joyful")

        response = self.client.get(f"{self.entries_url}stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_entries'], 2)
        self.assertEqual(response.data['current_streak'], 2)
        self.assertEqual(response.data['longest_streak'], 2)
        self.assertTrue(response.data['has_logged_today'])
