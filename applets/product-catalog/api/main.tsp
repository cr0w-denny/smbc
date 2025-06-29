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
@server("https://api.smbc.com/api/v1", "Production server")
@server("http://localhost:3001/api/v1", "Development server")
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
    @query search?: string
  ): ProductList | ErrorResponse;

  @post
  create(@body product: CreateProductRequest): Product | ErrorResponse;

  @get
  @route("/{id}")
  get(@path id: string): Product | ErrorResponse;
}
