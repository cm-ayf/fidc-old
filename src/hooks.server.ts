import { HttpError } from "$lib/error";

export async function handleError({ error }) {
  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    status: "failed",
    errorMessage: message,
    message,
  };
}

export async function handle({ event, resolve }) {
  try {
    return await resolve(event);
  } catch (error) {
    if (error instanceof HttpError) {
      return error.toResponse();
    } else {
      return Response.json(handleError({ error, event }), { status: 500 });
    }
  }
}
