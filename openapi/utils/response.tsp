import "@typespec/http";

using TypeSpec.Http;

namespace Utils.Response;

/**
 * 正常完了時、メッセージのみを返す場合のボディ
 */
model Message<T extends string = string> {
  message: T;
}

/**
 * 200レスポンス
 */
model OKMessage {
  @statusCode statusCode: 200;
  @body body: Message;
}

/**
 * 201レスポンス
 */
model CreatedMessage {
  @statusCode statusCode: 201;
  @body body: Message;
}

/**
 * 204レスポンス
 */
model NoContentMessage {
  @statusCode statusCode: 204;
  @body body: Message;
}


/**
 * 正常完了時、レコードを返す場合のボディ
 */
model ResponseBody<T> {
  /**
   * ユーザーID
   */
  @minLength(28)
  @maxLength(28)
  uid: string;

  ...T;

  /**
   * 作成時間
  */
  createdAt: utcDateTime;

  /**
   * 更新時間
   */
  updatedAt: utcDateTime;

  /**
   * 削除時間
   * 論理削除されていない場合はnull
   */
  deletedAt: null | utcDateTime;
}

/**
 * 200レスポンス
 */
model OKResponse<T> {
  @statusCode statusCode: 200;
  @body body: ResponseBody<T>;
}

/**
 * 201レスポンス
 */
model CreatedResponse<T> {
  @statusCode statusCode: 201;
  @body body: ResponseBody<T>;
}

/**
 * 204レスポンス
 */
model NoContentResponse<T> {
  @statusCode statusCode: 204;
  @body body: ResponseBody<T>;
}
