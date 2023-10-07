export class HttpError extends Error {
  constructor(message?: string, public status = 500) {
    super(message);
  }

  toResponse() {
    return Response.json(
      { status: "failed", errorMessage: this.message },
      { status: this.status }
    );
  }
}
