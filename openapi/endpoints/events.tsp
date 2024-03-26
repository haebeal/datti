import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * イベント情報に関する操作
 */
@tag("Events")
@route("events")
namespace Events {
  /**
   * 登録されているイベント情報の取得
   */
  @route("{id}")
  @summary("イベントIDに紐づくイベント情報の取得")
  @get
  op getEvent(@path id: string):
  | Utils.Response.OKResponse<Event>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * ユーザーに紐づくイベント情報の取得
   */
  @route("{uid}")
  @summary("ユーザーIDに紐づくイベント情報の取得")
  @get
  op getEventsByUid(@path uid: string):
  | Event[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループIDに紐づくイベント情報の取得
   */
  @route("{gid}")
  @summary("グループIDに紐づくイベント情報の取得")
  @get
  op getEventsByGid(@path gid: string):
  | Event[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の登録
   */
  @summary("イベント情報の登録")
  @post
  op createEvent():
  | Event
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の更新
   */
  @route("{id}")
  @summary("イベント情報の更新")
  @put
  op updateEvent(@path id: string, @body event: EventUpdate):
  | Event
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の削除
   */
  @summary("イベント情報の削除")
  @delete
  op deleteEvent():
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Event {
  /**
   * イベントID
   */
  id: string;

  /**
   * イベント名
   */
  name: string;

  /**
   * イベント作成者のUID
   */
  @minLength(28)
  @maxLength(28)
  uid: string;

  /**
   * イベントの紐づいたグループID
   */
  groupId: string;
}

model EventUpdate {
  /**
   * イベント名
   */
  name: string;
}