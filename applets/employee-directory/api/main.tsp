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
@server("/api/v1/employee-directory", "mock")
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

model EmployeeList {
  employees: Employee[];
  total: int32;
  page: int32;
  pageSize: int32;
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
  ): EmployeeList;
  
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