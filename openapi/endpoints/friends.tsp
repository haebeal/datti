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
   * フレンド申請の送信
   */
  @summary("フレンド申請の送信")
  @post
  op sendFriend(...Friend):
  | Friend
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Friend {
  /**
   * フレンド申請送信者のユーザーID
   */
  @minLength(28)
  @maxLength(28)
  uid: string;

  /**
   * フレンド申請受信者のユーザーID
   */
  @minLength(28)
  @maxLength(28)
  friendUid: string;
}