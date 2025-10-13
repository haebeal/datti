import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * ユーザー間債権
 */
@tag("Credits")
@route("/credits")
namespace Credits {
  /**
   * ユーザー横断の債権一覧を取得
   */
  interface Credits {
    @summary("債権一覧の取得")
    @get
    list():
      | {
          @statusCode statusCode: 200;
          @body body: Credit[];
        }
      | {
          @statusCode statusCode: 401;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 500;
          @body body: ErrorResponse;
        };
  }
}

model Credit {
  userId: string;
  amount: int64;
}
