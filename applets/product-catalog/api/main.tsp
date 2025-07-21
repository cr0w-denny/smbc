import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * Product Catalog API
 */
@service(#{
  title: "Product Catalog API",
})
@server("/api/v1/product-catalog", "mock")
@server("http://localhost:3001/api/v1/product-catalog", "dev")
@server("https://api-qa.smbcgroup.com/api/v1/product-catalog", "qa")
@server("https://api.smbcgroup.com/api/v1/product-catalog", "prod")
namespace ProductCatalogAPI;

model Product {
  @extension("x-mock-data", #{
    faker: "string.uuid"
  })
  id: string;
  
  @extension("x-mock-data", #{
    faker: "commerce.productName"
  })
  name: string;
  
  @extension("x-mock-data", #{
    faker: "commerce.productDescription"
  })
  description: string;
  
  @extension("x-mock-data", #{
    faker: "commerce.price",
    transform: "parseFloat"
  })
  price: float64;
  
  @extension("x-mock-data", #{
    faker: "commerce.department"
  })
  category: string;
  
  @extension("x-mock-data", #{
    faker: "string.alphanumeric",
    args: #[8]
  })
  sku: string;
  
  @extension("x-mock-data", #{
    faker: "datatype.boolean",
    weight: 0.8
  })
  inStock: boolean;
  
  @extension("x-mock-data", #{
    relative: "-90d to -1d",
    format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  })
  createdAt: utcDateTime;
  
  @extension("x-mock-data", #{
    relative: "-7d to now",
    format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  })
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

/**
 * Product-specific filter parameters for list endpoint
 */
alias ProductFilterParams = {
  @query page?: int32 = 1;
  @query pageSize?: int32 = 10;
  @query @extension("x-mock-filter", #{ field: "category", strategy: "exact" }) category?: string;
  @query @extension("x-mock-filter", #{ field: "name", strategy: "partial-match" }) search?: string;
  @query @extension("x-mock-filter", #{ field: "inStock", strategy: "exact" }) inStock?: boolean;
};

@route("/products")
interface Products {
  @get
  list(...ProductFilterParams): ProductList | ErrorResponse;

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
