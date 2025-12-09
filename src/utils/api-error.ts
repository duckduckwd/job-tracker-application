import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { Prisma } from "../../generated/prisma";

/**
 * Centralized API error handling utility
 * Converts various error types into consistent NextResponse objects
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors,
      },
      { status: 400 },
    );
  }

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists", code: error.code },
        { status: 409 },
      );
    }

    // Record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found", code: error.code },
        { status: 404 },
      );
    }

    // Foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid reference", code: error.code },
        { status: 400 },
      );
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  // Generic error fallback
  console.error("API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
