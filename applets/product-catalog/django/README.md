# @smbc/product-catalog-django

```bash
pip install smbc-product-catalog
```

## Configuration

Add to Django settings:

```python
INSTALLED_APPS = [
    # ... other apps
    'smbc.product_catalog',
    'rest_framework',
]

# Product Catalog Configuration
SMBC_PRODUCT_CATALOG_CONFIG = {
    'BASE_URL': '/api/v1/products/',
    'ENABLE_CACHE': True,
    'CACHE_TIMEOUT': 300,  # 5 minutes
}
```

## API Endpoints

### Products

- `GET /api/v1/products/` - List products
- `GET /api/v1/products/{id}/` - Product detail
- `POST /api/v1/products/` - Create product (admin only)
- `PUT /api/v1/products/{id}/` - Update product (admin only)
- `DELETE /api/v1/products/{id}/` - Delete product (admin only)

### Categories

- `GET /api/v1/products/categories/` - List categories
- `GET /api/v1/products/categories/{id}/` - Category detail

## Models

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True)
    stock_quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Permissions

- View products: Available to all authenticated users
- Manage products: Requires `product_catalog.change_product` permission
