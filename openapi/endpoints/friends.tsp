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
  | User[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請中のユーザーを取得
   */
  @route("requests")
  @summary("フレンド申請中のユーザーを取得")
  @get
  op getFriendRequest():
  | User[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請未承認のユーザーを取得
   */
  @route("pendings")
  @summary("フレンド申請未承認のユーザーを取得")
  @get
  op getPendingFriendRequest():
  | User[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンドの登録解除
   */
  @route("{uid}")
  @summary("フレンドの登録解除")
  @delete
  op unRegisterFriend(@path uid: string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}
