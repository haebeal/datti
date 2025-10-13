import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * ヘルスチェック
 */
@tag("Health")
@route("/health")
namespace Health {
  /**
   * アプリケーションの稼働状況を確認
   */
  interface Health {
    @summary("ヘルスチェック")
    @get
    check(): {
      /**
       * 正常レスポンス
       */
      @statusCode statusCode: 200;

      @body body: CheckResponse;
    };
  }

  model CheckResponse {
    status: "ok";
    timestamp: utcDateTime;
  }
}
