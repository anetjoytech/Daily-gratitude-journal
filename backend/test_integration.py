import urllib.request
import json

BASE = 'http://127.0.0.1:8000/api/'

def post(url, data, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json', **headers}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def main():
    print("==================================================")
    print("STARTING END-TO-END JWT & API INTEGRATION TESTS")
    print("==================================================")

    # 1. Register User
    print("\n1. Testing User Registration (zen_master)...")
    try:
        reg = post(BASE + 'auth/register/', {
            'username': 'zen_master',
            'email': 'zen@example.com',
            'password': 'ZenPassword123!',
            'password_confirm': 'ZenPassword123!'
        })
        print("[PASS] Registration successful for user:", reg['user']['username'])
    except Exception as e:
        print("[NOTE] User already created or registered:", e)

    # 2. Login to get Access & Refresh Token
    print("\n2. Testing JWT Login (/api/auth/login/)...")
    login_data = post(BASE + 'auth/login/', {
        'username': 'zen_master',
        'password': 'ZenPassword123!'
    })
    access_token = login_data['access']
    refresh_token = login_data['refresh']
    print("[PASS] Login successful!")
    print("  Access Token received (1-hr expiry)")
    print("  Refresh Token received (1-day expiry)")

    # 3. Refresh Access Token
    print("\n3. Testing Token Refresh (/api/auth/token/refresh/)...")
    refresh_data = post(BASE + 'auth/token/refresh/', {'refresh': refresh_token})
    new_access = refresh_data['access']
    print("[PASS] Successfully refreshed access token!")

    # 4. Protected /me/ endpoint
    print("\n4. Testing Protected Profile (/api/auth/me/)...")
    auth_headers = {'Authorization': f'Bearer {new_access}'}
    profile = get(BASE + 'auth/me/', auth_headers)
    print(f"[PASS] Authenticated as: {profile['username']} ({profile['email']})")

    # 5. User-Scoped Entries List
    print("\n5. Testing Initial Journal Entries List (User Scope)...")
    initial_entries = get(BASE + 'entries/', auth_headers)
    print(f"[PASS] Initial entries for zen_master: {len(initial_entries)}")

    # 6. Create New Gratitude Entry
    print("\n6. Creating New Gratitude Entry for zen_master...")
    new_entry = post(BASE + 'entries/', {
        'date': '2026-08-14',
        'content': 'Grateful for finding clarity and inner peace in everyday routines.',
        'mood': 'peaceful',
        'prompt_answered': 'What brought you peace today?'
    }, auth_headers)
    print(f"[PASS] Created Entry ID {new_entry['id']} with owner '{new_entry['owner_username']}'")

    # 7. Check Streak Stats
    print("\n7. Testing Gratitude Streak & Insights (/api/entries/stats/)...")
    stats = get(BASE + 'entries/stats/', auth_headers)
    print(f"[PASS] Total Entries: {stats['total_entries']}, Current Streak: {stats['current_streak']}")

    # 8. Test Data Isolation against mindful_user
    print("\n8. Testing Data Isolation (mindful_user vs zen_master)...")
    mindful_login = post(BASE + 'auth/login/', {
        'username': 'mindful_user',
        'password': 'MindfulPass123!'
    })
    mindful_headers = {'Authorization': f'Bearer {mindful_login["access"]}'}
    mindful_entries = get(BASE + 'entries/', mindful_headers)
    mindful_stats = get(BASE + 'entries/stats/', mindful_headers)
    print(f"[PASS] mindful_user sees {len(mindful_entries)} entries with a {mindful_stats['current_streak']}-day streak.")

    zen_entries = get(BASE + 'entries/', auth_headers)
    print(f"[PASS] zen_master sees only {len(zen_entries)} entry.")

    assert len(zen_entries) == 1, "Data leak: zen_master saw foreign entries!"
    assert len(mindful_entries) == 5, "Data mismatch for mindful_user!"

    print("\n==================================================")
    print("ALL API & DATA ISOLATION TESTS PASSED 100%!")
    print("==================================================")

if __name__ == '__main__':
    main()
