// employee-directory/api/main.tsp
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

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
@server("https://api.smbcgroup.com/api/v1/employee-directory", "Production server")
@server("http://localhost:3001/api/v1/employee-directory", "Development server") 
@server("http://localhost:3000/api/v1/employee-directory", "Mock server")
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
    args: #[#["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal", "IT", "Customer Support"]]
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

@route("/employees")
interface Employees {
  @get
  list(
    @query search?: string,
    @query department?: string,
    @query active?: boolean,
    @query page?: int32,
    @query pageSize?: int32
  ): Employee[];
  
  @get
  @route("/{id}")
  read(@path id: string): Employee;
  
  @post
  create(@body employee: Employee): Employee;
  
  @patch
  @route("/{id}")
  update(@path id: string, @body updates: UpdateEmployeeRequest): Employee;
  
  @delete
  @route("/{id}")
  remove(@path id: string): void;
}