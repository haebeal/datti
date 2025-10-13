import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * ユーザー間クレジット
 */
@tag("Credits")
@route("/credits")
namespace Credit {
  /**
   * ユーザー横断のクレジット一覧を取得
   */
  interface Credit {
    @summary("クレジット一覧の取得")
    @get
    list():
      | {
          @statusCode statusCode: 200;
          @body body: CreditSummary[];
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

model CreditSummary {
  userId: string;
  amount: int64;
}
