import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * フレンド管理に関する捜査
 */
@tag("Friends")
@route("friends")
namespace FriendEndpoints {
  /**
   * フレンドのユーザーを取得
   */
  @summary("フレンドのユーザーを取得")
  @get
  op getFriend():
  | Friends
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請中のユーザーを取得
   */
  @route("requests")
  @summary("フレンド申請中のユーザーを取得")
  @get
  op getFriendRequest():
  | Friends
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請未承認のユーザーを取得
   */
  @route("pendings")
  @summary("フレンド申請未承認のユーザーを取得")
  @get
  op getPendingFriendRequest():
  | Friends
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンドの登録解除
   */
  @route("{userId}")
  @summary("フレンドの登録解除")
  @delete
  op unRegisterFriend(@path userId: string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Friends {
  users: {
    /**
     * ユーザーID
     */
    @minLength(28)
    @maxLength(28)
    uid: string;
  
    /**
     * ユーザー名
     */
    name: string;
  
    /**
     * メールアドレス
     */
    email: string;
  
    /**
     * 画像URL
     */
    photoUrl: string;
  }[]
}
