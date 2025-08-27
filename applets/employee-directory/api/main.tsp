// employee-directory/api/main.tsp
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "../../../packages/typespec-core/query.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * Employee Directory API
 * 
 * This API provides endpoints for managing employee information.
 */
@service(#{
  title: "Employee Directory API",
})
@server("/api/v1/employee-directory", "mock")
@server("http://localhost:8000/api/v1/employee-directory", "local")
@server("http://localhost:3001/api/v1/employee-directory", "dev")
@server("https://api-qa.smbcgroup.com/api/v1/employee-directory", "qa")
@server("https://api.smbcgroup.com/api/v1/employee-directory", "prod")
namespace EmployeeDirectory;

model Employee {
  @extension("x-mock-data", #{
    faker: "string.uuid"
  })
  id: string;
  
  @extension("x-mock-data", #{
    faker: "person.fullName"
  })
  name: string;
  
  @extension("x-mock-data", #{
    faker: "internet.email",
    unique: true
  })
  email: string;
  
  @extension("x-mock-data", #{
    faker: "helpers.arrayElement",
    args: #[#["Customer Support", "Engineering", "Finance", "HR", "IT", "Legal", "Marketing", "Operations", "Sales"]]
  })
  department: string;
  
  @extension("x-mock-data", #{
    faker: "person.jobTitle"
  })
  role: string;
  
  @extension("x-mock-data", #{
    faker: "datatype.boolean",
    weight: 0.9
  })
  active: boolean;
}

model UpdateEmployeeRequest {
  name?: string;
  email?: string;
  department?: string;
  role?: string;
  active?: boolean;
}

model EmployeeList {
  employees: Employee[];
  total: int32;
  page: int32;
  pageSize: int32;
}

/**
 * Employee-specific search parameters
 */
alias EmployeeSearchParams = {
  @query @extension("x-mock-search", #{ fields: #["name", "email"] }) search?: string;
};

/**
 * Employee-specific filter parameters for list endpoint
 */
alias EmployeeFilterParams = {
  @query @extension("x-mock-filter", #{ field: "department", strategy: "exact" }) department?: string;
  @query @extension("x-mock-filter", #{ field: "active", strategy: "boolean-choice" }) active?: boolean;
};

@route("/employees")
interface Employees {
  @get
  list(...PaginationParams, ...SortParams, ...EmployeeSearchParams, ...EmployeeFilterParams): EmployeeList;
  
  @get
  @route("/{id}")
  read(@path id: string): Employee;
  
  @post
  create(@body employee: Employee): Employee;
  
  @patch(#{ implicitOptionality: true })
  @route("/{id}")
  update(@path id: string, @body updates: UpdateEmployeeRequest): Employee;
  
  @delete
  @route("/{id}")
  remove(@path id: string): void;
}