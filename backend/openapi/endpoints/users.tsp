import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * ユーザー情報に関する操作
 */
@tag("Users")
@route("users")
namespace UserEndpoints {
  /**
   * メールアドレスによるユーザー情報の取得
   */
  @summary("ユーザー情報の取得")
  @get
  op getUserByEmail(@query email?: string, @query status?: Utils.Alias.Status, @query cursor?: string, @query limit?: integer, @query getNext?: boolean):
  | UsersGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * ユーザー情報の取得
   */
  @route("me")
  @summary("ユーザー情報（自分）の取得")
  @get()
  op getMe():
  | UserGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * ユーザー情報の更新
   */
  @route("me")
  @summary("ユーザー情報（自分）の更新")
  @put
  op updateMe(...UserPutRequest):
  | UserGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * プロフィール情報の取得
   */
  @summary("UIDによるユーザー情報の取得")
  @route("{userId}")
  @get()
  op getUserByUid(@path userId: string):
  | UserGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の送信
   */
  @route("{userId}/requests")
  @summary("フレンド申請の送信")
  @post
  op friendRequest(@path userId: string):
  | Utils.Response.CreatedMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンドの登録解除
   */
  @route("friends/{userId}")
  @summary("フレンドの登録解除")
  @delete
  op unRegisterFriend(@path userId: string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  model UserGetResponse {
    ...User;
  }
  model UsersGetResponse {
    users: User[];
    cursor: Cursor;
  }
  
  model UserPutRequest{
    /**
     * ユーザー名
     */
    name: string;
  
    /**
     * 画像URL
     */
    photoUrl: string;
  }
  
  model Friends {
    users: {
      /**
       * ユーザーID
       */
      @minLength(28)
      @maxLength(28)
      userId: string;
    
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
}

model User {
  /**
   * ユーザーID
   */
  @minLength(28)
  @maxLength(28)
  userId: string;

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

  /**
   * フレンド状態のステータス
   */
  status: Utils.Alias.Status;
}

model Cursor {
  /**
   * 始端カーソル
   */
  startCursor: string;

  /**
   * 終端カーソル
   */
  endCursor: string;
}