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
  interface HealthCheck {
    @summary("ヘルスチェック")
    @get
    check(): {
      /**
       * 正常レスポンス
       */
      @statusCode statusCode: 200;
      @body body: HealthResponse;
    };
  }

  model HealthResponse {
    status: "ok";
    timestamp: utcDateTime;
  }
}
