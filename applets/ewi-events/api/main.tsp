import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "../../../packages/typespec-core/query.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * EWI Events API
 * 
 * This API provides endpoints for managing EWI events and workflows.
 */
@service(#{
  title: "EWI Events API",
})
@server("/api/v1/ewi-events", "mock")
@server("http://localhost:3001/api/v1/ewi-events", "dev")
@server("https://api-qa.smbcgroup.com/api/v1/ewi-events", "qa")
@server("https://api.smbcgroup.com/api/v1/ewi-events", "prod")
namespace EwiEventsApi;

@doc("Event status enumeration")
union EventStatus {
  @doc("Event is on course")
  "on-course",
  
  @doc("Event is almost due")
  "almost-due",
  
  @doc("Event is past due")
  "past-due",
  
  @doc("Event needs attention")
  "needs-attention",
}

@doc("Dashboard event model")
model Event {
  @doc("Event ID")
  @extension("x-mock-data", #{ faker: "string.alphanumeric", options: #{ length: 8, casing: "upper", prefix: "EV" } })
  id: string;
  
  @doc("Obligor name")
  @extension("x-mock-data", #{ faker: "company.name" })
  obligor: string;
  
  @doc("Event status")
  @extension("x-mock-data", #{ 
    choices: #["on-course", "almost-due", "past-due", "needs-attention"],
    weights: #[0.4, 0.3, 0.2, 0.1]
  })
  status: EventStatus;
  
  @doc("Due date")
  @extension("x-mock-data", #{ relative: "-30d to +30d", format: "yyyy-MM-dd" })
  dueDate: string;
  
  @doc("Assigned analyst")
  @extension("x-mock-data", #{ faker: "person.fullName" })
  analyst: string;
}

@doc("Event list response")
model EventList {
  @doc("List of events")
  events: Event[];
  
  @doc("Total number of events")
  total: int32;
  
  @doc("Current page")
  page: int32;
  
  @doc("Page size")
  pageSize: int32;
}

@doc("Event filters")
model EventFilters {
  @doc("Filter by status")
  @query 
  @extension("x-mock-filter", #{ field: "status", strategy: "exact" })
  status?: EventStatus;
  
  @doc("Filter by date from")
  @query
  @extension("x-mock-filter", #{ field: "dueDate", strategy: "date-range-from" })
  dateFrom?: string;
  
  @doc("Filter by date to")
  @query
  @extension("x-mock-filter", #{ field: "dueDate", strategy: "date-range-to" })
  dateTo?: string;
  
  @doc("Filter by workflow")
  @query
  @extension("x-mock-filter", #{ field: "workflow", strategy: "exact" })
  workflow?: string;
  
  @doc("Filter by ratings")
  @query
  @extension("x-mock-filter", #{ field: "exRatings", strategy: "partial-match" })
  exRatings?: string;
  
  @doc("Search across events")
  @query 
  @extension("x-mock-search", #{ fields: #["obligor", "analyst", "id"] })
  search?: string;
  
  @doc("Page number")
  @query
  page?: int32 = 1;
  
  @doc("Page size")
  @query
  pageSize?: int32 = 20;
}

@route("/api/events")
interface Events {
  @doc("Get events with optional filters")
  @get
  @operationId("getEvents")
  @extension("x-mock-response", #{
    count: 50,
    pagination: true
  })
  list(...EventFilters): EventList;
  
  @doc("Get event by ID")
  @get
  @operationId("getEvent")
  get(@path id: string): Event;
}