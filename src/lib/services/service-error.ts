export class ServiceError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT",
    message: string
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
