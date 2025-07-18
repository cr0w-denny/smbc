import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * Usage Stats API
 * 
 * This API provides endpoints for usage statistics tracking.
 */
@service(#{
  title: "Usage Stats API",
})
@server("/api/v1", "mock")
@server("https://ewi-dev.smbcgroup.com/api/v1", "dev")
@server("https://api-qa.smbcgroup.com/api/v1", "qa")
@server("https://api.smbcgroup.com/api/v1", "prod")
namespace UsageStatsAPI;

/**
 * Response definitions
 */
model UsageStatsUserObj {
  @extension("x-mock-data", #{
    faker: "internet.email",
    unique: true
  })
  email: string;
  
  @extension("x-mock-data", #{
    faker: "person.fullName"
  })
  name: string;
  
  @extension("x-mock-data", #{
    faker: "number.int",
    args: #[#{min: 1, max: 500}]
  })
  count: int32;
}

model UsageStatsComponentObj {
  @extension("x-mock-data", #{
    faker: "helpers.arrayElement",
    args: #[#["UserManager", "ProductCatalog", "EmployeeDirectory", "Dashboard", "Reports", "Settings", "Navigation", "SearchBox", "DataTable", "Charts"]]
  })
  component: string;
  
  @extension("x-mock-data", #{
    faker: "number.int",
    args: #[#{min: 5, max: 1000}]
  })
  count: int32;
}

model UsageStatsExceptionObj {
  @extension("x-mock-data", #{
    faker: "helpers.arrayElement",
    args: #[#["UserManager", "ProductCatalog", "EmployeeDirectory", "Dashboard", "Reports", "Settings"]]
  })
  component: string;
  
  @extension("x-mock-data", #{
    faker: "internet.email",
    unique: true
  })
  email: string;
  
  @extension("x-mock-data", #{
    faker: "person.fullName"
  })
  name: string;
  
  @extension("x-mock-data", #{
    faker: "helpers.arrayElement",
    args: #[#["500", "404", "403", "400", "503"]]
  })
  resp_cd: string;
  
  @extension("x-mock-data", #{
    faker: "helpers.arrayElement",
    args: #[#["Internal Server Error", "Not Found", "Forbidden", "Bad Request", "Service Unavailable"]]
  })
  resp_msg: string;
  
  @extension("x-mock-data", #{
    faker: "number.int",
    args: #[#{min: 1, max: 50}]
  })
  count: int32;
}

model UsageStatsList<T> {
  component_map: {};
  records: T[];
}

/**
 * Query parameters
 */
model DateRangeQueryParams {
  @query start_date: utcDateTime;
  @query end_date: utcDateTime;
}

model ListUsersQueryParams is DateRangeQueryParams {
  @query ui_filter?: string;
}

model ListUIQueryParams is DateRangeQueryParams {
  @query user_email?: string;
}

model ListExceptionsParams is DateRangeQueryParams {}

@route("/usage-stats")
interface UsageStats {
  @get
  @route("/users-usage/")
  list_users_usage(...ListUsersQueryParams): UsageStatsList<UsageStatsUserObj>;

  @get
  @route("/ui-usage/")
  list_ui_usage(...ListUIQueryParams): UsageStatsList<UsageStatsComponentObj>;

  @get
  @route("/exceptions/")
  list_exceptions(...ListExceptionsParams): UsageStatsList<UsageStatsExceptionObj>;
}