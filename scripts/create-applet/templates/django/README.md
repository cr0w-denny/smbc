# {{APPLET_DISPLAY_NAME}} Django Backend

This package contains the Django backend implementation for the {{APPLET_DISPLAY_NAME}} applet.

## Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Project Structure

```
{{APPLET_NAME}}_django/
├── {{APPLET_NAME}}/           # Django app
│   ├── models.py       # Data models
│   ├── views.py        # API views
│   ├── serializers.py  # DRF serializers
│   ├── urls.py         # URL routing
│   └── ...
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
└── settings.py         # Django settings
```

## API Endpoints

The Django backend should implement the API specification defined in the `@smbc/{{APPLET_NAME}}-api` package.

Base URL: `/api/{{APPLET_NAME}}/`

- `GET /` - List {{APPLET_NAME}} items
- `POST /` - Create new {{APPLET_NAME}} item
- `GET /{id}/` - Get specific {{APPLET_NAME}} item
- `PUT /{id}/` - Update {{APPLET_NAME}} item
- `DELETE /{id}/` - Delete {{APPLET_NAME}} item

## Development

1. Install development dependencies
2. Run tests: `python manage.py test`
3. Create migrations: `python manage.py makemigrations`
4. Apply migrations: `python manage.py migrate`

## Deployment

See the main SMBC documentation for deployment instructions.