import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
  * 借り入れ
  */
@tag("Borrowings")
@route("/borrowings")
namespace Borrowing {
  @summary("全ての借り入れの取得")
  @get
  @route("/")
  op getAll():
    | {
        /**
        * 正常レスポンス
        */
        @statusCode statusCode: 201;

        @body body: GetAllResponse[];
      }
    | {
        @statusCode statusCode: 400;
        @body body: ErrorResponse;
      }
    | {
        @statusCode statusCode: 401;
        @body body: ErrorResponse;
      }
    | {
        @statusCode statusCode: 500;
        @body body: ErrorResponse;
      };

  model GetAllResponse {
    id: string;
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }
}
