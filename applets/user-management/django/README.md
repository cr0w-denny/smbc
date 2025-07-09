# @smbc/user-management-django

```bash
pip install smbc-user-management
```

## Quick Start

Add to your Django settings:

```python
INSTALLED_APPS = [
    # ... other apps
    'smbc.user_management',
    'rest_framework',
]

# API Configuration
SMBC_USER_MANAGEMENT_CONFIG = {
    'BASE_URL': '/api/v1/users/',
    'ENABLE_MOCK_DATA': False,
    'PAGINATION_SIZE': 20,
}
```

Include the URLs:

```python
# urls.py
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('api/v1/users/', include('smbc.user_management.urls')),
]
```

## API Endpoints

- `GET /api/v1/users/` - List users with filtering and pagination
- `POST /api/v1/users/` - Create new user
- `GET /api/v1/users/{id}/` - Get user details
- `PUT /api/v1/users/{id}/` - Update user
- `DELETE /api/v1/users/{id}/` - Delete user

## Permissions

Uses Django's built-in permission system:

- `user_management.view_user`
- `user_management.add_user`
- `user_management.change_user`
- `user_management.delete_user`

## Development

Run migrations:

```bash
python manage.py migrate
```

Load sample data:

```bash
python manage.py loaddata user_management_sample
```
