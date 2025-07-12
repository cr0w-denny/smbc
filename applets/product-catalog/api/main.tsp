import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * Product Catalog API
 */
@service(#{
  title: "Product Catalog API",
})
@server("https://api.smbcgroup.com/api/v1/product-catalog", "Production server")
@server("http://localhost:3001/api/v1/product-catalog", "Development server")
@server("http://localhost:3000/api/v1/product-catalog", "Mock server")
namespace ProductCatalogAPI;

model Product {
  id: string;
  name: string;
  description: string;
  price: float64;
  category: string;
  sku: string;
  inStock: boolean;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model CreateProductRequest {
  name: string;
  description: string;
  price: float64;
  category: string;
  sku: string;
}

model UpdateProductRequest {
  name?: string;
  description?: string;
  price?: float64;
  category?: string;
  sku?: string;
  inStock?: boolean;
}

model ProductList {
  products: Product[];
  total: int32;
  page: int32;
  pageSize: int32;
}

@error
model ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

@route("/products")
interface Products {
  @get
  list(
    @query page?: int32 = 1,
    @query pageSize?: int32 = 10,
    @query category?: string,
    @query search?: string,
    @query inStock?: boolean
  ): ProductList | ErrorResponse;

  @post
  create(@body product: CreateProductRequest): Product | ErrorResponse;

  @get
  @route("/{id}")
  get(@path id: string): Product | ErrorResponse;

  @patch(#{implicitOptionality: true})
  @route("/{id}")
  update(@path id: string, @body product: UpdateProductRequest): Product | ErrorResponse;

  @delete
  @route("/{id}")
  delete(@path id: string): { message: string } | ErrorResponse;
}
