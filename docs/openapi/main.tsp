import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./lendings.tsp";
import "./credits.tsp";
import "./health.tsp";

using TypeSpec.Http;

/**
 * 誰にいくら払ったっけ？を記録するサービス
 */
@service(#{ title: "Datti API" })
@server("https://datti-api.haebeal.net", "本番環境")
@useAuth(BearerAuth)
namespace DattiApi;
