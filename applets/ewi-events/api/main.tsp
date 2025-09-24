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
@server("http://localhost:8000/api/v1/ewi-events", "local")
@server("http://localhost:3001/api/v1/ewi-events", "dev")
@server("https://api-qa.smbcgroup.com/api/v1/ewi-events", "qa")
@server("https://api.smbcgroup.com/api/v1/ewi-events", "prod")
namespace EwiEventsApi;


@doc("Dashboard event model")
model Event {
  @doc("Event reference ID")
  @extension("x-mock-data", #{ faker: "string.alphanumeric", options: #{ length: 8, casing: "upper" } })
  event_ref_id: string;
  
  @doc("Obligor name")
  @extension("x-mock-data", #{ faker: "company.name" })
  obligor: string;
  
  @doc("SUN ID")
  @extension("x-mock-data", #{ faker: "number.int", options: #{ min: 100000, max: 999999 } })
  sun_id: int32;
  
  @doc("PLO")
  @extension("x-mock-data", #{ faker: "string.alphanumeric", options: #{ length: 6, casing: "upper" } })
  plo: string;
  
  @doc("Exposure amount")
  @extension("x-mock-data", #{ faker: "number.int", options: #{ min: 10000, max: 10000000 } })
  exposure: int32;
  
  @doc("Event date")
  @extension("x-mock-data", #{ relative: "-30d to +30d", format: "yyyy-MM-dd" })
  event_date: string;
  
  @doc("Event resolution date")
  @extension("x-mock-data", #{ relative: "+1d to +60d", format: "yyyy-MM-dd" })
  event_res_date: string;
  
  @doc("Event category")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#["Mandatory", "Discretionary"]]
  })
  event_category: string;
  
  @doc("Workflow status")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#["Subscribed", "NotSubscribed", "Review", "Approval", "Complete"]]
  })
  workflow_status: string;
  
  @doc("Lifecycle status")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#["on-course", "almost-due", "past-due", "needs-attention"]]
  })
  lifecycle_status: string;
  
  @doc("Trigger type")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#["ExRatings", "Stock", "CDSSpreads", "LoanPrices", "Financials"]]
  })
  trigger_type: string;
  
  @doc("Trigger shortname")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#[
      "RTNG_DOWN_1NOTCH", 
      "STCK_PRC_DOWN_L1", 
      "CDS_SPREAD_DOWN_10_PCT", 
      "SEC_LOAN_PRICE_DWN", 
      "NEG_CUM_EBIT",
      "NEG_CUM_NI"
    ]]
  })
  trigger_shortname: string;
  
  @doc("Trigger values")
  @extension("x-mock-data", #{ 
    faker: "helpers.arrayElement",
    args: #[#[
      "MoodyLTRatingCurrent-MoodyLTRating1Day1\nORS&PLTRatingCurrent-S&PLTRating1Day1",
      "(StockPriceCurrent-StockPrice3M)/StockPriceCurrent*100≤-50",
      "CDSSpreadCurrent ≥ 10%",
      "(SecLoanPriceCurrent-SecLoanPrice3M)/SecLoanPriceCurrent*100≥50",
      "CumulativeEBIT<0",
      "CumulativeNI<0"
    ]]
  })
  trigger_values: string;
}


/**
 * Event-specific filter parameters
 */
alias EventFilterParams = {
  @query @extension("x-mock-filter", #{ field: "lifecycle_status", strategy: "exact" }) status?: "on-course" | "almost-due" | "past-due" | "needs-attention";
  @query @extension("x-mock-filter", #{ field: "trigger_type", strategy: "exact" }) types?: "ExRatings" | "Stock" | "CDSSpreads" | "LoanPrices" | "Financials";
};

@route("/events")
interface Events {
  @doc("Get the list of events for a date range")
  @get
  @operationId("getEvents")
  @extension("x-mock-response", #{
    count: 500,
    returnArray: true
  })
  list(
    @query start_date?: string,  // format: date
    @query end_date?: string,    // format: date
    ...EventFilterParams
  ): Event[];
}