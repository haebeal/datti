import "@typespec/http";

using TypeSpec.Http;

namespace Utils.Error;

/**
 * エラーレスポンスのボディ
 */
model ErrorBody<T extends string = string> {
  error: T;
}

/**
 * 400エラー
 */
@error
model BadRequestError {
  @statusCode statusCode: 400;
  @body body: ErrorBody;
}

/**
 * 401エラー
 */
@error
model UnauthorizedError {
  @statusCode statusCode: 401;
  @body body: ErrorBody;
}

/**
 * 404エラー
 */
@error
model NotFoundError {
  @statusCode statusCode: 404;
  @body body: ErrorBody;
}
/**
 * 500エラー
 */
@error
model InternalServerError {
  @statusCode statusCode: 500;
  @body body: ErrorBody;
}
