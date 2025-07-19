import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors";

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }
  const publicErrorObeject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  console.error(publicErrorObeject);
  response.status(publicErrorObeject.statusCode).json(publicErrorObeject);
}

function onNoMatchHandler(request, response) {
  const publicErrorObeject = new MethodNotAllowedError();
  return response
    .status(publicErrorObeject.statusCode)
    .json(publicErrorObeject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
