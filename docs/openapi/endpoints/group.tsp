import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * グループに関する操作
 */
@tag("Groups")
@route("groups")
namespace GroupEndpoints {
  /**
   * 所属しているグループの取得
   */
  @summary("所属しているグループ情報の取得")
  @get
  op getGroups(@query cursor?: string, @query limit?: integer, @query getNext?: boolean):
  | GroupsGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の取得
   */
  @route("{groupId}")
  @summary("グループ情報の取得")
  @get
  op getGroup(@path groupId: string):
  | GroupGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループに対するメンバー情報の取得
   */
  @route("{groupId}/members")
  @summary("グループに対するメンバー情報の取得")
  @get
  op getGroupMembers(@path groupId: string, @query status?: Utils.Alias.Status):
  | MembersGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループに対するメンバーの追加
   */
  @route("{groupId}/members")
  @summary("グループに対するメンバーの招待")
  @post
  op registedUsers(@path groupId: string, @body members: MembersPostRequest):
  | GroupPostResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループの作成
   */
  @summary("グループの作成")
  @post
  op postGroup(...GroupPostRequest):
  | GroupPostResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の更新
   */
  @route("{groupId}")
  @summary("グループ情報の更新")
  @put
  op putGroup(@path groupId: string, @body group: GroupPutRequest):
  | GroupGetResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループの削除
   */
  @route("/{groupId}")
  @summary("グループ情報の削除")
  @delete
  op deleteGroup(@path groupId: string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  model GroupGetResponse {
    ...Group;
  }

  model GroupPostResponse {
    ...Group;
    members: Member[];
  }
  
  model GroupsGetResponse {
    /**
     * グループ
     */
    groups: Group[];
  }
  
  model MembersGetResponse {
    members: Member[];
  }
  
  model GroupPutRequest {
    /**
     * グループ名
     */
    name: string;
  }
  
  model GroupPostRequest {
    /**
     * グループ名
     */
    name: string;
  
    /**
     * ユーザーID
     */
    userIds: string[];
  }
  
  model MembersPostRequest {
    /**
     * ユーザーID
     */
    userIds: string[];
  }
}

model Group {
  /**
   * グループID
   */
  groupId: string;

  /**
   * グループ名
   */
  name: string;
}

model Member {
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
  status: Utils.Alias.Status
}
 