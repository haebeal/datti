import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * グループに関する操作
 */
@tag("Groups")
@route("groups")
namespace Groups {
  /**
   * 所属しているグループの取得
   */
  @summary("所属しているグループ情報の取得")
  @get
  op getGroups():
  | Utils.Response.OKResponse<GroupsResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の取得
   */
  @route("{groupId}")
  @summary("グループ情報の取得")
  @get
  op getGroup(@path groupId: string):
  | Utils.Response.OKResponse<GroupResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループに対するメンバー情報の取得
   */
  @route("{groupId}/members")
  @summary("グループに対するメンバー情報の取得")
  @get
  op getGroupMembers(@path groupId: string):
  | GroupMembers
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループに対するメンバーの追加
   */
  @route("{groupId}/members")
  @summary("グループに対するメンバーの招待")
  @post
  op registedUsers(@path groupId: string, @body members: Members):
  | Utils.Response.OKResponse<GroupResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループの作成
   */
  @summary("グループの作成")
  @post
  op postGroup(...GroupCreateRequest):
  | Utils.Response.OKResponse<GroupResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の更新
   */
  @route("{groupId}")
  @summary("グループ情報の更新")
  @put
  op putGroup(@path groupId: string, @body group: GroupUpdateRequest):
  | Utils.Response.OKResponse<GroupResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Group {
  /**
   * グループID
   */
  id: string;

  /**
   * グループ名
   */
  name: string;
}

model GroupsResponse {
  /**
   * グループ
   */
  groups: Group[];
}

model GroupResponse {
  /**
   * グループID
   */
  id: string;

  /**
   * グループ名
   */
  name: string;
}

model GroupMembers {
  members: {

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
  
    /**
     * フレンド状態のステータス
     */
    status: "me" | "applying" | "requesting" | "none"
  }[]
}

model GroupUpdateRequest {
  /**
   * グループ名
   */
  name: string;
}

model GroupCreateRequest {
  /**
   * グループ名
   */
  name: string;

  /**
   * UID
   */
  uids: string[];
}

model Members {
  /**
   * UID
   */
  uids: string[];
}
