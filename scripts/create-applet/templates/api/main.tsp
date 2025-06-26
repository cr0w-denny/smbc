import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "{{APPLET_DISPLAY_NAME}} API",
  version: "1.0.0",
})
@server("https://api.example.com", "{{APPLET_DISPLAY_NAME}} API Server")
namespace {{APPLET_PASCAL_CASE}}Api;

// Base {{APPLET_PASCAL_CASE}} model
model {{APPLET_PASCAL_CASE}} {
  id: int32;
  name: string;
  description?: string;
  status: {{APPLET_PASCAL_CASE}}Status;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

// Status enumeration
enum {{APPLET_PASCAL_CASE}}Status {
  Active: "active",
  Inactive: "inactive",
}

// Create request model
model Create{{APPLET_PASCAL_CASE}}Request {
  name: string;
  description?: string;
  status?: {{APPLET_PASCAL_CASE}}Status = {{APPLET_PASCAL_CASE}}Status.Active;
}

// Update request model
model Update{{APPLET_PASCAL_CASE}}Request {
  name?: string;
  description?: string;
  status?: {{APPLET_PASCAL_CASE}}Status;
}

// List response model
model {{APPLET_PASCAL_CASE}}List {
  items: {{APPLET_PASCAL_CASE}}[];
  total: int32;
  page: int32;
  pageSize: int32;
}

// Error model
model ApiError {
  code: string;
  message: string;
  details?: string;
}

// {{APPLET_PASCAL_CASE}} resource routes
@route("/{{APPLET_NAME}}")
interface {{APPLET_PASCAL_CASE}}s {
  @get
  @summary("List all {{APPLET_NAME}} items")
  list(
    @query page?: int32 = 1,
    @query pageSize?: int32 = 20,
    @query search?: string,
    @query status?: {{APPLET_PASCAL_CASE}}Status
  ): {{APPLET_PASCAL_CASE}}List | ApiError;

  @post
  @summary("Create a new {{APPLET_NAME}} item")
  create(@body request: Create{{APPLET_PASCAL_CASE}}Request): {{APPLET_PASCAL_CASE}} | ApiError;

  @route("/{id}")
  @get
  @summary("Get a specific {{APPLET_NAME}} item")
  get(@path id: int32): {{APPLET_PASCAL_CASE}} | ApiError;

  @route("/{id}")
  @put
  @summary("Update a {{APPLET_NAME}} item")
  update(
    @path id: int32,
    @body request: Update{{APPLET_PASCAL_CASE}}Request
  ): {{APPLET_PASCAL_CASE}} | ApiError;

  @route("/{id}")
  @delete
  @summary("Delete a {{APPLET_NAME}} item")
  delete(@path id: int32): void | ApiError;
}