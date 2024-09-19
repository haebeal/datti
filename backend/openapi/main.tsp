import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./endpoints";

using TypeSpec.Http;

/**
 * 誰にいくら払ったっけ？を記録するサービス
 */
@service({
  title: "Datti API",
})
@server("https://datti-api.haebeal.net", "本番環境")
@server("https://datti-api-dev.fly.dev", "開発環境")
@useAuth(BearerAuth)
namespace DattiAPI;
