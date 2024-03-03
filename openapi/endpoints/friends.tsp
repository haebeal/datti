import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * フレンド管理に関する捜査
 */
@tag("Friends")
@route("friends")
namespace Friends {
  /**
   * フレンドのユーザーを取得
   */
  @summary("フレンドのユーザーを取得")
  @get
  op getFriend():
  | Profile[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請中のユーザーを取得
   */
  @route("requests")
  @summary("フレンド申請中のユーザーを取得")
  @get
  op getFriendRequest():
  | Profile[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の送信
   */
  @route("requests")
  @summary("フレンド申請の送信")
  @post
  op sendFriend(...FriendRequest):
  | Utils.Response.CreatedMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請未承認のユーザーを取得
   */
  @route("pendings")
  @summary("フレンド申請未承認のユーザーを取得")
  @get
  op getPendingFriendRequest():
  | Profile[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の受領
   */
  @route("pendings")
  @summary("フレンド申請の受領")
  @post
  op postPendingFriendRequest(...FriendRequest):
  | Utils.Response.CreatedMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンドの登録解除
   */
  @summary("フレンドの登録解除")
  @delete
  op deleteFriend(...FriendRequest):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model FriendRequest {
  /**
   * フレンド申請受信者のユーザーID
   */
  @minLength(28)
  @maxLength(28)
  friendUid: string;
}