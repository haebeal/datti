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
  | Group[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の取得
   */
  @route("{id}")
  @summary("グループ情報の取得")
  @get
  op getGroup(@path id: string):
  | GroupUsers
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループの作成
   */
  @summary("グループの作成")
  @post
  op postGroup(...GroupUpdateRequest):
  | GroupUsers
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループ情報の更新
   */
  @summary("グループ情報の更新")
  @put
  op putGroup(...GroupUpdateRequest):
  | GroupUsers
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

model GroupUsers {
  /**
   * グループID
   */
  id: string;

  /**
   * グループ名
   */
  name: string;

  /**
   * ユーザー情報
   */
  users: User[];
}

model GroupUpdateRequest {
  /**
   * グループID
   */
  id: string;

  /**
   * グループ名
   */
  name: string;

  /**
   * UID
   */
  uids: string[];
}
